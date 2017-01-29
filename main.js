(function (window, undefined) {
    "use strict";

    // Oakland Coordinates: 40.4388 N, 79.9514 W (40.4388, -79.9514)
    // Cathy Coordinates: 40° 26′ 39″ N, 79° 57′ 11″ W (40.444167, -79.953056)
    const cathyLatLong = [40.444167, -79.953056];
    var map = L.map('mapid', {
        center: cathyLatLong,
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
    var nonPlacedRecords = new Array();

    //Create a new Date object for the current date
    var currentDate = new Date();

    //The following are functions that display records created within 1, 7, and
    //30 days respectively (assuming all fetched data has been pruned to the last
    //30 days already)
    function displayPastDay() {
        markers.forEach((marker, i) => {

            //Check if library or other non-dated pin
            if (!marker.incidentYear)
                return;

            var recordDate = new Date(marker.incidentYear,
                marker.incidentMonth - 1,
                marker.incidentDay);
            if (getDateDifference(currentDate, recordDate) <= 1) {
                marker.inDate = true;
                if (!marker.filtered) {
                    marker.pin.addTo(map);
                }
            } else {
                map.removeLayer(marker.pin);
                marker.inDate = false;
            }
        });
    }

    function displayPastWeek() {
        markers.forEach((marker, i) => {

            if (!marker.incidentYear)
                return;

            var recordDate = new Date(marker.incidentYear,
                marker.incidentMonth - 1,
                marker.incidentDay);
            if (getDateDifference(currentDate, recordDate) <= 7) {
                marker.inDate = true;
                if (!marker.filtered) {
                    marker.pin.addTo(map);
                }
            } else {
                map.removeLayer(marker.pin);
                marker.inDate = false;
            }
        });
    }

    function displayPastMonth() {
        markers.forEach((marker, i) => {
            marker.inDate = true;            
            if (!marker.filtered) {
                marker.pin.addTo(map);
            }
        });
    }

    function filterDisplay(e) {
        var elm = e.target;
        var type = /.+?(?=[A-Z])/.exec(elm.id)[0];

        if (elm.checked) {
            markers.forEach((marker) => {
                if (marker.type === type) {
                    if (marker.inDate) {
                        marker.pin.addTo(map);
                    }
                    marker.filtered = false;
                }
            });
        } else {
            markers.forEach((marker) => {
                if (marker.type === type) {
                    map.removeLayer(marker.pin);
                    marker.filtered = true;
                }
            });
        }
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

    //Listeners for date buttons
    document.getElementById("radioDay").addEventListener("click", displayPastDay);
    document.getElementById("radioWeek").addEventListener("click", displayPastWeek);
    document.getElementById("radioMonth").addEventListener("click", displayPastMonth);

    //Listener for sidebar toggle
    document.getElementById("sidebarToggle").addEventListener("click", toggleSidebar);

    // Display a notification to the user
    function displayNotification(messageText) {
      // TODO: Actually make the notification instead of logging
      console.log(messageText);
    }

    // WPRDC data
    const WPRDC_BASE_URL = 'https://data.wprdc.org/api/action/datastore_search_sql?sql=';

    // Marker Icons
    const iconTypes = {
        CITY_POLICE: L.divIcon({
            className: 'map-pin blue',
            html: '<i class="fa fa-balance-scale"></i>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -16]
        }),
        CITY_ARREST: L.divIcon({
            className: 'map-pin red',
            html: '<i class="fa fa-gavel"></i>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -16]
        }),
        CITY_311_ICON: L.divIcon({
            className: 'map-pin yellow',
            html: '<i class="fa fa-commenting"></i>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -16]
        }),
        LIBRARY_ICON: L.divIcon({
            className: 'map-pin black',
            html: '<i class="fa fa-book"></i>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -16]
        }),
        CODE_VIOLATION: L.divIcon({
            className: 'map-pin green',
            html: '<i class="fa fa-times-circle"></i>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -16]
        })
    };

    const WPRDC_DATA_SOURCES = {
        "Police": {
            id: '1797ead8-8262-41cc-9099-cbc8a161924b',
            primaryFiltering: 'WHERE "INCIDENTNEIGHBORHOOD" LIKE \'%Oakland\'',
            latLong: ['Y', 'X'],
            icon: iconTypes.CITY_POLICE,

            // TODO: Better title and popup messages?
            title: (record) => record['OFFENSES'],
            popup: (record) => record['OFFENSES'],

            processRecord: (record) => {
                // Collect time of incident from the record
                record.incidentYear = parseInt(record.INCIDENTTIME.substring(0,4));
                record.incidentMonth = parseInt(record.INCIDENTTIME.substring(5,8));
                record.incidentDay = parseInt(record.INCIDENTTIME.substring(8,10));
            }
        },

        "Arrest": {
            id: 'e03a89dd-134a-4ee8-a2bd-62c40aeebc6f',
            primaryFiltering: 'WHERE "INCIDENTNEIGHBORHOOD" LIKE \'%Oakland\'',
            latLong: ['Y', 'X'],
            icon: iconTypes.CITY_ARREST,

            // TODO: Better title and popup messages?
            title: (record) => record['OFFENSES'],
            popup: (record) => record['OFFENSES'],

            processRecord: (record) => {
                // Collect time of incident from the record
                record.incidentYear = parseInt(record.ARRESTTIME.substring(0,4));
                record.incidentMonth = parseInt(record.ARRESTTIME.substring(5,8));
                record.incidentDay = parseInt(record.ARRESTTIME.substring(8,10));
            }
        },

        "Code Violation": {
            id: '4e5374be-1a88-47f7-afee-6a79317019b4',
            primaryFiltering: 'WHERE "NEIGHBORHOOD" LIKE \'%Oakland\'',
            latLong: ['Y', 'X'],
            icon: iconTypes.CODE_VIOLATION,

            // TODO: Better title and popup messages?
            title: (record) => record['VIOLATION'],
            popup: (record) => `<strong>${record['VIOLATION']}:</strong>
            ${record['LOCATION']}<br>
            ${record['STREET_NUM']} ${record['STREET_NAME']}`,

            processRecord: (record) => {
                // Collect time of incident from the record
                record.incidentYear = parseInt(record.INSPECTION_DATE.substring(0,4));
                record.incidentMonth = parseInt(record.INSPECTION_DATE.substring(5,8));
                record.incidentDay = parseInt(record.INSPECTION_DATE.substring(8,10));
            }
        },

        // City of Pittsburgh 311 data
        // TODO: would be great to prune 311 data to the last 30 days, like the police data
        "311": {
            id: '40776043-ad00-40f5-9dc8-1fde865ff571',
            primaryFiltering: 'WHERE "NEIGHBORHOOD" LIKE \'%Oakland\' ORDER BY "CREATED_ON" DESC',
            latLong: ['Y', 'X'],
            icon: iconTypes.CITY_311_ICON,

            title: (record) => record['REQUEST_TYPE'],
            popup: (record) => `
              <strong>${record['DEPARTMENT']}</strong>
              <br> ${record['REQUEST_TYPE']}`,

            processRecord: (record) => {
                // Collect time of incident from the record
                record.incidentYear = parseInt(record.CREATED_ON.substring(0,4));
                record.incidentMonth = parseInt(record.CREATED_ON.substring(5,8));
                record.incidentDay = parseInt(record.CREATED_ON.substring(8,10));
            }
        },

        // Calls from the library db
        "Library": {
            id: "2ba0788a-2f35-43aa-a47c-89c75f55cf9d",
            primaryFiltering: 'WHERE "Name" LIKE \'%OAKLAND%\'',
            latLong: ['Lat', 'Lon'],
            icon: iconTypes.LIBRARY_ICON,

            title: (record) => record['Name'],
            popup: (record) => `
              <strong>${record.Name}</strong>
              <br> Address: ${record.Address}
              <br> Phone: ${record.Phone}
              <br> Monday: ${record.MoOpen.substring(0, 5)} - ${record.MoClose.substring(0, 5)}
              <br> Tuesday: ${record.TuOpen.substring(0, 5)} - ${record.TuClose.substring(0, 5)}
              <br> Wednesday: ${record.WeOpen.substring(0, 5)} - ${record.WeClose.substring(0, 5)}
              <br> Thursday: ${record.ThOpen.substring(0, 5)} - ${record.ThClose.substring(0, 5)}
              <br> Friday: ${record.FrOpen.substring(0, 5)} - ${record.FrClose.substring(0, 5)}
              <br> Saturday: ${record.SaOpen.substring(0, 5)} - ${record.SaClose.substring(0, 5)}
              <br> Sunday: ${record.SuOpen.substring(0, 5)} - ${record.SuClose.substring(0, 5)}
              `,

        }
    };

    const WPRDC_QUERY_PREFIX = 'SELECT * FROM "';
    const WPRDC_QUERY_SUFFIX = '" ';

    // Fetch data from West Pennsylvania Regional Data Center using the SQL API
    // TODO: Prune to last 30 days in SQL
    function fetchWPRDCData(dataSourceName, options={}) {
        const dataSource = WPRDC_DATA_SOURCES[dataSourceName];
        let query = WPRDC_QUERY_PREFIX + dataSource.id + WPRDC_QUERY_SUFFIX + dataSource.primaryFiltering;

        if (options.limit) {
          query += ' LIMIT ' + options.limit;
        }

        return fetch(WPRDC_BASE_URL + query)
            // TODO: ensure 200 response
            .then((response) => response.json())
            // TODO: should have some generic error handling for data
            .catch((err) => displayNotification(err))
            .then((data) => {
                const records = data.result.records;

                var filterContainer = document.createElement("div");
                filterContainer.className = "typeBtn";

                var filter = document.createElement("input");
                filter.id = dataSourceName.toLowerCase() + "Check";
                filter.type = "checkbox";
                filter.checked = true;

                var filterLabel = document.createElement("label");
                filterLabel.htmlFor = dataSourceName.toLowerCase() + "Check";
                filterLabel.innerHTML = dataSource.icon.options.html + " - " +
                    dataSourceName;

                filter.addEventListener("click", filterDisplay);

                document.getElementById("typeSelection").appendChild(filterContainer);
                filterContainer.appendChild(filter);
                filterContainer.appendChild(filterLabel);

                records.forEach((record, i) => {
                    if (dataSource.processRecord) {
                        dataSource.processRecord(record, i);
                    }

                    const latLong = dataSource.latLong.map((fieldName) => record[fieldName]);
                    const latLongNoNulls = latLong.some((field) => !!field);

                    //Prune to last 30 days
                    if (record.incidentYear) {
                      if (getDateDifference(currentDate, new Date(record.incidentYear,
                          record.incidentMonth - 1,
                          record.incidentDay)) > 30) {
                            return;
                      }
                    }

                    record.inDate = true;
                    record.type = dataSourceName.toLowerCase();

                    if (latLongNoNulls) {
                        const title = dataSource.title(record);
                        record.pin = L.marker(latLong, {
                            title: title,
                            icon: dataSource.icon
                        });

                        record.pin.bindPopup(dataSource.popup(record));

                        record.pin.addTo(map);
                        markers.push(record);
                    } else {
                        nonPlacedRecords.push(record);
                    }
                })
            });
    }

    Promise.all([
        fetchWPRDCData('Police', { limit: 250 }),
        fetchWPRDCData('311', { limit: 250 }),
		    fetchWPRDCData('Arrest', { limit: 250 }),
        fetchWPRDCData('Code Violation', { limit: 250 }),
        fetchWPRDCData('Library')
    ]).then(() => {
        console.log('All data loaded');
    }).catch((err) => {
        console.log('final error catch data', err);
    });

    //Helper function that returns difference between two dates in days
    function getDateDifference(dateA, dateB) {
        return Math.floor(Math.abs(dateA.getTime() - dateB.getTime()) / 86400000);
    }

})(typeof window !== "undefined" ? window : {});
