/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { __assign, __awaiter, __extends, __generator } from "tslib";
/** Defines new types of State tree transformers for dealing with mesh data. */
import { BaseGeometry, VisualQualityOptions } from '../../mol-geo/geometry/base';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { Box3D } from '../../mol-math/geometry';
import { Vec3 } from '../../mol-math/linear-algebra';
import { Shape } from '../../mol-model/shape';
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { StateTransforms } from '../../mol-plugin-state/transforms';
import { Download } from '../../mol-plugin-state/transforms/data';
import { ShapeRepresentation3D } from '../../mol-plugin-state/transforms/representation';
import { StateTransformer } from '../../mol-state';
import { Task } from '../../mol-task';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import * as MeshUtils from './mesh-utils';
export var BACKGROUND_OPACITY = 0.2;
export var FOREROUND_OPACITY = 1;
export var VolsegTransform = StateTransformer.builderFactory('volseg');
export var MeshlistData;
(function (MeshlistData) {
    function empty() {
        return {
            segmentId: 0,
            segmentName: 'Empty',
            detail: 0,
            meshIds: [],
            mesh: Mesh.createEmpty(),
        };
    }
    MeshlistData.empty = empty;
    ;
    function fromCIF(data, segmentId, segmentName, detail) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, mesh, meshIds;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, MeshUtils.meshFromCif(data)];
                    case 1:
                        _a = _b.sent(), mesh = _a.mesh, meshIds = _a.meshIds;
                        return [2 /*return*/, {
                                segmentId: segmentId,
                                segmentName: segmentName,
                                detail: detail,
                                meshIds: meshIds,
                                mesh: mesh,
                            }];
                }
            });
        });
    }
    MeshlistData.fromCIF = fromCIF;
    function stats(meshListData) {
        return "Meshlist \"".concat(meshListData.segmentName, "\" (detail ").concat(meshListData.detail, "): ").concat(meshListData.meshIds.length, " meshes, ").concat(meshListData.mesh.vertexCount, " vertices, ").concat(meshListData.mesh.triangleCount, " triangles");
    }
    MeshlistData.stats = stats;
    function getShape(data, color) {
        var mesh = data.mesh;
        var meshShape = Shape.create(data.segmentName, data, mesh, function () { return color; }, function () { return 1; }, 
        // group => `${data.segmentName} | Segment ${data.segmentId} | Detail ${data.detail} | Mesh ${group}`,
        function (group) { return data.segmentName; });
        return meshShape;
    }
    MeshlistData.getShape = getShape;
    function combineBBoxes(boxes) {
        var result = null;
        for (var _i = 0, boxes_1 = boxes; _i < boxes_1.length; _i++) {
            var box = boxes_1[_i];
            if (!box)
                continue;
            if (result) {
                Vec3.min(result.min, result.min, box.min);
                Vec3.max(result.max, result.max, box.max);
            }
            else {
                result = Box3D.zero();
                Box3D.copy(result, box);
            }
        }
        return result;
    }
    MeshlistData.combineBBoxes = combineBBoxes;
    function bbox(data) {
        return MeshUtils.bbox(data.mesh);
    }
    MeshlistData.bbox = bbox;
    function allVerticesUsed(data) {
        var unusedVertices = new Set();
        for (var i = 0; i < data.mesh.vertexCount; i++) {
            unusedVertices.add(i);
        }
        for (var i = 0; i < 3 * data.mesh.triangleCount; i++) {
            var v = data.mesh.vertexBuffer.ref.value[i];
            unusedVertices.delete(v);
        }
        return unusedVertices.size === 0;
    }
    MeshlistData.allVerticesUsed = allVerticesUsed;
})(MeshlistData || (MeshlistData = {}));
// // // // // // // // // // // // // // // // // // // // // // // //
// Raw Data -> Parsed data
var MeshlistStateObject = /** @class */ (function (_super) {
    __extends(MeshlistStateObject, _super);
    function MeshlistStateObject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MeshlistStateObject;
}(PluginStateObject.Create({ name: 'Parsed Meshlist', typeClass: 'Object' })));
export { MeshlistStateObject };
export var ParseMeshlistTransformer = VolsegTransform({
    name: 'meshlist-from-string',
    from: PluginStateObject.Format.Cif,
    to: MeshlistStateObject,
    params: {
        label: PD.Text(MeshlistStateObject.type.name, { isHidden: true }),
        segmentId: PD.Numeric(1, {}, { isHidden: true }),
        segmentName: PD.Text('Segment'),
        detail: PD.Numeric(1, {}, { isHidden: true }),
        /** Reference to the object which manages this meshlist (e.g. `MeshStreaming.Behavior`) */
        ownerId: PD.Text('', { isHidden: true }),
    }
})({
    apply: function (_a, globalCtx) {
        var _this = this;
        var a = _a.a, params = _a.params;
        return Task.create('Create Parsed Meshlist', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var meshlistData, es;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, MeshlistData.fromCIF(a.data, params.segmentId, params.segmentName, params.detail)];
                    case 1:
                        meshlistData = _a.sent();
                        meshlistData.ownerId = params.ownerId;
                        es = meshlistData.meshIds.length === 1 ? '' : 'es';
                        return [2 /*return*/, new MeshlistStateObject(meshlistData, { label: params.label, description: "".concat(meshlistData.segmentName, " (").concat(meshlistData.meshIds.length, " mesh").concat(es, ")") })];
                }
            });
        }); });
    }
});
var MeshShapeProvider;
(function (MeshShapeProvider) {
    function fromMeshlistData(meshlist, color) {
        var theColor = color !== null && color !== void 0 ? color : MeshUtils.ColorGenerator.next().value;
        return {
            label: 'Mesh',
            data: meshlist,
            params: meshShapeProviderParams,
            geometryUtils: Mesh.Utils,
            getShape: function (ctx, data) { return MeshlistData.getShape(data, theColor); },
        };
    }
    MeshShapeProvider.fromMeshlistData = fromMeshlistData;
})(MeshShapeProvider || (MeshShapeProvider = {}));
var meshShapeProviderParams = __assign(__assign({}, Mesh.Params), { quality: PD.Select('custom', VisualQualityOptions, { isEssential: true, description: 'Visual/rendering quality of the representation.' }), doubleSided: PD.Boolean(true, BaseGeometry.CustomQualityParamInfo), 
    // set `flatShaded`: true to see the real mesh vertices and triangles
    transparentBackfaces: PD.Select('on', PD.arrayToOptions(['off', 'on', 'opaque']), BaseGeometry.ShadingCategory) });
export var MeshShapeTransformer = VolsegTransform({
    name: 'shape-from-meshlist',
    display: { name: 'Shape from Meshlist', description: 'Create Shape from Meshlist data' },
    from: MeshlistStateObject,
    to: PluginStateObject.Shape.Provider,
    params: {
        color: PD.Value(undefined), // undefined means random color
    },
})({
    apply: function (_a) {
        var a = _a.a, params = _a.params;
        var shapeProvider = MeshShapeProvider.fromMeshlistData(a.data, params.color);
        return new PluginStateObject.Shape.Provider(shapeProvider, { label: PluginStateObject.Shape.Provider.type.name, description: a.description });
    }
});
// // // // // // // // // // // // // // // // // // // // // // // //
/** Download data and create state tree hierarchy down to visual representation. */
export function createMeshFromUrl(plugin, meshDataUrl, segmentId, detail, collapseTree, color, parent, transparentIfBboxAbove, name, ownerId) {
    return __awaiter(this, void 0, void 0, function () {
        var update, rawDataNodeRef, parsedDataNode, transparent, bbox;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    update = parent ? plugin.build().to(parent) : plugin.build().toRoot();
                    rawDataNodeRef = update.apply(Download, { url: meshDataUrl, isBinary: true, label: "Downloaded Data ".concat(segmentId) }, { state: { isCollapsed: collapseTree } }).ref;
                    return [4 /*yield*/, update.to(rawDataNodeRef)
                            .apply(StateTransforms.Data.ParseCif)
                            .apply(ParseMeshlistTransformer, { label: undefined, segmentId: segmentId, segmentName: name !== null && name !== void 0 ? name : "Segment ".concat(segmentId), detail: detail, ownerId: ownerId }, {})
                            .commit()];
                case 1:
                    parsedDataNode = _a.sent();
                    transparent = false;
                    if (transparentIfBboxAbove !== undefined && parsedDataNode.data) {
                        bbox = MeshlistData.bbox(parsedDataNode.data) || Box3D.zero();
                        transparent = Box3D.volume(bbox) > transparentIfBboxAbove;
                    }
                    return [4 /*yield*/, plugin.build().to(parsedDataNode)
                            .apply(MeshShapeTransformer, { color: color })
                            .apply(ShapeRepresentation3D, { alpha: transparent ? BACKGROUND_OPACITY : FOREROUND_OPACITY }, { tags: ['mesh-segment-visual', "segment-".concat(segmentId)] })
                            .commit()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, rawDataNodeRef];
            }
        });
    });
}
