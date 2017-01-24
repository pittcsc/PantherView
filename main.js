(function (window, undefined) {
    "use strict";

    // Oakland Coordinates: 40.4388 N, 79.9514 W (40.4388, -79.9514)
    var map = L.map('mapid').setView([40.4388, -79.9514], 15);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&amp;copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //Array of markers and a parallel array that holds their date of occurance
    var markers = new Array();
    var dates = new Array();

    //WPRDC data
    const WPRDC_BASE_URL = 'https://data.wprdc.org/api/action/datastore_search_sql?sql=';

    //Create a new Date object for the current date
    var currentDate = new Date();

    //The following are functions that display records created within 1, 7, and
    //30 days respectively
    function displayToday() {
        markers.forEach((marker, i) => {
            if (dates[i][0] == currentDate.getFullYear() && dates[i][1] == currentDate.getMonth() + 1 && dates[i][2] == currentDate.getDate()) {
                marker.addTo(map);
            } else {
                map.removeLayer(marker);
            }
        });
    }

    function displayPastWeek() {
        markers.forEach((marker, i) => {
            var tmpDate = new Date(dates[i][0], dates[i][1] - 1, dates[i][2]);
            var diff = Math.ceil(Math.abs(currentDate.getTime() - tmpDate.getTime()) / (86400000));
            if (diff <= 7) {
                marker.addTo(map);
            } else {
                map.removeLayer(marker);
            }
        });
    }

    function displayPastMonth() {
        markers.forEach((marker, i) => {
                marker.addTo(map);
        });
    }

    //Add listeners for each radio button
    document.getElementById("radioDay").addEventListener("click", displayToday);
    document.getElementById("radioWeek").addEventListener("click", displayPastWeek);
    document.getElementById("radioMonth").addEventListener("click", displayPastMonth);

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

                //Collect time of incident from the record
                var incidentYear = parseInt(record.INCIDENTTIME.substring(0,4));
                var incidentMonth = parseInt(record.INCIDENTTIME.substring(6,8));
                var incidentDay = parseInt(record.INCIDENTTIME.substring(8,10));

                const marker = L.marker([record.Y, record.X]);
                marker.addTo(map)
                    .bindPopup(`${record.OFFENSES}`);

                //Push the marker and date to their respective arrays
                markers.push(marker);
                dates.push([incidentYear, incidentMonth, incidentDay]);
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

                //Collect time of incident from the record
                var incidentYear = parseInt(record.CREATED_ON.substring(0,4));
                var incidentMonth = parseInt(record.CREATED_ON.substring(6,8));
                var incidentDay = parseInt(record.CREATED_ON.substring(8,10));

                const marker = L.marker([record.Y, record.X], {
                    title: record.REQUEST_TYPE || 'default title',
                    zIndexOffset: 100
                });
                marker.bindPopup(`<pre>${JSON.stringify(record, null, 2)}</pre>`);
                marker.addTo(map);

                //Push the marker and date to their respective arrays
                markers.push(marker);
                dates.push([incidentYear, incidentMonth, incidentDay]);

            });
        });

})(typeof window !== "undefined" ? window : {});
