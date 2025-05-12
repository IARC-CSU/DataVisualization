/**
* CanChart is a js class that manage reusables charts dépending on various libraries
* 
* @author LAM Frédéric
* @date 06/2015
*/


// conf variables
var ENV = 'dev' ; 

var Graph_data ; 
var Graph_object ; 
var Graph_conf ; 
var Graph_garbage = [] ; 
var Graph_hooks = [] ; 
var GraphMultiBars_hooks = [] ; 
var Graph_dataset = [] ;
var Graph_title = '' ; 

var GraphPrintSvg = {
	'style' : 'font-family:"Source sans pro", Arial, Helvetica, sans-serif; font-size:12px; '
}; 

var Default  = {
	'mode' : 'cancer', // cancer | population
	'mode_population' : 'continents' , 
	'population' : 900 , 
	'type' : 0 , 
	'sex' : 0 , 
	'cancer' : 29 , // all cancer
	'prevalence' : false , 
	'statistic' : 0 ,  // 1 year prevalence
	'all_cancers_id': 29 , 
	'title_font_size' : 14 , 
	'color_palette' : 'default' , 
	'color_no_data' : '#f0f0f0' ,  
	'color_not_applicable' : '#f0f0f0' , 
	'sort_cancers' : 'total', 
	'dash_array_border' : 1 ,
	'dash_border': 0.4 , 
	'top_cancers' : [
		11 , // Lung , 
		15 , // Breast
		19 , // Prostate 
		6 , // Colorectum
		5 , // Stomach
		7 , // Liver
		22 , // Bladder
		4 , // Oesophagus
		26 , // Non-Hodgkin lymphoma
		21 , // Kidney
		28 , // Leukamia
		1 , // Lip, oral cavity
		9 , // Pancreas
		23 , // Brain, nervous system
		10 , // Larynx
		12 , // Melanoma of skin
		3 , // Other pharynx
		8 , // Gallblader
		24 , // Thyroid
		27 , // Multiple myeloma
		2 , // Nasopharynx
		20 , // Testis
		25 , // Hodkin lymphoma
	]
} ; 

var CanColors = {

	'bootstrap_colors' : [ '#044362' , '#0A70A1' , '#9B7000' , '#FFB903' , '#9B2000' , '#C62900' , '#9B5300' , '#FF8A03'] , 

	'continents_tree' : { 

		1 : '#004529' ,  4 : '#7A0177' , 2 : '#FF0000' , 3 : '#E31A1C' , 5: '#33a7ff' , 6 : '#FFD92F' , // basics
		966 : '#004529' ,  967 : '#7A0177' , 999 : '#ff0f0f' , 968 : '#08306B' , 969 : '#FFD92F',  // double for globocan , 
		962 : '#FFA500' , 905 : '#fc2121'
	} , 

	'continents' : {
		966 : '#004529' ,  
		967 : '#7A0177' , 
		999 : '#ff0f0f' , 
		968 : '#08306B' , 
		969 : '#FFD92F',  
		962 : '#FFA500' , 
		905 : '#fc2121'
	} , 

	// hdi colors 
	'hdi_regions' : {
		'981' : '#0b9aba' , 
		'982' : '#5c2d4f' , 
		'983' : '#d40f50' , 
		'984' : '#fadb14'
	}, 

	'hdi_regions_code' : {
		'VHHD' : '#0b9aba' , 
		'HHD' : '#5c2d4f' , 
		'MHD' : '#d40f50' , 
		'LHD' : '#fadb14'
	}, 

	// low-less
	'more_less_dev_regions' : {
		'901' : '#57313b' , 
		'902' : '#bdad80'
	}, 

	// who regions 
	'who_regions' : {
		'991' : '#d9343f' , 
		'992' : '#e6b31c' ,
		'993' : '#e0e3cc' , 
		'994' : '#f5e8c6' , 
		'995' : '#21d998' , 
		'996' : '#4500b5' , 
	} , 

	// who regions 
	'who_regions_per_code' : {
		'AFRO' : '#d9343f' , 
		'PAHO' : '#e6b31c' ,
		'EMRO' : '#e0e3cc' , 
		'EURO' : '#f5e8c6' , 
		'SEARO' : '#21d998' , 
		'WPRO' : '#4500b5' , 
	} , 

	// regions colors 
	'regions': {
		'1' : '#238544' , // Eastern Africa
		'2' : '#257A58' , // Middle Africa
		'3' : '#0F603F' , // Northern Africa
		'4' : '#002C1A' , // Southern Africa
		'5' : '#05492d' , // Western Africa

		// ASIA 
		'10' : '#460043' , // Eastern Asia
		'11' : '#63005F' , // South Eastern Asia
		'12' : '#970A91' , // South central Asia
		'13' : '#A12C9C' , // Western Asia 

		// EUROPE
		'14': '#34a9c7' , // Central & Eastern Europe
		'15': '#296e91' , // Northern Europe
		'16': '#485796' , // Southern Europe
		'17': '#7197e3' ,  // Western Europe

		// AMERICA 
		'9': '#fc2121' , // Northern America
		'6': '#b80000' , // Caribbean
		'7': '#fc3d3d' , // Central America
		'8': '#d90000' ,  // South America

		// OCEANIA
		'18': '#B09000' , // Australia/New Zealand
		'19': '#E3BB05' , // Melanesia
		'20': '#FFE055' , // Micronesia
		'21': '#FFE87F' , // Polynesia
		'22': '#FFE87F' , // Other oceanian regions
	}, 
	'regions_globocan' : {

		// AFRICA 
		'910' : '#238544' , // Eastern Africa
		'911' : '#257A58' , // Middle Africa
		'912' : '#0F603F' , // Northern Africa
		'913' : '#002C1A' , // Southern Africa
		'914' : '#05492d' , // Western Africa

		// ASIA 
		'906' : '#460043' , // Eastern Asia
		'920' : '#63005F' , // South Eastern Asia
		'921' : '#970A91' , // South central Asia
		'922' : '#A12C9C' , // Western Asia 

		// EUROPE
		'923': '#34a9c7' , // Central & Eastern Europe
		'924': '#296e91' , // Northern Europe
		'925': '#485796' , // Southern Europe
		'926': '#7197e3' ,  // Western Europe

		// AMERICA 
		'905': '#fc2121' , // Northern America
		'915': '#b80000' , // Caribbean
		'916': '#fc3d3d' , // Central America
		'931': '#d90000' ,  // South America

		// OCEANIA
		'927': '#B09000' , // Australia/New Zealand
		'928': '#E3BB05' , // Melanesia
		'954': '#FFE055' , // Micronesia
		'957': '#FFE87F' , // Polynesia
	}, 

	// continents : to delete
	// 'continents' : [ '#a9d4ba' ,  '#f0c878' , '#6cbbe0' , '#e65757' , '#2c7d91' , '#c29b4e' , '#f03b20' , '#ffeda0' , '#dd1c77' , '#e0ecf4' , '#8856a7' , '#bdbdbd' ] , 
	
	// sexes
	'sexes' : [  '#1E90FF' , '#5e0099' , '#ff7070' ] , 
	
	// 	
	'type' : { 'incidence' : null , 'mortality' : null } , 
	
	// cancers colors 
	'cancers' : {
		'-1': '#CCCCCC' , 
		'1' : '#AE563E' , // Lip oral cavity C00-08
		'2'	: '#2A4950' , // Nasopharynx C11
		'3'	: '#6D8A6D' , // Other pharynx cancer
		'4' : '#DC1341',  // Oesophagus
		'5' : '#4682B4' , // Stomach
		'6' : '#FFD803' , // Colorectum
		'7' : '#F3A654' , // Liver
		'8' : '#0f330f' , // Gallbladder
		'9' : '#940009' , // Pancreas
		'10': '#a9d4ba' , // Larynx
		'11': '#1E90FF' , // Lung
		'12' : '#894919' , // Melanoma of skin
		'14' : '#FFC2CA' , // Kaposi sarcoma
		'15' : '#FF68BC' , // Breast
		'16' : '#FF7500' , // Cervix uteri
		'17' : '#9FE72D', // Corpus uteri
		'18' : '#8C07C2' , // Ovary
		'19' : '#34A76E' , // Prostate
		'20' : '#ffff44' , // Testis
		'21' : '#040186' , // Kidney
		'22' : '#278D29' , // Bladder
		'23' : '#D5BED2' , // Brain, nervous system
		'24' : '#ADD9E4' , // Thyroid
		'25' : '#cc5906' , // Hodgkin lymphoma
		'26' : '#9931D0' , // Non-Hodgkin lymphoma
		'27' : '#f0c878' , // Multiple myeloma
		'28' : '#FFFFA6' , // Leukaemia
		'29' : '#DCDCDC' 
	}
}

// CanColors.continents = CanColors.continents_tree ; 
CanColors.hdi = CanColors.hdi_regions ; 
CanColors.who = CanColors.who_regions ; 
CanColors.world = [] ; 

// By default set colors for 

var CanDataKey , CanDataLabel , CanElHtml , CanItemFilter ; 

/**
* Constructor class
*
* @param (object) configuration of chart
* @return (object) self object
*/
var CanChart = function( config ){

	// @var (object) set all graph config inside a graph
	this.config 				= config ; 
	this.vizInstance			= {} ; 
	// init my app
	this.init( this ) ; 
	this.filterCallback 		= null  ; 

	this.renderingCallback 		= ( PROJECT != undefined ) ? 'addCopyrightSvg' : null ;
	this.browser 				= detectBrowser(); 

	return this ; 

}

CanChart.prototype = {

	/**
	* Properties
	*/

	/**
	* Graph object instanciated by conf
	*/
	graphObject : { } ,

	/**
	* Methods to init graph
	* @object : conf overide 
	* @return 
	*/
	init : function( object ){
		
		config = object.config ; 

		// the type is the minimum of graph 
		// init graph type + strategy
		
		switch( config.strategy )
		{
			case 'html' :
				switch( config.type )
				{
					case 'dot_matrix' : 
						graphObject = new CanDotMatrixGraph( this ) ;
						break ; 

					case 'table': 
						graphObject = new CanTable( this ) ; 
						break ; 
				}
				break ; 

			// nvd3 strategy
			case 'nvd3' : 
				switch( config.type )
				{
					case 'pyramid' : 
						graphObject = new CanNvPyramidGraph( this ) ;
						break ; 
				
					case 'pie' : 
						graphObject = new CanNvPieGraph( this ) ; 
						break ; 

					case 'bar' : 
						graphObject = new CanNvBarGraph( this ) ; 
						break ; 

					case 'multibar' : 
						graphObject = new CanNvMultiBarGraph( this ) ; 
						break ;

					case 'area' : 
						graphObject = new CanNvAreaGraph( this ) ; 
						break ; 

					case 'line' : 
						graphObject = new CanNvLineGraph( this ) ; 
						break ; 

					case 'scatter' : 
						graphObject = new CanNvScatterGraph( this ) ; 
						break ; 
				}
				break ; 

			case 'highcharts' :
				switch( config.type )
				{
					case 'pie' :
						graphObject = new CanHCPieGraph( this ) ;		 
						break ; 
					case 'line' :
						graphObject = new CanHCLineGraph( this ) ;		 
						break ; 
					case 'area' :
						graphObject = new CanHCAreaGraph( this ) ;		 
						break ; 
					case 'treemap' :
						graphObject = new CanHCTreemapGraph( this ) ;		 
						break ; 
					case 'pyramid' :
						graphObject = new CanHCPyramidGraph( this ) ;		 
						break ; 
				}
				break ; 

			// by default set to D3 home made strategy
			default : 
				switch( config.type )
				{
					case 'pie' : 
						graphObject = new CanPieGraph( this ) ;
						break ; 

					case 'bar' : 
						switch( config.chart.orientation )
						{
							case 'vertical' : 
								graphObject = new CanBarGraph( this ) ;
								break ;
							case 'horizontal' : 
								graphObject = new CanBarHorizontalGraph( this ) ;
								break ;
						}
						break ; 

					case 'pyramid' : 
						graphObject = new CanPyramidGraph( this ) ;
						break ; 

					case 'treemap' : 
						graphObject = new CanTreeMapGraph( this ) ;
						break ;

					case 'bubble' : 
						graphObject = new CanBubbleMapGraph( this ) ;
						break ;

					case 'force_bubble' : 
						graphObject = new CanForceBubbleGraph( this ) ;
						break ; 

					case 'force_layout' : 
						graphObject = new CanForceLayoutGraph( this ) ;
						break ; 

					case 'circle_pack' : 
						graphObject = new CanCirclePackGraph( this ) ;
						break ; 

					case 'codeflower' : 
						graphObject = new CanCodeFlowerMapGraph( this ) ;
						break ; 

					case 'sunburst' : 
						graphObject = new CanSunBurstGraph( this ) ;
						break ; 

					case 'pyramid-bars' : 
						graphObject = new CanPyramidBarsGraph( this ) ; 
						break ; 

					case 'globe' : 
						graphObject = new CanGlobeGraph( this ) ; 
						break ; 

					case 'map' : 
						graphObject = new CanMapGraph( this ) ; 
						break ; 

					case 'parset' : 
						graphObject = new CanParsetGraph( this ) ; 
						break ;	

					case 'radial_bars' : 
						graphObject = new CanRadialBarsGraph( this ) ; 
						break ;	

					case 'radar' : 
						graphObject = new CanRadarGraph( this ) ; 
						break ;	
				}
		}

		// save object in a global var 
		this.vizInstance 	= {} ; 
		Graph_object 		= {} ; 

		this.vizInstance 	= graphObject ; 
		Graph_object 		= graphObject ; 
		
		// console.log( this.config ) ; 

		// @var (string) strategy of chart, depending on library (d3, raphael ...)
		this.strategy 		= 'd3' ;

		// @var (array) list of html array appened
		this.filters_html	= [] ; 

		//@var (int) width of chart
		this.width 			= ( config.width != undefined) ? config.width : 800 ; 

		// @var (int) height of chart
		this.height 		= ( config.height != undefined ) ? config.height : 600 ; 

		// @var (array,object) mixed var data to chart
		this.data			= ( config.data != undefined ) ? config.data : null ; 

		// @var (string) type of chart bars , lines , map ... 
		// this.type 			= 'pie' ; 

		// window settings 
		this.windowWidth	= $(window).width() ; 
		this.windowHeight	= $(window).height() ; 

		// console.log( "responsive" , this.config.responsive ) ; 

		this.filterCallback	= config.filterCallback ; 

		// handler window resize
		if ( this.config.responsive == true )
		{
			this.resize() ; 
		}

		// set button downloads
		this.setButtonsDownload() ; 

		// set all filters
		// this.setFilters( this.config ) ; 

		// set title if exists 
		if ( this.config.title != null ) $('#title').text( this.config.title ) ;

		// load a specific css if exists
		if ( this.config.css && this.config.css != '' )
		{
			$('head').append('<link rel="stylesheet" href="'+  this.config.css +'">') ; 
		}

	} ,

	/**
	* Render the data viz
	* @object configuration that will overide default conf 
	* @object default configuration if data overide is empty
	*/
	setConf : function( overide_conf, default_conf ){

		var new_conf = default_conf ; 

		for( var key in default_conf )
		{
			// console.log( key , typeof( default_conf[key]) ,  default_conf[key] , overide_conf[key] ) ; 

			if ( key == 'filters' )
			{
				if ( typeof( overide_conf[key]  != undefined ) )
				{
					new_conf[key] = overide_conf[key] ;
				}
				break ; 
			}
			else if ( typeof( default_conf[key]) == 'object' && default_conf[key] != null )
			{
				// wait for an object
				if ( typeof( overide_conf[key] ) != 'object' && overide_conf[key] != undefined )
				{
					new_conf[key] = overide_conf[key] ;
				}
				for ( var sub_key in default_conf[key] )
				{
					if ( overide_conf[key] != undefined )
					{
						if ( overide_conf[key][sub_key] != undefined )
						{
							new_conf[key][sub_key] = overide_conf[key][sub_key] ; 
						}	
					}
				}
			}
			else
			{
				// console.log( key , typeof( overide_conf[key] ) ) ; 
				if ( typeof( overide_conf[key] ) != 'undefined' )
					new_conf[key] = overide_conf[key] ; 
			}
		}

		this.config = new_conf ; 
		return new_conf ; 
	},

	/**
	* Render the data viz
	*/
	render : function(){

		graphObject.launch(this) ; 

		if ( this.renderingCallback != null ) 
		{
			window[ this.renderingCallback  ]( this ) ; 
		}
		return this ; 
	},

	/**
	* Manage buttons download pdf / svg / png
	*/
	setButtonsDownload : function(){  

		// var query_string = canGetQueryStrings(false) ; 
		// var download_host = this.config.data.url + '?' + query_string  ; 

		if ( this.config.downloads != false && this.config.downloads != undefined )
		{
			// icons
			if ( this.config.downloads.icons == true )
			{
				var label_download = '<i class="fa fa-floppy-o"></i>' ; 
			}
			else
			{
				var label_download = "Download" ; 
			}	

			if ( $('div'+ this.config.container+' #downloads') == undefined  )
			{									
				if ( this.config.downloads.action != undefined )
					$('div'+ this.config.container ).after( '<div id="downloads"><ul></ul></div>' ) ; 
				else
					$('div'+ this.config.container ).prepend( '<div id="downloads"><ul></ul></div>' ) ; 
			}
			else
			{
				$( 'div'+ this.config.container ).after( '<div id="downloads"><ul></ul></div>' ) ; 
			}

			// ------ download PNG ------ 
			if ( this.config.downloads.png != undefined && this.config.downloads.png == true )
			{
				$('#downloads ul').append('<li><a class="btn_download" name="" data-toggle="tooltip" title="Download chart as a PNG" onclick="printGraph(\'png\',\''+this.config.type+'\',\''+this.config.container+'\',this)">'+label_download+' PNG</a></li>' ) ;
			
				$("#btn_download_png").on("click", function(){
					generatePNG();
					return false ; 
				});
			}

			// ------ download SVG ------ 
			var browser = detectBrowser(); 

			if ( this.config.downloads.svg != undefined && this.config.downloads.svg == true && browser.msie == false )
			{
				$('#downloads ul').append('<li><a class="btn_download" name="" data-toggle="tooltip" title="Download chart as an SVG" onclick="printGraph(\'svg\')">'+label_download+' SVG</a></li>' ) ;
			}
			
			// ------ download PDF ------ 
			if ( this.config.downloads.pdf == true )
			{
				$('#downloads ul').append('<li><a class="btn_download" data-toggle="tooltip" title="Download chart as a PDF" onclick="printGraph(\'pdf\',\''+this.config.type+'\',\''+this.config.container+'\',this)">'+label_download+' PDF</a></li>') ;
			}

			// ------ download JSON ------ 
			if ( this.config.downloads.json == true )
			{
				$('#downloads ul').append('<li><a href="#" download="data.json" title="Download chart data in a json file" data-toggle="tooltip" class="btn_download" name="btn_download_json" id="btn_download_json">'+label_download+' JSON</a></li>') ;
			}

			// ------ download CSV ------ 
			if ( this.config.downloads.csv == true )
			{
				$('#downloads ul').append('<li><a href="javascript:callCSVDownload()" title="Download data as a csv file" data-toggle="tooltip" class="btn_download" name="" id="btn_download_csv">'+label_download+' CSV</a></li>') ;
			}

			// ------ download XML ------ 
			if ( this.config.downloads.xml == true && true == false )
			{
				$('#downloads ul').append('<li><a href="javascript:callDownloadUrl(\'&force_download=1&mode_download=xml\')" title="Download data as a xml file" data-toggle="tooltip" class="btn_download" name="" id="btn_download_xml">'+label_download+' XML</a></li>') ;
			}

			// ------ download PPT ------ 
			if ( true )
			{
				$('#downloads ul').append('<li><a class="btn_download btn_download_pdf" name="" data-toggle="tooltip" title="Download chart as a pptx file" onclick="printGraph(\'ppt\',\''+this.config.type+'\',\''+this.config.container+'\',this)">'+label_download+' PPTX</a></li>' ) ;
			}

			// ---- get permalink --------- this.config.downloads.permalink == 
			if ( true )
			{
				if ( browser.safari == false )
				{ 
					// don't show permalink button under certain version
					// if  ( browser.firefox == true && Math.abs(browser.version) < 41 ) return  ; 
					$('#downloads ul').append('<li><a href="#" title="Copy the permalink" data-toggle="tooltip" class="btn_download btn_permalink" name="" id="btn_permalink"><i class="fa fa-link"></i> Permalink</a></li>') ;
				
					new Clipboard('.btn_permalink', {
			            text: function(trigger) {
			                $('a.btn_permalink').attr( 'data-original-title' , 'Permalink copied !' ) ;
			                $('a.btn_permalink').tooltip('show'); 
			                $('a.btn_permalink').attr( 'data-original-title' , 'Copy the permalink' ) ;
			                return document.URL ;
			            }
			        });
			    }
			}

			/*if ( false == true )
			{
				// $('#downloads ul').append('<li><a class="btn_download" data-toggle="tooltip" title="Embed the graph" onclick="printGraph(\'pdf\',\''+this.config.type+'\',\''+this.config.container+'\',this,true)"><i class="fa fa-code"></i> Embed</a></li>') ;
			}*/			
		}
	}, 

	/**
	* Manage all filters defined in conf.filters = {}
	*/
	setFilters : function( local_config ){

		// console.log( 'function setFilters()' , local_config ) ; 

		if ( local_config.filters != false )
		{
			var cpt = 1 ; 

			for( var key in local_config.filters )
			{
				filter = local_config.filters[key] ; 
				
				var attr_id = ( filter.id == undefined ) ? 'id="'+slugify(filter.title)+'"' : 'id="'+filter.id+'"' ; 

				switch( filter.type )
				{

					case 'button' : 

						var onclick = (filter.onclick != undefined) ? 'onclick="'+filter.onclick+';toggleText(\'#filter-'+cpt+'\',\''+filter.title+'\',\''+filter.alt_title+'\')"' : null ; 

						CanElHtml = '' ; 
						CanElHtml += '<input name="filter-'+cpt+'"  id="filter-'+cpt+'" type="button" value="'+filter.title+'" '+onclick+'>'  ; 

						var className = ( filter.class != undefined ) ? filter.class : '' ; 

						var html = '<div class="filter '+className+'" id="container-filter-'+cpt+'">'+CanElHtml+'</div>' ; 

						// this.filters_html.push( html ) ;

						$('#filters #filter-content').append( html ) ; 

						break ; 

					case 'select' : 

						var multiple = ( filter.multiple == true ) ? 'multiple="multiple"' : '' ;
							
						if ( filter.data != undefined )
						{
							var attr_change = (filter.attr_change != undefined) ? filter.attr_change : 'onchange' ; 
							var tag_function = (filter.tag_function != undefined) ? attr_change+'="'+filter.tag_function+'"' : null ; 
							var data_key = (filter.data_key != undefined) ? filter.data_key : 'key' ;  

							CanElHtml = '' ; 
							CanElHtml += '<h3>' +filter.title+ '</h3>' ; 

							var aAttr = [] ; 
							if ( filter.attrs != undefined )
							{
								for( var j in filter.attrs ) 
									aAttr.push( filter.attrs[j].attr + '=' + ( filter.attrs[j].key != undefined ) ? filter.attrs[j].key : filter.attrs[j].function ) ; 
							}
							CanElHtml += '<select name="filter-'+cpt+'" '+multiple+' '+attr_id+' '+tag_function+' '+aAttr.join(' ')+'>' ;
							
							if ( filter.data == 'colorbrewer')
							{
								var colors = this.getColorBrewer() ; 
								filter.data = [] ; 
								for (var item in colors ){
									filter.data.push( {'label' : colors[item].key ,'key' : colors[item].key  }) ; 
								}
							}

							// CanElHtml += '<option value="">All</option>' ;

							if ( filter.data_src != undefined && filter.data_src == 'self' )
							{
								// data source from 
								for( var i in Graph_data )
								{
									// var selected = ( filter.data[i].selected == true) ? 'selected="selected"' : '' ; 
									// log( CanPie_data[i] ) ; 
									CanElHtml += '<option value="'+CanPie_data[i][filter.data.key]+'" >'+CanPie_data[i][filter.data.label]+'</option>' ; 
								}
							}
							else if ( filter.data.length > 0 )
							{								
								// data source from 
								for( var i in filter.data )
								{
									var selected = ( filter.data[i].selected == true) ? 'selected="selected"' : '' ; 
									CanElHtml += '<option value="'+filter.data[i][data_key]+'" '+selected+'>'+filter.data[i].label+'</option>' ; 
								}
							}	
							CanElHtml += '</select>'; 

							var className = ( filter.class != undefined ) ? filter.class : '' ; 

							var html = '<div class="filter '+className+'" id="container-filter-'+cpt+'">'+CanElHtml+'</div>' ; 

							$('#filters #filter-content').append( html ) ; 
						}
						else if ( filter.data_url )
						{								
							CanElHtml = '' ; 
							$.ajax({ 
								url 		: ( filter.data_url.indexOf("http://") == -1 ) ? Graph_conf.host_data + filter.data_url : filter.data_url, 
								// crossDomain	: true,
								// dataType	: 'jsonp',
								context		: { local_filter : filter } , 
								success 	: function( filter_data ){

									var filters = ( this.local_filter.data_table != undefined ) ? filter_data[this.local_filter.data_table] : filter_data ; 
									// apply hook functio for a specific format ? 
									// if ( this.local_filter.hook_function != undefined ) filters = window[ this.local_filter.hook_function ](filters) ; 

									var tag_function = (this.local_filter.tag_function != undefined) ? 'onchange="'+this.local_filter.tag_function+'"' : null ; 
									CanElHtml = '<h3>' +this.local_filter.title+ '</h3>' ; 

									var attr_id = ( this.local_filter.id == undefined ) ? 'id="'+slugify(this.local_filter.title)+'"' : 'id="'+this.local_filter.id+'"' ; 

									var aAttr = [] ; 
									if ( this.local_filter.attrs != undefined )
									{
										for( var j in this.local_filter.attrs ) {
											// console.info(this.local_filter.attrs[j].attr,this.local_filter.attrs[j].function) ; 
											aAttr.push( this.local_filter.attrs[j].attr + '=' + ( ( this.local_filter.attrs[j].key != undefined ) ? this.local_filter.attrs[j].key : this.local_filter.attrs[j].val ) ) ; 
										}
									}

									CanElHtml += '<select name="filter" '+tag_function+' '+attr_id+' '+aAttr.join(' ')+'>' ;
									if ( this.local_filter.show_all == true) CanElHtml += '<option value="">All</option>' ;

									for( var i in filters )
									{
										f = filters[i] ; 

										var aAttr = [] ; 
										if ( this.local_filter.attrs != undefined )
										{
											for( var j in this.local_filter.attrs )
											{
												aAttr.push( this.local_filter.attrs[j].attr + '=' + f[this.local_filter.attrs[j].key] )
											}
										}
										var selected_status = ( this.local_filter.init_value != undefined && this.local_filter.init_value == f[this.local_filter.data_key]) ? 'selected="selected"' : '' ; 
										var style_attr = ( f['style'] != undefined ) ? 'style="'+f['style']+'"': '' ; 
										
										// var option_tag = ( f.OPT_GROUP == true ) ? 'optgroup' : 'option' ; 
										var option_tag = 'option' ; 
										CanElHtml += '<'+option_tag+' value="'+f[this.local_filter.data_key]+'" '+aAttr.join(' ')+' '+selected_status+' '+style_attr+'>'+f[this.local_filter.data_label]+'</'+option_tag+'>' ; 
									
									}
									CanElHtml += '</select>'; 

									var className = ( this.local_filter.class != undefined ) ? this.local_filter.class : '' ; 

									var html = '<div class="filter '+className+'" id="container-filter-'+cpt+'">'+CanElHtml+'</div>' ; 

									$('#filters #filter-content').prepend( html ) ; 
									
									// callback function 
									if ( this.local_filter.callback != undefined ) window[this.local_filter.callback]() ; 

									return true ; 
								}
							}); 							
						}						

						break ; 

					// --------------------------------------------------------------------------------------------------------
					case 'radio' : 

						CanElHtml = '' ; 
						CanElHtml = '<h3>' +filter.title+ '</h3>' ; 

						if ( filter.data != undefined )
						{
							if ( filter.data.length > 0 )
							{
								for( var i in filter.data )
								{
									// item checked or not
									var item_checked = ( i == 0 || filter.data[i].checked == true ) ? 'checked="checked"' : '' ; 
									
									// custom attr

									CanElHtml += '<label for="filter-'+cpt+'-'+i+'">' ; 
									CanElHtml += '<input type="radio" value="'+filter.data[i].key+'" '+item_checked+' id="filter-'+cpt+'-'+i+'" name="filter-'+cpt+'">'  ; 
									CanElHtml += filter.data[i].label + '</label>' ; 
								}
							}	
						}

						var className = ( filter.class != undefined ) ? filter.class : '' ; 

						var html = '<div class="filter '+className+'" id="container-filter-'+cpt+'">'+CanElHtml+'</div>' ;

						$('#filters #filter-content').append( html ) ; 

						break ; 

					// --------------------------------------------------------------------------------------------------------
					case 'range' : 

						CanElHtml = '' ; 
						CanElHtml = '<h3>' +filter.title+ '</h3>' ; 
						CanElHtml += '<input name="filter-'+cpt+'" type="range" min="'+filter.min+'" max="'+filter.max+'" value="'+filter.init+'">'  ; 

						var className = ( filter.class != undefined ) ? filter.class : '' ; 
						var html = '<div class="filter '+className+'" id="container-filter-'+cpt+'">'+CanElHtml+'</div>' ; 
						$('#filters #filter-content').append( html ) ; 
						break ; 
				}

				cpt++ ; 

				this.filters_html.push( html ) ;

			} // end for 
		}

		local_config.filters = false ; 

		if ( this.filterCallback != null ) window[ this.filterCallback  ]() ; 
	},


	setRenderingCallback : function( func ){

		this.renderingCallback = func ; 

	} , 

	/**
	* Manage resize event
	*/
	resize : function(){

		$(window).resize(function(){

			graphObject.resize() ;

		}) ; 

	}, 
	
	/**
	* Change dynamically a title
	*
	* @param (string) the title with dynamic var . Ex : "Numbers of #type for #country in 2015"
	* @param (array) data obj. with variables to change
	* @return (string)
	*/ 
	updateTitle : function( srcTitle , params ){

		var new_title =  vsprintf( srcTitle , params ) ; 

		if ( typeof(graphObject.changeTitle) == 'function' ) graphObject.changeTitle( new_title );

		return new_title; 
	} ,
	/**
	* Manage resize event
	*/
	resize : function(){

		$(window).resize(function(){
			graphObject.resize() ;
		}) ; 
	}, 

	/**
	* Rewrite query string
	* @funct
	*/
	rewriteUrl : function(){

	}
	,
	/**
	*
	*/ 
	getColorBrewer : function(){
		return d3.entries(colorbrewer)  ; 
	}


};

/**
* Log data only if ENV is dev
*/
function log( data )
{
	if ( ENV == 'dev' ) console.log( data ) ; 
}
/**
* Alias of log
*/
function canLog( data ){
	log( data ) ; 
}
/**
* Rewrite url
*/
function canRewriteUrl( query_string ){
 document.location.href = document.location.href + '#' + query_string ; 
}

function canGetQueryStrings( is_object )
{
	// check if nothing is in the url 
    var get_prevalence = $.getUrlVar('prevalence');
    var get_population = $.getUrlVar('population');
    var get_population2 = $.getUrlVar('population2');
    var get_cancers = $.getUrlVar('cancers');
    var get_sex = $.getUrlVar('sex');
    var get_type = $.getUrlVar('type');
    var get_statistic = $.getUrlVar('statistic');
    var get_query_sort = $.getUrlVar('sorting');
    var get_ages = $.getUrlVar('ages');
    var get_continents = $.getUrlVar('continents');
    var get_limit = $.getUrlVar('limit');
    var get_orientation = $.getUrlVar('orientation');
    
    if ( is_object == true )
	    return q_string = {
	        'cancers'   : get_cancers , 
	        'population': get_population , 
	        'continents': get_continents , 
	        'sex'       : get_sex ,
	        'type'      : get_type ,
	        'prevalence': get_prevalence , 
	        'statistic' : get_statistic , 
	        'ages'		: get_ages, 
	        'sort'		: get_query_sort,
	        'limit'		: get_limit, 
	        'orientation': get_orientation 
	    } ; 
	else
		return 'cancers='+get_cancers+'&population='+get_population+'&population2='+get_population2+'&sex='+get_sex+'&type='+get_type+'&prevalence='+get_prevalence+'&statistic='+get_statistic+'&sorting='+get_query_sort+'&ages='+get_ages+'&continents='+get_continents ; 
    // return q_string ; 
}

/**
* callCSVDownload
* @param() 
*/ 
function callCSVDownload()
{	
	// download json data in csv format file
	JSONToCSVConvertor( Graph_dataset , Graph_title , true ) ; 
}

/**
* callDownload
* @param(string) mode of download csv | json | xml
* @return (string) data sent to browser 
*/ 
function callDownload( mode )
{
	console.log( mode , Graph_dataset ) ; 
}

/**
* Get extension for jQuey (get query strings var)
* @param() 
*/ 
function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
* Get extension for jQuey (get query strings var)
* @param() 
*/ 
function toggleFilter(element){
	$('.hidden-filter').fadeToggle();
}

var toggleShown = false ; 

/**
* Get extension for jQuey (get query strings var)
* @param() 
*/ 
function toggleText(element,text1,text2){
	if (toggleShown == false)
	{
		$(element).val(text2);
		toggleShown  = true ; 
	}
	else
	{
		$(element).val(text1);
		toggleShown  = false ; 
	}
}

function addCopyrightSvg( object ){
	setTimeout(function(){

		/*if ( CanMapConf.chart != undefined ) Graph_conf = CanMapConf ;
		if ( Graph_MultiBar_conf != undefined ) 
			if (Graph_MultiBar_conf.chart != undefined) 
				Graph_conf = Graph_MultiBar_conf ; */

		Graph_conf = object.config  ;

		if ( Graph_conf == undefined ) return ; 
		
		if ( Graph_conf.chart != undefined && Graph_conf.chart.copyright == false ) return ; 

		if ( Graph_conf.id != undefined )
		{
			if( Graph_conf.id.indexOf('#') != -1) 
				var svg_pattern = Graph_conf.container +' svg'+Graph_conf.id ; 
			else
				var svg_pattern = Graph_conf.container +' svg#'+Graph_conf.id ; 
		}
		else
		{
			
		}
				
		if ( $(svg_pattern).length == 0 ) svg_pattern = Graph_conf.container +' svg' ; 
		
		// force arial text
		d3.select( svg_pattern + ' text').style('font-family','Arial') ;

		// force node parent transparent 
		d3.select( svg_pattern + ' circle.parent').attr('fill','transparent').style('fill','none') ;

		if ( Graph_conf.chart == undefined ) return ; 

		var cpr = ( Graph_conf.chart.copyright != undefined ) ? Graph_conf.chart.copyright : undefined ;

		var y = ( cpr != undefined && cpr.y != undefined) ? cpr.y : Graph_conf.height - 35  ; 

		if ( cpr != undefined && cpr.x != undefined) 
		{
			var x = cpr.x ; 
		}
		else
		{
			var x = ( $(window).width() > 1280 ) ? Graph_conf.width / 4 : 50 ; 
		}
		
		var x_logo = ( cpr != undefined && cpr.x_logo != undefined) ? cpr.x_logo : ( Graph_conf.width / 3 ) * 2 ;
	
		var y_logo = y ;  

		var fontFamily = 'Source Sans Pro, Arial';	

		if ( typeof(txt_map_decription) == 'undefined' ) txt_map_decription = '' ; 

		if (  Graph_conf.type == "map" || Graph_conf.type == "globe" ) 
		{
			y+= 100 ; 
			y_logo += 100 ; 
			
			var x_sources = ( Graph_conf.width / 4 ) * 2.1  ;  

			var y_txt_desc = y ;
			var txt0 = d3.select( svg_pattern ).insert('text').attr('width', 800 ).attr('height',10).attr('class','copyright').attr("text-anchor",'left').attr('x',0).attr('y',y_txt_desc).style('font-size','11px').style('font-family',fontFamily) ; 

			var nb_max_words = ( $(window).width() > 1440 ) ? 18 : 14 ; 
			var data_description = splitPerWords( txt_map_decription , 225 , nb_max_words ) ; 

			for ( var item in data_description )
			{
				y_txt_desc += 15 ; 
				txt0.append('tspan').attr('x', 20 ).attr('y', y_txt_desc ).text( data_description[item ]); 
			}
			
			var txt1 = d3.select( svg_pattern ).insert('text').attr('width',200).attr('height',10).attr('class','copyright').attr("text-anchor",'left').attr('x',x_sources).attr('y',y+15).style('font-size','11px').style('font-family',fontFamily) ; 
			
			// extra source 
			var source_extra_project = ( sourceProject != undefined ) ? sourceProject : 'GLOBOCAN 2012' ; 

			txt1.text('Data source : ' + source_extra_project) ; 
			var txt2 = d3.select( svg_pattern ).insert('text').attr('width',200).attr('height',10).attr('class','copyright').attr("text-anchor",'left').attr('x',x_sources).attr('y',y+30).style('font-size','11px').style('font-family',fontFamily) ; 
			txt2.attr( "xlink:href", "http://gco.iarc.fr/") ;
			
			txt2.text('Graph production: IARC (http://www.iarc.fr/)') ; 
			
			var txt2_link = d3.select( svg_pattern ).insert("a").attr("xlink:href", "http://gco.iarc.fr/" )
				.append("rect").attr('x',x + 20).attr('y',y+8).attr("height", 10).attr("width", 200).attr('fill','transparent') ;
			var txt3 = d3.select( svg_pattern ).insert('text').attr('width',200).attr('height',10).attr('class','copyright').attr("text-anchor",'left').attr('x',x_sources).attr('y',y+45).style('font-size','11px').style('font-family',fontFamily) ; 
			txt3.text('World Health Organization') ;

			var txt4 = d3.select( svg_pattern ).insert('text').attr('width',200).attr('height',10).attr('class','copyright').attr("text-anchor",'left').attr('x',x_logo).attr('y',y+45).style('font-size','11px').style('font-family',fontFamily) ; 
			txt4.text('© WHO All rights reserved') ;

			x_logo = x_logo + 25 ; 

			// picture
			var image_copyright = d3.select( svg_pattern ).insert('image').attr('class','copyright').attr('width',95).attr('height',30).attr('x',x_logo).attr('y',y_logo) ; 
			image_copyright.attr("xlink:href", "data:image/jpeg;base64,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") ;

		}
		else
		{
			if ( x != false )
			{
				var source_extra_project = ( sourceProject != undefined ) ? sourceProject : 'GLOBOCAN 2012' ; 

				// small fixes of background
				var txt1 = d3.select( svg_pattern ).insert('text').attr('width',200).attr('height',10).attr('class','copyright').attr("text-anchor",'left').attr('x',x).attr('y',y+5).style('font-size','11px').style('font-family',fontFamily) ; 
				txt1.text('Data source:'+ source_extra_project) ; 

				var txt2 = d3.select( svg_pattern ).insert('text').attr('width',200).attr('height',10).attr('class','copyright').attr("text-anchor",'left').attr('x',x).attr('y',y+15).style('font-size','11px').style('font-family',fontFamily) ; 
				txt2.attr( "xlink:href", "http://gco.iarc.fr/today") ;
				txt2.text('Graph production: Global Cancer Observatory (http://gco.iarc.fr/)') ; 

				var txt2_link = d3.select( svg_pattern ).insert("a").attr("xlink:href", "http://gco.iarc.fr/" )
					.append("rect").attr('x',x + 20).attr('y',y+8).attr("height", 10).attr("width", 200).attr('fill','transparent') ;

				var txt3 = d3.select( svg_pattern ).insert('text').attr('width',200).attr('height',10).attr('class','copyright').attr("text-anchor",'left').attr('x',x).attr('y',y+25).style('font-size','11px').style('font-family',fontFamily) ; 
				var year = new Date().getFullYear()  ; 
				txt3.text( txt_all_rights_reserverd ) ; 
			}

			if ( x_logo != false )
			{
				var image_copyright = d3.select( svg_pattern ).insert('image').attr('class','copyright').attr('width',200).attr('height',30).attr('x',x_logo - 50 ).attr('y',y_logo) ; 
				image_copyright.attr("xlink:href", "data:image/gif;base64,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") ; 
			}
		}

		// text
		// $( svg_pattern ).append('<text width="200" height="10" class="copyright" text-anchor="left" x="'+x+'" y="'+(y+5)+'" style="font-size: 11px;">Data source : GLOBOCAN 2012</text>') ; 
		// $( svg_pattern ).append('<a xlink:href="http://gco.iarc.fr/today" target="_blank"><text width="200" height="10" class="copyright" text-anchor="left" x="'+x+'" y="'+(y+15)+'" style="font-size: 11px;">Graph production: IARC (http://gco.iarc.fr/today)</text></a>') ; 
		// $( svg_pattern ).append('<text width="200" height="10" class="copyright" text-anchor="left" x="'+x+'" y="'+(y+25)+'" style="font-size: 11px;">World Health Organization</text>') ; 
		
		
	} , 1000 );
}

/**
* Get extension for jQuey (get query strings var)
* @param() 
*/ 
$.extend({
	getUrlVars: function(){
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for(var i = 0; i < hashes.length; i++)
	{
	  hash = hashes[i].split('=');
	  vars.push(hash[0]);
	  vars[hash[0]] = hash[1];
	}
		return vars;
	},
	getUrlVar: function(name){
		return $.getUrlVars()[name];
	}
});


/**
* Prepare printing graph 
* @param (string) output extension pdf|png|svg
* @param (string) type of graph pie|map|bars ... 
* @param (string) scope of the svg 
* @param (string) button name
* @param (bool) embedding or not : if true, then don't the print engine won't print but generate a definitive html to embed
* @return ()
*/
function printGraph( type_ext , type_graph , scopeSVG , button , embed )
{		
	switch( type_ext )
	{
		// specific ccase svg, download nytimes svg-crobwar js method
		case 'svg' :  
			var e = document.createElement('script'); 
			e.setAttribute('src', '/today/js/svg-crowbar.js'); 
			e.setAttribute('class', 'svg-crowbar'); 
			document.body.appendChild(e);
			break ;

		// use phantom js generation 
		default : 
			
			var formName = 'form#formPrint' ; 


			$(formName + ' input[name="meta_title"]').val('Title of graph');
			$(formName + ' input[name="extension_from"]').val('html' );
			$(formName + ' input[name="extension_out"]').val(type_ext);
			$(formName + ' input[name="type_graph"]').val( type_graph );
			$(formName + ' input[name="location"]').val( window.location.href );
			
			if ( $(formName + ' input[name="svg_width"]').val() == '' && type_graph != 'table' ) 
			{
				$(formName + ' input[name="svg_width"]').val( $('svg').width() );
				$(formName + ' input[name="svg_height"]').val( $('svg').height() );
			}
			else if (type_graph == 'table')
			{
				$(formName + ' input[name="svg_width"]').val( $('#table-data').width() );
				$(formName + ' input[name="svg_height"]').val( $('#table-data').height() );
			}
			
			$(formName + ' textarea[name="table_data"]').val( $('#table-data').html() ) ; 

			if ( embed == true ) 
				$(formName + ' input[name="embed"]').val( 1 );
			else
				$(formName + ' input[name="embed"]').val( 0 );
			
			if ( type_graph == 'map') // map generation is longer due to bigger svg file
			{
				var block_i = $(button).children(); 

				// prevent from multi click
				if ( block_i.hasClass('fa-spin-custom') == true ) return ; 

				var txtSpinner = 'Please wait while generating the '+type_ext+' file' ; 
				$('#spinLoading span').text(txtSpinner);

				// overlay 
				$('.overlay').fadeIn() ; 

				// simulate close modal
				setTimeout( function(){
					$('.overlay').fadeOut() ; 
				}, 7000);


				// for map, wait for 0.5sec before get content + submit
				setTimeout( function(){
					var contentSVG = ( $(scopeSVG +' svg').prop('outerHTML') == undefined ) ? new XMLSerializer().serializeToString( $(scopeSVG +' svg')[0] ) : $(scopeSVG +' svg').prop('outerHTML') ; 
					$(formName + ' textarea[name="content"]').val( contentSVG );
					$(formName).submit(); 
				}, 500);

			}
			else if( type_graph == 'table' )
			{
				$(formName).submit(); 
			}
			else
			{
				// pie or bar or whatever : automatic submit + get outerHTML svg
				var contentSVG = ( $(scopeSVG +' svg').prop('outerHTML') == undefined ) ? new XMLSerializer().serializeToString( $(scopeSVG +' svg')[0] ) : $(scopeSVG +' svg').prop('outerHTML') ; 
				$(formName + ' textarea[name="content"]').val( contentSVG );
				$(formName).submit(); 
			}
			break ; 
	} // end switch
}

/**
* Function round proportion 
* @param (float) number to round
* @param (int) number of digit after point
* @return (float)
*/
function roundProportion( number , toFixed )
{
	if ( Math.abs( number) < 1 )
	{
		number = Math.round( number * 100 ) / 100 ; 
		return number.toFixed( 2 ) ; 
	}	
	else
	{
		number = Math.round( number * 10 ) / 10 ; 
		return number.toFixed( (toFixed == undefined ) ? 1 : toFixed  ) ; 
	}
}

/**
* Function convert json data for CSV download
* @param (array/oject) json data to convert
* @param (string) title of document
* @param (bool) show label of field
* @return (string) 
*/
function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    
    var CSV = '';    
    //Set Report title in first row or line
    
    // CSV += ReportTitle + '\r\n\n'; // remove title of csv

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";
        
        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {
            
            //Now convert each value to string and comma-seprated
            row += index + ',';
        }
        row = row.slice(0, -1);
        
        //append Label row with line break
        CSV += row + '\r\n';
    }
    
    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        
        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
        	var data = arrData[i][index] ; 
        	if ( typeof(data) == 'number' )
        	{
        		if ( data % 1 != 0 ) data = formatRate( data , 1 ) ; 
        	}
            row += '"' + data + '",';
        }
        row.slice(0, row.length - 1);
        
        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {        
        alert("Invalid data");
        return;
    }   
    
    //Generate a file name
    var fileName = "data";
    //this will remove the blank-spaces from the title and replace it with an underscore
    // fileName += ReportTitle.replace(/ /g,"_");   

    var browser = detectBrowser(); 

    if ( browser.msie == true )
    {
    	// is internet Explorer
    	csvData = decodeURIComponent(CSV);

	    if(window.navigator.msSaveBlob){
	        var blob = new Blob([csvData],{ type: "application/csv;charset=UTF-8;"});
	        navigator.msSaveBlob(blob, fileName + ".csv");
	    }
    }
    else
    {
    	//Initialize file format you want csv or xls
	    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
	    
	    // Now the little tricky part.
	    // you can use either>> window.open(uri);
	    // but this will not work in some browsers
	    // or you will not get the correct file extension    
	    
	    //this trick will generate a temp <a /> tag
	    var link = document.createElement("a");    
	    link.href = uri;
	    
	    //set the visibility hidden so it will not effect on your web-layout
	    link.style = "visibility:hidden";
	    link.download = fileName + ".csv";
	    
	    //this part will append the anchor tag and remove it after automatic click
	    document.body.appendChild(link);
	    link.click();
	    document.body.removeChild(link);
    }
    
}

/**
* Function getting brower informations
* @param (no param)
* @return (object) 
*/

function detectBrowser() {
  	var uagent = navigator.userAgent.toLowerCase(),
      match = '';
   	
   	var _browser = {} ; 

  	_browser.chrome  = /webkit/.test(uagent)  && /chrome/.test(uagent) && !/edge/.test(uagent);
  	_browser.firefox = /mozilla/.test(uagent) && /firefox/.test(uagent);
  	_browser.msie    = /msie/.test(uagent) || /trident/.test(uagent) || /edge/.test(uagent);
  	_browser.safari  = /safari/.test(uagent)  && /applewebkit/.test(uagent) && !/chrome/.test(uagent);
  	_browser.opr     = /mozilla/.test(uagent) && /applewebkit/.test(uagent) &&  /chrome/.test(uagent) && /safari/.test(uagent) && /opr/.test(uagent);
  	_browser.version = '';
    
  	for (x in _browser) {
    	if (_browser[x]) {
	      	// microsoft is "special"
	      	match = uagent.match(new RegExp("(" + (x === "msie" ? "msie|edge" : x) + ")( |\/)([0-9]+)"));
	      
		    if (match) {
		       _browser.version = match[3];
		    } else {
		       match = uagent.match(new RegExp("rv:([0-9]+)"));
		       _browser.version = match ? match[1] : "";
		    }
	            
	      	$("#browserResult").append("<br/>The browser is <b>" + (x === "opr" ? "Opera" : x) +
	        "</b> v. <b>" + (_browser.version ? _browser.version : "N/A") + "</b>");
	      	break;
    	}
  	}
  	_browser.opera = _browser.opr;
  	return _browser ; 
}

function upperRound( value )
{
  if ( value < 1 ) return 1 ; 
  if ( value < 10 ) return Math.ceil(value) ; 

  var val_string  = Math.round(value).toString() ; 
  var nb_zeros    = val_string.length - 1 ; 
  
  var rest = '1' ; 
  var base = val_string[0].toString() ; 

  var new_max = value ; 

  for ( var i = 1 ; i <= nb_zeros ; i++ ) 
  {
    rest += 0 ; 
    base += 0 ; 
  }

  if ( value < 1000000 ) 
  {
    new_max = ( int(base) + int(rest) );
  }
  else if ( value > 10000000)
  {
  	var first_number = (int(val_string[0]) ) .toString() ;  
    var second_number = int(val_string[1]) .toString() ; 

    new_max = first_number + second_number ; 
    for ( var i = 1 ; i <= ( int(nb_zeros) - 1 ); i++ ) new_max += 0 ; 

    new_max = parseFloat(new_max) + 500000 ; 
  }
  else
  {
    var first_number = (int(val_string[0]) + 1) .toString() ;  
    var second_number = int(val_string[1]) ; 

    if ( second_number < 5 )
    {
      for ( var i = 1 ; i <= int(nb_zeros) ; i++ ) first_number += 0 ; 
      new_max = first_number ;
      new_max -= 500000 ; 
    } 
    else
    {
      for ( var i = 1 ; i <= int(nb_zeros) ; i++ ) first_number += 0 ; 
      new_max = first_number ;
    }
  }

  // console.info( value , base , int(value) , nb_zeros , new_max ) ; 

  return parseFloat(new_max) ; 
}

function int( val ){
  return Math.abs( val ) ; 
}

function round( val ){
  return Math.round( val ) ;
}

function shortenCancer(label_cancer,id_cancer,extra){
	if ( int(id_cancer) == 26 ) return 'NHL' ; 
		/*if ( extra == true )
			return label_cancer+' (NHL)' ; 
		else*/
	else if ( int(id_cancer) == 23 )
		if ( extra == true )
			return label_cancer+' (CNS)' ; 
		else
			return 'CNS' ; 
	else
		return label_cancer ; 
}

function shortenContinent(label_continent,id_continent,extra)
{
	if ( int(id_continent) == 962 ) return 'LAC' ; 
	return label_continent ; 
}

var dummyConsole = [];
var console = console || {};
if (!console.log) {
    console.log = function (message) {
        dummyConsole.push(message);
    }
}

function formatNum( val )
{	
	if ( val == undefined ) 
		return "[error]"; 
	else
	{		
		if ( typeof( VAL_ROUNDED ) != 'undefined' ) 
		{
			if ( Math.abs( val ) == 0 ) return 0 ; 
			
			if ( VAL_ROUNDED != undefined && VAL_ROUNDED == true )
			{
				// val rounded 
				val 	= Math.round( val ) ; 
			    
			    var ln 	= val.toString().length ; 

			    if ( ln > 2 )
			    {
				    var first_number = 2 ; 

				    // divide number into 2 sub values
				    var first = val.toString().substr( 0 , first_number ) ;
				    var last  = val.toString().substr( first_number, ln ) ;
				    var first_rounded = last.substr( 0 , 1 ) ; 

				    var end_of_number = 0 ; 
				    for ( var j = 0 ; j < (last.length-1) ; j++ ) end_of_number += '0'; 

				    // if first number rounded is upper to 5, then the 2 first number ar 
				    if ( first_rounded >= 5 ) first++ ; 

				    val = first.toString() + end_of_number.toString() ; 

				    // console.info( val , last.length , first , end_of_number ); 

				}
				else
				{
					 
				}
			}
		}
		
		return val.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1\xa0") ; 
	}
}
