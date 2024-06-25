/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { StateTransforms } from '../transforms';
import { DataFormatProvider } from './provider';
export var TopologyFormatCategory = 'Topology';
export { PsfProvider };
var PsfProvider = DataFormatProvider({
    label: 'PSF',
    description: 'PSF',
    category: TopologyFormatCategory,
    stringExtensions: ['psf'],
    parse: function (plugin, data) { return __awaiter(void 0, void 0, void 0, function () {
        var format, topology;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    format = plugin.state.data.build()
                        .to(data)
                        .apply(StateTransforms.Data.ParsePsf, {}, { state: { isGhost: true } });
                    topology = format.apply(StateTransforms.Model.TopologyFromPsf);
                    return [4 /*yield*/, format.commit()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { format: format.selector, topology: topology.selector }];
            }
        });
    }); }
});
export { PrmtopProvider };
var PrmtopProvider = DataFormatProvider({
    label: 'PRMTOP',
    description: 'PRMTOP',
    category: TopologyFormatCategory,
    stringExtensions: ['prmtop', 'parm7'],
    parse: function (plugin, data) { return __awaiter(void 0, void 0, void 0, function () {
        var format, topology;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    format = plugin.state.data.build()
                        .to(data)
                        .apply(StateTransforms.Data.ParsePrmtop, {}, { state: { isGhost: true } });
                    topology = format.apply(StateTransforms.Model.TopologyFromPrmtop);
                    return [4 /*yield*/, format.commit()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { format: format.selector, topology: topology.selector }];
            }
        });
    }); }
});
export { TopProvider };
var TopProvider = DataFormatProvider({
    label: 'TOP',
    description: 'TOP',
    category: TopologyFormatCategory,
    stringExtensions: ['top'],
    parse: function (plugin, data) { return __awaiter(void 0, void 0, void 0, function () {
        var format, topology;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    format = plugin.state.data.build()
                        .to(data)
                        .apply(StateTransforms.Data.ParseTop, {}, { state: { isGhost: true } });
                    topology = format.apply(StateTransforms.Model.TopologyFromTop);
                    return [4 /*yield*/, format.commit()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { format: format.selector, topology: topology.selector }];
            }
        });
    }); }
});
export var BuiltInTopologyFormats = [
    ['psf', PsfProvider],
    ['prmtop', PrmtopProvider],
    ['top', TopProvider],
];
