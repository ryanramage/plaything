/**
 * User: ryan
 * Date: 12-11-20
 * Time: 9:38 PM
 */
define([
    'jquery',
    'director',
    'jscss',
    'raphael-amd',
    'onecolor',
    'lorem',
    'hbt!section',
    'text!img/swim.path',
    "pathicon!img/out?id=sweet,width=64,height=64,fill=#ccc"
], function ($, director, jscss, Raphael, onecolor, lorem, section_t, swim, test) {


    console.log('runninf', test);

    var exports = {},
        routes = {
            '/' : index,
            '/palette/*' : palette,
            '/pattern/*' : pattern
        },
        cssObj = {
           '.section' : {
               'padding' : '60px 0 100px'
           },
           '.border' : {
               'height' : '8px'
           },
           '.container' : {},
           '.color1': {},
           '.color2': {},
           '.color3': {},
           '.color4': {},
           '.color5': {},
           '.color0': {},
            p : {
                'font-weight': 'bold',
                'font-style': 'normal'
            }


        },
        router = director.Router(routes);


    function index() {

    }

    function textColor(bgColor) {
        var r = bgColor.red() * 255,
            g = bgColor.green() * 255,
            b = bgColor.blue() * 255;

      var yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return (yiq >= 128) ? '#000' : '#fff';
    }


    function textShadow (color, bgColor) {
        if (color.lightness() < 0.5) {
            return color.lightness(.85, true);
        } else {
            return color.lightness(-.85, true);
        }
    }

    function centreColour(color) {
        var to_change = .12;
        if (color.lightness() > 0.8) {
            to_change = -.12;
        }
        return color.lightness(to_change, true);
    }

    function circle() {
        var paper = Raphael(10, 50, 320, 200);

        paper.circle(100, 100, 60).animate({fill: "#223fa3", stroke: "#000", "stroke-width": 10, "stroke-opacity": 1}, 2000);
        paper.path('M15.067,2.25c-5.979,0-11.035,3.91-12.778,9.309h3.213c1.602-3.705,5.271-6.301,9.565-6.309c5.764,0.01,10.428,4.674,10.437,10.437c-0.009,5.764-4.673,10.428-10.437,10.438c-4.294-0.007-7.964-2.605-9.566-6.311H2.289c1.744,5.399,6.799,9.31,12.779,9.312c7.419-0.002,13.437-6.016,13.438-13.438C28.504,8.265,22.486,2.252,15.067,2.25zM10.918,19.813l7.15-4.126l-7.15-4.129v2.297H-0.057v3.661h10.975V19.813z')
            .attr({fill: "#FFF", stroke: "#fff"})
            .glow();
    }


    function setColours(colours, first_is_section) {
        colours.forEach(function(colour, i){
            console.log(colour, i);
            if (i ===0) {
                if (first_is_section) {
                    cssObj['.section']['background-color'] =   '#474747';// + colour;
                } else {
                    cssObj['.container']['background-color'] =   '#474747';
                }

            } else {
                cssObj['.color' + i]['color'] = '#222';// + colour;
                cssObj['.color' + i]['text-shadow'] = '0px 2px 3px #555';
            }
        });
    }


    function setSectionBG(colours) {
        colours.forEach(function(colour, i){
            var myColor = new onecolor('#' + colour);
            var text = textColor(myColor);

            var text_color = new onecolor(text);
            var text_shadow = textShadow(text_color, myColor);



            var center = centreColour(myColor);

            cssObj['.color' + i]['color'] =  text;
            cssObj['.color' + i]['text-shadow'] = '0px 1px 3px ' + text_shadow.cssa();

            cssObj['.color' + i]['background-color'] = '#' + colour;
            cssObj['.color' + i]['background-position'] = 'center bottom';
            cssObj['.color' + i]['background-repeat'] = 'no-repeat';
            //cssObj['.color' + i]['background'] = '-webkit-radial-gradient(circle, #'+ colour + ' 80%, rgba(80%,60%,60%,.4));';
            cssObj['.color' + i]['background'] = '-webkit-radial-gradient(circle,  ' + center.cssa() + ' 10px, '+ myColor.cssa() + ');';
        });
    }


    function drawSectionBorder(colours) {
        var borders = [];
        var current = null;
        colours.forEach(function(colour, i){
            if (!current) {
                current = {
                    from_colour : new onecolor('#' + colour),
                    from : i
                }
            } else {
                current.to_colour = new onecolor('#' + colour);
                current.to = i;
                borders.push(current);
                current = {
                    from_colour : new onecolor('#' + colour),
                    from : i
                };
            }
        });

        doBorders(borders);
    }


    function doBorders(borders) {
        borders.forEach(function(border){
            var id = '#section_border_' + border.from + '-' + border.to;
            var canvas = document.getElementById('play');
            if (canvas.getContext) {
                var ctx = canvas.getContext("2d");

                ctx.fillStyle = border.from_colour.cssa();
                ctx.fillRect (0, 0, 16, 8);

                ctx.fillStyle = border.to_colour.cssa();
                ctx.fillRect (16, 0, 16, 8);
                cssObj[id] = {};
                cssObj[id]['background-image'] =  "url(" + canvas.toDataURL("image/png")+ ")" ;
            }

        })
    }


    function renderTemplate(colours) {
        colours.forEach(function(colour, i) {
            $('.experiment').append(section_t({
                i : i,
                j : i + 1
            }));



            var iconColour = new onecolor('#' + colour);
            if (i < colours.length - 2) {
                iconColour = new onecolor('#' + colours[i + 1]);
            }

            var paper = Raphael('icon_' + i, 32,32);
            var p  = paper.path(swim).attr({fill: iconColour.cssa(), stroke: "none"});
            var box = p.getBBox(); //(x,y,x2,y2,width,height)
            paper.setViewBox(box.x, box.y, box.width, box.height);

        });
        $('p').text(lorem.defaults().text);
    }


    function pattern(num) {
        $.getJSON('http://www.colourlovers.com/api/pattern/'+ num +'?format=json&jsonCallback=?', function(result){
            if (result && result[0]) {
                var img = result[0].imageUrl;
                cssObj['.section']['background'] = "url(" + img + ")";
                var colours = result[0].colors;

                setSectionBG(colours);
                drawSectionBorder(colours);
                jscss.embed(jscss.compile(cssObj));

                renderTemplate(colours);


            }
        })
    }


    function palette(colour) {
        $.getJSON('http://www.colourlovers.com/api/palette/'+ colour +'?format=json&jsonCallback=?', function(result){
            if (result && result[0]) {
                var colours = result[0].colors;
                setSectionBG(colours);
                drawSectionBorder(colours);
                //  cssObj['.section']['background-color'] = '#' + colours[0];


                jscss.embed(jscss.compile(cssObj));
                renderTemplate(colours);


            }
        })
    }



    exports.on_dom_ready = function() {


        router.init('/');

    }


    return exports;
});