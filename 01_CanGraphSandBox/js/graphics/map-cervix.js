	
	var PROJECT 			= 'map' ; 

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
	    
        if ( type == 0 )
        {
            var title_map       = 'Estimated age-standardized rates (World) of incident cases, cervical cancer, worldwide in 2012';
            var file_suffixe    = 'incidence' ; 
            var color_paletter  = 'Blues';
        }
        else
        {
            var title_map       = 'Estimated age-standardized rates (World) of deaths, cervical cancer, worldwide in 2012';
            var file_suffixe    = 'mortality' ;
            var color_paletter  = 'OrRd';
        }

        $('#title-map').text( title_map ) ; 

        d3.json("data/ASR_cervix_2012-"+file_suffixe+".json", function( error , json ) {
            
            var dataset = [] ; 
            
            for ( var j in json ) 
            {
                dataset.push({
                    'label' : json[j].label , 
                    'value' : json[j].asr , 
                    'globocan_id' : Math.abs(json[j].COUNTRY) , 
                }); 
            }

            dataviz_conf.data.src = dataset ; 
            dataviz_conf.chart.default_color = color_paletter ; 

            var oMap = new CanChart( dataviz_conf ).render() ;

        });
        
	},500);

