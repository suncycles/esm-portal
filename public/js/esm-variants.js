//clinvar = 'https://raw.githubusercontent.com/suncycles/esm-portal/main/public/files/clinvar.csv.gz'
//iso = 'https://media.githubusercontent.com/media/suncycles/esm-portal/main/public/files/isoform_list.csv'
//llr = 'https://media.githubusercontent.com/media/suncycles/esm-portal/main/public/files/ALL_hum_isoforms_ESM1b_LLR.zip'

primaryLLR = d3.csv("https://raw.githubusercontent.com/suncycles/esm-portal/main/public/files/A2RU49_LLR.csv", function(data){ processData(data) } );
// primaryLLR = "https://raw.githubusercontent.com/suncycles/esm-portal/main/public/files/A2RU49_LLR.csv"

var data = [];

function processData(LLR) {
    data = [];

    console.log(LLR);
    for(let position = 0; position < LLR.length; position++) {
        row_temp = [];
        //start on 2nd row
        for(let score = 1; score < Object.keys(LLR[position]).length; score++) {
            let kv_pairs = Object.entries(LLR[position]);
            
            row_temp.push(kv_pairs[score][1]);
        }
        data.push(row_temp);
    }

    console.log(data);
    var plot = [
        {
          z: data,
          type: 'heatmap'
        }
      ];
    
      Plotly.newPlot('MYPLOT', plot);
    
}
