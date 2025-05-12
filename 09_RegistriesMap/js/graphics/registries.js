    
    var PROJECT             = 'registries' ; 

    var gradients           = ['#0099cc' ] ; 
    
    var width = $(window).width()  ; 
    var height = $(window).height() - 150  ; 

    var scale = 280 ; 
    var map_translate = { 'x' : 0 , 'y' : 140 }  ; 
    var legend_translate = { 'x' : -150  , 'y' : 450 } ; 

    var level = 0 ; 

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
            'show_country_text' : true , 
            //'fill_color' : '#0099cc' , 
            'colors' : gradients , 
            'legend_translate' : legend_translate
        }, 
        'downloads' : false 
     } ;

    var api_host = 'http://www.gco.local:8080' ; // http://www.gco.local:8080 https://gco.iarc.fr
    var dataviz_host = 'http://gcodev.nanga.iarc.lan' ; // http://gcodev.nanga.iarc.lan' ; 'http://localhost:8084'
    
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

    var continents_labels = {
        'Africa' : 1 , 
        'America Latin' : 2 , 
        'America North' : 3 , 
        'Asia'   : 4 , 
        'Europe' : 5 , 
        'Oceania': 6 , 
    }

    //var remote_url = api_host + '/api/globocan/v1/2018/top_cancers/'+type+'/0/all/?grouping_cancer=1&include_nmsc=1&field_key=asr' ; 
    //var remote_populations = api_host + '/api/globocan/v1/2018/meta/populations/all/' ; 
    
    var remote_url = 'data/populations.json' ; 
    var remote_populations = 'data/top_cancers.json' ; 
    

    var type = 0 ; 
    var remote_registries = 'data/registries-all.csv' ; 
    var remote_registries_geo = 'data/worldcities.csv' ; 
    var remote_countries_info = 'data/countries.csv' ;
    var remote_regions_info = 'data/regions.csv' ;

    var url = new URL( document.location.href );
    var parameters = {
        'type' : Math.abs( url.searchParams.get( "type" ) ) , 
        'region' : Math.abs( url.searchParams.get( "region" ) ) , 
    }

    var location_pop = 'World' ; 

    var all_registries = [] ;

    type = parameters.type ; 

    var continents_i = [
        { 'id':1, 'label': 'Africa' ,'color': '#e30d23' , 'centroid' : 'CAF' , 'zoom' : 1.5 , 'nb_registries' : 5 } ,
        { 'id':2, 'label': 'Latin America' , 'color': '#F6F33e' , 'centroid' : 'BRA' , 'zoom' : 1.7, 'real_label' : 'Latin America', 'nb_registries' : 5 } ,
        { 'id':3, 'label': 'North America' , 'color': '#79253c' , 'centroid' : 'USA' , 'zoom' : 2.4, 'real_label' : 'North America', 'nb_registries' : 5 } ,
        { 'id':4, 'label': 'Asia' , 'color': '#35ad24' , 'centroid' : 'IND' , 'zoom' : 2, 'nb_registries' : 5 } , 
        { 'id':5, 'label': 'Europe' , 'color': '#216cE2' , 'centroid' : 'UKR' , 'zoom' : 2.5, 'nb_registries' : 5 } , 
        { 'id':6, 'label': 'Oceania' , 'color': '#e312CF' , 'centroid' : 'AUS' , 'zoom' : 3 , 'nb_registries' : 5 } 
    ];

    var areas = [
        //{"id":188,"area":9,"label":"North America","continent":2,"centroid":"USA"},
        {"id":189,"area":10,"label":"Eastern Asia","continent":4,"centroid":"CHN" , 'color': '#d62728'},
        {"id":190,"area":1,"label":"Eastern Africa","continent":1,"centroid":"RWA","zoom":3.2,'color': '#1f77b4'},
        {"id":191,"area":2,"label":"Middle Africa","continent":1,"centroid":"GNQ","zoom":3.1,'color': '#1f77b4'},
        {"id":192,"area":3,"label":"Northern Africa","continent":1,"centroid":"LBY",'color': '#1f77b4'},
        {"id":193,"area":4,"label":"Southern Africa","continent":1,"centroid":"BWA","zoom":5.5,'color': '#1f77b4'},
        {"id":194,"area":5,"label":"Western Africa","continent":1,"centroid":"MLI","zoom":4,'color': '#1f77b4'},
        {"id":195,"area":6,"label":"Caribbean","continent":2,"centroid":"DOM","zoom":5.5, 'color': '#ff7f0e' },
        {"id":196,"area":7,"label":"Central America","continent":2,"centroid":"MEX", 'color': '#ff7f0e' },
        {"id":197,"area":11,"label":"South-Eastern Asia","continent":4,"centroid":"KHM","zoom":3.2 , 'color': '#d62728'},
        {"id":198,"area":12,"label":"South-Central Asia","continent":4,"centroid":"TKM","zoom":2.9 , 'color': '#d62728'},
        {"id":199,"area":13,"label":"Western Asia","continent":4,"centroid":"KWT","zoom":4.1 , 'color': '#d62728'},
        {"id":200,"area":14,"label":"Central and Eastern Europe","continent":5,"centroid":"UKR","zoom":3.1, 'color': '#9467bd'},
        {"id":201,"area":15,"label":"Northern Europe","continent":5,"centroid":"DNK","zoom":4.6, 'color': '#9467bd'},
        {"id":202,"area":16,"label":"Southern Europe","continent":5,"centroid":"ITA","zoom":5, 'color': '#9467bd'},
        {"id":203,"area":17,"label":"Western Europe","continent":5,"centroid":"FRA","zoom":7, 'color': '#9467bd'},
        {"id":206,"area":8,"label":"South America","continent":2,"centroid":"BOL","zoom":2.1, 'color': '#ff7f0e'},
        {"id":206,"area":9,"label":"North America","continent":2,"centroid":"USA","zoom":2 , 'color': '#2ca02c' },
        {"id":206,"area":18,"label":"South Pacific Ocean","continent":2,"centroid":"AUS","zoom":2, 'color': '#17becf'},
        {"id":206,"area":19,"label":"West Pacific","continent":2,"centroid":"NZL","zoom":2, 'color': '#17becf'}
    ] ; 

    var colors_membership = { 'N':'#150485','I':'#f1e189','V':'#c62a88','U':'#03c4a1','C': '#000000' };
    var labels_membership = { 'N':'National','I':'Individual','V':'Voting','U':'U Membership','C': 'C Membership' } ; 

    var mode = 'continent' ;
    var registries_autocomplete = [] ; 

    var current_registry = {} ; 

    setTimeout(function(){

        var color_paletter  = 'YlOrBr';
        

        $('select[name="mode"]').on('change',()=>{

            mode = $('select[name="mode"]').val() ; 

            d3.selectAll('.reg')
                .transition()
                .duration(750)
                .attr('fill',fillPath);

            switch ( mode )
            {
                case 'continent' : 
                    $('.filter1').show();
                    $('.filter2').hide();
                    break ;

                case 'membership' : 
                    $('.filter1').hide();
                    $('.filter2').show();
                    break ;

                default: 
                    $('.filters').hide();
                    break ; 
            }

        }) ; 
           
        

        queue()     
            .defer( d3.json, remote_url )
            .defer( d3.json, remote_populations )
            .defer( d3.dsv(';'), remote_registries )
            .defer( d3.dsv(','), remote_registries_geo )
            .defer( d3.dsv(','), remote_countries_info )
            .defer( d3.dsv(','), remote_regions_info )
            .await( ( error , geometries , populations , registries , registries_geo , countries_info , regions_info ) => { 

                var dataset = [] ; 
                var color = '#7d7d7d' ;
                var o_region = undefined ;

                for ( var j in geometries ) 
                {
                    dataset.push({
                        'label'         : geometries[j].label , 
                        'globocan_id'   : geometries[j].globocan_id , 
                        'color'         : '#cccccc  ' , 
                    }); 
                }

                registries_autocomplete = registries ;
                
                var cpt = 0 ; 
                var finds = [] ;

                let continents = d3.nest()
                    .key( c => c.continent )
                    .entries( registries )

                let membership = d3.nest()
                    .key( m => m.membership )
                    .entries( registries ) 

                // find geo of each registies
                registries
                    .filter(g=>{
                        return ( g.city != 'Italy' && g.city != 'ITALY' && g.city != "SWITZERLAND" && g.city != 'RUSSIA')
                    })
                    .map( (r,i) =>{
                        if ( r.city != '' && r.city != null && r.city != 'NULL')
                        {   
                            r.id = 'registry_'+i ; 
                            // find geo
                            let geo = registries_geo.find( (g) => {
                                return( g.city == r.city || g.city_ascii == r.city ) 
                            }) ; 
                            let area = undefined ; 

                            if ( geo == undefined )
                            {
                                // console.error(i,r.city) ;
                                finds.push(r.city) ; 
                                cpt++ ;  
                            } 
                            else
                            {
                                r.geo = geo ; 
                                area = regions_info.find( a => { return a.iso_3_code == geo.iso3  })
                            }
                            let cont = continents_i.find( c => { return r.continent == c.label })
                            

                            if ( cont != undefined){
                                r.color_c = cont.color ; 
                                // also grab area 
                                //console.info("cont.id",r.name,r.continent,area.area) ; 
                                if ( area != undefined ) {
                                    //console.info("area",area.area) ;
                                    r.area = area.area ; 
                                }
                            }
                            else{
                                // find globocan info
                                // console.info("r",r.city,r.continent) ; 
                            }

                            if ( r.membership != '')
                            {
                                r.color_m = colors_membership[r.membership] ; 
                            }
                            
                            r.year = getRndInteger(1975,2015) ;         

                            // let globocan_i = countries_info.find()
                        }
                    return r ; 
                    }) 
                ; 

                registries = registries.filter(g=>{
                    return (g.geo != undefined) ; 
                })

                all_registries = registries ; 

            

                dataviz_conf.data.src = dataset ; 

                // return ; 

                var oMap = new CanChart( dataviz_conf ).render() ;

                // title                 
                $('h1#graph_title').text( "International Association of Cancer Registries" );

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

                let groupRegistries = CanMapSvg.append('g')
                    .attr('id','mapRegistries')
                    .attr("transform", "translate("+CanMapConf.chart.globe_translate.x+","+CanMapConf.chart.globe_translate.y+")")
                    .style('opacity',0)
                ;

                                
                // bind bubble
                groupRegistries
                    .selectAll('circle.reg')
                    .data( registries )
                    .enter()
                    .append('circle')
                    .attr('class','reg')
                    .attr('id',(d)=>d.id)
                    .attr("r", 0) // 0 |
                    /*.attr("transform", (d)=>{
                        if ( d.geo != undefined )
                        {
                            if ( typeof(d.geo.lat) != NaN)
                                return "translate(" + CanMapGraphProjection([d.geo.lng,d.geo.lat]) + ")"
                            else
                                return "translate(0,0)";
                        }
                    })*/
                    .attr("cx", (d)=>{
                        if ( d.geo != undefined )
                        {
                            if ( typeof(d.geo.lat) != NaN) return CanMapGraphProjection([d.geo.lng,d.geo.lat])[0] 
                        }
                    })
                    .attr("cy", (d)=>{
                        if ( d.geo != undefined )
                        {
                            if ( typeof(d.geo.lat) != NaN) return CanMapGraphProjection([d.geo.lng,d.geo.lat])[1] 
                        }
                    })
                    //.attr("fill",fillPath)
                    /*.attr("fill",d=>{
                        console.info('d',d) ; 
                        return d.color 
                    })*/
                    .attr("stroke","#cccccc")
                    .on("mousemove",openOverlay)
                    .on("mouseout",closeOverlay)
                    .on("click",openModal)
                    .transition()
                    .duration(750)
                    //.delay((_, i)=>{ return i * 50; })
                    .attr("r", 5 ) // 10 

                continents_i.forEach( c => {
                    let button = '<span class="btn" style="background-color:'+c.color+'">&nbsp;</span>';
                    button = '' ; 
                    let html = '<a style="background-color:'+c.color+'" href="javascript:void(0);" attr-cont="'+c.label+'" onclick="zoomRegistry(\''+c.centroid+'\',\''+c.zoom+'\',this)">'+button+' '+((c.real_label!=undefined)?c.real_label:c.label)+'</a>' ; 
                    $('ul.filters.filter1').append('<li>'+html+'</li>') ; 
                })

                

                membership.forEach( (m,i) => {
                    let button = '<span class="btn" style="background-color:'+colors_membership[m.key]+'">&nbsp;</span>';
                    let html = '<a href="javascript:void(0);">'+button+' '+labels_membership[m.key]+'</a>' ; 
                    $('ul.filters.filter2').append('<li>'+html+'</li>') ; 
                })

                setTimeout(() => {
                    // Todo...
                    // second graphic
                    let xScale = d3.scale.linear()
                        .range([ 0 , width]);

                    let xAxis ; 

                    let graph2 = CanMapSvg.append('g')
                        .attr("id", "graph2") ; 

                    graph2.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + (height) + ")");

                    let xLine = graph2.append("line")
                        .attr("stroke", "rgb(96,125,139)")
                        .attr("stroke-dasharray", "1,2");

                    xScale.domain(d3.extent( registries, function (d) {
                        return +d.year;
                    }));

                }, 0 )

            });

            setTimeout(() => {
                
                $('#loader').hide();
                $('.hidden').fadeIn();
                $('.footer-map,.legend,select[name="mode"],form[name="search"],ul.filters').removeClass('hidden').fadeIn();
                $('#map-container svg').show() ; 

                autocomplete( document.getElementById("registry_name"), registries_autocomplete);


                //console.info("to fix",cpt,finds) ;
                let continent_circles = d3.nest()
                    .key( d => d.continent)
                    .entries( all_registries ) 
                    .map( d => {
                        let continent = continents_i.find( c => c.label == d.key )
                        continent.nb_registries = d.values.length ; 
                        // let focused = 
                        return continent  ; 
                    })
                    
                let groupCirclCont = CanMapSvg.append('g')
                    .attr('id','groupContRegistries')
                    .attr("transform", "translate("+CanMapConf.chart.globe_translate.x+","+CanMapConf.chart.globe_translate.y+")")
                    .style('opacity',0) ; 

                /* console.info({
                    "registries" : continent_circles , 
                    CanGraphMapFeatures : CanGraphMapFeatures
                }) ;*/  
                //return ; 

                let group_circles = groupCirclCont
                    .selectAll('circle.cont')
                    .data( continent_circles )
                    .enter()
                    .append('g')
                    .attr('class','group_circles') ;

                let radius = d3.scale.sqrt()
                    .domain([ 0, 500 ])
                    .range([ 0, 150 ])

                group_circles.append('circle')
                    .attr('class','cont')
                    .attr('id',(d)=>`${d.id}`)
                    .attr("r", r => radius( r.nb_registries ) )
                    .attr("cx", (d)=>{
                        let focusedCountry = checkCountry( CanGraphMapFeatures , d.centroid )  ;
                        let position = CanGraphMapPath.centroid( focusedCountry );
                        return position[0] 
                    })
                    .attr("cy", (d)=>{
                        let focusedCountry = checkCountry( CanGraphMapFeatures , d.centroid )  ;
                        let position = CanGraphMapPath.centroid( focusedCountry );
                        return position[1] 
                    })
                    .attr('fill',c=>c.color)
                
                group_circles.append("text")
                    .attr("x", (d)=>{
                        let focusedCountry = checkCountry( CanGraphMapFeatures , d.centroid )  ;
                        let position = CanGraphMapPath.centroid( focusedCountry );
                        return position[0] 
                    })
                    .attr("y", (d)=>{
                        let focusedCountry = checkCountry( CanGraphMapFeatures , d.centroid )  ;
                        let position = CanGraphMapPath.centroid( focusedCountry );
                        return position[1] 
                    })
                    .attr('dx',0)
                    .attr('dy',5)
                    .attr('fill','#fff')
                    .attr('text-anchor','middle')
                    .text( t => t.nb_registries )

                

                let areas_circles = d3.nest()
                    .key( d => d.area)
                    .entries( all_registries ) 
                    .map( d => {
                        let area_ = areas.find( c => c.area == parseFloat(d.key) )
                        // console.log("area_",d.key,area_,d.values)
                        if ( area_ != undefined )
                        {
                            area_.nb_registries = d.values.length ; 
                            // let focused = 
                            return area_  ; 
                        }
                        else
                        {
                            return undefined
                        }
                    })
                    .filter( f => f != undefined )

                let groupCircleAreas = CanMapSvg.append('g')
                    .attr('id','groupAreaRegistries')
                    .attr("transform", "translate("+CanMapConf.chart.globe_translate.x+","+CanMapConf.chart.globe_translate.y+")")
                    .style('opacity',0)    
                ; 

                // console.info("areas_circles",areas_circles) ; 
                let group_areas_circles = groupCircleAreas
                    .selectAll('circle.area')
                    .data( areas_circles )
                    .enter()
                    .append('g')
                    .attr('class','group_circles') ;

                group_areas_circles.append('circle')
                    .attr('class','area')
                    .attr('id',(d)=>`${d.id}`)
                    .attr("r", 25 )
                    .attr("cx", (d)=>{
                        let focusedCountry = checkCountry( CanGraphMapFeatures , d.centroid )  ;
                        let position = CanGraphMapPath.centroid( focusedCountry );
                        return position[0] 
                    })
                    .attr("cy", (d)=>{
                        let focusedCountry = checkCountry( CanGraphMapFeatures , d.centroid )  ;
                        let position = CanGraphMapPath.centroid( focusedCountry );
                        return position[1] 
                    })
                    .attr('fill',c=>c.color)

                group_areas_circles.append("text")
                    .attr("x", (d)=>{
                        let focusedCountry = checkCountry( CanGraphMapFeatures , d.centroid )  ;
                        let position = CanGraphMapPath.centroid( focusedCountry );
                        return position[0] 
                    })
                    .attr("y", (d)=>{
                        let focusedCountry = checkCountry( CanGraphMapFeatures , d.centroid )  ;
                        let position = CanGraphMapPath.centroid( focusedCountry );
                        return position[1] 
                    })
                    .attr('dx',0)
                    .attr('dy',5)
                    .attr('fill','#fff')
                    .attr('text-anchor','middle')
                    .text( a => a.nb_registries )

            }, 3000 ) ; 

            

    }, 500);
 
    var getRndInteger = function (min, max) {
        return Math.floor(Math.random() * (max - min) ) + min;
    }

    var fillPath = function(d){
        let color ; 
        switch( mode ){
            case 'continent' : 
                color = d.color_c ; 
                break ; 
            case 'membership' : 
                color = d.color_m ; 
                break ; 
            default :
                color = '#1e7fb8' ;
        }
        return color ; 
    }

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

    var zoomArea = function( codeCountry , scale , _this , area_id ){

        console.info("zoomArea",codeCountry) ; 

        zoomRegistry( codeCountry , scale , _this , area_id ) ; 

        let cont = $(_this).attr('attr-cont') ;
        let continent = continents_i.find( c => { return c.id == continents_labels[cont] }) ;

        d3.selectAll('path.country')
            .attr('fill',(d)=>{
                if( area_id == parseFloat(d.properties.area_id)) return continent.color ;  
                return Default.color_no_data  ; 
            })

        d3.selectAll('path.country')
            .attr('fill-opacity',(d)=>{
                if( area_id == parseFloat(d.properties.area_id)) return 0.4 ;  
                return 1 ; 
            })

        d3.selectAll('text.country-txt')
            .style('display',(t)=>{
                if( area_id == parseFloat(t.properties.area_id)) return 'block' ;  
                return 'none' ; 
            })

        d3.selectAll('circle.reg')
            .attr('r',r => {
                console.info(" circle => ",area_id,r.properties.area_id)
            }) ; 


        // zoom 

        level = 2 ; 
    }

    var zoomRegistry = function( codeCountry , scale , _this , area_id ){

        if ( area_id == undefined ){
            // remove existing li
            $('ul.areas li').css('left','-350px '); //remove() ; 
            d3.selectAll('path.country').attr('fill',Default.color_no_data );
            d3.selectAll('path.country').attr('fill-opacity',1);
            d3.selectAll('text.country-txt').style('display','none');
        }

        let cont = $(_this).attr('attr-cont') ; 

        zoomRegion( codeCountry , scale , { 'cont' : cont , 'area': area_id } , continents_labels[cont]  ) ; 
        
        let continent = continents_i.find( c => { return c.id == continents_labels[cont] }) ; 
        if ( continent == undefined ) 
        {
            $('#registry_name').val(" ") ; 
            d3.selectAll('circle.reg').transition().duration(250).attr('r',0); 
            level = 0 ; 
            return ; 
            
        }

        if ( area_id == undefined)
        {
            level = 1 ; 
            let areas_ = areas.filter( a => { return a.continent == continents_labels[cont] }) ; 
            let color_ = continent.color ; 
            let li_ ; 
            let top_ = '100px' ;

            switch( continent.id )
            {
                case 1 : 
                    top_ = '90px' ; 
                    break ; 

                case 2 : 
                    top_ = '130px' ; 
                    break ;

                case 4 : 
                    top_ = '204px' ; 
                    break ; 

                case 5 : 
                    top_ = '242px' ; 
                    break ; 
            }
            

            $('ul.areas').css('top',top_) ; 

            // append new li
            let zoom_area ; 
            areas_.forEach( (area,i) => {

                zoom_area = ( area.zoom != undefined ) ? area.zoom : continent.zoom+2 ;

                li_ = `<li id="area_${area.id}" style="top:${i*30}px;">`;
                li_ += `<a style="background-color:${color_}" attr-cont="${cont}" href="javascript:void(0);" onclick="zoomArea('${area.centroid}',${zoom_area},this,${area.area})">${area.label}</a>`;
                li_ += `</li>` ; 
                

                $('ul.areas').append(li_) ;
                
                setTimeout(()=>{
                    $(`#area_${area.id}`).css('left','180px')
                },(i+1)*250) ; 


            
            })

            //d3.selectAll('circle.reg').transition().duration(250).attr('r',3);
        }
            
        /*d3.selectAll('.reg')
            .transition()
            .duration(250)
            .attr('r',(c)=>{
                return (cont == c.continent || codeCountry == undefined) ? 5 : 0;
            }) 
            /*.attr("transform", (d)=>{
                if ( d.geo != undefined )
                {
                    if ( typeof(d.geo.lat) != NaN)
                        return "scale(" + scale + ")translate(" + CanMapGraphProjection([d.geo.lng,d.geo.lat]) + ")"
                    else
                        return "translate(0,0)";
                }
            })
        ; */


    }

    var openOverlay = function(d){

        $('.canTooltip').show(); 

        /*d3.selectAll('.reg').style('opacity',(r)=>{
            return ( $(this).attr('id') == r.id ) ? 1 : 0.2
        }) ;*/

        d3.selectAll('.reg')
            .style('stroke-width',(r)=>{
                return ( $(this).attr('id') == r.id ) ? '1px' : '1px'
            })
            .style('stroke',(r)=>{
                return ( $(this).attr('id') == r.id ) ? '#000' : '#ccc'
            }) ;

        var mouse = d3.mouse( CanMapSvg.node()).map((d) => { return parseInt(d); });
        
        let html_str = '<div class="tooltip-line" style="border-color:'+fillPath(d)+';"></div>' ; 
        let flag = `<span class="flag ${d.geo.iso2.toLowerCase()}"></span>`;
        html_str    += '<h5 class="f16" style="color:'+fillPath(d)+';">'+ d.name + flag + '</h5>' ; 
        html_str    += '<table>' ; 
        html_str    += `<tr><td class="metric">City</td><td class="value">${d.city} (${d.country})</td></tr>` ; 
        html_str    += `<tr><td valign="top" class="metric">Department</td><td valign="top" class="value">${d.department}</td></tr>` ; 
        //html_str    += `<tr><td valign="top" class="metric">Url</td><td valign="top" class="value">${d.url}</td></tr>` ; 
        // html_str    += `<tr><td valign="top" class="metric">Membership</td><td valign="top" class="value">${d.membership}</td></tr>` ; 

        html_str    += '</table>' ; 

        $('.canTooltip').html( html_str ) ;

        //let width_tooltip = 200 ; 
        //let height_tooltip = 100 ; 

        let top_x = (mouse[0]) //- this.zoom.y 
        let top_y = (mouse[1]) //- this.zoom.x 

        let e = window.event;
        top_x = e.clientX ;
        top_y = e.clientY ;

        // console.info("mouse",mouse,d);

        d3.select('.canTooltip')
          .style('top',  (top_y-125)+  'px')
          .style('left',  (top_x-180)+ 'px');

    }

    var showRegistry = function( d ){

        current_registry = d ; 

        let inner_container = 'div#registry #inner-container' ; 

        $( inner_container ).css('border-color',d.color_c) ; 
        $(inner_container + ' h2').html( d.name ) ;
        $(inner_container + ' span#city').html( d.city + ' ('+d.country+')' ) ;

        if ( d.department != '' )
        {
            $(inner_container + ' span#department').html( d.department ) ;
        }
        else
        {
            $('span#department').hide();
        }

        showGraphic('overview') ; 

        setTimeout(() => {
            // Todo...
            $('#loader_registry').hide() ; 
            $('iframe#frame1').fadeIn() ; 
        }, 3000 ) ; 

    }

    var getGraphic = function( type ){

        let url_frame = '/tomorrow_v2/en/dataviz/trends?apc_custom=0&group_populations=0&print=1'  ; 
        let id_span = '#row_trends' ; 
        switch( type )
        {
            case 'cohorts' : 
                url_frame = '/tomorrow_v2/en/dataviz/trends?apc_custom=0&group_populations=0&types=0_1&populations=903&print=1'  ; 
                id_span = '#row_cohorts' ; 
                break ; 

            case 'bars' : 
                url_frame = '/tomorrow_v2/en/dataviz/bars?mode=population&apc_custom=0&print=1'  ;  
                id_span = '#row_bars' ; 
                break ; 

            case 'overview' :
                id_span = '#row_overview' ; 
                break ; 

            case 'table' :
                id_span = '#row_table' ; 
                break ; 
        }

        return { 'frame' : url_frame  , 'span' : id_span } ; 
    }

    var showGraphic = function( type ){

        $('#loader_registry').show() ; 
        $('iframe#frame1').hide() ; 

        let settings = getGraphic( type ) ; 
        
        $('.viz_btn a.button')
            .addClass('on')
            .css({
                'background-color':'#cccccc',
                'color': '#000'
            }) ; 

        $( settings.span )
            .removeClass('on')
            .css({
                'background-color':current_registry.color_c,
                'color' : '#fff'
            }) ; 

        $('#right_registry').html( " " )

        if ( type != 'overview' && type != 'table')
        {
            $('#right_registry').html('<iframe id="frame1" src="" width="100%" height="800"></iframe>');
            
            // bind iframe
            let frame1 = dataviz_host + settings.frame ; 
            $('iframe#frame1').attr('src', frame1 ) ; 


            setTimeout(() => {
                $('iframe#frame1').fadeIn() ; 
            }, 1500 ) ;
        } 
        else
        {
            // show graphic 
            let html_ = '' ; 

            switch( type )
            { 
                case 'overview' : 
                    
                    html_ += `<h3>Average annual population</h3>` ;
                    html_ += '<p><strong>7,331,763 (3,515,264 males and 3,816,499 females) (2001-2015)</strong></p>';
                    html_ += '<p><img src="img/registries/bangkok/Picture1.png" title="Picture1"></p>' ; 

                    html_ += '<h3>The Database</h3>';
                    html_ += '<p>The registry uses CanReg5 software (http://www.iacr.com.fr/CanReg5) for data entry, management and analysis.</p>';
                    html_ += '<p>The registry adheres to the guidelines of the IACR/IARC (2004) with respect to the preservation of confidentiality in connection with or during the process of collection, storage, use and transmission of identifiable data. Requests for the release of data should be made in writing to the registry; requests for data involving identification of individual subjects require special permission, involving appropriate safeguards for confidentiality.</p>';

                    html_ += `<h3>Number of incident cases</h3>` ;
                    html_ += '<p>Between 2001 and 2015, 157,509 cases of cancers were registered: 71,915 among men and 85,594 among women.</p>';
                    html_ += '<p><img src="img/registries/bangkok/Picture2.png" title="Picture2"></p>' ; 

                    html_ += `<h3>Number of incident cases by year</h3>` ;
                    html_ += '<p><img src="img/registries/bangkok/Picture3.png" title="Picture3"></p>' ; 

                    html_ += `<h3>The most common cancers, by sex</h3>` ;
                    html_ += '<p>In men, lung is the most commonly diagnosed malignancy with 12,138 cases, followed by liver (11,078 cases).</p>';
                    html_ += '<p>In women, breast is the most commonly diagnosed malignancy with 23,492 cases, followed by cervix uteri (8,506 cases) and colorectum (8,334 cases).</p>';
                    html_ += '<p><img src="img/registries/bangkok/Picture4.png" title="Picture4"></p>' ; 

                    html_ += `<h3>Top 10 cancers, both sexes (Number of cases)</h3>` ;
                    html_ += '<p><img src="img/registries/bangkok/Picture5.png" title="Picture5"></p>' ; 

                    html_ += `<h3>Top 10 cancers, both sexes (Age-standardized rate per 100,000)</h3>` ;
                    html_ += '<p><img src="img/registries/bangkok/Picture6.png" title="Picture6"></p>' ; 

                    html_ += `<h3>Top 10 cancers, number of cases</h3>` ;
                    html_ += '<p><img src="img/registries/bangkok/Picture7.png" title="Picture7"></p>' ;

                    html_ += `<h3>Trends in ASR (Most common sites)</h3>` ;
                    html_ += '<p><img src="img/registries/bangkok/Picture9.png" title="Picture9"></p>' ; 

                    html_ += `<h3>Estimated annual percentage change</h3>` ;
                    html_ += '<p><img src="img/registries/bangkok/Picture8.png" title="Picture8"></p>' ;
                    break ; 

                case 'table' : 

                    html_ += `<h3>Basis of diagnosis (DCO/ Clinical/ MV) by site</h3>` ;
                    html_ += '<p>Table 1 shows the percentage of cases at the major sites that were registered on the basis of information from a death certificate only (DCO) and with morphological verification (MV) - that is, based on cytology or histology (of the primary tumor, or a metastasis).</p>';
                    html_ += '<p><img src="img/registries/bangkok/Picture10.png" title="Picture10"></p>' ;

                    break ; 
            } 

            $('#right_registry').html( html_ ) ; 
        }


        setTimeout(() => {
            $('#loader_registry').hide() ; 
        }, 1500 ) ;
    }

    var closeOverlay = function(){
      $('.canTooltip').hide();
      d3.selectAll('.reg')
        .style('stroke','#ccc')
        .style('stroke-width','1px') ;
    }

    var openModal = function(d){
        $('.overlay').show(); 
        showRegistry(d);

    }

    var closeModal = function(){
        $('.overlay').hide(); 
    }

    var sortByKey = function( array, key , direction) {
        var direction ; 
        
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            if ( direction == undefined )
              return ((x > y) ? -1 : ((x < y) ? 1 : 0));
            else if ( direction == 'ASC' )
              return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {

      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      if ( val.length < 3 ) return false ;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      //console.info("val.toUpperCase()",val.toUpperCase());
      //console.info("arr",arr) ; 

      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        // if (arr[i].name.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        if ( arr[i].name.toUpperCase().includes( val.toUpperCase() ) ) {

            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            //b.innerHTML = "<strong>" + arr[i].name.substr(0, val.length) + "</strong>";
            //b.innerHTML += arr[i].name.substr(val.length);
            let indexOf = arr[i].name.toUpperCase().indexOf(val.toUpperCase()) ; 

            b.innerHTML += arr[i].name.substr(0,indexOf);
            b.innerHTML += "<strong>" + val + "</strong>";
            b.innerHTML += arr[i].name.substr(indexOf+val.length,arr[i].name.length);

            if ( arr[i].geo != undefined )
            {
                let x_ = CanMapGraphProjection([arr[i].geo.lng,arr[i].geo.lat])[0] ; 
                let y_ = CanMapGraphProjection([arr[i].geo.lng,arr[i].geo.lat])[1] ; 

                // b.innerHTML += arr[i].name ;
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input name='hidden_id' type='hidden' value='" + arr[i].name + "' attr-id='"+arr[i].id+"' attr-x='"+x_+"' attr-y='"+y_+"'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                  b.addEventListener("click", function(e) {
                  /*insert the value for the autocomplete text field:*/
                  inp.value = this.getElementsByTagName("input")[0].value;
                  /*close the list of autocompleted values,
                  (or any other open lists of autocompleted values:*/
                  let id_registry = $('input[name="hidden_id"]').attr('attr-id')  ;
                  let svg_el = d3.select(`circle#${id_registry}`)
                    .style('stroke','#000')
                    .style('stroke-width','3px') ; 

                  pulsate(svg_el);

                  let reg_x = $('input[name="hidden_id"]').attr('attr-x')  ;
                  let reg_y = $('input[name="hidden_id"]').attr('attr-y')  ;
                
                  zoomRegion( undefined , 1.5 , { 'x' : reg_x , 'y' : reg_y }) ; 
                  // openOverlay(d3.select(`circle#`+id_registry)[0]) ;

                  closeAllLists();
                });
                a.appendChild(b);
            }
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

var cpt_pulsate = 0 ; 
function pulsate(selection) {
    recursive_transitions();

    function recursive_transitions() {
      if (cpt_pulsate<5) {
        selection.transition()
            .duration(400)
            .attr("stroke-width", 2)
            .attr("r", 8)
            .ease('sin-in')
            .transition()
            .duration(800)
            .attr('stroke-width', 3)
            .attr("r", 15)
            .ease('bounce-in')
            .each("end", recursive_transitions);
        cpt_pulsate++ ; 
        //if ( cpt_pulsate == 10 ) cpt_pulsate = 0 ; 
      } else {
        cpt_pulsate = 0 ; 
        // transition back to normal
        selection.transition()
            .duration(200)
            .attr("r", 5)
            .attr("stroke-width", 1)
            .attr("stroke","#ccc");
      }
    }
  }
