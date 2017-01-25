import requests
import csv
import json
site = requests.get('https://data.wprdc.org/api/action/datastore_search_sql?sql=SELECT * FROM "40776043-ad00-40f5-9dc8-1fde865ff571" WHERE "NEIGHBORHOOD" LIKE \'%Oakland\' LIMIT 25')

data = site.json()
data = flatten(data)
with open('data.txt', 'w') as outfile:
  json.dump(data,outfile)
