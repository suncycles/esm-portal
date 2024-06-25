"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureIndexColorThemeProvider = exports.StructureIndexColorTheme = exports.getStructureIndexColorThemeParams = exports.StructureIndexColorThemeParams = void 0;
var tslib_1 = require("tslib");
var color_1 = require("../../mol-util/color");
var structure_1 = require("../../mol-model/structure");
var param_definition_1 = require("../../mol-util/param-definition");
var palette_1 = require("../../mol-util/color/palette");
var categories_1 = require("./categories");
var DefaultColor = (0, color_1.Color)(0xCCCCCC);
var Description = 'Gives every structure a unique color based on its index.';
exports.StructureIndexColorThemeParams = tslib_1.__assign({}, (0, palette_1.getPaletteParams)({ type: 'colors', colorList: 'many-distinct' }));
function getStructureIndexColorThemeParams(ctx) {
    return param_definition_1.ParamDefinition.clone(exports.StructureIndexColorThemeParams);
}
exports.getStructureIndexColorThemeParams = getStructureIndexColorThemeParams;
function StructureIndexColorTheme(ctx, props) {
    var _a;
    var color;
    var legend;
    if (ctx.structure) {
        var size = ((_a = structure_1.Structure.MaxIndex.get(ctx.structure).value) !== null && _a !== void 0 ? _a : -1) + 1;
        var palette_2 = (0, palette_1.getPalette)(size, props);
        legend = palette_2.legend;
        color = function (location) {
            if (structure_1.StructureElement.Location.is(location)) {
                return palette_2.color(structure_1.Structure.Index.get(location.structure).value || 0);
            }
            else if (structure_1.Bond.isLocation(location)) {
                return palette_2.color(structure_1.Structure.Index.get(location.aStructure).value || 0);
            }
            return DefaultColor;
        };
    }
    else {
        color = function () { return DefaultColor; };
    }
    return {
        factory: StructureIndexColorTheme,
        granularity: 'instance',
        color: color,
        props: props,
        description: Description,
        legend: legend
    };
}
exports.StructureIndexColorTheme = StructureIndexColorTheme;
exports.StructureIndexColorThemeProvider = {
    name: 'structure-index',
    label: 'Structure Index',
    category: categories_1.ColorThemeCategory.Chain,
    factory: StructureIndexColorTheme,
    getParams: getStructureIndexColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.StructureIndexColorThemeParams),
    isApplicable: function (ctx) { return !!ctx.structure && ctx.structure.elementCount > 0; }
};
