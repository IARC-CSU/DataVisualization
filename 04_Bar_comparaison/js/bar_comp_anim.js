

	
    function bar_comp() // generate heatmap 
	{ 	
		var file_use = "data/CI5IvsCI5XI.csv"; 
		
	

		d3.csv(file_use,
			
			function(d) {
			return {
				
				rank : +d.rank,
				cancer_label : d.cancer_label,
				cancer: +d.cancer,
				volume : +d.volume,
				sex : +d.sex,
				per1: d.per1,
				per2: d.per2,
				asr: +d.asr,
				country_label: d.country_label,
				country_code: +d.country_code

				
				
				};	
			},		
			function(data) {
			
				populateComboRegistry(data); // fill registry combo box 
				
				// Keep canada, men 
				var data_temp = data.filter(function(d){
					return (d.country_code == 124 & d.sex == 1  )
				});
				
				// I nest by cancer to have group (text, bar and line)
				// Then I nest by volume (1 or 10) so I have access to both rank
				// I need them for the line linking both graph
				var data_nest=d3.nest()
						.key(function(d) {return d.cancer;})
						.sortKeys(d3.ascending)
						.key(function(d) {return d.volume;})
						.sortKeys(d3.ascending)
						.entries(data_temp)
						
				var bar_graph=[ // create array with both bargraph
				d3.select("#chart").append("svg") // draw main windows
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("class", "bar_graph1")	
					.attr("transform", "translate(" + margin.left_page   + "," + margin.top_page  + ")") 
				,
				d3.select("#chart").selectAll("svg") // draw second bar 
					.append("g")
					.attr("class", "bar_graph2")	
					.attr("transform", "translate(" +(graph_separation)   + "," + margin.top_page  + ")") 
				]
				

					add_axis_title(bar_graph,data_temp,bool_left_graph = true);
					add_axis_title(bar_graph,data_temp,false);
					add_bar_text_line(bar_graph,data_nest, true)
					add_bar_text_line(bar_graph,data_nest, false)	
					add_line_link(bar_graph[0],data_nest);			
			
			}
		);
	}
	
	
	function add_axis_title(graph,data,bool_left_graph) { 
	// Add axis, title and x-title to the graph
		// graph to add axis and title 
		// data 
		// boolean: True:left graph, False: Right bar graph
		
		if (bool_left_graph) {
			volume = 1
			v_key = 0 //volume key for the array or nest data
		} else {
			volume = 11
			v_key = 1 
		}
		
		graph_select = graph[v_key]
		
		// filter to get only 1 time the period 
		var data_period = data.filter(function(d){
			return (d.rank==1 & d.volume == volume )
		});
		
		graph_select.selectAll() // add title of bar_graph (period)
			.data(data_period)
			.enter()
			.append("text")
			.attr("class", "bar_title") 
			.attr("text-anchor", "middle")
			.attr("x", var_width/2)     
			.attr("y", -50)
			.text(function(d,i) { return d.per1 + " - " + d.per2 });
				 
		graph_select.append("g") // draw axis major
			.attr("class", "xaxis")
			.attr("transform", "translate(" + (0)+ "," +graph_height + ")")
			.call(xAxis);
				
		graph_select.append("g") // draw axis minor
			.attr("class", "xaxis_minor")
			.attr("transform", "translate(" + (0)+ "," +graph_height + ")")
			.call(xAxis_minor);
				
		var x_max = d3.max(data, function(d) {return d.asr})
		var tick_list = tick_generator(x_max)
			
		graph_select.selectAll(".xaxis") // add Big tick
			.data(tick_list.major, function(d) { return d; })
			.enter()
			.append("line")
			.attr("class", "tick_major")
			.attr("stroke", "black")
			.attr("stroke-width", 2)
			.attr("y1", graph_height)
			.attr("y2", graph_height+8)
			.attr("x1", function(d) { return xScale(d); })
			.attr("x2", function(d) { return xScale(d); })
				
		graph_select.selectAll(".xaxis")  // add small tick
			.data(tick_list.minor, function(d) { return d; })
			.enter()
			.append("line")
			.attr("class", "tick_minor")
			.attr("stroke", "black")
			.attr("stroke-width", 2)
			.attr("y1", graph_height)
			.attr("y2", graph_height+6)
			.attr("x1", function(d) { return xScale(d); })
			.attr("x2", function(d) { return xScale(d); })
				


		graph_select.append("text") // add x axis subtitle
			.attr("class", "xtitle") 
			.attr("text-anchor", "middle")
			.attr("x", 10* XgridSize)     
			.attr("y", graph_height+48)
			.text("Age standardized (W) incidence rate per 100,000");
		
		
			 			
	}

	function add_bar_text_line(graph, data_nest, bool_left_graph) {
	// Add bar, text and line (cancer group)
		// graph to add axis and title 
		// data 
		// boolean: True:left graph, False: Right bar graph
		
		if (bool_left_graph) {
			v_key = 0 //volume key for the array or nest data
		} else {
			v_key = 1 
		}
			
		graph_select = graph[v_key]
		
		var cancer_group = graph_select.selectAll() // create groupe contening (bar text and line)
			.data(data_nest)
			.enter()
			.append("g")
			.attr("class", "bar" +(v_key+1)) // add class to select by class, for the update 
			.attr("transform",function(d,i) { // Position of the group 
				var rank = d.values[v_key].values[0].rank
				if (rank < nb_cancer+1) {
					return "translate(0," + yScale(rank + (bar_space*(rank-1))) + ")";
				} else {
					// if not show place them just under the graph
					return "translate(0," + graph_height + ")";
				}	
			})

			 
		cancer_group.append("text")
			.attr("id",function(d) {return "id" + (v_key+1) + "_" + d.values[0].values[0].cancer_label; // Need the id, to after know the size of the text
			})
			.attr("class",function(d) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var update_rank = -Math.sign(rank2-rank1)
				return ("label" + (v_key+1) +" U"+(update_rank))
			})
			.attr("text-anchor", "end")
			.attr("transform", function (d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_diff = (rank2-rank1)
				if (bool_left_graph) {
					return ("translate(-5,0)");
				} 
				else {
					if (rank2 < nb_cancer+1) {
						return ("translate("+(-5-graph_separation+margin.left_page)+"," + (yScale(-rank_diff+(bar_space*(-rank_diff)))+YgridSize) + ")");
					}
					else {
						return ("translate("+(-5-graph_separation+margin.left_page)+"," + ((yScale(rank1+(bar_space*(rank1-1)))-graph_height)) + ")");
					}

				}
				
			})
			.style("opacity" ,function(d,i) { // if rank > 10, not show
				if (bool_left_graph) {
					var rank1 = d.values[0].values[0].rank
					if (rank1 < nb_cancer+1) { 
						return 1;
						}
					else {
						return 0;
					}
				}
				else {
					return 0;
				}
			 })
			.each(function (d) { // to use the wrap label fonction 
				var lines = wordwrap(d.values[0].values[0].cancer_label, label_wrap)
				for (var i = 0; i < lines.length; i++) {
					d3.select(this).append("tspan").attr("dy",0).attr("x",0).attr("y",YgridSize/Math.pow(3/2, lines.length)+i*15).text(lines[i])
					}
			})

			
		cancer_group.append("rect")
			.attr("class",function(d) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var update_rank = -Math.sign(rank2-rank1)
				return ("rect" + (v_key+1) +" U"+(update_rank))
			})				// add class to select by class, for the update 
			.attr("x", function() {
				if (bool_left_graph) {
					return(0)
				} 
				else {
					return (-graph_separation+margin.left_page)
				}
			})
			.attr("y", function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_diff = (rank2-rank1)
				if (bool_left_graph) {
					return (0);
				} 
				else {
					if (rank2 < nb_cancer+1) {
						return (yScale(-rank_diff+(bar_space*(-rank_diff)))+YgridSize);
					}
					else {
						return (yScale(rank1+(bar_space*(rank1-1)))-graph_height);
					}

				}
				
			})
			.attr("rx", 0)
			.attr("ry", 0)
			.attr("width", function(d,i) {return xScale(d.values[0].values[0].asr);})
			.attr("height", YgridSize)
			.attr("fill", "#2c7bb6")
			.style("opacity" ,function(d,i) { // if rank > 10, not show
				if (bool_left_graph) {
					var rank1 = d.values[0].values[0].rank
					if (rank1 < nb_cancer+1) { 
						return 1;
						}
					else {
						return 0;
					}
				} else {
					return 0;
				}
			 });
		 	
		cancer_group.append("line")  // add line to group (diferent of left and right graph)
			.attr("class",function(d) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var update_rank = -Math.sign(rank2-rank1)
				return ("line" + (v_key+1) +" U"+(update_rank))
			})		 // add class to select by class, for the update 
			.attr("x1", function(d,i) { 
				if (bool_left_graph) {
					var temp_id = "id1_" + d.values[0].values[0].cancer_label;
					var temp = document.getElementById(temp_id).getBBox().width;
					return -(temp+10)
					//return xScale(d.values[v_key].values[0].asr)+5;
				} else {
					return -line_separation;
					
				}
			})
			.attr("y1", YgridSize/2)
			.attr("y2", YgridSize/2)
			.attr("x2",  function(d,i) { 
				if (bool_left_graph) {
					var temp_id = "id1_" + d.values[0].values[0].cancer_label;
					var temp = document.getElementById(temp_id).getBBox().width;
					return -(temp+10)
					//return var_width;
				} else {
					return -line_separation;
					//return -(temp+10);	
				}
			})
			.attr("stroke-width", 0.5)
			.attr("stroke", function(d,i) { // add color to line 
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_diff = rank2-rank1;
				if (rank_diff > 0) {
					return "green";
				} else if (rank_diff < 0){
					return "red"
				} else {
					return "black"
				}
			})
			.style("opacity", 0)
				
			
		graph_select.append("line") // add line for x = 0
			.style("stroke", "black")  
			.attr("x1", 0)    
			.attr("y1", -20)  
			.attr("x2", 0)  
			.attr("y2", graph_height+6);
			
		graph_select.append("line") // add line for y = 0
			.style("stroke", "black")  
			.attr("x1", 0)    
			.attr("y1", graph_height)  
			.attr("x2", var_width)  
			.attr("y2", graph_height);
		
	}
	
	function add_line_link(bar_graph,data_nest) {
	// Add line linking the graph
		// graph to add the line (Add the left graph) 
		// data 
		
		var line_link =  bar_graph.selectAll()
			.data(data_nest)
			.enter()
			.append("g")
			.attr("class","link_line") // add class to select by class, for the update 
			.attr("transform",function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_min = Math.min(rank1,rank2)
				if (rank_min < nb_cancer+1) { 
					return "translate(0," + yScale(rank1 + (bar_space*(rank1-1))) + ")";
				} else {
					// if not show place them just under the graph
					return "translate(0," + graph_height + ")";
				}
				})
			.style("opacity" ,function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_min = Math.min(rank1,rank2)
				if (rank_min < nb_cancer+1) {
					return 1;
					}
				else {
					return 0;
				}
			});
			
		line_link.append("line")
			.attr("class",function(d) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var update_rank = -Math.sign(rank2-rank1)
				return ("link" + (v_key+1) +" U"+(update_rank))
			})
			.attr("x1", function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				if (rank2 < nb_cancer+1 & rank1 > nb_cancer) {
					// position if left cancer > 10
					return (graph_separation-margin.left_page)-(line_separation)-30;
				}
				else {
					return var_width;
				}
			})
			.attr("x2",  function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				// position if right cancer > 10
				if (rank2 < nb_cancer+1 & rank1 > nb_cancer) {
					return (graph_separation-margin.left_page)-(line_separation)-30;
				}
				else {
					return var_width;
				}
			})
			.attr("y1",  function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				if (rank2 < nb_cancer+1 & rank1 > nb_cancer) {
					// position if left cancer > 10
					return yScale((nb_cancer+1-rank1)+(bar_space*(nb_cancer+1-rank1)))+YgridSize;
				}
				else {
					return YgridSize/2;
				}
			})
			.attr("y2",function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_min = Math.min(rank1,rank2)
				var rank_diff = (rank2-rank1)+1
				if (rank2 < nb_cancer+1 & rank1 > nb_cancer) {
					// position if left cancer > 10
					return yScale((nb_cancer+1-rank1)+(bar_space*(nb_cancer+1-rank1)))+YgridSize;
				}
				else {
					return YgridSize/2;
				}
			})
			.attr("stroke-width", 0.5)
			.attr("stroke", function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_diff = rank2-rank1;
				if (rank_diff > 0) {
					return "green";
				} else if (rank_diff < 0){
					return "red"
				} else {
					return "black"
				}
			});
	}

	function update_bar(direction) 
	{
		
		
		var bar = d3.select("#chart") // select by class
		
		if (document.getElementById("button_"+direction).getAttribute('name') == "go") {
			var bool_go = true;
			document.getElementById("button_"+direction).setAttribute('name', 'back')
		}
		else {
			var bool_go = false;
			document.getElementById("button_"+direction).setAttribute('name', 'go')
		}
				
		if (bool_go) {
			
						
			document.getElementById("button_" + direction).onmouseover = function() 
				{
					this.style.backgroundColor = "#cccccc";
				}
			
			document.getElementById("button_" + direction).onmouseout = function() 
				{
					this.style.backgroundColor = "#ffffff";
				}
			
			d3.select("#"+ "button_"+direction)
			.style("box-shadow", "0 1px #969696")
			.style("transform", "translateY(5px)")
			
			bar.selectAll(".rect2."+direction)
			.style("opacity", function (d) {
				var rank1 = d.values[0].values[0].rank
				if (rank1 < nb_cancer+1) { 
					return 1;
					}
				else {
					return 0;
				}
			})
			
			bar.selectAll(".label2."+direction)
			.style("opacity", function (d) {
				var rank1 = d.values[0].values[0].rank
				if (rank1 < nb_cancer+1) { 
					return 1;
					}
				else {
					return 0;
				}
			})

			var t0 = bar.transition().duration(transition_time/2).ease("linear");
			
			
			t0.selectAll(".rect2."+direction)
			.attr("x", -graph_separation+var_width+margin.left_page)
			.attr("width", function(d,i) {return xScale(d.values[1].values[0].asr);})
			.transition().duration(transition_time/2).ease("linear")
			.attr("x", 0)
			.attr("y", function(d,i) {
				var rank2 = d.values[1].values[0].rank
				return (0)
			})
			.style("opacity", function(d,i) {
				var rank2 = d.values[1].values[0].rank
				if (rank2 < nb_cancer+1) {
					return(1);
				}
				else {
					return(0);
				}
				
			});
			
			t0.selectAll(".label2."+direction)
			.attr("transform", function(d) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_diff = (rank2-rank1)
				if (rank2 < nb_cancer+1) {
					return ("translate("+(-5-graph_separation+margin.left_page+var_width)+"," + (yScale(-rank_diff+(bar_space*(-rank_diff)))+YgridSize) + ")");
				}
				else {
					return ("translate("+(-5-graph_separation+margin.left_page+var_width)+"," + ((yScale(rank1+(bar_space*(rank1-1)))-graph_height)) + ")");

				}
			})
			.transition().duration(transition_time/2).ease("linear")
			.attr("transform", "translate(-5,0)")
			.style("opacity", function(d,i) {
				var rank2 = d.values[1].values[0].rank
				if (rank2 < nb_cancer+1) {
					return(1);
				}
				else {
					return(0);
				}
				
			});
			
			t0.selectAll(".line1."+direction)
			.attr("x1",function(d) {
				return xScale(d.values[0].values[0].asr)+5
			})
			.attr("x2", var_width)
			.style("opacity" ,function(d,i) { 
				var rank1 = d.values[0].values[0].rank
				if (rank1 < nb_cancer+1) { 
					return 1;
					}
				else {
					return 0;
				}
			 });	
			 

		 
			t0.transition().selectAll(".link2."+direction)
			.attr("x2",  function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				// position if right cancer > 10
				if (rank1 < nb_cancer+1 & rank2 > nb_cancer) {
					return var_width+40;
				}
				else {
					var temp_id = "id2_" + d.values[1].values[0].cancer_label;
					var temp = document.getElementById(temp_id).getBBox().width;
					return (graph_separation-margin.left_page-line_separation);
				}
			})
			.attr("y2",function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_min = Math.min(rank1,rank2)
				var rank_diff = (rank2-rank1)+1
				if (rank1 < nb_cancer+1 & rank2 > nb_cancer) {
					// position if right cancer > 10
					return yScale((nb_cancer+1-rank1)+(bar_space*(nb_cancer+1-rank1)))+YgridSize;
				} else if (rank_min > nb_cancer) {
					// position if both cancer > 10
					return YgridSize/2;
				}
				else {
					// position based on difference
					return yScale(rank_diff+(bar_space*(rank_diff-1)))+YgridSize/2;
				}
			})
			
			t0.transition().selectAll(".line2."+direction)
			.attr("x2",  function(d,i) { 
					var temp_id = "id2_" + d.values[1].values[0].cancer_label;
					var temp = document.getElementById(temp_id).getBBox().width;
					return -(temp+10);	
				
				})
			.style("opacity" ,function(d,i) { 
				var rank2 = d.values[1].values[0].rank
				if (rank2 < nb_cancer+1) { 
					return 1;
					}
				else {
					return 0;
				}
			 });	
			
			
		}
		else {
			
			d3.select("#"+ "button_"+direction)
			.style("box-shadow", "0 4px #969696")
			.style("transform", "translateY(0px)")
			


			var t0 = bar.transition().duration(transition_time/2).ease("linear");
			
			
			t0.selectAll(".rect2."+direction)
			.attr("x", -graph_separation+var_width+margin.left_page)
			.attr("y", function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_diff = (rank2-rank1)
				if (rank2 < nb_cancer+1) {
						return (yScale(-rank_diff+(bar_space*(-rank_diff)))+YgridSize);
					}
					else {
						return (yScale(rank1+(bar_space*(rank1-1)))-graph_height);
					}
			})
			.attr("width", function(d,i) {return xScale(d.values[0].values[0].asr);})
			.transition().duration(transition_time/2).ease("linear")
			.attr("x", -graph_separation+margin.left_page)
			.attr("y", function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_diff = (rank2-rank1)
				if (rank2 < nb_cancer+1) {
						return (yScale(-rank_diff+(bar_space*(-rank_diff)))+YgridSize);
					}
					else {
						return (yScale(rank1+(bar_space*(rank1-1)))-graph_height);
					}
			})
			.each("end", function() {
				d3.select(this).style("opacity", 0)
			})

			
			t0.selectAll(".label2."+direction)
			.attr("transform", function(d) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_diff = (rank2-rank1)
				if (rank2 < nb_cancer+1) {
					return ("translate("+(-5-graph_separation+margin.left_page+var_width)+"," + (yScale(-rank_diff+(bar_space*(-rank_diff)))+YgridSize) + ")");
				}
				else {
					return ("translate("+(-5-graph_separation+margin.left_page+var_width)+"," + ((yScale(rank1+(bar_space*(rank1-1)))-graph_height)) + ")");

				}
			})
			.transition().duration(transition_time/2).ease("linear")
						.attr("transform", function(d) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_diff = (rank2-rank1)
				if (rank2 < nb_cancer+1) {
					return ("translate("+(-5-graph_separation+margin.left_page)+"," + (yScale(-rank_diff+(bar_space*(-rank_diff)))+YgridSize) + ")");
				}
				else {
					return ("translate("+(-5-graph_separation+margin.left_page)+"," + ((yScale(rank1+(bar_space*(rank1-1)))-graph_height)) + ")");

				}
			})
			.each("end", function() {
				d3.select(this).style("opacity", 0)
			})
			
			t0.transition().selectAll(".line1."+direction)
			.attr("x2", -line_separation)
			.style("opacity" ,0)
			 

		 
			t0.selectAll(".link2."+direction)
			.attr("x2",  function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				// position if right cancer > 10
				if (rank2 < nb_cancer+1 & rank1 > nb_cancer) {
					return (graph_separation-margin.left_page)-(line_separation)-30;
				}
				else {
					return var_width;
				}
			})
			.attr("y1",  function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				if (rank2 < nb_cancer+1 & rank1 > nb_cancer) {
					// position if left cancer > 10
					return yScale((nb_cancer+1-rank1)+(bar_space*(nb_cancer+1-rank1)))+YgridSize;
				}
				else {
					return YgridSize/2;
				}
			})
			.attr("y2",  function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				if (rank2 < nb_cancer+1 & rank1 > nb_cancer) {
					// position if left cancer > 10
					return yScale((nb_cancer+1-rank1)+(bar_space*(nb_cancer+1-rank1)))+YgridSize;
				}
				else {
					return YgridSize/2;
				}
			})
			
			t0.selectAll(".line2."+direction)
			.attr("x2",  -line_separation) 
			.style("opacity" ,0)
			 
			
			
		}
	}
	

	
	function update(data) {
	// Update the graph
		// data 
		
		
		var datatemp = data.filter(function(d){
			return (d.rank <= nb_cancer)
		});
		
		var bool_up = false;
		var bool_equal = false;
		var bool_down = false;
		for (var i=0; i<nb_cancer;i++) {
			if ((datatemp[i].cancer) == (datatemp[i+nb_cancer].cancer)) {
				bool_equal = true;
			}
			if ((datatemp[i].cancer) < (datatemp[i+nb_cancer].cancer)) {
				bool_up = true;
			}
			if ((datatemp[i].cancer) > (datatemp[i+nb_cancer].cancer)) {
				bool_down = true;
			}
		}
		
		DivDisplayNoneTransition("button_U0", "inline-block",bool_equal,transition_time  )
		DivDisplayNoneTransition("button_U1", "inline-block",bool_up,transition_time  )
		DivDisplayNoneTransition("button_U-1", "inline-block",bool_down,transition_time  )


				
		var data_nest=d3.nest()
			.key(function(d) {return d.cancer;})
			.sortKeys(d3.ascending)
			.key(function(d) {return d.volume;})
			.sortKeys(d3.ascending)
			.entries(data)
			
		var x_max = d3.max(data, function(d) {return d.asr})
		var tick_list = tick_generator(x_max)
	
		xScale.domain([0,tick_list.value_top]); // update xscale domain
		
		var xAxis = d3.svg.axis() // update grid Major
			.scale(xScale)
			.orient("bottom")
			.tickSize(-graph_height-20, 0,0)
			.tickPadding(12)
			.tickValues(tick_list.major);
		
		var xAxis_minor = d3.svg.axis() // update grid minor
			.scale(xScale)
			.orient("bottom")
			.tickSize(-graph_height-20, 0,0)
			.tickPadding(12)
			.tickValues(tick_list.minor)	
			.tickFormat("")		
			
		
		

		
		d3.select("#chart")  //  grid Major transition
		   .selectAll(".xaxis")
           .transition().duration(1500).ease("sin-in-out")  
           .call(xAxis); 

		d3.select("#chart") //  grid Minor transition
		   .selectAll(".xaxis_minor")
           .transition().duration(1500).ease("sin-in-out") 
           .call(xAxis_minor);  		   

		update_axis_title(data,true,tick_list)
		update_axis_title(data,false,tick_list)
		update_bar_text_line(data_nest, true)
		update_bar_text_line(data_nest, false)				
		update_line_link(data_nest)

		
	}
			
	function update_axis_title(data,bool_left_graph,tick_list) {
	// Update the axis and title 
		// data 
		// boolean 
		// tick list for the axis (generate by fonction tick_generator)
		
		if (bool_left_graph) {
			var volume = 1;
			var bar_graph_class = ".bar_graph1"; // to select by class
		} else {
			var volume = 11;
			var bar_graph_class = ".bar_graph2";
		}
	
		var data_period = data.filter(function(d){
			return (d.rank==1 & d.volume == volume )
		});
		
		var title_period = d3.select("#chart").select(bar_graph_class).selectAll(".bar_title")
			.data(data_period)
			.text(function(d,i) { return d.per1 + " - " + d.per2 });
		

		// update tick position major
		 var xgrid_major=d3.select("#chart").select(bar_graph_class).selectAll(".tick_major")
			.data(tick_list.major, function(d) { return d; })
			
		xgrid_major.transition().duration(1500).ease("sin-in-out")
			.attr("x1", function(d) {return xScale(d); })
			.attr("x2", function(d) {return xScale(d); })
					
		xgrid_major.exit().remove()
			
		xgrid_major.enter()
			.append("line")
			.attr("class", "tick_major")
			.attr("stroke", "black")
			.attr("y1", graph_height)
		    .attr("y2", graph_height+8)
			.attr("x1", function(d) { return xScale(d); })
			.attr("x2", function(d) { return xScale(d); })
		
		// update tick position minor
		var xgrid_minor=d3.select("#chart").select(bar_graph_class).selectAll(".tick_minor")
			.data(tick_list.minor, function(d) { return d; })		
			
		 xgrid_minor.transition().duration(1500).ease("sin-in-out")
			.attr("x1", function(d) { return xScale(d); })
			.attr("x2", function(d) { return xScale(d); })
		
		xgrid_minor.exit().remove()
					
		xgrid_minor.enter()
			.append("line")
			.attr("class", "tick_major")
			.attr("stroke", "black")
			.attr("y1", graph_height)
		    .attr("y2", graph_height+6)
			.attr("x1", function(d) { 
				return xScale(d); })
			.attr("x2", function(d) {return xScale(d); })
	}
	
	function update_bar_text_line(data_nest,bool_left_graph ) {
	// Update cancer group position, bar size and line size
		// data 
		// boolean 
		
		if (bool_left_graph) {
			var bar_class = ".bar1";
			var rect_class = ".rect1";
			var line_class = ".line1";
			var label_class = ".label1";
			var v_key = 0;
		} else {
			var bar_class = ".bar2";
			var rect_class = ".rect2";
			var line_class = ".line2";
			var label_class = ".label2";
			var v_key = 1;
		}
		
		d3.select("#chart").selectAll(bar_class) // select by class
		.data(data_nest)
		.transition().duration(transition_time)	
		.attr("transform",function(d,i) {
			var rank = d.values[v_key].values[0].rank
			if (rank < nb_cancer+1) {
				return "translate(0," + yScale(rank + (bar_space*(rank-1))) + ")";
			} else {
			// if not show place them just under the graph
				return "translate(0," + graph_height + ")";
			}
		})
		
			d3.select("#chart").selectAll(label_class)
			.data(data_nest)
			.transition().duration(transition_time)	
			.attr("id",function(d) {return "id" + (v_key+1) + "_" + d.values[0].values[0].cancer_label; // Need the id, to after know the size of the text
			})
			.attr("class",function(d) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var update_rank = -Math.sign(rank2-rank1)
				return ("label" + (v_key+1) +" U"+(update_rank))
			})
			.attr("text-anchor", "end")
			.attr("transform", function (d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_diff = (rank2-rank1)
				if (bool_left_graph) {
					return ("translate(-5,0)");
				} 
				else {
					if (rank2 < nb_cancer+1) {
						return ("translate("+(-5-graph_separation+margin.left_page)+"," + (yScale(-rank_diff+(bar_space*(-rank_diff)))+YgridSize) + ")");
					}
					else {
						return ("translate("+(-5-graph_separation+margin.left_page)+"," + ((yScale(rank1+(bar_space*(rank1-1)))-graph_height)) + ")");
					}

				}
				
			})
			.style("opacity" ,function(d,i) { // if rank > 10, not show
				if (bool_left_graph) {
					var rank1 = d.values[0].values[0].rank
					if (rank1 < nb_cancer+1) { 
						return 1;
						}
					else {
						return 0;
					}
				}
				else {
					return 0;
				}
			 });



		  
		d3.select("#chart").selectAll(rect_class)
			.data(data_nest)
			.transition().duration(transition_time)	
			.attr("class",function(d) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var update_rank = -Math.sign(rank2-rank1)
				return ("rect" + (v_key+1) +" U"+(update_rank))
			})
			.attr("x", function() {
				if (bool_left_graph) {
					return(0)
				} 
				else {
					return (-graph_separation+margin.left_page)
				}
			})
			.attr("y", function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_diff = (rank2-rank1)
				if (bool_left_graph) {
					return (0);
				} 
				else {
					if (rank2 < nb_cancer+1) {
						return (yScale(-rank_diff+(bar_space*(-rank_diff)))+YgridSize);
					}
					else {
						return (yScale(rank1+(bar_space*(rank1-1)))-graph_height);
					}

				}
				
			})
			.attr("width", function(d,i) {return xScale(d.values[0].values[0].asr);})
			.attr("fill", function(d,i) { 
				if (d.values[0].values[0].sex == 1) {
					return "#2c7bb6";
				} else {
					return "#b62ca1";
				}	
			})
			.style("opacity" ,function(d,i) { // if rank > 10, not show
				if (bool_left_graph) {
					var rank1 = d.values[0].values[0].rank
					if (rank1 < nb_cancer+1) { 
						return 1;
						}
					else {
						return 0;
					}
				}
				else {
					return 0;
				}
			 });
			

		d3.select("#chart").selectAll(line_class)
			.data(data_nest)
			.transition().duration(transition_time)	
			.attr("class",function(d) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var update_rank = -Math.sign(rank2-rank1)
				return ("line" + (v_key+1) +" U"+(update_rank))
			})		 // add class to select by class, for the update 
			.attr("x1", function(d,i) { 
				if (bool_left_graph) {
					var temp_id = "id1_" + d.values[0].values[0].cancer_label;
					var temp = document.getElementById(temp_id).getBBox().width;
					return -(temp+10)
					//return xScale(d.values[v_key].values[0].asr)+5;
				} else {
					return -line_separation;
					
				}
			})
			.attr("y1", YgridSize/2)
			.attr("y2", YgridSize/2)
			.attr("x2",  function(d,i) { 
				if (bool_left_graph) {
					var temp_id = "id1_" + d.values[0].values[0].cancer_label;
					var temp = document.getElementById(temp_id).getBBox().width;
					return -(temp+10)
					//return var_width;
				} else {
					var temp_id = "id2_" + d.values[v_key].values[0].cancer_label;
					var temp = document.getElementById(temp_id).getBBox().width;
					return -line_separation;
					//return -(temp+10);	
				}
			})
			.attr("stroke-width", 0.5)
			.attr("stroke", function(d,i) { // add color to line 
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_diff = rank2-rank1;
				if (rank_diff > 0) {
					return "green";
				} else if (rank_diff < 0){
					return "red"
				} else {
					return "black"
				}
			})
			.style("opacity", 0)
		
	}
	
	function update_line_link(data_nest) {
	// Update line linking the graph 
		// data 
		
		 d3.select("#chart").selectAll(".link_line")
			.data(data_nest)
			.transition().duration(transition_time)
			.attr("transform",function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_min = Math.min(rank1,rank2)
				if (rank_min < nb_cancer+1) { 
					return "translate(0," + yScale(rank1 + (bar_space*(rank1-1))) + ")";
				} else {
					// if not show place them just under the graph
					return "translate(0," + graph_height + ")";
				}
			})
			.style("opacity" ,function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_min = Math.min(rank1,rank2)
				if (rank_min < nb_cancer+1) {
					return 1;
					}
				else {
					return 0;
				}
			});
			
		d3.select("#chart").selectAll(".link2")
			.data(data_nest)
			.transition().duration(transition_time)	
			.attr("class",function(d) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var update_rank = -Math.sign(rank2-rank1)
				return ("link" + (v_key+1) +" U"+(update_rank))
			})
			.attr("x1", function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				if (rank2 < nb_cancer+1 & rank1 > nb_cancer) {
					// position if left cancer > 10
					return (graph_separation-margin.left_page)-(line_separation)-30;
				}
				else {
					return var_width;
				}
			})
			.attr("x2",  function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				// position if right cancer > 10
				if (rank2 < nb_cancer+1 & rank1 > nb_cancer) {
					return (graph_separation-margin.left_page)-(line_separation)-30;
				}
				else {
					return var_width;
				}
			})
			.attr("y1",  function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				if (rank2 < nb_cancer+1 & rank1 > nb_cancer) {
					// position if left cancer > 10
					return yScale((nb_cancer+1-rank1)+(bar_space*(nb_cancer+1-rank1)))+YgridSize;
				}
				else {
					return YgridSize/2;
				}
			})
			.attr("y2",function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_min = Math.min(rank1,rank2)
				var rank_diff = (rank2-rank1)+1
				if (rank2 < nb_cancer+1 & rank1 > nb_cancer) {
					// position if left cancer > 10
					return yScale((nb_cancer+1-rank1)+(bar_space*(nb_cancer+1-rank1)))+YgridSize;
				}
				else {
					return YgridSize/2;
				}
			})
			.attr("stroke-width", 0.5)
			.attr("stroke", function(d,i) {
				var rank1 = d.values[0].values[0].rank
				var rank2 = d.values[1].values[0].rank
				var rank_diff = rank2-rank1;
				if (rank_diff > 0) {
					return "green";
				} else if (rank_diff < 0){
					return "red"
				} else {
					return "black"
				}
			});
		
		
		
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
			var log_min = Math.pow(10,Math.floor(Math.log10(value_min))); // order of magnitude of max (power of 10)
			var unit_floor_min = Math.floor(value_min/log_min) // left digit of max 
			
			if (log_min == log_max) { // if min and max same magnitude
			
				for (var i = unit_floor_min; i <= unit_floor_max+1; i++) {
					temp = i*log_min;
					tick_list.major.push(temp);
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
					for (var i = unit_floor_min; i <= 5; i++) {
						temp = i*log_min;
						tick_list.major.push(temp);
					}
				
				tick_list.major.push(7*log_min);
				
				}
				else {
					tick_list.major.push(unit_floor_min*log_min);
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
					tick_list.major.push(log_min);
					tick_list.major.push(2*log_min);
					tick_list.major.push(3*log_min);
					tick_list.major.push(5*log_min);
				} else if (unit_floor_min == 2) {
					tick_list.major.push(2*log_min);
					tick_list.major.push(3*log_min);
					tick_list.major.push(5*log_min);
				} else if (unit_floor_min < 6) {
					tick_list.major.push(5*log_min);
					tick_list.major.push(7*log_min);	
				} else {
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
		
		
		tick_list.value_top = Math.max(max_major,max_minor)	
		}
	return (tick_list)
	}
	
	
	var populateComboRegistry = function(data) {
	//fill registry combo (I don't know why I use var ?)
		//data
		
		var datatemp = data.filter(function(d){
			return (d.volume == 1 & d.sex == 1 & d.rank == 1)
		});

		var registry_list = {};
		for (i=0;i<nb_registry; i++ ) {
			registry_list[datatemp[i].country_label]=datatemp[i].country_code;
		}

		country_text = Object.keys(registry_list);
		country_text.sort();
				
		var select  = document.getElementById("countryList")
			
		for (i=0; i < nb_registry; i++ ) {
			var el = document.createElement("option");
			var temp=country_text[i]
			el.textContent = temp;
			el.value =registry_list[temp];
			select.appendChild(el);
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
		
		
	function DivDisplayNoneTransition(div_id,display_value,bool,transition_time, ) {
		
		if (bool) {
			d3.select("#" + div_id).style("display", display_value)
			d3.select("#" + div_id).transition().duration(transition_time/2)
			.style("opacity",1)
		}
		else {
			d3.select("#" + div_id).transition().duration(transition_time/2)
			.style("opacity",0)
			.each("end", function() {
				d3.select(this).style("display", "none")
			})
		}
		
		
	}
	function combo_sex(sex) {
	// update data from csv when sex change
		// sex value
		
		if (sex == 'Men') {
			var sex_select = 1;
		} else {
			var sex_select = 2;
		}

		var file_use = "data/CI5IvsCI5XI.csv"; 
		var country_select = document.getElementById('countryList').value;

			 d3.csv(file_use,
				function(d) {
				return {
					
					rank : +d.rank,
					cancer_label : d.cancer_label,
					cancer: +d.cancer,
					volume : +d.volume,
					sex : +d.sex,
					per1: d.per1,
					per2: d.per2,
					asr: +d.asr,
					country_label: d.country_label,
					country_code: +d.country_code

					
					
					};	
				},		
				function(data) {
				var datatemp = data.filter(function(d){
					return (d.country_code == country_select & d.sex == sex_select)
				});
				
				update(datatemp)
				}
			)
		}
		
	
	function combo_registry(thelist)
	// update data from csv when registry change
		//registry value
	    {
			if (document.getElementById('radio_sex_male').checked) {
				sex_select = 1;
			} else {
				sex_select = 2;
			}
		
		var file_use = "data/CI5IvsCI5XI.csv"; 

			d3.csv(file_use,
				function(d) {
				return {
					
					rank : +d.rank,
					cancer_label : d.cancer_label,
					cancer: +d.cancer,
					volume : +d.volume,
					sex : +d.sex,
					per1: d.per1,
					per2: d.per2,
					asr: +d.asr,
					country_label: d.country_label,
					country_code: +d.country_code

					
					
					};	
				},		
				function(data) {
		
				var idx_1 = thelist.selectedIndex;
				country_select = thelist.options[idx_1].value;
				
				var datatemp = data.filter(function(d){
					return (d.country_code == country_select & d.sex == sex_select)
				});
				
				update(datatemp)
				
				}
			)
		}



	
	
	
		
		
	
	
	
	