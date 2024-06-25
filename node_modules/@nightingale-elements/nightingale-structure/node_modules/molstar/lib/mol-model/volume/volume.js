/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Grid } from './grid';
import { OrderedSet, SortedArray } from '../../mol-data/int';
import { Box3D, Sphere3D } from '../../mol-math/geometry';
import { Vec3, Mat4 } from '../../mol-math/linear-algebra';
import { BoundaryHelper } from '../../mol-math/geometry/boundary-helper';
import { CubeFormat } from '../../mol-model-formats/volume/cube';
import { equalEps } from '../../mol-math/linear-algebra/3d/common';
import { CustomProperties } from '../custom-property';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { toPrecision } from '../../mol-util/number';
import { DscifFormat } from '../../mol-model-formats/volume/density-server';
export var Volume;
(function (Volume) {
    function is(x) {
        var _a, _b, _c, _d;
        // TODO: improve
        return (((_d = (_c = (_b = (_a = x === null || x === void 0 ? void 0 : x.grid) === null || _a === void 0 ? void 0 : _a.cells) === null || _b === void 0 ? void 0 : _b.space) === null || _c === void 0 ? void 0 : _c.dimensions) === null || _d === void 0 ? void 0 : _d.length) &&
            (x === null || x === void 0 ? void 0 : x.sourceData) &&
            (x === null || x === void 0 ? void 0 : x.customProperties) &&
            (x === null || x === void 0 ? void 0 : x._propertyData));
    }
    Volume.is = is;
    var IsoValue;
    (function (IsoValue) {
        function areSame(a, b, stats) {
            return equalEps(toAbsolute(a, stats).absoluteValue, toAbsolute(b, stats).absoluteValue, stats.sigma / 100);
        }
        IsoValue.areSame = areSame;
        function absolute(value) { return { kind: 'absolute', absoluteValue: value }; }
        IsoValue.absolute = absolute;
        function relative(value) { return { kind: 'relative', relativeValue: value }; }
        IsoValue.relative = relative;
        function calcAbsolute(stats, relativeValue) {
            return relativeValue * stats.sigma + stats.mean;
        }
        IsoValue.calcAbsolute = calcAbsolute;
        function calcRelative(stats, absoluteValue) {
            return stats.sigma === 0 ? 0 : ((absoluteValue - stats.mean) / stats.sigma);
        }
        IsoValue.calcRelative = calcRelative;
        function toAbsolute(value, stats) {
            return value.kind === 'absolute' ? value : { kind: 'absolute', absoluteValue: IsoValue.calcAbsolute(stats, value.relativeValue) };
        }
        IsoValue.toAbsolute = toAbsolute;
        function toRelative(value, stats) {
            return value.kind === 'relative' ? value : { kind: 'relative', relativeValue: IsoValue.calcRelative(stats, value.absoluteValue) };
        }
        IsoValue.toRelative = toRelative;
        function toString(value) {
            return value.kind === 'relative'
                ? "".concat(value.relativeValue.toFixed(2), " \u03C3")
                : "".concat(value.absoluteValue.toPrecision(4));
        }
        IsoValue.toString = toString;
    })(IsoValue = Volume.IsoValue || (Volume.IsoValue = {}));
    // Converts iso value to relative if using downsample VolumeServer data
    function adjustedIsoValue(volume, value, kind) {
        if (kind === 'relative')
            return IsoValue.relative(value);
        var absolute = IsoValue.absolute(value);
        if (DscifFormat.is(volume.sourceData)) {
            var stats = {
                min: volume.sourceData.data.volume_data_3d_info.min_source.value(0),
                max: volume.sourceData.data.volume_data_3d_info.max_source.value(0),
                mean: volume.sourceData.data.volume_data_3d_info.mean_source.value(0),
                sigma: volume.sourceData.data.volume_data_3d_info.sigma_source.value(0),
            };
            return Volume.IsoValue.toRelative(absolute, stats);
        }
        return absolute;
    }
    Volume.adjustedIsoValue = adjustedIsoValue;
    var defaultStats = { min: -1, max: 1, mean: 0, sigma: 0.1 };
    function createIsoValueParam(defaultValue, stats) {
        var sts = stats || defaultStats;
        var min = sts.min, max = sts.max, mean = sts.mean, sigma = sts.sigma;
        // using ceil/floor could lead to "ouf of bounds" when converting
        var relMin = (min - mean) / sigma;
        var relMax = (max - mean) / sigma;
        var def = defaultValue;
        if (defaultValue.kind === 'absolute') {
            if (defaultValue.absoluteValue < min)
                def = Volume.IsoValue.absolute(min);
            else if (defaultValue.absoluteValue > max)
                def = Volume.IsoValue.absolute(max);
        }
        else {
            if (defaultValue.relativeValue < relMin)
                def = Volume.IsoValue.relative(relMin);
            else if (defaultValue.relativeValue > relMax)
                def = Volume.IsoValue.relative(relMax);
        }
        return PD.Conditioned(def, {
            'absolute': PD.Converted(function (v) { return Volume.IsoValue.toAbsolute(v, Grid.One.stats).absoluteValue; }, function (v) { return Volume.IsoValue.absolute(v); }, PD.Numeric(mean, { min: min, max: max, step: toPrecision(sigma / 100, 2) }, { immediateUpdate: true })),
            'relative': PD.Converted(function (v) { return Volume.IsoValue.toRelative(v, Grid.One.stats).relativeValue; }, function (v) { return Volume.IsoValue.relative(v); }, PD.Numeric(Math.min(1, relMax), { min: relMin, max: relMax, step: toPrecision(Math.round(((max - min) / sigma)) / 100, 2) }, { immediateUpdate: true }))
        }, function (v) { return v.kind === 'absolute' ? 'absolute' : 'relative'; }, function (v, c) { return c === 'absolute' ? Volume.IsoValue.toAbsolute(v, sts) : Volume.IsoValue.toRelative(v, sts); }, { isEssential: true });
    }
    Volume.createIsoValueParam = createIsoValueParam;
    Volume.IsoValueParam = createIsoValueParam(Volume.IsoValue.relative(2));
    Volume.One = {
        label: '',
        grid: Grid.One,
        sourceData: { kind: '', name: '', data: {} },
        customProperties: new CustomProperties(),
        _propertyData: Object.create(null),
    };
    function areEquivalent(volA, volB) {
        return Grid.areEquivalent(volA.grid, volB.grid);
    }
    Volume.areEquivalent = areEquivalent;
    function isEmpty(vol) {
        return Grid.isEmpty(vol.grid);
    }
    Volume.isEmpty = isEmpty;
    function isOrbitals(volume) {
        if (!CubeFormat.is(volume.sourceData))
            return false;
        return volume.sourceData.data.header.orbitals;
    }
    Volume.isOrbitals = isOrbitals;
    function Loci(volume) { return { kind: 'volume-loci', volume: volume }; }
    Volume.Loci = Loci;
    function isLoci(x) { return !!x && x.kind === 'volume-loci'; }
    Volume.isLoci = isLoci;
    function areLociEqual(a, b) { return a.volume === b.volume; }
    Volume.areLociEqual = areLociEqual;
    function isLociEmpty(loci) { return Grid.isEmpty(loci.volume.grid); }
    Volume.isLociEmpty = isLociEmpty;
    function getBoundingSphere(volume, boundingSphere) {
        return Grid.getBoundingSphere(volume.grid, boundingSphere);
    }
    Volume.getBoundingSphere = getBoundingSphere;
    var Isosurface;
    (function (Isosurface) {
        function Loci(volume, isoValue) { return { kind: 'isosurface-loci', volume: volume, isoValue: isoValue }; }
        Isosurface.Loci = Loci;
        function isLoci(x) { return !!x && x.kind === 'isosurface-loci'; }
        Isosurface.isLoci = isLoci;
        function areLociEqual(a, b) { return a.volume === b.volume && Volume.IsoValue.areSame(a.isoValue, b.isoValue, a.volume.grid.stats); }
        Isosurface.areLociEqual = areLociEqual;
        function isLociEmpty(loci) { return loci.volume.grid.cells.data.length === 0; }
        Isosurface.isLociEmpty = isLociEmpty;
        var bbox = Box3D();
        function getBoundingSphere(volume, isoValue, boundingSphere) {
            var value = Volume.IsoValue.toAbsolute(isoValue, volume.grid.stats).absoluteValue;
            var neg = value < 0;
            var c = [0, 0, 0];
            var getCoords = volume.grid.cells.space.getCoords;
            var d = volume.grid.cells.data;
            var _a = volume.grid.cells.space.dimensions, xn = _a[0], yn = _a[1], zn = _a[2];
            var minx = xn - 1, miny = yn - 1, minz = zn - 1;
            var maxx = 0, maxy = 0, maxz = 0;
            for (var i = 0, il = d.length; i < il; ++i) {
                if ((neg && d[i] <= value) || (!neg && d[i] >= value)) {
                    getCoords(i, c);
                    if (c[0] < minx)
                        minx = c[0];
                    if (c[1] < miny)
                        miny = c[1];
                    if (c[2] < minz)
                        minz = c[2];
                    if (c[0] > maxx)
                        maxx = c[0];
                    if (c[1] > maxy)
                        maxy = c[1];
                    if (c[2] > maxz)
                        maxz = c[2];
                }
            }
            Vec3.set(bbox.min, minx - 1, miny - 1, minz - 1);
            Vec3.set(bbox.max, maxx + 1, maxy + 1, maxz + 1);
            var transform = Grid.getGridToCartesianTransform(volume.grid);
            Box3D.transform(bbox, bbox, transform);
            return Sphere3D.fromBox3D(boundingSphere || Sphere3D(), bbox);
        }
        Isosurface.getBoundingSphere = getBoundingSphere;
    })(Isosurface = Volume.Isosurface || (Volume.Isosurface = {}));
    var Cell;
    (function (Cell) {
        function Loci(volume, indices) { return { kind: 'cell-loci', volume: volume, indices: indices }; }
        Cell.Loci = Loci;
        function isLoci(x) { return !!x && x.kind === 'cell-loci'; }
        Cell.isLoci = isLoci;
        function areLociEqual(a, b) { return a.volume === b.volume && OrderedSet.areEqual(a.indices, b.indices); }
        Cell.areLociEqual = areLociEqual;
        function isLociEmpty(loci) { return OrderedSet.size(loci.indices) === 0; }
        Cell.isLociEmpty = isLociEmpty;
        var boundaryHelper = new BoundaryHelper('98');
        var tmpBoundaryPos = Vec3();
        function getBoundingSphere(volume, indices, boundingSphere) {
            boundaryHelper.reset();
            var transform = Grid.getGridToCartesianTransform(volume.grid);
            var getCoords = volume.grid.cells.space.getCoords;
            for (var i = 0, _i = OrderedSet.size(indices); i < _i; i++) {
                var o = OrderedSet.getAt(indices, i);
                getCoords(o, tmpBoundaryPos);
                Vec3.transformMat4(tmpBoundaryPos, tmpBoundaryPos, transform);
                boundaryHelper.includePosition(tmpBoundaryPos);
            }
            boundaryHelper.finishedIncludeStep();
            for (var i = 0, _i = OrderedSet.size(indices); i < _i; i++) {
                var o = OrderedSet.getAt(indices, i);
                getCoords(o, tmpBoundaryPos);
                Vec3.transformMat4(tmpBoundaryPos, tmpBoundaryPos, transform);
                boundaryHelper.radiusPosition(tmpBoundaryPos);
            }
            var bs = boundaryHelper.getSphere(boundingSphere);
            return Sphere3D.expand(bs, bs, Mat4.getMaxScaleOnAxis(transform) * 10);
        }
        Cell.getBoundingSphere = getBoundingSphere;
    })(Cell = Volume.Cell || (Volume.Cell = {}));
    var Segment;
    (function (Segment) {
        function Loci(volume, segments) { return { kind: 'segment-loci', volume: volume, segments: SortedArray.ofUnsortedArray(segments) }; }
        Segment.Loci = Loci;
        function isLoci(x) { return !!x && x.kind === 'segment-loci'; }
        Segment.isLoci = isLoci;
        function areLociEqual(a, b) { return a.volume === b.volume && SortedArray.areEqual(a.segments, b.segments); }
        Segment.areLociEqual = areLociEqual;
        function isLociEmpty(loci) { return loci.volume.grid.cells.data.length === 0 || loci.segments.length === 0; }
        Segment.isLociEmpty = isLociEmpty;
        var bbox = Box3D();
        function getBoundingSphere(volume, segments, boundingSphere) {
            var segmentation = Volume.Segmentation.get(volume);
            if (segmentation) {
                Box3D.setEmpty(bbox);
                for (var i = 0, il = segments.length; i < il; ++i) {
                    var b = segmentation.bounds[segments[i]];
                    Box3D.add(bbox, b.min);
                    Box3D.add(bbox, b.max);
                }
                var transform = Grid.getGridToCartesianTransform(volume.grid);
                Box3D.transform(bbox, bbox, transform);
                return Sphere3D.fromBox3D(boundingSphere || Sphere3D(), bbox);
            }
            else {
                return Volume.getBoundingSphere(volume, boundingSphere);
            }
        }
        Segment.getBoundingSphere = getBoundingSphere;
        function Location(volume, segment) {
            return { kind: 'segment-location', volume: volume, segment: segment };
        }
        Segment.Location = Location;
        function isLocation(x) {
            return !!x && x.kind === 'segment-location';
        }
        Segment.isLocation = isLocation;
    })(Segment = Volume.Segment || (Volume.Segment = {}));
    Volume.PickingGranularity = {
        set: function (volume, granularity) {
            volume._propertyData['__picking_granularity__'] = granularity;
        },
        get: function (volume) {
            var _a;
            return (_a = volume._propertyData['__picking_granularity__']) !== null && _a !== void 0 ? _a : 'voxel';
        }
    };
    Volume.Segmentation = {
        set: function (volume, segmentation) {
            volume._propertyData['__segmentation__'] = segmentation;
        },
        get: function (volume) {
            return volume._propertyData['__segmentation__'];
        }
    };
})(Volume || (Volume = {}));
