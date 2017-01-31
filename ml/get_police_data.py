import urllib3
import json

http = urllib3.PoolManager()
site = http.request('GET', 'https://data.wprdc.org/api/action/datastore_search', fields={"resource_id": "1797ead8-8262-41cc-9099-cbc8a161924b", "q": "oakland", "limit": "999999"})
data = json.loads(site.data.decode('utf-8'))

with open('data/data_police.json','w') as fileout:
	json.dump(data,fileout)
