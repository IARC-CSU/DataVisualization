import json

# Charger les fichiers
with open("fellows.json", "r") as f1, open("populations.json", "r") as f2:
    iso_data = json.load(f1)
    pop_data = json.load(f2)

# Construire le mapping ISO3 -> ID globocan
iso_to_globocan = {
    entry["country_iso3"]: entry["country"]
    for entry in pop_data
    if "country_iso3" in entry and "country" in entry
}

# Préparer les nouvelles données
merged_data = []
for entry in iso_data:
    iso_code = entry.get("CODE")
    merged_entry = {
        "ISO": iso_code,
        "label": entry.get("Pays"),
        "1966_1989": entry.get("1966_1989", 0),
        "1990_2023": entry.get("1990_2023", 0),
        "globocan_id": iso_to_globocan.get(iso_code, "undefined")
    }
    merged_data.append(merged_entry)

# Sauvegarder le résultat
with open("merged_iso_with_globocan.json", "w") as f_out:
    json.dump(merged_data, f_out, indent=2)
