import { highlightColumn } from './plotly-manager.js';
import { searchViewer, highlightViewer } from '../viewer.js'; // Assuming viewerManager contains these functions

export function handlePlotClick(myPlot) {
    myPlot.on('plotly_click', function(data) {
        const clickCol = data.points[0].pointIndex[1];
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.value = clickCol;
        
        // Custom handling
        searchPosition(inputElement);
        highlightPosition(inputElement);
    });
}

export function searchPosition(ele) {
    const index = parseInt(ele.value);
    displayColumnInfo(index);

    if (index > -1) {
        updateHeatmapRange(index, xAxis.length + 10); // Imported from plotManager
    }

    searchViewer(index); // Imported from viewerManager
}

export function highlightPosition(ele) {
    const index = parseFloat(ele.value);
    highlightColumn(index); // Imported from plotManager
    highlightViewer(index); // Imported from viewerManager
}

function displayColumnInfo(pos) {
    console.log('Displaying column info for position:', pos);
}
