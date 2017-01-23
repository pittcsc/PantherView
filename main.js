(function (window, undefined) {
    "use strict";

    // Oakland Coordinates: 40.4388 N, 79.9514 W (40.4388, -79.9514)
    var map = L.map('mapid').setView([40.4388, -79.9514], 13);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&amp;copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //City of Pittsburgh police data
    const CITY_POLICE_SQL = "https://data.wprdc.org/api/action/datastore_search_sql?sql=SELECT * from \"1797ead8-8262-41cc-9099-cbc8a161924b\" WHERE \"INCIDENTNEIGHBORHOOD\" LIKE '%Oakland'";
    fetch(CITY_POLICE_SQL).then((response) => response.json()).catch((err) => console.log(err)).then((data) =>{
        const records = data.result.records;
        records.forEach((record, i) => {
            L.marker([record.Y, record.X]).addTo(map)
                .bindPopup(`${record.OFFENSES}`);
        });
    });

})(typeof window !== "undefined" ? window : {});
