import csv
import json


def csv2json():
    # Define file paths
    csv_file_path = 'qqq.csv'
    json_file_path = 'qqq.json'

    # Read CSV and write to JSON
    with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
        # DictReader automatically uses the first row as keys
        csv_reader = csv.DictReader(csv_file)
        data = list(csv_reader)

        cleaned_data = []

        spliced_data = data[0:200]
        for d in reversed(spliced_data):
            t = d["time"].split('/')
            d["time"] = {"month": int(t[0]), "day": int(t[1]), "year": int(t[2])}
            d["close"] = float(d["close"])
            d["volume"] = int(d["volume"])
            d["open"] = float(d["open"])
            d["high"] = float(d["high"])
            d["low"] = float(d["low"])
            cleaned_data.append(d)

    with open(json_file_path, mode='w', encoding='utf-8') as json_file:
        # indent=4 makes the JSON file pretty and human-readable
        json.dump(cleaned_data, json_file, indent=4)


csv2json()


