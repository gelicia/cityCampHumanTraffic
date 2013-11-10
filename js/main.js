function loadData(){
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

			console.log(cities);

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