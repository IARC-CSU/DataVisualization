	
	var PROJECT 			= 'map' ; 

    var hubs = {
        1 : { 'id' : 1 , 'name' : 'SS-Africa' , 'label' : 'Sub saharian Africa', 'color' : '#71C8E3' , 'plot_name' : 'ZAF' , 'plot_translate' : { 'x' : 150 , 'y' : -250 } } , 
        2 : { 'id' : 2 , 'name' : 'NA,C-Africa, W.Asia' , 'label' : 'North Africa, Center Africa & Western Asia', 'color' : '#724A98' , 'plot_name' : 'MAR' , 'plot_translate' : { 'x' : 320 , 'y' : -180 } } , 
        3 : { 'id' : 3 , 'name' : 'S,E,SE Asia' , 'label' : 'South, East & Southern East Asia',  'color' : '#2EAF81' , 'plot_name' : 'CHN' , 'plot_translate' : { 'x' :  300 , 'y' : -400 }} , 
        4 : { 'id' : 4 , 'name' : 'Pacific' , 'label' : 'Pacific islands',  'color' : '#ff6600' , 'plot_name' : 'FJI' , 'plot_translate' : { 'x' : 90 , 'y' : -160 } } , 
        5 : { 'id' : 5 , 'name' : 'Carribean' , 'label' : 'The carribean',  'color' : '#b21c01' , 'plot_name' : 'SUR' , 'plot_translate' : { 'x' : 100 , 'y' : -150 } } ,
        6 : { 'id' : 6 , 'name' : 'LatAm' , 'label' : 'Latin America',  'color' : '#FDCC00', 'plot_name' : 'PER' , 'plot_translate' : { 'x' : 200 , 'y' : -280 }}
    } ; 

    var title = 'Global Initiative for Cancer Registries' ;

    var hubs_per_name = [] ; 
    for ( var h in hubs ) 
    {
        hubs_per_name[ hubs[h].name ] = hubs[h] ; 
        $('.line').append('<div class="line-hub" style="background-color:'+hubs[h].color+';"></div>')
    }
    var GICR = {
        'default_color' : '#e3e3e3'
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
            'scale' : 320 , 
            'key_data_value' : 'value' , 
            'globe_translate' : { 'x' : -150 , 'y' : 200 } , 
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

    }) ;

    var setFunctionView = function( item )
    {   
        $('#title-map').text( title + ': '+ $('select[name="function"] :selected').text() ) ; 

        if ( item == undefined )
            metric = 'visit' ; 
        else
            metric = $('select[name="function"] :selected').val() ; 

        d3.selectAll('.bubble').transition()
            .duration( 750 )
            .attr('r',function(d){
                if ( d.properties.NAME == null && d.properties.values != undefined )
                    return CanGraphRadiusBubble( Math.floor((Math.random() * 10) + 1) ) ; 
            })
            .delay( 750 )
        ; 

    }

    /**
    *
    *
    */
    var setViewPer = function( item ){

        view = Math.abs( item.value ) ; 

        d3.selectAll('.circleGroup').remove();

        if ( view == 1 )
        {
            $('.filter-function').hide(); 
            $('.filter-geography').show(); 
            $(".unit-label").fadeIn() ;
            buildLegend() ; 
            $('#title-map').text( title + ': geographic view') ;
            $('select [name="geography"]').val( 'global' );
            $('.hubs-list').addClass('hidden');
        } 
        else
        {
            $('.hubs-list').removeClass('hidden');
            $('.filter-function').show(); 
            $('.filter-geography').hide(); 
            $(".unit-label").fadeOut() ;
            $('#title-map').text( title + ': site visit(s)') ;
            $('#hubPanel,#countryPanel').removeClass('show') ;

            if ( level != 0 ) zoomRegion( undefined ) ; 

            setTimeout(function(){
                
                CanCircleGroup = CanMapSvg.append("g")
                    .attr('class','circleGroup')
                    .attr("transform", "translate("+CanMapConf.chart.globe_translate.x+","+CanMapConf.chart.globe_translate.y+")")
                ;

                CanGraphRadiusBubble = d3.scale.sqrt()
                    .domain([ 0, 10 ])
                    .range([ 0, 15 ]);

                CanCircleGroup.append("g")
                    .selectAll("circle")
                    .data( CanGraphGeometries.features )
                    .enter().append("circle")
                    .attr("class","bubble")
                    .style('fill', function(d){ 
                        if ( d.properties.NAME == null && d.properties.values != undefined)
                        {
                            return d.properties.values.color ; 
                        }
                    } )
                    .style('fill-opacity', 0.7)
                    .style('stroke','#ffffff')
                    .style('stroke-width','.5px')
                    .attr("transform", function(d) { return "translate(" + CanGraphMapPath.centroid(d) + ")"; })
                    .attr("r",0)
                    .on('mouseover', function(d){ hoverFunction(d) })
                    .on("mouseout", function(d){ outFunction(d) })
                ;

                setFunctionView( undefined );

            },500);
        }

        updateGeographyFilling(); 
    }


    var hoverFunction = function( item ){

        $('.canTooltip').show(); 

        var mouse = d3.mouse( CanMapSvg.node()).map(function(d) {
            return parseInt(d);
        });

        CanMapTooltip
            .style('top', (mouse[1] - 60 ) + 'px')
            .style('left', (mouse[0] - 80 ) + 'px');

        $('.canTooltip div.tooltip-line').css('background-color', item.properties.values.color )
        $('.canTooltip h2').html( item.properties.CNTRY_TERR + '<span>'+Math.floor((Math.random() * 10) + 1) +' '+metric+'(s)</span>' ) ; 
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
            var li = '<li><a href="javascript:void(0)">'+span_a+'</a></li>' ; 
            $('ul.hubs-list').append( li ) ; 
        }
    }

    /**
    *
    */
    var loadGircData = function(){

        // loading gicr map
        d3.csv( "data/gicr.csv" , function( data ){

            gicr_csv = data ; 

            // build selectbox for geography region 
            var select_geo = d3.nest()
                .key(function(d){ return d.HUB })
                .entries( gicr_csv ) ;

            for ( var s in select_geo )
            {
                var label       = ' - ' + hubs_per_name[ select_geo[s].key ].label ; 
                var value       = select_geo[s].key ; 

                $('select[name="geography"]').append( '<option value="'+hubs_per_name[ select_geo[s].key ].id+'" class="hub">'+label+'</option>' ) ; 

                for ( var v in select_geo[s].values )
                {
                    var item        = select_geo[s].values[v] ; 
                    if ( item.Country == '' ) continue ; 

                    item.color      = hubs_per_name[ select_geo[s].key ].color ; 
                    countries[ item.UN_Code ] = item ; 

                    $('select[name="geography"]').append( '<option value="'+item.UN_Code+'" class="hub-country"> &nbsp;&nbsp; - '+item.Country+'</option>' ) ; 
                }
            }
            
        }); 

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
                if( c.ISO_3_CODE == gicr_csv[g].UN_Code )
                {
                    c.values        = gicr_csv[g] ; 
                    c.values.color  = hubs_per_name[ gicr_csv[g].HUB ].color ; 

                    // console.info( c.CNTRY_TERR , c.values.color ) ;
                    // find hub
                    break ; 
                } 
                
            } // end for 
           
        } // end for 

        updateGeographyFilling() ; 

        populateHubsNames(); 

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
            /*.append("rect")
                .attr("class", "unit-label" )
                .attr("fill", function(d){ return d.color ; })
                .attr("width",150)
                .attr("height",25)
                .attr("transform", function(d) { 
                    var item = checkCountry( CanGraphMapFeatures , d.plot_name ) ; 
                    return "translate(" + CanGraphMapPath.centroid(item) + ")"; 
                })*/
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

        /*CanMapSvg.selectAll(".unit-line")
            .data( hubs_a )
            .enter()
                .append("line")
                .attr("stroke",function(d){ return d.color ; })
                .attr("stroke-width",1)
                .attr("x",function(d) { 
                    var item = checkCountry( CanGraphMapFeatures , d.plot_name ) ; 
                    var centroid = CanGraphMapPath.centroid(item) ; 
                    //return 0 ; 
                    return centroid[0] - d.plot_translate.x ; 
                })
                .attr("y",function(d) { 
                    var item = checkCountry( CanGraphMapFeatures , d.plot_name ) ; 
                    var centroid = CanGraphMapPath.centroid(item) ; 
                    //return 0 ; 
                    return centroid[1] - d.plot_translate.y ; 
                })
                .attr("x1",function(d) { 
                    var item = checkCountry( CanGraphMapFeatures , d.plot_name ) ; 
                    var centroid = CanGraphMapPath.centroid(item) ; 
                    return centroid[1] ; 
                })
                .attr("y1",function(d) { 
                    var item = checkCountry( CanGraphMapFeatures , d.plot_name ) ; 
                    var centroid = CanGraphMapPath.centroid(item) ; 
                    return centroid[1] ; 
                });*/


        return true ; 
    }


    var updateGeographyFilling = function(){

        switch( level )
        {
            case 0 :
                var  t = textures.lines().size(6).strokeWidth(1) ; 
                break  ; 

            case 1 : 
                var  t = textures.lines().size(3).strokeWidth(0.5) ; 
                break  ; 

            case 2 : 
                var  t = textures.lines().size(1).strokeWidth(0.1) ; 
                break  ; 
        }
        
        CanMapSvg.call(t);

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
                            return t.url() ; 
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
                                    if ( hubs[ current_hub ].name == d.properties.values.HUB ) 
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
            // .attr("opacity", 1 )
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
            var translate = "translate(-50,200)" ; 
            
            zoomed = false ; 

            $('text.subunit-label').removeClass('zoomed');
        }
        else
        {
            current_hub = hub_id ; 

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

    var zoomView = function( item )
    {
        var option = $('select[name="geography"] :selected').attr('class') ; 
        
        var scale = 2 ;

        var hub_id = Math.round( item.value ) ; 
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
                break ; 


            case "hub" : 
                level = 1 ; 

                $(".unit-label").hide() ; 

                $('#hubPanel').addClass('show') ;
                $('#countryPanel').removeClass('show') ;
                var hub = hubs[ hub_id ] ; 
                $('ul.hubCountries').html(' ') ; 
                $('.hub-name').css('color' , hub.color ).text( hub.label ) ; 
                $('.hub-line').css('background-color' , hub.color ) ; 

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

                level = 2 ; 
                $(".unit-label").hide(); 
                zoomRegion( item.value , 10 ) ; 
                $('text.subunit-label').addClass('zoomed');
                $('text#label-'+ item.value ).addClass('selected');

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
        $('text.subunit-label').addClass('zoomed');
        $('text#label-'+ codeCountry ).addClass('selected');

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

                    $('#intro').text( data.intro ); 

                    $('#population').text( data.population ); 
                    $('#hdi').text( data.hdi ); 

                    $('#incidence_cases').text( data.incidence.cases ); 
                    $('#incidence_cum_risk').text( data.incidence.cum_risk ); 
                    $('#mortality_deaths').text( data.mortality.deaths ); 
                    $('#mortality_cum_risk').text( data.mortality.cum_risk ); 

                    $('#description').html( data.description ); 
                    $('#tab-2').html( data.need ); 
                    $('#tab-3').html( data.solution ); 
                    $('#tab-4').html( data.impact ); 
                    $('#tab-5').html( data.action ); 

                }
            });
        }   

    }

    var buildLegend = function(){

        d3.select("svg#legend").html(' ') ; 

        var  t = textures.lines().size(6).strokeWidth(1) ; 
        CanMapSvg.call(t);

        d3.select("svg#legend")
            .append('rect')
            .attr('class','rect_Legend')
            .attr("x", 0 ) 
            .attr("y", 0 )
            .attr("width", 35 )
            .attr("height", 15 )
            .style("stroke","#cccccc")
            .style("stroke-width", "0.5px")
            .style("fill",  t.url() )


        // No data 
        d3.select("svg#legend")
            .append('text')
            .attr('class','text_Legend')
            .attr("x", 50 )  // leave 5 pixel space after the <rect>
            .attr("y", 0 )  // + (CanMapHeight - 200);})
            .style('font-size','12px')
            .attr("dy", "0.9em") // place text one line *below* the x,y point
            .text("Non GICR countries") ;

    }

    

  