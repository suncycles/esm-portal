/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { Color } from '../../mol-util/color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { getPaletteParams, getPalette } from '../../mol-util/color/palette';
import { Volume } from '../../mol-model/volume/volume';
import { ColorThemeCategory } from './categories';
var DefaultColor = Color(0xCCCCCC);
var Description = 'Gives every volume segment a unique color.';
export var VolumeSegmentColorThemeParams = __assign({}, getPaletteParams({ type: 'colors', colorList: 'many-distinct' }));
export function getVolumeSegmentColorThemeParams(ctx) {
    return PD.clone(VolumeSegmentColorThemeParams);
}
export function VolumeSegmentColorTheme(ctx, props) {
    var color;
    var legend;
    var segmentation = ctx.volume && Volume.Segmentation.get(ctx.volume);
    if (segmentation) {
        var size = segmentation.segments.size;
        var segments_1 = Array.from(segmentation.segments.keys());
        var palette_1 = getPalette(size, props);
        legend = palette_1.legend;
        color = function (location) {
            if (Volume.Segment.isLocation(location)) {
                return palette_1.color(segments_1.indexOf(location.segment));
            }
            return DefaultColor;
        };
    }
    else {
        color = function () { return DefaultColor; };
    }
    return {
        factory: VolumeSegmentColorTheme,
        granularity: 'instance',
        color: color,
        props: props,
        description: Description,
        legend: legend
    };
}
export var VolumeSegmentColorThemeProvider = {
    name: 'volume-segment',
    label: 'Volume Segment',
    category: ColorThemeCategory.Misc,
    factory: VolumeSegmentColorTheme,
    getParams: getVolumeSegmentColorThemeParams,
    defaultValues: PD.getDefaultValues(VolumeSegmentColorThemeParams),
    isApplicable: function (ctx) { return !!ctx.volume && !!Volume.Segmentation.get(ctx.volume); }
};
