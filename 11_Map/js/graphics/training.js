    
    var PROJECT             = 'map' ; 

    var applicant           = true ; 
    var completed           = false ;

    let graph_title         = 'Trainings : number of applicants (478)' ; 
    let key_str             = 'application' ; 
    var gradients           = ['#ffffd4','#bdc9e1','#67a9cf','#0570b0'] ; 
    let gradients_labels    = ['<10','[10-50]','[50-100]','>100']
    let color_no_data       = '#f0f0f0' ;
    
    var width = $(window).width()  ; 
    var height = $(window).height() - 150  ; 

    if ( width > 1480 )
    {
        var scale = 300 ; 
        var map_translate = { 'x' : -50 , 'y' : 130 }  ; 
        var legend_translate = { 'x' : -250  , 'y' : 650 } ; 
    }
    else
    {
        var scale = 220 ; 
        var map_translate = { 'x' : -50 , 'y' : 60 }  ; 
        var legend_translate = { 'x' : -150  , 'y' : 450 } ; 
    }

    if ( document.location.hash == '#completed' ){
        completed = true ; 
        graph_title = 'Trainings : number completed (78)' ; 
        key_str = 'completed' ;
        gradients = ['#fd8d3c','#e31a1c'] ; 
        gradients_labels    = ['<=10','>10']
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
            'hd' : false , 
            'globe_translate' : map_translate , 
            'color_scale' : 'quantile' ,
            'background_globe' : '#fff', 
            'copyright' : false , 
            'default_color' : 'OrRd' , 
            //'fill_color' : '#0099cc' , 
            'colors' : gradients , 
            'legend_translate' : legend_translate
        }, 
        'downloads' : false 
     } ;

    
    
    var remote_url = 'https://gco.iarc.fr/api/globocan/v1/2018/top_cancers/'+type+'/0/all/?grouping_cancer=1&include_nmsc=1&field_key=asr' ; 
    var remote_trainings = '/data/trainings.json' ; 
    var type = 0 ; 

    var url = new URL( document.location.href );
    var parameters = {
        'type' : Math.abs( url.searchParams.get( "type" ) ) , 
        'region' : Math.abs( url.searchParams.get( "region" ) ) , 
    }

    var location_pop = 'World' ; 

    type = parameters.type ; 

    setTimeout(function(){
        
        var color_paletter  = 'YlOrBr';

        queue()     
            .defer( d3.json, remote_url )
            .defer( d3.json, remote_trainings )
            .await( ( error , geometries , trainings ) => { 

                // console.info("application",trainings.application,"completed",trainings.completed) ; 

                var dataset = [] ; 
                var color = '#7d7d7d' ;
            
                var data_cancers = [] , row_country , dataset_in = [] ;
                let num , pos ; 

                trainings[key_str].forEach((a)=>{

                    row_country = geometries.find( g => a.country == g.label ) ;

                    if ( row_country == undefined ){

                        row_country = geometries.find( g => a.code == g.ISO_3_CODE ) ; 
                        
                        if ( row_country == undefined )
                            console.error("row_country",a.country,row_country)
                    } else {

                        num = parseFloat(a[key_str]) ;
                        pos = 0  ; 

                        if(  completed == false ){
                            if ( num > 100 ) pos = 3 ; 
                            else if ( num >= 50 && num <= 100 ) pos = 2 ; 
                            else if ( num >= 10 && num <= 50) pos = 1 ; 
                            else if ( num > 0 && num <= 10 ) pos = 0 ; 
                        }
                        else{
                            if ( num > 10 ) pos = 1 ;
                            else pos = 0 ;  
                        }

                        dataset_in.push({
                            label : a.country , 
                            globocan_id : row_country.globocan_id ,
                            iso : row_country ,
                            num : num , 
                            range : pos ,
                            color : gradients[pos]
                        })
                    }
                    // 
                })
                
                let data_row , value ; 

                // console.log("dataset_in",dataset_in)
                for ( var j in geometries ) 
                {
                    data_row = undefined
                    color = color_no_data ;
                    value = 0 ; 
                    data_row = dataset_in.find(d => d.globocan_id == geometries[j].globocan_id)
                    // console.info("data_row",data_row) ; 
                    if ( data_row != undefined ) {
                        color = data_row.color ; 
                        value = data_row.num ; 
                    } else {
                        color = color_no_data ;
                    }
                    
                    dataset.push({
                        'label'         : geometries[j].label , 
                        'globocan_id'   : geometries[j].globocan_id , 
                        'color'    : color , 
                        'value'         : value
                    }); 
                }

                // console.info("dataset",dataset) ; 

                dataviz_conf.data.src = dataset ; 

                var oMap = new CanChart( dataviz_conf ).render() ;

                // title 
                let indicator = ( parameters.type == 0 ) ? 'incidence' : 'mortality' ; 
                
                
                $('h1#graph_title').text( graph_title );

                setTimeout(()=>{

                    var legends = [] ; 

                    gradients_labels.reverse();

                    gradients_labels.forEach( (g,i)=>{
                        legends.push({
                            color: gradients[i] , row_country , 
                            label : g
                        })
                    })

                    legends.reverse();

                    for ( var l in legends )
                    {
                        var bg = 'style="background-color:'+legends[l].color+';"' ; 
                        leg = '<li><span class="box no_data" '+bg+'></span>' ; 
                        leg += '<span class="box_label"> '+legends[l].label+'</span></li>';
                        $('ul.legend').prepend(leg) ;
                    }

                 },1000) ; 
            });

    },500);


    function sortByKey( array, key , direction) {
        var direction ; 
        
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            if ( direction == undefined )
              return ((x > y) ? -1 : ((x < y) ? 1 : 0));
            else if ( direction == 'ASC' )
              return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }