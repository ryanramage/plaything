var jam = {
    "packages": [
        {
            "name": "moot",
            "location": "jam/moot",
            "main": "moot.js"
        },
        {
            "name": "depend",
            "location": "jam/moot",
            "main": "depend.js",
            "local": true
        }
    ],
    "version": "0.2.11",
    "shim": {}
};

if (typeof require !== "undefined" && require.config) {
    require.config({packages: jam.packages, shim: jam.shim});
}
else {
    var require = {packages: jam.packages, shim: jam.shim};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}