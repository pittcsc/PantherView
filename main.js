(function (window, undefined) {
    "use strict";

    // Oakland Coordinates: 40.4388 N, 79.9514 W (40.4388, -79.9514)
    // Cathy Coordinates: 40° 26′ 39″ N, 79° 57′ 11″ W (40.444167, -79.953056)
    var map = L.map('mapid', {
        center: [40.444167, -79.953056],
        zoom: 15,
        minZoom: 12,
        maxBounds: L.latLngBounds([40.65, -80.25], [40.25, -79.70]),
        maxBoundsViscosity: 0.90
    });

    var sidebar = document.getElementById("sidebar");
    var sidebarToggle = document.getElementById("sidebarToggle");

    //Start with sidebar closed if mobile
    if (screen.width <= 800) {
        sidebarToggle.open = 0;
        sidebar.className = "hidden";
        sidebarToggle.className = "fa fa-chevron-right fa-3x";
    } else {
        sidebarToggle.open = 1;
        sidebar.className = "shown";
        sidebarToggle.className = "fa fa-chevron-left fa-3x";
    }

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //Array of markers
    var markers = new Array();

    //WPRDC data
    const WPRDC_BASE_URL = 'https://data.wprdc.org/api/action/datastore_search_sql?sql=';

    //Create a new Date object for the current date
    var currentDate = new Date();

    //The following are functions that display records created within 1, 7, and
    //30 days respectively (assuming all fetched data has been pruned to the last
    //30 days already)
    function displayPastDay() {
        markers.forEach((marker, i) => {
            if (marker.incidentYear == currentDate.getFullYear() &&
                marker.incidentMonth == currentDate.getMonth() + 1 &&
                marker.incidentDay == currentDate.getDate()) {
                marker.pin.addTo(map);
            } else {
                map.removeLayer(marker.pin);
            }
        });
    }

    function displayPastWeek() {
        markers.forEach((marker, i) => {
            var recordDate = new Date(marker.incidentYear,
                marker.incidentMonth - 1,
                marker.incidentDay);
            if (getDateDifference(currentDate, recordDate) <= 7) {
                marker.pin.addTo(map);
            } else {
                map.removeLayer(marker.pin);
            }
        });
    }

    function displayPastMonth() {
        markers.forEach((marker, i) => {
            marker.pin.addTo(map);
        });
    }

    //Displays and hides the sidebar
    function toggleSidebar() {
        if (sidebarToggle.open == 1) {
            sidebarToggle.open = 0;
            sidebar.className = "hidden";
            sidebarToggle.className = "fa fa-chevron-right fa-3x";
        } else {
            sidebarToggle.open = 1;
            sidebar.className = "shown";
            sidebarToggle.className = "fa fa-chevron-left fa-3x";
        }
    }

    //Add listeners for radio buttons
    document.getElementById("radioDay").addEventListener("click", displayPastDay);
    document.getElementById("radioWeek").addEventListener("click", displayPastWeek);
    document.getElementById("radioMonth").addEventListener("click", displayPastMonth);

    //Listener for sidebar toggle
    document.getElementById("sidebarToggle").addEventListener("click", toggleSidebar);

    //City of Pittsburgh police data
    const CITY_POLICE_API = "1797ead8-8262-41cc-9099-cbc8a161924b";
    const CITY_POLICE_SQL = `SELECT * from "${CITY_POLICE_API}" WHERE "INCIDENTNEIGHBORHOOD" LIKE '%Oakland'`;
    const CITY_POLICE_ICON = L.icon({
        iconUrl: 'assets/map-pins/pin-police.png',
        iconRetinaUrl: 'assets/map-pins/pin-police@2x.png',
        iconSize: [32, 32],
        iconAnchor: [15, 31],
        shadowUrl: 'assets/map-pins/pin-shadow.png',
        shadowRetinaUrl: 'assets/map-pins/pin-shadow@2x.png',
        shadowSize: [32, 32],
        shadowAnchor: [15, 31]
    }); // TODO: make a global dictionary for these?
    fetch(`${WPRDC_BASE_URL}${CITY_POLICE_SQL}`)
        // TODO: ensure 200 response
        .then((response) => response.json())
        //TODO: should have some generic error handling for data
        .catch((err) => console.log(err))
        .then((data) => {
            
            const records = data.result.records;
            records.forEach((record, i) => {
                //Collect time of incident from the record
                var popup = JSONtoTable(record);
                record.incidentYear = parseInt(record.INCIDENTTIME.substring(0, 4));
                record.incidentMonth = parseInt(record.INCIDENTTIME.substring(5, 8));
                record.incidentDay = parseInt(record.INCIDENTTIME.substring(8, 10));

                record.pin = L.marker([record.Y, record.X], { icon: CITY_POLICE_ICON });
                record.pin.addTo(map)
                    .bindPopup(`${popup}`);

                //Push the marker and date to their respective arrays
                markers.push(record);
            });
        });

    //TODO: would be great to prune 311 data to the last 30 days, like the police data
    //City of Pittsburgh 311 data
    const CITY_311_API = "40776043-ad00-40f5-9dc8-1fde865ff571";
    const CITY_311_SQL = `SELECT * FROM "${CITY_311_API}" WHERE "NEIGHBORHOOD" LIKE '%Oakland' ORDER BY "CREATED_ON" DESC LIMIT 25`;
    const CITY_311_ICON = L.icon({
        iconUrl: 'assets/map-pins/pin-311.png',
        iconRetinaUrl: 'assets/map-pins/pin-311@2x.png',
        iconSize: [32, 32],
        iconAnchor: [15, 31],
        shadowUrl: 'assets/map-pins/pin-shadow.png',
        shadowRetinaUrl: 'assets/map-pins/pin-shadow@2x.png',
        shadowSize: [32, 32],
        shadowAnchor: [15, 31]
    });
    fetch(`${WPRDC_BASE_URL}${CITY_311_SQL}`)
        // TODO: ensure 200 response
        .then((response) => response.json())
        //TODO: should have some generic error handling for data
        .catch((err) => console.log(err))
        .then((data) => {
            const records = data.result.records;
            records.forEach((record, i) => {
                var popup = JSONtoTable(record);
                //Collect time of incident from the record
                record.incidentYear = parseInt(record.CREATED_ON.substring(0, 4));
                record.incidentMonth = parseInt(record.CREATED_ON.substring(5, 8));
                record.incidentDay = parseInt(record.CREATED_ON.substring(8, 10));

                record.pin = L.marker([record.Y, record.X], {
                    icon: CITY_311_ICON,
                    title: record.REQUEST_TYPE || 'default title',
                    zIndexOffset: 100
                });
                record.pin.bindPopup(popup);
                record.pin.addTo(map);

                //Push the marker and date to their respective arrays
                markers.push(record);
            });
        });

    //Helper function that returns difference between two dates in days
    function getDateDifference(dateA, dateB) {
        return Math.floor(Math.abs(dateA.getTime() - dateB.getTime()) / 86400000);
    }
    //Calls from the library db 
    const LibraryAPI = "2ba0788a-2f35-43aa-a47c-89c75f55cf9d";
    const Library_SQL = `SELECT * FROM "${LibraryAPI}" WHERE "Name" LIKE '%OAKLAND%'`;
    const Library_ICON = L.icon({
        iconUrl: 'assets/map-pins/pin-library.png',
        iconRetinaUrl: 'assets/map-pins/pin-library@2x.png',
        iconSize: [32, 32],
        iconAnchor: [15, 31]
    });
    fetch(`${WPRDC_BASE_URL}${Library_SQL}`)
        .then((response) => response.json())
        .catch((err) => console.log(err))
        .then((data) => {
            const libRecords = data.result.records;
            libRecords.forEach((record, i) => {
                //Library Icon from their twitter
                record.pin = L.marker([record.Lat, record.Lon], {
                    icon: Library_ICON,
                    title: record.Name,
                    zIndexOffset: 100
                });
                // Probably a better way to format the library popup but its cleaner for now
                record.pin.bindPopup(JSONtoTable(record));
                record.pin.addTo(map);
                markers.push(record);
            });
        });
        function JSONtoTable(result){
            var table = "<table>"
            for(var key in result){
                if(key == "_full_text" || key == "pin") continue;
                table += `<tr><td> ${key}</td><td>${result[key]}</td></tr>`
            }
            table+= "</table>"
            return table;
        }


})(typeof window !== "undefined" ? window : {});
