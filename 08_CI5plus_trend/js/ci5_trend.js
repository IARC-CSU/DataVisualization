


	function CI5_trend(bool_first) // generate heatmap 
	{	
		
		
		
		var bool_national = document.getElementById("check_regional").checked 
		console.log(bool_national)
	
		if (bool_national) {
			file_use = "data/CI5plus_asr_country.csv"; 
			document.getElementById("input_country").placeholder = "Add a country"
		} 
		else {
			file_use = "data/CI5plus_asr_registry.csv"; 
			document.getElementById("input_country").placeholder = "Add a registry"
		}
	
	
		if (!bool_first) {
	
			// get value do default
			active_cancer = "All cancers excluding non-melanoma skin";
			active_sex = 1;
			regional = 0;

			// delete all nodes 
			
			var bar_graph= d3.select("#chart").select(".bar_graph");
			var graph = bar_graph.selectAll(".nodes");
			graph.remove()
			
			//
			while (document.getElementById("country_element").firstChild) {
				document.getElementById("country_element").removeChild(document.getElementById("country_element").firstChild);
			}
			
			bar_graph.selectAll(".regional_text")
				.transition().duration(transition_time).ease(ease_effect)  
				.attr("opacity", 0)
								
			
		}
		
		


		d3.csv(file_use,
			
			function(d) {
			return {
				
				sex : +d.sex,
				year: +d.year,
				cancer_label : d.cancer_label,
				country_label : d.country_label,
				asr: +d.asr,
				smoothed: +d.smoothed
				};	
			},		
			function(data) {
					
				
				
				
				var data_country = d3.nest()
					.key(function(d) {return d.country_label;})
					.sortKeys(d3.ascending)
					.entries(data);
					
				var data_cancer_temp = data.filter(function(d){
					return (d.sex == 1);
				});
					
				var data_cancer = d3.nest()
					.key(function(d) {return d.cancer_label;})
					.sortKeys(d3.ascending)
					.entries(data_cancer_temp);
				
				country_list = [];
				
				for (var i = 0; i < data_country.length; i += 1) {
					country_list.push(data_country[i].key);
				}

				awesomplete2.list = country_list;
				
				cancer_list = [];
				for (var j = 0; j < data_cancer.length; j += 1) {
					cancer_list.push(data_cancer[j].key);
				}

				awesomplete1.list = cancer_list;
				
				//filter data 
				var data_temp = data.filter(function(d){
					return (d.sex == 1 & d.cancer_label == active_cancer);
				});
				
				
				// create graph
								
				if (bool_first) {
					var bar_graph= // create array with both bargraph
					d3.select("#chart").append("svg") // draw main windows
						.attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.top + margin.bottom)
						.append("g")
						.attr("class", "bar_graph")	
						.attr("transform", "translate(" + margin.left_page   + "," + margin.top_page  + ")"); 
				
						
					bar_graph.append("text")
							.attr("class","regional_text")
							.attr("text-anchor", "end")
							.attr("transform", "translate(" +(graph_width) + "," +(graph_height+ 60) + ")")
							.text("*: Regional registries")
							.attr("opacity", 0)
							.attr("dy", "0.15em")
							
					


					add_axis_title(bar_graph,data_temp);
				}

			
			
			div_left_panel.style.opacity = 1;
			
		}).on("progress", function(event){

			div_left_panel.style.opacity = 0.5;
			 
		});
	}

	
	
	function add_axis_title(graph,data) { 


		var y_max = d3.max(data, function(d) {return d.smoothed})
		var y_min = d3.min(data, function(d) {return d.smoothed})
		var tick_list = tick_generator(y_max, y_min, true)

		yScale.domain([tick_list.value_bottom,tick_list.value_top]); // update xscale domain
		
		
		var x_max = d3.max(data, function(d) {return d.year})
		var x_min = d3.min(data, function(d) {return d.year})
		
		
		var tick_year_list = tick_year_generator(x_max, x_min)

		xScale.domain([tick_year_list.value_bottom,tick_year_list.value_top]); // update xscale domain

		axis_tick_major = 8
		axis_tick_minor = 5
		axis_tick2 = 0
		
		


		var yAxis = d3.svg.axis() 
			.scale(yScale)
			.orient("left")
			.tickSize(-graph_width, 0,0)
			.tickPadding(12)
			.tickValues(tick_list.major)	
			.tickFormat(d3.format(""));
			
					
	    var yAxis_minor = d3.svg.axis() 
			.scale(yScale)  
			.orient("left")
			.tickSize(-graph_width, 0,0)
			.tickPadding(12)
			.tickValues(tick_list.minor)	
			.tickFormat("")	;
			
		var xAxis = d3.svg.axis() 
			.scale(xScale)
			.orient("bottom")
			.tickSize(-graph_height-20, 0,0)
			.tickPadding(12)
			.tickValues(tick_year_list.major)	
			.tickFormat(d3.format(""));
			
	    var xAxis_minor = d3.svg.axis() 
			.scale(xScale)  
			.orient("bottom")
			.tickSize(-graph_height-20, 0,0)
			.tickPadding(12)
			.tickValues(tick_year_list.minor)	
			.tickFormat("")	;	
			
			
			
		var yAxis_tick = d3.svg.axis() 
			.scale(yScale)
			.orient("left")
			.tickSize(8, 0,0)
			.tickPadding(12)
			.tickValues(tick_list.major)
			.tickFormat("");			

	    var yAxis_minor_tick = d3.svg.axis() 
			.scale(yScale)  
			.orient("left")
			.tickSize(5, 0,0)
			.tickPadding(12)
			.tickValues(tick_list.minor)	
			.tickFormat("");

			
		var xAxis_tick = d3.svg.axis() 
			.scale(xScale)
			.orient("bottom")
			.tickSize(8, 0,0)
			.tickPadding(12)
			.tickValues(tick_year_list.major)
			.tickFormat("");			

			
	    var xAxis_minor_tick = d3.svg.axis() 
			.scale(xScale)  
			.orient("bottom")
			.tickSize(5, 0,0)
			.tickPadding(12)
			.tickValues(tick_year_list.minor)
			.tickFormat("");			


		
		graph.append("g") // draw axis major
			.attr("class", "yaxis ")
			.attr("transform", "translate(" + (0)+ "," +(0) + ")")
			.call(yAxis);
			
		graph.append("g") // draw axis major
			.attr("class", "xaxis ")
			.attr("transform", "translate(" + (0)+ "," +(graph_height+10) + ")")
			.call(xAxis);

		graph.append("g") // draw axis minor
			.attr("class", "yaxis_minor ")
			.attr("transform", "translate(" + (0)+ "," +(0) + ")")
			.call(yAxis_minor);
			
		graph.append("g") // draw axis minor
			.attr("class", "xaxis_minor ")
			.attr("transform", "translate(" + (0)+ "," +(graph_height+10) + ")")
			.call(xAxis_minor);
				
		graph.append("g") // draw axis major
			.attr("class", "yaxis_tick")
			.attr("transform", "translate(" + (0)+ "," +(0) + ")")
			.call(yAxis_tick);
			
		graph.append("g") // draw axis major
			.attr("class", "xaxis_tick")
			.attr("transform", "translate(" + (0)+ "," +(graph_height+10) + ")")
			.call(xAxis_tick);

		graph.append("g") // draw axis minor
			.attr("class", "yaxis_minor_tick")
			.attr("transform", "translate(" + (0)+ "," +(0) + ")")
			.call(yAxis_minor_tick);
			
		graph.append("g") // draw axis minor
			.attr("class", "xaxis_minor_tick")
			.attr("transform", "translate(" + (0)+ "," +(graph_height+10) + ")")
			.call(xAxis_minor_tick);
				
		
		
			
		
		graph.append("line") // add line for y = 0
			.style("stroke", "black")  
			.attr("x1", 0)
			.attr("y1", graph_height+10)  
			.attr("x2", graph_width)
			.attr("y2", graph_height+10);  
			
		graph.append("line") // add line for x = 0
			.style("stroke", "black")  
			.attr("x1", 0)
			.attr("y1", -10)  
			.attr("x2",0)
			.attr("y2", graph_height+10);  
			
		graph.append("text") // add y axis subtitle
				.attr("class", "y_title")
				.attr("text-anchor", "middle")
				.attr("transform", "translate(-60," +graph_height/2 + ") rotate(-90)")
				.text("Age standardized (W) incidence rate per 100,000")
				
		graph.append("text") // add x axis subtitle
				.attr("class", "x_title")
				.attr("text-anchor", "middle")
				.attr("transform", "translate(" +(graph_width/2) + "," +(graph_height+ 60) + ")")
				.text("Year")
				
		graph.append("text") // add x axis subtitle
				.attr("class", "graph_title")
				.attr("text-anchor", "middle")
				.attr("transform", "translate(" +(graph_width/2) + "," +(-50) + ")")
				.text("All cancers excluding non-melanoma skin")
				
		graph.append("text") // add x axis subtitle
				.attr("class", "graph_subtitle")
				.attr("text-anchor", "middle")
				.attr("transform", "translate(" +(graph_width/2) + "," +(-20) + ")")
				.text("Male")
				
		
	

			 			
	}
	

	
	function add_country(label_input, cancer_input, sex_input) {
		
		var country_element = document.getElementById("country_element").children;
		var bool_unique = true 
		
	
		
		for (var i = 0; i < country_element.length; i++) {
			if (country_element[i].getAttribute('label') == label_input) {
				bool_unique = false 
			} 
		}
		
		if (bool_unique) {
			var temp_li = document.createElement("li");
			temp_li.setAttribute("class", "select_country");
			temp_li.setAttribute("label", label_input);
			
			//var temp_span = document.createElement("span");
			//temp_span.setAttribute("class", "select_remove");
			//temp_span.innerHTML = "x";
			

			temp_li.innerHTML = label_input;
			//temp_li.insertAdjacentHTML('afterbegin', temp_span);
			
			document.getElementById("country_element").appendChild(temp_li)
		
		
			
			

			d3.csv(file_use,
				
				function(d) {
				return {
					
					sex : +d.sex,
					year: +d.year,
					cancer_label : d.cancer_label,
					country_label : d.country_label,
					asr: +d.asr,
					smoothed: +d.smoothed,
					national: +d.national
					};	
				},		
				function(data) {
					
					//filter data 
					var data_temp = data.filter(function(d){
						return (d.sex == sex_input & d.cancer_label == cancer_input & d.country_label == label_input)
					});
					
					var data_nest=d3.nest()
						.key(function(d) {return d.country_code;})
						.sortKeys(d3.ascending)
						.key(function(d) {return d.year;})
						.sortKeys(d3.ascending)
						.entries(data_temp)
					

											
					var bar_graph=d3.select("#chart").select(".bar_graph")
					
					var nb_country = country_element.length -1
					country_list = [];
					for (var i = 0; i <= nb_country; i += 1) { 
						country_list.push(country_element[i].innerHTML)
						
					}
					
					
					
					var data_country = data.filter(function(d){
						return (d.sex == sex_input & d.cancer_label == cancer_input & country_list.includes(d.country_label))
					});
					
					update_scale(bar_graph, data_country)
					
					
					
					if (country_list.length > 1) {
						
						country_list.pop();
						
						var data_country_old = data.filter(function(d){
							return (d.sex == sex_input & d.cancer_label == cancer_input & country_list.includes(d.country_label))
						});
						
					
						
						
						var data_update=d3.nest()
							.key(function(d) { return d.country_label; }).sortKeys(function(a,b) { return country_list.indexOf(a) - country_list.indexOf(b); })
							.key(function(d) {return d.year;}).sortKeys(d3.ascending)
							.entries(data_country_old)
							
						
						
						
						update_trend(bar_graph, data_update)
						
					}
					
					

					var nodes = bar_graph.append("g")
						.attr("id","nodes_id")
						.attr("class", function(d,i) { return "nodes" + " nodes_" + label_input.replace(/[^a-z]/g, '');} )
						.selectAll()
						.data(data_nest)
						.enter()
						.append("g")
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
					
					var nat = data_nest[0].values[0].values[0].national
					if (nat == 0 ) {
						label_input = label_input + "*"
						regional = regional + 1 
						
						bar_graph.selectAll(".regional_text")
							.transition().duration(transition_time).ease(ease_effect)  
							.attr("opacity", 1)
					}
					
					setTimeout(function() {
					 nodes.append("text")
						.attr("class","country_label")
						.attr("x", function (d) {
							nb_year = d.values.length;
							temp = d.values[nb_year-1].values[0];	
							return (xScale(temp.year+1));
						})
						.attr("y", function (d) {
							nb_year = d.values.length;
							temp = d.values[nb_year-1].values[0];	
							return (yScale(temp.smoothed));
						})
						.text(label_input.replace(/_/, ', '))
						.attr("dy", "0.15em")
						.call(drag)
					}, transition_time)
					
					

			
					


					
		div_left_panel.style.opacity = 1;
			
		}).on("progress", function(event){

			div_left_panel.style.opacity = 0.5;
			 
		});
			
			
			
		}
	}
		
	function remove_country(label_input, cancer_input, sex_input) {
		
		
		var country_element = document.getElementById("country_element").children;
		var nb_country = country_element.length -1
		country_list = [];
		for (var i = 0; i <= nb_country; i += 1) { 
			country_list.push(country_element[i].innerHTML)
			
		}
		
		// remove element
		
		var bar_graph= d3.select("#chart").select(".bar_graph")
		var graph_all = bar_graph.selectAll(".nodes");
		
		graph_all.attr("opacity",1)
		
		var graph = bar_graph.selectAll(".nodes_" + label_input.replace(/[^a-z]/g, ''));
		
		
		var temp_label = graph[0][0].textContent
		
		if (temp_label.includes("*")) {
			regional = regional - 1 ;
		}
		
		
		if (regional  == 0) {
			bar_graph.selectAll(".regional_text")
				.transition().duration(transition_time).ease(ease_effect)  
				.attr("opacity", 0)
		}
		
		graph.remove();


		// update scale
		
		if (country_list.length > 0) {
		

			d3.csv(file_use,
				
				function(d) {
				return {
					
					sex : +d.sex,
					year: +d.year,
					cancer_label : d.cancer_label,
					country_label : d.country_label,
					asr: +d.asr,
					smoothed: +d.smoothed
					};	
				},		
				function(data) {
					

					// create graph
											
					var bar_graph=d3.select("#chart").select(".bar_graph")
					
	
					
					var data_country = data.filter(function(d){
						return (d.sex == sex_input & d.cancer_label == cancer_input & country_list.includes(d.country_label))
					});
					
					update_scale(bar_graph, data_country)
					
					// update other countries
						
						
					if (country_list.length > 0) {
						
						var data_update=d3.nest()
							.key(function(d) { return d.country_label; }).sortKeys(function(a,b) { return country_list.indexOf(a) - country_list.indexOf(b); })
							.key(function(d) {return d.year;}).sortKeys(d3.ascending)
							.entries(data_country)
						
	
						update_trend(bar_graph, data_update)
						
					}			

				}
			)
			
		}
	
		
	}
	
	function highlight_country(label_input, bool) {
		
		var op  = 1
		if (bool) {
			op = 0.25
		}
		
		var bar_graph= d3.select("#chart").select(".bar_graph");
		var graph = bar_graph.selectAll(".nodes:not(.nodes_" + label_input.replace(/[^a-z]/g, '') + ")");

		graph.attr("opacity", op)
		
		
	}
	

	
	function update_cancer(label_input,sex_input) {
		
		sex_label = "Male";
		if (sex_input == 2 ) {
			sex_label = "Female";;
		}
		
		var country_element = document.getElementById("country_element").children;
		

		d3.csv(file_use,
			
			function(d) {
			return {
				
				sex : +d.sex,
				year: +d.year,
				cancer_label : d.cancer_label,
				country_label : d.country_label,
				asr: +d.asr,
				smoothed: +d.smoothed
				};	
			},		
			function(data) {
				
														
				var bar_graph=d3.select("#chart").select(".bar_graph")
				
				var nb_country = country_element.length-1

				country_list = [];
				for (var i = 0; i <= nb_country; i += 1) { 
					country_list.push(country_element[i].innerHTML)
					
				}

				
				if (country_list.length > 0) {
					var data_country = data.filter(function(d){
						return (d.sex == sex_input & d.cancer_label == label_input & country_list.includes(d.country_label))
					});
				
					update_scale(bar_graph, data_country)
				
					var data_update=d3.nest()
						.key(function(d) { return d.country_label; }).sortKeys(function(a,b) { return country_list.indexOf(a) - country_list.indexOf(b); })
						.key(function(d) {return d.year;}).sortKeys(d3.ascending)
						.entries(data_country)
						
					update_trend(bar_graph, data_update)
					
				
					
				}
				bar_graph.selectAll(".graph_title") // add x axis subtitle
					.text(active_cancer)
				bar_graph.selectAll(".graph_subtitle") // add x axis subtitle
					.text(sex_label)
			}
					
		)
}
		
		
	function update_sex(sex_input, cancer_input) {
		
		label_input = "Male";
		if (sex_input == 2 ) {
			label_input = "Female";;
		}
		
		
		var country_element = document.getElementById("country_element").children;
		
		// update of cancer label list
		
		var bar_graph=d3.select("#chart").select(".bar_graph")

		d3.csv(file_use,
			
			function(d) {
			return {
				
				sex : +d.sex,
				year: +d.year,
				cancer_label : d.cancer_label,
				country_label : d.country_label,
				asr: +d.asr,
				smoothed: +d.smoothed
				};	
			},		
			function(data) {
					
					
				var data_cancer_temp = data.filter(function(d){
					return (d.sex == sex_input)
				});
					
				var data_cancer = d3.nest()
					.key(function(d) {return d.cancer_label;})
					.sortKeys(d3.ascending)
					.entries(data_cancer_temp)
				
				cancer_list = [];
				for (var i = 0; i < data_cancer.length; i += 1) {
					cancer_list.push(data_cancer[i].key)
				}

				awesomplete1.list = cancer_list;
				
				console.log(cancer_list)
				console.log(cancer_input)
				
				if (!cancer_list.includes(cancer_input)) {
					
					active_cancer = "All cancers excluding non-melanoma skin";
					cancer_input  = active_cancer
					
				}
				
				bar_graph.selectAll(".graph_title") // add x axis subtitle
					.text(active_cancer)
				bar_graph.selectAll(".graph_subtitle") // add x axis subtitle
					.text(label_input)
				
				// update scale 
				
				
				var nb_country = country_element.length-1

				country_list = [];
				for (var i = 0; i <= nb_country; i += 1) { 
					country_list.push(country_element[i].innerHTML)
					
				}

				
				if (country_list.length > 0) {
					var data_country = data.filter(function(d){
						return (d.sex == sex_input & d.cancer_label == cancer_input & country_list.includes(d.country_label))
					});
				
					update_scale(bar_graph, data_country)
				
					var data_update=d3.nest()
						.key(function(d) { return d.country_label; }).sortKeys(function(a,b) { return country_list.indexOf(a) - country_list.indexOf(b); })
						.key(function(d) {return d.year;}).sortKeys(d3.ascending)
						.entries(data_country)
						
					update_trend(bar_graph, data_update)
					
				
					
				}
				
				
			});
	
		

	}
		
		
	function update_scale (graph, data) {
		

		var y_max = d3.max(data, function(d) {return d.smoothed})
		var y_min = d3.min(data, function(d) {return d.smoothed})
		var tick_list = tick_generator(y_max, y_min, true)
		

		
		yScale.domain([tick_list.value_bottom,tick_list.value_top]); // update xscale domain
		
		
		var x_max = d3.max(data, function(d) {return d.year})
		var x_min = d3.min(data, function(d) {return d.year})
		
		
		var tick_year_list = tick_year_generator(x_max, x_min)

		xScale.domain([tick_year_list.value_bottom,tick_year_list.value_top]); // update xscale domain

		
	
		axis_y = graph_height
		axis_tick_major = 8
		axis_tick_minor = 5
		
		


		var yAxis = d3.svg.axis() 
			.scale(yScale)
			.orient("left")
			.tickSize(-graph_width, 0,0)
			.tickPadding(12)
			.tickValues(tick_list.major)	
			.tickFormat(function(d) {
				return d3.format("0.3f")(d).replace(/\.?0+$/,"")	
			});
			
					
	    var yAxis_minor = d3.svg.axis() 
			.scale(yScale)  
			.orient("left")
			.tickSize(-graph_width, 0,0)
			.tickPadding(12)
			.tickValues(tick_list.minor)	
			.tickFormat("")	;
			
		var xAxis = d3.svg.axis() 
			.scale(xScale)
			.orient("bottom")
			.tickSize(-graph_height-20, 0,0)
			.tickPadding(12)
			.tickValues(tick_year_list.major)	
			.tickFormat(d3.format(""));
			
	    var xAxis_minor = d3.svg.axis() 
			.scale(xScale)  
			.orient("bottom")
			.tickSize(-graph_height-20, 0,0)
			.tickPadding(12)
			.tickValues(tick_year_list.minor)	
			.tickFormat("")	;	
			
		var yAxis_tick = d3.svg.axis() 
			.scale(yScale)
			.orient("left")
			.tickSize(8, 0,0)
			.tickPadding(12)
			.tickValues(tick_list.major)
			.tickFormat("");			

	    var yAxis_minor_tick = d3.svg.axis() 
			.scale(yScale)  
			.orient("left")
			.tickSize(5, 0,0)
			.tickPadding(12)
			.tickValues(tick_list.minor)	
			.tickFormat("");

			
		var xAxis_tick = d3.svg.axis() 
			.scale(xScale)
			.orient("bottom")
			.tickSize(8, 0,0)
			.tickPadding(12)
			.tickValues(tick_year_list.major)
			.tickFormat("");			

			
	    var xAxis_minor_tick = d3.svg.axis() 
			.scale(xScale)  
			.orient("bottom")
			.tickSize(5, 0,0)
			.tickPadding(12)
			.tickValues(tick_year_list.minor)
			.tickFormat("");			

			
				
		graph.selectAll( ".yaxis")
		.transition().duration(transition_time).ease(ease_effect)  
		.call(yAxis);
				
		graph.selectAll( ".xaxis")
		.transition().duration(transition_time).ease(ease_effect)  
		.call(xAxis);
				
		graph.selectAll( ".yaxis_minor")
		.transition().duration(transition_time).ease(ease_effect)  
		.call(yAxis_minor);
		
		graph.selectAll( ".xaxis_minor")
		.transition().duration(transition_time).ease(ease_effect)  
		.call(xAxis_minor);
		
		graph.selectAll( ".yaxis_tick")
		.transition().duration(transition_time).ease(ease_effect)  
		.call(yAxis_tick);
				
		graph.selectAll( ".xaxis_tick")
		.transition().duration(transition_time).ease(ease_effect)  
		.call(xAxis_tick);
				
		graph.selectAll( ".yaxis_minor_tick")
		.transition().duration(transition_time).ease(ease_effect)  
		.call(yAxis_minor_tick);
		
		graph.selectAll( ".xaxis_minor_tick")
		.transition().duration(transition_time).ease(ease_effect)  
		.call(xAxis_minor_tick);
			

		
	}
	
	function update_trend (graph, data) {
		
		graph.selectAll(".trend")
		.data(data)
		.transition().duration(transition_time).ease(ease_effect)
		.attr("d", function(d, i){
			return lineFunction(d.values)
			})
		.attr("stroke", function(d, i){
			return color_scale_10(i)
			})
		.attr("stroke-width", 2)
		.attr("fill", "none")
		.attr("stroke-dasharray", function(d) {
		});
			
		 graph.selectAll(".country_label")
		.data(data)
		.transition().duration(transition_time).ease(ease_effect)
		.attr("x", function (d) {
			nb_year = d.values.length;
			temp = d.values[nb_year-1].values[0];	
			return (xScale(temp.year+1));
		})
		.attr("y", function (d) {
			nb_year = d.values.length;
			temp = d.values[nb_year-1].values[0];	
			return (yScale(temp.smoothed));
		})
	
		
	}

	function update_grid(graph, axe_class,scale,tick_class,tick_values,axes, z1,z2) {

	graph.selectAll(axe_class)
		.transition().duration(transition_time).ease(ease_effect)  
		.call(scale);
	

	var grid = graph.selectAll(tick_class)
		.data(tick_values, function(d) {
			return d;
			})
		
	if (axes == 2) {
		

		grid.exit().remove()
		
		grid.transition().duration(transition_time).ease(ease_effect)
				.attr("y1", function(d) {return yScale(d); })
				.attr("y2", function(d) {return yScale(d); })
			
		
		
		grid.enter()
			.append("line")
			.attr("class", tick_class)
			.attr("stroke", "black")
			.attr("x1", z1)
			.attr("x2", z2 )
			.attr("y1", function(d) { return yScale(d); })
			.attr("y2", function(d) { return yScale(d); })
			
	} else {
		
		

		grid.exit().remove()
		
		grid.transition().duration(transition_time).ease(ease_effect)
			.attr("x1", function(d) {return xScale(d); })
			.attr("x2", function(d) {return xScale(d); })
			
		
		
		grid.enter()
			.append("line")
			.attr("class", tick_class)
			.attr("stroke", "black")
			.attr("y1", z1)
			.attr("y2", z2 )
			.attr("x1", function(d) { return xScale(d); })
			.attr("x2", function(d) { return xScale(d); })
	
	}

	
			
	

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
		} 
		else {
		
		
			var temp = 0;
			var log_min = Math.pow(10,Math.floor(Math.log10(value_min))); // order of magnitude of min (power of 10)
			var unit_floor_min = Math.floor(value_min/log_min) // left digit of min 
			
			console.log("tick_info")
			console.log(log_min)
			console.log(log_max)
			console.log(unit_floor_min)
			console.log(unit_floor_max)
			console.log("end")
			
			if (log_min == log_max) { // if min and max same magnitude
			
				for (var i = unit_floor_min; i <= unit_floor_max+1; i++) {
					
					temp = i*log_min;
					tick_list.major.push(temp); // add major tick for ech unit (20,30,40, etc..)
				}

			
				if (unit_floor_min == unit_floor_max) { // min and max same first digit 
					
					
					
					for (var i = 0; i <= 9; i++) { 
						temp = (i*log_min/10); 
						temp = (unit_floor_min*log_min) + temp;
						tick_list.minor.push(temp);
						if (i % 2 == 0 ) {
							tick_list.major.push(temp);
						}
					}
				}
				else {

					for (var i = 0; i <= ((unit_floor_max-unit_floor_min+1)*10)-1; i++) { // minor ticks for every unit/10 for 2 first unit (ie 20,21,22,23,..., 38,39)
						temp = (i*log_min/10); 
						temp = (unit_floor_min*log_min) + temp;
						tick_list.minor.push(temp);
						if (i < 20 ) {
							if (i % 2 == 0) {
								tick_list.major.push(temp);
							}
						} 
						else {
							if (i % 5 == 0) {
								tick_list.major.push(temp);
							}
							
						}
						
						
					}
				}

			}
			else if ((log_max/log_min) == 10){  //if max and min difference magnitude < 100
				// major ticks
				if (unit_floor_min < 5) { // 
					
					tick_list.major.push(unit_floor_min*log_min);
					tick_list.major.push(5*log_min);
					tick_list.major.push(7*log_min);
					tick_list.major.push(15*log_min);
					
					
				} else if (unit_floor_min == 5){
					tick_list.major.push(unit_floor_min*log_min);
					tick_list.major.push(7*log_min);
					tick_list.major.push(15*log_min);
					
				}
				else {
					tick_list.major.push((unit_floor_min)*log_min);
				}
				// minor ticks

				
				for (var i = unit_floor_min; i <= 29; i++) {
					
					temp = (i*log_min); 
					tick_list.minor.push(temp);
				}
				
				log_min = log_min*10
				

				for (var i = 1; i <= unit_floor_max; i++) {

					temp = (i*log_min + (log_min/2)); 
					tick_list.minor.push(temp);
					tick_list.major.push(temp);
		
				}


				for (var i = 1; i <= unit_floor_max+1; i++) {
					temp = (i*log_max); 
					tick_list.major.push(temp);
				}
				
				
				
			} 
			else { //if max and min difference magnitude > 100
				
				
				log_min = log_min*10;
				for (var i = 1; i <= 9; i++) {
					tick_list.major.push(i*log_min);
					
				}
				
				for (var i = 1; i <= ((unit_floor_max+1)*10)-1; i++) {
					tick_list.minor.push(i*log_min);
					if (i%5 == 0) {
						tick_list.major.push(i*log_min);
					}
					
					
					
				}
				
				while (log_min != (log_max/10)) {
					
					log_min = log_min*10;
					tick_list.major.push(log_min);
					tick_list.major.push(2*log_min);
					tick_list.major.push(5*log_min);
					
					for (var i = 2; i <= ((unit_floor_max+1)*10)-1; i++) {
						
						
						if  (i <= 5) {
							temp = (i*log_min); 
							tick_list.minor.push(temp);
						} else {
							
							if (i%5 == 0) {
								
							temp = (i*log_min); 
							tick_list.minor.push(temp);
								
							}
							
						}
					}	
				}
				
				for (var i = 2; i <= unit_floor_max+1; i++) {
					if  (i <= 5) {
						temp = (i*log_min); 
						tick_list.minor.push(temp);
					} else {
						
						if (i %5 == 0) {
							
						temp = (i*log_min); 
						tick_list.minor.push(temp);
							
						}
						
					}
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
		
		
		temp = Math.ceil(value_max/(log_max/10)) * (log_max/10) 
		

		
		tick_list.major = tick_list.major.filter(function(item) { 
			return item <= temp;
		})
		
		tick_list.minor = tick_list.minor.filter(function(item) { 
			return item <= temp;
		})
		
		
			
		var max_major = tick_list.major[tick_list.major.length-1];
		var max_minor = tick_list.minor[tick_list.minor.length-1];
		
		var min_major = tick_list.major[0];
		var min_minor = tick_list.minor[0]			
		
		tick_list.value_top = Math.max(max_major,max_minor,temp)	
		tick_list.value_bottom = Math.min(min_major,min_minor,value_min)	
		}
		
		// 
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
            .duration(transition_time)
            .attrTween("stroke-dasharray", tweenDash);
    }
    function tweenDash() {
        var l = this.getTotalLength(),
            i = d3.interpolateString("0," + l, l + "," + l);
        return function (t) { return i(t); };
    }
	

