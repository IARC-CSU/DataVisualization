	
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
            'scale' : 300 , 
            'key_data_value' : 'value' , 
            'globe_translate' : { 'x' : -50 , 'y' : 130 } , 
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
    let continents = [] , colors = [
        { 'id' : 1 ,'label' : 'Africa' , 'country' : 903 , 'color' : '#e51919' , 'text_color' : '#fff' ,  'sort' : 1 } ,  // old 
        { 'id' : 3 ,'label' : 'Northern America' , 'short_label' : 'North America', 'text_color' : '#fff' , 'country' : 905 , 'color' : '#7A263C' , 'sort' : 5} , 
        { 'id' : 2 ,'label' : 'Latin America and the Caribbean' , 'short_label' : 'South America' ,  'country' : 904 , 'color' : '#F6F31E', 'sort' : 4} , 
        { 'id' : 4 ,'label' : 'Asia' , 'country' : 935 , 'color' : '#2EAD10' , 'sort' : 2} ,
        { 'id' : 5 ,'label' : 'Europe' , 'country' : 908 , 'color' : '#196be5',  'text_color' : '#fff' , 'sort' : 3} ,
        { 'id' : 6  ,'label' : 'Oceania' , 'country' : 909 , 'color' : '#e519d1', 'sort' : 6 ,'text_color' : '#fff' }
    ] ; 

    setTimeout(() => {
       
        d3.json("data/globocan_populations.json", function( error , json ) {

            json.forEach( j => {
                continents[j.country_code] = j.continent_code ; 
            })
            
            let cont , continent_id ; 
            d3.selectAll('path.country')
                .attr('fill',(d)=>{
                    if ( continents[d.properties.globocan_id] != undefined ){
                        
                        // console.log(d.properties.globocan_country,continents[d.properties.globocan_id]);
                        
                        continent_id = continents[d.properties.globocan_id] ; 
                        cont = colors.find( c => c.id == continent_id )

                        return cont.color ; 
                        // if( area_id == parseFloat(d.properties.area_id)) return continent.color ;  
                    }
                    else
                        return '#ccc' ; 
                })
                .style('stroke',(d)=>{
                    if ( continents[d.properties.globocan_id] != undefined ){
                        
                        // console.log(d.properties.globocan_country,continents[d.properties.globocan_id]);
                        continent_id = continents[d.properties.globocan_id] ; 
                        cont = colors.find( c => c.id == continent_id )

                        return cont.color ; 
                        // if( area_id == parseFloat(d.properties.area_id)) return continent.color ;  
                    }
                    else
                        return 'red' ; 
                })

            }) ;

    }, 500)
    

    var funcOutMap = function(){ return false ; }