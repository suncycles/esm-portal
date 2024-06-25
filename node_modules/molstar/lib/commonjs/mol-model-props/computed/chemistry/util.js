"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.eachResidueAtom = exports.eachBondedAtom = exports.eachIntraBondedAtom = exports.eachInterBondedAtom = exports.connectedTo = exports.interConnectedTo = exports.intraConnectedTo = exports.bondToElementCount = exports.bondCount = exports.intraBondCount = exports.interBondCount = exports.compId = exports.altLoc = exports.atomId = exports.formalCharge = exports.typeSymbol = void 0;
const types_1 = require("../../../mol-model/structure/model/types");
const int_1 = require("../../../mol-data/int");
function typeSymbol(unit, index) {
    return unit.model.atomicHierarchy.atoms.type_symbol.value(unit.elements[index]);
}
exports.typeSymbol = typeSymbol;
function formalCharge(unit, index) {
    return unit.model.atomicHierarchy.atoms.pdbx_formal_charge.value(unit.elements[index]);
}
exports.formalCharge = formalCharge;
function atomId(unit, index) {
    return unit.model.atomicHierarchy.atoms.label_atom_id.value(unit.elements[index]);
}
exports.atomId = atomId;
function altLoc(unit, index) {
    return unit.model.atomicHierarchy.atoms.label_alt_id.value(unit.elements[index]);
}
exports.altLoc = altLoc;
function compId(unit, index) {
    return unit.model.atomicHierarchy.atoms.label_comp_id.value(unit.elements[index]);
}
exports.compId = compId;
//
function interBondCount(structure, unit, index) {
    let count = 0;
    const indices = structure.interUnitBonds.getEdgeIndices(index, unit.id);
    for (let i = 0, il = indices.length; i < il; ++i) {
        const b = structure.interUnitBonds.edges[indices[i]];
        if (types_1.BondType.isCovalent(b.props.flag))
            count += 1;
    }
    return count;
}
exports.interBondCount = interBondCount;
function intraBondCount(unit, index) {
    let count = 0;
    const { offset, edgeProps: { flags } } = unit.bonds;
    for (let i = offset[index], il = offset[index + 1]; i < il; ++i) {
        if (types_1.BondType.isCovalent(flags[i]))
            count += 1;
    }
    return count;
}
exports.intraBondCount = intraBondCount;
function bondCount(structure, unit, index) {
    return interBondCount(structure, unit, index) + intraBondCount(unit, index);
}
exports.bondCount = bondCount;
function bondToElementCount(structure, unit, index, element) {
    let count = 0;
    eachBondedAtom(structure, unit, index, (unit, index) => {
        if (typeSymbol(unit, index) === element)
            count += 1;
    });
    return count;
}
exports.bondToElementCount = bondToElementCount;
//
function intraConnectedTo(unit, indexA, indexB) {
    const { offset, b, edgeProps: { flags } } = unit.bonds;
    types_1.BondType.is;
    for (let i = offset[indexA], il = offset[indexA + 1]; i < il; ++i) {
        if (b[i] === indexB && types_1.BondType.isCovalent(flags[i]))
            return true;
    }
    return false;
}
exports.intraConnectedTo = intraConnectedTo;
function interConnectedTo(structure, unitA, indexA, unitB, indexB) {
    const b = structure.interUnitBonds.getEdge(indexA, unitA.id, indexB, unitB.id);
    return b && types_1.BondType.isCovalent(b.props.flag);
}
exports.interConnectedTo = interConnectedTo;
function connectedTo(structure, unitA, indexA, unitB, indexB) {
    return unitA === unitB ? intraConnectedTo(unitA, indexA, indexB) : interConnectedTo(structure, unitA, indexA, unitB, indexB);
}
exports.connectedTo = connectedTo;
//
function eachInterBondedAtom(structure, unit, index, cb) {
    const indices = structure.interUnitBonds.getEdgeIndices(index, unit.id);
    for (let i = 0, il = indices.length; i < il; ++i) {
        const b = structure.interUnitBonds.edges[indices[i]];
        const uB = structure.unitMap.get(b.unitB);
        if (types_1.BondType.isCovalent(b.props.flag))
            cb(uB, b.indexB);
    }
}
exports.eachInterBondedAtom = eachInterBondedAtom;
function eachIntraBondedAtom(unit, index, cb) {
    const { offset, b, edgeProps: { flags } } = unit.bonds;
    for (let i = offset[index], il = offset[index + 1]; i < il; ++i) {
        if (types_1.BondType.isCovalent(flags[i]))
            cb(unit, b[i]);
    }
}
exports.eachIntraBondedAtom = eachIntraBondedAtom;
function eachBondedAtom(structure, unit, index, cb) {
    eachInterBondedAtom(structure, unit, index, cb);
    eachIntraBondedAtom(unit, index, cb);
}
exports.eachBondedAtom = eachBondedAtom;
//
function eachResidueAtom(unit, index, cb) {
    const { offsets } = unit.model.atomicHierarchy.residueAtomSegments;
    const rI = unit.getResidueIndex(index);
    for (let i = offsets[rI], il = offsets[rI + 1]; i < il; ++i) {
        // TODO optimize, avoid search with .indexOf
        const idx = int_1.SortedArray.indexOf(unit.elements, i);
        if (idx !== -1)
            cb(idx);
    }
}
exports.eachResidueAtom = eachResidueAtom;
