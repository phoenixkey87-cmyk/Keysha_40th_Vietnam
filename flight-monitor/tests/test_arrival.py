import unittest

from fm import arrival


def seg(frm, to, dep, arr, dur=None):
    return {"from": frm, "to": to, "dep_local": dep, "arr_local": arr, "duration_min": dur}


class ArrivalDayTests(unittest.TestCase):
    def test_verified_arrival_lands_on_nov_21_not_slipped(self):
        # Depart STL Nov 19, land DAD Nov 21 local -> verified, not slipped.
        segs = [
            seg("STL", "SEA", "2027-11-19 08:00", "2027-11-19 10:00", 120),
            seg("SEA", "DAD", "2027-11-19 11:30", "2027-11-21 13:40", 1600),
        ]
        out = arrival.arrival_day("2027-11-19", segs)
        self.assertEqual(out["date"], "2027-11-21")
        self.assertTrue(out["verified"])
        self.assertFalse(out["slips"])

    def test_no_segments_is_not_verified(self):
        out = arrival.arrival_day("2027-11-19", [])
        self.assertIsNone(out["date"])
        self.assertFalse(out["verified"])
        self.assertFalse(out["slips"])
        self.assertEqual(out["reason"], "schedule not published")

    def test_arrival_after_land_by_slips(self):
        segs = [seg("STL", "DAD", "2027-11-19 08:00", "2027-11-22 06:00", 2000)]
        out = arrival.arrival_day("2027-11-19", segs)
        self.assertEqual(out["date"], "2027-11-22")
        self.assertTrue(out["verified"])
        self.assertTrue(out["slips"])


class ConnectionFlagTests(unittest.TestCase):
    def test_short_connection_under_two_hours_is_flagged(self):
        # 90-minute layover at SEA (< 120) -> flagged on segment index 0.
        segs = [
            seg("STL", "SEA", "2027-11-19 08:00", "2027-11-19 10:00", 120),
            seg("SEA", "DAD", "2027-11-19 11:30", "2027-11-21 13:40", 1600),
        ]
        out = arrival.connection_flags(segs, min_connection_min=120)
        self.assertTrue(out["has_short"])
        self.assertEqual(out["short_connections"], [0])

    def test_adequate_connection_not_flagged(self):
        segs = [
            seg("STL", "SEA", "2027-11-19 08:00", "2027-11-19 10:00", 120),
            seg("SEA", "DAD", "2027-11-19 13:00", "2027-11-21 13:40", 1600),
        ]
        out = arrival.connection_flags(segs, min_connection_min=120)
        self.assertFalse(out["has_short"])
        self.assertEqual(out["short_connections"], [])

    def test_no_segments_has_no_short_connection(self):
        out = arrival.connection_flags([])
        self.assertFalse(out["has_short"])
        self.assertEqual(out["short_connections"], [])


if __name__ == "__main__":
    unittest.main()
