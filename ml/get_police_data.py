import urllib3
import json

http = urllib3.PoolManager()
site = http.request('GET', 'https://data.wprdc.org/api/action/datastore_search', fields={"resource_id": "044f2016-1dfd-4ab0-bc1e-065da05fca2e", "q": "oakland", "limit": "999999"})
data = json.loads(site.data.decode('utf-8'))

with open('data/data_police.json','w') as fileout:
	json.dump(data,fileout)
