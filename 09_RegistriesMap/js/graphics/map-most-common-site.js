    
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
            'hd' : true , 
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

    
    var regions = [
        {
            'id' : 1 , 
            'label' : 'Sub-Saharan Africa' , 
            'key_group' : 'area' , 
            'key_value' : [1,2,4,5] , 
            'zoom_country' : 'COD',
            'show_labels' : ['BFA','CAF','NER','LBR','BWA','CIV','TGO','SEN','NGA','ZWE','MOZ','ZMB','MDG','COG','MRT','TCD','COD','MLI','TCD','GIN','SSD','CMR','AGO','TZA','ZAF','SOM','ETH','NAM','GAB','KEN'],
            'scale' : 2.1
        },
        {
            'id' : 2 , 
            'label' : 'Latin America and Caribbean' , 
            'key_group' : 'continent' , 
            'key_value' : 2 , 
            'zoom_country' : 'PER',
            'show_labels' : ['PER','PRY','BRA','ARG','MEX','COL','VEN','GTM','NIC','ECU','URY','CHL','CUB','DOM','SUR','BOL']
        },
        {
            'id' : 3 , 
            'label' : 'Europe' , 
            'key_group' : 'continent' , 
            'key_value' : 5 , 
            'zoom_country' : 'KAZ',
            'show_labels' : ['RUS','ISL','FRA','NOR','SWE','EST','GBR','IRL','ESP','PRT','ITA','DEU','POL','FIN','BLR','UKR','CZE','ROU','HUN','BGR','AUT','CHE','BIH','GRC','BEL','NLD'], 
            'scale' : 2.1
        },
        {
            'id' : 4 , 
            'label' : 'North America' , 
            'key_group' : 'continent' , 
            'key_value' : 3 , 
            'zoom_country' : 'USA',
            'show_labels' : ['USA','CAN'] , 
            'scale' : 2
        },
        {
            'id' : 5 , 
            'label' : 'Southern, Eastern, and Southeastern Asia' , 
            'key_group' : 'area' , 
            'key_value' : [10,11] ,
            'key_countries' : [4,50,64,356,462,524,586,144,364] , 
            'zoom_country' : 'BGD',
            'show_labels' : ['IRN','AFG','CHN','MNG','PAK','IND','NPL','BTN','MMR','LAO','THA','KHM','IDN','PRK','KOR','JPN','PHL','BGD','MYS'],
            'scale' : 2
        },
        {
            'id' : 6 , 
            'label' : 'Northern Africa, Central Asia, and Western Asia' , 
            'key_group' : 'area' , 
            'key_value' : [3,13] ,
            'key_countries' : [398,417,762,795,860] , 
            'zoom_country' : 'JOR',
            'show_labels' : ['MAR','DZA','LBY','EGY','SDN','TUR','SYR','JOR','SAU','YEM','OMN','KAZ','UZB','TKM','KGZ','TJK','KWT','ARE','QAT','GEO','AZE'],
            'scale' : 2.5
        },
        // Wetern pacific is specificaly Oceania
        {
            'id' : 7 , 
            'label' : 'Western Pacific (Oceania)' , 
            'key_group' : 'continent' , 
            'key_value' : 6 , 
            'zoom_country' : 'AUS',
            'scale' : 2.8 , 
            'show_labels' : ['AUS','PNG','NZL','VUT','SLB','NCL'] , 

        }
    ] ; 

    var remote_url = 'http://www.gco.local:8080/api/globocan/v1/2018/top_cancers/'+type+'/0/all/?grouping_cancer=1&include_nmsc=1&field_key=asr' ; 
    var remote_populations = 'http://www.gco.local:8080/api/globocan/v1/2018/meta/populations/all/' ; 
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
            .defer( d3.json, remote_populations )
            .await( ( error , geometries , populations ) => { 

                var dataset = [] ; 
                var color = '#7d7d7d' ;
                var o_region = undefined ;

                if ( parameters.region != 0 )
                {
                    o_region = getRegionInfo( parameters.region ) ; 
                    location_pop = o_region.label ; 
                    // console.info( typeof( o_region.key_value ) ) ; 
                }

                // grab info continent and region 
                for( var geo in geometries )
                {
                    let poly = geometries[geo] ;
                    for ( var p in populations )
                    {
                        if ( populations[p].country == poly.globocan_id )
                        {
                            geometries[geo].population = populations[p] ; 
                            break ; 
                        }
                    }
                }
                var data_cancers = [] ; 

                for ( var j in geometries ) 
                {
                    // set color 
                    if ( parameters.region == 0 )
                    {
                        color = geometries[j].color ; 
                        data_cancers.push(geometries[j]) ; 
                    }
                    else
                    {
                        color = '#f0f0f0' ;
                        if ( o_region != undefined )
                        {
                            // console.info( typeof( o_region.key_value ) ) ; 
                            if ( typeof( o_region.key_value ) == 'number' )
                            {
                                if ( geometries[j].population[ o_region.key_group ] == o_region.key_value )
                                {
                                    color = geometries[j].color ; 
                                    data_cancers.push(geometries[j]) ; 
                                }
                            }
                            else if ( o_region.key_value.length > 1 )
                            {
                                for ( var v in o_region.key_value )
                                {
                                    if ( geometries[j].population[ o_region.key_group ] == o_region.key_value[v] )
                                    {
                                        color = geometries[j].color ; 
                                        data_cancers.push(geometries[j]) ;
                                    }
                                }

                            }

                            if ( o_region.key_countries != undefined )
                            {
                                for ( var v in o_region.key_countries )
                                {
                                    if ( geometries[j].population.country == o_region.key_countries[v] )
                                    {
                                        color = geometries[j].color ; 
                                        data_cancers.push(geometries[j]) ;
                                    }
                                }

                            }
                        }
                    }

                    dataset.push({
                        'label'         : geometries[j].label , 
                        'globocan_id'   : geometries[j].globocan_id , 
                        'color'         : color , 
                    }); 
                }

                dataviz_conf.data.src = dataset ; 

                var oMap = new CanChart( dataviz_conf ).render() ;

                // title 
                let indicator = ( parameters.type == 0 ) ? 'incidence' : 'mortality' ; 
                let graph_title = 'Top cancer per country, estimated age-standardized '+indicator+' rates ('+location_pop+') in 2018, both sexes, all ages' ; 
                
                $('h1#graph_title').text( graph_title );

                if ( parameters.region != 0 )
                {
                    setTimeout(()=>{

                        zoomRegion( o_region.zoom_country , {} , o_region.scale ) ; 

                        let iso = '' ; 

                        for ( var r in o_region.show_labels )
                        {
                            iso = o_region.show_labels[r] ; 
                            $('text.country-txt-'+iso).css('display','block') ; 
                        }

                        

                    },1000) ; 
                    
                }

                setTimeout(()=>{

                    var legends = _.uniq( data_cancers , false , function(p){ return p.cancer ; });

                    for ( var l in legends )
                    {
                        legends[l].count = 0 ; 
                        for ( var t in data_cancers )
                        {
                          if ( int( legends[l].cancer ) == int( data_cancers[t].cancer ) 
                            || legends[l].label == data_cancers[t].label )
                          legends[l].count++ ;
                        }
                    }

                    let leg = '' ; 

                    legends = sortByKey( legends , 'count' , 'ASC' ) ; 

                    for ( var l in legends )
                    {
                        var bg = 'style="background-color:'+legends[l].color+';"' ; 
                        leg = '<li><span class="box no_data" '+bg+'></span>' ; 
                        leg += '<span class="box_label"> '+legends[l].cancer_name+' ('+legends[l].count+')</span></li>';
                        $('ul.legend').prepend(leg) ;
                    }

                 },1000) ; 
            });

    },500);


    var getRegionInfo = function( region_id ){
        for ( var r in regions )
        {
            if ( regions[r].id == region_id )
            {
                return regions[r] ; 
                break ; 
            }
        }
    }

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