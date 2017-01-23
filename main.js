(function (window, undefined) {
    "use strict";

    // Oakland Coordinates: 40.4388 N, 79.9514 W (40.4388, -79.9514)
    var map = L.map('mapid').setView([40.4388, -79.9514], 15);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&amp;copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //WPRDC data
    const WPRDC_BASE_URL = 'https://data.wprdc.org/api/action/datastore_search_sql?sql=';

    //City of Pittsburgh police data
    const CITY_POLICE_API = "1797ead8-8262-41cc-9099-cbc8a161924b";
    const CITY_POLICE_SQL = `SELECT * from "${CITY_POLICE_API}" WHERE "INCIDENTNEIGHBORHOOD" LIKE '%Oakland'`;
    fetch(`${WPRDC_BASE_URL}${CITY_POLICE_SQL}`)
        // TODO: ensure 200 response
        .then((response) => response.json())
        //TODO: should have some generic error handling for data
        .catch((err) => console.log(err))
        .then((data) =>{
            const records = data.result.records;
            records.forEach((record, i) => {
                console.log(i);
                L.marker([record.Y, record.X]).addTo(map)
                    .bindPopup(`${record.OFFENSES}`);
            });
        });

    //TODO: would be great to prune 311 data to the last 30 days, like the police data
    //City of Pittsburgh 311 data
    const CITY_311_API = "40776043-ad00-40f5-9dc8-1fde865ff571";
    const CITY_311_SQL = `SELECT * FROM "${CITY_311_API}" WHERE "NEIGHBORHOOD" LIKE '%Oakland' LIMIT 25`;
    fetch(`${WPRDC_BASE_URL}${CITY_311_SQL}`)
        // TODO: ensure 200 response
        .then((response) => response.json())
        //TODO: should have some generic error handling for data
        .catch((err) => console.log(err))
        .then((data) => {
            const records = data.result.records;
            records.forEach((record, i) => {
                const marker = L.marker([record.Y, record.X], {
                    title: record.REQUEST_TYPE || 'default title',
                    zIndexOffset: 100
                });
                marker.bindPopup(`<pre>${JSON.stringify(record, null, 2)}</pre>`);
                marker.addTo(map);
            });
        });

})(typeof window !== "undefined" ? window : {});
