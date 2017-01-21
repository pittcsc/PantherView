(function (window, undefined) {
    "use strict";

    // Oakland Coordinates: 40.4388 N, 79.9514 W (40.4388, -79.9514)
    var map = L.map('mapid').setView([40.4388, -79.9514], 13);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&amp;copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const sqlQuery = 'SELECT * FROM "40776043-ad00-40f5-9dc8-1fde865ff571" WHERE "NEIGHBORHOOD" LIKE \'%Oakland\' LIMIT 25';
    fetch(`https://data.wprdc.org/api/action/datastore_search_sql?sql=${sqlQuery}`).then((res) => {
      // TODO: check for 200 response
      console.log(res);
      return res.json();
    }).then((jsonRes) => {
      console.log(jsonRes);
      for (const record of jsonRes.result.records) {
        console.log(record);
        const marker = L.marker([record.Y, record.X], {
          title: record.REQUEST_TYPE || 'default title',
          zIndexOffset: 100
        });
        marker.bindPopup(`<pre>${JSON.stringify(record, null, 2)}</pre>`);
        marker.addTo(map);
      }
    });

})(typeof window !== "undefined" ? window : {});
