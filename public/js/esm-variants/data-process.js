import * as d3 from 'https://d3js.org/d3.v5.js';

export function processData(LLR, xAxis, yAxis, averages) {
    let data = [];
    
    for (let position = 0; position < LLR.length; position++) {
        let row_temp = [];
        let kv_pairs = Object.entries(LLR[position]);
        
        if (position === 0) {
            xAxis.push(...kv_pairs.map(pair => pair[0]));
        }

        for (let score = 0; score < kv_pairs.length; score++) {
            row_temp.push(parseFloat(kv_pairs[score][1]));
        }

        data.push(row_temp);
    }

    data.reverse();

    data.forEach(row => {
        let sum = row.reduce((acc, val) => acc + val, 0);
        averages.push(sum);
    });

    return data;
}

export function loadLLRData(url, xAxis, yAxis, averages, callback) {
    d3.csvParse("https://raw.githubusercontent.com/suncycles/esm-portal/main/public/files/A2RU49_LLR.csv", function(data) {
        const processedData = processData(data, xAxis, yAxis, averages);
        callback(processedData);
    });
}
