define('lessc', [], function () {
    'use strict';

    var buildMap = {},
        // TODO: Find a better way to determine if the current environment is
        //       Node.js or not.
        isNodejs = typeof module != 'undefined';

    /**
     * Convenience function for compiling LESS code.
     */
    var compileLess = function (lessSrc, parentRequire, onLoad, config, callback) {

        console.log(config);
        onLoad(lessSrc);
        if (!config.isBuild) {
            parentRequire(['less'], function (less) {
                var lessParser = new less.Parser({
                    paths: ['' + config.baseUrl]
                });

                lessParser.parse(lessSrc, function (e, css) {
                    callback(e, css.toCSS({ compress: true }).trim());
                });
            });
        } else {

            console.log('in compile in jam')
            require(['./jam/lessc/lessr.js'], function(less_rhino){
                console.log('gtere');
                var lessParser = new less_rhino.Parser({
                    paths: ['' + config.dirBaseUrl]
                });

                console.log(lessParser);

                lessParser.parse(lessSrc, function (e, css) {
                    console.log(e, css);
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
        if (isNodejs) {
            var text = fs.readFileSync(name, 'utf-8');
            callback(text);
        } else {
            parentRequire(['text!' + name], function (text) {
                callback(text);
            });
        }
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
                var text = jsEscape(buildMap[moduleName]);
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
            }
        },

        load: function (name, parentRequire, onLoad, config) {
            // Instead of re-inventing the wheel, let's just conveniently use
            // RequireJS' `text` plugin.

            console.log(config.dirBaseUrl);
            console.log(name);

            loadFile(name, parentRequire, function (text) {
                compileLess(text, parentRequire, onLoad, config, function (e, css) {
                    if (e) {
                        onLoad.error(e);
                        return;
                    } else {
                        if (config.isBuild) {
                            buildMap[name] = css;
                        }

                        if (!isNodejs) {
                            outputStylesheet(css);
                        }
                    }
                });
            });
        }
    };
});
