//clinvar = 'https://raw.githubusercontent.com/suncycles/esm-portal/main/public/files/clinvar.csv.gz'
//iso = 'https://media.githubusercontent.com/media/suncycles/esm-portal/main/public/files/isoform_list.csv'
//llr = 'https://media.githubusercontent.com/media/suncycles/esm-portal/main/public/files/ALL_hum_isoforms_ESM1b_LLR.zip'

primaryLLR = d3.csv("https://raw.githubusercontent.com/suncycles/esm-portal/main/public/files/A2RU49_LLR.csv", function(data){ processData(data) } );
// primaryLLR = "https://raw.githubusercontent.com/suncycles/esm-portal/main/public/files/A2RU49_LLR.csv"

var uniprotId = "UniprotID"
var data = []; // element 1+
var xAxis = []; // element 0
var yAxis = ['W','F','Y','P','M','I','L','V','A','G','C','S','T','Q','N','D','E','H','R','K'];

function processData(LLR) {
    data = [];
    xAxis = [];
    console.log(LLR);
    for (let position = 0; position < LLR.length; position++) {
        let row_temp = [];
        let kv_pairs = Object.entries(LLR[position]);
        if (position === 0) {
            // Populate xAxis only once
            xAxis = kv_pairs.map(pair => pair[0]);
        }
        for (let score = 0; score < kv_pairs.length; score++) {
            row_temp.push(parseFloat(kv_pairs[score][1])); // Ensure the values are floats
        }
        data.push(row_temp);
    }

    console.log(data);
    console.log(xAxis);

    var selectorOptions = {
        buttons: [{
            step: 'all',
        }],
    };

    var layout = {
        dragmode: 'pan',
        xaxis: {
            title: uniprotId,
            rangeselector: selectorOptions,
            rangeslider: {},
            type: 'category',
            range: [0,xAxis.length/4] 
        },
        yaxis: {
            fixedrange: true
        },
        scrollZoom: true
    };

    var plot = [
        {
            x: xAxis,
            y: yAxis,
            z: data,
            type: 'heatmap',
            colorscale: 'Viridis'
        }
    ];
    Plotly.newPlot('MYPLOT', plot, layout);
    Plotly.restyle('MYPLOT', {
        hovertemplate: [
            [
                "<b>%{x}</b>",
                "<b>%{y}</b>",
                "(%{z:.2f})"
            ].join('<br>') + '<extra></extra>'
        ]
    });
    
}

function searchPosition(ele) {
    //if(event.keyCode == 13) {
        var index;
        index = parseInt(ele.value);
        
        if (index > -1 && index < xAxis.length + 10) {
            var update = {
                'xaxis.range': [index-15, index+15] // Adjust range to highlight the position
            };
            Plotly.relayout('MYPLOT', update);
        }
    //}
}

function highlightPosition(ele) {
    console.log('something here:'  + ele);
    var index;
    index = parseFloat(ele.value);
    var layout = {
        shapes:[
            {
                // x-reference is assigned to the x-values
                xref: 'xAxis',
                // y-reference is assigned to the plot paper [0,1]
                yref: 'yAxis',
                x0: index-.5,
                y0: -0.5,
                x1: index+.5,
                y1: 19.5,
                //fillcolor: '#ff0000',
                type : 'rect',
                opacity: 0.5,
                line: {
                    color: '#ff0000',
                    width: 5
                }
            }
        ],

    }
    Plotly.relayout('MYPLOT', layout);
}