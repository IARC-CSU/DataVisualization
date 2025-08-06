	
	var PROJECT 			= 'map' ; 
    
    let uri     = window.location.search.substring(1); 
    let params  = new URLSearchParams(uri);
    let file    = "fellows.json"
    let version = params.get('version') ;
    // console.info("version",version) ; 

    let colors = ['#d4b9da', '#c994c7', '#df65b0', '#dd1c77', '#980043'] ; 

    let key_year = "1966_1989" ; // 1966_1989 | 1990_2023
    if ( parseInt( version ) == 2) key_year = "1990_2023" ; 
    if ( parseInt( version ) == 3) {
        key_year = "number" ; 
        file = "fellows_iarc60.json"
    }

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
            'scale' : 310 , 
            'key_data_value' : 'value' , 
            'globe_translate' : { 'x' : -50 , 'y' : 150 } , 
            'legend_translate' : 
            { 
                'x' : 1000 , 
                'y' : 600 
            },
            'projection' : 'natural-earth' , 
            'legend_suffix' : '' , 
            'color_scale' : 'quantize' ,
            'background_globe' : '#fff', 
            'key_label_value' : 'ASR',
            'callback_click' : 'funcClickMap' , 
            'callback_mousehover' : 'funcHoverMap' , 
            'callback_mouseout' : 'funcOutMap' , 
            'copyright' : false , 
            'legend' : true
        }, 
        'downloads' : false 
     } ;

   //  var oMap = new CanChart( dataviz_conf ).render() ;

    var hpv_countries = [
        
    ] ;

    var colorHPV = '#e35d56';
    let color_paletter  = 'PuRd';
    if ( parseInt( version ) == 3) color_paletter = 'YlGnBu'

    setTimeout(function(){

        let title = " Geographical distribution of online learners who have registered to the IARC learning platform " + key_year.replace('_','-') ; 
        
        if ( parseInt( version ) == 3)
            title = "Geographical distribution of online learners who have registered to the IARC learning platform, from 2019 to 2025"

        $('h1.title').text( title ) ; 

        d3.json( 'data/' + file , function( error , fellows_data ) {

            let totals = [] ; 

            fellows_data.map( f => {
                totals.push( f["1966_1989"])  
                totals.push( f["1990_2023"])  
            })

            /*console.log({
                totals : totals , 
                max : d3.max(totals), 
                min : d3.min(totals)
            })*/

    	    var dataset = [] ; 
            
            for ( var j in fellows_data ) 
            {
                dataset.push({
                    'label' : fellows_data[j].label , 
                    'ISO_3_CODE' : fellows_data[j].ISO , 
                    'value' : fellows_data[j][key_year] , 
                    'globocan_id' :fellows_data[j].globocan_id 
                }); 
            }

            dataviz_conf.data.src = dataset.filter( d => d.value > 0 ) ; 
            dataviz_conf.chart.default_color = color_paletter ; 

            CanMapGraphNbColors = 4 ;
            if ( parseInt( version ) == 3) CanMapGraphNbColors = 8 ; 


            var oMap = new CanChart( dataviz_conf ).render() ;

            

        })


	    // legend
		/*var CanGraphGroupLegend = d3.selectAll('#map-graph').append('g').attr('class','groupLegend') ;

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
        ;*/

        /*var t = textures.lines().heavier();

        CanMapSvg.call(t);

        CanMapSvg.append("circle")
  			.style("fill", t.url());*/

	},500);

    var funcOutMap = function(){ return false ; }