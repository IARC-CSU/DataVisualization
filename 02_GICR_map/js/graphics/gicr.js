	
	var PROJECT 			= 'map' ; 

    var hubs = {
        1 : { 'name' : 'SS-Africa' , 'label' : 'Sub saharian Africa', 'color' : '#71C8E3' } , 
        2 : { 'name' : 'NA,C-Africa, W.Asia' , 'label' : 'North Africa, Center Af. & Wester Asia', 'color' : '#724A98' } , 
        3 : { 'name' : 'S,E,SE Asia' , 'label' : 'South, East & Southern East Asia',  'color' : '#2EAF81' } , 
        4 : { 'name' : 'Carribean' , 'label' : 'The carribean',  'color' : '#6D8E99' } , 
        5 : { 'name' : 'Pacific' , 'label' : 'Pacific islands',  'color' : '#b21c01' } ,
        6 : { 'name' : 'LatAm' , 'label' : 'Latin America',  'color' : '#FDCC00' }
    } ; 

    var hubs_per_name = [] ; 
    for ( var h in hubs ) hubs_per_name[ hubs[h].name ] = hubs[h] ; 

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
            'globe_translate' : { 'x' : -30 , 'y' : 100 } , 
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

        var funcOutMap = function(){ return false ; }

    }) ;

    /**
    *
    *
    */
    var setViewPer = function( item ){

        view = Math.abs( item.value ) ; 

        if ( view == 1 )
        {
            $('.filter-function').hide(); 
            $('.filter-geography').show(); 
        } 
        else
        {
            $('.filter-function').show(); 
            $('.filter-geography').hide(); 
        }

        updateGeographyFilling(); 
    }

    /**
    *
    */
    var buildGeoLegend = function(){
        // build legend 
        for ( var h in hubs )
        {
            var span_a = '<span class="hub" style="background-color:'+hubs[h].color+';"></span>'+hubs[h].label ; 
            var li = '<li><a href="javascript:void(0)" onclick="clickHub('+h+')">'+span_a+'</a></li>' ; 
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

                $('select[name="geography"]').append( '<option value="'+(Math.abs(s))+'" class="hub">'+label+'</option>' ) ; 

                for ( var v in select_geo[s].values )
                {
                    var item        = select_geo[s].values[v] ; 
                    if ( item.Country == '' ) continue ; 

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

        populateCountryNames(); 

    }

    var populateCountryNames = function(){

        CanMapText.selectAll(".subunit-label")
            .data( CanGraphGeometries.features )
            .enter()
            .append("text")
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

    }

    var updateGeographyFilling = function(){

        var  t = textures.lines().size(6).strokeWidth(1) ; 
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
                            return GICR.default_color ;  
                        else
                            return d.properties.values.color ; 
                        break ; 

                    // borders
                    default : 
                        return GICR.default_color ; 

                } // end switch
            }) 
            // .attr("opacity", 1 )
        ; 
    }

    var zoomView = function( item )
    {
        var option = $('select[name="geography"] :selected').attr('class') ; 
        
        var scale = 2 ;

        var hub_id = Math.round( item.value ) + 1 ; 

        if ( option == 'hub' )
        {
            switch( hub_id )
            {
                case 1 : // sub saharian africa
                    var codeCountry = "CMR" ; 
                    var translateX = map_width / 2 ; 
                    var translateY = map_height / 3 ; 
                    break ; 

                case 2 : // northern africa
                    var codeCountry = "GEO" ; 
                    scale = 2 ; 
                    var translateX = map_width / 3 ; 
                    break ; 

                case 6 : // latin america
                    var codeCountry = "COL" ; 
                    scale = 1.8 ; 
                    var translateX = map_width / 3.5 ; 
                    var translateY = map_height / 3 ; 
                    break ; 

                case 3 : // south east southern asia
                    var codeCountry = "VNM" ; 
                    var translateX = map_width / 2.8 ;
                    scale = 1.8 ;  
                    break ; 

                case 4 : // carribean
                    var codeCountry = "LCA" ; 
                    scale = 5 ;
                    var translateX = map_width / 3.5 ; 
                    var translateY = map_height / 3 ; 
         
                    break ; 
                case 5 : 
                    var codeCountry = "FJI" ; 
                    scale = 10 ; 
                    var translateX = map_width / 20 ; 
                    break ; 
            }

            // zoome on region 
            zoomRegion( codeCountry , scale , translateX , translateY , hub_id ) ; 
        }
        else
        {
            zoomRegion( item.value , 10 ) ; 
        }
    }
    
    var zoomRegion = function( codeCountry , scale , translateX , translateY , hub_id )
    {
        var CanGraphMapFeatures = d3.selectAll(".country") ; 

        var focusedCountry = checkCountry( CanGraphMapFeatures , codeCountry );

        // console.info( focusedCountry , codeCountry ) ; 

        // 1st case : no focus found
        // 2nd case : click same hub so unzoom
        if ( focusedCountry == undefined || ( hub_id != undefined && current_hub == hub_id ) ) 
        {
            current_hub = undefined ; 

            var x = 0 ;
            var y = 0 ; 
            scale = 1 ; 
            var stroke_width = 1 ; 
            var translate = "translate(0,200)" ; 
            
            zoomed = false ; 
            level = 0 ; 

            $('text.subunit-label').removeClass('zoomed');
        }
        else
        {
            current_hub = hub_id ; 
            level = 1 ; 

            var centroid = CanGraphMapPath.centroid( focusedCountry ) ;
            var x = centroid[0] ;
            var y = centroid[1] ;
            var stroke_width = 1.5 / scale ; 
            var centered = focusedCountry ;
            if ( translateX == undefined ) translateX = map_width / 4 ; 
            if ( translateY == undefined ) translateY = map_height / 2 ; 
            var translate = "translate(" + translateX + "," + translateY + ")" ; 

            zoomed = true ;     

            $('text.subunit-label').addClass('zoomed');
        }

        d3.selectAll("g")
            .transition()
            .duration( 1500 )
            .attr("transform", translate + "scale(" + scale + ")translate(" + -x + "," + -y + ")")
        ;

        
    }