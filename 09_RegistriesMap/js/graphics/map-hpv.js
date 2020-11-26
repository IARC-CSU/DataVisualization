	
	var PROJECT 			= 'map' ; 

	var dataviz_conf = {
        'type'      : 'map' , 
        'title'     : false , 
        'width'     : $(window).width()  , 
        'height'    : $(window).height() - 150  , 
        'container' : '#map-container',
        'id'        : 'map-graph' , 
        'data'      : {
            'format' : 'json',
            'src'    : [{ 'label' : 'Test' , 'value' : 10 },{ 'label' : 'Test' , 'value' : 10 }]
        },
        'chart' : {
            'scale' : 320 , 
            'key_data_value' : 'value' , 
            'globe_translate' : { 'x' : -50 , 'y' : 200 } , 
            'projection' : 'natural-earth' , 
            'legend_suffix' : '' , 
            'color_scale' : 'quantile' ,
            'background_globe' : '#fff', 
            'key_label_value' : 'ASR',
            'callback_click' : 'funcClickMap' , 
            'callback_mousehover' : 'funcHoverMap' , 
            'callback_mouseout' : 'funcOutMap' , 
            'copyright' : false , 
            'legend' : false
        }, 
        'downloads' : false 
     } ;

    var oMap = new CanChart( dataviz_conf ).render() ;

    var hpv_countries = [
    // America
    'USA','CAN','MEX','BRA','HDN','PER','ARG','URY','CHI','ECU','COL','CHL','BRB','PRY','SJM','HND','PAN','GUY','SUR','SMR','BHS',
    // Europe
    'FRA','GBR','IRL','ISL','PRT','ESP','ITA','DEU','DNK','BEL','AUT','LUX','CHE','NLD','CZE','HUN','GRC','MCO','AND','NOR','FIN','SWE','RUS','GRL','LVA','MKD',
    // Asia
    'KAZ','BTN','MYS','KOR','JPN','PHL',
    // Africa
    'BWA','ZAF','UGA','SYC','LBY',
    // Ocenania
    'AUS','NZL','COK','PLW','FSM','MHL','FJI',
    ] ;

    var colorHPV = '#e35d56';

    setTimeout(function(){
	    for ( var c in hpv_countries  )
	    {
	    	$( 'path#code_'+hpv_countries[c] ).attr('fill',colorHPV) ;
	    }


	    // legend
		var CanGraphGroupLegend = d3.selectAll('#map-graph').append('g').attr('class','groupLegend') ;

		var CanGraphMaplegend = CanGraphGroupLegend.selectAll('g.legendEntry')
	        .data([
	        	{ 'label' : 'Introduced (includes partial introduction) to date (69 countries or 35.6%)' , 'color' : colorHPV },
	        	{ 'label' : 'Not WHO Member State or Not Introduced/No Plans (125 countries or 64.4%)' , 'color' : '#f0f0f0'},
	        	{ 'label' : 'Not applicable' , 'color' : '#7d7d7d' }
	        ])
	        .enter()
	        .append('g')
	        .attr('class', 'legendEntry') ;

	    var containerLegend = CanGraphGroupLegend.append('rect')
	        .attr('class','containerLegend')
	        .style('fill','transparent') 
	    ;

	    var xLegend = 750 ; 
	    var yLegend = 760 ; 

	    CanGraphMaplegend
		    .append('rect')
		    .attr('class','rect_Legend')
		    .attr("x", xLegend ) 
		    .attr("y", function(d, i) {
		        return yLegend + (i * 25) + 2; 
		    })
		   .attr("width", 50 )
		   .attr("height", 20 )
		   .style("stroke","#cccccc")
		   .style("stroke-width", "0.5px")
		   .style("fill", function(d){return d.color;})
		; 

		CanGraphMaplegend
            .append('text')
            .attr('class','text_Legend')
            .attr("x",  xLegend + 55 )  // leave 5 pixel space after the <rect>
            .attr("y", function(d, i) {
               return yLegend + (i * 25) + 2; 
            })
            .style('font-size','13px')
            .attr("dy", "0.9em") // place text one line *below* the x,y point
            .text(function(d,i) {
                return d.label ; 
            })
        ;

        /*var t = textures.lines().heavier();

        CanMapSvg.call(t);

        CanMapSvg.append("circle")
  			.style("fill", t.url());*/

	},500);

	

    var funcOutMap = function(){ return false ; }