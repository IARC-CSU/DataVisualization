



	function CI5_trend() // generate heatmap 
	{	
	

		
		var file_use = "data/CI5plus_asr_country.csv"; 

		d3.csv(file_use,
			
			function(d) {
			return {
				
				sex : +d.sex,
				year: +d.year,
				cancer_label : d.cancer_label,
				cancer : +d.cancer,
				country_code : +d.country_code,
				country_label : d.country_label,
				asr: +d.asr
				};	
			},		
			function(data) {
					
				
				var data_country = d3.nest()
					.key(function(d) {return d.country_label;})
					.sortKeys(d3.ascending)
					.entries(data)
				

				
				country_list = [];
				
				for (var i = 0; i < data_country.length; i += 1) {
					country_list.push(data_country[i].key)
				}
				
				awesomplete.list = country_list;
				
				
				//filter data 
				var data_temp = data.filter(function(d){
					return (d.sex == 1 & d.cancer == 1 & [208,36,250].includes(d.country_code))
				});
				

				
				var data_nest=d3.nest()
					.key(function(d) {return d.country_code;})
					.sortKeys(d3.ascending)
					.key(function(d) {return d.year;})
					.sortKeys(d3.ascending)
					.entries(data_temp)
				
				// create graph
										
				var bar_graph= // create array with both bargraph
				d3.select("#chart").append("svg") // draw main windows
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("class", "bar_graph")	
					.attr("transform", "translate(" + margin.left_page   + "," + margin.top_page  + ")") 
					
			


				add_axis_title(bar_graph,data_temp);
				add_trend(bar_graph,data_nest, true);
				//add_legend(graph_legend);
				
				
			
			
			}
		);
	}

	
	
	function add_axis_title(graph,data) { 


		var y_max = d3.max(data, function(d) {return d.asr})
		var y_min = d3.min(data, function(d) {return d.asr})
		var tick_list = tick_generator(y_max, y_min, true)

		yScale.domain([tick_list.value_bottom,tick_list.value_top]); // update xscale domain
		
		
		var x_max = d3.max(data, function(d) {return d.year})
		var x_min = d3.min(data, function(d) {return d.year})
		
		
		var tick_year_list = tick_year_generator(x_max, x_min)

		xScale.domain([tick_year_list.value_bottom,tick_year_list.value_top]); // update xscale domain

		
		


		
		axis_orient = "left"
		axis_y = var_height
		axis_tick_major = 8
		axis_tick_minor = 5
		axis_tick2 = 0
		
		var graph_width = xScale(tick_year_list.value_top + 2)
		


		var yAxis = d3.svg.axis() 
			.scale(yScale)
			.orient(axis_orient)
			.tickSize(-graph_width, 0,0)
			.tickPadding(12)
			.tickValues(tick_list.major)	
			.tickFormat(d3.format(".0f"));
			
					
	    var yAxis_minor = d3.svg.axis() 
			.scale(yScale)  
			.orient(axis_orient)
			.tickSize(-graph_width, 0,0)
			.tickPadding(12)
			.tickValues(tick_list.minor)	
			.tickFormat("")	;
			
		var xAxis = d3.svg.axis() 
			.scale(xScale)
			.orient("bottom")
			.tickSize(-var_height-20, 0,0)
			.tickPadding(12)
			.tickValues(tick_year_list.major)	
			.tickFormat(d3.format(".0f"));
			
	    var xAxis_minor = d3.svg.axis() 
			.scale(xScale)  
			.orient("bottom")
			.tickSize(-var_height-20, 0,0)
			.tickPadding(12)
			.tickValues(tick_year_list.minor)	
			.tickFormat("")	;	
			
		graph_select = graph
		
		graph_select.append("g") // draw axis major
			.attr("class", "yaxis")
			.attr("transform", "translate(" + (0)+ "," +(0) + ")")
			.call(yAxis);
			
		graph_select.append("g") // draw axis major
			.attr("class", "xaxis")
			.attr("transform", "translate(" + (0)+ "," +(var_height+10) + ")")
			.call(xAxis);

		graph_select.append("g") // draw axis minor
			.attr("class", "yaxis_minor")
			.attr("transform", "translate(" + (0)+ "," +(0) + ")")
			.call(yAxis_minor);
			
		graph_select.append("g") // draw axis minor
			.attr("class", "xaxis_minor")
			.attr("transform", "translate(" + (0)+ "," +(var_height+10) + ")")
			.call(xAxis_minor);
				
		graph_select.selectAll(".yaxis") // add Big tick
			.data(tick_list.major, function(d) { return d; })
			.enter()
			.append("line")
			.attr("class", "tick_major")
			.attr("stroke", "black")
			.attr("x2",  0 )
			.attr("x1", -axis_tick_major)
			.attr("y2", function(d) { return yScale(d); })
			.attr("y1", function(d) { return yScale(d); })
			
		graph_select.selectAll(".yaxis") // add small tick
			.data(tick_list.minor, function(d) { return d; })
			.enter()
			.append("line")
			.attr("class", "tick_minor")
			.attr("stroke", "black")
			.attr("x2",  0)
			.attr("x1", -axis_tick_minor)
			.attr("y2", function(d) { return yScale(d); })
			.attr("y1", function(d) { return yScale(d); })
			
		graph_select.selectAll(".xaxis") // add Big tick
			.data(tick_year_list.major, function(d) { return d; })
			.enter()
			.append("line")
			.attr("class", "tick_major")
			.attr("stroke", "black")
			.attr("y2",  var_height+10 )
			.attr("y1", axis_tick_major+var_height+10)
			.attr("x2", function(d) { return xScale(d); })
			.attr("x1", function(d) { return xScale(d); })
			
		graph_select.selectAll(".xaxis") // add small tick
			.data(tick_year_list.minor, function(d) { return d; })
			.enter()
			.append("line")
			.attr("class", "tick_minor")
			.attr("stroke", "black")
			.attr("y2",  var_height+10)
			.attr("y1", axis_tick_minor+var_height+10)
			.attr("x2", function(d) { return xScale(d); })
			.attr("x1", function(d) { return xScale(d); })
			
		
		
		
		graph_select.append("line") // add line for y = 0
			.style("stroke", "black")  
			.attr("x1", 0)
			.attr("y1", var_height+10)  
			.attr("x2", graph_width+5)
			.attr("y2", var_height+10);  
			
		graph_select.append("line") // add line for x = 0
			.style("stroke", "black")  
			.attr("x1", 0)
			.attr("y1", -10)  
			.attr("x2",0)
			.attr("y2", var_height+10);  
			
		graph_select.append("text") // add x axis subtitle
				.attr("class", "y_title")
				.attr("text-anchor", "middle")
				.attr("transform", "translate(-60," +var_height/2 + ") rotate(-90)")
				.text("ASR")
				
		
	

			 			
	}
	
	function add_trend(graph, data) {

			
		graph_select = graph
		var data_temp = data
		

		
		var nodes = graph_select.append("g")
			.attr("id","nodes_id")
			.attr("class", "nodes")
			.selectAll()
			.data(data_temp)
			.enter()
			.append("g")
			.attr("class", "country_holder")
			.attr("transform", function(d, i) {
				return "translate(0,0)";
				})
		
		var path = nodes.append("path")
			.attr("class","trend")
			.attr("d", function(d, i){
				return lineFunction(d.values)
				})
			.attr("stroke", function(d, i){
				return color_scale_10(i)
				})
			.attr("stroke-width", 2)
			.attr("fill", "none")
			
		 nodes.append("text")
			.attr("class","country_label")
			.attr("text-anchor", "left")
			.attr("x", function (d) {
				nb_year = d.values.length;
				temp = d.values[nb_year-1].values[0];	
				return (xScale(temp.year+1));
			})
			.attr("y", function (d) {
				nb_year = d.values.length;
				temp = d.values[nb_year-1].values[0];	
				return (yScale(temp.asr));
			})
			.text(function (d) {
				nb_year = d.values.length
				temp = d.values[nb_year-1].values[0]
				return (temp.country_label);
				
			})
			.attr("dy", "0.15em")
			.call(drag)
			

	
	

	}
	
	function add_country(label_input) {
		
		var tag_element = document.getElementById("country_element").children;
		var bool_unique = true 
		
		for (var i = 0; i < tag_element.length; i++) {
			if (tag_element[i].getAttribute('data-filter') == label_input) {
				bool_unique = false 
			} 
		}
		
		if (bool_unique) {
			const temp_tag = document.createElement("button");
			temp_tag.setAttribute("class", "tag row button");
			temp_tag.setAttribute("data-filter", label_input);
			temp_tag.innerHTML = label_input;
			
			//const temp_close = document.createElement("a");
			//temp_close.setAttribute("class", "boxclose");
			//temp_tag.appendChild(temp_close)
			
			document.getElementById("country_element").appendChild(temp_tag)
		}
		
		
		var file_use = "data/CI5plus_asr_country.csv"; 

		d3.csv(file_use,
			
			function(d) {
			return {
				
				sex : +d.sex,
				year: +d.year,
				cancer_label : d.cancer_label,
				cancer : +d.cancer,
				country_code : +d.country_code,
				country_label : d.country_label,
				asr: +d.asr
				};	
			},		
			function(data) {
				
				//filter data 
				var data_temp = data.filter(function(d){
					return (d.sex == 1 & d.cancer == 1 & d.country_label == label_input)
				});
				
				var data_nest=d3.nest()
					.key(function(d) {return d.country_code;})
					.sortKeys(d3.ascending)
					.key(function(d) {return d.year;})
					.sortKeys(d3.ascending)
					.entries(data_temp)
				
				// create graph
										
				var bar_graph=d3.select("#chart").select(".bar_graph")
				
				var nb_country = (graph_select.selectAll(".nodes")[0][0].childElementCount)
				
				var nodes = graph_select.append("g")
					.attr("id","nodes_id")
					.attr("class", "nodes")
					.selectAll()
					.data(data_nest)
					.enter()
					.append("g")
					.attr("class", "country_holder")
					.attr("transform", function(d, i) {
						return "translate(0,0)";
						})
		
				var path = nodes.append("path")
					.attr("class","trend")
					.attr("d", function(d, i){
						return lineFunction(d.values)
						})
					.attr("stroke", function(d, i){
						return color_scale_10(i + nb_country)
						})
					.attr("stroke-width", 2)
					.attr("fill", "none")


					
				path.call(transition);
					

				
				setTimeout(function() {
				 nodes.append("text")
					.attr("class","country_label")
					.attr("text-anchor", "left")
					.attr("x", function (d) {
						nb_year = d.values.length;
						temp = d.values[nb_year-1].values[0];	
						return (xScale(temp.year+1));
					})
					.attr("y", function (d) {
						nb_year = d.values.length;
						temp = d.values[nb_year-1].values[0];	
						return (yScale(temp.asr));
					})
					.text(function (d) {
						nb_year = d.values.length
						temp = d.values[nb_year-1].values[0]
						return (temp.country_label);
						
					})
					.attr("dy", "0.15em")
					.call(drag)
				}, 1000)
					
				



			}
		)
	}
		
		
		
	
	
	function tick_generator(value_max, value_min = 0, log_scale=false )	{
	//generate tick on the axis 
		//max of the value
			//Return array if element
			//tick_list.major: Major tick 
			//tick_list.minor: Minor tick 
			//tick_list.value_top: Last tick
		
		var tick_list = new Object();  
		tick_list.major = [];
		tick_list.minor = [];
		tick_list.value_top = value_max; // Will change according to the last tick
		tick_list.value_bottom = value_min; // Will change according to the first tick
			
		var log_max = Math.pow(10,Math.floor(Math.log10(value_max))); // order of magnitude of max (power of 10)
		var unit_floor_max = Math.floor(value_max/log_max) // left digit of max 
		
		if (!log_scale) {
			var tick_space = 0;
			if (unit_floor_max < 2) {
				tick_space = 0.2*log_max;	
			}
			else {
				if (unit_floor_max < 5) {
					tick_space = 0.5*log_max;
					}
				else {
				tick_space = log_max;
				}
			}
			var value_top = Math.ceil(value_max/tick_space)*tick_space;
			
			tick_list.value_top = value_top; 
			var bool_major = true;
			// to create major and minor list
			for (var i = 0; i <= value_top; i += tick_space) {
				if (bool_major) {
					tick_list.major.push(i);
				} else {
					tick_list.minor.push(i);
				}
				
				bool_major = !bool_major;
				
			}
		} else {
		
			var temp = 0;
			var log_min = Math.pow(10,Math.floor(Math.log10(value_min))); // order of magnitude of min (power of 10)
			var unit_floor_min = Math.floor(value_min/log_min) // left digit of min 
			
			if (log_min == log_max) { // if min and max same magnitude
			
				for (var i = unit_floor_min-1; i <= unit_floor_max+1; i++) {
					
					if (i == 0) {
						temp=9*(log_min/10)
						tick_list.major.push(temp);
					} else {
						temp = i*log_min;
						tick_list.major.push(temp);
					}

				}
				if (unit_floor_min == unit_floor_max) { // min and max same first digit
				
					for (var i = 0; i <= 9; i++) {
						temp = (i*log_min/10); 
						temp = (unit_floor_min*log_min) + temp;
						tick_list.minor.push(temp);
					}
				}
				else {
					
					for (var i = 0; i <= 19; i++) {
						temp = (i*log_min/10); 
						temp = (unit_floor_min*log_min) + temp;
						tick_list.minor.push(temp);
					}
				}
			} else if ((log_max/log_min) < 1000){  //if max and min difference magnitude < 1000
				
				if (unit_floor_min < 6) {
					for (var i = unit_floor_min-1; i <= 5; i++) {
						
						if (i == 0) {
							temp=9*(log_min/10)
							tick_list.major.push(temp);
						} 
						else {
							temp = i*log_min;
							tick_list.major.push(temp);
						}
					}
				
				tick_list.major.push(7*log_min);
				
				}
				else {
					tick_list.major.push((unit_floor_min-1)*log_min);
				}
				
				for (var i = unit_floor_min; i <= 19; i++) {
					
					temp = (i*log_min); 
					tick_list.minor.push(temp);
				}
				
				while (log_min != (log_max/10)) {
					
					log_min = log_min*10;
					tick_list.major.push(log_min);
					tick_list.major.push(2*log_min);
					tick_list.major.push(3*log_min);
					tick_list.major.push(5*log_min);
					tick_list.major.push(7*log_min);
					
					for (var i = 2; i <= 19; i++) {
						temp = (i*log_min); 
						tick_list.minor.push(temp);
					}	
				}
				for (var i = 2; i <= unit_floor_max+1; i++) {
						temp = (i*log_max); 
						tick_list.minor.push(temp);
				}

				if (unit_floor_max < 5 ) {
					for (var i = 1; i <= unit_floor_max+1; i++) {
						temp = (i*log_max); 
						tick_list.major.push(temp);
					}
					
				} else if (unit_floor_max < 7) {
					tick_list.major.push(log_max);
					tick_list.major.push(2*log_max);
					tick_list.major.push(3*log_max);
					tick_list.major.push(5*log_max);
					tick_list.major.push((unit_floor_max+1)*log_max);
					
				} else {
					tick_list.major.push(log_max);
					tick_list.major.push(2*log_max);
					tick_list.major.push(3*log_max);
					tick_list.major.push(5*log_max);
					tick_list.major.push(7*log_max);
					tick_list.major.push((unit_floor_max+1)*log_max);
				}
				
			} else { //if max and min difference magnitude > 1000
				

				
				if (unit_floor_min == 1) {
					tick_list.major.push(9*(log_min/10));
					tick_list.major.push(log_min);
					tick_list.major.push(2*log_min);
					tick_list.major.push(3*log_min);
					tick_list.major.push(5*log_min);
				} else if (unit_floor_min == 2) {
					tick_list.major.push(log_min);
					tick_list.major.push(2*log_min);
					tick_list.major.push(3*log_min);
					tick_list.major.push(5*log_min);
				} else if (unit_floor_min < 6) {
					tick_list.major.push(3*log_min);
					tick_list.major.push(5*log_min);
					tick_list.major.push(7*log_min);	
				} else {
					tick_list.major.push(5*log_min);
					tick_list.major.push(7*log_min);	
				}
				
				for (var i = unit_floor_min; i <= 9; i++) {
				
					temp = (i*log_min); 
					tick_list.minor.push(temp);

				}
				
				while (log_min != (log_max/10)) {
					
					log_min = log_min*10;
					tick_list.major.push(log_min);
					tick_list.major.push(2*log_min);
					tick_list.major.push(5*log_min);
					
					for (var i = 2; i <= 9; i++) {
						temp = (i*log_min); 
						tick_list.minor.push(temp);
					}	
				}
				
				for (var i = 2; i <= unit_floor_max+1; i++) {
					temp = (i*log_max); 
					tick_list.minor.push(temp);
				}	
				
				if (unit_floor_max < 5) {
					tick_list.major.push(log_max);
					tick_list.major.push(2*log_max);
					tick_list.major.push((unit_floor_max+1)*log_max);
				} else if (unit_floor_min < 6) {
					tick_list.major.push(1*log_max);
					tick_list.major.push(2*log_max);
					tick_list.major.push(5*log_max);
				} else if (unit_floor_min < 7) {
					tick_list.major.push(1*log_max);
					tick_list.major.push(2*log_max);
					tick_list.major.push(5*log_max);	
					tick_list.major.push(7*log_max);	
				} else {
					tick_list.major.push(1*log_max);
					tick_list.major.push(2*log_max);
					tick_list.major.push(5*log_max);	
					tick_list.major.push(7*log_max);
					tick_list.major.push((unit_floor_max+1)*log_max);					
				}		
			}
		
		var max_major = tick_list.major[tick_list.major.length-1];
		var max_minor = tick_list.minor[tick_list.minor.length-1];
		
		var min_major = tick_list.major[0];
		var min_minor = tick_list.minor[0]
		
		
		tick_list.value_top = Math.max(max_major,max_minor)	
		tick_list.value_bottom = Math.min(min_major,min_minor)	
		}
	return (tick_list)
	}
	

	function tick_year_generator(value_max, value_min)	{
	//generate tick on the axis 
		//max of the value
			//Return array if element
			//tick_list.major: Major tick 
			//tick_list.minor: Minor tick 
			//tick_list.value_top: Last tick
		
		var tick_list = new Object();  
		tick_list.major = [];
		tick_list.minor = [];
		tick_list.value_top = value_max + 5 - (value_max % 5); // Will change according to the last tick
		tick_list.value_bottom = value_min - (value_min % 5 ); // Will change according to the first tick
			
		
		var tick_space = 5;
		
		if (tick_list.value_top  - tick_list.value_bottom  > 25) {
			var bool_major = true;
			if (tick_list.value_top % 10 == 5) {
				var bool_major = false;
			}
			// to create major and minor list
			for (var i = tick_list.value_bottom; i <= tick_list.value_top; i += tick_space) {
				if (bool_major) {
					tick_list.major.push(i);
				} else {
					tick_list.minor.push(i);
				}
				
				bool_major = !bool_major;
				
			}
		} else {
			for (var i = tick_list.value_bottom; i <= tick_list.value_top; i += 1) {
				if (i % 5 == 0) {
					tick_list.major.push(i);
				} else {
					tick_list.minor.push(i);
				}
			}
		}
		

		
	return (tick_list)
	}
	
	
	function dragmove(d) {
    d3.select(this)
      .attr("y", d3.event.y)
      .attr("x", d3.event.x)

	
}

    // From https://bl.ocks.org/mbostock/5649592
    function transition(path) {
        path.transition()
            .duration(1000)
            .attrTween("stroke-dasharray", tweenDash);
    }
    function tweenDash() {
        var l = this.getTotalLength(),
            i = d3.interpolateString("0," + l, l + "," + l);
        return function (t) { return i(t); };
    }

