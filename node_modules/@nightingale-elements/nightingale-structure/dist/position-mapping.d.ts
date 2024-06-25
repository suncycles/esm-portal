export type Direction = "UP_PDB" | "PDB_UP";
export type Mapping = {
    entity_id: number;
    chain_id: string;
    unp_end: number;
    unp_start: number;
    struct_asym_id: string;
    start: {
        residue_number: number;
        author_insertion_code: string;
        author_residue_number: number;
    };
    end: {
        residue_number: number;
        author_insertion_code: string;
        author_residue_number: number;
    };
};
export declare class PositionMappingError extends Error {
}
export type TranslatedPosition = {
    start: number;
    end: number;
    entity: number;
    chain: string;
};
/**
 * Translate between UniProt and PDBe positions using SIFTs mappings
 * @function translatePositions
 * @param  {Number}     start            The start index for the sequence (1-based)
 * @param  {Number}     end              The end index for the sequence (1-based)
 * @param  {Mapping[]}   mappings         The array of mapping objects
 * @param  {String}     mappingDirection Indicates direction of maping: UniProt to PDB or PDB to UniProt
 * @return {Translated}                  Object with: mapped entity ID; mapped chain ID; translated start & end positions
 */
declare const translatePositions: (start: number, end: number, mappingDirection: Direction, mappings?: Mapping[]) => TranslatedPosition[];
export default translatePositions;
//# sourceMappingURL=position-mapping.d.ts.map