"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentRepresentationProvider = exports.SegmentRepresentation = exports.getSegmentParams = exports.SegmentParams = exports.SegmentTextureMeshVisual = exports.SegmentMeshVisual = exports.SegmentMeshParams = exports.createVolumeSegmentMesh = exports.eachSegment = exports.SegmentVisual = exports.VolumeSegmentParams = void 0;
var tslib_1 = require("tslib");
var param_definition_1 = require("../../mol-util/param-definition");
var volume_1 = require("../../mol-model/volume");
var mesh_1 = require("../../mol-geo/geometry/mesh/mesh");
var algorithm_1 = require("../../mol-geo/util/marching-cubes/algorithm");
var representation_1 = require("./representation");
var location_iterator_1 = require("../../mol-geo/util/location-iterator");
var representation_2 = require("../representation");
var loci_1 = require("../../mol-model/loci");
var int_1 = require("../../mol-data/int");
var linear_algebra_1 = require("../../mol-math/linear-algebra");
var array_1 = require("../../mol-util/array");
var util_1 = require("./util");
var texture_mesh_1 = require("../../mol-geo/geometry/texture-mesh/texture-mesh");
var base_1 = require("../../mol-geo/geometry/base");
var value_cell_1 = require("../../mol-util/value-cell");
var isosurface_1 = require("../../mol-gl/compute/marching-cubes/isosurface");
var box3d_1 = require("../../mol-math/geometry/primitives/box3d");
exports.VolumeSegmentParams = {
    segments: param_definition_1.ParamDefinition.Converted(function (v) { return v.map(function (x) { return "".concat(x); }); }, function (v) { return v.map(function (x) { return parseInt(x); }); }, param_definition_1.ParamDefinition.MultiSelect(['0'], param_definition_1.ParamDefinition.arrayToOptions(['0']), {
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
    var powerOfTwoSize = (0, util_1.getVolumeTexture2dLayout)(gridDim, Padding).powerOfTwoSize;
    return powerOfTwoSize <= webgl.maxTextureSize / 2;
}
var _translate = (0, linear_algebra_1.Mat4)();
function getSegmentTransform(grid, segmentBox) {
    var transform = volume_1.Grid.getGridToCartesianTransform(grid);
    var translate = linear_algebra_1.Mat4.fromTranslation(_translate, segmentBox.min);
    return linear_algebra_1.Mat4.mul((0, linear_algebra_1.Mat4)(), transform, translate);
}
function SegmentVisual(materialId, volume, key, props, webgl) {
    if (props.tryUseGpu && webgl && gpuSupport(webgl) && suitableForGpu(volume, webgl)) {
        return SegmentTextureMeshVisual(materialId);
    }
    return SegmentMeshVisual(materialId);
}
exports.SegmentVisual = SegmentVisual;
function getLoci(volume, props) {
    return volume_1.Volume.Segment.Loci(volume, props.segments);
}
function getSegmentLoci(pickingId, volume, key, props, id) {
    var objectId = pickingId.objectId, groupId = pickingId.groupId;
    if (id === objectId) {
        var granularity = volume_1.Volume.PickingGranularity.get(volume);
        if (granularity === 'volume') {
            return volume_1.Volume.Loci(volume);
        }
        else if (granularity === 'object') {
            return volume_1.Volume.Segment.Loci(volume, [key]);
        }
        else {
            return volume_1.Volume.Cell.Loci(volume, int_1.Interval.ofSingleton(groupId));
        }
    }
    return loci_1.EmptyLoci;
}
function eachSegment(loci, volume, key, props, apply) {
    var segments = int_1.SortedArray.ofSingleton(key);
    return (0, util_1.eachVolumeLoci)(loci, volume, { segments: segments }, apply);
}
exports.eachSegment = eachSegment;
//
function getSegmentCells(set, bbox, cells) {
    var data = cells.data;
    var o = cells.space.dataOffset;
    var dim = box3d_1.Box3D.size((0, linear_algebra_1.Vec3)(), bbox);
    var xn = dim[0], yn = dim[1], zn = dim[2];
    var xn1 = xn - 1;
    var yn1 = yn - 1;
    var zn1 = zn - 1;
    var _a = bbox.min, minx = _a[0], miny = _a[1], minz = _a[2];
    var _b = bbox.max, maxx = _b[0], maxy = _b[1], maxz = _b[2];
    var axisOrder = tslib_1.__spreadArray([], cells.space.axisOrderSlowToFast, true);
    var segmentSpace = linear_algebra_1.Tensor.Space(dim, axisOrder, Uint8Array);
    var segmentCells = linear_algebra_1.Tensor.create(segmentSpace, segmentSpace.create());
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
function createVolumeSegmentMesh(ctx, volume, key, theme, props, mesh) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var segmentation, bbox, set, cells, ids, surface, transform;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    segmentation = volume_1.Volume.Segmentation.get(volume);
                    if (!segmentation)
                        throw new Error('missing volume segmentation');
                    ctx.runtime.update({ message: 'Marching cubes...' });
                    bbox = box3d_1.Box3D.clone(segmentation.bounds[key]);
                    box3d_1.Box3D.expand(bbox, bbox, linear_algebra_1.Vec3.create(2, 2, 2));
                    set = Array.from(segmentation.segments.get(key).values());
                    cells = getSegmentCells(set, bbox, volume.grid.cells);
                    ids = (0, array_1.fillSerial)(new Int32Array(cells.data.length));
                    return [4 /*yield*/, (0, algorithm_1.computeMarchingCubesMesh)({
                            isoLevel: 128,
                            scalarField: cells,
                            idField: linear_algebra_1.Tensor.create(cells.space, linear_algebra_1.Tensor.Data1(ids))
                        }, mesh).runAsChild(ctx.runtime)];
                case 1:
                    surface = _a.sent();
                    transform = getSegmentTransform(volume.grid, bbox);
                    mesh_1.Mesh.transform(surface, transform);
                    if (ctx.webgl && !ctx.webgl.isWebGL2) {
                        // 2nd arg means not to split triangles based on group id. Splitting triangles
                        // is too expensive if each cell has its own group id as is the case here.
                        mesh_1.Mesh.uniformTriangleGroup(surface, false);
                        value_cell_1.ValueCell.updateIfChanged(surface.varyingGroup, false);
                    }
                    else {
                        value_cell_1.ValueCell.updateIfChanged(surface.varyingGroup, true);
                    }
                    surface.setBoundingSphere(volume_1.Volume.Segment.getBoundingSphere(volume, [key]));
                    return [2 /*return*/, surface];
            }
        });
    });
}
exports.createVolumeSegmentMesh = createVolumeSegmentMesh;
exports.SegmentMeshParams = tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, mesh_1.Mesh.Params), texture_mesh_1.TextureMesh.Params), exports.VolumeSegmentParams), { quality: tslib_1.__assign(tslib_1.__assign({}, mesh_1.Mesh.Params.quality), { isEssential: false }), tryUseGpu: param_definition_1.ParamDefinition.Boolean(true) });
function SegmentMeshVisual(materialId) {
    return (0, representation_1.VolumeVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.SegmentMeshParams),
        createGeometry: createVolumeSegmentMesh,
        createLocationIterator: function (volume, key) {
            var l = volume_1.Volume.Segment.Location(volume, key);
            return (0, location_iterator_1.LocationIterator)(volume.grid.cells.data.length, 1, 1, function () { return l; });
        },
        getLoci: getSegmentLoci,
        eachLocation: eachSegment,
        setUpdateState: function (state, volume, newProps, currentProps) {
        },
        geometryUtils: mesh_1.Mesh.Utils,
        mustRecreate: function (volumeKey, props, webgl) {
            return props.tryUseGpu && !!webgl && suitableForGpu(volumeKey.volume, webgl);
        }
    }, materialId);
}
exports.SegmentMeshVisual = SegmentMeshVisual;
//
var SegmentTextureName = 'segment-texture';
function getSegmentTexture(volume, segment, webgl) {
    var segmentation = volume_1.Volume.Segmentation.get(volume);
    if (!segmentation)
        throw new Error('missing volume segmentation');
    var resources = webgl.resources;
    var bbox = box3d_1.Box3D.clone(segmentation.bounds[segment]);
    box3d_1.Box3D.expand(bbox, bbox, linear_algebra_1.Vec3.create(2, 2, 2));
    var transform = getSegmentTransform(volume.grid, bbox);
    var gridDimension = box3d_1.Box3D.size((0, linear_algebra_1.Vec3)(), bbox);
    var _a = (0, util_1.getVolumeTexture2dLayout)(gridDimension, Padding), width = _a.width, height = _a.height, texDim = _a.powerOfTwoSize;
    var gridTexDim = linear_algebra_1.Vec3.create(width, height, 0);
    var gridTexScale = linear_algebra_1.Vec2.create(width / texDim, height / texDim);
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
    texture.load((0, util_1.createSegmentTexture2d)(volume, set, bbox, Padding), true);
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
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _a, texture, gridDimension, gridTexDim, gridTexScale, transform, axisOrder, buffer, gv, groupCount, surface;
        return tslib_1.__generator(this, function (_b) {
            if (!ctx.webgl)
                throw new Error('webgl context required to create volume segment texture-mesh');
            if (volume.grid.cells.data.length <= 1) {
                return [2 /*return*/, texture_mesh_1.TextureMesh.createEmpty(textureMesh)];
            }
            _a = getSegmentTexture(volume, segment, ctx.webgl), texture = _a.texture, gridDimension = _a.gridDimension, gridTexDim = _a.gridTexDim, gridTexScale = _a.gridTexScale, transform = _a.transform;
            axisOrder = volume.grid.cells.space.axisOrderSlowToFast;
            buffer = textureMesh === null || textureMesh === void 0 ? void 0 : textureMesh.doubleBuffer.get();
            gv = (0, isosurface_1.extractIsosurface)(ctx.webgl, texture, gridDimension, gridTexDim, gridTexScale, transform, 0.5, false, false, axisOrder, true, buffer === null || buffer === void 0 ? void 0 : buffer.vertex, buffer === null || buffer === void 0 ? void 0 : buffer.group, buffer === null || buffer === void 0 ? void 0 : buffer.normal);
            groupCount = volume.grid.cells.data.length;
            surface = texture_mesh_1.TextureMesh.create(gv.vertexCount, groupCount, gv.vertexTexture, gv.groupTexture, gv.normalTexture, volume_1.Volume.Segment.getBoundingSphere(volume, [segment]), textureMesh);
            return [2 /*return*/, surface];
        });
    });
}
function SegmentTextureMeshVisual(materialId) {
    return (0, representation_1.VolumeVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.SegmentMeshParams),
        createGeometry: createVolumeSegmentTextureMesh,
        createLocationIterator: function (volume, segment) {
            var l = volume_1.Volume.Segment.Location(volume, segment);
            return (0, location_iterator_1.LocationIterator)(volume.grid.cells.data.length, 1, 1, function () { return l; });
        },
        getLoci: getSegmentLoci,
        eachLocation: eachSegment,
        setUpdateState: function (state, volume, newProps, currentProps) {
        },
        geometryUtils: texture_mesh_1.TextureMesh.Utils,
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
exports.SegmentTextureMeshVisual = SegmentTextureMeshVisual;
//
function getSegments(props) {
    return int_1.SortedArray.ofUnsortedArray(props.segments);
}
var SegmentVisuals = {
    'segment': function (ctx, getParams) { return (0, representation_1.VolumeRepresentation)('Segment mesh', ctx, getParams, SegmentVisual, getLoci, getSegments); },
};
exports.SegmentParams = tslib_1.__assign(tslib_1.__assign({}, exports.SegmentMeshParams), { visuals: param_definition_1.ParamDefinition.MultiSelect(['segment'], param_definition_1.ParamDefinition.objectToOptions(SegmentVisuals)), bumpFrequency: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 10, step: 0.1 }, base_1.BaseGeometry.ShadingCategory) });
function getSegmentParams(ctx, volume) {
    var p = param_definition_1.ParamDefinition.clone(exports.SegmentParams);
    var segmentation = volume_1.Volume.Segmentation.get(volume);
    if (segmentation) {
        var segments = Array.from(segmentation.segments.keys());
        p.segments = param_definition_1.ParamDefinition.Converted(function (v) { return v.map(function (x) { return "".concat(x); }); }, function (v) { return v.map(function (x) { return parseInt(x); }); }, param_definition_1.ParamDefinition.MultiSelect(segments.map(function (x) { return "".concat(x); }), param_definition_1.ParamDefinition.arrayToOptions(segments.map(function (x) { return "".concat(x); })), {
            isEssential: true
        }));
    }
    return p;
}
exports.getSegmentParams = getSegmentParams;
function SegmentRepresentation(ctx, getParams) {
    return representation_2.Representation.createMulti('Segment', ctx, getParams, representation_2.Representation.StateBuilder, SegmentVisuals);
}
exports.SegmentRepresentation = SegmentRepresentation;
exports.SegmentRepresentationProvider = (0, representation_1.VolumeRepresentationProvider)({
    name: 'segment',
    label: 'Segment',
    description: 'Displays a triangulated segment of volumetric data.',
    factory: SegmentRepresentation,
    getParams: getSegmentParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.SegmentParams),
    defaultColorTheme: { name: 'volume-segment' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: function (volume) { return !volume_1.Volume.isEmpty(volume) && !!volume_1.Volume.Segmentation.get(volume); }
});
