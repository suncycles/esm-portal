"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuiltInTopologyFormats = exports.TopProvider = exports.PrmtopProvider = exports.PsfProvider = exports.TopologyFormatCategory = void 0;
var tslib_1 = require("tslib");
var transforms_1 = require("../transforms");
var provider_1 = require("./provider");
exports.TopologyFormatCategory = 'Topology';
var PsfProvider = (0, provider_1.DataFormatProvider)({
    label: 'PSF',
    description: 'PSF',
    category: exports.TopologyFormatCategory,
    stringExtensions: ['psf'],
    parse: function (plugin, data) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var format, topology;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    format = plugin.state.data.build()
                        .to(data)
                        .apply(transforms_1.StateTransforms.Data.ParsePsf, {}, { state: { isGhost: true } });
                    topology = format.apply(transforms_1.StateTransforms.Model.TopologyFromPsf);
                    return [4 /*yield*/, format.commit()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { format: format.selector, topology: topology.selector }];
            }
        });
    }); }
});
exports.PsfProvider = PsfProvider;
var PrmtopProvider = (0, provider_1.DataFormatProvider)({
    label: 'PRMTOP',
    description: 'PRMTOP',
    category: exports.TopologyFormatCategory,
    stringExtensions: ['prmtop', 'parm7'],
    parse: function (plugin, data) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var format, topology;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    format = plugin.state.data.build()
                        .to(data)
                        .apply(transforms_1.StateTransforms.Data.ParsePrmtop, {}, { state: { isGhost: true } });
                    topology = format.apply(transforms_1.StateTransforms.Model.TopologyFromPrmtop);
                    return [4 /*yield*/, format.commit()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { format: format.selector, topology: topology.selector }];
            }
        });
    }); }
});
exports.PrmtopProvider = PrmtopProvider;
var TopProvider = (0, provider_1.DataFormatProvider)({
    label: 'TOP',
    description: 'TOP',
    category: exports.TopologyFormatCategory,
    stringExtensions: ['top'],
    parse: function (plugin, data) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var format, topology;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    format = plugin.state.data.build()
                        .to(data)
                        .apply(transforms_1.StateTransforms.Data.ParseTop, {}, { state: { isGhost: true } });
                    topology = format.apply(transforms_1.StateTransforms.Model.TopologyFromTop);
                    return [4 /*yield*/, format.commit()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { format: format.selector, topology: topology.selector }];
            }
        });
    }); }
});
exports.TopProvider = TopProvider;
exports.BuiltInTopologyFormats = [
    ['psf', PsfProvider],
    ['prmtop', PrmtopProvider],
    ['top', TopProvider],
];
