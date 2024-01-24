    
    var PROJECT             = 'map' ; 

    var gradients           = ['#0099cc' ] ; 
    
    var width = $(window).width()  ; 
    var height = $(window).height() - 150  ; 

    if ( width > 1480 )
    {
        var scale = 320 ; 
        var map_translate = { 'x' : -50 , 'y' : 200 }  ; 
        var legend_translate = { 'x' : -250  , 'y' : 650 } ; 
    }
    else
    {
        var scale = 220 ; 
        var map_translate = { 'x' : -50 , 'y' : 80 }  ; 
        var legend_translate = { 'x' : -150  , 'y' : 450 } ; 
    }

    var dataviz_conf = {
        'type'      : 'map' , 
        'title'     : false , 
        'width'     : width  , 
        'height'    : height  , 
        'container' : '#map-container',
        'id'        : 'map-graph' , 
        'data'      : { 'src' : [] },
        'chart' : {
            'scale' : scale , 
            'globe_translate' : map_translate , 
            'color_scale' : 'quantile' ,
            'background_globe' : 'transparent', 
            'copyright' : false , 
            'default_color' : 'OrRd' , 
            //'fill_color' : '#0099cc' , 
            'colors' : gradients , 
            'legend_translate' : legend_translate
        }, 
        'downloads' : false 
     } ;

    var type = 0 ; 

    setTimeout(function(){
        
        var color_paletter  = 'YlOrBr';

        d3.json("data/gicr-courses.json", function( error , json ) {
            
            var dataset = [] ; 
            
            for ( var j in json ) 
            {
                dataset.push({
                    'label' : json[j].COUNTRY , 
                    'value' : json[j].number ,
                    'ISO_2_CODE' : json[j].ISO_2_CODE ,
                    'globocan_id' : undefined , 
                    'color' : '#f0f0f0' /* #0099cc */
                }); 
            }

            dataviz_conf.data.src = dataset ; 
            dataviz_conf.chart.default_color = color_paletter ; 

            CanMapGraphNbColors = 4 ;
            var oMap = new CanChart( dataviz_conf ).render() ;

            // oMap.vizInstance.reload( dataset , { color : 'Reds' } ) ; 


        });
        
    },500);

