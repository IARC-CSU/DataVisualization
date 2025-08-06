import json

# Charger le fichier JSON initial
with open('input.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

output = []

for entry in data:
    # Extraire les infos communes
    common = {
        "ISO": entry["ISO"],
        "label": entry["label"],
        "globocan_id": entry["globocan_id"]
    }
    # Pour chaque période, créer un nouvel objet
    for year_period in ["1966_1989", "1990_2023"]:
        new_entry = common.copy()
        new_entry["year"] = year_period
        new_entry["value"] = entry[year_period]
        output.append(new_entry)

# Sauvegarder le nouveau fichier JSON
with open('output.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)