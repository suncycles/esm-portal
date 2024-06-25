/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
import { MmcifFormat } from '../../mol-model-formats/structure/mmcif';
import { CustomPropertyDescriptor } from '../../mol-model/custom-property';
import { CustomModelProperty } from '../common/custom-model-property';
export { SIFTSMapping as SIFTSMapping };
var SIFTSMapping;
(function (SIFTSMapping) {
    var _this = this;
    SIFTSMapping.Provider = CustomModelProperty.createProvider({
        label: 'SIFTS Mapping',
        descriptor: CustomPropertyDescriptor({
            name: 'sifts_sequence_mapping'
        }),
        type: 'static',
        defaultParams: {},
        getParams: function () { return ({}); },
        isApplicable: function (data) { return isAvailable(data); },
        obtain: function (ctx, data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { value: fromCif(data) }];
            });
        }); }
    });
    function isAvailable(model) {
        if (!MmcifFormat.is(model.sourceData))
            return false;
        var _a = model.sourceData.data.db.atom_site, db_name = _a.pdbx_sifts_xref_db_name, db_acc = _a.pdbx_sifts_xref_db_acc, db_num = _a.pdbx_sifts_xref_db_num, db_res = _a.pdbx_sifts_xref_db_res;
        return db_name.isDefined && db_acc.isDefined && db_num.isDefined && db_res.isDefined;
    }
    SIFTSMapping.isAvailable = isAvailable;
    function getKey(loc) {
        var model = loc.unit.model;
        var data = SIFTSMapping.Provider.get(model).value;
        if (!data)
            return '';
        var eI = loc.unit.elements[loc.element];
        var rI = model.atomicHierarchy.residueAtomSegments.index[eI];
        return data.accession[rI];
    }
    SIFTSMapping.getKey = getKey;
    function getLabel(loc) {
        var model = loc.unit.model;
        var data = SIFTSMapping.Provider.get(model).value;
        if (!data)
            return;
        var eI = loc.unit.elements[loc.element];
        var rI = model.atomicHierarchy.residueAtomSegments.index[eI];
        var dbName = data.dbName[rI];
        if (!dbName)
            return;
        return "".concat(dbName, " ").concat(data.accession[rI], " ").concat(data.num[rI], " ").concat(data.residue[rI]);
    }
    SIFTSMapping.getLabel = getLabel;
    function fromCif(model) {
        if (!MmcifFormat.is(model.sourceData))
            return;
        var _a = model.sourceData.data.db.atom_site, db_name = _a.pdbx_sifts_xref_db_name, db_acc = _a.pdbx_sifts_xref_db_acc, db_num = _a.pdbx_sifts_xref_db_num, db_res = _a.pdbx_sifts_xref_db_res;
        if (!db_name.isDefined || !db_acc.isDefined || !db_num.isDefined || !db_res.isDefined)
            return;
        var atomSourceIndex = model.atomicHierarchy.atomSourceIndex;
        var _b = model.atomicHierarchy.residueAtomSegments, count = _b.count, residueOffsets = _b.offsets;
        var dbName = new Array(count);
        var accession = new Array(count);
        var num = new Array(count);
        var residue = new Array(count);
        for (var i = 0; i < count; i++) {
            var row = atomSourceIndex.value(residueOffsets[i]);
            if (db_name.valueKind(row) !== 0 /* Column.ValueKinds.Present */) {
                dbName[i] = '';
                accession[i] = '';
                num[i] = '';
                residue[i] = '';
                continue;
            }
            dbName[i] = db_name.value(row);
            accession[i] = db_acc.value(row);
            num[i] = db_num.value(row);
            residue[i] = db_res.value(row);
        }
        return { dbName: dbName, accession: accession, num: num, residue: residue };
    }
})(SIFTSMapping || (SIFTSMapping = {}));
