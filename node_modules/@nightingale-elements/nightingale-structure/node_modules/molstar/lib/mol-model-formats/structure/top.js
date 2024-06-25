/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { Column, Table } from '../../mol-data/db';
import { getMoleculeType } from '../../mol-model/structure/model/types';
import { Topology } from '../../mol-model/structure/topology/topology';
import { Task } from '../../mol-task';
import { BasicSchema, createBasic } from './basic/schema';
import { ComponentBuilder } from './common/component';
import { EntityBuilder } from './common/entity';
import { getChainId } from './common/util';
import { guessElementSymbolString } from './util';
function getBasic(top) {
    var molecules = top.molecules, compounds = top.compounds;
    var singleResidue = {};
    var atomCount = 0;
    for (var i = 0, il = molecules._rowCount; i < il; ++i) {
        var mol = molecules.compound.value(i);
        var count = molecules.molCount.value(i);
        var atoms = compounds[mol].atoms;
        Column.asArrayColumn(atoms.atom);
        Column.asArrayColumn(atoms.resnr);
        Column.asArrayColumn(atoms.residu);
        atomCount += count * atoms._rowCount;
        var prevResnr = atoms.resnr.value(0);
        singleResidue[mol] = true;
        for (var j = 1, jl = atoms._rowCount; j < jl; ++j) {
            var resnr = atoms.resnr.value(j);
            if (resnr !== prevResnr) {
                singleResidue[mol] = false;
                break;
            }
            prevResnr = resnr;
        }
    }
    //
    var atomNames = new Array(atomCount);
    var residueIds = new Uint32Array(atomCount);
    var residueNames = new Array(atomCount);
    var k = 0;
    for (var i = 0, il = molecules._rowCount; i < il; ++i) {
        var mol = molecules.compound.value(i);
        var count = molecules.molCount.value(i);
        var atoms = compounds[mol].atoms;
        var isSingleResidue = singleResidue[mol];
        for (var j = 0; j < count; ++j) {
            for (var l = 0, ll = atoms._rowCount; l < ll; ++l) {
                atomNames[k] = atoms.atom.value(l);
                residueIds[k] = atoms.resnr.value(l);
                residueNames[k] = atoms.residu.value(l);
                if (isSingleResidue)
                    residueIds[k] += j;
                k += 1;
            }
        }
    }
    var atomName = Column.ofStringArray(atomNames);
    var residueId = Column.ofIntArray(residueIds);
    var residueName = Column.ofStringArray(residueNames);
    //
    var entityIds = new Array(atomCount);
    var asymIds = new Array(atomCount);
    var seqIds = new Uint32Array(atomCount);
    var ids = new Uint32Array(atomCount);
    var entityBuilder = new EntityBuilder();
    var componentBuilder = new ComponentBuilder(residueId, atomName);
    var currentEntityId = '';
    var currentAsymIndex = 0;
    var currentAsymId = '';
    var currentSeqId = 0;
    var prevMoleculeType = 0 /* MoleculeType.Unknown */;
    var prevResidueNumber = -1;
    for (var i = 0, il = atomCount; i < il; ++i) {
        var residueNumber = residueId.value(i);
        if (residueNumber !== prevResidueNumber) {
            var compId = residueName.value(i);
            var moleculeType = getMoleculeType(componentBuilder.add(compId, i).type, compId);
            if (moleculeType !== prevMoleculeType) {
                currentAsymId = getChainId(currentAsymIndex);
                currentAsymIndex += 1;
                currentSeqId = 0;
            }
            currentEntityId = entityBuilder.getEntityId(compId, moleculeType, currentAsymId);
            currentSeqId += 1;
            prevResidueNumber = residueNumber;
            prevMoleculeType = moleculeType;
        }
        entityIds[i] = currentEntityId;
        asymIds[i] = currentAsymId;
        seqIds[i] = currentSeqId;
        ids[i] = i;
    }
    var id = Column.ofIntArray(ids);
    var asym_id = Column.ofStringArray(asymIds);
    //
    var type_symbol = new Array(atomCount);
    for (var i = 0; i < atomCount; ++i) {
        type_symbol[i] = guessElementSymbolString(atomName.value(i), residueName.value(i));
    }
    var atom_site = Table.ofPartialColumns(BasicSchema.atom_site, {
        auth_asym_id: asym_id,
        auth_atom_id: Column.asArrayColumn(atomName),
        auth_comp_id: residueName,
        auth_seq_id: residueId,
        id: Column.asArrayColumn(id),
        label_asym_id: asym_id,
        label_atom_id: Column.asArrayColumn(atomName),
        label_comp_id: residueName,
        label_seq_id: Column.ofIntArray(seqIds),
        label_entity_id: Column.ofStringArray(entityIds),
        occupancy: Column.ofConst(1, atomCount, Column.Schema.float),
        type_symbol: Column.ofStringArray(type_symbol),
        pdbx_PDB_model_num: Column.ofConst(1, atomCount, Column.Schema.int),
    }, atomCount);
    var basic = createBasic({
        entity: entityBuilder.getEntityTable(),
        chem_comp: componentBuilder.getChemCompTable(),
        atom_site: atom_site
    });
    return basic;
}
function getBonds(top) {
    var molecules = top.molecules, compounds = top.compounds;
    var indexA = [];
    var indexB = [];
    var atomOffset = 0;
    for (var i = 0, il = molecules._rowCount; i < il; ++i) {
        var mol = molecules.compound.value(i);
        var count = molecules.molCount.value(i);
        var _a = compounds[mol], atoms = _a.atoms, bonds = _a.bonds;
        if (bonds) {
            for (var j = 0; j < count; ++j) {
                for (var l = 0, ll = bonds._rowCount; l < ll; ++l) {
                    indexA.push(bonds.ai.value(l) - 1 + atomOffset);
                    indexB.push(bonds.aj.value(l) - 1 + atomOffset);
                }
                atomOffset += atoms._rowCount;
            }
        }
        else if (mol === 'TIP3') {
            for (var j = 0; j < count; ++j) {
                indexA.push(0 + atomOffset);
                indexB.push(1 + atomOffset);
                indexA.push(0 + atomOffset);
                indexB.push(2 + atomOffset);
                atomOffset += atoms._rowCount;
            }
        }
        else {
            atomOffset += count * atoms._rowCount;
        }
    }
    return {
        indexA: Column.ofIntArray(indexA),
        indexB: Column.ofIntArray(indexB),
        order: Column.ofConst(1, indexA.length, Column.Schema.int)
    };
}
//
export { TopFormat };
var TopFormat;
(function (TopFormat) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'top';
    }
    TopFormat.is = is;
    function fromTop(top) {
        return { kind: 'top', name: top.system || 'TOP', data: top };
    }
    TopFormat.fromTop = fromTop;
})(TopFormat || (TopFormat = {}));
export function topologyFromTop(top) {
    var _this = this;
    return Task.create('Parse TOP', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
        var format, basic, bonds;
        return __generator(this, function (_a) {
            format = TopFormat.fromTop(top);
            basic = getBasic(top);
            bonds = getBonds(top);
            return [2 /*return*/, Topology.create(top.system || 'TOP', basic, bonds, format)];
        });
    }); });
}
