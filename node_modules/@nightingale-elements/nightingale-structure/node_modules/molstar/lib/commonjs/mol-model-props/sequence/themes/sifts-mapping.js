"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIFTSMappingColorThemeProvider = exports.SIFTSMappingColorTheme = exports.getSIFTSMappingColorThemeParams = exports.SIFTSMappingColorThemeParams = void 0;
var tslib_1 = require("tslib");
var structure_1 = require("../../../mol-model/structure");
var color_1 = require("../../../mol-theme/color");
var color_2 = require("../../../mol-util/color");
var palette_1 = require("../../../mol-util/color/palette");
var param_definition_1 = require("../../../mol-util/param-definition");
var sifts_mapping_1 = require("../sifts-mapping");
var DefaultColor = (0, color_2.Color)(0xFAFAFA);
var Description = 'Assigns a color based on SIFTS mapping.';
// same colors for same accessions
var globalAccessionMap = new Map();
exports.SIFTSMappingColorThemeParams = tslib_1.__assign({}, (0, palette_1.getPaletteParams)({ type: 'colors', colorList: 'set-1' }));
function getSIFTSMappingColorThemeParams(ctx) {
    return exports.SIFTSMappingColorThemeParams; // TODO return copy
}
exports.getSIFTSMappingColorThemeParams = getSIFTSMappingColorThemeParams;
function SIFTSMappingColorTheme(ctx, props) {
    var color;
    if (ctx.structure) {
        for (var _i = 0, _a = ctx.structure.models; _i < _a.length; _i++) {
            var m = _a[_i];
            var mapping = sifts_mapping_1.SIFTSMapping.Provider.get(m).value;
            if (!mapping)
                continue;
            for (var _b = 0, _c = mapping.accession; _b < _c.length; _b++) {
                var acc = _c[_b];
                if (!acc || globalAccessionMap.has(acc))
                    continue;
                globalAccessionMap.set(acc, globalAccessionMap.size);
            }
        }
        var l_1 = structure_1.StructureElement.Location.create(ctx.structure);
        var palette_2 = (0, palette_1.getPalette)(globalAccessionMap.size + 1, props, { valueLabel: function (i) { return "".concat(i); } });
        var colorMap_1 = new Map();
        var getColor_1 = function (location) {
            var key = sifts_mapping_1.SIFTSMapping.getKey(location);
            if (!key)
                return DefaultColor;
            if (colorMap_1.has(key))
                return colorMap_1.get(key);
            var color = palette_2.color(globalAccessionMap.get(key));
            colorMap_1.set(key, color);
            return color;
        };
        color = function (location) {
            if (structure_1.StructureElement.Location.is(location) && structure_1.Unit.isAtomic(location.unit)) {
                return getColor_1(location);
            }
            else if (structure_1.Bond.isLocation(location)) {
                l_1.unit = location.aUnit;
                l_1.element = location.aUnit.elements[location.aIndex];
                return getColor_1(l_1);
            }
            return DefaultColor;
        };
    }
    else {
        color = function () { return DefaultColor; };
    }
    return {
        factory: SIFTSMappingColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color: color,
        props: props,
        description: Description,
    };
}
exports.SIFTSMappingColorTheme = SIFTSMappingColorTheme;
exports.SIFTSMappingColorThemeProvider = {
    name: 'sifts-mapping',
    label: 'SIFTS Mapping',
    category: color_1.ColorTheme.Category.Residue,
    factory: SIFTSMappingColorTheme,
    getParams: getSIFTSMappingColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.SIFTSMappingColorThemeParams),
    isApplicable: function (ctx) { var _a; return !!((_a = ctx.structure) === null || _a === void 0 ? void 0 : _a.models.some(function (m) { return sifts_mapping_1.SIFTSMapping.Provider.isApplicable(m); })); },
    ensureCustomProperties: {
        attach: function (ctx, data) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var _i, _a, m;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!data.structure)
                            return [2 /*return*/];
                        _i = 0, _a = data.structure.models;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        m = _a[_i];
                        return [4 /*yield*/, sifts_mapping_1.SIFTSMapping.Provider.attach(ctx, m, void 0, true)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); },
        detach: function (data) {
            if (!data.structure)
                return;
            for (var _i = 0, _a = data.structure.models; _i < _a.length; _i++) {
                var m = _a[_i];
                sifts_mapping_1.SIFTSMapping.Provider.ref(m, false);
            }
        }
    }
};
