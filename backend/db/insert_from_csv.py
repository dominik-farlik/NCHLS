import csv
from pymongo import MongoClient, UpdateOne

MONGO_URI = "mongodb://admin:secret@localhost:27017/?authSource=admin"
DB_NAME = "nchls"          # uprav
COLLECTION = "substances" # uprav
CSV_PATH = "input.csv"

def clean(v: str) -> str:
    return (v or "").strip()

client = MongoClient(MONGO_URI)
col = client[DB_NAME][COLLECTION]

ops = []
seen = set()

with open(CSV_PATH, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f, delimiter="\t")
    for row in reader:
        name = clean(row.get("name"))
        code = clean(row.get("code"))
        manufacturer = clean(row.get("manufacturer"))

        if not name:
            continue

        key = name.lower()
        if key in seen:
            continue
        seen.add(key)

        set_fields = {}
        if code:
            set_fields["code"] = code
        if manufacturer:
            set_fields["manufacturer"] = manufacturer

        ops.append(
            UpdateOne(
                {"name": name},
                {
                    "$set": set_fields,
                    "$setOnInsert": {
                        "name": name,
                        "substance_mixture": "",
                        "physical_form": "",
                        "iplp": False,
                        "disinfection": False,
                        "properties": [],
                        "max_tons": 0,
                        "danger_category": "",
                        "water_toxicity_EC50": "",
                        "safety_sheet": "",
                        "unit": "",
                        "safety_sheet_rev_date": "",
                    },
                },
                upsert=True,
            )
        )

if not ops:
    print("Nic k importu.")
else:
    res = col.bulk_write(ops, ordered=False)
    print("Import hotový:")
    print(f"  matched:  {res.matched_count}")
    print(f"  modified: {res.modified_count}")
    print(f"  inserted: {len(res.upserted_ids)}")
