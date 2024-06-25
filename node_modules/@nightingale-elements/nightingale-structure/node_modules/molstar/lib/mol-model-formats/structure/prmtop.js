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
function getBasic(prmtop) {
    var pointers = prmtop.pointers, residuePointer = prmtop.residuePointer, residueLabel = prmtop.residueLabel, atomName = prmtop.atomName;
    var atomCount = pointers.NATOM;
    var residueCount = pointers.NRES;
    //
    var residueIds = new Uint32Array(atomCount);
    var residueNames = [];
    var addResidue = function (i, from, to) {
        var rn = residueLabel.value(i);
        for (var j = from, jl = to; j < jl; ++j) {
            residueIds[j] = i + 1;
            residueNames[j] = rn;
        }
    };
    for (var i = 0, il = residueCount - 1; i < il; ++i) {
        addResidue(i, residuePointer.value(i) - 1, residuePointer.value(i + 1) - 1);
    }
    addResidue(residueCount - 1, residuePointer.value(residueCount - 1) - 1, atomCount);
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
//
export { PrmtopFormat };
var PrmtopFormat;
(function (PrmtopFormat) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'prmtop';
    }
    PrmtopFormat.is = is;
    function fromPrmtop(prmtop) {
        return { kind: 'prmtop', name: prmtop.title.join(' ') || 'PRMTOP', data: prmtop };
    }
    PrmtopFormat.fromPrmtop = fromPrmtop;
})(PrmtopFormat || (PrmtopFormat = {}));
export function topologyFromPrmtop(prmtop) {
    var _this = this;
    return Task.create('Parse PRMTOP', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
        var format, basic, _a, NBONH, NBONA, bondsIncHydrogen, bondsWithoutHydrogen, bondCount, bonds;
        return __generator(this, function (_b) {
            format = PrmtopFormat.fromPrmtop(prmtop);
            basic = getBasic(prmtop);
            _a = prmtop.pointers, NBONH = _a.NBONH, NBONA = _a.NBONA, bondsIncHydrogen = prmtop.bondsIncHydrogen, bondsWithoutHydrogen = prmtop.bondsWithoutHydrogen;
            bondCount = NBONH + NBONA;
            bonds = {
                indexA: Column.ofLambda({
                    value: function (row) {
                        return row < NBONH
                            ? bondsIncHydrogen.value(row * 3) / 3
                            : bondsWithoutHydrogen.value((row - NBONH) * 3) / 3;
                    },
                    rowCount: bondCount,
                    schema: Column.Schema.int,
                }),
                indexB: Column.ofLambda({
                    value: function (row) {
                        return row < NBONH
                            ? bondsIncHydrogen.value(row * 3 + 1) / 3
                            : bondsWithoutHydrogen.value((row - NBONH) * 3 + 1) / 3;
                    },
                    rowCount: bondCount,
                    schema: Column.Schema.int,
                }),
                order: Column.ofConst(1, bondCount, Column.Schema.int)
            };
            return [2 /*return*/, Topology.create(prmtop.title.join(' ') || 'PRMTOP', basic, bonds, format)];
        });
    }); });
}
