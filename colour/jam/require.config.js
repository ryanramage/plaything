var jam = {
    "packages": [
        {
            "name": "director",
            "location": "jam/director",
            "main": "director.js"
        },
        {
            "name": "domReady",
            "location": "jam/domReady",
            "main": "domReady.js"
        },
        {
            "name": "escodegen",
            "location": "jam/escodegen",
            "main": "escodegen.js"
        },
        {
            "name": "esprima",
            "location": "jam/esprima",
            "main": "esprima.js"
        },
        {
            "name": "eve",
            "location": "jam/eve",
            "main": "eve.js"
        },
        {
            "name": "handlebars",
            "location": "jam/handlebars",
            "main": "handlebars.js"
        },
        {
            "name": "hbt",
            "location": "jam/hbt",
            "main": "hbt.js"
        },
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "jquery.js"
        },
        {
            "name": "jscss",
            "location": "jam/jscss",
            "main": "lib/index.js"
        },
        {
            "name": "lorem",
            "location": "jam/lorem",
            "main": "src/library/lorem.js"
        },
        {
            "name": "onecolor",
            "location": "jam/onecolor",
            "main": "one-color-all.js"
        },
        {
            "name": "pathicon",
            "location": "jam/pathicon",
            "main": "pathicon.js"
        },
        {
            "name": "pcon",
            "location": "jam/pcon",
            "main": "pcon.js"
        },
        {
            "name": "raphael",
            "location": "jam/raphael",
            "main": "raphael.amd.js"
        },
        {
            "name": "raphael-amd",
            "location": "jam/raphael-amd",
            "main": "raphael.amd.js"
        },
        {
            "name": "sweet",
            "location": "jam/sweet",
            "main": "src/sweet.js"
        },
        {
            "name": "sweet.js",
            "location": "jam/sweet.js",
            "main": "src/sweet.js"
        },
        {
            "name": "sweeten",
            "location": "jam/sweeten",
            "main": "src/sweeten.js"
        },
        {
            "name": "text",
            "location": "jam/text",
            "main": "text.js"
        },
        {
            "name": "underscore",
            "location": "jam/underscore",
            "main": "underscore.js"
        }
    ],
    "version": "0.2.12",
    "shim": {
        "director": {
            "exports": "Router"
        }
    }
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