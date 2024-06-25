"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitMeshStreaming = exports.MeshVisualTransformer = exports.MeshVisualGroupTransformer = exports.MeshStreamingTransformer = exports.MeshServerTransformer = void 0;
var tslib_1 = require("tslib");
var mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
var objects_1 = require("../../../mol-plugin-state/objects");
var representation_1 = require("../../../mol-repr/shape/representation");
var mol_state_1 = require("../../../mol-state");
var mol_task_1 = require("../../../mol-task");
var mol_util_1 = require("../../../mol-util");
var param_definition_1 = require("../../../mol-util/param-definition");
var mesh_extension_1 = require("../mesh-extension");
var behavior_1 = require("./behavior");
var server_info_1 = require("./server-info");
// // // // // // // // // // // // // // // // // // // // // // // //
exports.MeshServerTransformer = (0, mesh_extension_1.VolsegTransform)({
    name: 'mesh-server-info',
    from: objects_1.PluginStateObject.Root,
    to: server_info_1.MeshServerInfo,
    params: server_info_1.MeshServerInfo.Params,
})({
    apply: function (_a, plugin) {
        var a = _a.a, params = _a.params;
        params.serverUrl = params.serverUrl.replace(/\/*$/, ''); // trim trailing slash
        var description = params.entryId;
        return new server_info_1.MeshServerInfo(tslib_1.__assign({}, params), { label: 'Mesh Server', description: description });
    }
});
// // // // // // // // // // // // // // // // // // // // // // // //
exports.MeshStreamingTransformer = (0, mesh_extension_1.VolsegTransform)({
    name: 'mesh-streaming-from-server-info',
    display: { name: 'Mesh Streaming' },
    from: server_info_1.MeshServerInfo,
    to: behavior_1.MeshStreaming,
    params: function (a) { return behavior_1.MeshStreaming.Params.create(a.data); },
})({
    canAutoUpdate: function () { return true; },
    apply: function (_a, plugin) {
        var _this = this;
        var a = _a.a, params = _a.params;
        return mol_task_1.Task.create('Mesh Streaming', function (ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var behavior;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        behavior = new behavior_1.MeshStreaming.Behavior(plugin, a.data, params);
                        return [4 /*yield*/, behavior.update(params)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, new behavior_1.MeshStreaming(behavior, { label: 'Mesh Streaming', description: behavior.getDescription() })];
                }
            });
        }); });
    },
    update: function (_a) {
        var _this = this;
        var a = _a.a, b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams;
        return mol_task_1.Task.create('Update Mesh Streaming', function (ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (a.data.source !== b.data.parentData.source || a.data.entryId !== b.data.parentData.entryId) {
                            return [2 /*return*/, mol_state_1.StateTransformer.UpdateResult.Recreate];
                        }
                        b.data.parentData = a.data;
                        return [4 /*yield*/, b.data.update(newParams)];
                    case 1:
                        _a.sent();
                        b.description = b.data.getDescription();
                        return [2 /*return*/, mol_state_1.StateTransformer.UpdateResult.Updated];
                }
            });
        }); });
    }
});
// export type MeshVisualGroupTransformer = typeof MeshVisualGroupTransformer;
exports.MeshVisualGroupTransformer = (0, mesh_extension_1.VolsegTransform)({
    name: 'mesh-visual-group-from-streaming',
    display: { name: 'Mesh Visuals for a Segment' },
    from: behavior_1.MeshStreaming,
    to: objects_1.PluginStateObject.Group,
    params: {
        /** Shown on the node in GUI */
        label: param_definition_1.ParamDefinition.Text('', { isHidden: true }),
        /** Shown on the node in GUI (gray letters) */
        description: param_definition_1.ParamDefinition.Text(''),
        segmentId: param_definition_1.ParamDefinition.Numeric(behavior_1.NO_SEGMENT, {}, { isHidden: true }),
        opacity: param_definition_1.ParamDefinition.Numeric(-1, { min: 0, max: 1, step: 0.01 }),
    }
})({
    apply: function (_a, plugin) {
        var a = _a.a, params = _a.params;
        trySetAutoOpacity(params, a);
        return new objects_1.PluginStateObject.Group({ opacity: params.opacity }, params);
    },
    update: function (_a, plugin) {
        var a = _a.a, b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams;
        if ((0, mol_util_1.shallowEqualObjects)(oldParams, newParams)) {
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        }
        newParams.label || (newParams.label = oldParams.label); // Protect against resetting params to invalid defaults
        if (newParams.segmentId === behavior_1.NO_SEGMENT)
            newParams.segmentId = oldParams.segmentId; // Protect against resetting params to invalid defaults
        trySetAutoOpacity(newParams, a);
        b.label = newParams.label;
        b.description = newParams.description;
        b.data.opacity = newParams.opacity;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    },
    canAutoUpdate: function (_a, plugin) {
        var oldParams = _a.oldParams, newParams = _a.newParams;
        return newParams.description === oldParams.description;
    },
});
function trySetAutoOpacity(params, parent) {
    if (params.opacity === -1) {
        var isBgSegment = parent.data.backgroundSegments[params.segmentId];
        if (isBgSegment !== undefined) {
            params.opacity = isBgSegment ? mesh_extension_1.BACKGROUND_OPACITY : mesh_extension_1.FOREROUND_OPACITY;
        }
    }
}
// // // // // // // // // // // // // // // // // // // // // // // //
exports.MeshVisualTransformer = (0, mesh_extension_1.VolsegTransform)({
    name: 'mesh-visual-from-streaming',
    display: { name: 'Mesh Visual from Streaming' },
    from: behavior_1.MeshStreaming,
    to: objects_1.PluginStateObject.Shape.Representation3D,
    params: {
        /** Must be set to PluginStateObject reference to self */
        ref: param_definition_1.ParamDefinition.Text('', { isHidden: true, isEssential: true }),
        /** Identification of the mesh visual, e.g. 'low-2' */
        tag: param_definition_1.ParamDefinition.Text('', { isHidden: true, isEssential: true }),
        /** Opacity of the visual (not to be set directly, but controlled by the opacity of the parent Group, and by VisualInfo.visible) */
        opacity: param_definition_1.ParamDefinition.Numeric(-1, { min: 0, max: 1, step: 0.01 }, { isHidden: true }),
    }
})({
    apply: function (_a, plugin) {
        var _this = this;
        var a = _a.a, params = _a.params, spine = _a.spine;
        return mol_task_1.Task.create('Mesh Visual', function (ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var visualInfo, groupData, props, repr;
            var _a, _b, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        visualInfo = a.data.visuals[params.tag];
                        if (!visualInfo)
                            throw new Error("VisualInfo with tag '".concat(params.tag, "' is missing."));
                        groupData = (_a = spine.getAncestorOfType(objects_1.PluginStateObject.Group)) === null || _a === void 0 ? void 0 : _a.data;
                        params.opacity = visualInfo.visible ? ((_b = groupData === null || groupData === void 0 ? void 0 : groupData.opacity) !== null && _b !== void 0 ? _b : mesh_extension_1.FOREROUND_OPACITY) : 0.0;
                        props = param_definition_1.ParamDefinition.getDefaultValues(mesh_1.Mesh.Params);
                        props.flatShaded = true; // `flatShaded: true` is to see the real mesh vertices and triangles (default: false)
                        props.alpha = params.opacity;
                        repr = (0, representation_1.ShapeRepresentation)(function (ctx, meshlist) { return mesh_extension_1.MeshlistData.getShape(meshlist, visualInfo.color); }, mesh_1.Mesh.Utils);
                        return [4 /*yield*/, repr.createOrUpdate(props, (_c = visualInfo.data) !== null && _c !== void 0 ? _c : mesh_extension_1.MeshlistData.empty()).runInContext(ctx)];
                    case 1:
                        _d.sent();
                        return [2 /*return*/, new objects_1.PluginStateObject.Shape.Representation3D({ repr: repr, sourceData: visualInfo.data }, { label: 'Mesh Visual', description: params.tag })];
                }
            });
        }); });
    },
    update: function (_a, plugin) {
        var _this = this;
        var a = _a.a, b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams, spine = _a.spine;
        return mol_task_1.Task.create('Update Mesh Visual', function (ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var visualInfo, oldData, groupData, newOpacity;
            var _a, _b, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        newParams.ref || (newParams.ref = oldParams.ref); // Protect against resetting params to invalid defaults
                        newParams.tag || (newParams.tag = oldParams.tag); // Protect against resetting params to invalid defaults
                        visualInfo = a.data.visuals[newParams.tag];
                        if (!visualInfo)
                            throw new Error("VisualInfo with tag '".concat(newParams.tag, "' is missing."));
                        oldData = b.data.sourceData;
                        if (((_a = visualInfo.data) === null || _a === void 0 ? void 0 : _a.detail) !== (oldData === null || oldData === void 0 ? void 0 : oldData.detail)) {
                            return [2 /*return*/, mol_state_1.StateTransformer.UpdateResult.Recreate];
                        }
                        groupData = (_b = spine.getAncestorOfType(objects_1.PluginStateObject.Group)) === null || _b === void 0 ? void 0 : _b.data;
                        newOpacity = visualInfo.visible ? ((_c = groupData === null || groupData === void 0 ? void 0 : groupData.opacity) !== null && _c !== void 0 ? _c : mesh_extension_1.FOREROUND_OPACITY) : 0.0;
                        if (!(newOpacity !== oldParams.opacity)) return [3 /*break*/, 2];
                        newParams.opacity = newOpacity;
                        return [4 /*yield*/, b.data.repr.createOrUpdate({ alpha: newParams.opacity }).runInContext(ctx)];
                    case 1:
                        _d.sent();
                        return [2 /*return*/, mol_state_1.StateTransformer.UpdateResult.Updated];
                    case 2: return [2 /*return*/, mol_state_1.StateTransformer.UpdateResult.Unchanged];
                }
            });
        }); });
    },
    canAutoUpdate: function (params, globalCtx) {
        return true;
    },
    dispose: function (_a, plugin) {
        var b = _a.b, params = _a.params;
        b === null || b === void 0 ? void 0 : b.data.repr.destroy(); // QUESTION is this correct?
    },
});
// // // // // // // // // // // // // // // // // // // // // // // //
exports.InitMeshStreaming = mol_state_1.StateAction.build({
    display: { name: 'Mesh Streaming' },
    from: objects_1.PluginStateObject.Root,
    params: server_info_1.MeshServerInfo.Params,
    isApplicable: function (a, _, plugin) { return true; }
})(function (p, plugin) {
    var _this = this;
    return mol_task_1.Task.create('Mesh Streaming', function (ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var params, serverNode, streamingNode, visuals, bgSegments, segmentGroups, _a, _b, _c, _i, tag, segid, description, group, visualsUpdate, tag, ref, segid;
        var _d, _e, _f, _g;
        return tslib_1.__generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    params = p.params;
                    return [4 /*yield*/, plugin.build().to(p.ref).apply(exports.MeshServerTransformer, params).commit()];
                case 1:
                    serverNode = _h.sent();
                    return [4 /*yield*/, plugin.build().to(serverNode).apply(exports.MeshStreamingTransformer, {}).commit()];
                case 2:
                    streamingNode = _h.sent();
                    visuals = (_e = (_d = streamingNode.data) === null || _d === void 0 ? void 0 : _d.visuals) !== null && _e !== void 0 ? _e : {};
                    bgSegments = (_g = (_f = streamingNode.data) === null || _f === void 0 ? void 0 : _f.backgroundSegments) !== null && _g !== void 0 ? _g : {};
                    segmentGroups = {};
                    _a = visuals;
                    _b = [];
                    for (_c in _a)
                        _b.push(_c);
                    _i = 0;
                    _h.label = 3;
                case 3:
                    if (!(_i < _b.length)) return [3 /*break*/, 6];
                    _c = _b[_i];
                    if (!(_c in _a)) return [3 /*break*/, 5];
                    tag = _c;
                    segid = visuals[tag].segmentId;
                    if (!!segmentGroups[segid]) return [3 /*break*/, 5];
                    description = visuals[tag].segmentName;
                    if (bgSegments[segid])
                        description += ' (background)';
                    return [4 /*yield*/, plugin.build().to(streamingNode).apply(exports.MeshVisualGroupTransformer, { label: "Segment ".concat(segid), description: description, segmentId: segid }, { state: { isCollapsed: true } }).commit()];
                case 4:
                    group = _h.sent();
                    segmentGroups[segid] = group.ref;
                    _h.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    visualsUpdate = plugin.build();
                    for (tag in visuals) {
                        ref = "".concat(streamingNode.ref, "-").concat(tag);
                        segid = visuals[tag].segmentId;
                        visualsUpdate.to(segmentGroups[segid]).apply(exports.MeshVisualTransformer, { ref: ref, tag: tag }, { ref: ref }); // ref - hack to allow the node make itself invisible
                    }
                    return [4 /*yield*/, plugin.state.data.updateTree(visualsUpdate).runInContext(ctx)];
                case 7:
                    _h.sent(); // QUESTION what is really the difference between this and `visualsUpdate.commit()`?
                    return [2 /*return*/];
            }
        });
    }); });
});
// TODO make available in GUI, in left panel or in right panel like Volume Streaming in src/mol-plugin-ui/structure/volume.tsx?
