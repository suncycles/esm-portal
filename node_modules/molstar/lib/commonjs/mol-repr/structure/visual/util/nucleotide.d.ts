/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Unit, ResidueIndex, ElementIndex } from '../../../../mol-model/structure';
import { Loci } from '../../../../mol-model/loci';
import { Interval } from '../../../../mol-data/int';
import { LocationIterator } from '../../../../mol-geo/util/location-iterator';
import { PickingId } from '../../../../mol-geo/geometry/picking';
import { StructureGroup } from './common';
export declare namespace NucleotideLocationIterator {
    function fromGroup(structureGroup: StructureGroup): LocationIterator;
}
export declare function getNucleotideElementLoci(pickingId: PickingId, structureGroup: StructureGroup, id: number): Loci;
/**
 * Mark a nucleotide element (e.g. part of a cartoon block)
 * - mark only when all its residue's elements are in a loci
 */
export declare function eachNucleotideElement(loci: Loci, structureGroup: StructureGroup, apply: (interval: Interval) => boolean): boolean;
export declare function getNucleotideBaseType(unit: Unit.Atomic, residueIndex: ResidueIndex): {
    isPurine: boolean;
    isPyrimidine: boolean;
};
export declare function createNucleicIndices(): {
    trace: -1 | ElementIndex;
    N1: -1 | ElementIndex;
    C2: -1 | ElementIndex;
    N3: -1 | ElementIndex;
    C4: -1 | ElementIndex;
    C5: -1 | ElementIndex;
    C6: -1 | ElementIndex;
    N7: -1 | ElementIndex;
    C8: -1 | ElementIndex;
    N9: -1 | ElementIndex;
    C1_1: -1 | ElementIndex;
    C2_1: -1 | ElementIndex;
    C3_1: -1 | ElementIndex;
    C4_1: -1 | ElementIndex;
    O4_1: -1 | ElementIndex;
};
export type NucleicIndices = ReturnType<typeof createNucleicIndices>;
export declare function setPurinIndices(idx: NucleicIndices, unit: Unit.Atomic, residueIndex: ResidueIndex): {
    trace: -1 | ElementIndex;
    N1: -1 | ElementIndex;
    C2: -1 | ElementIndex;
    N3: -1 | ElementIndex;
    C4: -1 | ElementIndex;
    C5: -1 | ElementIndex;
    C6: -1 | ElementIndex;
    N7: -1 | ElementIndex;
    C8: -1 | ElementIndex;
    N9: -1 | ElementIndex;
    C1_1: -1 | ElementIndex;
    C2_1: -1 | ElementIndex;
    C3_1: -1 | ElementIndex;
    C4_1: -1 | ElementIndex;
    O4_1: -1 | ElementIndex;
};
export declare function hasPurinIndices(idx: NucleicIndices): idx is NucleicIndices & {
    trace: ElementIndex;
    N1: ElementIndex;
    C2: ElementIndex;
    N3: ElementIndex;
    C4: ElementIndex;
    C5: ElementIndex;
    C6: ElementIndex;
    N7: ElementIndex;
    C8: ElementIndex;
    N9: ElementIndex;
};
export declare function setPyrimidineIndices(idx: NucleicIndices, unit: Unit.Atomic, residueIndex: ResidueIndex): {
    trace: -1 | ElementIndex;
    N1: -1 | ElementIndex;
    C2: -1 | ElementIndex;
    N3: -1 | ElementIndex;
    C4: -1 | ElementIndex;
    C5: -1 | ElementIndex;
    C6: -1 | ElementIndex;
    N7: -1 | ElementIndex;
    C8: -1 | ElementIndex;
    N9: -1 | ElementIndex;
    C1_1: -1 | ElementIndex;
    C2_1: -1 | ElementIndex;
    C3_1: -1 | ElementIndex;
    C4_1: -1 | ElementIndex;
    O4_1: -1 | ElementIndex;
};
export declare function hasPyrimidineIndices(idx: NucleicIndices): idx is NucleicIndices & {
    trace: ElementIndex;
    N1: ElementIndex;
    C2: ElementIndex;
    N3: ElementIndex;
    C4: ElementIndex;
    C5: ElementIndex;
    C6: ElementIndex;
};
export declare function setSugarIndices(idx: NucleicIndices, unit: Unit.Atomic, residueIndex: ResidueIndex): {
    trace: -1 | ElementIndex;
    N1: -1 | ElementIndex;
    C2: -1 | ElementIndex;
    N3: -1 | ElementIndex;
    C4: -1 | ElementIndex;
    C5: -1 | ElementIndex;
    C6: -1 | ElementIndex;
    N7: -1 | ElementIndex;
    C8: -1 | ElementIndex;
    N9: -1 | ElementIndex;
    C1_1: -1 | ElementIndex;
    C2_1: -1 | ElementIndex;
    C3_1: -1 | ElementIndex;
    C4_1: -1 | ElementIndex;
    O4_1: -1 | ElementIndex;
};
export declare function hasSugarIndices(idx: NucleicIndices): idx is NucleicIndices & {
    trace: ElementIndex;
    C1_1: ElementIndex;
    C2_1: ElementIndex;
    C3_1: ElementIndex;
    C4_1: ElementIndex;
    O4_1: ElementIndex;
};
