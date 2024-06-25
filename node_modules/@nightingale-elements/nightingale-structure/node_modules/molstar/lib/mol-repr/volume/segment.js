/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign, __awaiter, __generator, __spreadArray } from "tslib";
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Grid, Volume } from '../../mol-model/volume';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { computeMarchingCubesMesh } from '../../mol-geo/util/marching-cubes/algorithm';
import { VolumeVisual, VolumeRepresentation, VolumeRepresentationProvider } from './representation';
import { LocationIterator } from '../../mol-geo/util/location-iterator';
import { Representation } from '../representation';
import { EmptyLoci } from '../../mol-model/loci';
import { Interval, SortedArray } from '../../mol-data/int';
import { Mat4, Tensor, Vec2, Vec3 } from '../../mol-math/linear-algebra';
import { fillSerial } from '../../mol-util/array';
import { createSegmentTexture2d, eachVolumeLoci, getVolumeTexture2dLayout } from './util';
import { TextureMesh } from '../../mol-geo/geometry/texture-mesh/texture-mesh';
import { BaseGeometry } from '../../mol-geo/geometry/base';
import { ValueCell } from '../../mol-util/value-cell';
import { extractIsosurface } from '../../mol-gl/compute/marching-cubes/isosurface';
import { Box3D } from '../../mol-math/geometry/primitives/box3d';
export var VolumeSegmentParams = {
    segments: PD.Converted(function (v) { return v.map(function (x) { return "".concat(x); }); }, function (v) { return v.map(function (x) { return parseInt(x); }); }, PD.MultiSelect(['0'], PD.arrayToOptions(['0']), {
        isEssential: true
    }))
};
function gpuSupport(webgl) {
    return webgl.extensions.colorBufferFloat && webgl.extensions.textureFloat && webgl.extensions.drawBuffers;
}
var Padding = 1;
function suitableForGpu(volume, webgl) {
    // small volumes are about as fast or faster on CPU vs integrated GPU
    if (volume.grid.cells.data.length < Math.pow(10, 3))
        return false;
    // the GPU is much more memory contraint, especially true for integrated GPUs,
    // fallback to CPU for large volumes
    var gridDim = volume.grid.cells.space.dimensions;
    var powerOfTwoSize = getVolumeTexture2dLayout(gridDim, Padding).powerOfTwoSize;
    return powerOfTwoSize <= webgl.maxTextureSize / 2;
}
var _translate = Mat4();
function getSegmentTransform(grid, segmentBox) {
    var transform = Grid.getGridToCartesianTransform(grid);
    var translate = Mat4.fromTranslation(_translate, segmentBox.min);
    return Mat4.mul(Mat4(), transform, translate);
}
export function SegmentVisual(materialId, volume, key, props, webgl) {
    if (props.tryUseGpu && webgl && gpuSupport(webgl) && suitableForGpu(volume, webgl)) {
        return SegmentTextureMeshVisual(materialId);
    }
    return SegmentMeshVisual(materialId);
}
function getLoci(volume, props) {
    return Volume.Segment.Loci(volume, props.segments);
}
function getSegmentLoci(pickingId, volume, key, props, id) {
    var objectId = pickingId.objectId, groupId = pickingId.groupId;
    if (id === objectId) {
        var granularity = Volume.PickingGranularity.get(volume);
        if (granularity === 'volume') {
            return Volume.Loci(volume);
        }
        else if (granularity === 'object') {
            return Volume.Segment.Loci(volume, [key]);
        }
        else {
            return Volume.Cell.Loci(volume, Interval.ofSingleton(groupId));
        }
    }
    return EmptyLoci;
}
export function eachSegment(loci, volume, key, props, apply) {
    var segments = SortedArray.ofSingleton(key);
    return eachVolumeLoci(loci, volume, { segments: segments }, apply);
}
//
function getSegmentCells(set, bbox, cells) {
    var data = cells.data;
    var o = cells.space.dataOffset;
    var dim = Box3D.size(Vec3(), bbox);
    var xn = dim[0], yn = dim[1], zn = dim[2];
    var xn1 = xn - 1;
    var yn1 = yn - 1;
    var zn1 = zn - 1;
    var _a = bbox.min, minx = _a[0], miny = _a[1], minz = _a[2];
    var _b = bbox.max, maxx = _b[0], maxy = _b[1], maxz = _b[2];
    var axisOrder = __spreadArray([], cells.space.axisOrderSlowToFast, true);
    var segmentSpace = Tensor.Space(dim, axisOrder, Uint8Array);
    var segmentCells = Tensor.create(segmentSpace, segmentSpace.create());
    var segData = segmentCells.data;
    var segSet = segmentSpace.set;
    for (var z = 0; z < zn; ++z) {
        for (var y = 0; y < yn; ++y) {
            for (var x = 0; x < xn; ++x) {
                var v0 = set.includes(data[o(x + minx, y + miny, z + minz)]) ? 255 : 0;
                var xp = set.includes(data[o(Math.min(xn1 + maxx, x + 1 + minx), y + miny, z + minz)]) ? 255 : 0;
                var xn_1 = set.includes(data[o(Math.max(0, x - 1 + minx), y + miny, z + minz)]) ? 255 : 0;
                var yp = set.includes(data[o(x + minx, Math.min(yn1 + maxy, y + 1 + miny), z + minz)]) ? 255 : 0;
                var yn_1 = set.includes(data[o(x + minx, Math.max(0, y - 1 + miny), z + minz)]) ? 255 : 0;
                var zp = set.includes(data[o(x + minx, y + miny, Math.min(zn1 + maxz, z + 1 + minz))]) ? 255 : 0;
                var zn_1 = set.includes(data[o(x + minx, y + miny, Math.max(0, z - 1 + minz))]) ? 255 : 0;
                segSet(segData, x, y, z, Math.round((v0 + v0 + xp + xn_1 + yp + yn_1 + zp + zn_1) / 8));
            }
        }
    }
    return segmentCells;
}
export function createVolumeSegmentMesh(ctx, volume, key, theme, props, mesh) {
    return __awaiter(this, void 0, void 0, function () {
        var segmentation, bbox, set, cells, ids, surface, transform;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    segmentation = Volume.Segmentation.get(volume);
                    if (!segmentation)
                        throw new Error('missing volume segmentation');
                    ctx.runtime.update({ message: 'Marching cubes...' });
                    bbox = Box3D.clone(segmentation.bounds[key]);
                    Box3D.expand(bbox, bbox, Vec3.create(2, 2, 2));
                    set = Array.from(segmentation.segments.get(key).values());
                    cells = getSegmentCells(set, bbox, volume.grid.cells);
                    ids = fillSerial(new Int32Array(cells.data.length));
                    return [4 /*yield*/, computeMarchingCubesMesh({
                            isoLevel: 128,
                            scalarField: cells,
                            idField: Tensor.create(cells.space, Tensor.Data1(ids))
                        }, mesh).runAsChild(ctx.runtime)];
                case 1:
                    surface = _a.sent();
                    transform = getSegmentTransform(volume.grid, bbox);
                    Mesh.transform(surface, transform);
                    if (ctx.webgl && !ctx.webgl.isWebGL2) {
                        // 2nd arg means not to split triangles based on group id. Splitting triangles
                        // is too expensive if each cell has its own group id as is the case here.
                        Mesh.uniformTriangleGroup(surface, false);
                        ValueCell.updateIfChanged(surface.varyingGroup, false);
                    }
                    else {
                        ValueCell.updateIfChanged(surface.varyingGroup, true);
                    }
                    surface.setBoundingSphere(Volume.Segment.getBoundingSphere(volume, [key]));
                    return [2 /*return*/, surface];
            }
        });
    });
}
export var SegmentMeshParams = __assign(__assign(__assign(__assign({}, Mesh.Params), TextureMesh.Params), VolumeSegmentParams), { quality: __assign(__assign({}, Mesh.Params.quality), { isEssential: false }), tryUseGpu: PD.Boolean(true) });
export function SegmentMeshVisual(materialId) {
    return VolumeVisual({
        defaultProps: PD.getDefaultValues(SegmentMeshParams),
        createGeometry: createVolumeSegmentMesh,
        createLocationIterator: function (volume, key) {
            var l = Volume.Segment.Location(volume, key);
            return LocationIterator(volume.grid.cells.data.length, 1, 1, function () { return l; });
        },
        getLoci: getSegmentLoci,
        eachLocation: eachSegment,
        setUpdateState: function (state, volume, newProps, currentProps) {
        },
        geometryUtils: Mesh.Utils,
        mustRecreate: function (volumeKey, props, webgl) {
            return props.tryUseGpu && !!webgl && suitableForGpu(volumeKey.volume, webgl);
        }
    }, materialId);
}
//
var SegmentTextureName = 'segment-texture';
function getSegmentTexture(volume, segment, webgl) {
    var segmentation = Volume.Segmentation.get(volume);
    if (!segmentation)
        throw new Error('missing volume segmentation');
    var resources = webgl.resources;
    var bbox = Box3D.clone(segmentation.bounds[segment]);
    Box3D.expand(bbox, bbox, Vec3.create(2, 2, 2));
    var transform = getSegmentTransform(volume.grid, bbox);
    var gridDimension = Box3D.size(Vec3(), bbox);
    var _a = getVolumeTexture2dLayout(gridDimension, Padding), width = _a.width, height = _a.height, texDim = _a.powerOfTwoSize;
    var gridTexDim = Vec3.create(width, height, 0);
    var gridTexScale = Vec2.create(width / texDim, height / texDim);
    // console.log({ texDim, width, height, gridDimension });
    if (texDim > webgl.maxTextureSize / 2) {
        throw new Error('volume too large for gpu segment extraction');
    }
    if (!webgl.namedTextures[SegmentTextureName]) {
        webgl.namedTextures[SegmentTextureName] = resources.texture('image-uint8', 'alpha', 'ubyte', 'linear');
    }
    var texture = webgl.namedTextures[SegmentTextureName];
    texture.define(texDim, texDim);
    // load volume into sub-section of texture
    var set = Array.from(segmentation.segments.get(segment).values());
    texture.load(createSegmentTexture2d(volume, set, bbox, Padding), true);
    gridDimension[0] += Padding;
    gridDimension[1] += Padding;
    return {
        texture: texture,
        transform: transform,
        gridDimension: gridDimension,
        gridTexDim: gridTexDim,
        gridTexScale: gridTexScale
    };
}
function createVolumeSegmentTextureMesh(ctx, volume, segment, theme, props, textureMesh) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, texture, gridDimension, gridTexDim, gridTexScale, transform, axisOrder, buffer, gv, groupCount, surface;
        return __generator(this, function (_b) {
            if (!ctx.webgl)
                throw new Error('webgl context required to create volume segment texture-mesh');
            if (volume.grid.cells.data.length <= 1) {
                return [2 /*return*/, TextureMesh.createEmpty(textureMesh)];
            }
            _a = getSegmentTexture(volume, segment, ctx.webgl), texture = _a.texture, gridDimension = _a.gridDimension, gridTexDim = _a.gridTexDim, gridTexScale = _a.gridTexScale, transform = _a.transform;
            axisOrder = volume.grid.cells.space.axisOrderSlowToFast;
            buffer = textureMesh === null || textureMesh === void 0 ? void 0 : textureMesh.doubleBuffer.get();
            gv = extractIsosurface(ctx.webgl, texture, gridDimension, gridTexDim, gridTexScale, transform, 0.5, false, false, axisOrder, true, buffer === null || buffer === void 0 ? void 0 : buffer.vertex, buffer === null || buffer === void 0 ? void 0 : buffer.group, buffer === null || buffer === void 0 ? void 0 : buffer.normal);
            groupCount = volume.grid.cells.data.length;
            surface = TextureMesh.create(gv.vertexCount, groupCount, gv.vertexTexture, gv.groupTexture, gv.normalTexture, Volume.Segment.getBoundingSphere(volume, [segment]), textureMesh);
            return [2 /*return*/, surface];
        });
    });
}
export function SegmentTextureMeshVisual(materialId) {
    return VolumeVisual({
        defaultProps: PD.getDefaultValues(SegmentMeshParams),
        createGeometry: createVolumeSegmentTextureMesh,
        createLocationIterator: function (volume, segment) {
            var l = Volume.Segment.Location(volume, segment);
            return LocationIterator(volume.grid.cells.data.length, 1, 1, function () { return l; });
        },
        getLoci: getSegmentLoci,
        eachLocation: eachSegment,
        setUpdateState: function (state, volume, newProps, currentProps) {
        },
        geometryUtils: TextureMesh.Utils,
        mustRecreate: function (volumeKey, props, webgl) {
            return !props.tryUseGpu || !webgl || !suitableForGpu(volumeKey.volume, webgl);
        },
        dispose: function (geometry) {
            geometry.vertexTexture.ref.value.destroy();
            geometry.groupTexture.ref.value.destroy();
            geometry.normalTexture.ref.value.destroy();
            geometry.doubleBuffer.destroy();
        }
    }, materialId);
}
//
function getSegments(props) {
    return SortedArray.ofUnsortedArray(props.segments);
}
var SegmentVisuals = {
    'segment': function (ctx, getParams) { return VolumeRepresentation('Segment mesh', ctx, getParams, SegmentVisual, getLoci, getSegments); },
};
export var SegmentParams = __assign(__assign({}, SegmentMeshParams), { visuals: PD.MultiSelect(['segment'], PD.objectToOptions(SegmentVisuals)), bumpFrequency: PD.Numeric(1, { min: 0, max: 10, step: 0.1 }, BaseGeometry.ShadingCategory) });
export function getSegmentParams(ctx, volume) {
    var p = PD.clone(SegmentParams);
    var segmentation = Volume.Segmentation.get(volume);
    if (segmentation) {
        var segments = Array.from(segmentation.segments.keys());
        p.segments = PD.Converted(function (v) { return v.map(function (x) { return "".concat(x); }); }, function (v) { return v.map(function (x) { return parseInt(x); }); }, PD.MultiSelect(segments.map(function (x) { return "".concat(x); }), PD.arrayToOptions(segments.map(function (x) { return "".concat(x); })), {
            isEssential: true
        }));
    }
    return p;
}
export function SegmentRepresentation(ctx, getParams) {
    return Representation.createMulti('Segment', ctx, getParams, Representation.StateBuilder, SegmentVisuals);
}
export var SegmentRepresentationProvider = VolumeRepresentationProvider({
    name: 'segment',
    label: 'Segment',
    description: 'Displays a triangulated segment of volumetric data.',
    factory: SegmentRepresentation,
    getParams: getSegmentParams,
    defaultValues: PD.getDefaultValues(SegmentParams),
    defaultColorTheme: { name: 'volume-segment' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: function (volume) { return !Volume.isEmpty(volume) && !!Volume.Segmentation.get(volume); }
});
