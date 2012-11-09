define('lessc', ['text', 'jam/lessc/lessr.js'], function (text, lessr) {
    'use strict';

    var buildMap = {},
        dirMap = {},
        // TODO: Find a better way to determine if the current environment is
        //       Node.js or not.
        isNodejs = typeof module != 'undefined';

    /**
     * Convenience function for compiling LESS code.
     */
    var compileLess = function (lessSrc, parentRequire, onLoad, config, callback) {



        if (!config.isBuild) {
            parentRequire(['less'], function (less) {
                var lessParser = new less.Parser({
                    paths: ['' + config.baseUrl]
                });

                lessParser.parse(lessSrc, function (e, css) {


                    //var temp = css.toCSS({ compress: true }).trim();
                    var temp = css.toCSS({ compress: true }).trim();

                    callback(e, temp, lessParser);
                });
            });
        } else {

            require(['./jam/lessc/lessr.js'], function(less_rhino){
                var lessParser = new less_rhino.Parser({
                    paths: ['' + config.dirBaseUrl]
                });

                lessParser.parse(lessSrc, function (e, css) {
                    callback(e, css.toCSS({ compress: true }).trim());
                });
            })




        }
    };

    /**
     * Convenience function for injecting stylesheet into the DOM.
     */
    var outputStylesheet = function (css) {
        var styleTag = document.createElement('style');

        styleTag.type = 'text/css';
        if (styleTag.styleSheet) {
            styleTag.styleSheet.cssText = css();
        } else {
            styleTag.appendChild(document.createTextNode(css));
        }

        document.getElementsByTagName('head')[0].appendChild(styleTag);
    };

    var loadFile = function (name, parentRequire, callback) {


        text.get(parentRequire.toUrl(name), function(text) {
                callback(text);
        });

    };

    var jsEscape = function (content) {
        return content.replace(/(['\\])/g, '\\$1')
            .replace(/[\f]/g, "\\f")
            .replace(/[\b]/g, "\\b")
            .replace(/[\n]/g, "\\n")
            .replace(/[\t]/g, "\\t")
            .replace(/[\r]/g, "\\r");
    };

    return {

        write: function (pluginName, moduleName, writeBuild) {


            if (moduleName in buildMap) {


                var dirBaseUrl = dirMap[moduleName];

                var lessParser = new lessr.Parser({
                    paths: ['' + dirBaseUrl]
                });
                lessParser.parse(buildMap[moduleName], function (e, css) {



                    var result = css.toCSS({ compress: true }).trim();
                    var text = jsEscape(result);
                    writeBuild(
                        ";(function () {" +
                            "var theStyle = '" + text + "';" +
                            "var styleTag = document.createElement('style');" +
                            "styleTag.type = 'text/css';" +
                            "if (styleTag.styleSheet) {" +
                                "styleTag.styleSheet.cssText = theStyle;" +
                            "} else {" +
                                "styleTag.appendChild(document.createTextNode(theStyle));" +
                            "}" +
                            "document.getElementsByTagName('head')[0].appendChild(styleTag);" +
                            "define('" + pluginName + "!" + moduleName + "', function () {" +
                                "return theStyle;" +
                            "});" +
                        "}());"
                    );

                });








            }
        },

        load: function (name, parentRequire, onLoad, config) {
            // Instead of re-inventing the wheel, let's just conveniently use
            // RequireJS' `text` plugin.


            loadFile(name, parentRequire, function (text) {
                if (config.isBuild) {
                    buildMap[name] = text;
                    dirMap[name] = config.dirBaseUrl;
                    return onLoad(text);
                }


                compileLess(text, parentRequire, onLoad, config, function (e, css, lessParser) {
                    if (e) {
                        onLoad.error(e);
                        return;
                    } else {
                        if (!config.isBuild) {
                            outputStylesheet(css);
                            onLoad();
                        }
                    }
                });
            });
        }
    };
});
