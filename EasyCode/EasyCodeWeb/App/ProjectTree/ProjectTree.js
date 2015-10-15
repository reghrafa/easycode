(function () {
    "use strict";

    // The initialize function must be run each time a new page is loaded
    Office.initialize = function (reason) {
        $(document).ready(function () {
            app.initialize();
        });
    };

    // Fills the ProjectTree with Data
    function fillTree() {
       
    }
})();