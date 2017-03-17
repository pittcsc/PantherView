(function (window, undefined) {
    "use strict";

    // declare variables awaiting values
    let WPRDC_BASE_URL,
        WPRDC_META_URL,
        WPRDC_DATA_SOURCES,
        WPRDC_QUERY_PREFIX,
        WPRDC_QUERY_SUFFIX,
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
    }

    function filterDisplay(e) {
        const elm = e.target;
        const type = /.+?(?=[A-Z])/.exec(elm.id)[0];

        if (elm.checked) {
            markers.forEach((marker) => {
                if (marker.type === type && marker.isMapped) {
                    if (marker.inDate) {
                        marker.pin.addTo(map);
                    }
                    marker.filtered = false;
                }
            });
        } else {
            markers.forEach((marker) => {
                if (marker.type === type && marker.isMapped) {
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
    // TODO: Prune to last 30 days in SQL
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
                    record.type = dataSourceName.toLowerCase();

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
        if (dataSection == "Labs"){
            return fetch("http://labinformation.cssd.pitt.edu/lab_status/" + dataSourceName.toUpperCase())
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
                            fetchPittData(dataSourceName);
                        });
                        retryDiv.appendChild(retryButton);
                    });
                    return;
                }

                //Grab dataSource object
                const dataSource = PITT_LABS[dataSourceName];

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

                //Create pin object
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
            })
            .catch((err) => displayNotification(`Error: Pitt dataset ${dataSourceName} could not be retrieved`, "error", (retryDiv) => {
                const retryButton = document.createElement("button");
                retryButton.innerHTML = "<p><i class=\"fa fa-refresh\" aria-hidden=\"true\"></i> Retry</p>";
                retryButton.type = "button";
                retryButton.className = "retry";
                retryButton.addEventListener("click", function() {
                    retryDiv.parentNode.style.display = "none";
                    fetchPittData(dataSourceName);
                });
                retryDiv.appendChild(retryButton);
            }));
        }
    }

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
            fetchPittData('Labs', 'Suth', true)

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
        });
    }

    //Helper function that returns difference between two dates in days
    function getDateDifference(dateA, dateB) {
        return Math.floor(Math.abs(dateA.getTime() - dateB.getTime()) / 86400000);
    }

})(typeof window !== "undefined" ? window : {});
