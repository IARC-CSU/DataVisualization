	
	var PROJECT 			= 'map' ; 

    var hubs = {
        1 : { 'id' : 1 , 'code' : 'AFCRN' , 'name' : 'SS-Africa' , 'label' : 'Sub saharian Africa', 'color' : '#71C8E3' , 'plot_name' : 'ZAF' , 'plot_translate' : { 'x' : 150 , 'y' : -250 } } , 
        2 : { 'id' : 2 , 'code' : 'IZMIR' , 'name' : 'NA,C-Africa, W.Asia' , 'label' : 'North Africa, Center Africa & Western Asia', 'color' : '#724A98' , 'plot_name' : 'MAR' , 'plot_translate' : { 'x' : 320 , 'y' : -180 } } , 
        3 : { 'id' : 3 , 'code' : 'MUMB' , 'name' : 'S,E,SE Asia' , 'label' : 'South, East & Southern East Asia',  'color' : '#2EAF81' , 'plot_name' : 'CHN' , 'plot_translate' : { 'x' :  300 , 'y' : -400 }} , 
        4 : { 'id' : 4 , 'code' : 'PI' , 'name' : 'Pacific' , 'label' : 'Pacific islands',  'color' : '#ff6600' , 'plot_name' : 'FJI' , 'plot_translate' : { 'x' : 90 , 'y' : -160 } } , 
        5 : { 'id' : 5 , 'code' : 'CARIB' , 'name' : 'Carribean' , 'label' : 'The carribean',  'color' : '#b21c01' , 'plot_name' : 'SUR' , 'plot_translate' : { 'x' : 100 , 'y' : -150 } } ,
        6 : { 'id' : 6 , 'code' : 'LA' , 'name' : 'LatAm' , 'label' : 'Latin America',  'color' : '#FDCC00', 'plot_name' : 'PER' , 'plot_translate' : { 'x' : 200 , 'y' : -280 }}
    } ; 

    var dataActions = [
      {date: new Date(2013,9,13), name: 'Basic Site Visit' , place : 'Lubumbashi' , hub_id : 1 },
      {date: new Date(2014,5,16), name: 'Training CanReg5' , place : 'Namibia' , hub_id : 1 },
      {date: new Date(2014,7,11), name: 'Basic Training Course in French'  , place : 'Abidjan' , hub_id : 1 },
      {date: new Date(2014,7,31), name: 'Cancer Registration + CanReg5 + PAF'  , place : 'Cairo' , hub_id : 1 }, 
      {date: new Date(2015,8,2), name: 'Cancer Registration + CanReg5 Course in Russian'  , place : 'Astana' , hub_id : 2 }, 
      {date: new Date(2015,8,26), name: 'GICR presentation at RINC Annual Meeting'  , place : 'Bogotà' , hub_id : 6 },
      {date: new Date(2015,9,15), name: 'IARC Short Course (Cancer registration + CanReg)'  , place : 'San Salvador' , hub_id : 6 },
      {date: new Date(2016,6,19), name: 'National Strategic planning workshop'  , place : 'San Salvador' , hub_id : 6 }
    ];

    var title = 'Global Initiative for Cancer Registries' ;

    var hubs_per_name = [] ;
    var hubs_per_code = [] ;  
    for ( var h in hubs ) 
    {
        hubs_per_name[ hubs[h].name ] = hubs[h] ; 
        hubs_per_code[ hubs[h].code ] = hubs[h] ; 
        $('.line').append('<div class="line-hub" style="background-color:'+hubs[h].color+';"></div>')
    }
    var GICR = {
        'default_color'     : '#e3e3e3' , 
        'visits_color'      : '#a50026' , 
        'trainings_color'   : '#006837 '
    }

    var map_width   = $(window).width(); 
    var map_height  = $(window).height() - 120 ;
    var zoomed      = false ; 
    var current_hub = undefined ; 
    var current_country = undefined ; 
    var view        = 1 ; 
    var event       = 1 ; 
    var level       = 0 ; 
    var countries   = [] ;
    var metric      = 'visit' ; 
    var site_visits = [] ; 
    var trainings   = [] ; 

    var site_visits_per_country = [] ; 
    var trainings_per_country = [] ; 
    var trainings_per_place ; 

    var rectangle_area ; 
    var rectangles_activities ; 

    var scale = 0 ; 
    var translate = {} ; 

    if ( $(window).width() > 1480 )
    {
        scale = 320 ; 
        translate = { 'x' : 0 , 'y' : 200 } ; 
    }
    else if ( $(window).width() > 1280 )
    {
        scale = 230 ;
        translate = { 'x' : 0 , 'y' : 80 } ; 
    }
    else
    {
        scale = 250 ; 
        translate = { 'x' : 0 , 'y' : 150 } ; 
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
            'scale' : 250 , 
            'key_data_value' : 'value' , 
            'scale' : scale , 
            'key_data_value' : 'value' , 
            'globe_translate' : translate , 
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

    $(document).ready(function(){

        loadGircData();

        var oMap = new CanChart( dataviz_conf ).render() ;

        $(".tabs-menu a").click(function(event) {
            event.preventDefault();
            $(this).parent().addClass("current");
            $(this).parent().siblings().removeClass("current");
            var tab = $(this).attr("href");
            $(".tab-content").not(tab).css("display", "none");
            $(tab).fadeIn();
        });

        // buildTimeline() ; 

        setTimeout(function(){
            $('.intro').fadeOut({ 'duration' : 1000 }) ; 
        }, 5000 ) ; 
    }) ;


    var goToTheMap = function(){
        $('.intro').fadeOut(); 
    }

    var setFunctionView = function( item )
    {   
        $('#title-map').text( title + ': '+ $('select[name="function"] :selected').text() ) ; 

        if ( item == undefined )
            metric = 'visit' ; 
        else
            metric = $('select[name="function"] :selected').val() ; 

        d3.selectAll('.visits').transition()
            .duration( 750 )
            .attr('r', function(d){
                if ( d.properties.site_visits != undefined ) return CanGraphRadiusBubble(d.properties.site_visits); 
            } )
            .delay( 750 )
        ; 

        d3.selectAll('.training-circle')
            .data( CanGraphTrainings.features )
            .transition()
            .duration( 750 )
            .attr('r',function(d){
                return CanGraphRadiusBubble( d.properties.total ) ; 
            })
            .attr('fill', GICR.trainings_color )
            .delay( 750 )
        ; 
    }

    /**
    *
    *
    */
    var setViewPer = function( view_p , item ){

        view = view_p ; 

        $( 'a.view.button' ).removeClass( 'active' );
        $( item ).addClass('active'); 

        d3.selectAll('.activities').remove() ;

        switch ( view )
        {
            case 1 : 
                $('.filter-function').hide(); 
                $('.filter-geography').show(); 
                $(".unit-label").fadeIn() ;
                
                $('#title-map').text( title + ': geographic view') ;
                $('select [name="geography"]').val( 'global' );
                $('.for_bubble').hide();
                $('ul.hubs-list').show();
                $('ul.activities-list').hide();
                $('table#global_indicators').hide(); 
                $('svg#legend_bubble').html(' ');

                $('#timeline').removeClass('open');

                break ; 
            
            case 2 : 
                $('.filter-function').show(); 
                $('.filter-geography').hide(); 
                $(".unit-label").fadeOut() ;
                $('#title-map').text( title + ': site visit(s)') ;
                $('#hubPanel,#countryPanel').removeClass('show') ;
                $('ul.hubs-list').hide();
                $('ul.activities-list').show();
                $('table#global_indicators').show(); 
                $('.for_bubble').show();
                buildCircleLegend();
                if ( level != 0 ) zoomRegion( undefined ) ; 

                // $('#timeline').removeClass('open');

                setTimeout(function(){
                    
                    rectangles_activities = CanMapSvg.append("g")
                        .attr('class','activities')
                        .attr("transform", "translate("+CanMapConf.chart.globe_translate.x+","+CanMapConf.chart.globe_translate.y+")")
                    ;

                    CanGraphRadiusBubble = d3.scale.sqrt()
                        .domain([ 0, 10 ])
                        .range([ 0, 15 ]);

                    rectangle_area = d3.scale.sqrt()
                        .domain([ 0, 10 ])
                        .range([ 0, 50 ]);

                    // build sit visits
                    rectangles_activities.append("g")
                        .selectAll("circle")
                        .data( CanGraphGeometries.features )
                        .enter()
                        .append('circle')
                        .attr("class","visits")
                        .style('fill', function(d){  return GICR.visits_color ; })
                        .style('fill-opacity', 1 )
                        .style('stroke','#ffffff')
                        .style('stroke-width','.5px')
                        .attr("transform", function(d) { 
                            var centroid = CanGraphMapPath.centroid(d) ; 
                            return "translate(" + ( centroid[0] ) + "," + centroid[1]+ ")"; 
                        })
                        .on('mouseover', function(d){ hoverFunction(d,$(this).attr('class')) })
                        .on("mouseout", function(d){ outFunction(d) })
                    ;

                    setFunctionView( undefined );

                }, 500 );
                break ; 

            case 3 : 
                $('.filter-function').hide(); 
                $('.filter-geography').hide(); 
                $(".unit-label").fadeIn() ;
                
                $('#title-map').text( title + ': all actions since 2013') ;
                $('select [name="geography"]').val( 'global' );
                $('.for_bubble').hide();
                $('svg#legend_bubble').html(' ');

                //
                $('#timeline').addClass('open');

                break ; 
        }

        updateGeographyFilling(); 
    }

    var countryTooltip = function( item ){

    }


    var hoverFunction = function( item , class_name ){

        $('.canTooltip').show(); 

        var mouse = d3.mouse( CanMapSvg.node()).map(function(d) {
            return parseInt(d);
        });

        CanMapTooltip
            .style('top', (mouse[1] - 60 ) + 'px')
            .style('left', (mouse[0] - 80 ) + 'px');


        $('.canTooltip div.tooltip-line').css('background-color', ( class_name == 'visits') ? GICR.visits_color : GICR.trainings_color )
        $('.canTooltip h2').html( item.properties.CNTRY_TERR + '<span>'+ ( ( class_name == 'visits') ? item.properties.site_visits : item.properties.trainings ) +' '+class_name+'(s)</span>' ) ; 
        $('.canTooltip p').html(' ') ; 
    }

    var outFunction = function(){
        $('.canTooltip').hide();
    }

    /**
    *
    */
    var buildGeoLegend = function(){

        // build legend 
        for ( var h in hubs )
        {
            var span_a = '<span class="hub" style="background-color:'+hubs[h].color+';"></span>'+hubs[h].label ; 
            var li = '<li attr-iso="'+hubs[h].name+'" ><a href="javascript:void(0)" onclick="zoomView(\''+hubs[h].id+'\',\'hub\')">'+span_a+'</a></li>' ; 
            $('ul.hubs-list').append( li ); 
        }

        $('ul.hubs-list').append( '<li attr-iso="0"><a href="javascript:void(0)"><span class="hub" style="background-color:'+GICR.default_color+';"></span>Not applicable</a></li>' ) ;

        // hover function
        $('ul.hubs-list li').hover( function(){
            var attr_hub = $(this).attr('attr-iso'); 
            if ( attr_hub == '0' || attr_hub == 0) return ; 
            $('path.country[attr-hub="'+attr_hub+'"]').addClass('hover') ; 
        }, function(){
            $('path.country').removeClass('hover') ; 
        }) ; 

        // build activities legend
        var ul_act = 'ul.activities-list' ; 

        var r_c = 6.5 ; 
        var c_w = 30 ;
        var c_h = 20 ; 

        $(ul_act).append( '<li ><a href="javascript:void(0)"><svg width="'+c_w+'" height="'+c_h+'"><circle transform="translate(15,10)" r="'+r_c+'" fill-opacity="0.7" fill="'+GICR.visits_color+'"></svg>Site visit(s)</a></li>' ) ;
        $(ul_act).append( '<li ><a href="javascript:void(0)"><svg width="'+c_w+'" height="'+c_h+'"><circle transform="translate(15,10)" r="'+r_c+'" fill-opacity="0.7" fill="'+GICR.trainings_color+'"></svg>Training(s)</a></li>' ) ;
        $(ul_act).append( '<li ><a href="javascript:void(0)"><span class="hub"><img src="img/agreement.png" width="20" height="20"></span> Agreement </a></li>' ) ;

    }

    /**
    *
    */
    var loadGircData = function(){

        // loading gicr map
        // d3.csv( "data/gicr.csv" , function( data ){

        var q = queue()
            .defer( d3.csv , "data/gicr.csv" )
            .defer( d3.csv , "data/site-visits.csv" )
            .defer( d3.csv , "data/trainings.csv" )
            .awaitAll( function( error, results ) {

                gicr_csv = results[0] ; 

                // build selectbox for geography region / data gicr
                var select_geo = d3.nest()
                    .key(function(d){ return d.HUB })
                    .entries( gicr_csv ) ;

                $('#list-hubs').append( '<a class="button view active" attr-hub="0" onclick="zoomView(\'\',\'global\')"> Global </a>' ) ; 

                for ( var s in select_geo )
                {
                    if ( select_geo[s].NActive == '1' || select_geo[s].key == 'undefined' ) continue ;

                    var label       = hubs_per_name[ select_geo[s].key ].label ; 
                    var value       = select_geo[s].key ; 

                    $('#list-hubs').append( '<a class="button view" attr-hub="'+hubs_per_name[ select_geo[s].key ].id+'" onclick="zoomView('+hubs_per_name[ select_geo[s].key ].id+',\'hub\')"> '+label+' </a>' ) ; 
                    
                    for ( var v in select_geo[s].values )
                    {
                        var item        = select_geo[s].values[v] ; 
                        if ( item.Country == '' ) continue ; 
                        if ( item.NActive == 1 || item.NActive == '1' ) continue ; 

                        item.color      = hubs_per_name[ select_geo[s].key ].color ; 
                        countries[ item.UN_Code ] = item ; 

                    } // end for 
                } // end for 

                // site vistis
                site_visits = results[1] ; 
                trainings = results[2] ; 

                buildGlobalIndicators({ 'site_visits' : site_visits , 'trainings' : trainings }) ; 

            })
        ;

    } // end function 

    var buildGlobalIndicators = function( data )
    {
        

        var site_visits_per_hubs = d3.nest()
            .key( function(d){ return d.hub_code ; })
            .rollup(function( hub ) { 
                return {  
                    "total": hub.length , 
                    "data" : d3.nest()
                        .key( function(i){ return i.status ; })
                        .entries( hub )
                } 
            })
            .entries( data.site_visits ) ;

        var trainings_per_hubs = d3.nest()
            .key( function(d){ return d.hub_code ; })
            .rollup(function( hub ) { 
                return {  
                    "total": hub.length , 
                    "data" : d3.nest()
                        .key( function(i){ return i.status ; })
                        .entries( hub )
                } 
            })
            .entries( data.trainings ) ;

        var tot_vists = 0 ; 
        var tot_trainings = 0 ; 

        for ( var h in site_visits_per_hubs )
        {
            var completed_visits = [] ; 
            for ( var d in site_visits_per_hubs[h].values.data )
            {
                if ( site_visits_per_hubs[h].values.data[d].key == 'Completed' )
                {
                    completed_visits = site_visits_per_hubs[h].values.data[d].values ; 
                    break ;    
                }
                 
            }
            var completed_trainings = [] ; 
            for ( var d in trainings_per_hubs[h].values.data )
            {
                if ( trainings_per_hubs[h].values.data[d].key == 'Completed' )
                {
                    completed_trainings = trainings_per_hubs[h].values.data[d].values ; 
                    break ;    
                }
                 
            }

            var html = '<tr>' ; 
            html += '<td>'+site_visits_per_hubs[h].key+'</td>' ; 
            html += '<td class="value">'+(completed_visits.length)+'</td>' ; 
            html += ' <td class="value">'+(completed_trainings.length)+'</td>' ; 
            html += '</tr>'; 

            tot_vists += Math.abs( completed_visits.length ) ; 
            tot_trainings += Math.abs( completed_trainings.length ) ; 


            $('table#global_indicators').append( html )
        }
        
        var total_html = '<tr>' ; 
        total_html += '<td><strong><u>Totals</u></strong></td>' ; 
        total_html += '<td class="value">'+(tot_vists)+'</td>' ; 
        total_html += ' <td class="value">'+(tot_trainings)+'</td>' ; 
        total_html += '</tr>'; 


        $('table#global_indicators').append( total_html ) ; 


        // building data per countries
        site_visits_per_country = d3.nest()
            .key( function( d ){ return d.country ;  })
            .rollup(function( country ) { return {  "total": country.length } })
            .entries( data.site_visits  ) ; 

        // console.info( site_visits_per_country ) ; 
        trainings_per_country = d3.nest()
            .key( function( d ){ return d.country ;  })
            .rollup(function( country ) { return {  "total": country.length } })
            .entries( data.trainings  ) ; 

        trainings_per_place = d3.nest()
            .key( function( d ){ return d.place ;  })
            .rollup(function( place ) { return {  
                "total": place.length , 
                "gps_x" : place[0].gps_x , 
                "gps_y" : place[0].gps_y , 
                "status" : place[0].status , 
                "data" : place
            } })
            .entries( data.trainings  ) ; 

        /*for ( var t in trainings_per_place )
        {
            var p = trainings_per_place[t] ; 
            
            if ( p.values.status == 'Completed' )
            {
                console.info('{ "type": "Feature", "properties": { "Name": "'+p.key+'", "Latitude": '+p.values.gps_x+', "Longitude":'+p.values.gps_y+' }, "geometry": { "type": "Point", "coordinates": [ '+p.values.gps_x+', '+p.values.gps_y+' ] } },') ; 
            }
        }*/



    }

    /**
    *
    */
    var grabGicrValues = function(){

        for( var f in CanGraphGeometries.features ) 
        {
            var c = CanGraphGeometries.features[f].properties  ;

            for ( var g in gicr_csv )
            {
                if ( gicr_csv[g].HUB == 'undefined' || hubs_per_name[ gicr_csv[g].HUB ] == undefined) continue ; 

                if( c.ISO_3_CODE == gicr_csv[g].UN_Code )
                {
                    c.values        = gicr_csv[g] ; 
                    c.values.color  = hubs_per_name[ gicr_csv[g].HUB ].color ; 

                    // console.info( c.CNTRY_TERR , c.values.color ) ;
                    // find hub
                    break ; 
                } 
                
            } // end for 

            // site visits
            for ( var g in site_visits_per_country )
            {

                if ( c.CNTRY_TERR == site_visits_per_country[g].key )
                {
                    c.site_visits = site_visits_per_country[g].values.total ; 
                    break ; 
                }
            }

            for ( var g in trainings_per_country )
            {
                if ( c.CNTRY_TERR == trainings_per_country[g].key )
                {
                    c.trainings = trainings_per_country[g].values.total ; 
                    break ; 
                }
                
            }
           
        } // end for 

        // grab trainings to bubbles
        for ( var g in CanGraphTrainings.features )
        {
            var path = CanGraphTrainings.features[g] ; 
            
            for ( var p in trainings_per_place )
            {
                var place = trainings_per_place[p] ; 

                if ( place.key == path.properties.Name && place.values.status == "Completed")
                {
                    path.properties.total = place.values.total ; 
                    path.properties.data = place.values.data ; 
                    break ; 
                }
            }
        }

        updateGeographyFilling() ; 

        // populateHubsNames(); 

        populateCountryNames();

        buildLegend();

        buildGeoLegend();
    }

    var populateCountryNames = function(){

        CanMapText.selectAll(".subunit-label")
            .data( CanGraphGeometries.features )
            .enter()
            .append("text")
                .attr("id",function(d){ return "label-"+d.properties.ISO_3_CODE ; })
                .attr("class", "subunit-label" )
                .attr("transform", function(d) { return "translate(" + CanGraphMapPath.centroid(d) + ")"; })
                .attr("dy", ".35em")
                .text(function(d){
                    if ( d.properties.CNTRY_TERR == null ) return ; 

                    if ( d.properties.values == undefined )
                        return ; 
                    else
                        return d.properties.CNTRY_TERR ;
                })       
        ;

        return true ; 

    }

    var populateHubsNames = function(){

        var hubs_a = $.map( hubs , function(value, index) {
            return [value];
        }); 

        // console.info( hubs_a ); 

        CanMapSvg.selectAll(".unit-label")
            .data( hubs_a )
            .enter()
                .append("text")
                    .text(function(d){ return d.label ; })    
                    .attr("class", "unit-label" )
                    .attr("dy", ".35em")
                    .attr("width",150)
                    .attr("height",25)
                     .attr("transform", function(d) { 
                        var item = checkCountry( CanGraphMapFeatures , d.plot_name ) ; 
                        var centroid = CanGraphMapPath.centroid(item) ; 
                        // console.info( centroid , "translate(" + centroid +")" , "translate(" + centroid[0] +","+centroid[1]+")") ; 
                        var xCentroid = centroid[0] - d.plot_translate.x ; 
                        var yCentroid = centroid[1] - d.plot_translate.y ;
                        return  "translate(" + xCentroid +","+ yCentroid +")" ; 
                    })   
                    .attr("text-anchor","middle")
                    .attr("fill",function(d){  
                        return d.color ; 
                    })
        ;

        return true ; 
    }

    var updateGeographyFilling = function(){

        // 
        d3.selectAll(".country")
            .data( CanGraphGeometries.features ) 
            .transition()
            .duration(1500)
            .attr("fill", function(d){

                switch( d.properties.NAME ) 
                {   
                    // lakes
                    case "Lakes" : 
                        return "#fff" ;
                        break ; 

                    // all countries
                    case null :
                        if ( d.properties.values == undefined )
                        {
                            return GICR.default_color ; 
                        }
                        else if ( view == 2 )
                        {
                            return GICR.default_color ;  
                        }
                        else
                        {
                            switch ( level )
                            {
                                case 0 : 
                                    return d.properties.values.color ; 
                                    break ; 

                                case 1 : 
                                    if ( hubs[ current_hub ] != undefined && hubs[ current_hub ].name == d.properties.values.HUB ) 
                                        return d.properties.values.color ; 
                                    else
                                        return GICR.default_color ;                                    
                                    break ; 

                                case 2 : 
                                    if ( d.properties.ISO_3_CODE == current_country )
                                        return d.properties.values.color ; 
                                    else
                                        return GICR.default_color ;  

                                    break ; 

                            } // end swtich 
                        }
                        break ; 

                    // borders
                    default : 
                        return GICR.default_color ; 

                } // end switch
            }) 
            .attr('attr-hub', function(d) { 
                if ( d.properties.values !=  undefined ) return d.properties.values.HUB ;
                return '' ;  
            })
        ; 
    }

    var zoomRegion = function( codeCountry , scale , translateX , translateY , hub_id )
    {
        var CanGraphMapFeatures = d3.selectAll(".country") ; 

        var focusedCountry = checkCountry( CanGraphMapFeatures , codeCountry );

        // 1st case : no focus found
        // 2nd case : click same hub so unzoom
        if ( codeCountry == undefined || focusedCountry == undefined || ( hub_id != undefined && current_hub == hub_id ) ) 
        {
            current_hub = undefined ; 

            var x = 0 ;
            var y = 0 ; 
            scale = 1 ; 
            var stroke_width = 1 ; 
            var translate = "translate("+dataviz_conf.chart.globe_translate.x+","+dataviz_conf.chart.globe_translate.y+")" ; 
            
            zoomed = false ; 

            $('text.subunit-label').removeClass('zoomed');
        }
        else
        {
            current_hub = Math.abs(hub_id) ; 

            var centroid = CanGraphMapPath.centroid( focusedCountry ) ;
            var x = centroid[0] ;
            var y = centroid[1] ;
            var stroke_width = 1.5 / scale ; 
            var centered = focusedCountry ;
            if ( translateX == undefined ) translateX = map_width / 4 ; 
            if ( translateY == undefined ) translateY = map_height / 2 ; 
            var translate = "translate(" + translateX + "," + translateY + ")" ; 

            zoomed = true ;    
            
        }

        d3.selectAll("g")
            .transition()
            .duration( 1500 )
            .attr("transform", translate + "scale(" + scale + ")translate(" + -x + "," + -y + ")")
        ;

        
    }

    /**
    *
    * @type global | hub | hub-country
    **/
    var zoomView = function( item , type )
    {
        // var option = $('select[name="geography"] :selected').attr('class') ; 
        var scale = 2 ;
        // var hub_id = Math.round( item.value ) ; 

        var option = type ; 
        var hub_id = Math.abs(item) ; 

        $('#list-hubs a').removeClass('active') ; 
        $('#list-hubs a[attr-hub="'+hub_id+'"]').addClass('active') ; 

        current_country = item.value ; 

        switch( option ) 
        {
            case "global" :

                $('#hubPanel').removeClass('show') ;
                $('#countryPanel').removeClass('show') ;

                zoomRegion( undefined ) ; 
                setTimeout(function(){
                    $(".unit-label").fadeIn(); 
                },1500);
                level = 0 ; 
                $('text.subunit-label').removeClass('zoomed selected');
                $('text.place-label').removeClass('show');
                $('.hubs-list').removeClass('hidden');
                break ; 


            case "hub" : 
                level = 1 ; 

                $(".unit-label").hide() ; 
                $('.hubs-list').addClass('hidden');
                $('#hubPanel').addClass('show') ;
                $('#countryPanel').removeClass('show') ;
                var hub = hubs[ hub_id ] ; 
                $('ul.hubCountries').html(' ') ; 
                $('.hub-name').css('color' , hub.color ).text( hub.label ) ; 
                $('.hub-line').css('background-color' , hub.color ) ; 
                $('text.place-label').removeClass('show');
                
                for ( var g in gicr_csv )
                {
                    if( gicr_csv[g].HUB == hub.name ) 
                    {
                        if ( gicr_csv[g].Country == '' ) continue ; 
                        $('ul.hubCountries').append('<li><a href="#" onclick="zoomCountry(\''+gicr_csv[g].UN_Code+'\')" hover-color="'+hub.color+'" iso-code="'+gicr_csv[g].UN_Code+'">'+gicr_csv[g].Country+'</a></li>') ; 
                    }
                }

                switch( hub_id )
                {
                
                    case 1 : // sub saharian africa
                        var codeCountry = "CMR" ; 
                        var translateX = map_width / 4 ; 
                        var translateY = map_height / 2.5 ; 
                        break ; 

                    case 2 : // northern africa + south east asia
                        var codeCountry = "MAR" ; 
                        scale = 2.5 ; 
                        var translateX = map_width / 10 ; 
                        break ; 

                    case 6 : // latin america
                        var codeCountry = "PER" ; 
                        scale = 1.8 ; 
                        var translateX = map_width / 3.5 ; 
                        var translateY = map_height / 2.5 ; 
                        break ; 

                    case 3 : // south east southern asia
                        var codeCountry = "VNM" ; 
                        var translateX = map_width / 2.8 ;
                        scale = 1.8 ;  
                        break ; 

                    case 5 : // carribean
                        var codeCountry = "LCA" ; 
                        scale = 5 ;
                        var translateX = map_width / 3.5 ; 
                        var translateY = map_height / 3 ; 
             
                        break ; 
                    case 4 : 
                        var codeCountry = "FJI" ; 
                        scale = 10 ; 
                        var translateX = map_width / 40 ; 
                        break ; 
                }

                // zoom on region 
                zoomRegion( codeCountry , scale , translateX , translateY , hub_id ) ; 
                $('text.subunit-label').removeClass('zoomed selected');

                // get extra data 
                $.ajax({
                    type: "GET",
                    url: "data/hubs/"+hub.code+".xml",
                    dataType: "xml",
                    success: function(xml) { 
                        var xmlString = (new XMLSerializer()).serializeToString(xml);
                        var x2js      = new X2JS();
                        var json  = x2js.xml_str2json( xmlString );
                        var data  = json.country ;

                        $('#hub_centers').html( data.hub_centers.toString() ); 
                        $('#hub_pi').html( data.hub_pi.toString() ); 
                        $('#canreg_experts').html( data.canreg_experts ); 
                        $('#planned_activities').html( data.planned_activities ); 
                    }
                });

                $('#hubPanel ul.hubCountries li').css('background-color', hub.color ) ; 
                $('#hubPanel h3').css('border-color', hub.color ) ; 

                $('ul.hubCountries li a').hover(function(){
                    $(this).css('border-color', $(this).attr('hover-color') ) ; 
                    $('path#code_'+ $(this).attr('iso-code') ).addClass('hover') ; 
                },function(){
                    $(this).css('border-color', 'transparent' ) ; 
                    $('path#code_'+ $(this).attr('iso-code') ).removeClass('hover') ; 
                })
                break ; 

            case "hub-country" : 

                $('#hubPanel').removeClass('show') ;
                $('#countryPanel').addClass('show') ;
                $('.hubs-list').addClass('hidden');
                
                level = 2 ; 
                $(".unit-label").hide(); 
                zoomRegion( item.value , 10 ) ; 
                $('text.subunit-label').addClass('zoomed');
                $('text#label-'+ item.value ).addClass('selected');
                $('text.place-label.code-'+codeCountry).addClass('show');

                setCountryPanel( item.value ) ; 

                break ; 

        } // end switch

        updateGeographyFilling(); 
    }

    var zoomCountry = function( codeCountry )
    {
        current_country = codeCountry ; 

        level = 2 ; 
        $(".unit-label").hide(); 

        $('#hubPanel').removeClass('show') ;
        $('text.subunit-label.selected').removeClass('selected');
        $('text.subunit-label').addClass('zoomed');
        $('text#label-'+ codeCountry ).addClass('selected');
        $('text.place-label.code-'+codeCountry).addClass('show');

        zoomRegion( codeCountry , 10 ) ; 

        setCountryPanel( codeCountry ) ; 

        updateGeographyFilling();
    }

    var setCountryPanel = function( codeCountry )
    {
        $('#countryPanel').removeClass('show') ;
        $('#countryPanel').addClass('show') ;

        $('#country-name').css('color' , countries[codeCountry].color ).text( countries[codeCountry].Country );
        $('.hub-line').css('background-color' , countries[codeCountry].color ) ; 

        

        // load xml of country
        if ( codeCountry == 'VNM')
        {
            $.ajax({
                type: "GET",
                url: "data/countries/VNM.xml",
                dataType: "xml",
                success: function(xml) { 
                    var xmlString = (new XMLSerializer()).serializeToString(xml);
                    var x2js      = new X2JS();
                    var json  = x2js.xml_str2json( xmlString );
                    var data  = json.country ;

                    $('#tab-2').html( data.need ); 
                    $('#tab-3').html( data.solution ); 
                    $('#tab-4').html( data.impact ); 
                    $('#tab-5').html( data.action ); 
                    $('#tab-6').html( data.collaborators.toString() ); 


                }
            });
        }   

    }

    var buildLegend = function(){

        return ; 
        /*d3.select("svg#legend").html(' ') ; 

        var  t = textures.lines().size(6).strokeWidth(1) ; 
        CanMapSvg.call(t);

        d3.select("svg#legend")
            .append('rect')
            .attr('class','rect_Legend for_bubble')
            .attr("x", 0 ) 
            .attr("y", 20 )
            .attr("width", 35 )
            .attr("height", 15 )
            .style("stroke", GICR.default_color )
            .style("stroke-width", "0.5px")
            .style("fill",  GICR.default_color )

        // No data 
        d3.select("svg#legend")
            .append('text')
            .attr('class','text_Legend for_bubble')
            .attr("x", 50 )  // leave 5 pixel space after the <rect>
            .attr("y", 20 )  // + (CanMapHeight - 200);})
            .style('font-size','12px')
            .attr("dy", "0.9em") // place text one line *below* the x,y point
            .text("GICR countries") ;*/

    }

    var buildCircleLegend = function(){
        
        return ; 

        var svg_legend = d3.select("svg#legend_bubble")
          .append("g")
          .attr("id","bubbles-legend")  
        ; 

        var legend = svg_legend.append("g")
          .attr("class", "legend")
          .attr("transform","translate(20,20)")
          .selectAll("g")
          .data( [ 1 , 10 ] )
          .enter().append("g") ;

        legend.append("circle")
          .attr("cy", function(d) { return -CanGraphRadiusBubble(d); })
          .attr("r", function(d){ 
            return d ; 
           })
          .attr("class","circle_legend")
          .style("fill","transparent")
          .style("stroke-width","0.5px")
          .style("stroke","#000")
        ;

        legend.append("line")
          .attr("class","line_legend")
          .attr("x1", 0)
          .attr("x2", 87)
          .attr("y1", function(d) { return -(d) ; })
          .attr("y2", function(d) { return -(d) ; })
          .style("stroke","#000")
          .style("stroke-width","0.1px")
        ;

        legend.append("text")
          .attr("x", 90 )
          // .attr("y",  function(d) { return -(( $scope.radiuses(d) * 2 ) + 12 ); })
          .attr("y",  function(d) {  return -(d) - 8 ; })
          .attr("class","text_legend")
          .attr("dy", "1.3em")
          .style("font-size","8px")
          .text(function(d,i){
            return d ; 
        });

    }