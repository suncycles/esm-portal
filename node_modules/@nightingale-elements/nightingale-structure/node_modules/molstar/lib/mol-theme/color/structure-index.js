/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { Color } from '../../mol-util/color';
import { StructureElement, Bond, Structure } from '../../mol-model/structure';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { getPaletteParams, getPalette } from '../../mol-util/color/palette';
import { ColorThemeCategory } from './categories';
var DefaultColor = Color(0xCCCCCC);
var Description = 'Gives every structure a unique color based on its index.';
export var StructureIndexColorThemeParams = __assign({}, getPaletteParams({ type: 'colors', colorList: 'many-distinct' }));
export function getStructureIndexColorThemeParams(ctx) {
    return PD.clone(StructureIndexColorThemeParams);
}
export function StructureIndexColorTheme(ctx, props) {
    var _a;
    var color;
    var legend;
    if (ctx.structure) {
        var size = ((_a = Structure.MaxIndex.get(ctx.structure).value) !== null && _a !== void 0 ? _a : -1) + 1;
        var palette_1 = getPalette(size, props);
        legend = palette_1.legend;
        color = function (location) {
            if (StructureElement.Location.is(location)) {
                return palette_1.color(Structure.Index.get(location.structure).value || 0);
            }
            else if (Bond.isLocation(location)) {
                return palette_1.color(Structure.Index.get(location.aStructure).value || 0);
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
export var StructureIndexColorThemeProvider = {
    name: 'structure-index',
    label: 'Structure Index',
    category: ColorThemeCategory.Chain,
    factory: StructureIndexColorTheme,
    getParams: getStructureIndexColorThemeParams,
    defaultValues: PD.getDefaultValues(StructureIndexColorThemeParams),
    isApplicable: function (ctx) { return !!ctx.structure && ctx.structure.elementCount > 0; }
};
