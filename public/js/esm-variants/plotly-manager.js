import * as Plotly from 'https://cdn.plot.ly/plotly-2.35.2.min.js';

export function plotHeatmap(xAxis, yAxis, data, uniprotId) {
    const myPlot = document.getElementById('MYPLOT');

    const plotData = [
        {
            x: xAxis,
            y: yAxis,
            z: data,
            type: 'heatmap',
            colorscale: 'Viridis',
            reversescale: true,
        }
    ];

    const layout = {
        dragmode: 'pan',
        xaxis: {
            title: uniprotId,
            rangeselector: { buttons: [{ step: 'all' }] },
            rangeslider: {},
            type: 'category',
            range: [0, xAxis.length / 4]
        },
        yaxis: {
            fixedrange: true
        },
        scrollZoom: true
    };

    Plotly.newPlot(myPlot, plotData, layout);

    return myPlot;
}

export function updateHeatmapRange(index, xAxisLength) {
    const update = {
        'xaxis.range': [index - 50, index + 50]
    };

    Plotly.relayout('MYPLOT', update);
}

export function highlightColumn(index) {
    const layout = {
        shapes: [
            {
                xref: 'xAxis',
                yref: 'yAxis',
                x0: index - 0.5,
                y0: -0.5,
                x1: index + 0.5,
                y1: 19.5,
                type: 'rect',
                opacity: 0.5,
                line: {
                    color: '#ff0000',
                    width: 5
                }
            }
        ]
    };

    Plotly.relayout('MYPLOT', layout);
}
