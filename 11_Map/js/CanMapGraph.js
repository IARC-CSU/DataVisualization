// @from : https://gist.github.com/marcneuwirth/2865882

var CanMapConf = {} ;

var Jammu = 'Jammu and Kashmir' ; 

var show_circle         = false ;

var CanMapGraph = function( object ){

  // default conf
  this.default_conf = { 
        'id'            : '#svg', 
        'width'         : undefined , 
        'height'        : undefined , 
        'container'     : '#map-container' , 
        'type'          : 'map' , 
        'title'         : null ,                                    // title of the globcal chart
        'title_src'     : null ,
        'css'           : '',                                       // specific css to override styles
        'host_data'     : 'http://localhost/',
        'simple_map'    : false , 
        'width'         : null ,                                    // global chart width
        'height'        : null ,                                    // globcal chart height
        'labels'        : null ,                                    // from which field to take labels
        'values'        : null,                                     // from which field to take values
        'responsive'    : true,                                     // add a responsive manager,
        'data'          : {
            'format' : 'csv',                                       // csv - json 
            'url'    : 'data/data.csv' ,                            // url of data 
            'src'    : { 'data' : [] }   
        } , 
        'tooltip'   : {
            'decimal' : 1 , 
            'dividor' : 10 , 
        } , 
        'chart' : {
            'scale'         : 180 , 
            'globe_scale'   : 200 , 
            'globe_translate' : { 'x' : 0 , 'y' : 50 } , 
            'translate'     : null , 
            'key_data'      : 'id',
            'hd'            : false , 
            'mode'          : 'heat' , // heat or bubble
            'show_background' : true , 
            'background_globe' : '#ffffff',
            'projection'    : 'natural-earth',
            'background'    : '#ffffff',
            'graticule'     : false , 
            'callback_click'      : undefined , 
            'callback_mousehover' : undefined , 
            'callback_mouseout' : undefined , 
            'hook_value'    : 'roundProportion',
            'legend'        : true, 
            'legend_values' : true , 
            'legend_translate' : {
                'x' : 120 , 
                'y' : 0 
            } ,
            'default_color' : 'Blues', 
            'custom_ranges' : undefined , 
            'legend_decimal' : 1 , 
            'legend_suffix' : '',
            'fill_color'    : undefined , 
            'colors'        : undefined , 
            'color_scale'   : 'quantize' , 
            'key_data_value': 'value', 
            'key_label_value' : null , 
            'key_suffix_value' : '' ,
            'stroke_color'  : 'rgba(100, 100, 100,0.7)',
            'jump_to_init'  : {
                'delay' : 1500 , 
                'iso_code' : 'random'
            }, 
            'copyright' : undefined , 
            'delay_bubble' : 1000 , 
            'duration_bubble' : 1500 , 
            'range_radius' : [0,15] , 
            'bubble_color' : '#993404'
        }
        ,
        'downloads' : {                                             // set download buttons if false = hide all
            'icons': true, 
            'png' : true , 
            'pdf' : true ,
            'svg' : true ,
            'json': true , 
            'csv' : true ,
            'xml' : true
        },
        'filters' : [
            {
                'type'      : 'select',
                'multiple'  : false,
                'title'     : 'Cancer',   
                'data_url'  : 'api.php/globocan2012_cancer?transform=1' , 
                'data_key'  : 'key',
                'data_label': 'label'
            },
            {
                'type'      : 'radio',
                'multiple'  : false,
                'title'     : 'Filter by sex',
                'data'      : [
                    {'label' : 'Male','key' : 'male'},
                    {'label' : 'Female','key' : 'female', 'checked' : true}]
            }
        ]                             
    } ;

    // global conf
    // this.conf        = object.setConf( object.config , this.default_conf ) ;  
    CanMapConf          = object.setConf( object.config , this.default_conf ) ;  
    this.conf           = object.config ; 
    CanMapConf          = object.config ; 

    // local dataset saved
    this.current_dataset = [] ; 
};

var CanMapSvg, CanMapGroup , CanCircleGroup , 
    CanMapWidth , CanMapHeight , CanMapGraphProjection, CanMapBubblesData , 
    CanGraphMapColor , CanGraphMapColorQuantile,  CanGraphMapPath , CanGraphGeometries , CanGraphCountries , CanGraphCurrentKey = 'asr', CanGraphMapFeatures ,
    CanMapTooltip, CanMapCurrentType = 0, CanGraphMapZoom, CanGraphMapCentered , CanGraphMapLegend, CanMapGraphNbColors = 5,
    CanMapUniqueValues , 
    CanMapRotate = [20, 0],
    CanMapVelocity = [-.040, -0.000] ,
    // CanMapRotate = [20, 0],
    // CanMapVelocity = [0.09, 0] ,
    CanMapRotate = [10, 0],
    CanMapVelocity = [-.005, 0] , // [-.005, -0.001]
    CanMapSens = 0.25, 
    focusedCountry, focused, 
    isTurning = false , 
    isMonoColor = false , 
    CanGraphMaxValue , CanGraphRadiusBubble , 
    g_lines , g_poly , 
    currentMonoColor , 
    currentClickedColors , 
    CanMapColorSet, 
    CanMapCurrentRotation = undefined
;

var CanGraphMapProjections ,  CanGraphMapProjectionsI = { "aitoff" : 0 , "globe" : 1 , "mercator" : 2 , "natural-earth" : 3 } ; 

CanMapGraph.prototype = {
  
    /**
    * Manage launch 
    */
    launch : function( oCanGraph ){

        CanMapWidth = ( CanMapConf.width != undefined ) ? CanMapConf.width : $( CanMapConf.container ).width() ,
            CanMapHeight = ( CanMapConf.height != undefined ) ? CanMapConf.height : 700 ;

        CanGraphMapProjections = [
          { name: "Aitoff", projection: d3.geo.aitoff()},
          { name: "Globe", projection : d3.geo.orthographic().scale(CanMapConf.chart.globe_scale).translate([CanMapWidth/2,CanMapConf.chart.globe_translate.y]).rotate([0,0]).clipAngle(90 + 1e-6).precision(.3)  }, //.origin([-71.03,42.37])},
          { name: "Mercator", projection: d3.geo.mercator()},
          { name: "Natural Earth", projection: d3.geo.naturalEarth().scale(CanMapConf.chart.scale).translate( (CanMapConf.chart.translate == null) ? [CanMapWidth/2,320] : CanMapConf.chart.translate )}
        ];

        /*options.forEach(function(o) {
          o.projection.rotate([0, 0]).center([0, 0]);
        });*/

        var i = 0 ,
            n = CanGraphMapProjections.length - 1 ;

        CanMapGraphProjection = CanGraphMapProjections[ CanGraphMapProjectionsI[ CanMapConf.chart.projection ] ].projection;

        CanGraphMapPath = d3.geo.path()
            .projection( CanMapGraphProjection );

        if ( CanMapConf.chart.graticule ) var graticule = d3.geo.graticule();

        //console.log( CanMapConf.id ); 

        CanMapSvg = d3.select( CanMapConf.container ).append("svg")
            .attr("width", CanMapWidth)
            .attr("height", CanMapHeight)
            .attr("id", CanMapConf.id )
            // .on("mousedown", mapMouseDown )
        ;

        /*CanMapSvg.append("path")
            .datum({type: "Sphere"})
            .attr("stroke","none")
            .attr("id", "sphere")
            .attr("d", CanGraphMapPath)
            .attr("fill", CanMapConf.chart.background_globe )

            .call(

                d3.behavior.drag()
                    .origin(function() { 
                        var r = CanMapGraphProjection.rotate(); 
                        CanMapTooltip.style('display','none');
                        return {x: r[0] / CanMapSens, y: -r[1] / CanMapSens}; 
                    })
                    .on("drag", function() {

                        if ( CanMapConf.chart.projection != 'globe' ) return ; 
                        var rotate = CanMapGraphProjection.rotate() ;
                        
                        if ( CanMapConf.chart.projection == 'globe' )
                        {
                            // if globe, we can rotate according to mouse movements
                            var rotation = [d3.event.x * CanMapSens, -d3.event.y * CanMapSens, rotate[2]]
                            CanMapGraphProjection.rotate(rotation);
                            CanMapRotate = rotation ; 
                        }
                        else
                        {
                            // only drag onx for classic map
                            CanMapGraphProjection.rotate([d3.event.x * CanMapSens, 0]);
                        }

                        // rotate elements : countries, lines and borders
                        CanMapSvg.selectAll(".country").attr("d", CanGraphMapPath );
                        g_poly.selectAll(".poly").attr("d", CanGraphMapPath);
                        g_lines.selectAll(".line").attr("d", CanGraphMapPath);
                    })
            )

        ;*/

        // the background
        if ( CanMapConf.chart.show_background == true )
        {
            var Sphere = CanMapSvg.append("use")
                .attr("class", "stroke")
                .attr("xlink:href", "#sphere")
                .attr('fill','#ffffff')
                .style('fill','ffffff')
            ;

            var fillSphere = CanMapSvg.append("use")
                .attr("class", "fill")
                .attr("xlink:href", "#sphere")
                .style('fill', CanMapConf.chart.background )
            ;
        }

        if ( CanMapConf.chart.projection == 'globe' )
        {
            // Sphere.attr("transform", "translate(0,"+CanMapConf.chart.globe_translate.y+")") ; 
            // fillSphere.attr("transform", "translate(0,"+CanMapConf.chart.globe_translate.y+")") ; 
        }
        

        // if ( CanMapConf.chart.graticule )
            CanMapSvg.append("path")
                .datum(graticule)
                .attr("class", "graticule")
                .attr("d", CanGraphMapPath)
                .style('fill', CanMapConf.chart.background )
            ;

        if ( CanMapConf.chart.projection == 'globe' )
        {
            CanMapGroup = CanMapSvg.append("g")
                .attr("id","mapGroup")
                .attr('class','mapGroup')
                // .attr("transform", "translate(0,"+CanMapConf.chart.globe_translate.y+")")
            ;
        }
        else
        {
            CanMapGroup = CanMapSvg.append("g")
                .attr("id","mapGroup")
                .attr('class','mapGroup')
                .attr("transform", "translate("+CanMapConf.chart.globe_translate.x+","+CanMapConf.chart.globe_translate.y+")")
            ;
        }
        
        CanMapTooltip = d3.select(CanMapConf.container)            
          .append('div')                             
          .attr('class', 'canTooltip');                 
        CanMapTooltipLabel = CanMapTooltip.append('div')                        
          .attr('class', 'label')
          .append('p')
          .attr('class','desc')
        ;       


        /* CanGraphRadiusBubble = d3.scale.sqrt()
            .domain([ 0, 2000 ])
            .range([ 0, 15 ]);*/
        
        /*CanGraphMapZoom = d3.behavior.zoom()
            .on("zoom",function() {
                CanMapGroup.attr("transform","translate("+d3.event.translate.join(",")+")scale("+d3.event.scale+")")
            });
        CanMapSvg.call(CanGraphMapZoom)*/

        // hidden select box to change projection dynamically
        /*var menu = d3.select("#projection-menu")
            .on("change", changeSelectionProjection );
        menu.selectAll("option")
            .data(options)
            .enter().append("option")
            .text(function(d) { return d.name; });*/


        this.preLoadMapData(); 
    }, 

    /**
    * Prepare data for geometries + countries csv for "relationnal" mapping (iso,country code, globocan id ... )
    * @params no param
    * @return object
    */ 
    preLoadMapData : function() {

        let url_world_geojson = (  CanMapConf.chart.hd == false ) ? "/data/world-general.topojson" : "/data/world-who-out.geojson" ; 

        // queue function loads all external data files asynchronously 
        queue()     
            // .defer(d3.json, "data/world-general.topojson" ) // our geometries
            .defer(d3.json, url_world_geojson )
            .defer(d3.csv, "data/countries.csv")  // our data specific
            .await(function( error , geometries , countries ){ 

                CanGraphGeometries = geometries ; 
                CanGraphCountries = countries ;
                // call the "filtering" data function 

                jsonUrl = CanMapConf.data.url ;
                loadMapFilterData( jsonUrl , ( CanMapConf.chart.colors == undefined ) ? CanMapConf.chart.default_color : CanMapConf.chart.colors , processData ) ; 
                return { 'geometries' : geometries , 'countries' : countries } ; 

                // prepare url to call
                /*if ( CanMapConf.data.url != null )
                {                    
                    jsonUrl = CanMapConf.data.url ;
                    // save cancers array 
                    var g_cancers = [29] ; 
                    var g_population = 5 ; 
                    var query_string = 'population=' + g_population + '&cancers=' + g_cancers.join(',') + '&type=0&prevalence=0&sex=0&statistic=2&show_percent=0&sort=number&continents=0&bar=1&color=Blues'; 
                  
                    // rewrite query strings
                    // canRewriteUrl(query_string) ; 

                    // build the final url to call
                    jsonUrl += '?' + query_string + CanMapConf.data.query_string ; 

                    loadMapFilterData( jsonUrl , ( CanMapConf.chart.colors == undefined ) ? "Blues" : CanMapConf.chart.colors , processData ) ; 

                    return { 'geometries' : geometries , 'countries' : countries } ; 
                }*/

            });   // once all files are loaded, call the processData function
    } , 

    reload : function( dataset , settings ){


        CanGraphCurrentKey  = ( settings.key != undefined) ? settings.key : CanMapConf.chart.key_data_value ; 
        CanMapCurrentType   = settings.type ; 

        CanMapConf.chart.color_scale = settings.color_scale ;

        setMapColor( settings.color );

        processUpdateData({ 'title' : '' , 'data' : dataset }) ; 

    } , 


    /**
    * Trigger when window is resized
    * @params no param
    * @return no return 
    */ 
    resize : function(){
        return true ; 
    }, 

    changeTitle : function( new_title ){
        
        //$( CanMapConf.container+ ' #chart-title').text( new_title );

        if ( typeof(new_title) == 'object' )
        {
          txt.append('tspan').attr('x', sunBurstConf.width  / 2).attr('y',30).text(new_title[0]); 
          txt.append('tspan').attr('x', sunBurstConf.width / 2).attr('y',45).text(new_title[1]); 
          if (new_title[2] != undefined) 
            txt.append('tspan').attr('x', sunBurstConf.width / 2).attr('y',60).text(new_title[2]); 
        }
        else
        {
          txt.text( new_title ) ; 
        }
    }
    
};



/**
* Zoom on a country (alias of zoom country)
* @params (string) country code
* @return (bool) return true 
*/ 
function zoomRegion( codeCountry , translateObj , scale ){
    
    var focusedCountry = checkCountry( CanGraphMapFeatures , codeCountry );

    if ( focusedCountry == undefined )
    {
        var x = 0 ;
        var y = 0 ; 
        var k = 1 ;
        var stroke_width = 1 ; 

        if ( translateObj == undefined )
            var translate = "translate(0,0)" ; 
        else
             var translate = "translate("+(translateObj.x)+","+(translateObj.y)+")" ; 
    }
    else
    {
        var centroid = CanGraphMapPath.centroid( focusedCountry ) ;
        var x = centroid[0] ;
        var y = centroid[1] ;
        var k = ( scale == undefined) ? 1.5 : scale ;
        var stroke_width = 1.5 / k ; 
        var centered = focusedCountry ;
        var translate = "translate(" + CanMapWidth / 2 + "," + CanMapHeight / 2 + ")" ; 
    }
    
    /* g_lines.transition()
      .duration(750)
      .attr("transform", translate + "scale(" + k + ")translate(" + -x + "," + -y + ")") ; 
    
    g_poly.transition()
      .duration(750)
      .attr("transform", translate + "scale(" + k + ")translate(" + -x + "," + -y + ")") ; 

    CanMapGroup.transition()
      .duration(750)
      .attr("transform", translate + "scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", stroke_width + "px")
    ; */

    g_lines.transition()
      .duration(750)
      .attr("transform", translate + "scale(" + k + ")translate(" + -x + "," + -y + ")") ; 
    
    g_poly.transition()
      .duration(750)
      .attr("transform", translate + "scale(" + k + ")translate(" + -x + "," + -y + ")") ; 

    CanMapGroup.transition()
      .duration(750)
      .attr("transform", translate + "scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", stroke_width + "px")
    ;

    if ( CanCircleGroup != undefined && CanCircleGroup != null)
        CanCircleGroup.transition()
            .duration(750)
            .attr("transform", translate + "scale(" + k + ")translate(" + -x + "," + -y + ")")


    // 
    var bubbles_legend = d3.selectAll('#bubbles-legend') ; 

    if ( bubbles_legend[0] != 0 )
        bubbles_legend
            // .duration(750)
            .attr("transform", translate + "scale(" + k + ")translate(" + -x + "," + -y + ")") ; 
}

/**
* Zoom out the bubble to make transition with a new set of data
* @params (string) country code
* @return (bool) return true 
*/ 
function unselectBubbleMap(){
   d3.selectAll('.bubble')
        .transition()
        .duration(750)
        .attr('r', 0 ) ; 
}

/**
* 
* @params 
* @return 
*/ 
function changeMapFilters( p , new_title , foceReBuildBubble ) // cancers,population,sex,type,prevalence,statistic)
{    
    // console.log(p) ; 

    // prepare url to call
    jsonUrl = CanMapConf.data.url ; 
  
    // save cancers array 
    var g_cancers = p.cancers ; 
    var g_sort = 'number' ; 
    var query_string = '' ; 

    if ( p.population == 0 ) g_sort = 'label' ; 
    // build query strings
    query_string = 'population=' + p.population + '&cancers=' + g_cancers.join(',') + '&type='+p.type+'&prevalence='+p.prevalence+'&sex=' + p.sex + '&statistic=' + p.statistic+'&show_percent=0&sort='+g_sort+'&continents='+p.continents+'&bar=1&color='+p.color ; 
  
    // rewrite query strings
    // canRewriteUrl(query_string) ; 

    // build the final url to call
    jsonUrl += '?' + query_string + CanMapConf.data.query_string ; 
    
    // keep global vers
    CanGraphCurrentKey= ( p.key == undefined) ? CanMapConf.chart.key_data_value : p.key  ; 
    CanMapCurrentType = p.type ; 

    CanGraphCurrentKey = CanMapConf.chart.key_data_value ; 

    setMapColor( p.color );

    // CanGraphMapColorQuantile = d3.scale.quantile().range(colorbrewer[p.color][CanMapGraphNbColors]);
    if ( CanMapConf.data.src.length > 0 )
    {
        processUpdateData({ 'title' : new_title , 'data' : CanMapConf.data.src }) ; 
    }
    else
    {
        d3.json( jsonUrl , processUpdateData )
    } 
}


function setMapColor( key_color )
{
    CanGraphMapColor = null ; 
    // update color domaine
    // CanGraphMapColor.domain( d3.extent(d3.values(this.current_dataset.data), function(d) { return d[CanGraphCurrentKey] ; }) );
    // var domain_values   = computeValuesForDomain( this.current_dataset.data ) ; 

    var domain_values = [] ; 
    var unique_values = [] ;  

    for ( var item in CanMapConf.data.src ) 
    {
        if ( CanMapConf.data.src[ item ].no_data == true ) continue ; 
        var value = CanMapConf.data.src[ item ][ CanGraphCurrentKey ] ; 
        domain_values.push( value ) ;

        if ( $.inArray( value , unique_values ) == -1 ) unique_values.push( value ) ; 
    }

    //domain_values = domain_values.sort(function(a, b) { return b - a; });
    var range_colors = [] ; 
    
    CanMapGraphNbColors ; 

    // console.info( unique_values ) ; 
    if ( !colorbrewer[ key_color ] )
    {
        range_colors = key_color ; 
        range_colors.reverse() ; 
    }
    else
    {
        // if ( unique_values.length < CanMapGraphNbColors ) CanMapGraphNbColors = 3 ; 

        range_colors  = Array.prototype.slice.call(  colorbrewer[ key_color ][ CanMapGraphNbColors + 1 ] ) ;
        range_colors.shift();
    }
    
    // console.info( CanMapGraphNbColors , range_colors ) ; 
    CanMapColorSet  = range_colors ; 

    if ( range_colors == undefined ) return false ; 

    var range_radius = CanMapConf.chart.range_radius ; 
    // console.info( " in CanMapGraph " , d3.max( domain_values) , d3.max( unique_values ) ) ; 
    CanGraphMaxValue = d3.max( domain_values) ; 

    var domain_ranges = [ d3.min( domain_values) , d3.max( domain_values) ]  ; 
    CanMapUniqueValues = unique_values ; 

    /// update color palette
    switch( CanMapConf.chart.color_scale )
    {
        case 'quantize' : 
            CanGraphMapColor        = d3.scale.quantize().domain( domain_ranges ).range( range_colors );
            CanGraphRadiusBubble    = d3.scale.sqrt().domain( domain_ranges ).range( range_radius );
            break ; 

        case 'quantile' : 
            // console.info( d3.min( domain_values) , d3.max( domain_values) ) ;
            CanGraphMapColor        = d3.scale.quantile().domain( domain_values ).range( range_colors );
            CanGraphRadiusBubble    = d3.scale.sqrt().domain( domain_values ).range( range_radius );
            break ; 
 
    }
}

/**
* Change the color of legend with the selectbox colobrewer list
* @param (string) key of colorbrewer
* @return (bool)
*/
function changeColorLegend( key_color )
{   

    setMapColor( key_color ) ; 
    
    CanGraphMapFeatures.transition()  //select all the countries and prepare for a transition to new values
        .duration(750)  // give it a smooth time period for the transition
        .attr('fill', function(d) { 

            if ( CanGraphMapColor == undefined ) return ; 

            if ( d.properties.values.not_applicable == true || d.id == 'ESH' || d.properties.country == 'Abyei' || d.properties.country == Jammu ){
                return Default.color_not_applicable ; 
            }

            if ( d.properties.values.no_data == true)
                return Default.color_no_data ; 
            
            return CanGraphMapColor( d.properties.values[ CanGraphCurrentKey ] == undefined ? d.properties.values.value : d.properties.values[ CanGraphCurrentKey]  ) ; 
        });

    manageLegends();

    return true ; 
}

/**
* Change numbers or colors scale selectbox colobrewer list
* @param (int) number of different colors (see the max per colorbrewer)
* @param (string) key of colorbrewer
* @return (bool)
*/
function changeNbScaleColors( nb_colors , key_color ){
    CanMapGraphNbColors = nb_colors ; 
    changeColorLegend( key_color ); 
    manageLegends();

    return true ; 
}


function loadMapFilterData( url_json, color, functionCallBack ){

    CanGraphCurrentKey = CanMapConf.chart.key_data_value ; 

    setMapColor( color );

    // if we load a data array, then forget d3.json call
    if ( CanMapConf.data.src.length > 0 )
    {
        processData({ 'title' : CanMapConf.title , 'data' : CanMapConf.data.src }) ; 
    }
    else
    {
        d3.json( url_json , processData ) ; 
    }   
}

function manageMapTitle( new_title ){

    d3.select( CanMapConf.container+" svg #chart-title").remove();

    var txtContainer = d3.select( CanMapConf.container+' svg' )
        .append('rect')
        .attr('class','container-title')
        .attr('x',0)
        .attr('y', 0 )
        .attr('width', $(CanMapConf.container+" svg").width() )
        .attr('height' , 70 )
        .style('fill','#ffffff') ; 

    var txt = d3.select( CanMapConf.container+' svg' )
        .append('text')
        .attr('x', $(CanMapConf.container+" svg").width() / 2 )
        .attr('y', 30 )
        .attr('width', $(CanMapConf.container+" svg").width() )
        .attr('height' , 50 )
        .attr('id', 'chart-title')
        .attr('class', 'chart-title')
        .attr("text-anchor",'middle')
        .style('font-size', Default.title_font_size+'px')
        .attr('font-family', CanMapConf.chart.fontFamily ) ; 

    
    
    if ( typeof(new_title) == 'object' )
    {
      txt.append('tspan').attr('x',$(CanMapConf.container+" svg").width() / 2).attr('y',30).text( new_title[0] ); 
      txt.append('tspan').attr('x',$(CanMapConf.container+" svg").width() / 2).attr('y',45).text( new_title[1] ); 
      if (new_title[2] != undefined) 
        txt.append('tspan').attr('x',$(CanMapConf.container+" svg").width() / 2).attr('y',60).text(new_title[2]);
    }
    else
    {
      txt.text( ( new_title != undefined) ? new_title : CanMapConf.title ) ; 
    }
}

var timers = [] , timer ;

function spinGlobe(){

    timer = Date.now() ; 
    d3.timer( onEnterSpinGlobe );
}

function onEnterSpinGlobe() {

    var dt = Date.now() - timer ;

    CanMapCurrentRotation =  [ CanMapRotate[0] + CanMapVelocity[0] * dt, CanMapRotate[1] + CanMapVelocity[1] * dt]  ;
    CanMapGraphProjection.rotate( CanMapCurrentRotation ) ;

    // console.info( "Live", CanMapCurrentRotation );
    // CanMapGraphProjection.rotate([CanMapRotate[0] + CanMapVelocity[0] * dt, 0 ]);
    
    CanMapSvg.selectAll('.country').attr("d", CanGraphMapPath );
    g_poly.selectAll(".poly").attr("d", CanGraphMapPath);
    g_lines.selectAll(".line").attr("d", CanGraphMapPath);
    
    return isTurning ;
}

function pauseSpinGlobe(){
    isTurning = true ; 
    // console.info("Pause" , CanMapCurrentRotation);
    return true ; 
}

function restartSpingGlobe(){
    isTurning = false ;
    spinGlobe();
    //console.info("Restart" , CanMapCurrentRotation); 
    CanMapRotate = CanMapCurrentRotation ; 
    return true; 
}

function flushTimers() {
  timers.forEach(function(item) { console.log( item ) ; });
  timers = [];
  return true ; 
}

/**
* Grab all values from Geometries geojson + countries data + new dataset 
* @param (array) data geometries from geojson
* @param (array) data countries with all key (code, id, globocanid ... )
* @param (array) new dataset from user search
* @return (array)
*/
function grabValues( CanGraphGeometries,CanGraphCountries,predictions ){
    
    // if ( CanGraphCountries == undefined ) return ; 

    // console.info( CanGraphGeometries.objects['general'].geometries , predictions.data ) ;

    // first init to 0
    for (var index = 0; index < CanGraphCountries.length; index++ ) {

        for( var geo in CanGraphGeometries.objects['general'].geometries )
        {
            if ( CanGraphGeometries.objects['general'].geometries[geo].id == CanGraphCountries[index].ISO_3_CODE )
            {
                CanGraphGeometries.objects['general'].geometries[geo].properties = CanGraphCountries[index] ;
                CanGraphGeometries.objects['general'].geometries[geo].properties.values = { 
                    'value' : 0 , 
                    'real_value' : 0 , 
                    'crude_rate' : 0 , 
                    'proportion' : 0 , 
                    'asr' : 0 , 
                    'cum_risk' : 0 ,
                    'cum0_74' : 0 ,
                    'no_data' : true 
                } ;

                for( var j in predictions.data ){

                    if ( predictions.data[j].COUNTRY == CanGraphCountries[index].globocan_id 
                        ||  predictions.data[j].globocan_id == Math.abs(CanGraphCountries[index].globocan_id )
                        ||  predictions.data[j].ISO_2_CODE == CanGraphCountries[index].ISO_2_CODE
                    ) {

                        CanGraphGeometries.objects['general'].geometries[geo].properties.country_data = predictions.data[j].country_data ; 

                        var idCode = CanGraphGeometries.objects['general'].geometries[geo].properties.ISO_3_CODE ; 

                        // console.info( predictions.data[j][CanMapConf.chart.key_data_value] , predictions.data[j] , CanMapConf.chart.key_data_value ) ; 
                        // console.info( predictions.data[j].value , predictions.data[j][CanMapConf.chart.key_data_value] ) ;
                        CanGraphGeometries.objects['general'].geometries[geo].properties.values = { 
                            'value' : ( predictions.data[j].value == undefined) ? predictions.data[j][CanMapConf.chart.key_data_value] : predictions.data[j].value , 
                            'real_value' : predictions.data[j].real_value , 
                            'color' : predictions.data[j].color , 
                            'crude_rate' : predictions.data[j].crude_rate , 
                            'proportion' : predictions.data[j].proportion , 
                            'cases' : predictions.data[j].cases , 
                            'asr' : (predictions.data[j].asr) ? predictions.data[j].asr : 0 , 
                            'cum_risk' : predictions.data[j].cum_risk, 
                            'cum0_74' : ( predictions.data[j].cum0_74 != undefined) ? predictions.data[j].cum0_74 : null , 
                            'country_data' : ( predictions.data[j].country_data != undefined ) ? predictions.data[j].country_data : predictions.data[j] ,
                            'no_data' : ( predictions.data[j].no_data == undefined) ? false : predictions.data[j].no_data , 
                            'color' : ( predictions.data[j].color == undefined) ? undefined : predictions.data[j].color , 
                            'not_applicable' : ( predictions.data[j].not_applicable == undefined ) ? false : predictions.data[j].not_applicable
                        } ;

                        //if ( CanGraphGeometries.objects['general'].geometries[index].properties.values == undefined ) continue ; 
                        //if ( CanGraphGeometries.objects['general'].geometries[index].properties.values.country_data == undefined ) continue ;    
                        // var b = CanGraphGeometries.objects['general'].geometries[index].properties.values.country_data.LABEL ; 
                        // console.info("b",b)
                        /* if ( predictions.data[j].label == 'Nigeria') 
                            console.info( 
                                CanGraphCountries[index] , 
                                CanGraphGeometries.objects['general'].geometries[index].properties.values , 
                                predictions.data[j].country_data 
                            );*/
                        
                        // continue ; 
                        break ; 
                    
                    } // end predictions 

                } // end for
            } // match 
        } // end for - loop géometries
    } // end for - loop countries

    // console.log( CanGraphGeometries.objects['general'].geometries ) ; 

    return CanGraphGeometries ; 
}


/**
* First run processing data 
* @param (array) data from "search" results
* @return (array)
*/ 
function processData( predictions ) {

    this.current_dataset = predictions ;
    // link data to geometries
    grabValues(CanGraphGeometries,CanGraphCountries,predictions) ;
    
    // draw path
    drawMap(CanGraphGeometries);  // let's draw new data set
    // update legends
    if ( CanMapConf.chart.mode == 'heat') manageLegends(); 
    // manage title of map
    if ( CanMapConf.title != false)  manageMapTitle(predictions.title) ; 
    // auto spin globle
    // spinGlobe();

    return CanGraphGeometries ; 
}

/**
* X run processing data after path all exist
* @param (array) data from "search" results
* @return (array)
*/
var t ; 

function processUpdateData( predictions ) {

    this.current_dataset = predictions ;

    // attach new values 
    grabValues(CanGraphGeometries,CanGraphCountries,predictions) ;

    t = textures.lines().thicker();

    CanMapSvg.call(t);

    // console.info( CanGraphGeometries ) ; 
    if ( CanMapConf.chart.mode == 'heat' )
    {
        // select all path geometries
        // CanGraphMapFeatures = d3.selectAll('.country').data( topojson.object(CanGraphGeometries, CanGraphGeometries.objects['general']).geometries ) ; 

        // transition color for feach path 
        CanGraphMapFeatures.transition()  //select all the countries and prepare for a transition to new values
            .duration(750)  // give it a smooth time period for the transition
            .attr("class", function(d){ 

                var class_no_data = '' ; 

                if ( d.properties.values.no_data == true ) class_no_data = 'no_data' ; 

                return "country type"+CanMapCurrentType +' '+class_no_data ; 
            })
            .attr('fill',  t.url() ) 
            /*.attr('fill', function(d) {
                
                if ( CanMapConf.chart.mode == 'heat')
                {   

                    if ( d.properties.values.not_applicable == true || d.id == 'ESH' || d.country == 'Abyei' || d.country == Jammu )
                    {
                        return Default.color_not_applicable ; 
                    }

                    if ( d.properties.values.no_data == true)
                    {
                        return Default.color_no_data ; 
                    }

                    if ( d.properties.values.color != undefined ) // force attribute color which overide the color scale
                    {
                        return d.properties.values.color ; 
                    }

                    if ( d.properties.values == undefined )
                    { 
                        return CanGraphMapColor(0); 
                    }
                    else if ( d.properties.values[CanGraphCurrentKey] != undefined )
                    {
                        return CanGraphMapColor( d.properties.values[CanGraphCurrentKey] ) ; 
                    }
                    else if ( d.properties.values.value != undefined )
                    {
                        return CanGraphMapColor( d.properties.values.value ) ; 
                    }
                    else if ( d[CanGraphCurrentKey] != undefined )
                    {
                        return CanGraphMapColor( d[CanGraphCurrentKey] ) ; 
                    }
                    else
                    { 
                        return CanGraphMapColor( d.properties.values[CanGraphCurrentKey] ) ; 
                    }
                }
                else if ( CanMapConf.chart.mode == 'bubble')
                {
                    return Default.color_no_data ; 
                }
            })*/; 
    }
    else if ( CanMapConf.chart.mode == 'bubble')
    {   
        // select all bubbles
        var GraphBubbles = d3.selectAll('.bubble').data( topojson.feature( CanGraphGeometries, CanGraphGeometries.objects['general'] ).features ) ; 

        var colorset = CanGraphMapColor.range() ;

        GraphBubbles.transition()
            .duration(750)
            .attr("r", function(d){ 
                var radius = CanGraphRadiusBubble( d.properties.values[ CanMapConf.chart.key_data_value ] ) ; 
                console.info( radius , d.properties.values[ CanMapConf.chart.key_data_value ] ) ; 
                radius = 5 ; 
                return radius ; 

            }) 
            .style('fill', colorset[ colorset.length - 1] )
        ; 
    }



    // update legends
    if ( CanMapConf.chart.mode == 'heat') manageLegends(); 
    
    // update title
    if ( CanMapConf.title != false) manageMapTitle(predictions.title) ;

    return CanGraphGeometries ; 
}

var t1,t2,t3 ; 

/**
* Draw the map from geometries geojson 
* @param (array) list of geometries
* @return (object)
*/ 
function drawMap( world ) {
    
    

    CanGraphMapFeatures = CanMapGroup.selectAll(".country")   // select country objects (which don't exist yet)
        .data( topojson.object( world, world.objects['general']).geometries ) ; // bind data to these non-existent objects
    
    // console.info( topojson.object( world, world.objects['general']).geometries , CanGraphMapFeatures ) ; 

    /*t1 = textures.lines().orientation("3/8", "7/8").stroke("blue"); 
    
    /*t2 = textures.lines()
        .orientation("vertical", "horizontal")
        .size(4)
        .strokeWidth(1)
        .shapeRendering("crispEdges")
        .stroke("darkorange"); 
    
    t3 = textures.lines()
        .size(8)
        .strokeWidth(2)
        .stroke("#5d0578"); 

    CanMapSvg.call(t1) ; 
    CanMapSvg.call(t2) ; 
    CanMapSvg.call(t3) ; */

    CanGraphMapFeatures.enter().append("path") // prepare data to be appended to paths
        .attr("class", function(d){ 
            return "country type"+CanMapCurrentType ; 
        }) // give them a class for styling and access later
        // .attr('fill' , t1.url() )
        //.attr("fill","pink")
        .attr("fill", function(d) { 

            if ( d.properties.values == undefined ) 
            {
                // console.error( 'Please check geometry of this country ' , d.properties ) ; 
                return ; 
            }

            if ( CanMapConf.chart.mode == 'heat')
            {                
                if ( d.properties.values.not_applicable == true || d.id == 'ESH' || d.properties.country == 'Abyei' || d.properties.country == Jammu ){
                    return Default.color_not_applicable ; 
                }

                if ( d.properties.values.no_data == true)
                    return Default.color_no_data ; 

                if ( CanMapConf.chart.fill_color != undefined ) 
                    return CanMapConf.chart.fill_color ; 

                if (d.properties.values == undefined)  
                    return CanGraphMapColor(0); 
            
                if ( d.properties.values.color != undefined ) 
                    return d.properties.values.color ; 

                if ( d.properties.values.value != undefined ){
                    return CanGraphMapColor( d.properties.values.value )
                }
            }
            else if ( CanMapConf.chart.mode == 'bubble')
            {
                return Default.color_no_data ; 
            }

        })
        .attr('stroke', '#f0f0f0' )
        .attr('stroke-width',0.4)
        .attr("id", function(d) { return "code_" + d.id ; }, true) // give each a unique id (check with graph global conf)
        .attr("d", CanGraphMapPath) // create them using the svg path generator defined above
        // ng click
        /*.attr('ng-click', function(d) {
            return "clickPathMap('" + d + "')";
        })*/
        /*.on("mouseover", function(d){
            if ( d.properties.values.no_data != undefined && d.properties.values.no_data == true ) 
            {
                // document.body.style.cursor = 'wait';
                return ; 
            }
        })
        .on("mousemove", function(d){

            if ( d.properties.values.no_data != undefined && d.properties.values.no_data == true ) 
            {
                // document.body.style.cursor = 'wait';
                return ; 
            }

            if ( CanMapConf.chart.mode == 'heat') // if bubble, 
            {
                //if ( d.properties.country_data == undefined ) return  ;
                var country_code = d.properties.ISO_2_CODE ;
                var top_cancers = '' ; 
                var key_val = '' ; 
                
                if ( country_code == undefined || country_code == "GRL" || country_code == "EH" ) return ;

                // key + value
                if ( d.properties.values.value != undefined && CanMapConf.tooltip != false  )
                {
                    // var value = Math.round( d.properties.values.value * CanMapConf.tooltip.dividor ) / CanMapConf.tooltip.dividor  ; 
                    //value.toFixed(CanMapConf.tooltip.decimal);
                    // console.info( CanGraphCurrentKey , d.properties.values ) ; 
                    if ( d.properties.values[ CanGraphCurrentKey ] == undefined )
                        var value =  window[CanMapConf.chart.hook_value](d.properties.values.value) ; 
                    else
                        var value =  window[CanMapConf.chart.hook_value](d.properties.values[ CanGraphCurrentKey ]) ; 

                    if ( CanMapConf.chart.key_label_value == null )
                        key_val = '<p>'+(CanGraphCurrentKey).toUpperCase()+' : '+value+CanMapConf.chart.key_suffix_value+'</p>' ; 
                    else
                        key_val = '<p>'+CanMapConf.chart.key_label_value+' : '+value+CanMapConf.chart.key_suffix_value+'</p>' ; 

                    if ( value == 0 ) 
                    {
                        return ;
                    } 
                }
                
                // addditionnal data
                if ( d.properties.country_data != undefined && d.properties.country_data.stats != undefined )
                {
                    // list of ul cancers
                    top_cancers = '<h4>Most frequent cancers : </h4><ol>' ; 

                    // most frequent cancers
                    for( var item in d.properties.country_data.stats.max_cancers )
                        top_cancers += '<li>'+d.properties.country_data.stats.max_cancers[item].cancer+' ('+d.properties.country_data.stats.max_cancers[item].total+')</li>' ;
                    top_cancers += '</ol>' ;
                }
                
                if ( country_code == undefined || country_code == "GRL" || value == "ESH" ) return ;

                if ( country_code == 'EH' || country_code == 'PS') 
                    var country_flag = '' ; 
                else
                    var country_flag =  '<span class="f16"><span class="flag '+country_code.toLowerCase()+'"></span></span>' ; 

                country_flag = '' ; 

                CanMapTooltip.select('.label').html( country_flag + d.properties.country + key_val + top_cancers );
                CanMapTooltip.style('display', 'block');

                // var posY = ( d3.event == undefined && d3.event.offsetY == undefined ) ? d3.event.layerY : d3.event.offsetY ; 
                // var posX = ( d3.event == undefined && d3.event.offsetX == undefined ) ? d3.event.layerX : d3.event.offsetX ; 

                var mouse = d3.mouse( CanMapSvg.node()).map(function(d) {
                    return parseInt(d);
                });

                CanMapTooltip
                    .style('top', (mouse[1] - 60 ) + 'px')
                    .style('left', (mouse[0] - 80 ) + 'px');

                d3.select(this)
                    .style( 'fill-opacity', 0.8 ) ; 
            }

            if ( CanMapConf.chart.callback_mousehover != undefined ) 
                window[CanMapConf.chart.callback_mousehover](d,this) ;
        })
        // mouseout function            
        .on("mouseout", function(d){

            document.body.style.cursor = 'auto';

            CanMapTooltip.style('display','none');
            d3.select(this).style('fill-opacity',1) ; 

            if ( CanMapConf.chart.callback_mouseout != undefined ) 
                window[CanMapConf.chart.callback_mouseout](d,this) ;
        })  */   

        .call(

            d3.behavior.drag()
                .origin(function() { 
                    var r = CanMapGraphProjection.rotate(); 
                    CanMapTooltip.style('display','none');
                    return {x: r[0] / CanMapSens, y: -r[1] / CanMapSens}; 
                })
                .on("drag", function() {

                    if ( CanMapConf.chart.projection != 'globe' ) return ; 
                    
                    var rotate = CanMapGraphProjection.rotate() ;
                    
                    if ( CanMapConf.chart.projection == 'globe' )
                    {
                        // if globe, we can rotate according to mouse movements
                        var rotation = [d3.event.x * CanMapSens, -d3.event.y * CanMapSens, rotate[2]]
                        CanMapGraphProjection.rotate(rotation);
                        CanMapRotate = rotation ; 
                    }
                    else
                    {
                        // only drag onx for classic map
                        CanMapGraphProjection.rotate([d3.event.x * CanMapSens, 0]);

                        // g_lines.attr("transform", "translate(" + (d3.event.x * CanMapSens) + ",0)") ; 
                        // g_poly.attr("transform", "translate(" + (d3.event.x * CanMapSens) + ",0)") ; 
                    }

                    // rotate elements : countries, lines and borders
                    CanMapSvg.selectAll(".country").attr("d", CanGraphMapPath );
                    g_poly.selectAll(".poly").attr("d", CanGraphMapPath);
                    g_lines.selectAll(".line").attr("d", CanGraphMapPath);
                    // CanMapSvg.selectAll(".focused").classed("focused", focused = false);
                })
        )
        // click function
        .on("click", function(d){

            CanMapVelocity = [0,0] ;

            var country_code = d.properties.ISO_3_CODE; 

            if ( d.properties.values.no_data == true ) return ; 

            if ( country_code == undefined || country_code == "GRL" || country_code == "ESH" ) return ;

            if ( d.properties.values[ CanMapConf.chart.key_data_value] == 0 ) return 

            // return ; 
            jumpToCountryGlobe( d.properties.ISO_3_CODE );
            // console.log( d ) ;
            // execute callback

            if ( CanMapConf.chart.callback_click != undefined ) window[CanMapConf.chart.callback_click](d,this) ; 

        })
        // sub title 
        .append("svg:title")
        .text( t => t.properties.country + ' / ' + t.properties.ISO_3_CODE )
        //.text(function(d) { return d.properties.country + ' , ASR=' +d.properties.values.asr+', VALUE '+d.properties.values.value ; })         
    ;

    
    if ( CanMapConf.chart.projection != 'globe' ) 
    {
        
        // draw layer 2 & 3 borders + lines for very small countries
        g_lines = CanMapSvg.append("g")
            .attr("id","mapLines")
            .attr('class','line') 
            .attr("transform", "translate("+CanMapConf.chart.globe_translate.x+","+CanMapConf.chart.globe_translate.y+")")
        ;
        // polygone for lakes mostly
        g_poly = CanMapSvg.append("g")
            .attr("id","mapLakes")
            .attr('class','poly') 
            .attr("d", CanGraphMapPath)
            .attr("transform", "translate("+CanMapConf.chart.globe_translate.x+","+CanMapConf.chart.globe_translate.y+")")
        ;
        
    }
    else
    {   
        // draw layer 2 & 3 borders + lines for very small countries
        g_lines = CanMapSvg.append("g").attr('class','line').attr("d", CanGraphMapPath) ;
        g_poly = CanMapSvg.append("g").attr('class','poly').attr("d", CanGraphMapPath) ;
    }



    
    g_lines.selectAll("path")
        .data( topojson.object( CanGraphGeometries , CanGraphGeometries.objects.maskline_general ).geometries )
        .enter()
        .append("path")
        .attr("d", CanGraphMapPath )
        .attr('class',function(d){ return 'line line-'+d.properties.ID+' '+d.properties.class;})
        // fill : none ; stroke : #92919D ;        stroke-width: #92919D ;
        .style('fill','none')
        .style('stroke','#000000')
        .style('stroke-width','0.5px')
        .append("title").text(function(d){ return d.properties.COUNTRY ; })

    g_lines.selectAll('.line-1,.line-4,.line-5,.line-7,.line-8')
        .style('fill','none')
        .style('stroke','#ffffff')
        .style('stroke-dasharray', Default.dash_array_border  +','+Default.dash_array_border )  
        .style('stroke-width', Default.dash_border ) ; 


    g_poly.selectAll("path")
        .data( topojson.object( CanGraphGeometries , CanGraphGeometries.objects.maskpoly_general ).geometries )
        .enter()
        .append("path")
        .attr("d", CanGraphMapPath )
        .attr('class', function(d){ 
            return 'poly' ;
        })
        .style('fill',function(d){
            if ( d.properties.AREA == Jammu )
                return Default.color_not_applicable ; 
            else
                return CanMapConf.chart.background_globe ; 
        })
        .style('stroke','transparent')  
        .style('stroke-dasharray',function(d){
            if ( d.properties.AREA == Jammu )
                return 1 ; 
            else
                return 0 ; 
        })  
        .style('stroke-width', Default.dash_border )
        .append("title").text(function(d){ return d.properties.AREA ; }) ; 


    d3.select('g.poly path:last-child').style('fill','rgb(125, 125, 125)');
   
    var colorset = CanGraphMapColor.range() ;

    // console.info(world.objects['general']) ; 
    // console.info( topojson.object( world, world.objects['general']).features ) ; 

    CanCircleGroup = CanMapSvg.append("g")
        .attr('class','circleGroup')
        .attr("transform", "translate("+CanMapConf.chart.globe_translate.x+","+CanMapConf.chart.globe_translate.y+")")
    ;

    CanMapBubblesData = topojson.object( world, world.objects['general']).geometries ; 
    // reordering to build biggest bubbles before
    for ( var it in CanMapBubblesData ) CanMapBubblesData[it].value = CanMapBubblesData[it].properties.values[ CanMapConf.chart.key_data_value ] ; 
    // sortByKey( CanMapBubblesData , 'value') ; 
    
    // console.info("CanMapBubblesData",CanMapBubblesData) ; 
    
    let group_cirlces = CanCircleGroup.append("g")
        .selectAll("g")
        .data( CanMapBubblesData ) ; 

    if ( document.location.hash == '#bars'){

        let scale_bar = d3.scale.linear().domain([0,d3.max(CanMapBubblesData,d=>d.value)]).range([0,100])

        group_cirlces
            .enter().append("rect")
            .attr("class","rect")
            .style('fill', 'pink' )
            .style('fill-opacity', 0.9)
            .style('stroke','#292929')
            .style('stroke-width','.5px')
            .attr("transform", function(d) { return "translate(" + CanGraphMapPath.centroid(d) + ")"; })
            .attr("width",5)
            .attr('y',(d)=>{ return -scale_bar(d.value) })
            .attr("height",(d)=>{ return scale_bar(d.value) })
    }
    else
    {
        if ( show_circle == true ){
            group_cirlces
                .enter().append("circle")
                .attr("class","bubble")
                .style('fill', '#cccccc' )
                .style('fill-opacity', 0.7)
                .style('stroke','#ffffff')
                .style('stroke-width','.5px')
                .attr("transform", function(d) { return "translate(" + CanGraphMapPath.centroid(d) + ")"; })
                .attr("r",(r)=>{
                    let radius = (r.value == 0 ) ? 0 : 8 ; 
                    return radius ; 
                })

            group_cirlces
                .enter().append("text")
                .attr("transform", function(d) { return "translate(" + CanGraphMapPath.centroid(d) + ")"; })
                .attr('y',5)
                .attr('text-anchor','middle')
                .style('font-size','0.8em')
                .text((t)=>{
                    let text = (t.value == 0 ) ? '' : t.value ; 
                    return text ; 
                })   
            ;
        }
    }


    return CanGraphGeometries ; 
}

var p ; 
var currentGlobeCountryCode ; 

function jumpToCountryGlobe( value ) {
    
    //if ( value == undefined || value == "GRL" || value == "ESH" ) return ; 

    if ( CanMapConf.chart.projection == 'globe' )
    {

        var rotate = CanMapGraphProjection.rotate(),
        focusedCountry = checkCountry( CanGraphMapFeatures , value );
        p = d3.geo.centroid( focusedCountry );

        currentGlobeCountryCode = value ; 

        if ( value != "" )
        {
            (function transition() {
                d3.transition()
                    .duration( 3000 )
                    .tween("rotate", function() {
                        var r = d3.interpolate(CanMapGraphProjection.rotate(), [-p[0], -p[1]]);
                        return function(t) {
                            CanMapGraphProjection.rotate(r(t));
                            CanMapSvg
                                .selectAll(".country").attr("d", CanGraphMapPath)
                                .classed("focused", function(d, i) { 
                                    if ( focusedCountry != undefined ) 
                                        return d.id == focusedCountry.id ? focused = d : false ;
                                    else
                                        return false ;   
                                })
                            ;

                            g_poly.selectAll(".poly").attr("d", CanGraphMapPath);
                            g_lines.selectAll(".line").attr("d", CanGraphMapPath);


                            var pathCountry = 'path.country#code_'+currentGlobeCountryCode ; 
                            $(pathCountry).addClass('focused') ; 
                            // $(pathCountry).css('fill','rgb(30, 66, 115)') ; 
                        };

                    })
                })
            ();
        }
    }
    
}   

/**
* Manage legend from new color range
* @param (no param)
*/ 
function manageLegends()
{
    $('g.groupLegend').remove(); 

    if ( CanMapConf.chart.legend == true )
    {
        var colorset = CanMapColorSet ;

        console.info( colorset ) ; 
        // console.info( "CanMapUniqueValues" , CanMapUniqueValues , "=" , CanMapUniqueValues.length , "colorset = " , colorset.length ); 

        if ( CanMapUniqueValues.length < colorset.length ) 
        {
            colorset.reverse(); 
            colorset = colorset.slice(0,CanMapUniqueValues.length) ;
            var data_colors = Array.prototype.slice.call( colorset );
        }
        else
        {
            var data_colors = Array.prototype.slice.call( colorset );
            data_colors.reverse(); 
        }
        
        // push a "no data" color if not inside
        // if ( $.inArray( Default.color_no_data , colorset ) == -1 )  colorset.unshift( Default.color_no_data ) ; 

        var CanGraphGroupLegend = CanMapSvg.append('g').attr('class','groupLegend') ;

        var containerLegend = CanGraphGroupLegend.append('rect')
            .attr('class','containerLegend')
            .attr("x", $(CanMapConf.id).width() - CanMapConf.chart.legend_translate.x - 15 ) 
            .attr("y", 400 )
            .style('width', 140 )
            .style('height', 153 )
            .style('fill','transparent') 
            // .style('stroke','#000000')
        ;

        var CanGraphMaplegend = CanGraphGroupLegend.selectAll('g.legendEntry')
            .data( data_colors )
            .enter()
            .append('g')
            .attr('class', 'legendEntry') ;

        if ( CanMapConf.chart.legend_values == true )
        {
            
            CanGraphMaplegend
                .append('rect')
                .attr('class','rect_Legend')
                .attr("x", $(CanMapConf.id).width() - CanMapConf.chart.legend_translate.x ) 
                .attr("y", function(d, i) {
                    return (i * 15) + 2 + CanMapConf.chart.legend_translate.y ; 
                    // return (i * 20) + (CanMapHeight - 200) ;
                })
               .attr("width", 25 )
               .attr("height", 10 )
               .style("stroke","#cccccc")
               .style("stroke-width", "0.5px")
               .attr('color', function(d){ return d;})
               .style("fill", function(d){return d;})
               .on("click", function( color_clicked ){
                    
                    manageColorClicked( color_clicked ) ; 
                     
                })
            ; 
        }

        //the data objects are the fill colors

        if ( CanMapConf.chart.legend_values == true )
        {
            CanGraphMaplegend
                .append('text')
                .attr('class','text_Legend')
                .attr("x",  $(CanMapConf.id).width() - ( CanMapConf.chart.legend_translate.x - 35 ) )  // leave 5 pixel space after the <rect>
                .attr("y", function(d, i) {
                   return (i * 15) + CanMapConf.chart.legend_translate.y ; // + (CanMapHeight - 200);
                })
                .style('font-size','12px')
                .attr("dy", "0.9em") // place text one line *below* the x,y point
                .text(function(d,i) {
                    
                    // console.info( CanMapUniqueValues.length , colorset.length ) ; 

                    if ( CanMapUniqueValues.length == colorset.length ) 
                    {
                        return CanMapUniqueValues[i]+CanMapConf.chart.legend_suffix ; 
                    }
                    else
                    {
                        var extent = CanGraphMapColor.invertExtent(d) ;
                        //extent will be a two-element array, format it however you want:
                        var format = d3.format("0."+CanMapConf.chart.legend_decimal+"f") ;

                        if ( i == 0 && CanMapConf.chart.color_scale == 'quantile' )
                            return '≥ '+ Math.round( extent[0] )+CanMapConf.chart.legend_suffix ; 
                        else if (i == (CanMapGraphNbColors-1) && CanMapConf.chart.color_scale == 'quantile' )
                            return '< ' + Math.round(extent[1])+CanMapConf.chart.legend_suffix ; 
                        else
                            return Math.round(+extent[0]) + "–" + Math.round(+extent[1])+CanMapConf.chart.legend_suffix;
                    }
                })
                .on("click", function( color_clicked ){
                
                    manageColorClicked( color_clicked ) ; 

                })
            ;
        }

        if ( CanMapUniqueValues.length == colorset.length ) 
            var last_values_y = 4 * CanMapUniqueValues.length  ; 
        else
            var last_values_y = 17 ; 

        CanGraphGroupLegend
            .append('rect')
            .attr('class','rect_Legend')
            .attr("x", $(CanMapConf.id).width() - CanMapConf.chart.legend_translate.x ) 
            .attr("y",  CanMapConf.chart.legend_translate.y + ( CanMapGraphNbColors * last_values_y ) )
            .attr("width", 25 )
            .attr("height", 10 )
            .style("stroke","#cccccc")
            .style("stroke-width", "0.5px")
            .style("fill", function(d){ return Default.color_no_data ;})

        CanGraphGroupLegend
            .append('rect')
            .attr('class','rect_Legend')
            .attr("x", $(CanMapConf.id).width() - CanMapConf.chart.legend_translate.x ) 
            .attr("y",  CanMapConf.chart.legend_translate.y + ( CanMapGraphNbColors * last_values_y ) + 15 )
            .attr("width", 25 )
            .attr("height", 10 )
            .style("stroke","#cccccc")
            .style("stroke-width", "0.5px")
            .style("fill", function(d){ return Default.color_not_applicable ;})

        // No data 
        CanGraphGroupLegend
            .append('text')
            .attr('class','text_Legend')
            .attr("x",  $(CanMapConf.id).width() - ( CanMapConf.chart.legend_translate.x - 35 ) )  // leave 5 pixel space after the <rect>
            .attr("y", CanMapConf.chart.legend_translate.y + ( CanMapGraphNbColors * last_values_y ) - 2 )  // + (CanMapHeight - 200);})
            .style('font-size','12px')
            .attr("dy", "0.9em") // place text one line *below* the x,y point
            .text("No data") ;

        CanGraphGroupLegend
            .append('text')
            .attr('class','text_Legend')
            .attr("x",  $(CanMapConf.id).width() - ( CanMapConf.chart.legend_translate.x - 35 ) )  // leave 5 pixel space after the <rect>
            .attr("y", CanMapConf.chart.legend_translate.y + ( CanMapGraphNbColors * last_values_y ) + 13 )  // + (CanMapHeight - 200);})
            .style('font-size','12px')
            .attr("dy", "0.9em") // place text one line *below* the x,y point
            .text("Not applicable") ; 
    }
}

function manageColorClicked( color_clicked ){

    // markor to delete if need
    var hasDelete = false ; 

    // first start click
    if ( currentClickedColors == undefined ) currentClickedColors = [] ;

    // if a color is ever clicked, then unclick 
    var indexColor = $.inArray( color_clicked , currentClickedColors )  ; 

    if ( indexColor != -1 ) 
    {
        currentClickedColors.splice( indexColor , 1 ) ; 
        hasDelete = true ; 
        $('g.legendEntry [color="'+color_clicked+'"]').css('stroke','#cccccc');
    }
    else
    {
        // else we push the color
        currentClickedColors.push(color_clicked) ; 
        $('g.legendEntry rect[color="'+color_clicked+'"]').css({ 'stroke': '#1e4273' , 'stroke-width': '2px'});
    }

    // 3 conditions to come back to initial state : 
    //  currentClickedColor is not undefined (not first time)
    //  we have just remove a color

    //  the currentClickedColors is empty, so it means that we have empty the array
    if ( currentClickedColors != undefined && hasDelete == true && currentClickedColors.length == 0 )
    {
        CanGraphMapFeatures.transition()  //select all the countries and prepare for a transition to new values
            .duration(750)  // give it a smooth time period for the transition
            .attr('fill', function(d) { 

                var not_applicable_color = checkNotApplicable(d) ; 
                if ( not_applicable_color != false ) return not_applicable_color ; 

                if ( d.properties.values.no_data == true ) return Default.color_no_data ;

                return CanGraphMapColor( d.properties.values[CanGraphCurrentKey] == undefined ? d.properties.values.value : d.properties.values[CanGraphCurrentKey] ) ; 
            }) ; 
        isMonoColor = false ; 
        $('g.legendEntry rect').css('stroke','#cccccc');
    }
    else
    {
        

        // if(  isMonoColor == false ){
        CanGraphMapFeatures.transition()  //select all the countries and prepare for a transition to new values
            .duration(750)  // give it a smooth time period for the transition
            .attr('fill', function(d) {

                var not_applicable_color = checkNotApplicable(d) ; 
                if ( not_applicable_color != false ) return not_applicable_color ; 

                if ( d.properties.values.no_data == true ) return Default.color_no_data ; 

                var color = CanGraphMapColor( d.properties.values[CanGraphCurrentKey] == undefined ? d.properties.values.value : d.properties.values[CanGraphCurrentKey] ) ; 

                if ( $.inArray( color , currentClickedColors ) != -1 ) 
                    return color ; 
                else
                    return Default.color_no_data ;
            }) ; 
        isMonoColor = true ; 
        
    }
    return true ; 
}

    
function checkNotApplicable(d){

    if ( 
            d.properties.values.not_applicable == true || 
            d.id == 'ESH' || d.properties.ISO_3_CODE == 'ESH' || 
            d.properties.country == 'Abyei' || 
            d.properties.country == Jammu )
        {
            return Default.color_not_applicable ; 
        }
        else
            return false ; 
}

/**
* On click path function, mainly to zoom on each path
* @param (object) item selection
*/ 
function pathClickFunc(d) {

    var x, y, k;

    if (d && CanGraphMapCentered !== d) {
        var centroid = CanGraphMapPath.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4 ;
        CanGraphMapCentered = d;
    } else {
        x = CanMapWidth / 2;
        y = CanMapHeight / 2;
        k = 1;
        CanGraphMapCentered = null;
    }

    CanMapGroup.selectAll("path")
        .classed("zoomed", CanGraphMapCentered && function(d) { return d === CanGraphMapCentered; })
    ;

    CanMapGroup.transition()
        .duration(750)
        .attr("transform", "translate(" + CanMapWidth / 2 + "," + CanMapHeight / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", "0.5px");
}

function mapMouseDown(){
    m0 = [d3.event.pageX, d3.event.pageY];
    o0 = CanMapGraphProjection.origin();
    d3.event.preventDefault();
}

/*function changeSelectionProjection( key_projection ) {
  // clearInterval(interval);
  updateProjection( CanGraphMapProjections[ CanGraphMapProjectionsI[ ( key_projection == undefined) ? this.selectedIndex : key_projection ] ] );
}

function updateProjection(option) {
  CanMapGroup.selectAll("path").transition()
      .duration(500)
      .attrTween("d", projectionTween( CanMapGraphProjection , projection = option.projection , option)) ;
}*/

function projectionTween(projection0, projection1, option) {
  return function(d) {
    var t = 0;

    if ( option.name == "Globe")
        var projection = d3.geo.projection(project).scale(1).translate([width/2,320]) ;
    else
        var projection = d3.geo.projection(project).scale(1) ;
    //.translate([width / 2, height / 2]);
    var path = d3.geo.path().projection(projection);

    function project(λ, φ) {
      λ *= 180 / Math.PI, φ *= 180 / Math.PI;
      var p0 = projection0([λ, φ]), p1 = projection1([λ, φ]);
      return [(1 - t) * p0[0] + t * p1[0], (1 - t) * -p0[1] + t * -p1[1]];
    }

    return function(_) {
      t = _;
      return path(d);
    };
  };
}

/**
* Find a geometry country with Geometries array and iso code 
* @param (array) list of geometries countries
* @param (string) iso code 
*/
function checkCountry(cnt, value) { 
    var found ; 
    cnt.filter(function(d){
        if( d.properties.ISO_3_CODE == value ) { found = d ; return ; }
    });
    return found ; 
};

function computeValuesForDomain( dataset ){

    var domain_values = [] ; 

    for ( var item in dataset ) domain_values.push( dataset[ item ][ CanGraphCurrentKey ] ) ;

    return domain_values ; 

}