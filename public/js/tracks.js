import chroma from 'https://unpkg.com/chroma-js@3.0.0/index.js';
let dataframe = [];
let colorTemp = [];

function parse(tsvString) {
    const columns = [];
  
    const rows = tsvString.trim().split('\n');
  
    rows.forEach(row => {
        const values = row.split('\t');
    
        values.forEach((value, index) => {
            if (!columns[index]) {
                columns[index] = [];
            }
            columns[index].push(value);
        });
    });

    return columns;
}

export function generateColors(arr){
  const uniques = [...new Set(arr)];
  uniques.sort((a, b) => a - b); // Sort numerically
  const numColors = uniques.length;
  const colors = chroma.scale('Viridis')
      .colors(numColors);
  
  const colorMap = uniques.reduce((map, entry, index) => {
    map[entry] = colors[index];
    return map;
  }, {});
  colorTemp = colorMap;
  return colorMap;
}

export async function loadTrack(arrays) {
  const traces = [];
  const annotations = [];
  var title;

  arrays.forEach((data, rowIndex) => {
      title = data[0];
      console.log(title);
      const actualData = data.slice(1); // Remove the title from the data array

      // Generate a unique color map for the actual data
      const colorMap = generateColors(actualData);
      const uniqueEntries = [...new Set(actualData)];
      const numericData = actualData.map(entry => uniqueEntries.indexOf(entry));

      // Define the color scale for Plotly
      const colorscale = uniqueEntries.map((entry, idx) => {
          const color = colorMap[entry];
          return [idx / (uniqueEntries.length - 1), color];
      });

      // Prepare text for hover (including x-values)
      const hoverText = actualData.map((entry, idx) => `x: ${idx + 1}<br>Value: ${entry}`);

      // Create the heatmap trace for each data array
      traces.push({
          z: [numericData], // Single row heatmap
          type: 'heatmap',
          colorscale: colorscale,
          showscale: false, // Hide the color scale legend
          zmin: 0,
          zmax: uniqueEntries.length - 1,
          text: [hoverText], // Tooltip with original string data and x-value
          hoverinfo: 'text',
          xaxis: `x${rowIndex + 1}`, // Different x-axis for each subplot
          yaxis: `y${rowIndex + 1}`, // Different y-axis for each subplot
          name: title // Assign the title to the subplot
      });
  });

  // Set up the layout for the subplots
  const layout = {
      //dragmode:'pan',
      grid: {
          rows: arrays.length,  // Number of rows based on the number of datasets
          columns: 1,           // Single column
          pattern: 'independent' // Independent axes for each subplot
      },
      yaxis: {
          visible: false, 
          showgrid: false,
          zeroline: false,
          title: title 
      },
      xaxis: {
          showgrid: false, 
          zeroline: false,
      },
      height: 90 * arrays.length,  // Adjust height based on the number of subplots
      margin: {
          l: 50,  
          t: 50,  // Increased margin top to make room for titles
      }
  };

  for (let i = 0; i < arrays.length; i++) {
    layout[`yaxis${i + 1}`] = {
      visible: false, 
      showgrid: false,
      zeroline: false,
    };
  }

  var myPlot = document.getElementById('tracks');
  Plotly.newPlot('tracks', traces, layout);

  myPlot.on('plotly_click', function(data){
      var clickCol = data.points[0].pointIndex[1];
      var inputElement = document.createElement('input');
      inputElement.type = 'text';
      inputElement.value = clickCol;
      searchPosition(inputElement);
      highlightPosition(inputElement);
      highlightTrack(inputElement);
  });
}

export async function createTracks(id) {
  const geneName = await getGene(id);
  const data = await fetchFromG2p(geneName, id);

  dataframe = parse(data); // df holds the entire csv

  loadTrack([dataframe[3], dataframe[6], dataframe[7], dataframe[10], dataframe[42], dataframe[43]]);
}

function highlightTrack(ele) {
  var index;
  index = parseFloat(ele.value);
  var layout = {
      shapes:[
          {
              xref: 'xAxis',
              yref: 'yAxis',
              x0: index-.5,
              y0: -0.5,
              x1: index+.5,
              y1: 19.5,
              type : 'rect',
              opacity: 0.5,
              line: {
                  color: '#ffffff',
                  width: 1
              }
          }
      ],

  }
  Plotly.relayout('tracks', layout);
  highlightViewer(index);
  
}

