    
    var PROJECT             = 'map' ; 

    var dataviz_conf = {
        'type'      : 'map' , 
        'title'     : false , 
        'width'     : $(window).width()  , 
        'height'    : $(window).height() - 150  , 
        'container' : '#map-container',
        'id'        : 'map-graph' , 
        'data'      : { 'src' : [] },
        'chart' : {
            'scale' : 320 , 
            'globe_translate' : { 'x' : -50 , 'y' : 200 } , 
            'color_scale' : 'quantile' ,
            'background_globe' : '#fff', 
            'copyright' : false , 
            'default_color' : 'OrRd' , 
            'legend_translate' : { 'x' : -250  , 'y' : 650 }
        }, 
        'downloads' : false 
     } ;

    var type = 0 ; 

    setTimeout(function(){
        
        var color_paletter  = 'YlOrBr';

        d3.json("data/fellows-1966-2017.json", function( error , json ) {
            
            var dataset = [] ; 
            
            for ( var j in json ) 
            {
                dataset.push({
                    'label' : json[j].COUNTRY , 
                    'value' : json[j].number ,
                    'ISO_2_CODE' : json[j].ISO_2_CODE ,
                    'globocan_id' : undefined , 
                }); 
            }

            dataviz_conf.data.src = dataset ; 
            dataviz_conf.chart.default_color = color_paletter ; 

            CanMapGraphNbColors = 4 ;
            var oMap = new CanChart( dataviz_conf ).render() ;

            /*var mapGroup = document.getElementById('mapGroup')
            panzoom(mapGroup) ;*/


        });
        
    },500);

