(function(window, undefined) {
    "use strict";

    const HOUR = 3600000;
    const MINUTE = 60000;

    // WPRDC data
    const WPRDC_BASE_URL = "https://data.wprdc.org/api/action/datastore_search_sql?sql=";
    const WPRDC_META_URL = "https://data.wprdc.org/api/action/resource_show?id=";

    // Marker Icons
    const iconTypes = {
        LAUNDRY: L.divIcon({
            className: 'map-pin black',
            html: '<i class="fa fa-tint"></i>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -16]
        }),
        COMP_LAB: L.divIcon({
            className: 'map-pin black',
            html: '<i class="fa fa-desktop"></i>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -16]
        }),
        CITY_POLICE: L.divIcon({
            className: "map-pin blue",
            html: "<i class=\"fa fa-balance-scale\"></i>",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -16]
        }),
        CITY_ARREST: L.divIcon({
            className: "map-pin red",
            html: "<i class=\"fa fa-gavel\"></i>",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -16]
        }),
        CITY_311_ICON: L.divIcon({
            className: "map-pin yellow",
            html: "<i class=\"fa fa-commenting\"></i>",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -16]
        }),
        LIBRARY_ICON: L.divIcon({
            className: "map-pin black",
            html: "<i class=\"fa fa-book\"></i>",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -16]
        }),
        CODE_VIOLATION: L.divIcon({
            className: "map-pin green",
            html: "<i class=\"fa fa-times-circle\"></i>",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -16]
        }),
        NON_TRAFFIC_VIOLATION: L.divIcon({
            className: "map-pin darkorchid",
            html: "<i class=\"fa fa-sticky-note-o\"></i>",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -16]
        })
    };

    const PITT_LAUNDRY = {
        'TOWERS': {
            building: 'Litchfield Towers',
            icon: iconTypes.LAUNDRY,
            id: '2430136',
            latLong: [40.442559, -79.956584]
        },
        'BRACKENRIDGE':{
            building: 'Brackenridge Hall',
            icon: iconTypes.LAUNDRY,
            id: '2430119',
            latLong: [40.442772, -79.955637]
        },
        'HOLLAND':{
            building: 'Holland Hall',
            icon: iconTypes.LAUNDRY,
            id: '2430137',
            latLong: [40.443189, -79.956164]
        },
        'LOTHROP': {
            building: 'Lothrop Hall',
            icon: iconTypes.LAUNDRY,
            id: '2430151',
            latLong: [40.441654, -79.960041]
        },
        'MCCORMICK': {
            building: 'McCormick Hall',
            icon: iconTypes.LAUNDRY,
            id: '2430120',
            latLong: [40.443466, -79.955419]
        },
        'SUTH_EAST': {
            building: 'Sutherland Hall East',
            icon: iconTypes.LAUNDRY,
            id: '2430135',
            latLong: [40.445818, -79.962299]
        },
        'SUTH_WEST': {
            building: 'Sutherland Hall West',
            icon: iconTypes.LAUNDRY,
            id: '2430134',
            latLong: [40.446006, -79.963158]
        },
        'FORBES_CRAIG': {
            building: 'Forbes-Craig Apartments',
            icon: iconTypes.LAUNDRY,
            id: '2430142',
            latLong: [40.444569, -79.949092]
        }
    };

    const PITT_LABS = {
        "Alumni": {
            latLong: [40.445763, -79.953834],
            icon: iconTypes.COMP_LAB
        },
        "Benedum": {
            latLong: [40.443844, -79.958475],
            icon: iconTypes.COMP_LAB
        },
        "Cath_G62": {
            latLong: [40.444038, -79.953110],
            icon: iconTypes.COMP_LAB
        },
        "Cath_G27": {
            latLong: [40.444291, -79.953357],
            icon: iconTypes.COMP_LAB
        },
        "Lawrence": {
            latLong: [40.442277, -79.955023],
            icon: iconTypes.COMP_LAB
        },
        "Hillman": {
            latLong: [40.442787, -79.953942],
            icon: iconTypes.COMP_LAB
        },
        "Suth": {
            latLong: [40.445953, -79.962444],
            icon: iconTypes.COMP_LAB
        }
    };

    const WPRDC_DATA_SOURCES = {
        "Police": {
            id: "1797ead8-8262-41cc-9099-cbc8a161924b",
            primaryFiltering: "WHERE \"INCIDENTNEIGHBORHOOD\" LIKE '%Oakland' AND \"INCIDENTTIME\" >= (NOW() - '30 day'::INTERVAL) ORDER BY \"INCIDENTTIME\" DESC",
            latLong: ["Y", "X"],
            icon: iconTypes.CITY_POLICE,
            updateTime: 12*HOUR,

            // TODO: Better title and popup messages?
            title: (record) => record["OFFENSES"],
            popup: (record) => record["OFFENSES"],
            table: (record) => `<td class="col1">Police</td>
                                <td class="col2">${record["OFFENSES"]}</td>
                                <td class="col3">${record.incidentMonth}/${record.incidentDay}/${record.incidentYear}</td>
                                <td class="col4">${record["NEIGHBORHOOD"]}</td>`,

            processRecord: (record) => {
                // Collect time of incident from the record
                record.incidentYear = parseInt(record.INCIDENTTIME.substring(0,4));
                record.incidentMonth = parseInt(record.INCIDENTTIME.substring(5,8));
                record.incidentDay = parseInt(record.INCIDENTTIME.substring(8,10));
            }
        },

        "Arrest": {
            id: "e03a89dd-134a-4ee8-a2bd-62c40aeebc6f",
            primaryFiltering: "WHERE \"INCIDENTNEIGHBORHOOD\" LIKE '%Oakland' AND \"ARRESTTIME\" >= (NOW() - '30 day'::INTERVAL) ORDER BY \"ARRESTTIME\" DESC",
            latLong: ["Y", "X"],
            icon: iconTypes.CITY_ARREST,
            updateTime: 12*HOUR,

            // TODO: Better title and popup messages?
            title: (record) => record["OFFENSES"],
            popup: (record) => record["OFFENSES"],
            table: (record) => `<td class="col1">Arrest</td>
                                <td class="col2">${record["OFFENSES"]}</td>
                                <td class="col3">${record.incidentMonth}/${record.incidentDay}/${record.incidentYear}</td>
                                <td class="col4">${record["NEIGHBORHOOD"]}</td>`,

            processRecord: (record) => {
                // Collect time of incident from the record
                record.incidentYear = parseInt(record.ARRESTTIME.substring(0,4));
                record.incidentMonth = parseInt(record.ARRESTTIME.substring(5,8));
                record.incidentDay = parseInt(record.ARRESTTIME.substring(8,10));
            }
        },

        "Code Violation": {
            id: "4e5374be-1a88-47f7-afee-6a79317019b4",
            primaryFiltering: "WHERE \"NEIGHBORHOOD\" LIKE '%Oakland' AND \"INSPECTION_DATE\" >= (NOW() - '30 day'::INTERVAL) ORDER BY \"INSPECTION_DATE\" DESC",
            latLong: ["Y", "X"],
            icon: iconTypes.CODE_VIOLATION,
            updateTime: 12*HOUR,

            // TODO: Better title and popup messages?
            title: (record) => record["VIOLATION"],
            popup: (record) => `<strong>${record["VIOLATION"]}:</strong>
                                ${record["LOCATION"]}<br>
                                ${record["STREET_NUM"]} ${record["STREET_NAME"]}`,
            table: (record) => `<td class="col1">Code Violation</td>
                                <td class="col2">${record["VIOLATION"]}</td>
                                <td class="col3">${record.incidentMonth}/${record.incidentDay}/${record.incidentYear}</td>
                                <td class="col4">${record["NEIGHBORHOOD"]}</td>`,

            processRecord: (record) => {
                // Collect time of incident from the record
                record.incidentYear = parseInt(record.INSPECTION_DATE.substring(0,4));
                record.incidentMonth = parseInt(record.INSPECTION_DATE.substring(5,8));
                record.incidentDay = parseInt(record.INSPECTION_DATE.substring(8,10));
            }
        },

        // City of Pittsburgh 311 data
        "311": {
            id: "40776043-ad00-40f5-9dc8-1fde865ff571",
            primaryFiltering: "WHERE \"NEIGHBORHOOD\" LIKE '%Oakland' AND \"CREATED_ON\" >= (NOW() - '30 day'::INTERVAL) ORDER BY \"CREATED_ON\" DESC",
            latLong: ["Y", "X"],
            icon: iconTypes.CITY_311_ICON,
            updateTime: 10*MINUTE,

            title: (record) => record["REQUEST_TYPE"],
            popup: (record) => `
              <strong>${record["DEPARTMENT"]}</strong>
              <br> ${record["REQUEST_TYPE"]}`,
            table: (record) => `<td class="col1">311</td>
                                <td class="col2">${record["DEPARTMENT"]} - ${record["REQUEST_TYPE"]}</td>
                                <td class="col3">${record.incidentMonth}/${record.incidentDay}/${record.incidentYear}</td>
                                <td class="col4">${record["NEIGHBORHOOD"]}</td>`,

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
            primaryFiltering: "WHERE \"Name\" LIKE '%OAKLAND%'",
            latLong: ["Lat", "Lon"],
            icon: iconTypes.LIBRARY_ICON,
            updateTime: 24*HOUR*30,

            title: (record) => record["Name"],
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
              `
        },

        "Non-Traffic Violation": {
            id: "6b11e87d-1216-463d-bbd3-37460e539d86",
            primaryFiltering: "Where \"NEIGHBORHOOD\" LIKE '%Oakland'",
            latLong: ["Y", "X"],
            icon: iconTypes.NON_TRAFFIC_VIOLATION,
            updateTime: 12*HOUR,

            title: (record) => record["OFFENSES"],
            popup: (record) => record["OFFENSES"],
            table: (record) => `<td class="col1">Non-Traffic Violation</td>
                                <td class="col2">${record["OFFENSES"]}</td>
                                <td class="col3">${record.incidentMonth}/${record.incidentDay}/${record.incidentYear}</td>
                                <td class="col4">${record["NEIGHBORHOOD"]}</td>`,

            processRecord: (record) => {
                record.incidentYear = parseInt(record.CITEDTIME.substring(0,4));
                record.incidentMonth = parseInt(record.CITEDTIME.substring(5,8));
                record.incidentDay = parseInt(record.CITEDTIME.substring(8,10));
            }
        }
    };

    const WPRDC_QUERY_PREFIX = "SELECT * FROM \"";
    const WPRDC_QUERY_SUFFIX = "\" ";

    const dataReadyEvent = new CustomEvent("dataready", {
        detail: {
            WPRDC_BASE_URL,
            WPRDC_META_URL,
            WPRDC_DATA_SOURCES,
            WPRDC_QUERY_PREFIX,
            WPRDC_QUERY_SUFFIX,
            PITT_LABS,
            PITT_LAUNDRY
        }
    });
    window.dispatchEvent(dataReadyEvent);
})(typeof window !== "undefined" ? window : {});
