/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { OrderedSet, Segmentation } from '../../mol-data/int';
import { EmptyLoci } from '../../mol-model/loci';
import { StructureElement, StructureProperties } from '../../mol-model/structure';
var EmptyStepIndices = new Array();
export var DnatcoUtil;
(function (DnatcoUtil) {
    function copyResidue(r) {
        return r ? { index: r.index, start: r.start, end: r.end } : void 0;
    }
    DnatcoUtil.copyResidue = copyResidue;
    function getAtomIndex(loc, residue, names, altId, insCode) {
        for (var eI = residue.start; eI < residue.end; eI++) {
            loc.element = loc.unit.elements[eI];
            var elName = StructureProperties.atom.label_atom_id(loc);
            var elAltId = StructureProperties.atom.label_alt_id(loc);
            var elInsCode = StructureProperties.residue.pdbx_PDB_ins_code(loc);
            if (names.includes(elName) && (elAltId === altId || elAltId.length === 0) && (elInsCode === insCode))
                return loc.element;
        }
        return -1;
    }
    DnatcoUtil.getAtomIndex = getAtomIndex;
    function getStepIndices(data, loc, r) {
        loc.element = loc.unit.elements[r.start];
        var modelIdx = StructureProperties.unit.model_num(loc) - 1;
        var chainId = StructureProperties.chain.auth_asym_id(loc);
        var seqId = StructureProperties.residue.auth_seq_id(loc);
        var insCode = StructureProperties.residue.pdbx_PDB_ins_code(loc);
        var chains = data.mapping[modelIdx];
        if (!chains)
            return EmptyStepIndices;
        var residues = chains.get(chainId);
        if (!residues)
            return EmptyStepIndices;
        var indices = residues.get(seqId);
        if (!indices)
            return EmptyStepIndices;
        return insCode !== '' ? indices.filter(function (idx) { return data.steps[idx].PDB_ins_code_1 === insCode; }) : indices;
    }
    DnatcoUtil.getStepIndices = getStepIndices;
    function residueAltIds(structure, unit, residue) {
        var altIds = new Array();
        var loc = StructureElement.Location.create(structure, unit);
        for (var eI = residue.start; eI < residue.end; eI++) {
            loc.element = OrderedSet.getAt(unit.elements, eI);
            var altId = StructureProperties.atom.label_alt_id(loc);
            if (altId !== '' && !altIds.includes(altId))
                altIds.push(altId);
        }
        return altIds;
    }
    DnatcoUtil.residueAltIds = residueAltIds;
    var _loc = StructureElement.Location.create();
    function residueToLoci(asymId, seqId, altId, insCode, loci, source) {
        _loc.structure = loci.structure;
        var _loop_1 = function (e) {
            _loc.unit = e.unit;
            var getAsymId = source === 'label' ? StructureProperties.chain.label_asym_id : StructureProperties.chain.auth_asym_id;
            var getSeqId = source === 'label' ? StructureProperties.residue.label_seq_id : StructureProperties.residue.auth_seq_id;
            // Walk the entire unit and look for the requested residue
            var chainIt = Segmentation.transientSegments(e.unit.model.atomicHierarchy.chainAtomSegments, e.unit.elements);
            var residueIt = Segmentation.transientSegments(e.unit.model.atomicHierarchy.residueAtomSegments, e.unit.elements);
            var elemIndex = function (idx) { return OrderedSet.getAt(e.unit.elements, idx); };
            while (chainIt.hasNext) {
                var chain = chainIt.move();
                _loc.element = elemIndex(chain.start);
                var _asymId = getAsymId(_loc);
                if (_asymId !== asymId)
                    continue; // Wrong chain, skip it
                residueIt.setSegment(chain);
                while (residueIt.hasNext) {
                    var residue = residueIt.move();
                    _loc.element = elemIndex(residue.start);
                    var _seqId = getSeqId(_loc);
                    if (_seqId === seqId) {
                        var _insCode = StructureProperties.residue.pdbx_PDB_ins_code(_loc);
                        if (_insCode !== insCode)
                            continue;
                        if (altId) {
                            var _altIds = residueAltIds(loci.structure, e.unit, residue);
                            if (!_altIds.includes(altId))
                                continue;
                        }
                        var start = residue.start;
                        var end = residue.end;
                        return { value: StructureElement.Loci(loci.structure, [{ unit: e.unit, indices: OrderedSet.ofBounds(start, end) }]) };
                    }
                }
            }
        };
        for (var _i = 0, _a = loci.elements; _i < _a.length; _i++) {
            var e = _a[_i];
            var state_1 = _loop_1(e);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return EmptyLoci;
    }
    DnatcoUtil.residueToLoci = residueToLoci;
})(DnatcoUtil || (DnatcoUtil = {}));
