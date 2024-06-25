
async function fetchPDBIds(uniprotId) {
  const url = `https://www.ebi.ac.uk/proteins/api/proteins/${uniprotId}`;

  try {
    fetch(url)
    .then((res) => {
        if (!res.ok) {
            throw new Error
                (`HTTP error! Status: ${res.status}`);
        }
        return res.json();
    })
    .then((data) => {
      // Features -> Possible Structures: Strand, Helix, TUrn
      console.log("Features:", data.features);

      // Further data processing or use here
  })
          
    .catch((error) => 
           console.error("Unable to fetch data:", error));
}
  catch (err) {
    console.log("Error accessing");
  }
}



function updateViewer(inputValue) {

  const viewerInstance = new PDBeMolstarPlugin();
  const options = {
      // DATA
      //moleculeId: inputValue,
      alphafoldView: true,
      customData: {
        url: 'https://alphafold.ebi.ac.uk/files/AF-'+inputValue+'-F1-model_v1.cif',
        format: 'cif',
        binary: false,
      },
      // assemblyId: '1',
      // defaultPreset: 'default', // default | unitcell | all-models |supercell
      // ligandView: { label_comp_id: 'REA' },
      // selection: {
      //   data: [
      //     {
      //       struct_asym_id: 'A',
      //       start_residue_number: 1,
      //       end_residue_number: 20,
      //       color: '#ffff00',
      //     },
      //   ],
      //   nonSelectedColor: '#ddccbb',
      // },

      // APPEARANCE
      visualStyle: 'cartoon', // cartoon | ball-and-stick | carbohydrate | ellipsoid | gaussian-surface | molecular-surface | point | putty | spacefill
      // hideStructure: ['het', 'water'],
      // loadMaps: true,
      // mapSettings: { '2fo-fc': { opacity: 0.8, wireframe: true } },
      highlightColor: '#ffff00',
      selectColor: '#77bbff',
      lighting: 'matte', // flat | matte | glossy | metallic | plastic

      // BEHAVIOR
      // validationAnnotation: true,
      // domainAnnotation: true,
      // symmetryAnnotation: true,
      // pdbeUrl: 'https://www.ebi.ac.uk/pdbe/',
      // encoding: 'cif', // cif | bcif
      // lowPrecisionCoords: true,
      // selectInteraction: false,
      // granularity: 'chain', // element | residue | chain | entity | model | operator | structure | elementInstances | residueInstances | chainInstances
      // subscribeEvents: true,

      // INTERFACE
      hideControls: false,
      sequencePanel: true,
      pdbeLink: true,
      loadingOverlay: true,
      expanded: false,
      landscape: true,
      reactive: true,
  };

  const viewerContainer = document.getElementById('myViewer');

  viewerInstance.render(viewerContainer, options);

  document.addEventListener('PDB.molstar.mouseover', (e) => {

    console.log('Moused over at' + e.eventData.residueNumber);
    //idk which one is the 
    //console.log(e.eventData.auth_seq_id);
    //log the residue number as it's moused over
    //next, sync a tracker bar with heat map
});

  document.addEventListener('PDB.molstar.click', (e) => { 
    //on click, let the tracker bar lock onto postion
      console.log('Clicked at' + e.eventData.residueNumber)
  });
}