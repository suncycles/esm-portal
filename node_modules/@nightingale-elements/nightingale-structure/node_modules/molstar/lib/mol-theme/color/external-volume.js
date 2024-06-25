/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Color, ColorScale } from '../../mol-util/color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Grid, Volume } from '../../mol-model/volume';
import { isPositionLocation } from '../../mol-geo/util/location-iterator';
import { Mat4, Vec3 } from '../../mol-math/linear-algebra';
import { lerp } from '../../mol-math/interpolate';
import { ColorThemeCategory } from './categories';
var Description = "Assigns a color based volume value at a given vertex.";
export var ExternalVolumeColorThemeParams = {
    volume: PD.ValueRef(function (ctx) {
        var volumes = ctx.state.data.selectQ(function (q) { return q.root.subtree().filter(function (c) { var _a; return Volume.is((_a = c.obj) === null || _a === void 0 ? void 0 : _a.data); }); });
        return volumes.map(function (v) { var _a, _b; return [v.transform.ref, (_b = (_a = v.obj) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : '<unknown>']; });
    }, function (ref, getData) { return getData(ref); }),
    coloring: PD.MappedStatic('absolute-value', {
        'absolute-value': PD.Group({
            domain: PD.MappedStatic('auto', {
                custom: PD.Interval([-1, 1]),
                auto: PD.Group({
                    symmetric: PD.Boolean(false, { description: 'If true the automatic range is determined as [-|max|, |max|].' })
                })
            }),
            list: PD.ColorList('red-white-blue', { presetKind: 'scale' })
        }),
        'relative-value': PD.Group({
            domain: PD.MappedStatic('auto', {
                custom: PD.Interval([-1, 1]),
                auto: PD.Group({
                    symmetric: PD.Boolean(false, { description: 'If true the automatic range is determined as [-|max|, |max|].' })
                })
            }),
            list: PD.ColorList('red-white-blue', { presetKind: 'scale' })
        })
    }),
    defaultColor: PD.Color(Color(0xcccccc)),
};
export function ExternalVolumeColorTheme(ctx, props) {
    var volume;
    try {
        volume = props.volume.getValue();
    }
    catch (_a) {
        // .getValue() is resolved during state reconciliation => would throw from UI
    }
    // NOTE: this will currently be slow for with GPU/texture meshes due to slow iteration
    // TODO: create texture to be able to do the sampling on the GPU
    var color;
    if (volume) {
        var coloring = props.coloring.params;
        var stats_1 = volume.grid.stats;
        var domain = coloring.domain.name === 'custom' ? coloring.domain.params : [stats_1.min, stats_1.max];
        var isRelative_1 = props.coloring.name === 'relative-value';
        if (coloring.domain.name === 'auto' && isRelative_1) {
            domain[0] = (domain[0] - stats_1.mean) / stats_1.sigma;
            domain[1] = (domain[1] - stats_1.mean) / stats_1.sigma;
        }
        if (props.coloring.params.domain.name === 'auto' && props.coloring.params.domain.params.symmetric) {
            var max = Math.max(Math.abs(domain[0]), Math.abs(domain[1]));
            domain[0] = -max;
            domain[1] = max;
        }
        var scale_1 = ColorScale.create({ domain: domain, listOrName: coloring.list.colors });
        var cartnToGrid_1 = Grid.getGridToCartesianTransform(volume.grid);
        Mat4.invert(cartnToGrid_1, cartnToGrid_1);
        var gridCoords_1 = Vec3();
        var _b = volume.grid.cells.space, dimensions = _b.dimensions, get_1 = _b.get;
        var data_1 = volume.grid.cells.data;
        var mi_1 = dimensions[0], mj_1 = dimensions[1], mk_1 = dimensions[2];
        color = function (location) {
            if (!isPositionLocation(location)) {
                return props.defaultColor;
            }
            Vec3.copy(gridCoords_1, location.position);
            Vec3.transformMat4(gridCoords_1, gridCoords_1, cartnToGrid_1);
            var i = Math.floor(gridCoords_1[0]);
            var j = Math.floor(gridCoords_1[1]);
            var k = Math.floor(gridCoords_1[2]);
            if (i < 0 || i >= mi_1 || j < 0 || j >= mj_1 || k < 0 || k >= mk_1) {
                return props.defaultColor;
            }
            var u = gridCoords_1[0] - i;
            var v = gridCoords_1[1] - j;
            var w = gridCoords_1[2] - k;
            // Tri-linear interpolation for the value
            var ii = Math.min(i + 1, mi_1 - 1);
            var jj = Math.min(j + 1, mj_1 - 1);
            var kk = Math.min(k + 1, mk_1 - 1);
            var a = get_1(data_1, i, j, k);
            var b = get_1(data_1, ii, j, k);
            var c = get_1(data_1, i, jj, k);
            var d = get_1(data_1, ii, jj, k);
            var x = lerp(lerp(a, b, u), lerp(c, d, u), v);
            a = get_1(data_1, i, j, kk);
            b = get_1(data_1, ii, j, kk);
            c = get_1(data_1, i, jj, kk);
            d = get_1(data_1, ii, jj, kk);
            var y = lerp(lerp(a, b, u), lerp(c, d, u), v);
            var value = lerp(x, y, w);
            if (isRelative_1) {
                value = (value - stats_1.mean) / stats_1.sigma;
            }
            return scale_1.color(value);
        };
    }
    else {
        color = function () { return props.defaultColor; };
    }
    return {
        factory: ExternalVolumeColorTheme,
        granularity: 'vertex',
        preferSmoothing: true,
        color: color,
        props: props,
        description: Description,
        // TODO: figure out how to do legend for this
    };
}
export var ExternalVolumeColorThemeProvider = {
    name: 'external-volume',
    label: 'External Volume',
    category: ColorThemeCategory.Misc,
    factory: ExternalVolumeColorTheme,
    getParams: function () { return ExternalVolumeColorThemeParams; },
    defaultValues: PD.getDefaultValues(ExternalVolumeColorThemeParams),
    isApplicable: function (ctx) { return true; },
};
