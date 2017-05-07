(function (window, undefined) {
    "use strict";
    document.getElementById("ui").innerHTML = `
    <div id="notifications"></div>
    <div id="sidebarToggleContainer">
        <i id="sidebarToggle"></i>
    </div>
    <div id="sidebar">
        <div id="controls">
            <div id="displaySelection">
                <button id="radioMap" checked>Map</button>
                <button id="radioData">Data</button>
            </div>
            <div id="dateSelection">
                <button id="radioMonth" checked>Past Month</button>
                <button id="radioWeek">Past Week</button>
                <button id="radioDay">Yesterday</button>
            </div>
            <div id="typeSelection"></div>
        </div>
        <div id="dataArea" class="hidden">
            <table id="dataTable"></table>
        </div>
        <div id="footer">&copy; 2017 University of Pittsburgh Computer Science Club.</div>
    </div>`;
})(typeof window !== "undefined" ? window : {});
