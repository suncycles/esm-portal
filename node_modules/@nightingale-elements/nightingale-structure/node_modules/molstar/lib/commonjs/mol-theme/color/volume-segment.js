"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeSegmentColorThemeProvider = exports.VolumeSegmentColorTheme = exports.getVolumeSegmentColorThemeParams = exports.VolumeSegmentColorThemeParams = void 0;
var tslib_1 = require("tslib");
var color_1 = require("../../mol-util/color");
var param_definition_1 = require("../../mol-util/param-definition");
var palette_1 = require("../../mol-util/color/palette");
var volume_1 = require("../../mol-model/volume/volume");
var categories_1 = require("./categories");
var DefaultColor = (0, color_1.Color)(0xCCCCCC);
var Description = 'Gives every volume segment a unique color.';
exports.VolumeSegmentColorThemeParams = tslib_1.__assign({}, (0, palette_1.getPaletteParams)({ type: 'colors', colorList: 'many-distinct' }));
function getVolumeSegmentColorThemeParams(ctx) {
    return param_definition_1.ParamDefinition.clone(exports.VolumeSegmentColorThemeParams);
}
exports.getVolumeSegmentColorThemeParams = getVolumeSegmentColorThemeParams;
function VolumeSegmentColorTheme(ctx, props) {
    var color;
    var legend;
    var segmentation = ctx.volume && volume_1.Volume.Segmentation.get(ctx.volume);
    if (segmentation) {
        var size = segmentation.segments.size;
        var segments_1 = Array.from(segmentation.segments.keys());
        var palette_2 = (0, palette_1.getPalette)(size, props);
        legend = palette_2.legend;
        color = function (location) {
            if (volume_1.Volume.Segment.isLocation(location)) {
                return palette_2.color(segments_1.indexOf(location.segment));
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
exports.VolumeSegmentColorTheme = VolumeSegmentColorTheme;
exports.VolumeSegmentColorThemeProvider = {
    name: 'volume-segment',
    label: 'Volume Segment',
    category: categories_1.ColorThemeCategory.Misc,
    factory: VolumeSegmentColorTheme,
    getParams: getVolumeSegmentColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.VolumeSegmentColorThemeParams),
    isApplicable: function (ctx) { return !!ctx.volume && !!volume_1.Volume.Segmentation.get(ctx.volume); }
};
