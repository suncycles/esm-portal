
async function getGene(uniprotId) {
    try {
      const url = `https://rest.uniprot.org/uniprotkb/${uniprotId}.json`;
      
      const response = await axios.get(url);
  
        if(response.data.genes[0].geneName.value!=="") {
            return response.data.genes[0].geneName.value;
        }
    } catch (error) {
      console.error('Error retrieving gene name for ${uniprotId}:', error);
    }
}
  
async function fetchFromG2p(geneName, uniprotId) {
    const url = '/api/'+geneName+'/protein/'+uniprotId+'/protein-features';
    
    const response = await axios.get(url,{
        method: 'GET',
        withCredentials:false
    })
    .catch(function (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
        console.log(error.config);
    });
    //console.log(response.data);
    return response.data;
      
}