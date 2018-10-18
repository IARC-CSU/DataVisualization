
	function load_data() {

	}
	

	function clear_node() {
		
		var bar_graph=d3.select("#chart").select(".bar_graph")
		var trend_element = document.getElementById("trend_element").children;
		
		// delete all nodes
			var graph = bar_graph.selectAll(".nodes");
			graph.remove()
			
		// delete tag element 
					while (document.getElementById("trend_element").firstChild) {
				document.getElementById("trend_element").removeChild(document.getElementById("trend_element").firstChild);
			}
		
		regional = 0;
		
		if (!bool_switch) {
			bar_graph.selectAll(".regional_text")
				.transition().duration(transition_time).ease(ease_effect)  
				.attr("opacity", 0)
		}


		
		
	}

	function switch_national() {
		
		var bool_national = document.getElementById("check_regional").checked; 
		update_placeholder(bool_switch, bool_national) 
		
		var bar_graph= d3.select("#chart").select(".bar_graph");
			
		if (bool_national) {
				var data = data_country;
				var active_temp = "Australia";
				title_label = active_temp + "*"
				var op = 1
				
			}
			else {
				var data = data_registry;
				var active_temp = "Australia_NSW_ACT"
				title_label = active_temp
				var op = 0
			}
		
		if (bool_switch) {
			active_title = active_temp
			
		} else {
			active_trend = active_temp
			title_label = active_title
		
			
		}
		bar_graph.selectAll(".graph_title") // add x axis subtitle
				.text(title_label)
		
		regional = 0;

		// delete all nodes 
		
	
		var graph = bar_graph.selectAll(".nodes");
		graph.remove()
		
		//
		while (document.getElementById("trend_element").firstChild) {
			document.getElementById("trend_element").removeChild(document.getElementById("trend_element").firstChild);
		}
		
		bar_graph.selectAll(".regional_text")
			.transition().duration(transition_time).ease(ease_effect)  
			.attr("opacity", op)		
				
		var data_trend_temp = data.filter(function(d){
			return (d.sex == active_sex);
		});
		
		var data_trend = d3.nest()
			.key(function(d) {return d[varname_trend];})
			.sortKeys(d3.ascending)
			.entries(data_trend_temp);
			
		var data_title_temp = data.filter(function(d){
			return (d.sex == active_sex);
		});
			
		var data_title = d3.nest()
			.key(function(d) {return d[varname_title];})
			.sortKeys(d3.ascending)
			.entries(data_title_temp);
		
		trend_list = [];
		
		for (var i = 0; i < data_trend.length; i += 1) {
			trend_list.push(data_trend[i].key);
		}

		awesomplete2.list = trend_list;
		
		title_list = [];
		for (var j = 0; j < data_title.length; j += 1) {
			title_list.push(data_title[j].key);
		}

		awesomplete1.list = title_list;

		
	}
	
	
	function add_top(nb_top,type ) {
		
		var bar_graph=d3.select("#chart").select(".bar_graph")
		var trend_element = document.getElementById("trend_element").children;
		var bool_national = document.getElementById("check_regional").checked; 
		
		// remove all nodes
		
		if (!bool_national) {
			var data = data_registry;
		}
		else {
			var data = data_country;
		}
				
		var data_trend = data.filter(function(d){
			return (d.sex == active_sex & d[varname_title] == active_title)
		});
		

		
		var data_sort=d3.nest()
			.key(function(d) { return d[varname_trend]; })
			.rollup(function(v) {
				

				
				var temp = Math.max(0,v.length-10)
				var temp2 = v.length-temp 
				
				return  {
					eapc: 100*(Math.pow(v[v.length-1].value / v[temp].value, 1/[temp2])-1),
					last: v[v.length-1].value
				};
			})
			.entries(data_trend)
			
		
		if (type == 1) {
			data_sort.sort(function(a, b){ return d3.descending(a.values.last, b.values.last); });
		}
		else if (type == 2){
			data_sort.sort(function(a, b){ return d3.descending(a.values.eapc, b.values.eapc); });
		} 
		else if (type == 3){
			data_sort.sort(function(a, b){ return d3.ascending(a.values.eapc, b.values.eapc); });
		} 
		
		
					
		// add new trend from data_sort to top _list
		var nb_trend = trend_element.length -1
		var trend_list = [];
		for (var i = 0; i <= nb_trend; i += 1) { 	
			trend_list.push(trend_element[i].getAttribute('label'))
		}
		
		var top_list = [];
		
		if (bool_switch) {
			var start = 1; 
		} 
		else {
			var start = 0;
		}
		
		for (var i = start; i < nb_top+ start; i += 1) {
			
			if (!trend_list.includes(data_sort[i].key)) {
				top_list.push(data_sort[i].key);
			}
		}
						
		// add new tag
		for (var i = 0; i < top_list.length; i += 1) {
			add_tag(top_list[i])
		}
		
		
		active_trend = top_list[0];
		
		// create data for scale
		nb_trend = trend_element.length -1
		trend_list = [];
		for (var i = 0; i <= nb_trend; i += 1) { 	
			trend_list.push(trend_element[i].getAttribute('label'))
		}
		
		var data_trend = data.filter(function(d){
			return (d.sex == active_sex & d[varname_title] == active_title & trend_list.includes(d[varname_trend]))
		});
			
		update_scale(bar_graph, data_trend)
		
		// add new data 
		if (trend_list.length > nb_top) {
				
			trend_list.pop();
			
			var trend_old = trend_list.slice(0,trend_list.length-top_list.length+1);
				
			var data_trend_old = data.filter(function(d){
				return (d.sex == active_sex & d[varname_title] == active_title & trend_old.includes(d[varname_trend]))
			});
						

			update_trend(bar_graph, data_trend_old)
				
		}
			
		var data_temp = data.filter(function(d){
			return (d.sex == active_sex & d[varname_title] == active_title & top_list.includes(d[varname_trend]))
		});
		
		
		add_node(bar_graph,data_temp)
		
				
	
		
	}
	

	function switch_input_field() {

		bool_switch = !bool_switch 
		var bool_national = document.getElementById("check_regional").checked; 
		var bar_graph= d3.select("#chart").select(".bar_graph");
	
		regional = 0;
		
		var temp = active_trend
		active_trend = active_title
		active_title = temp
		
		temp = varname_title
		varname_title = varname_trend
		varname_trend = temp

				
		update_placeholder(bool_switch, bool_national)
				
		// delete all nodes
		var graph = bar_graph.selectAll(".nodes");
		var nb_node = graph[0].length;
		graph.remove()
			
		// delete tag element 
		while (document.getElementById("trend_element").firstChild) {
			document.getElementById("trend_element").removeChild(document.getElementById("trend_element").firstChild);
		}
		
		
		if (!bool_national) {
			var data = data_registry;
			
		}
		else {
			var data = data_country;
		}
		
		console.log(data)
	
		var data_temp = data.filter(function(d){
			return (d.sex == active_sex);
		});
		
		
		var data_trend = d3.nest()
			.key(function(d) {return d[varname_trend];})
			.sortKeys(d3.ascending)
			.entries(data_temp);
			

			
		var data_title = d3.nest()
			.key(function(d) {return d[varname_title];})
			.sortKeys(d3.ascending)
			.entries(data_temp);
		
		trend_list = [];
		
		for (var i = 0; i < data_trend.length; i += 1) {
			trend_list.push(data_trend[i].key);
		}

		awesomplete2.list = trend_list;
		
		title_list = [];
		for (var j = 0; j < data_title.length; j += 1) {
			title_list.push(data_title[j].key);
		}

		awesomplete1.list = title_list;
		
		// update scale 
		var data_trend = data.filter(function(d){
			return (d.sex == active_sex & d[varname_title] == active_title & d[varname_trend] == active_trend)
		});
		


		title_label = active_title
		if (bool_switch) {
			if (data_trend[0].national == 0) {
				title_label = title_label + "*"
				bar_graph.selectAll(".regional_text")
					.transition().duration(transition_time).ease(ease_effect)  
					.attr("opacity", 1)
			}
			else {
				bar_graph.selectAll(".regional_text")
					.transition().duration(transition_time).ease(ease_effect)  
					.attr("opacity", 0)
			}
			

		}
		// update title 
		bar_graph.selectAll(".graph_title") // add x axis subtitle
			.text(title_label)
		
		update_scale(bar_graph, data_trend)

	
		
		if (nb_node > 0) {
			
			add_tag(active_trend)
			add_node(bar_graph,data_trend)

		}
		

		
	}

	
	
	
	function CI5_trend() 
	{	
		
		d3.csv("data/CI5plus_asr_country.csv",
			
			function(d){
				return parse_variable(d);
			},		
			function(data) {
				
				data_country = data;
					
				
				var data_trend_temp = data.filter(function(d){
					return (d.sex == active_sex);
				});
				
				var data_trend = d3.nest()
					.key(function(d) {return d[varname_trend];})
					.sortKeys(d3.ascending)
					.entries(data_trend_temp);
					
				var data_title_temp = data.filter(function(d){
					return (d.sex == active_sex);
				});
					
				var data_title = d3.nest()
					.key(function(d) {return d[varname_title];})
					.sortKeys(d3.ascending)
					.entries(data_title_temp);
				
				trend_list = [];
				
				for (var i = 0; i < data_trend.length; i += 1) {
					trend_list.push(data_trend[i].key);
				}

				awesomplete2.list = trend_list;
				
				title_list = [];
				for (var j = 0; j < data_title.length; j += 1) {
					title_list.push(data_title[j].key);
				}

				awesomplete1.list = title_list;
								
	
					

			
				var bar_graph=
				d3.select("#chart").append("svg") 
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
						
				var data_temp = data.filter(function(d){
					return (d.sex == active_sex & d[varname_title] == active_title);
				});


				add_axis_title(bar_graph,data_temp);
				

			
			
			div_left_panel.style.opacity = 1;
			div_wait.style.opacity = 0;
			
		}).on("progress", function(event){

			div_left_panel.style.opacity = 0.5;
			div_wait.style.opacity = 1;
			 
		});
		
		d3.csv("data/CI5plus_asr_registry.csv" ,
			
			function(d){
				return parse_variable(d);
			},		
			function(data) {
				
				data_registry = data;
				
			
			
		div_left_panel.style.opacity = 1;
			div_wait.style.opacity = 0;
			
		}).on("progress", function(event){

			div_left_panel.style.opacity = 0.5;
			div_wait.style.opacity = 1;
			 
		});
	}

	
	
	function add_axis_title(graph,data) { 


		var y_max = d3.max(data, function(d) {return d.value})
		var y_min = d3.min(data, function(d) {return d.value})
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
				.text(active_title)
				
		graph.append("text") // add x axis subtitle
				.attr("class", "graph_subtitle")
				.attr("text-anchor", "middle")
				.attr("transform", "translate(" +(graph_width/2) + "," +(-20) + ")")
				.text("Male")
				
		
	

			 			
	}
	
	function add_tag(label) {
	 
	var temp_li = document.createElement("li");
	temp_li.setAttribute("class", "select_trend");
	temp_li.setAttribute("label", label);
	
	var temp_span = document.createElement("span");
	temp_span.setAttribute("class", "select_remove");
	temp_span.innerHTML = "x";
	
	temp_li.innerHTML = label;
	

	temp_li.prepend(temp_span);
	document.getElementById("trend_element").appendChild(temp_li);
	
	
 }
	
	function add_trend() {
		
		var trend_element = document.getElementById("trend_element").children;
		var bool_unique = true
		var bool_national = document.getElementById("check_regional").checked; 		
		
		
		for (var i = 0; i < trend_element.length; i++) {
			if (trend_element[i].getAttribute('label') == active_trend) {
				bool_unique = false 
			} 
		}
		
		if (bool_unique) {
			



						
			if (!bool_national) {
				var data = data_registry;
			}
			else {
				var data = data_country;
			}
			
			var bar_graph=d3.select("#chart").select(".bar_graph")
			
			add_tag(active_trend)
			
			var nb_trend = trend_element.length -1
			
			trend_list = [];
			for (var i = 0; i <= nb_trend; i += 1) { 
				
				
				trend_list.push(trend_element[i].getAttribute('label'))
			}
			
			


			var data_trend = data.filter(function(d){
				return (d.sex == active_sex & d[varname_title] == active_title & trend_list.includes(d[varname_trend]))
			});
			
			
			update_scale(bar_graph, data_trend)
			
			if (trend_list.length > 1) {
				
				trend_list.pop();
				
				var data_trend_old = data.filter(function(d){
					return (d.sex == active_sex & d[varname_title] == active_title & trend_list.includes(d[varname_trend]))
				});
						

				update_trend(bar_graph, data_trend_old)
				
			}
			
			var data_temp = data.filter(function(d){
				return (d.sex == active_sex & d[varname_title] == active_title & d[varname_trend] == active_trend)
			});
					
			add_node(bar_graph,data_temp)

	
			
			
			
		}
	}
		
	function add_node(graph,data) {
		
		var trend_element = document.getElementById("trend_element").children;
		var nb_trend = trend_element.length-1

		var trend_list = [];
		for (var i = 0; i <= nb_trend; i += 1) { 
			trend_list.push(trend_element[i].getAttribute('label'))
			
		}
		
		var nb_node = graph.selectAll(".nodes")[0].length;
		
		
		var data_nest=d3.nest()
		.key(function(d) { return d[varname_trend]; }).sortKeys(function(a,b) { return trend_list.indexOf(a) - trend_list.indexOf(b); })
		.key(function(d) {return d.year;}).sortKeys(d3.ascending)
		.entries(data)

		
		var nodes = graph.append("g")
			.selectAll()
			.data(data_nest)
			.enter()
			.append("g")
			.attr("class", function(d,i) { 
				return "nodes" + " nodes_" + d.key.replace(/[^a-z]/g, '');} )
			.attr("transform", function(d, i) {
				return "translate(0,0)";
				})

		var path = nodes.append("path")
			.attr("class","trend")
			.attr("d", function(d, i){
				return lineFunction(d.values)
				})
			.attr("stroke", function(d, i){
				return color_scale_10(i + nb_node)
				})
			.attr("stroke-width", 2)
			.attr("fill", "none")

		
			
		path.call(transition);
		
	
		
		setTimeout(function() {
		 nodes.append("text")
			.attr("class","trend_label")
			.attr("x", function (d) {
				nb_year = d.values.length;
				temp = d.values[nb_year-1].values[0];	
				return (xScale(temp.year+1));
			})
			.attr("y", function (d) {
				nb_year = d.values.length;
				temp = d.values[nb_year-1].values[0];	
				return (yScale(temp.value));
			})
			.text( function (d,i) {
				var trend_label = d.key 
				if (!bool_switch) {
					var nat = d.values[0].values[0].national
					if (nat == 0 ) {
						trend_label = trend_label + "*";
						regional = regional + 1; 
						graph.selectAll(".regional_text")
							.transition().duration(transition_time).ease(ease_effect)  
							.attr("opacity", 1)
					}
				}
				return trend_label.replace(/_/, ', ');
			})
			.attr("dy", "0.15em")
			.call(drag)
		}, transition_time)
		

		
		
	}
		
	function remove_trend(label_input, active_title) {
		
		var bool_national = document.getElementById("check_regional").checked; 
		
		
		var trend_element = document.getElementById("trend_element").children;
		var nb_trend = trend_element.length -1
		trend_list = [];

		for (var i = 0; i <= nb_trend; i += 1) { 
			trend_list.push(trend_element[i].getAttribute('label'))
			
		}
		
		

		
		if (trend_list.length > 0) {
			active_trend = trend_list[trend_list.length-1];
		} else {
			if (bool_switch) {
				active_trend = "All cancers excluding non-melanoma skin"
			} 
			else {
				if (bool_national) {
					active_trend = "Australia"
				} 
				else {
					active_trend = "Australia_NSW_ACT"
				}
			}
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
		
		
		if (trend_list.length > 0) {
		

		if (!bool_national) {
			var data = data_registry;
		}
		else {
			var data = data_country;
		}
					

		// create graph
								
		var bar_graph=d3.select("#chart").select(".bar_graph")
		

		
		var data_trend = data.filter(function(d){
			return (d.sex == active_sex & d[varname_title] == active_title & trend_list.includes(d[varname_trend]))
		});
		

		
		
		update_scale(bar_graph, data_trend)
		
		// update other countries

		update_trend(bar_graph, data_trend)
						
							

				
			
			
		}
	
		
	}
	
	function highlight_trend(label_input, bool) {
		
		var op  = 1
		if (bool) {
			op = 0.25
		}
		
		var bar_graph= d3.select("#chart").select(".bar_graph");
		var graph = bar_graph.selectAll(".nodes:not(.nodes_" + label_input.replace(/[^a-z]/g, '') + ")");

		graph.attr("opacity", op)
		
		
	}
	

	
	function update_title() {
		
		sex_label = "Male";
		if (active_sex == 2 ) {
			sex_label = "Female";;
		}
		
		var trend_element = document.getElementById("trend_element").children;
		var bool_national = document.getElementById("check_regional").checked; 

		if (!bool_national) {
			var data = data_registry;
		}
		else {
			var data = data_country;
		}
		
		var bar_graph=d3.select("#chart").select(".bar_graph")				
		var nb_trend = trend_element.length-1

		trend_list = [];
		for (var i = 0; i <= nb_trend; i += 1) { 
			trend_list.push(trend_element[i].getAttribute('label'))
			
		}

		if (trend_list.length > 0) {
			
			
			var data_trend = data.filter(function(d){
				return (d.sex == active_sex & d[varname_title] == active_title & trend_list.includes(d[varname_trend]))
			});
			
		
			update_scale(bar_graph, data_trend)
			update_trend(bar_graph, data_trend)
				
		}
		
		var data_title = data.filter(function(d){
				return (d[varname_title] == active_title)
			});
			
		
		
		title_label = active_title
		
		if (bool_switch) {
			if (data_title[0].national == 0) {
				title_label = title_label + "*"
				bar_graph.selectAll(".regional_text")
					.transition().duration(transition_time).ease(ease_effect)  
					.attr("opacity", 1)
			}
			else {
				bar_graph.selectAll(".regional_text")
					.transition().duration(transition_time).ease(ease_effect)  
					.attr("opacity", 0)
			}
			
		
		}
		
		bar_graph.selectAll(".graph_title") // add x axis subtitle
			.text(title_label)
		bar_graph.selectAll(".graph_subtitle") // add x axis subtitle
			.text(sex_label)
	
			

}
		
		
	function update_sex() {
		var bool_national = document.getElementById("check_regional").checked; 
		label_input = "Male";
		if (active_sex == 2 ) {
			label_input = "Female";;
		}
		
		
		var trend_element = document.getElementById("trend_element").children;
		
		
		var bar_graph=d3.select("#chart").select(".bar_graph")
		
		if (!bool_national) {
			var data = data_registry;
		}
		else {
			var data = data_country;
		}
					
		var data_temp = data.filter(function(d){
			return (d.sex == active_sex)
		});
			
		if (bool_switch) {
			var data_trend = d3.nest()
				.key(function(d) {return d[varname_trend];})
				.sortKeys(d3.ascending)
				.entries(data_temp)
			
			
			
			trend_list = [];
			for (var i = 0; i < data_trend.length; i += 1) {
				trend_list.push(data_trend[i].key)
			}
			
			awesomplete2.list = trend_list;
			
			
			for (var i = 0; i < trend_element.length; i++) {
				
				var node_label = trend_element[i].getAttribute('label')
				if (!trend_list.includes(node_label)) {
					
					
					trend_element[i].remove();
					var graph = bar_graph.selectAll(".nodes_" + node_label.replace(/[^a-z]/g, ''));
					graph.remove();
					
					
				}
			}		
			
		}
		else {
			
			
			
			var data_title = d3.nest()
				.key(function(d) {return d[varname_title];})
				.sortKeys(d3.ascending)
				.entries(data_temp)
			
			title_list = [];
			for (var i = 0; i < data_title.length; i += 1) {
				title_list.push(data_title[i].key)
			}
			
			
			if (!title_list.includes(active_title)) {
				active_title = "All cancers excluding non-melanoma skin";
			}

			awesomplete1.list = title_list;
		}
			

		
		
		
		bar_graph.selectAll(".graph_title") // add x axis subtitle
			.text(active_title)
		bar_graph.selectAll(".graph_subtitle") // add x axis subtitle
			.text(label_input)
		
		// update scale 
		
		
		var nb_trend = trend_element.length-1

		trend_list = [];
		for (var i = 0; i <= nb_trend; i += 1) { 
			trend_list.push(trend_element[i].getAttribute('label'))
			
		}

		
		if (trend_list.length > 0) {
			var data_trend = data.filter(function(d){
				return (d.sex == active_sex & d[varname_title] == active_title & trend_list.includes(d[varname_trend]))
			});
		
			update_scale(bar_graph, data_trend)
		
			update_trend(bar_graph, data_trend, trend_list)
			
		
			
		}
		
				
	
		

	}
		
		
	function update_scale (graph, data) {
		
		
		if (data.length > 0)  {
			
			var y_max = d3.max(data, function(d) {return d.value})
			var y_min = d3.min(data, function(d) {return d.value})
			

			
			
			
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
				

		
	}
	
	function update_trend (graph, data) {
	
	
	
	var trend_element = document.getElementById("trend_element").children;
	var nb_trend = trend_element.length-1

	var trend_list = [];
	for (var i = 0; i <= nb_trend; i += 1) { 
		trend_list.push(trend_element[i].getAttribute('label'))
		
	}
	

		
	var data_update=d3.nest()
		.key(function(d) { return d[varname_trend]; }).sortKeys(function(a,b) { return trend_list.indexOf(a) - trend_list.indexOf(b); })
		.key(function(d) {return d.year;}).sortKeys(d3.ascending)
		.entries(data)
		

			
		graph.selectAll(".trend")
		.data(data_update)
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
			
		 graph.selectAll(".trend_label")
		.data(data_update)
		.transition().duration(transition_time).ease(ease_effect)
		.attr("x", function (d) {
			nb_year = d.values.length;
			temp = d.values[nb_year-1].values[0];	
			return (xScale(temp.year+1));
		})
		.attr("y", function (d) {
			nb_year = d.values.length;
			temp = d.values[nb_year-1].values[0];	
			return (yScale(temp.value));
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
			
			//console.log("tick_info")
			//console.log(log_min)
			//console.log(log_max)
			//console.log(unit_floor_min)
			//console.log(unit_floor_max)
			//console.log("end")
			
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
	
	
	function parse_variable(d) {
			return {
				
				sex : +d.sex,
				year: +d.year,
				cancer_label : d.cancer_label,
				country_label : d.country_label,
				asr: +d.asr,
				value: +d.smoothed,
				national: +d.national
			};	
		}		

	
	function update_placeholder(bool_switch, bool_national) {
		
		if (bool_switch) {
			
			document.getElementById("input_trend").placeholder = "Add a cancer"
			if (bool_national) {
				file_use = "data/CI5plus_asr_country.csv"; 
				document.getElementById("input_title").placeholder = "Select country"
			} 
			else {
				file_use = "data/CI5plus_asr_registry.csv"; 
				document.getElementById("input_title").placeholder = "Select registry"
			}

		}
		else {
			
			document.getElementById("input_title").placeholder = "Select a cancer"
			if (bool_national) {
				file_use = "data/CI5plus_asr_country.csv"; 
				document.getElementById("input_trend").placeholder = "Add a country"
			} 
			else {
				file_use = "data/CI5plus_asr_registry.csv"; 
				document.getElementById("input_trend").placeholder = "Add a registry"
			}
		}
						
		
		
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
	

