    
    var PROJECT             = 'registries' ; 

    var gradients           = ['#0099cc' ] ; 
    
    var width = $(window).width()  ; 
    var height = $(window).height() - 150  ; 

    var scale = 280 ; 
    var map_translate = { 'x' : -50 , 'y' : 140 }  ; 
    var legend_translate = { 'x' : -150  , 'y' : 450 } ; 

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
            'show_country_text' : false , 
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
    var remote_registries = '/data/registries-all.csv' ; 
    var remote_registries_geo = '/data/worldcities.csv' ; 
    var remote_countries_info = '/data/countries.csv' ; 

    var url = new URL( document.location.href );
    var parameters = {
        'type' : Math.abs( url.searchParams.get( "type" ) ) , 
        'region' : Math.abs( url.searchParams.get( "region" ) ) , 
    }

    var location_pop = 'World' ; 

    type = parameters.type ; 

    var continents_i = [
        { 'label': 'Africa' ,'color': '#004529' , 'centroid' : 'CAF' , 'zoom' : 1.5 } ,
        { 'label': 'America Latin' , 'color': '#f00' , 'centroid' : 'BRA' , 'zoom' : 1.7, 'real_label' : 'Latin America'} ,
        { 'label': 'America North' , 'color': '#e97520' , 'centroid' : 'USA' , 'zoom' : 3, 'real_label' : 'North America'} ,
        { 'label': 'Asia' , 'color': '#7a0177' , 'centroid' : 'CHN' , 'zoom' : 1.5} , 
        { 'label': 'Europe' , 'color': '#08306b' , 'centroid' : 'KAZ' , 'zoom' : 2.5} , 
        { 'label': 'Oceania' , 'color': '#ffd92f' , 'centroid' : 'AUS' , 'zoom' : 3.5} 
    ];

    var colors_membership = { 'N':'#150485','I':'#f1e189','V':'#c62a88','U':'#03c4a1','C': '#000000' };
    var labels_membership = { 'N':'National','I':'Individual','V':'Voting','U':'U Membership','C': 'C Membership' } ; 

    var mode = '' ;

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
            .await( ( error , geometries , populations , registries , registries_geo , countries_info ) => { 

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
                            if ( geo == undefined )
                            {
                                // console.error(i,r.city) ;
                                finds.push(r.city) ; 
                                cpt++ ;  
                            } 
                            else
                            {
                                r.geo = geo ; 
                            }

                            let cont = continents_i.find( c => { return r.continent == c.label })
                            if ( cont != undefined)
                                r.color_c = cont.color ; 
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

                //console.info("to fix",cpt,finds) ; 
                //console.info("registries",registries) ; 
                //return ; 

                dataviz_conf.data.src = dataset ; 

                // return ; 

                var oMap = new CanChart( dataviz_conf ).render() ;

                // title                 
                $('h1#graph_title').text( "Registries" );

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
                ; 
                                
                // bind bubble
                groupRegistries
                    .selectAll('circle.reg')
                    .data( registries )
                    .enter()
                    .append('circle')
                    .attr('class','reg')
                    .attr('id',(d)=>d.id)
                    .attr("r", 0)
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
                    .attr("fill",fillPath)
                    .attr("stroke","#cccccc")
                    .on("mousemove",openOverlay)
                    .on("mouseout",closeOverlay)
                    .transition()
                    .duration(750)
                    //.delay((_, i)=>{ return i * 50; })
                    .attr("r", 5)

                continents_i.forEach( c => {
                    let button = '<span class="btn" style="background-color:'+c.color+'">&nbsp;</span>';
                    let html = '<a href="javascript:void(0);" attr-cont="'+c.label+'" onclick="zoomRegistry(\''+c.centroid+'\',\''+c.zoom+'\',this)">'+button+' '+((c.real_label!=undefined)?c.real_label:c.label)+'</a>' ; 
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

                }, 2000 )

            });

            setTimeout(() => {
                
                $('#loader').hide();
                $('.hidden').fadeIn();
                $('.footer-map,.legend,select[name="mode"]').removeClass('hidden').fadeIn();
                $('#map-container svg').show() ; 

            }, 1500 ) ; 

            

    },500);

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

    var zoomRegistry = function( codeCountry , scale , _this ){

        let cont = $(_this).attr('attr-cont') ; 

        zoomRegion( codeCountry , scale , cont ) ; 
        

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

        d3.selectAll('.reg').style('opacity',(r)=>{
            return ( $(this).attr('id') == r.id ) ? 1 : 0.2
        }) ;

        var mouse = d3.mouse( CanMapSvg.node()).map((d) => { return parseInt(d); });
        
        let html_str = '<div class="tooltip-line" style="border-color:'+fillPath(d)+';"></div>' ; 
        let flag = `<span class="flag ${d.geo.iso2.toLowerCase()}"></span>`;
        html_str    += '<h5 class="f16" style="color:'+fillPath(d)+';">'+ d.name + flag + '</h5>' ; 
        html_str    += '<table>' ; 
        html_str    += `<tr><td class="metric">City</td><td class="value">${d.city} (${d.country})</td></tr>` ; 
        html_str    += `<tr><td valign="top" class="metric">Department</td><td valign="top" class="value">${d.department}</td></tr>` ; 
        //html_str    += `<tr><td valign="top" class="metric">Url</td><td valign="top" class="value">${d.url}</td></tr>` ; 
        html_str    += `<tr><td valign="top" class="metric">Membership</td><td valign="top" class="value">${d.membership}</td></tr>` ; 

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
          .style('top',  (top_y-170)+  'px')
          .style('left',  (top_x-190)+ 'px');

    }

    var closeOverlay = function(){
      $('.canTooltip').hide();
      $('.reg').css('opacity',1) ;
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

