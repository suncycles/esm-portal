import { loadLLRData } from './data-process.js';
import { plotHeatmap } from './plotly-manager.js';
import { handlePlotClick } from './event-manager.js';

const uniprotId = 'UniprotID';
const averages = [];
const xAxis = [];
const yAxis = ['W','F','Y','P','M','I','L','V','A','G','C','S','T','Q','N','D','E','H','R','K'];

const LLR_URL = "https://raw.githubusercontent.com/suncycles/esm-portal/main/public/files/A2RU49_LLR.csv";

// Load data and render the heatmap
loadLLRData(LLR_URL, xAxis, yAxis, averages, (processedData) => {
    const myPlot = plotHeatmap(xAxis, yAxis, processedData, uniprotId);
    handlePlotClick(myPlot);
});
