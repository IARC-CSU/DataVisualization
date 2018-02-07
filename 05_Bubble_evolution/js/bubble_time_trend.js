

	function bubble_evo() // generate heatmap 
	{	
		var file_use = "data/data_risk_trend.csv"; 

		d3.csv(file_use,
			
			function(d) {
			return {
				
				country_label : d.country_label,
				cause : d.cause,
				cause_num : +d.cause_num,
				hdi: +d.hdi,
				risk: +d.risk,
				year: +d.year,
				rank: +d.rank,

				};	
			},		
			function(data) {
				
				//filter data 
				var data_temp = data.filter(function(d){
					return (d.cause_num == 1)
				});

				var data_nest=d3.nest()
					.key(function(d) {return d.country_label;})
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
					.attr("class", "bar_graph1")	
					.attr("transform", "translate(" + margin.left_page   + "," + margin.top_page  + ")") 
				
				var graph_legend =
				d3.select("#chart").selectAll("svg")
					.append("g")
					.attr("width", 100)
					.attr("height", 30)
					.append("g")
					.attr("class", "graph_legend")	
					.attr("transform", "translate(" + ( margin.left_page + (graph_width)  + 50)   + "," + (margin.top_page+ 20)  + ")") 
					
				

				add_axis_title(bar_graph,data_temp,true);
				add_circle_line(bar_graph,data_nest, true);
				add_legend(graph_legend);
				
				
			
			
			}
		);
	}
	
	function add_legend(graph) {
		
		var line_legend = [ 
		  { "x": 0,   "y": 0},  
		  { "x": 5,  "y": 20},
		  { "x": 10,  "y": 30},
		  { "x": 15,  "y": 52},		  
		  { "x": 20,  "y": 66},
		  { "x": 25,  "y": 76},
		  { "x": 30,  "y": 81},
		  { "x": 35,  "y": 83},
		  { "x": 40,  "y": 85},
		];
		
		graph_select = graph
		
		var path_legend = graph_select.append("path")
			.attr("class","path_legend")
			.style("stroke", "#b7b7b7")   // set the line colour
			.style("stroke-width", 2)
			.attr("d", function(d, i){
				return lineFunction_legend(line_legend)
				})
			.attr("fill", "none");
			
		path_legend
			.attr("stroke-dasharray", function(d,i) {

				length = path_legend.node().getTotalLength();
				return length + " " + length
			})
			.attr("stroke-dashoffset", function(d,i) {
				length = path_legend.node().getTotalLength();
				return length;
			})
		
		 graph_select.append("circle")
			.attr("class","circle_legend1")
			.attr("r", 7)
			.style("stroke", "#000000")   // set the line colour
			.style("stroke-width", 2)
			.attr("fill", "#b7b7b7");
			
		graph_select.append("text")
			.attr("class","text_legend_base")
			.attr("text-anchor", "left")
			.attr("x", 25)
			.attr("transform","translate(-10,3)")
			.text("2000")
			.attr("dy", "0.15em")
			
		graph_select.append("text")
			.attr("class","text_legend1")
			.attr("text-anchor", "left")
			.attr("transform","translate(-10,3)")
			.attr("x", 25)
			.text("2000")
			.attr("dy", "0.15em")
			
	}
	
	function add_axis_title(graph,data) { 


		var tick_list = new Object();  
		tick_list.major = [0,2,4,6,8,10,12];
		tick_list.minor = [1,3,5,7,9,11];
		tick_list.value_top = 12; 
		tick_list.value_bottom = 0; 

		
		yScale.domain([0, tick_list.value_top]) 

		
		axis_orient = "left"
		axis_x = 0
		axis_tick1 = 10
		axis_tick2 = 0

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
			
		graph_select = graph
		
		graph_select.append("g") // draw axis major
			.attr("class", "yaxis")
			.attr("transform", "translate(" + (axis_x)+ "," +(0) + ")")
			.call(yAxis);

		graph_select.append("g") // draw axis minor
			.attr("class", "yaxis_minor")
			.attr("transform", "translate(" + (axis_x)+ "," +(0) + ")")
			.call(yAxis_minor);
				
		graph_select.selectAll(".yaxis") // add Big tick
			.data(tick_list.major, function(d) { return d; })
			.enter()
			.append("line")
			.attr("class", "tick_major")
			.attr("stroke", "black")
			.attr("x2",  axis_tick2 )
			.attr("x1", -axis_tick1)
			.attr("y2", function(d) { return yScale(d); })
			.attr("y1", function(d) { return yScale(d); })
			
		graph_select.selectAll(".yaxis") // add small tick
			.data(tick_list.minor, function(d) { return d; })
			.enter()
			.append("line")
			.attr("class", "tick_minor")
			.attr("stroke", "black")
			.attr("x2",  axis_tick2)
			.attr("x1", -axis_tick1)
			.attr("y2", function(d) { return yScale(d); })
			.attr("y1", function(d) { return yScale(d); })
		
		
		graph_select.append("line") // add line for y = 0
			.style("stroke", "black")  
			.attr("x1", 0)
			.attr("y1", var_height)  
			.attr("x2", graph_width+5)
			.attr("y2", var_height);  
			
		graph_select.append("text") // add x axis subtitle
				.attr("class", "y_title")
				.attr("text-anchor", "middle")
				.attr("transform", "translate(-60," +var_height/2 + ") rotate(-90)")
				.text("Risk of dying (%)")
				
	
		graph_select.append("text") // add x axis subtitle
			.attr("class", "y_title")
			.attr("text-anchor", "middle")
			.attr("transform", "translate("+xScale(5.5*(bar_space+1))+"," +(var_height +150) + ")")
			.text("Medium / High HDI")
			
		graph_select.append("text") // add x axis subtitle
			.attr("class", "y_title")
			.attr("text-anchor", "middle")
			.attr("transform", "translate("+xScale(16*(bar_space+1))+"," +(var_height +150) + ")")
			.text("Very High HDI")
	

		

			 			
	}

	function add_circle_line(graph, data) {

			
		graph_select = graph
		var data_temp = data
		
		var nodes = graph_select.append("g")
			.attr("id","nodes_id")
			.attr("class", "nodes")
			.selectAll()
			.data(data_temp)
			.enter()
			.append("g")
			.attr("class", "circle_holder")
			.attr("transform", function(d, i) {
				shift = (d.values[0].values[0].hdi-1)/2
				pos = (d.values[0].values[0].rank)
				return "translate(" + xScale((pos+shift)*(bar_space+1)) + ",0)";
				})
				

		
		var path = nodes.append("path")
			.attr("class","path1")
			.attr("d", function(d, i){
				return lineFunction(d.values)
				})
			.attr("stroke", function(d, i) {
				return color_cancer[d.values[0].values[0].hdi]
			})
			.attr("stroke-width", 2)
			.attr("fill", "none")
		
		
		path
			.attr("stroke-dasharray", function(d,i) {

				length = path[0][i].getTotalLength();
				return length + " " + length
			})
			.attr("stroke-dashoffset", function(d,i) {
				length = path[0][i].getTotalLength();
				return length;
			})

		nodes.append("circle")
			.attr("class","circle1")
			.attr("r",7)
			.style("stroke", "#000000")   // set the line colour
			.style("stroke-width", 2)
			.attr("transform", function(d, i) {
				return "translate(0," + (yScale(d.values[0].values[0].risk)) + ")";}) 
			.attr("fill", function(d, i) {
				return color_cancer[d.values[0].values[0].hdi] 
			});
		
		var node_label = graph_select
			.selectAll()
			.data(data_temp)
			.enter()
			.append("g")
			.attr("class","cancer_label_holder")
			.attr("transform", function(d, i) {
				shift = (d.values[0].values[0].hdi-1)/2
				pos = (d.values[0].values[0].rank)
				return "translate(" + (xScale((pos+shift)*(bar_space+1))-10) + "," + (var_height +30)+ ")";
				})
			
		node_label
			.append("text")
			.attr("class","cancer_label")
			.style("text-anchor", "middle")
			//.text(function(d,i) {return d.values[0].values[0].country_label})
			.attr("dy", "0.25em")
			.attr("fill", "#000000")    // set the line colour
			.attr("transform", "rotate(-45)")
			.each(function (d) { // to use the wrap label fonction 
				var lines = wordwrap(d.values[0].values[0].country_label, label_wrap)
				for (var i = 0; i < lines.length; i++) {
					d3.select(this).append("tspan").attr("dy",0).attr("x",0).attr("y",30/Math.pow(3/2, lines.length)+i*15).text(lines[i])
					}
			});	
			
			

		graph_select.append("g") // add line for each group
			.selectAll()
			.data(data_temp)
			.enter()
			.append("line")
			.style("stroke", "black")  
			.attr("x1",  function(d, i) {
				pos = (i+1)
				if (i > 9) {
					pos = pos +0.5
				}
				return xScale((pos)*(bar_space+1))
			})
			.attr("x2",  function(d, i) {
				pos = (i+1)
				if (i > 9) {
					pos = pos +0.5
				}
				return xScale((pos)*(bar_space+1))
			})
			.attr("y1", var_height) 
			.attr("y2", 0) 
			.style("opacity", 0.1);
			
		graph_select.append("g") // add line for each group
			.selectAll()
			.data(data_temp)
			.enter()
			.append("line")
			.style("stroke", "black")  
			.attr("x1",  function(d, i) {
				pos = (i+1)
				if (i > 9) {
					pos = pos +0.5
				}
				return xScale((pos)*(bar_space+1))
			})
			.attr("x2",  function(d, i) {
				pos = (i+1)
				if (i > 9) {
					pos = pos +0.5
				}
				return xScale((pos)*(bar_space+1))
			})
			.attr("y1", var_height + 10)  
			.attr("y2", var_height) 
			.style("opacity", 1);

		graph_select.append("line") // add line for x = 0
		.style("stroke", "black")  
		.attr("x1", 0)
		.attr("y1", var_height)   
		.attr("x2", 0)
		.attr("y2", 0);
		

	}
	
	function update(bool) {
		

			document.getElementById('radio_old').disabled = true;
			document.getElementById('radio_new').disabled = true;
			
			update_circle(bool);
			update_legend(bool);
			
		
	}
	
	function update_legend(bool) {
		
		var path_legend = d3.select("#chart").select(".path_legend")
		console.log(path_legend.node())
		
		if (bool) {
			d3.select("#chart").select(".graph_legend").selectAll(".circle_legend1")
			.transition().duration(transition_time).ease(ease_effect)
			.attrTween("transform",translateAlong_legend(path_legend.node())); 
			
			path_legend
				.transition()
				.duration(transition_time)
				.ease(ease_effect)
				.attr("stroke-dashoffset", 0);
				
		} else {
			d3.select("#chart").select(".graph_legend").selectAll(".circle_legend1")
			.transition().duration(transition_time).ease(ease_effect)
			.attr("transform", "translate(0,0)")
			
			path_legend
				.transition()
				.duration(transition_time)
				.ease(ease_effect)
				.attr("stroke-dashoffset", path_legend.node().getTotalLength());
			
		}
			
		d3.select("#chart").select(".graph_legend").selectAll(".text_legend1")
			.transition().duration(transition_time).ease(ease_effect)
			.attr("transform",function(d,i) {
				if (bool) {
					return "translate(30,88)";
				}
				else {
					return "translate(-10,3)";
				}
			})
			.tween("text", function(d) {
				if(bool)
		      		var i = d3.interpolate(  2000 , 2015 );
		      	else
		      		var i = d3.interpolate(  2015 , 2000 );
		      	return function(t) {
		        	d3.select(this).text( roundNumber(i(t), 1) );
		      	};
		    })
			.each("end", function() {
				document.getElementById('radio_old').disabled = false;
				document.getElementById('radio_new').disabled = false;
			})
	}

	function update_circle(bool) {
	
		var nodes = d3.select("#chart")
		var path = nodes.selectAll(".path1")
		
		if (bool) {
			nodes.selectAll(".circle1")
				.transition().duration(transition_time).ease(ease_effect)
				.attrTween("transform",translateAlong(path)); 
				
			path
				.transition()
				.duration(transition_time)
				.ease(ease_effect)
				.attr("stroke-dashoffset", 0);
		
		} 
		else {
			nodes.selectAll(".circle1")
				.transition().duration(transition_time).ease(ease_effect)
				.attr("transform", function(d, i) {
					return "translate(0," + (yScale(d.values[0].values[0].risk)) + ")";}); 
					
			path
				.transition()
				.duration(transition_time)
				.ease(ease_effect)
				.attr("stroke-dashoffset", function(d,i) {
					length = path[0][i].getTotalLength();
					return length;
				})
		}
			
			
	}
	
	

	
	function update_data(group_label,group_value){
		
		var file_use = "data/data_risk_trend.csv"; 
		
		if (group_value == 0) {
			subtitle = "Major Non-communicable diseases"
		}
		else if (group_value == 1) {
			subtitle = "Cancer"
		}
		else {
			subtitle = "Cardiovascular diseases"
		}
		
		d3.select("#header").select(".desc").text(subtitle)
	
		d3.csv(file_use,
			
			function(d) {
			return {
				
				country_label : d.country_label,
				cause : d.cause,
				cause_num : +d.cause_num,
				hdi: +d.hdi,
				risk: +d.risk,
				year: +d.year,
				rank: +d.rank,

				};	
			},		
			function(data) {
				


				var data_temp = data.filter(function(d){
					return (d[group_label] == group_value)
				});

				var data_nest=d3.nest()
					.key(function(d) {return d.country_label;})
					.sortKeys(d3.ascending)
					.key(function(d) {return d.year;})
					.sortKeys(d3.ascending)
					.entries(data_temp)

				var bar_graph=d3.select("#chart").select(".bar_graph1")
				
				update_axis(bar_graph,data_temp);
				update_data_circle(bar_graph,data_nest);

			}
		)
	}
	
	function update_axis(graph,data) {
		
		var y_max = d3.max(data, function(d) {return d.risk})
		var tick_list = tick_generator(y_max, 0, false) // diff log scale
		
		
		if (document.getElementById('radio_cause1').checked) {
			tick_list.major = [0,2,4,6,8,10,12];
			tick_list.minor = [1,3,5,7,9,11];
			tick_list.value_top = 12; // Will change according to the last tick
			tick_list.value_bottom = 0; // Will change according to the first tick
		} 
		else if (document.getElementById('radio_cause2').checked) {
			tick_list.major = [0,5,10,15,20,25,30];
			tick_list.minor = [2.5,7.5,12.5,17.5,22.5,27.5];
			tick_list.value_top = 30; // Will change according to the last tick
			tick_list.value_bottom = 0; // Will change according to the first tick
		}

		
		yScale.domain([0, tick_list.value_top]) 

		axis_orient = "left"
		axis_x = 0
		axis_tick1 = 10
		axis_tick2 = 0
		
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
			
		graph_select = graph	
		
		graph_select  //  grid Major transition
		   .selectAll(".yaxis")
           .transition().duration(transition_time).ease(ease_effect)  
           .call(yAxis); 

		graph_select //  grid Minor transition
			.selectAll(".yaxis_minor")
			.transition().duration(transition_time).ease(ease_effect)
			.call(yAxis_minor);  
		

		// update tick position major
		 var xgrid_major=graph_select.selectAll(".tick_major")
			.data(tick_list.major, function(d) { return d; })
			
		xgrid_major.transition().duration(transition_time).ease(ease_effect)
			.attr("y1", function(d) {return yScale(d); })
			.attr("y2", function(d) {return yScale(d); })
					
		xgrid_major.exit().remove()
			
		xgrid_major.enter()
			.append("line")
			.attr("class", "tick_major")
			.attr("stroke", "black")
			.attr("x2",  axis_tick2 )
		    .attr("x1", -axis_tick1)
			.attr("y1", function(d) { return yScale(d); })
			.attr("y2", function(d) { return yScale(d); })
			
		var xgrid_minor=graph_select.selectAll(".tick_minor")
			.data(tick_list.minor, function(d) { return d; })		
			
		 xgrid_minor.transition().duration(transition_time).ease(ease_effect)
			.attr("y1", function(d) { return yScale(d); })
			.attr("y2", function(d) { return yScale(d); })
		
		xgrid_minor.exit().remove()
					
		xgrid_minor.enter()
			.append("line")
			.attr("class", "tick_minor")
			.attr("stroke", "black")
			.attr("x2",  axis_tick2)
			.attr("x1", -axis_tick1)
			.attr("y2", function(d) { return yScale(d); })
			.attr("y1", function(d) { return yScale(d); })
		
	
	}	
	
	function update_data_circle(graph, data) {

		bool_2015 = document.getElementById('radio_new').checked;
		var temp_op = 0;
		
		if (bool_2015) {
			var temp_op = 1;
		}
			
		graph_select = graph
		var data_temp = data
		
		graph_select.selectAll(".circle_holder")
			.data(data_temp)
			.transition().duration(transition_time).ease(ease_effect)
			.attr("transform", function(d, i) {
				shift = (d.values[0].values[0].hdi-1)/2
				pos = (d.values[0].values[0].rank)
				return "translate(" + xScale((pos+shift)*(bar_space+1)) + ",0)";
				})
				

		graph_select.selectAll(".circle1")
			.data(data_temp)
			.transition().duration(transition_time).ease(ease_effect)
			.attr("transform", function(d, i) {
				if (bool_2015) {
					xpos = xScale(15+1)*0.1
					year = 15
				}
				else {
					xpos = 0
					year = 0
				}
				return "translate("+ xpos +"," + (yScale(d.values[year].values[0].risk)) + ")";}) 
		
		
		var path1 = graph_select.selectAll(".path1")
			.data(data_temp)
			.style("opacity", temp_op)
			.transition().duration(transition_time).ease(ease_effect)
			.attr("d", function(d, i){
				return lineFunction(d.values)
			})
			.each('end', function() {
				length = this.getTotalLength();
				d3.select(this).attr("stroke-dasharray",length + " " + length)
				if (bool_2015) {
					length = 0
				}
				d3.select(this).attr("stroke-dashoffset",length)
				d3.select(this).style("opacity", 1)
			})


		graph_select.selectAll(".cancer_label_holder")
			.data(data_temp)
			.transition().duration(transition_time).ease(ease_effect)
			.attr("transform", function(d, i) {
				shift = (d.values[0].values[0].hdi-1)/2
				pos = (d.values[0].values[0].rank)
				return "translate(" + xScale((pos+shift)*(bar_space+1)) + "," + (var_height +30)+ ")";
				})
			
			
		
		

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
			
			var tick_list = new Object();  
			tick_list.major = [];
			tick_list.minor = [];
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

	function translateAlong_legend(path) {
	return function(d,i) {
		var l = path.getTotalLength();
		return function(t) {
			var p =  path.getPointAtLength(t * l);
			return "translate(" + p.x + "," + p.y + ")";//Move marker
			}
		}
	}
	
	function translateAlong(path) {
	return function(d,i) {
		var temp = path[0][i]
		var l = temp.getTotalLength();
		return function(t) {
			var p =  temp.getPointAtLength(t * l);
			return "translate(" + p.x + "," + p.y + ")";//Move marker
			}
		}
	}

	function wordwrap(text, max) { // to wrap label (not from me, forget the link)
		var regex = new RegExp(".{0,"+max+"}(?:\\s|$)","g");
		var lines = []
		var line
		while ((line = regex.exec(text))!="") {
			lines.push(line);
		} 
		return lines
	}
	
	function roundNumber( value, digit ){
		var val =  Math.round( value * digit) / digit ; 
		return val ; 
	}
