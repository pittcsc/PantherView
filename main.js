(function (window, undefined) {
    "use strict";

    // declare variables awaiting values
    let WPRDC_BASE_URL,
        WPRDC_META_URL,
        WPRDC_DATA_SOURCES,
        WPRDC_QUERY_PREFIX,
        WPRDC_QUERY_SUFFIX,
        PITT_LAUNDRY,
        PITT_LABS;

    // await those values
    window.addEventListener("dataready", function handler(event) {
        // assign the received values
        ({
            WPRDC_BASE_URL,
            WPRDC_META_URL,
            WPRDC_DATA_SOURCES,
            WPRDC_QUERY_PREFIX,
            WPRDC_QUERY_SUFFIX,
            PITT_LAUNDRY,
            PITT_LABS
        } = event.detail);

        // wait for these values before fetching dependant data
        fetchAllData();

        // need only assign values once
        window.removeEventListener("dataready", handler);
    });

    // Oakland Coordinates: 40.4388 N, 79.9514 W (40.4388, -79.9514)
    // Cathy Coordinates: 40° 26′ 39″ N, 79° 57′ 11″ W (40.444167, -79.953056)
    const cathyLatLong = [40.444167, -79.953056];
    const map = L.map("mapid", {
        center: cathyLatLong,
        zoom: 15,
        minZoom: 12,
        maxBounds: L.latLngBounds([40.65, -80.25], [40.25, -79.70]),
        maxBoundsViscosity: 0.90
    });

    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const parentList = document.getElementById('badMarkers');

    //Start with sidebar closed if mobile
    if (screen.width <= 800) {
        sidebarToggle.open = 0;
        sidebar.className = "mapMode hidden";
        sidebarToggle.className = "fa fa-chevron-right fa-3x";
    } else {
        sidebarToggle.open = 1;
        sidebar.className = "mapMode shown";
        sidebarToggle.className = "fa fa-chevron-left fa-3x";
    }

    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors"
    }).addTo(map);

    // Array of markers
    const markers = [];

    // Create a new Date object for the current date
    const currentDate = new Date();

    // The following are functions that display records created within 1, 7, and
    // 30 days respectively (assuming all fetched data has been pruned to the last
    // 30 days already)
    function displayPastDay() {
        markers.forEach((marker, i) => {
            //Check if library or other non-dated pin
            if (!marker.incidentYear || !marker.isMapped) {
                return;
            }

            const recordDate = new Date(marker.incidentYear,
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

        generateDataTable();
    }

    function displayPastWeek() {
        markers.forEach((marker, i) => {
            if (!marker.incidentYear || !marker.isMapped) {
                return;
            }

            const recordDate = new Date(marker.incidentYear,
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

        generateDataTable();
    }

    function displayPastMonth() {
        markers.forEach((marker, i) => {
            if (!marker.isMapped) {
                return;
            }

            marker.inDate = true;

            if (!marker.filtered) {
                marker.pin.addTo(map);
            }
        });

        generateDataTable();
    }

    function filterDisplay(e) {
        const elm = e.target;
        const type = /.+?(?=[A-Z])/.exec(elm.id)[0];

        if (elm.checked) {
            markers.forEach((marker) => {
<<<<<<< HEAD
                if (marker.type.toLowerCase() === type && marker.isMapped) {
=======
                if (marker.type === type) {
>>>>>>> Precompute table data to allow for filtering
                    if (marker.inDate) {
                        if (marker.isMapped) {
                            marker.pin.addTo(map);
                        } else {
                            parentList.appendChild(marker.tableEl);
                        }
                    }
                    marker.filtered = false;
                }
            });
        } else {
            markers.forEach((marker) => {
<<<<<<< HEAD
                if (marker.type.toLowerCase() === type && marker.isMapped) {
                    map.removeLayer(marker.pin);
=======
                if (marker.type === type) {
                    if (marker.isMapped) {
                        map.removeLayer(marker.pin);
                    } else if (marker.tableEl.parentElement) {
                        marker.tableEl.parentElement.removeChild(marker.tableEl);
                    }
>>>>>>> Precompute table data to allow for filtering
                    marker.filtered = true;
                }
            });
        }

        generateDataTable();
    }

    //Displays and hides the sidebar
    function toggleSidebar() {
        if (sidebarToggle.open == 1) {
            sidebarToggle.open = 0;
            sidebar.className = "mapMode hidden";
            sidebarToggle.className = "fa fa-chevron-right fa-3x";
        } else {
            sidebarToggle.open = 1;
            sidebar.className = "mapMode shown";
            sidebarToggle.className = "fa fa-chevron-left fa-3x";
        }
    }

    function generateDataTable() {
        var table = document.getElementById("dataTable");

        // Reset table and re-add table header
        table.innerHTML =
        `<colgroup>
           <col style="width: 10%; text-align: center;">
           <col style="width: 70%;">
           <col style="width: 10%; text-align: center;">
           <col style="width: 10%; text-align: center;">
        </colgroup>
        <tr>
          <th>Dataset</th>
          <th>Text</th>
          <th>Date</th>
          <th>Location</th>
        </tr>
        `;

        markers.forEach((marker) => {
            // Only entering WPRDC data into the table for now
            var dataSource = WPRDC_DATA_SOURCES[marker.type];
            if (!dataSource) return;

            // Add row in data table for this record
            if (dataSource.table && marker.isMapped && !marker.filtered && marker.inDate) {
                var tr = document.createElement("tr");
                tr.innerHTML = dataSource.table(marker);
                table.appendChild(tr);
            }
        });
    }

    function displayMapMode() {
        sidebarToggle.className = "fa fa-chevron-left fa-3x";
        sidebar.className = "mapMode";
        document.getElementById("dataArea").className = "hidden";
    }

    function displayDataMode() {
        sidebarToggle.className = "hidden";
        sidebar.className = "dataMode";
        document.getElementById("dataArea").className = "shown";
    }

    //Listeners for map/data mode toggle
    document.getElementById("radioMap").addEventListener("click", displayMapMode);
    document.getElementById("radioData").addEventListener("click", displayDataMode);

    //Listeners for date buttons
    document.getElementById("radioDay").addEventListener("click", displayPastDay);
    document.getElementById("radioWeek").addEventListener("click", displayPastWeek);
    document.getElementById("radioMonth").addEventListener("click", displayPastMonth);

    //Listener for sidebar toggle
    document.getElementById("sidebarToggle").addEventListener("click", toggleSidebar);

    // Display a notification to the user.
    // Style is optional, can be "error", "warning", or "success"
    function displayNotification(messageText, style, customHTML) {
        const notificationArea = document.getElementById("notifications");
        const box = document.createElement("div");
        box.className = "notification";

        if (style) {
            box.classList.add(style);
        }

        const closeButton = document.createElement("button");
        closeButton.className = "close";
        closeButton.innerHTML = "x";
        closeButton.addEventListener("click", function() {
            box.style.display = "none";
        });

        box.appendChild(closeButton);

        const textarea = document.createTextNode(messageText);
        box.appendChild(textarea);

        if (customHTML) {
            const customDiv = document.createElement("div");
            customHTML(customDiv);
            box.appendChild(customDiv);
        }

        const topNotification = notificationArea.firstChild;
        notificationArea.insertBefore(box, topNotification);
    }

    // Fetch data from West Pennsylvania Regional Data Center using the SQL API
    function fetchWPRDCData(dataSourceName, options={}) {
        const dataSource = WPRDC_DATA_SOURCES[dataSourceName];
        let query = WPRDC_QUERY_PREFIX + dataSource.id + WPRDC_QUERY_SUFFIX + dataSource.primaryFiltering;

        if (options.limit) {
          query += " LIMIT " + options.limit;
        }

        return fetch(WPRDC_BASE_URL + query)
            .then((response) => {
                // Inspired by https://github.com/github/fetch#handling-http-error-statuses
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                  throw new Error(`Could not retrieve the ${dataSourceName} dataset; bad response.`);
                }
            })
            .then((data) => {
                if (!data || !data.result || !data.result.records) {
                    displayNotification(`${dataSourceName} records not processed.`, "error", (retryDiv) => {
                        const retryButton = document.createElement("button");
                        retryButton.innerHTML = "<p><i class=\"fa fa-refresh\" aria-hidden=\"true\"></i> Retry</p>";
                        retryButton.type = "button";
                        retryButton.className = "retry";
                        retryButton.addEventListener("click", function() {
                            retryDiv.parentNode.style.display = "none";
                            fetchWPRDCData(dataSourceName);
                        });
                        retryDiv.appendChild(retryButton);
                    });
                    return;
                }

                const records = data.result.records;

                const filterContainer = document.createElement("div");
                filterContainer.className = "typeBtn";

                const filter = document.createElement("input");
                filter.id = dataSourceName.toLowerCase() + "Check";
                filter.type = "checkbox";
                filter.checked = true;

                const filterLabel = document.createElement("label");
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

                    //Prune to last 30 days
                    if (record.incidentYear) {
                        if (getDateDifference(currentDate, new Date(record.incidentYear,
                            record.incidentMonth - 1,
                            record.incidentDay)) > 30) {
                                return;
                        }
                    }
                    record.inDate = true;
                    record.type = dataSourceName;

                    const latLong = dataSource.latLong.map((fieldName) => record[fieldName]);
                    const latLongNoNulls = latLong.some((field) => !!field);

                    if (latLongNoNulls) {
                        const title = dataSource.title(record);
                        record.pin = L.marker(latLong, {
                            title: title,
                            icon: dataSource.icon
                        });

                        record.pin.bindPopup(dataSource.popup(record));
                        record.pin.addTo(map);

                        record.isMapped = true;
                    } else {
                        // Give non-mapped markers a list element for displaying in a separate list
                        // of non-mapped markers
                        const li = document.createElement('li');
                        const headerLine = document.createElement('p');

                        const options = dataSource.icon.options;
                        const icon = document.createElement('div');
                        icon.className = options.className;
                        icon.innerHTML = options.html;
                        icon.style.width = options.iconSize[0];
                        icon.style.height = options.iconSize[1];

                        if (dataSource.table) {
                            headerLine.innerHTML = dataSource.table(record);
                        } else {
                            headerLine.innerHTML = dataSource.title(record);
                        }

                        li.appendChild(icon);
                        li.appendChild(headerLine);

                        parentList.appendChild(li);

                        record.tableEl = li;
                        record.isMapped = false;
                    }
                    markers.push(record);
                });
            })
            .catch((err) => displayNotification(`Error: Public dataset ${dataSourceName} could not be retrieved`, "error", (retryDiv) => {
                const retryButton = document.createElement("button");
                retryButton.innerHTML = "<p><i class=\"fa fa-refresh\" aria-hidden=\"true\"></i> Retry</p>";
                retryButton.type = "button";
                retryButton.className = "retry";
                retryButton.addEventListener("click", function() {
                    retryDiv.parentNode.style.display = "none";
                    fetchWPRDCData(dataSourceName);
                });
                retryDiv.appendChild(retryButton);
            }))
            .then(() => {
                return fetch(WPRDC_META_URL + dataSource.id)
                .then((response) => {
                    //check response for data and data for date
                    if (response.status >= 200 && response.status < 300) {
                        return response.json();
                    }
                })
                .then((metadata) => {
                    // Parse json for last modified field
                    var parsedDate = Date.parse(metadata.result.last_modified);

                    // Display a notification if the dataset has been updated within .updateTime
                    var diff = Date.now() - parsedDate;
                    if (diff <= dataSource.updateTime) {
                        displayNotification("The " + dataSourceName + " dataset has been recently updated.");
                    }
                });
           });
    }

    //Fetch data from Pitt using Ritwik Gupta's PittAPI and associated wrapper
    //May not need the "options" parameter, as I can't see any data request from Pitt being overwhelmingly large
    function fetchPittData(dataSection, dataSourceName, filterCreated, options = {}){
        var URL = "http://23.22.137.193:5000/";
        if (dataSection == "Labs"){
            URL = URL + "lab_status/" + dataSourceName.toUpperCase();
        }
        else{ //For now, the only other one is laundry
            URL = URL + "laundry/simple/" + dataSourceName.toUpperCase();
        }

        //Begin data fetch
        return fetch(URL)
        .then((response) => {
            // Inspired by https://github.com/github/fetch#handling-http-error-statuses
            if (response.status >= 200 && response.status < 300) {
                return response;
            } else {
                throw new Error(`Could not retrieve the ${dataSourceName} dataset; bad response.`);
            }
        })
        .then((response) => response.json())
        .then((data) => {
            if (!data) {
                displayNotification(`${dataSourceName} records not processed.`, "error", (retryDiv) => {
                    const retryButton = document.createElement("button");
                    retryButton.innerHTML = "<p><i class=\"fa fa-refresh\" aria-hidden=\"true\"></i> Retry</p>";
                    retryButton.type = "button";
                    retryButton.className = "retry";

                    retryButton.addEventListener("click", function() {
                    retryDiv.parentNode.style.display = "none";
                    fetchPittData(dataSection, dataSourceName, filterCreated, options);
                    });

                    retryDiv.appendChild(retryButton);
                });
                return;
            }

            var dataSource = null;
            if (dataSection == "Labs"){
                dataSource = PITT_LABS[dataSourceName];
            }
            else{ //For now, the only other one is laundry
                dataSource = PITT_LAUNDRY[dataSourceName];
            }

            //If the checkbox has yet to be built for filtering the pins (only executes for first lab fetch)
            if (!filterCreated){
                var filterContainer = document.createElement("div");
                filterContainer.className = "typeBtn";

                var filter = document.createElement("input");
                filter.id = dataSection.toLowerCase() + "Check";
                filter.type = "checkbox";
                filter.checked = true;

                var filterLabel = document.createElement("label");
                filterLabel.htmlFor = dataSourceName.toLowerCase() + "Check";
                filterLabel.innerHTML = dataSource.icon.options.html + " - " + dataSection;

                filter.addEventListener("click", filterDisplay);

                document.getElementById("typeSelection").appendChild(filterContainer);
                filterContainer.appendChild(filter);
                filterContainer.appendChild(filterLabel);
            }

            if (dataSection == "Labs"){
                //LABS PINS
                const thePin = L.marker(PITT_LABS[dataSourceName].latLong, {
                    title: dataSourceName,
                    icon: dataSource.icon
                });

                //Create popup
                var pup = L.popup();
                    pup.setContent("<p> " + dataSourceName + " Lab<br>Status: " + data.status
                                 + "<br> Macs available: " + data.mac
                                + "<br> Windows available: " + data.windows
                                + "<br> Linux available: " + data.linux + "</p>");

                //labRecord.popup = pup;
                //Bind popup to pin
                thePin.bindPopup(pup);
                //Add pin to map
                thePin.addTo(map);
                pup.isMapped = true;
                //Push pin (haha, get it?)
                markers.push({ //Push the following object onto the markers array
                    numWindows: data.windows,
                    numMac: data.mac,
                    numLinux: data.linux,
                    labStatus: data.status,
                    pin: thePin,
                    isMapped: true,
                    inDate: true, //Date is not important, but necessary for filtering for now
                    type: "labs"
                });
            }
            else{ //For now, the only other one is laundry
                //LAUNDRY PINS
                const thePin = L.marker(PITT_LAUNDRY[dataSourceName].latLong, {
                    title: dataSourceName,
                    icon: dataSource.icon
                });

                //Create popup
                var pup = L.popup();
                    pup.setContent("<p> " + PITT_LAUNDRY[dataSourceName].building + " Laundry: "
                                + "<br> Total washers: " + data.total_washers
                                + "<br> Total dryers: " + data.total_dryers
                                + "<br> Washers available: " + data.free_washers
                                + "<br> Dryers available: " + data.free_dryers + "</p>");

                //labRecord.popup = pup;
                //Bind popup to pin
                thePin.bindPopup(pup);
                //Add pin to map
                thePin.addTo(map);
                pup.isMapped = true;
                //Push pin (haha, get it?)
                markers.push({ //Push the following object onto the markers array
                    total_washers: data.total_washers,
                    total_dryers: data.total_dryers,
                    free_washers: data.free_washers,
                    free_dryers: data.free_dryers,
                    pin: thePin,
                    isMapped: true,
                    inDate: true, //Date is not important, but necessary for filtering for now
                    type: "laundry"
                });
            }
        })
        .catch((err) => displayNotification(`Error: Pitt dataset ${dataSourceName} could not be retrieved`, "error", (retryDiv) => {
                const retryButton = document.createElement("button");
                retryButton.innerHTML = "<p><i class=\"fa fa-refresh\" aria-hidden=\"true\"></i> Retry</p>";
                retryButton.type = "button";
                retryButton.className = "retry";
                retryButton.addEventListener("click", function() {
                    retryDiv.parentNode.style.display = "none";
                    fetchPittData(dataSection, dataSourceName, filterCreated, options);
                });
                retryDiv.appendChild(retryButton);
        }));
    }//End fetchPittData()

    function fetchAllData() {
        Promise.all([
            fetchWPRDCData("Police", { limit: 250 }),
            fetchWPRDCData("311", { limit: 250 }),
            fetchWPRDCData("Arrest", { limit: 250 }),
            fetchWPRDCData("Code Violation", { limit: 250 }),
            fetchWPRDCData("Library"),
            fetchWPRDCData("Non-Traffic Violation", { limit: 250 }),

            fetchPittData('Labs', 'Alumni', false),
            fetchPittData('Labs', 'Benedum', true),
            fetchPittData('Labs', 'Cath_G62', true),
            fetchPittData('Labs', 'Cath_G27', true),
            fetchPittData('Labs', 'Lawrence', true),
            fetchPittData('Labs', 'Hillman', true),
            fetchPittData('Labs', 'Suth', true),

            fetchPittData('Laundry', 'TOWERS', false),
            fetchPittData('Laundry', 'BRACKENRIDGE', true),
            fetchPittData('Laundry', 'HOLLAND', true),
            fetchPittData('Laundry', 'LOTHROP', true),
            fetchPittData('Laundry', 'MCCORMICK', true),
            fetchPittData('Laundry', 'SUTH_EAST', true),
            fetchPittData('Laundry', 'SUTH_WEST', true),
            fetchPittData('Laundry', 'FORBES_CRAIG', true)
        ]).catch((err) => {
            displayNotification(err, "error", (retryDiv) => {
                var retryButton = document.createElement("button");
                retryButton.innerHTML = "<p><i class=\"fa fa-refresh\" aria-hidden=\"true\"></i> Retry</p>";
                retryButton.type = "button";
                retryButton.className = "retry";
                retryButton.addEventListener("click", function() {
                    retryDiv.parentNode.style.display = "none";
                    fetchAllData();
                });
                retryDiv.appendChild(retryButton);
            });
        }).then(() => {
            generateDataTable();
        });
    }

    //Helper function that returns difference between two dates in days
    function getDateDifference(dateA, dateB) {
        return Math.floor(Math.abs(dateA.getTime() - dateB.getTime()) / 86400000);
    }

})(typeof window !== "undefined" ? window : {});
