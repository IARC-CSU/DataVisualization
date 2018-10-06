


function combo_sex(sex) {

   sex_select = sex;
   d3.selectAll("svg").remove();
   // document.getElementById('radio_cluster_off').checked= true;
   document.getElementById('radio_cluster_on').checked= false;
   document.getElementById('radio_cluster_off').checked= true;
   document.getElementById('radio_color_hdi').checked= true;
   document.getElementById('radio_color_area').checked= false;
   document.getElementById('countryList').selectedIndex = 0;
   Flag_selected_country = false;
   Heatmap_gen();
   
}



function color_rect(color_coding) { // function to show country by area
		
		d3.select("#chart").selectAll(".rect_legend").remove();
		d3.select("#chart").selectAll(".text_legend").remove();
        d3.select("#chart").selectAll(".element")
           .transition()
           .duration(1000)
		   .attr("fill", function(d,i)  {
					if (color_coding == "hdi") {
						return color_hdi[d.hdi_group];}
					else { return color_area[(d.area_code)-1];}
					});
					
			if (color_coding == "hdi") {
				for (j	 = 0; j < 4; j++ ){
					legend_generator(xScale(nb_country+1) + 5, YgridSize*(0.1+j) , XgridSize*5, YgridSize*0.8,YgridSize*(0.7+j),hdi_label[j],color_hdi[j], select_hdi,j);
				}
			}
		
			else {
				for (j = 0; j < 6; j++ ){
					legend_generator(xScale(nb_country+1) + 5, YgridSize*(0.1+j) , XgridSize*5, YgridSize*0.8,YgridSize*(0.7+j),area_label[j],color_area_legend[j]);
				}
			}
			};
	

function combo_country(thelist) {
	if (sex_select == "Women") {
		var file_use = "data/HDI_ASR_women_new.csv"; 
	}	
	else {
		var file_use = "data/HDI_ASR_men_new.csv"; 
	}

	d3.csv(file_use,
		function(d) {
			return {
				cl_ord : +d.cl_ord,
				cancer : d.cancer,
				area : d.area,
				area_code : +d.area_code,
				label_country: d.label_country,
				asr: +d.asr,
				worldrank: +d.worldrank,
				hdi_group: +d.hdi_group,
				cancer_code: +d.cancer_code,
				hdi_value: +d.hdi_value,
				cases: +d.cases,
				country_code: +d.country_code
			};	
		},		
		function(data) {

			var idx_1 = thelist.selectedIndex;
			country_select = thelist.options[idx_1].value;
			Flag_selected_country = false
			if (country_select == 0 ){Flag_selected_country = true;}
			selected_country(data, country_select);
		}
	)
}


function populate_ComboCountry(data) {
		
	var datatemp = data.filter(function(d){
		return (d.cancer_code == 1)
	});
	
	var country_list = {};
	for (i=0;i<nb_country; i++ ) {
		country_list[datatemp[i].label_country]=datatemp[i].country_code;
	}
	
	country_text = Object.keys(country_list);
	country_text.sort();

	var select  = document.getElementById("countryList")
	
	for (i=0; i < nb_country; i++ ) {
		var el = document.createElement("option");
		var temp=country_text[i]
		el.textContent = temp;
		el.value =country_list[temp];
		select.appendChild(el);
	}
}


function Heatmap_gen() { // generate heatmap  	
	bool_cluster = false;
		if (sex_select == "Women") {
				
			var file_use = "data/HDI_ASR_women_new.csv"; 
			var nb_site = 30;  
			
		}
				
		else {

			var file_use = "data/HDI_ASR_men_new.csv"; 
			var nb_site = 27;
	
			
		}

		
		d3.csv(file_use,
			
			function(d) {
			return {
				
				cl_ord : +d.cl_ord,
				cancer : d.cancer,
				area : d.area,
				area_code : +d.area_code,
				label_country: d.label_country,
				asr: +d.asr,
				worldrank: +d.worldrank,
				hdi_group: +d.hdi_group,
				cancer_code: +d.cancer_code,
				hdi_value: +d.hdi_value,
				cases: +d.cases,
				country_code: +d.country_code

				
				
				};	
			},		
			function(data) {
			
			var data_cancer=d3.nest()
				.key(function(d) {return d.cancer;})
				.sortKeys(d3.ascending)
				.entries(data)
			

			bar_stack = bar_stack_data(data, data_cancer);

			
			populate_ComboCountry(data);
		
			var xAxis = d3.svg.axis() 
                  .scale(xScale)
                  .orient("bottom")
				  .tickValues([1, 20, 40, 60, 80, 100, 120,140,160,nb_country]);
				  

				  
			var yAxis = d3.svg.axis() 
                  .scale(yScale2)
                  .orient("left")
				  .tickFormat(d3.format("100%"));

				  
			// Define 'div' for tooltips
			var div = d3.select("body").append("div")   
				.attr("class", "tooltip")               
				.style("opacity", 0);
				
			var svg = d3.select("#chart").append("svg") // draw main windows
			  .attr("width", width + margin.left + margin.right)
			  .attr("height", height + margin.top + margin.bottom)
			  .append("g")
			  .attr("class", "heatmap")	
			  .attr("transform", "translate(" + margin.left_page   + "," + margin.top_page  + ")"); 
			  

			svg.append("g") // draw axis
				.attr("class", "axis")
				.attr("transform", "translate(" + (XgridSize/2)+ "," + (yScale(nb_site+1)) + ")")
				.call(xAxis);
			
			for (i = 0; i < 4; i++ ){ // draw legend 
				legend_generator(xScale(nb_country+1) + 5, YgridSize*(0.1+i) , XgridSize*5, YgridSize*0.8,YgridSize*(0.7+i),hdi_label[i],color_hdi[i], select_hdi,i);
			}

			svg.append("g") // draw axis
				.attr("class", "axis2")
				.attr("transform", "translate(-302,0)")
				.call(yAxis);	
			svg.selectAll("rect2")	// draw stack bar
				.data(bar_stack)
				.enter()
				.append("rect")
				.attr("class", "rect_stack")
				.classed("bordered", true)
				.attr("width", 30)
				.attr("height", function(d,i) {return rev_yScale2(d.values);})
				.attr("y", function(d,i) {return rev_yScale2(d.x);})
				.attr("x", -300)
				.attr("fill", function(d,i) {return color_cancer[d.cancer];})
				.on("mouseover", function(d) {      
					div.transition()        
						.duration(200)      
						.style("opacity", .9);      
					div.html("<strong>" + d.cancer + ":</strong><br/>"+ d.cases + " cases<br/>" + Math.round(d.values*100*10)/10 + "%")  
						.style("left", (d3.event.pageX) + "px")     
						.style("top", (d3.event.pageY) + "px");    
					})                  
				.on("mouseout", function(d) {       
					div.transition()        
						.duration(500)      
						.style("opacity", 0);   
				});
				
			svg.append("text") // draw  title
				.attr("class", "title")
				.attr("x", (XgridSize * nb_country) / 2    )
				.attr("y", 0 - 10   )
				.attr("text-anchor", "middle")  
				.style("font-size", "25px") 
				.text(sex_select); 
				
			 
			 svg.append("text") // draw  axis title
				.attr("class", "axis_title")
				.attr("transform","translate(" + ((XgridSize * nb_country) / 2) +  "," + (yScale(nb_site+1) + 35) + ")" ) 
				.attr("text-anchor", "middle")
				.attr("font-family", "sans-serif")
				.attr("font-size", "15px")
				.attr("fill", "black")
				.attr("x", 0 )
				.attr("y", 0 )
				.text("ASR (world) ranking");

			
			
			var heatMap = svg.selectAll() // make 1 group for each cancer sites 
              .data(data_cancer)
              .enter()
			  .append("g")
			  .attr("class", function(d,i) { return "bar" + " bar" + d.key;} )
			  .attr("transform",function(d,i) {return "translate(0," +yScale(i+1) + ")";});
			  
			 heatMap // add label for each group
			  .append("text")
			  .attr("class", "column_label")		
			  .attr("text-anchor", "end")
			  .attr("id", function(d, i) { return d.key;})
			  .attr("transform",function(d,i) {return "translate(" +label_padding + "," +YgridSize/1.5 + ")";})
			  .text(function(d) {return d.key;});
			  
			heatMap // add line for each group
				.append("line")
				.attr("class", "line_stack2") 
				.attr("x1", -200)
				.attr("y1", function(d,i) {return YgridSize/2;})
				.attr("x2", function(d,i) {
						var temp = document.getElementById(d.key).getBBox().width;
						return (temp*-1)-10;
				})
				.attr("y2", function(d,i) {return YgridSize/2;})
				.attr("stroke-width", 0.5)
				.attr("stroke", "black");
			  

			svg.selectAll("line2")
				.data(bar_stack)
				.enter()
				.append("line")
				.attr("class", "line_stack1")
				.attr("x1", -270)
				.attr("y1", function(d,i) {return  rev_yScale2(d.x)+(rev_yScale2(d.values)/2);})
				.attr("x2", -200)
				.attr("y2", function(d,i) {return yScale(i+1)+(YgridSize/2);})
				.attr("stroke-width", 0.5)
				.attr("stroke", "black");
				


				

			
			heatMap.selectAll("rect") // draw each rectangle in the group
			   .data(function(d) {return d.values})
			   .enter()	
			   .append("rect")
			  .attr("class", function(d,i) { return "element" + " element" + d.hdi_group +" co_lab" + d.country_code+ " area" + d.area_code;})
			  .classed("bordered", true)
              .attr("x", function(d,i) { return xScale(nb_country+1-d.worldrank); })
              .attr("y", 0)
			  .attr("rx", 1)
              .attr("ry", 1)
              .attr("width", XgridSize)
              .attr("height", YgridSize)
			  .attr("fill", function(d,i)  {return color_hdi[d.hdi_group];});
			  
			heatMap.selectAll("rect")  // action with the mouse on the rectangle
			  .on("mouseover", function(d) {
				var xPosition = parseFloat(d3.select(this).attr("x")) ;
				var yPosition = parseFloat(d3.select(this).attr("y")) ;
				
				 svg.append("rect")
					.attr("id", "recttip")
					.classed("bordered", true)
					.attr("x", xScale(nb_country+1) + 5 )
					.attr("y", yScale(nb_site - 4 ) + 5  )
					.attr("rx", 10)
					.attr("ry", 10)
					.attr("width", 200)
					.attr("height", 100)
					.attr("opacity",0.8)
					.attr("fill", color_hdi[d.hdi_group]);
				svg.append("text")
					.attr("id", "titletip")
					.attr("x", xScale(nb_country+1) +100 )
					.attr("y", yScale(nb_site - 4) + 5 + 20  )
					.attr("text-anchor", "middle")
					.attr("font-family", "sans-serif")
					.attr("font-size", "15px")
					.attr("font-weight", "bold")
					.attr("fill", "black")
					.text(d.cancer)
				svg.append("text")
					.attr("id", "tooltip")
					.attr("x", xScale(nb_country+1) +100 )
					.attr("y", yScale(nb_site - 4) + 5 + 35    )
					.attr("text-anchor", "middle")
					.attr("font-family", "sans-serif")
					.attr("font-size", "12px")
					.attr("font-weight", "bold")
					.attr("fill", "black")
					.text(d.label_country);
				svg.append("text")
					.attr("id", "asrtip")
					.attr("x", xScale(nb_country+1) +100 )
					.attr("y",yScale(nb_site - 4) + 5 + 55   )
					.attr("text-anchor", "middle")
					.attr("font-family", "sans-serif")
					.attr("font-size", "12px")
					.attr("fill", "black")
					.text("ASR(World): " + d.asr)
				svg.append("text")
					.attr("id", "hditip")
					.attr("x", xScale(nb_country+1) +100 )
					.attr("y", yScale(nb_site - 4) + 5 + 70    )
					.attr("text-anchor", "middle")
					.attr("font-family", "sans-serif")
					.attr("font-size", "12px")
					.attr("fill", "black")
					.text("HDI: " + d.hdi_value)
				svg.append("text")	
					.attr("id", "areatip")
					.attr("x", xScale(nb_country+1) +100  )
					.attr("y", yScale(nb_site - 4) + 5 + 85    )
					.attr("text-anchor", "middle")
					.attr("font-family", "sans-serif")
					.attr("font-size", "12px")
					.attr("fill", "black")
					.text(d.area)
					}
				)
				
			  .on("mouseout", function() {
				d3.select("#recttip").remove();
				d3.select("#tooltip").remove();
				d3.select("#titletip").remove();
				d3.select("#asrtip").remove();
				d3.select("#hditip").remove();
				d3.select("#areatip").remove();
			})
			
				.on("click", function(d,i) {
					selected_country(data, d.country_code);});
			}
		);	
			
	}
		



function sortBars(bool) { // fonction to change batr orders
		
		bool_cluster = bool;
		if (sex_select == "Women") {
				
			var nb_site = 30;  // Sex change  30
			var cl_2 = 20 // Sex change 21
			var cl_1 = 14
			
		}
				
		else {
		
			var nb_site = 27;  
			var cl_2 = 25; 
			var cl_1 = 21; 
		}
		
 		d3.select(".heatmap").selectAll(".rect_stack")	
				.transition()
				.duration(transitionTime)
				.attr("y", function(d,i) {
					if (bool) {	
						return rev_yScale2(d.x_cl);
						}
					else {return rev_yScale2(d.x);
					}
				})
				.attr("fill", function(d,i) {
					if (bool) {
						
						if (d.cl_ord < cl_1) {return  "#2C7BB6";}
						else if (d.cl_ord >=cl_1 & d.cl_ord < cl_2) {return  "#E66101";}
						else if (d.cl_ord >=cl_2) {return  "#33A02C";}
						}
					else {return  color_cancer[d.cancer];}
				});

        d3.select("g").selectAll(".bar")
           .transition()
           .duration(transitionTime)
		   .attr("transform", function(d, i) { 
			var cl_ord = d3.values(d)[1][1].cl_ord;
			if (bool) {	
					
					if (cl_ord < cl_1) {cl_px = 0;}
					else if (cl_ord >=cl_1 & cl_ord < cl_2) {cl_px = 8;}
					else if (cl_ord >=cl_2) {cl_px = 16;}
					
					return "translate(0," +(yScale(cl_ord)+cl_px) + ")";
				}
				
				else {return"translate(0," +yScale(i+1) + ")";};	
           })

		d3.select(".heatmap").selectAll(".column_label")		
           .transition()
           .duration(transitionTime)	
		   .each("start", function(d,i) {	
				if (typeof d.cl_ord === "undefined") {
					var cl_ord = d3.values(d)[1][1].cl_ord;
				}
				else {
					var cl_ord = d.cl_ord
				}
				if (!bool) {
				d3.select(this)
						.classed("text-highlight_orange", false)
						.classed("text-highlight_blue", false)
						.classed("text-highlight_green", false)					
						}
				})
		   .each("end", function(d,i) {	 
				if (typeof d.cl_ord === "undefined") {
					var cl_ord = d3.values(d)[1][1].cl_ord;
				}
				else {
					var cl_ord = d.cl_ord
				}
				if (bool) {
				d3.select(this)
						.classed("text-highlight_orange", function(d,i) {return (cl_ord >= cl_1 & cl_ord < cl_2);})
						.classed("text-highlight_blue", function(d,i) {return cl_ord <cl_1 ;})	
						.classed("text-highlight_green", function(d,i) {return (cl_ord >= cl_2);})
						}
				});
		d3.select(".heatmap").selectAll(".line_stack1")
			.data(bar_stack)
			.transition()
			.duration(transitionTime)
			.attr("y1", function(d,i) {
				if (bool) {
					return rev_yScale2(d.x_cl)+(rev_yScale2(d.values)/2);
				}
				else {
					return rev_yScale2(d.x)+(rev_yScale2(d.values)/2);
				}
				})
				.attr("y2", function(d,i) {
				if (bool) {
					
					if (d.cl_ord < cl_1) {cl_px = 0;}
					else if (d.cl_ord >=cl_1 & d.cl_ord < cl_2) {cl_px = 8;}
					else if (d.cl_ord >=cl_2) {cl_px = 16;}
				
					return yScale(d.cl_ord)+(YgridSize/2)+cl_px;
				}
				else {
					return yScale(i+1)+(YgridSize/2);
				}
			})
			.attr("stroke-width", 0.5)
			.attr("stroke", "black");
				
				
		d3.select(".heatmap").selectAll(".axis")		
           .transition()
           .duration(transitionTime)
		   .attr("transform", function() {
				if (!bool) {
					return  ("translate(" + ((XgridSize/2))+ "," + (yScale(nb_site+1)) + ")");}
				else {return  ("translate(" + (XgridSize/2)+ "," + (yScale(nb_site+1)+16) + ")");}
				});
				
		d3.select("#chart").selectAll(".axis_title")		
           .transition()
           .duration(transitionTime)
		   .attr("transform", function() {
				if (!bool) {
					return  ("translate(" + (XgridSize * nb_country) / 2 +  "," + (yScale(nb_site+1) + 35) + ")" );}
				else {return  ("translate(" + (XgridSize * nb_country) / 2 +  "," + (yScale(nb_site+1) + 35 + 16) + ")" );}
				});
		};
	



function legend_generator(x, y , width, height,text_y,text,fill,onclick,onclick_arg) { // function to create legend 
		
	d3.selectAll(".heatmap").append("rect")
		.attr("x", x)
		.attr("y", y)
		.attr("class", "rect_legend")
		.classed("bordered", true)
		.attr("rx", 1)
		.attr("ry", 1)
		.attr("width", width)
		.attr("height", height )
		.attr("fill",  fill)
		.on("click", function() {  onclick(onclick_arg);});
		
	d3.selectAll(".heatmap").append("text")
		.attr("x", x + width  +2  )
		.attr("y", text_y  )
		.attr("class", "text_legend")
		.attr("text-anchor", "Left")
		.attr("font-family", "sans-serif")
		.attr("font-size", "12px")
		.attr("fill", "black")
		.text(text);		
};


function select_hdi(hdi_group) { // show only 1 hdi category

	if (!Flag_selected_country) { // do nothing if only one country select
		
		if (sex_select == "Women") {
			var file_use = "data/HDI_ASR_women_new.csv"; 
		}	
		else {

		var file_use = "data/HDI_ASR_men_new.csv";  
		}
	
		d3.csv(file_use,
	
			function(d) {
				return {
		
					cl_ord : +d.cl_ord,
					cancer : d.cancer,
					area : d.area,
					area_code : +d.area_code,
					label_country: d.label_country,
					asr: +d.asr,
					worldrank: +d.worldrank,
					hdi_group: +d.hdi_group,
					cancer_code: +d.cancer_code,
					hdi_value: +d.hdi_value,
					cases: +d.cases,
					country_code: +d.country_code

				};	
			},		
			function(data) {
	
				if (element_display == true) {	
		
					var datatemp = data;
				}
				else {
					
					var datatemp = data.filter(function(d){
						return (d.hdi_group == hdi_group)
					});
				}

				var data_cancer=d3.nest()
					.key(function(d) {return d.cancer;})
					.sortKeys(d3.ascending)
					.entries(datatemp)
		
				bar_stack = bar_stack_data(datatemp, data_cancer);
	
				d3.select(".heatmap").selectAll(".rect_stack")	
					.data(bar_stack)
					.transition()
					.duration(transitionTime)
					.attr("height", function(d,i) {return rev_yScale2(d.values);})
					.attr("y", function(d,i) {
						if (bool_cluster) {	
							return rev_yScale2(d.x_cl);
						}
						else {return rev_yScale2(d.x);}
					})
			
				d3.select(".heatmap").selectAll(".line_stack1")
					.data(bar_stack)
					.transition()
					.duration(transitionTime)
					.attr("y1", function(d,i) {
						if (bool_cluster) {
							return rev_yScale2(d.x_cl)+(rev_yScale2(d.values)/2);
						}
						else {
							return rev_yScale2(d.x)+(rev_yScale2(d.values)/2);
						}
					})
					.attr("stroke-width", 0.5)
					.attr("stroke", "black");
			}
		)	
	
		if (element_display == false) {			
			d3.select("#chart").selectAll(".element")
				.style("display", "inline");
		}
		else {
			d3.select("#chart").selectAll(".element:not(.element" + hdi_group +")")
				.style("display", "none");
		}
		
		element_display = !(element_display);
	}
};
	
		
function selected_country(data,country_code) { // function to show only one country
			element_display = true		
			
			if (Flag_selected_country == false) {
			
				var datatemp = data.filter(function(d)
				{
				return (d.country_code == country_code)
				});
			}
			else {
			datatemp = data;
			}

			var data_cancer=d3.nest()
				.key(function(d) {return d.cancer;})
				.sortKeys(d3.ascending)
				.entries(datatemp)
			
			bar_stack = bar_stack_data(datatemp, data_cancer);
			
			d3.select(".heatmap").selectAll(".rect_stack")	
				.data(bar_stack)
				.transition()
				.duration(transitionTime)
				.attr("height", function(d,i) {return rev_yScale2(d.values);})
				.attr("y", function(d,i) {
						if (bool_cluster) {	
						return rev_yScale2(d.x_cl);
						}
					else {return rev_yScale2(d.x);}
					})

			if (Flag_selected_country == false) {
			
				d3.select("#chart")
				.selectAll(".column_label")
				.data(datatemp)
				.transition()
				.duration(500)
				.attr("x", function(d) {return xScale(nb_country+1 - d.worldrank) ;});
		
				d3.select("#chart")
				.transition()
				.selectAll(".element")
				.style("display", "none");
				
				d3.select("#chart")
				.transition()
				.selectAll(".element.co_lab" + country_code)
				.style("display", "inline");
				
				d3.select("#chart")
				.selectAll(".title")
				.data(datatemp)
				.text( function(d) {return sex_select + ", " + d.label_country;});
				
				}
			
			else {
			
				d3.select("#chart")
				.selectAll(".column_label")
				.transition()
				.duration(500)
				.attr("x", 0)
				
				d3.select("#chart")
				.selectAll(".element")
				.transition()
				.delay(500)
				.style("display", "inline");
				
				d3.select("#chart")
				.selectAll(".title")
				.text(sex_select);
				
				document.getElementById('countryList').selectedIndex = 0;
				
			}
			
			d3.select(".heatmap").selectAll(".line_stack1")
				.data(bar_stack)
				.transition()
				.duration(transitionTime)
				.attr("y1", function(d,i) {
				if (bool_cluster) {
					return rev_yScale2(d.x_cl)+(rev_yScale2(d.values)/2);
				}
				else {
					return rev_yScale2(d.x)+(rev_yScale2(d.values)/2);
				}
				})
				.attr("stroke-width", 0.5)
				.attr("stroke", "black");
				
			Flag_selected_country = !Flag_selected_country
		};

function bar_stack_data(data, data_cancer) {
		
	var sumTotal = d3.sum(data, function(d) {return d.cases})
	
	var sumOfCases = d3.nest()
		.key(function(d) {return d.cancer;})
		.rollup(function(v) {return (d3.sum(v, function(d) {return d.cases;}))  ;})
		.entries(data)

	var temp_stack = [];
	for (i=0; i<Object.keys(sumOfCases).length; i++ ) {
		temp_stack.push({
			cancer: sumOfCases[i].key,
			values: sumOfCases[i].values/sumTotal,
			cl_ord: data_cancer[i].values[0].cl_ord,
		});
	}
	temp_stack.sort(function(x, y){
		return d3.ascending(x.cl_ord, y.cl_ord);
	})
	var cl_stack = [];
	cl_stack.push({
		cancer: temp_stack[0].cancer,
		x_cl: 0,
		cl_ord: temp_stack[0].cl_ord
	})

	var temp = 0;
	for (i=1; i<Object.keys(sumOfCases).length; i++ ) {
		cl_stack.push({
			cancer: temp_stack[i].cancer,
			x_cl: temp_stack[i-1].values + temp,
			cl_ord: temp_stack[i].cl_ord
		})
		temp = temp_stack[i-1].values + temp;
	}
	cl_stack.sort(function(x, y){
		return d3.ascending(x.cancer, y.cancer);
	})
	var x_stack = [];
	x_stack.push(0);
	var temp = 0;
	for (i=1; i<Object.keys(sumOfCases).length; i++ ) {
		x_stack.push(sumOfCases[i-1].values/sumTotal + temp);
		temp = sumOfCases[i-1].values/sumTotal + temp;
	}
	
	var bar_stack = [];

	for (i=0; i<Object.keys(sumOfCases).length; i++ ) {
		bar_stack.push({
			cancer: sumOfCases[i].key,
			values: sumOfCases[i].values/sumTotal,
			x: x_stack[i],
			x_cl : cl_stack[i].x_cl,
			cl_ord :  cl_stack[i].cl_ord,
			cases: sumOfCases[i].values
		});

	}
	return bar_stack;
}
		
				
