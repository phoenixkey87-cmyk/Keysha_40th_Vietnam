"""Snapshot envelope and atomic writers for latest.json / latest.js."""
import json
import os

SCHEMA_VERSION = 1
MODES = ("live", "no_api_key", "sample")


def build(mode, now_iso, source, thresholds, itineraries):
    if mode not in MODES:
        raise ValueError("bad mode %r" % mode)
    checked = [
        r["checked_at"]
        for it in itineraries.values()
        for r in it["rows"]
        if r.get("checked_at")
    ]
    snap = {
        "schema_version": SCHEMA_VERSION,
        "mode": mode,
        "generated_at": now_iso,
        "last_checked": max(checked) if checked else None,
        "source": source,
        "thresholds": thresholds,
        "itineraries": itineraries,
    }
    if mode == "sample":
        snap["sample_notice"] = "SAMPLE DATA from a test fixture. Not real prices."
    return snap


def _atomic_write(path, text):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    os.replace(tmp, path)


def write(snapshot, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    text = json.dumps(snapshot, indent=2, ensure_ascii=False)
    json_path = os.path.join(output_dir, "latest.json")
    js_path = os.path.join(output_dir, "latest.js")
    _atomic_write(json_path, text + "\n")
    # Script-tag fallback so the pages work when opened straight from disk (file://).
    _atomic_write(js_path, "window.FLIGHT_MONITOR_DATA = " + text.replace("</", "<\\/") + ";\n")
    return json_path, js_path
