import urllib3
import json

http = urllib3.PoolManager()
site = http.request('GET', 'https://data.wprdc.org/api/action/datastore_search', fields={"resource_id": "40776043-ad00-40f5-9dc8-1fde865ff571", "q": "oakland"})

data = json.loads(site.data.decode('utf-8'))

with open('data/data_311.json','w') as fileout:
	json.dump(data,fileout)
