

	
    function bubble_evo() // generate heatmap 
	{ 	
		
		
	

		d3.csv(file_use,
			
			function(d) {
			return {
				
				cancer_label : d.hdi_label,
				rate1: +d.rate1,
				rate2: +d.rate2,

				};	
			},		
			function(data) {

				// Keep men , very high HDI 
				var data_temp = data
				
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
				add_bar_text_line(bar_graph,data_temp, true);
				add_legend(graph_legend);
				
				
			
			
			}
		);
	}
	
	function add_legend(graph) {
		
		graph_select = graph
		
		 graph_select.append("circle")
			.attr("class","circle_legend1")
			.attr("r", 20)
			.style("stroke", "#b7b7b7")   // set the line colour
			.style("stroke-width", 2)
			.attr("fill", "none");
			
		graph_select.append("circle")
			.attr("class","circle_legend2")
			.attr("r", 20)
			.style("stroke", "#b7b7b7")   // set the line colour
			//.attr("cy", function(d, i) {return yScale(d.rate2)- yScale(d.rate1)})
			.style("stroke-width", 2)
			.attr("fill", "#b7b7b7");
			
		graph_select.append("text")
			.attr("class","text_legend1")
			.attr("text-anchor", "left")
			.attr("x", 25)
			.text("2022")
			.attr("dy", "0.25em")
			
		graph_select.append("text")
			.attr("class","text_legend2")
			.attr("text-anchor", "left")
			.attr("x", 25)
			.text("2045")
			.style("opacity",0)
			.attr("dy", "0.25em")

		
	}
	
	function add_axis_title(graph,data,bool_left_graph) { 
	// Add axis, title and x-title to the graph
		// graph to add axis and title 
		// data 
		// boolean: True:left graph, False: Right bar graph
		
		

		var y_max1 = d3.max(data, function(d) {return d.rate1})
		var y_max2 = d3.max(data, function(d) {return d.rate2})
		var y_max = d3.max([y_max1,y_max2])
		
		var y_min1 = d3.min(data, function(d) {return d.rate1})
		var y_min2 = d3.min(data, function(d) {return d.rate2})
		var y_min = d3.min([y_min1,y_min2])
		
		var tick_list = tick_generator(y_max, 0, false) // diff log scale
		
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
			.tickFormat(d3.format(".1f"));
			
					
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
				.text("Number of deaths (million)")

		

			 			
	}

	function add_bar_text_line(graph, data,bool_left_graph) {

			
		graph_select = graph
		var data_temp = data

		
		var nodes = graph_select.append("g")
		   .attr("id","nodes_id")
           .attr("class", "nodes")
           .selectAll("circle")
           .data(data_temp)
           .enter()
           .append("g")
		   .attr("transform", function(d, i) {
		   return "translate(" + xScale((i+1)*(bar_space+1)) + ",0)";}) 
		   
		nodes.append("line") // add line for each group
			.style("stroke", "black")  
			.attr("y1", var_height) 
			.attr("y2", 0) 
			.style("opacity", 0.1);
			
	   nodes.append("line") // add tick for each group
			.style("stroke", "black")  
			.attr("y1", var_height + 10)  
			.attr("y2", var_height) 
			.style("opacity", 1);
		    

			
		 nodes.append("circle")
			.attr("class","circle1")
			.attr("r", 20)
			.style("stroke", function(d,i) {return color_cancer[d.cancer_label];})   // set the line colour
			.style("stroke-width", 2)
			.attr("transform", function(d, i) {return "translate(0," + (yScale(d.rate1)) + ")";}) 
			.attr("fill", "none");
			
	   nodes.append("svg:path")
		.attr("class","arrow_link")
		.attr("fill", function(d,i) {return color_cancer[d.cancer_label];})
		.attr("d", function(d,i) {
			var update_range = yScale(d.rate2)- yScale(d.rate1)
			if (update_range > 0) {
				return (d3.svg.symbol().type("triangle-down")(10,1))
			} 
			else {
				return (d3.svg.symbol().type("triangle-up")(10,1))
			}
		})
		.attr("transform",  function(d,i) {
				var update_range = yScale(d.rate2)- yScale(d.rate1)
				var offset = Math.sign(update_range)*14
				return ( "translate(0," + ( offset + yScale(d.rate1))+ ")");
		})

		
				
	  nodes.append("line")
			.attr("class","line_link")
	  		.style("stroke", function(d,i) {return color_cancer[d.cancer_label];}) 
			.style("stroke-width", 2)				
			.attr("y1", function(d,i) {
				var update_range = yScale(d.rate2)- yScale(d.rate1)
				return (Math.sign(update_range)*20) + yScale(d.rate1)
			})
			.attr("y2", function(d,i) {
				var update_range = yScale(d.rate2)- yScale(d.rate1)
				return (Math.sign(update_range)*20) + yScale(d.rate1)
			});
			
		graph_select.append("line") // add line for x = 0
		.style("stroke", "black")  
		.attr("x1", 0)
		.attr("y1", var_height)   
		.attr("x2", 0)
		.attr("y2", 0);

			

		nodes.append("circle")
			.attr("class","circle2")
			.attr("r", 20)
			.style("stroke", function(d,i) {return color_cancer[d.cancer_label];})    // set the line colour
			.style("stroke-width", 2)
			.attr("transform", function(d, i) {return "translate(0," + (yScale(d.rate1)) + ")";}) 
			.attr("fill", function(d,i) {return color_cancer[d.cancer_label];});
		   
		nodes.append("text")
			.attr("class","text1")
			.attr("text-anchor", "middle")
			.text(function(d,i) {return d.rate1})
			.attr("transform", function(d, i) {return "translate(0," + (yScale(d.rate1)) + ")";}) 
			.attr("dy", "0.25em")
			.attr("fill", function(d,i) {return color_cancer[d.cancer_label];});    // set the line colour
			
		nodes.append("text")
		    .attr("class","text2")
			.attr("text-anchor", "middle")
			.attr("transform", function(d, i) {return "translate(0," + (yScale(d.rate1)) + ")";}) 
			.text(function(d,i) {return d.rate1})
			.attr("dy", "0.25em")
			.attr("fill", "#000000");    // set the line colour
			
	   nodes.append("text")
			.attr("class","cancer_label")
			.attr("text-anchor", "middle")
			.attr("y", function(d, i) {return  var_height + 25 })
			.text(function(d,i) {return d.cancer_label})
			.attr("dy", "0.25em")
			.attr("fill", "#000000");    // set the line colour
			

		nodes.append("text")
			.attr("class", "text_percent")
			.attr("text-anchor", "left")
			.attr("x",function(d,i) {
				var update_range = yScale(d.rate2)- yScale(d.rate1)
				if (update_range  > 50 || update_range  < -50 ) {
					return 8;
				}
				else {
					return 22;
				}
			})
			.text(function(d,i) {
				return 0 ; 
				// return d3.format("+.0%")((d.rate2-d.rate1)/d.rate1)
			})
			.attr("transform", function(d, i) {return "translate(0," + (yScale(d.rate1)) + ")";}) 
			.attr("dy", "0.25em")
			.attr("fill", "#000000")
			.style("opacity",0); 
			
		
	}
	
	function update(bool) {
		

			document.getElementById('radio_old').disabled = true;
			document.getElementById('radio_new').disabled = true;
			
			update_circle(bool);
			update_legend(bool);
			
		
	}
	
	
	function update_legend(bool) {
		
		d3.select("#chart").select(".graph_legend").selectAll(".circle_legend2")
			.transition().duration(transition_time).ease(ease_effect)
						.attr("transform",function(d,i) {
				if (bool) {
					return "translate(0,50)";
				}
				else {
					return "translate(0,0)";
				}
			})
			
		d3.select("#chart").select(".graph_legend").selectAll(".text_legend2")
			.transition().duration(transition_time).ease(ease_effect)
			.attr("transform",function(d,i) {
				if (bool) {
					return "translate(0,50)";
				}
				else {
					return "translate(0,0)";
				}
			})
			.style("opacity",function() {
				if (bool) {
					return 1;
				}
				else {
					return 0;
				}
			})
			.each("end", function() {
				document.getElementById('radio_old').disabled = false;
				document.getElementById('radio_new').disabled = false;
			})
	}
	
	
	function update_circle(bool) {
	
		var nodes = d3.select("#chart")
			
		nodes.selectAll(".circle2")
			.transition().duration(transition_time).ease(ease_effect)
			.attr("transform",function(d,i) {
				if (bool) {
					update_range = yScale(d.rate2)
				}
				else {
					update_range = yScale(d.rate1)
				}
				return "translate(0," + (update_range) + ")";
			});
			
		nodes.selectAll(".text1")
			.transition().duration(transition_time).ease(ease_effect)
			.style("opacity", function(d,i) {
				var update_range = yScale(d.rate2)- yScale(d.rate1)
				if (update_range  <= 25 && update_range  >= -25 ) {
					return (0);
				} 
			});
			
			
		nodes.selectAll(".text2")
			.transition().duration(transition_time).ease(ease_effect)
			.tween("text", function(d) {

				if(bool)
		      		var i = d3.interpolate(  d.rate1 , d.rate2 );
		      	else
		      		var i = d3.interpolate(  d.rate2 , d.rate1 );
		      	return function(t) {
		        	d3.select(this).text( roundNumber(i(t)) );
		      	};
		    })
			/*.text(function(d,i) {
				if (bool) {
					temp_text = d.rate2
				}
				else {
					temp_text = d.rate1
				}
				
				return temp_text})*/
			.attr("transform",function(d,i) {
				if (bool) {
					update_range = yScale(d.rate2)
				}
				else {
					update_range = yScale(d.rate1)
				}
				return "translate(0," + (update_range) + ")";
			});
			
		nodes.selectAll(".line_link")
			.style("opacity", function(d,i) {
				var update_range = yScale(d.rate2)- yScale(d.rate1)
				if (update_range <= 50 && update_range  >= -50 ) {
					return (0);
				} 
			})
			
			
		nodes.selectAll(".line_link")
			.transition().duration(transition_time).ease(ease_effect)
			.attr("y2", function(d,i) {
				update_range = yScale(d.rate2)- yScale(d.rate1)
				var offset = Math.sign(update_range)*(-20)
				
				if (bool) {
					offset = Math.sign(update_range)*(-25)
					if (update_range  > 50 || update_range  < -50 ) {
						return(yScale(d.rate2) + offset);
					} else {
						return(yScale(d.rate1) - offset);
					}
				}
				else {
					return(yScale(d.rate1) - offset);
				}
				
			});


		nodes.selectAll(".arrow_link")
			.style("opacity", function(d,i) {
				var update_range = yScale(d.rate2)- yScale(d.rate1)
				if (update_range <= 50 && update_range >= -50 ) {
					return (0);
				} 
			})	
			
		nodes.selectAll(".arrow_link")
			.transition().delay(0).duration(transition_time).ease(ease_effect)
			.attr("transform",  function(d,i) {
				var update_range = yScale(d.rate2)- yScale(d.rate1)
				var offset = Math.sign(update_range)*14
				
				if (bool) {
					 offset = Math.sign(update_range)* (-27)
					if (update_range  > 50 || update_range  < -50 ) {
						return ( "translate(0," + (yScale(d.rate2) + offset)+ ")");
					}
					else {
						return ( "translate(0," + (yScale(d.rate1) -offset)+ ")");
					}
				}
				else {
					return ( "translate(0," + (yScale(d.rate1) -offset)+ ")");
				}				
			})
			
			
		nodes.selectAll(".text_percent")
			.transition().duration(transition_time).ease(ease_effect)
			.attr("transform",function(d,i) {
				if (bool) {
					var update_range = (yScale(d.rate2) + yScale(d.rate1)) / 2
				}
				else {
					var update_range = yScale(d.rate1)
				}
				return "translate(0," + (update_range) + ")";
			})
			.tween("text", function(d) {

				if(bool)
		      		var i = d3.interpolate( 0 , (d.rate2-d.rate1)/d.rate1 );
		      	else
		      		var i = d3.interpolate( (d.rate2-d.rate1)/d.rate1 , 0  );

		      	return function(t) {
		        	d3.select(this).text( d3.format("+.0%")(i(t)) );
		      	};
		    })
			.style("opacity",function() {
				if (bool) {
					return 1;
				}
				else {
					return 0;
				}
			});
	}

	function roundNumber( value ){
		var val =  Math.round( value * 10) / 10 ; 
		return val ; 
	}
			
	function update_scale() {
		
		document.getElementById('radio_old').disabled = true;
		document.getElementById('radio_new').disabled = true;
		

		d3.csv(file_use,
			
		function(d) {
		return {
			
			cancer_label : d.hdi_label,
			rate1: +d.rate1,
			rate2: +d.rate2,

			};	
		},		
		function(data) {
			
		bool = document.getElementById('check_scale').checked;	
		
		update_axis_scale(data, bool)
		update_circle_scale(data, bool)
			
		}
		)		
		
	}

	function update_axis_scale(data, bool) {
	

		var y_max1 = d3.max(data, function(d) {return d.rate1})
		var y_max2 = d3.max(data, function(d) {return d.rate2})
		var y_max = d3.max([y_max1,y_max2])
	
		var y_min1 = d3.min(data, function(d) {return d.rate1})
		var y_min2 = d3.min(data, function(d) {return d.rate2})
		var y_min = d3.min([y_min1,y_min2])

		
		if (bool) {
			
			var tick_list = tick_generator(y_max, y_min, true) 
			yScale = d3.scale.log().clamp(true)
				.domain([tick_list.value_bottom,tick_list.value_top]) 
				.range([var_height  ,0]);
			
		} 
		else {
			var tick_list = tick_generator(y_max, 0, false) // diff log scale
			yScale = d3.scale.linear() 
				.domain([0,tick_list.value_top]) 
				.range([var_height  ,0]);
		}	
		

		
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
			.tickFormat(d3.format(".1f"));
			
					
		var yAxis_minor = d3.svg.axis() 
			.scale(yScale)  
			.orient(axis_orient)
			.tickSize(-graph_width, 0,0)
			.tickPadding(12)
			.tickValues(tick_list.minor)	
			.tickFormat("")	;
					
		d3.select("#chart").selectAll(".yaxis")
			.transition().duration(transition_time).ease(ease_effect)  
			.call(yAxis); 

		d3.select("#chart").selectAll(".yaxis_minor")
			.transition().duration(transition_time).ease(ease_effect)
			.call(yAxis_minor);  
			
		var ygrid_major=d3.select(".bar_graph1").selectAll(".tick_major")
			.data(tick_list.major, function(d) { return d; })
			
		ygrid_major.transition().duration(transition_time).ease(ease_effect)
			.attr("y1", function(d) {return yScale(d); })
			.attr("y2", function(d) {return yScale(d); })
					
		ygrid_major.exit().remove()
			
		ygrid_major.enter()
			.append("line")
			.attr("class", "tick_major")
			.attr("stroke", "black")
			.attr("x2",  axis_tick2 )
		    .attr("x1", -axis_tick1)
			.attr("y1", function(d) { return yScale(d); })
			.attr("y2", function(d) { return yScale(d); })
			
		var ygrid_minor=d3.select(".bar_graph1").selectAll(".tick_minor")
			.data(tick_list.minor, function(d) { return d; })		
			
		 ygrid_minor.transition().duration(transition_time).ease(ease_effect)
			.attr("y1", function(d) { return yScale(d); })
			.attr("y2", function(d) { return yScale(d); })
		
		ygrid_minor.exit().remove()
					
		ygrid_minor.enter()
			.append("line")
			.attr("class", "tick_minor")
			.attr("stroke", "black")
			.attr("x2",  axis_tick2)
			.attr("x1", -axis_tick1)
			.attr("y2", function(d) { return yScale(d); })
			.attr("y1", function(d) { return yScale(d); })

	
	}
	
	function update_circle_scale(data, bool)  {
		
		graph_select = d3.select(".bar_graph1")
		data_temp = data
		
		bool_new = document.getElementById('radio_new').checked;

		
		graph_select.selectAll(".circle1")
			.data(data_temp)
			.transition().duration(transition_time).ease(ease_effect)
			.attr("transform", function(d, i) {return "translate(0," + (yScale(d.rate1)) + ")";}) 
 
		graph_select.selectAll(".arrow_link")
			.data(data_temp)
			.transition().duration(transition_time).ease(ease_effect)
			.attr("transform",  function(d,i) {
				var update_range = yScale(d.rate2)- yScale(d.rate1)
				var offset = Math.sign(update_range)*14
				if (bool_new) {
					 offset = Math.sign(update_range)* (-27)
					if (update_range  > 50 || update_range  < -50 ) {
						return ( "translate(0," + (yScale(d.rate2) + offset)+ ")");
					}
					else {
						return ( "translate(0," + (yScale(d.rate1) -offset)+ ")");
					}
				}
				else {
					return ( "translate(0," + (yScale(d.rate1) -offset)+ ")");
				}				
			})
			.style("opacity", function(d,i) {
				if (bool_new){
					var update_range = yScale(d.rate2)- yScale(d.rate1)
					if (update_range <= 50 && update_range >= -50 ) {
						return (0);
					} 
				}
			})	
			
		graph_select.selectAll(".line_link")
			.data(data_temp)
			.transition().duration(transition_time).ease(ease_effect)
			.attr("y1", function(d,i) {
				var update_range = yScale(d.rate2)- yScale(d.rate1)
				return (Math.sign(update_range)*20) + yScale(d.rate1)
			})
			.attr("y2", function(d,i) {
				update_range = yScale(d.rate2)- yScale(d.rate1)
				var offset = Math.sign(update_range)*(-20)
				
				if (bool_new) {
					offset = Math.sign(update_range)*(-25)
					if (update_range  > 50 || update_range  < -50 ) {
						return(yScale(d.rate2) + offset);
					} else {
						return(yScale(d.rate1) - offset);
					}
				}
				else {
					return(yScale(d.rate1) - offset);
				}
				
			})
			.style("opacity", function(d,i) {
				if (bool_new) {
					var update_range = yScale(d.rate2)- yScale(d.rate1)
					if (update_range <= 50 && update_range  >= -50 ) {
						return (0);
					} 
				}
				else {
					return(1)
				}
			})

		
			

		graph_select.selectAll(".circle2")
			.data(data_temp)
			.transition().duration(transition_time).ease(ease_effect)
			.attr("transform",function(d,i) {
				if (bool_new) {
					update_range = yScale(d.rate2)
				}
				else {
					update_range = yScale(d.rate1)
				}
				return "translate(0," + (update_range) + ")";
			});
			
		graph_select.selectAll(".text1")
			.data(data_temp)
			.transition().duration(transition_time).ease(ease_effect)
			.attr("transform", function(d, i) {return "translate(0," + (yScale(d.rate1)) + ")";})
			.style("opacity", function(d,i) {
				if (bool_new) {
					var update_range = yScale(d.rate2)- yScale(d.rate1)
					if (update_range  <= 25 && update_range  >= -25 ) {
						return (0);
					}
				}
				else {
					return (1);
				}
					
			});			
		
			
		graph_select.selectAll(".text2")
			.data(data_temp)
			.transition().duration(transition_time).ease(ease_effect)
			.attr("transform",function(d,i) {
				if (bool_new) {
					update_range = yScale(d.rate2)
				}
				else {
					update_range = yScale(d.rate1)
				}
				return "translate(0," + (update_range) + ")";
			});


			

		graph_select.selectAll(".text_percent")
			.data(data_temp)
			.transition().duration(transition_time).ease(ease_effect)
			.attr("x",function(d,i) {
				var update_range = yScale(d.rate2)- yScale(d.rate1)
				if (update_range  > 50 || update_range  < -50 ) {
					return 8;
				}
				else {
					return 22;
				}
			})
			.attr("transform",function(d,i) {
				if (bool_new) {
					var update_range = (yScale(d.rate2) + yScale(d.rate1)) / 2
				}
				else {
					var update_range = yScale(d.rate1)
				}
				return "translate(0," + (update_range) + ")";
			})
		.each("end", function() {
				document.getElementById('radio_old').disabled = false;
				document.getElementById('radio_new').disabled = false;
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
		
	function wordwrap(text, max) { // to wrap label (not from me, forget the link)
		var regex = new Regelastic(".{0,"+max+"}(?:\\s|$)","g");
		var lines = []
		var line
		while ((line = regex.exec(text))!="") {
			lines.push(line);
		} 
		return lines
	}
		

	

	
	
	
		
		
	
	
	
	