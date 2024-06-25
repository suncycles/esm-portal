/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { Volume } from '../../mol-model/volume';
import { Task } from '../../mol-task';
import { SpacegroupCell, Box3D } from '../../mol-math/geometry';
import { Tensor, Vec3 } from '../../mol-math/linear-algebra';
import { CustomProperties } from '../../mol-model/custom-property';
import { objectForEach } from '../../mol-util/object';
export function volumeFromSegmentationData(source, params) {
    var _this = this;
    return Task.create('Create Segmentation Volume', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
        var info, values, cell, axis_order_fast_to_slow, normalizeOrder, sample_count, tensorSpace, t, origin, dimensions, v, segments, sets, _a, segment_id, set_id, i, il, segment, set, c, getCoords, d, _b, xn, yn, zn, xn1, yn1, zn1, setBounds, i, il, v_1, b, bounds;
        var _c;
        return __generator(this, function (_d) {
            info = source.volume_data_3d_info, values = source.segmentation_data_3d;
            cell = SpacegroupCell.create(info.spacegroup_number.value(0), Vec3.ofArray(info.spacegroup_cell_size.value(0)), Vec3.scale(Vec3(), Vec3.ofArray(info.spacegroup_cell_angles.value(0)), Math.PI / 180));
            axis_order_fast_to_slow = info.axis_order.value(0);
            normalizeOrder = Tensor.convertToCanonicalAxisIndicesFastToSlow(axis_order_fast_to_slow);
            sample_count = normalizeOrder(info.sample_count.value(0));
            tensorSpace = Tensor.Space(sample_count, Tensor.invertAxisOrder(axis_order_fast_to_slow), Float32Array);
            t = Tensor.create(tensorSpace, Tensor.Data1(values.values.toArray({ array: Float32Array })));
            origin = Vec3.ofArray(normalizeOrder(info.origin.value(0)));
            dimensions = Vec3.ofArray(normalizeOrder(info.dimensions.value(0)));
            v = {
                label: params === null || params === void 0 ? void 0 : params.label,
                entryId: undefined,
                grid: {
                    transform: {
                        kind: 'spacegroup',
                        cell: cell,
                        fractionalBox: Box3D.create(origin, Vec3.add(Vec3(), origin, dimensions))
                    },
                    cells: t,
                    stats: {
                        min: 0, max: 1, mean: 0, sigma: 1
                    },
                },
                sourceData: SegcifFormat.create(source),
                customProperties: new CustomProperties(),
                _propertyData: { ownerId: params === null || params === void 0 ? void 0 : params.ownerId },
            };
            Volume.PickingGranularity.set(v, 'object');
            segments = new Map();
            sets = new Map();
            _a = source.segmentation_data_table, segment_id = _a.segment_id, set_id = _a.set_id;
            for (i = 0, il = segment_id.rowCount; i < il; ++i) {
                segment = segment_id.value(i);
                set = set_id.value(i);
                if (set === 0 || segment === 0)
                    continue;
                if (!sets.has(set))
                    sets.set(set, new Set());
                sets.get(set).add(segment);
            }
            sets.forEach(function (segs, set) {
                segs.forEach(function (seg) {
                    if (!segments.has(seg))
                        segments.set(seg, new Set());
                    segments.get(seg).add(set);
                });
            });
            c = [0, 0, 0];
            getCoords = t.space.getCoords;
            d = t.data;
            _b = v.grid.cells.space.dimensions, xn = _b[0], yn = _b[1], zn = _b[2];
            xn1 = xn - 1;
            yn1 = yn - 1;
            zn1 = zn - 1;
            setBounds = {};
            sets.forEach(function (v, k) {
                setBounds[k] = [xn1, yn1, zn1, -1, -1, -1];
            });
            for (i = 0, il = d.length; i < il; ++i) {
                v_1 = d[i];
                if (v_1 === 0)
                    continue;
                getCoords(i, c);
                b = setBounds[v_1];
                if (c[0] < b[0])
                    b[0] = c[0];
                if (c[1] < b[1])
                    b[1] = c[1];
                if (c[2] < b[2])
                    b[2] = c[2];
                if (c[0] > b[3])
                    b[3] = c[0];
                if (c[1] > b[4])
                    b[4] = c[1];
                if (c[2] > b[5])
                    b[5] = c[2];
            }
            bounds = {};
            segments.forEach(function (v, k) {
                bounds[k] = Box3D.create(Vec3.create(xn1, yn1, zn1), Vec3.create(-1, -1, -1));
            });
            objectForEach(setBounds, function (b, s) {
                sets.get(parseInt(s)).forEach(function (seg) {
                    var sb = bounds[seg];
                    if (b[0] < sb.min[0])
                        sb.min[0] = b[0];
                    if (b[1] < sb.min[1])
                        sb.min[1] = b[1];
                    if (b[2] < sb.min[2])
                        sb.min[2] = b[2];
                    if (b[3] > sb.max[0])
                        sb.max[0] = b[3];
                    if (b[4] > sb.max[1])
                        sb.max[1] = b[4];
                    if (b[5] > sb.max[2])
                        sb.max[2] = b[5];
                });
            });
            Volume.Segmentation.set(v, { segments: segments, sets: sets, bounds: bounds, labels: (_c = params === null || params === void 0 ? void 0 : params.segmentLabels) !== null && _c !== void 0 ? _c : {} });
            return [2 /*return*/, v];
        });
    }); });
}
//
export { SegcifFormat };
var SegcifFormat;
(function (SegcifFormat) {
    function is(x) {
        return (x === null || x === void 0 ? void 0 : x.kind) === 'segcif';
    }
    SegcifFormat.is = is;
    function create(segcif) {
        return { kind: 'segcif', name: segcif._name, data: segcif };
    }
    SegcifFormat.create = create;
})(SegcifFormat || (SegcifFormat = {}));
