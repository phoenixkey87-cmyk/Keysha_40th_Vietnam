"""Load and validate config.json with clear errors."""
import json
import re

IATA = re.compile(r"^[A-Z]{3}$")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
TIME = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
CABINS = {"economy", "business", "first"}
# Row kinds that carry a cabins_by_kind list.
CABIN_KINDS = ("primary", "alternate", "traveler", "shift")
# Every row kind the runner may emit (mixed_cabin is composed, not queried).
KINDS = ("primary", "alternate", "traveler", "shift", "mixed_cabin")
TRAVELERS_PLACEHOLDER = "[TRAVELER COUNT]"


class ConfigError(ValueError):
    pass


def _iata(value, where):
    if not isinstance(value, str) or not IATA.match(value):
        raise ConfigError("%s must be a 3-letter uppercase IATA code, got %r" % (where, value))


def _positive(value, where):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or value <= 0:
        raise ConfigError("%s must be a positive number, got %r" % (where, value))


def validate(cfg):
    if not isinstance(cfg, dict):
        raise ConfigError("config must be a JSON object")
    _iata(cfg.get("home_airport"), "home_airport")
    alts = cfg.get("alternate_origins", [])
    if not isinstance(alts, list):
        raise ConfigError("alternate_origins must be a list")
    for i, code in enumerate(alts):
        _iata(code, "alternate_origins[%d]" % i)
    th = cfg.get("thresholds")
    if not isinstance(th, dict):
        raise ConfigError("thresholds is required")
    for key in ("drop_pct", "shift_usd", "alt_origin_usd", "shift_days", "low_window_days"):
        _positive(th.get(key), "thresholds.%s" % key)
    cabins = cfg.get("cabins_by_kind")
    if not isinstance(cabins, dict):
        raise ConfigError("cabins_by_kind is required")
    for kind in CABIN_KINDS:
        lst = cabins.get(kind)
        if not isinstance(lst, list) or not set(lst) <= CABINS:
            raise ConfigError("cabins_by_kind.%s must be a list of economy/business/first" % kind)
    _positive(cfg.get("max_calls_per_run"), "max_calls_per_run")
    _positive(cfg.get("shift_check_interval_days"), "shift_check_interval_days")
    sched = cfg.get("schedule")
    if not isinstance(sched, dict) or not TIME.match(str(sched.get("time", ""))):
        raise ConfigError("schedule.time must be HH:mm (24-hour), got %r" % (sched or {}).get("time"))
    _validate_frequency(sched)
    _validate_mixed_cabin(cfg.get("mixed_cabin"))
    travelers = cfg.get("travelers", [])
    if not isinstance(travelers, list):
        raise ConfigError("travelers must be a list")
    for i, t in enumerate(travelers):
        if not isinstance(t, dict) or not str(t.get("name", "")).strip():
            raise ConfigError("travelers[%d] needs a non-empty name" % i)
        _iata(t.get("home_airport"), "travelers[%d].home_airport" % i)
    itins = cfg.get("itineraries")
    if not isinstance(itins, dict) or not itins:
        raise ConfigError("itineraries is required")
    for key, it in itins.items():
        if not isinstance(it, dict):
            raise ConfigError("itineraries.%s must be an object" % key)
        _iata(it.get("arrive"), "itineraries.%s.arrive" % key)
        _iata(it.get("depart"), "itineraries.%s.depart" % key)
        for d in ("outbound_date", "return_date"):
            if not DATE.match(str(it.get(d, ""))):
                raise ConfigError("itineraries.%s.%s must be YYYY-MM-DD" % (key, d))
        if it["return_date"] <= it["outbound_date"]:
            raise ConfigError("itineraries.%s.return_date must be after outbound_date" % key)
        _validate_travelers(it.get("travelers"), "itineraries.%s.travelers" % key)
        _validate_arrival_requirement(it.get("arrival_requirement"), key)
    return cfg


def _validate_travelers(value, where):
    """Accept a positive integer, null, or the [TRAVELER COUNT] placeholder.

    The placeholder means "unknown -> group total not verified". Reject zero,
    negatives, booleans, and any other non-integer value.
    """
    if value is None or value == TRAVELERS_PLACEHOLDER:
        return
    if isinstance(value, bool) or not isinstance(value, int) or value < 1:
        raise ConfigError(
            "%s must be a positive integer, null, or %r" % (where, TRAVELERS_PLACEHOLDER)
        )


def _validate_arrival_requirement(req, key):
    if req is None:
        return
    if not isinstance(req, dict):
        raise ConfigError("itineraries.%s.arrival_requirement must be an object" % key)
    land_by = req.get("land_by")
    if not DATE.match(str(land_by or "")):
        raise ConfigError("itineraries.%s.arrival_requirement.land_by must be YYYY-MM-DD" % key)
    cands = req.get("candidate_departures")
    if not isinstance(cands, list) or not cands:
        raise ConfigError(
            "itineraries.%s.arrival_requirement.candidate_departures must be a non-empty list" % key
        )
    for i, cand in enumerate(cands):
        if not DATE.match(str(cand or "")):
            raise ConfigError(
                "itineraries.%s.arrival_requirement.candidate_departures[%d] must be YYYY-MM-DD" % (key, i)
            )
        if cand >= land_by:
            raise ConfigError(
                "itineraries.%s.arrival_requirement.candidate_departures[%d] must be before land_by" % (key, i)
            )


def _validate_frequency(sched):
    freq = sched.get("frequency", "weekly")
    if freq == "weekly":
        return
    if freq == "every_n_days":
        n = sched.get("every_n_days")
        if isinstance(n, bool) or not isinstance(n, int) or n < 1:
            raise ConfigError("schedule.every_n_days must be a positive integer when frequency is every_n_days")
        return
    raise ConfigError("schedule.frequency must be 'weekly' or 'every_n_days', got %r" % freq)


def _validate_mixed_cabin(mc):
    if mc is None:
        return
    if not isinstance(mc, dict):
        raise ConfigError("mixed_cabin must be an object")
    if not isinstance(mc.get("enabled"), bool):
        raise ConfigError("mixed_cabin.enabled must be a boolean")
    comps = mc.get("components")
    if not isinstance(comps, dict):
        raise ConfigError("mixed_cabin.components must be an object")
    for part in ("longhaul", "other"):
        if comps.get(part) not in CABINS:
            raise ConfigError("mixed_cabin.components.%s must be one of economy/business/first" % part)
    if mc.get("pricing_unit") != "per_person":
        raise ConfigError("mixed_cabin.pricing_unit must be 'per_person'")


def load(path):
    try:
        with open(path, "r", encoding="utf-8") as fh:
            cfg = json.load(fh)
    except json.JSONDecodeError as exc:
        raise ConfigError("config is not valid JSON: %s" % exc)
    return validate(cfg)
