// const viewerInstance = new PDBeMolstarPlugin();

// let selectionData = [];

// const highlightcolors = [
//   yellow = {r: 253, g: 255, b: 0},
//   orange = {r: 255, g: 154, b: 0},
//   green = {r: 0, g: 255 , b: 4},
//   blue = {r: 0, g: 197, b: 255},
//   red = {r: 255, g: 0, b: 167},
//  ];
// let colorselector = highlightcolors[0];

// function addSingleResidue(asymId, residueNumber, color) {
//     selectionData.push({ struct_asym_id: asymId, residue_number: residueNumber, color: color });
// }

// function arrayToColoring(colorMap) {
//     for (let i = 0; i < colorMap.length; i++) {
//         addSingleResidue('A', i, colorMap[i]);
//     }
// }
// // pre defined colors
// function colorSecondaryStruct() {
//   const cells = Array.from(viewerInstance.plugin.state.data.cells.values());
//   const polymerComponents = cells.filter(c => c.transform.tags?.includes('structure-component-static-polymer'));
//   for (const component of polymerComponents) {
//       const polymerRepresentations = viewerInstance.plugin.state.data.tree.children.get(component.transform.ref);
//       for (const repr of polymerRepresentations) {
//           viewerInstance.plugin.build().to(repr).update({ colorTheme: { name: 'secondary-structure', params: {} } }).commit();
//       }
//   }
//   viewerInstance.events.loadComplete.subscribe(colorSecondaryStruct);
// }
// function colorHydrophobicity(){
//   const cells = Array.from(viewerInstance.plugin.state.data.cells.values());
//   const polymerComponents = cells.filter(c => c.transform.tags?.includes('structure-component-static-polymer'));
//   for (const component of polymerComponents) {
//       const polymerRepresentations = viewerInstance.plugin.state.data.tree.children.get(component.transform.ref);
//       for (const repr of polymerRepresentations) {
//           viewerInstance.plugin.build().to(repr).update({ colorTheme: { name: 'hydrophobicity', params: {} } }).commit();
//       }
//   }
//   viewerInstance.events.loadComplete.subscribe(colorHydrophobicity);
// }
// function colorAccessible(){
//   const cells = Array.from(viewerInstance.plugin.state.data.cells.values());
//   const polymerComponents = cells.filter(c => c.transform.tags?.includes('structure-component-static-polymer'));
//   for (const component of polymerComponents) {
//       const polymerRepresentations = viewerInstance.plugin.state.data.tree.children.get(component.transform.ref);
//       for (const repr of polymerRepresentations) {
//           viewerInstance.plugin.build().to(repr).update({ colorTheme: { name: 'accessible-surface-area', params: {} } }).commit();
//         }
//   }
//   viewerInstance.events.loadComplete.subscribe(colorAccessible);
// }
// function colorConfidence(){
//   viewerInstance.visual.reset({theme:true});
//   viewerInstance.events.loadComplete.subscribe(colorConfidence);
// }
// // custom coloring
// function colorCustom(){
//   arrayToColoring(colorTemp);

//   viewerInstance.visual.select({
//     data: selectionData,
//     nonSelectedColor: '#ffffff',
//   });
// }

// function loadMoleculeRepresentation(){
//   const cells = Array.from(viewerInstance.plugin.state.data.cells.values());
//   const polymerComponents = cells.filter(c => c.transform.tags?.includes('structure-component-static-polymer'));
//   for (const component of polymerComponents) {
//       const polymerRepresentations = viewerInstance.plugin.state.data.tree.children.get(component.transform.ref);
//       for (const repr of polymerRepresentations) {
//         viewerInstance.plugin.build().to(repr).update({ type: {name: 'molecular-surface', params:{} } }).commit();
//       }
//   }
//   viewerInstance.events.loadComplete.subscribe(loadMoleculeRepresentation);

// }

// function updateViewer(inputValue) {
//   const options = {
//     // DATA
//     customData: {
//       url: 'https://alphafold.ebi.ac.uk/files/AF-' + inputValue + '-F1-model_v1.cif',
//       format: 'cif',
//     },
//     alphafoldView: true,
//     // APPEARANCE
//     //visualStyle: 'default', // cartoon | ball-and-stick | carbohydrate | ellipsoid | gaussian-surface | molecular-surface | point | putty | spacefill
//     bgColor: { r: 255, g: 255, b: 255 },
//     highlightColor: '#ffff00',
//     selectColor: '#77bbff',
//     lighting: 'matte', // flat | matte | glossy | metallic | plastic
//     //quickStyles: 'Default',
//     granularity: 'residueInstances',
//     // INTERFACE
//     hideControls: true,
//     sequencePanel: true,
//     pdbeLink: true,
//     loadingOverlay: true,
//     expanded: false,
//     landscape: true,
//     reactive: false,
//   };

//   const viewerContainer = document.getElementById('myViewer');

//   viewerInstance.render(viewerContainer, options);
// // mouse events
//   document.addEventListener('PDB.molstar.mouseover', (e) => {
//     var inputElement = document.createElement('input');
//     inputElement.type = 'text';
//     inputElement.value = e.eventData.residueNumber;
//     //console.log('Moused over at ' + e.eventData.residueNumber);
//     highlightPosition(inputElement);
//   });

//   document.addEventListener('PDB.molstar.click', (e) => { 
//     // onclick show table and other info about scores and stuff
//     var inputElement = document.createElement('input');
//     inputElement.type = 'text';
//     inputElement.value = e.eventData.residueNumber;
//    //console.log('Clicked at ' + e.eventData.residueNumber)
//     searchPosition(inputElement);
//     highlightPosition(inputElement);
//   });
// }
// function searchViewer(index) {
//   viewerInstance.visual.focus([{ 
//       struct_asym_id: 'A', 
//       start_residue_number: index, 
//       end_residue_number: index 
//   }])

//   viewerInstance.visual.select({ 
//     data: [{ 
//         struct_asym_id: 'A', 
//         start_residue_number: index, 
//         end_residue_number: index, 
//         color: colorselector, 
//         focus: false }] 
//   })
// }
// function highlightViewer(index) {
//   viewerInstance.visual.highlight({ 
//     data: [{ 
//         struct_asym_id: 'A', 
//         start_residue_number: index, 
//         end_residue_number: index 
//     }], 
//     color: { r: 255, g: 255, b: 0} 
//   })
// }

// Import the PDBeMolstarPlugin (assuming it's an external library)
const viewerInstance = new PDBeMolstarPlugin();

let selectionData = [];

const highlightColors = [
  { r: 253, g: 255, b: 0 },   // Yellow
  { r: 255, g: 154, b: 0 },   // Orange
  { r: 0, g: 255, b: 4 },     // Green
  { r: 0, g: 197, b: 255 },   // Blue
  { r: 255, g: 0, b: 167 }    // Red
];
let colorSelector = highlightColors[0]; // Default color

// Add a single residue to the selection data
function addSingleResidue(asymId, residueNumber, color) {
  selectionData.push({ struct_asym_id: asymId, residue_number: residueNumber, color: color });
}

// Convert an array of colors and add them as residues
function arrayToColoring(colorMap) {
  for (let i = 0; i < colorMap.length; i++) {
    addSingleResidue('A', i, colorMap[i]);
  }
}

// Predefined coloring schemes
function applyColorScheme(colorTheme) {
  const cells = Array.from(viewerInstance.plugin.state.data.cells.values());
  const polymerComponents = cells.filter(c => c.transform.tags?.includes('structure-component-static-polymer'));
  for (const component of polymerComponents) {
    const polymerRepresentations = viewerInstance.plugin.state.data.tree.children.get(component.transform.ref);
    for (const repr of polymerRepresentations) {
      viewerInstance.plugin.build().to(repr).update({ colorTheme: { name: colorTheme, params: {} } }).commit();
    }
  }
}

// Color functions based on specific themes
export function colorSecondaryStruct() {
  applyColorScheme('secondary-structure');
}

export function colorHydrophobicity() {
  applyColorScheme('hydrophobicity');
}

export function colorAccessible() {
  applyColorScheme('accessible-surface-area');
}

export function colorConfidence() {
  viewerInstance.visual.reset({ theme: true });
}

// Custom coloring function
export function colorCustom() {
  arrayToColoring(colorTemp);

  viewerInstance.visual.select({
    data: selectionData,
    nonSelectedColor: '#ffffff'
  });
}

// Change the molecular representation
export function loadMoleculeRepresentation() {
  const cells = Array.from(viewerInstance.plugin.state.data.cells.values());
  const polymerComponents = cells.filter(c => c.transform.tags?.includes('structure-component-static-polymer'));
  for (const component of polymerComponents) {
    const polymerRepresentations = viewerInstance.plugin.state.data.tree.children.get(component.transform.ref);
    for (const repr of polymerRepresentations) {
      viewerInstance.plugin.build().to(repr).update({ type: { name: 'molecular-surface', params: {} } }).commit();
    }
  }
}

// Initialize the viewer
export function updateViewer(inputValue) {
  const options = {
    customData: {
      url: `https://alphafold.ebi.ac.uk/files/AF-${inputValue}-F1-model_v1.cif`,
      format: 'cif'
    },
    alphafoldView: true,
    bgColor: { r: 255, g: 255, b: 255 },
    highlightColor: '#ffff00',
    selectColor: '#77bbff',
    lighting: 'matte',
    granularity: 'residueInstances',
    hideControls: true,
    sequencePanel: true,
    pdbeLink: true,
    loadingOverlay: true,
    expanded: false,
    landscape: true,
    reactive: false
  };

  const viewerContainer = document.getElementById('myViewer');
  viewerInstance.render(viewerContainer, options);

  // Mouse events
  document.addEventListener('PDB.molstar.mouseover', (e) => {
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = e.eventData.residueNumber;
    highlightPosition(inputElement);
  });

  document.addEventListener('PDB.molstar.click', (e) => {
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = e.eventData.residueNumber;
    searchPosition(inputElement);
    highlightPosition(inputElement);
  });
}

// Search and highlight functions
export function searchViewer(index) {
  viewerInstance.visual.focus({
    struct_asym_id: 'A',
    start_residue_number: index,
    end_residue_number: index
  });

  viewerInstance.visual.select({
    data: [{ struct_asym_id: 'A', start_residue_number: index, end_residue_number: index, color: colorSelector, focus: false }]
  });
}

export function highlightViewer(index) {
  viewerInstance.visual.highlight({
    data: [{ struct_asym_id: 'A', start_residue_number: index, end_residue_number: index }],
    color: { r: 255, g: 255, b: 0 }
  });
}

// Export helper functions
export {
  addSingleResidue,
  arrayToColoring
};
