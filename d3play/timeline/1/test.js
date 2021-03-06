var data = [
    { start: new Date(2011, 01,01), end: new Date(2011,01,02)},
    { start: new Date(2011, 01,03), end: new Date(2011,01,04)},
];

var images = [
    {
        start: new Date(2011, 01,01), end: new Date(2011,01,02),
        url: 'http://svg-edit.googlecode.com/svn/branches/2.5.1/editor/images/logo.png',
        width: 37, height: 59
    }
]

var journals = [
    {
        day: new Date(2011, 01,01),
        entry : "Today was good, I had some pizza<br/>and pie!"
    }

]


var margin = {top: 0, right: 0, bottom: 12, left: 24},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.time.scale()
    .domain([new Date(1975, 0, 1), new Date()])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, height])
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(-height);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(0)
    .tickSize(-width);

var x_zoom = d3.behavior.zoom();

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(x_zoom.x(x).scaleExtent([0.5, 125000000]).on("zoom", zoom));

svg.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
          .attr("width", width)
          .attr("height", height);

svg.append("rect")
    .attr("class", "bg")
    .attr("width", width)
    .attr("height", height);

var tags =  svg.append("g")
    //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")



/** The scrubber **/

svg.append('line')
        .attr("x1", width/2 - 1)
        .attr("y1", 1)
        .attr("x2", width/2 - 1)
        .attr("y2", height)
        .style("stroke", "rgb(6,120,155)");


/*
var tag_area = d3.svg.area()

        .x1(function(d) { return x(d.start);   })
        .x0(function(d) { return x(d.end);  })
        .y1(20)
        .y0(150);

*/




tags.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

tags.append("g")
    .attr("class", "y axis")
    .call(yAxis);




var tag_space = tags.append("g").attr("clip-path", "url(#clip)");

tag_space.selectAll("rect")
.data(data)
.enter().append("rect")
.attr("class", "tag")
    .attr("x", function(d) {  return x(d.start); })
    .attr("y", 20)
    .attr("height",50)
    .attr("width", function(d) {  return x(d.end) - x(d.start); })
    .attr("fill", "#2d578b")
    .on('click', function(d,i){  console.log('click');    $(this).addClass('hover')   })
    .on('mouseover', function(d,i){ console.log('mo'); $(this).addClass('hover')   })
    .on('mouseout', function(d,i){  $(this).removeClass('hover')   });

var scrapbook_space = tags.append("g").attr("clip-path", "url(#clip)");

var sc_width = function(d) {
    var date_width =  x(d.end) - x(d.start);
    var img_width = d.width;
    if(img_width < date_width) return img_width;
    return date_width;
}


scrapbook_space.selectAll('image')
        .data(images)
        .enter().append('image')
        .attr('class', 'scrap')
        .attr('x', function(d) {  return x(d.start); })
        .attr('y', 150)
        .attr('width', sc_width)
        .attr('height', function(d) {return d.height })
        .attr('xlink:href', function(d) {return d.url})


       



function zoom() {

    var range = x.domain();


    tags.select(".x.axis").call(xAxis);
    tags.select(".y.axis").call(yAxis);

    var scrubber_date = new Date( d3.mean(range, function(d){ return d.getTime()  }));

    tag_space.selectAll("rect").attr("x", function(d) {  return x(d.start); }).attr("width", function(d) {  return x(d.end) - x(d.start); });
    scrapbook_space.selectAll('image').attr("x", function(d) {  return x(d.start); }).attr("width", sc_width);

}

var scales = {
   'second' : 1000
};
scales.minute = scales.second * 60;
scales.hour = scales.minute * 60;
scales.day  = scales.hour * 24;
scales.week = scales.day * 7;
scales.month = scales.day * 31;
scales.year = scales.month * 12;
scales.multi_year = scales.year * 100;



function getMeanDate(domain) {
 return new Date( d3.mean(domain, function(d){ return d.getTime()  }))
}


function getScale(domain) {
	var duration = domain[1].getTime() - domain[0].getTime();
	if (duration <= scales.minute) return scales.minute;
	if (duration <= scales.hour) return scales.hour;
	if (duration <= scales.day) return scales.day;
	if (duration <= scales.week) return scales.week;
	if (duration <= scales.month) return scales.month;
	if (duration <= scales.year) return scales.year;
	return scales.multi_year;
}

function getScaleExtent(scale) {
    if (scale <= scales.minute) return [0, 1];
   	if (scale <= scales.hour) return [0, 1];
   	if (scale <= scales.day) return [0, 1];
   	if (scale <= scales.week) return [0, 1];
   	if (scale <= scales.month) return [0, 1];
   	if (scale <= scales.year) return [0, 1];
   	return [0.5, 125000000];
}


function zoomInSingleToScale(middle_date, from_scale)  {
	if (from_scale == scales.multi_year) return scales.year;
	if (from_scale == scales.year) return scales.month;
	if (from_scale == scales.month) return scales.week;
    if (from_scale == scales.week) return scales.day;
	if (from_scale == scales.day) return scales.hour;
	if (from_scale == scales.hour) return scales.minute;
	if (from_scale == scales.minute) return scales.minute;

}

function zoomOutSingleToScale(middle_date, from_scale)  {
	if (from_scale == scales.multi_year) return scales.multi_year;
	if (from_scale == scales.year) return scales.multi_year;
	if (from_scale == scales.month) return scales.year;
    if (from_scale == scales.week) return scales.month;
	if (from_scale == scales.day) return scales.week;
	if (from_scale == scales.hour) return scales.day;
	if (from_scale == scales.minute) return scales.hour;

}

function redrawToDates(left_date, right_date, scale_extent) {
    x.domain([left_date, right_date]);
    zoom();
    x_zoom.x(x);//.scaleExtent(scale_extent);
}


function zoomButton(middle_date, to_scale) {
    var x = to_scale/2;
    var left_date = new Date(middle_date.getTime() - x);
    var right_date = new Date(middle_date.getTime() + x);
    var scale_extent = getScaleExtent(to_scale);
    redrawToDates(left_date, right_date, scale_extent);
}


$(function() {
	$('.btn.zoom_in').on('click',function(){
		var current_domain = x.domain();
		var scale = getScale(current_domain);	
		var middle_date = getMeanDate(current_domain);
        zoomButton(middle_date, zoomInSingleToScale(middle_date, scale));
		
		
	});
    $('.btn.zoom_out').on('click',function(){
   		var current_domain = x.domain();
   		var scale = getScale(current_domain);
   		var middle_date = getMeanDate(current_domain);
        zoomButton(middle_date, zoomOutSingleToScale(middle_date, scale));


   	});


});



/*
 ---- disable the brush for now.

svg.append("g")
    .attr("class", "brush")
    .call(d3.svg.brush().x(x).y(y)
    .on("brushstart", brushstart)
    .on("brush", brushmove)
    .on("brushend", brushend));

function brushstart() {
  svg.classed("selecting", true);
}

function brushmove() {
  var e = d3.event.target.extent();

}

function brushend() {
  svg.classed("selecting", !d3.event.target.empty());
}
*/

soundManager.setup({
  url: '../../../js/soundmanager/swf/',
  flashVersion: 9, // optional: shiny features (default = 8)
  useFlashBlock: false,
  onready: function() {
    // Ready to use; soundManager.createSound() etc. can now be called.
  }
});


