	
	var PROJECT 			= 'map' ; 

    let width_ = $(window).width() ; 
    let height_ = $(window).height() - 100 ; 

    width_ = 1200 ;

	var dataviz_conf = {
        'type'      : 'map' , 
        'title'     : false , 
        'width'     : width_  , 
        'height'    : height_  , 
        'container' : '#map-container',
        'id'        : 'map-graph' , 
        'data'      : {
            'format' : 'json',
            'src'    : [{ 'label' : 'Test' , 'value' : 10 },{ 'label' : 'Test' , 'value' : 10 }]
        },
        'chart' : {
            'scale' : undefined , 
            'translate' : null , 
            'key_data_value' : 'asr' , 
            'projection' : 'natural-earth' , 
            'legend_suffix' : '' , 
            'color_scale' : 'quantile' ,
            'background_globe' : '#fff', 
            'key_label_value' : 'ASR',
            'callback_click' : 'funcClickMap' , 
            'callback_mousehover' : 'funcHoverMap' , 
            'callback_mouseout' : 'funcOutMap' , 
            'copyright' : false , 
            'legend' : true , 
            legend_translate : {
                x : -10 , 
                y : 40 
            }
        }, 
        'downloads' : false 
     } ;

	const { createApp, ref , reactive, computed  } = Vue

    createApp({
        data(){
            return {
                metric : 'asr',
                var1 : 'variable one' ,
                lists : [{ message: 'Foo' }, { message: 'Bar' }] ,
                persons : [{ district : 'Kimie' , asr : 'pianist'}],
                dataset : [{ district : 'row1' , asr : 'value1'}], 
                oMap : {} 
            }
        },
        setup() {
          const message = ref('Tamil Nadu map') ; 
          return {
            message 
          }
        },
        
        mounted(){

            dataviz_conf.chart.key_data_value = this.metric ; 
            this.oMap = new CanChart( dataviz_conf ).render() ;
            // this.dataset = oMap.vizInstance.conf.chart.src ; 

            //data = this.dataset ; 
            this.persons.push( { district : "Suzie" , asr : "golfer" } )

            this.getData() ;
        },

        /*watch: {
            // whenever question changes, this function will run
            dataset(newDataset, oldDataset) {
                this.getData()
            }
        },*/

        methods: {
            async getData() {

                let csv = '../../tamil_nadu/data/tamil-nadu.csv' ;
                if ( document.location.hostname == 'localhost') csv = '../../data/tamil-nadu.csv' ;
                const fetch_csv = await fetch( csv ) 
                
                const tamil_csv = await fetch_csv.text();
                this.dataset = csvToJson( tamil_csv ) ; 
                // console.log( " tamil_csv " , this.dataset )

                this.sortData();
            },

            sortData : function(){
                this.dataset = this.dataset.sort((a,b)=>{
                    if ( a[this.metric] - b[this.metric] > 1)
                        return -1 ; 
                    else
                        return 1 ; 
                })
                .map( m => {
                    let word = m.district ; 
                    m.district = word.charAt(0) + word.substring(1).toLowerCase(); 
                    return m ; 
                })

                console.log("this.dataset",this.dataset) ; 
            },

            setKey : function() {
                // console.info( " metric " , this.metric ) ; 
                // this.oMap.reload( this.dataset , { key : this.metric }) ; 

                CanGraphCurrentKey  = this.metric ; 
                CanMapConf.chart.key_data_value = this.metric ;

                this.sortData(); 

                setMapColor( ( this.metric == 'asr' ) ? 'Blues' : 'Reds' );
                processUpdateData( this.dataset ) ; 

            }
        }

    }).mount('#app')

    var funcOutMap = function(){ return false ; }

    var csvToJson = function (csv) {
        // \n or \r\n depending on the EOL sequence

        const lines = csv.split('\n');
        const delimeter = ',';

        const result = [];

        const headers = lines[0].split(delimeter);

        for (const line of lines) {
            const obj = {};
            const row = line.split(delimeter);

            for (let i = 0; i < headers.length; i++) {
              const header = headers[i];
              obj[header] = row[i];
            }
            result.push(obj);
        }

        // Prettify output
        return result;
    }
