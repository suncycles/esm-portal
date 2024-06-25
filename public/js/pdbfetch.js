async function fetchPDBIds(uniprotId) {
    const url = `https://www.uniprot.org/uniprot/${uniprotId}.xml`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'application/xml');

        // Extract PDB IDs
        const pdbReferences = xmlDoc.querySelectorAll('dbReference[type="PDB"]');
        const pdbIds = Array.from(pdbReferences).map(ref => ref.getAttribute('id'));

        console.log('PDB IDs:', pdbIds);
        return pdbIds;
    } catch (error) {
        console.error('Failed to fetch PDB IDs:', error);
    }
}