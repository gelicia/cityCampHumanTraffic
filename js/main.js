function loadData(){
	loadDataMap();
	loadDataWhoCalls();
}

function loadDataMap(){
	var cityTip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d["Caller City"]; });

	var width = 400,
	    height = 430;

	var mapSvg = d3.selectAll("svg#mapMain")
	    .attr("width", width)
	    .attr("height", height);

	mapSvg.call(cityTip);

	var projection = d3.geo.conicEqualArea()
	   .center([1.5, 46.5])
	    .rotate([95, 0])
	    .parallels([29.5, 45.5])
	    .scale(4000)
	    .translate([width / 2, height / 2]);

	var path = d3.geo.path()
	    .projection(projection);

	d3.json("data/mncounties.json", function(error, mn) {
		mapSvg.append("path")
		.datum(topojson.feature(mn, mn.objects.counties))
		.attr("d", path)
		.attr({
			fill: '#fff',
			stroke: '#000'
		});

		d3.csv("data/callCenterByCity.csv", function(error,cities){
			var mapCities = mapSvg.selectAll("circle").data(cities).enter();

			mapCities.append("circle")
			.filter(function(d){ return d["Caller City"] !==  "Not Specified"; })
			.attr({
				"transform" : function(d) {return "translate(" + projection([d.Long,d.Lat]) + ")";},
				"r" : function(d) { return 4; },
				fill : '#3D89C4',
				stroke : "#000000"
			})
			.on('mouseover', cityTip.show)
  			.on('mouseout', cityTip.hide);

		});
	});
}

function loadDataWhoCalls(){
	var width = 400,
	    height = 430;

	var callerSvg = d3.selectAll("svg#callChartMain");

	d3.csv("data/callCenterByCaller.csv", function(error,data){
		var valueLabelWidth = 40; // space reserved for value labels (right)
		var barHeight = 20; // height of one bar
		var barLabelWidth = 400; // space reserved for bar labels
		var barLabelPadding = 5; // padding between bar and bar labels (left)
		var gridLabelHeight = 18; // space reserved for gridline labels
		var gridChartOffset = 3; // space between start of grid and first bar
		var maxBarWidth = 300; // width of the bar with the max value
		 
		// accessor functions 
		var barLabel = function(d) { return d['Caller Type']; };
		var barValue = function(d) { return parseFloat(d['Number of Calls']); };
		 
		// sorting
		var sortedData = data.sort(function(a, b) {
		 return d3.descending(barValue(a), barValue(b));
		}); 

		// scales
		var yScale = d3.scale.ordinal().domain(d3.range(0, sortedData.length)).rangeBands([0, sortedData.length * barHeight]);
		var y = function(d, i) { return yScale(i); };
		var yText = function(d, i) { return y(d, i) + yScale.rangeBand() / 2; };
		var x = d3.scale.linear().domain([0, d3.max(sortedData, barValue)]).range([0, maxBarWidth]);
		
		// svg container element
		callerSvg.attr('width', maxBarWidth + barLabelWidth + valueLabelWidth)
		  .attr('height', gridLabelHeight + gridChartOffset + sortedData.length * barHeight);
		
		// grid line labels
		var gridContainer = callerSvg.append('g')
		  .attr('transform', 'translate(' + barLabelWidth + ',' + gridLabelHeight + ')'); 
		
		gridContainer.selectAll("text").data(x.ticks(10)).enter().append("text")
		  .attr("x", x)
		  .attr("dy", -3)
		  .attr("text-anchor", "middle")
		  .text(String);
		
		// vertical grid lines
		gridContainer.selectAll("line").data(x.ticks(10)).enter().append("line")
		  .attr("x1", x)
		  .attr("x2", x)
		  .attr("y1", 0)
		  .attr("y2", yScale.rangeExtent()[1] + gridChartOffset)
		  .style("stroke", "#ccc");
		
		// bar labels
		var labelsContainer = callerSvg.append('g')
		  .attr('transform', 'translate(' + (barLabelWidth - barLabelPadding) + ',' + (gridLabelHeight + gridChartOffset) + ')'); 
		
		labelsContainer.selectAll('text').data(sortedData).enter().append('text')
		  .attr('y', yText)
		  .attr('stroke', 'none')
		  .attr('fill', 'black')
		  .attr("dy", ".35em") // vertical-align: middle
		  .attr('text-anchor', 'end')
		  .text(barLabel);
		
		// bars
		var barsContainer = callerSvg.append('g')
		  .attr('transform', 'translate(' + barLabelWidth + ',' + (gridLabelHeight + gridChartOffset) + ')'); 
		barsContainer.selectAll("rect").data(sortedData).enter().append("rect")
		  .attr('y', y)
		  .attr('height', yScale.rangeBand())
		  .attr('width', function(d) { return x(barValue(d)); })
		  .attr('stroke', 'white')
		  .attr('fill', 'steelblue');
		
		// bar value labels
		barsContainer.selectAll("text").data(sortedData).enter().append("text")
		  .attr("x", function(d) { return x(barValue(d)); })
		  .attr("y", yText)
		  .attr("dx", 3) // padding-left
		  .attr("dy", ".35em") // vertical-align: middle
		  .attr("text-anchor", "start") // text-align: right
		  .attr("fill", "black")
		  .attr("stroke", "none")
		  .text(function(d) { return d3.round(barValue(d), 2); });
		
		// start line
		barsContainer.append("line")
		  .attr("y1", -gridChartOffset)
		  .attr("y2", yScale.rangeExtent()[1] + gridChartOffset)
		  .style("stroke", "#000");
	});
}