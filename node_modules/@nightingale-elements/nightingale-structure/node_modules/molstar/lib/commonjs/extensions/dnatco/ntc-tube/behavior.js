"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NtCTubeSegmentLabel = exports.NtCTubePreset = void 0;
var tslib_1 = require("tslib");
var color_1 = require("./color");
var property_1 = require("./property");
var representation_1 = require("./representation");
var property_2 = require("../property");
var representation_preset_1 = require("../../../mol-plugin-state/builder/structure/representation-preset");
var mol_state_1 = require("../../../mol-state");
var mol_task_1 = require("../../../mol-task");
exports.NtCTubePreset = (0, representation_preset_1.StructureRepresentationPresetProvider)({
    id: 'preset-structure-representation-ntc-tube',
    display: {
        name: 'NtC Tube', group: 'Annotation',
        description: 'NtC Tube',
    },
    isApplicable: function (a) {
        return a.data.models.length >= 1 && a.data.models.some(function (m) { return property_2.Dnatco.isApplicable(m); });
    },
    params: function () { return representation_preset_1.StructureRepresentationPresetProvider.CommonParams; },
    apply: function (ref, params, plugin) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var structureCell, model, _b, components, representations, tube, _c, update, builder, typeParams, tubeRepr;
            var _this = this;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        structureCell = mol_state_1.StateObjectRef.resolveAndCheck(plugin.state.data, ref);
                        model = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data.model;
                        if (!structureCell || !model)
                            return [2 /*return*/, {}];
                        return [4 /*yield*/, plugin.runTask(mol_task_1.Task.create('NtC tube', function (runtime) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, property_1.NtCTubeProvider.attach({ runtime: runtime, assetManager: plugin.managers.asset }, model)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, representation_preset_1.PresetStructureRepresentations.auto.apply(ref, tslib_1.__assign({}, params), plugin)];
                    case 2:
                        _b = _d.sent(), components = _b.components, representations = _b.representations;
                        return [4 /*yield*/, plugin.builders.structure.tryCreateComponentStatic(structureCell, 'nucleic', { label: 'NtC Tube' })];
                    case 3:
                        tube = _d.sent();
                        _c = representation_preset_1.StructureRepresentationPresetProvider.reprBuilder(plugin, params), update = _c.update, builder = _c.builder, typeParams = _c.typeParams;
                        if (representations)
                            tubeRepr = builder.buildRepresentation(update, tube, { type: representation_1.NtCTubeRepresentationProvider, typeParams: typeParams, color: color_1.NtCTubeColorThemeProvider }, { tag: 'ntc-tube' });
                        return [4 /*yield*/, update.commit({ revertOnError: true })];
                    case 4:
                        _d.sent();
                        return [2 /*return*/, { components: tslib_1.__assign(tslib_1.__assign({}, components), { tube: tube }), representations: tslib_1.__assign(tslib_1.__assign({}, representations), { tubeRepr: tubeRepr }) }];
                }
            });
        });
    }
});
function NtCTubeSegmentLabel(step) {
    return "\n        <b>".concat(step.auth_asym_id_1, "</b> |\n        <b>").concat(step.label_comp_id_1, " ").concat(step.auth_seq_id_1).concat(step.PDB_ins_code_1).concat(step.label_alt_id_1.length > 0 ? " (alt ".concat(step.label_alt_id_1, ")") : '', "\n           ").concat(step.label_comp_id_2, " ").concat(step.auth_seq_id_2).concat(step.PDB_ins_code_2).concat(step.label_alt_id_2.length > 0 ? " (alt ".concat(step.label_alt_id_2, ")") : '', " </b><br />\n        <i>NtC:</i> ").concat(step.NtC, " | <i>Confal score:</i> ").concat(step.confal_score, " | <i>RMSD:</i> ").concat(step.rmsd.toFixed(2), "\n    ");
}
exports.NtCTubeSegmentLabel = NtCTubeSegmentLabel;
