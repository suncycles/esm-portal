/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { __assign, __awaiter, __generator } from "tslib";
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { PluginStateObject } from '../../../mol-plugin-state/objects';
import { ShapeRepresentation } from '../../../mol-repr/shape/representation';
import { StateAction, StateTransformer } from '../../../mol-state';
import { Task } from '../../../mol-task';
import { shallowEqualObjects } from '../../../mol-util';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { BACKGROUND_OPACITY, FOREROUND_OPACITY, MeshlistData, VolsegTransform } from '../mesh-extension';
import { MeshStreaming, NO_SEGMENT } from './behavior';
import { MeshServerInfo } from './server-info';
// // // // // // // // // // // // // // // // // // // // // // // //
export var MeshServerTransformer = VolsegTransform({
    name: 'mesh-server-info',
    from: PluginStateObject.Root,
    to: MeshServerInfo,
    params: MeshServerInfo.Params,
})({
    apply: function (_a, plugin) {
        var a = _a.a, params = _a.params;
        params.serverUrl = params.serverUrl.replace(/\/*$/, ''); // trim trailing slash
        var description = params.entryId;
        return new MeshServerInfo(__assign({}, params), { label: 'Mesh Server', description: description });
    }
});
// // // // // // // // // // // // // // // // // // // // // // // //
export var MeshStreamingTransformer = VolsegTransform({
    name: 'mesh-streaming-from-server-info',
    display: { name: 'Mesh Streaming' },
    from: MeshServerInfo,
    to: MeshStreaming,
    params: function (a) { return MeshStreaming.Params.create(a.data); },
})({
    canAutoUpdate: function () { return true; },
    apply: function (_a, plugin) {
        var _this = this;
        var a = _a.a, params = _a.params;
        return Task.create('Mesh Streaming', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var behavior;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        behavior = new MeshStreaming.Behavior(plugin, a.data, params);
                        return [4 /*yield*/, behavior.update(params)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, new MeshStreaming(behavior, { label: 'Mesh Streaming', description: behavior.getDescription() })];
                }
            });
        }); });
    },
    update: function (_a) {
        var _this = this;
        var a = _a.a, b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams;
        return Task.create('Update Mesh Streaming', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (a.data.source !== b.data.parentData.source || a.data.entryId !== b.data.parentData.entryId) {
                            return [2 /*return*/, StateTransformer.UpdateResult.Recreate];
                        }
                        b.data.parentData = a.data;
                        return [4 /*yield*/, b.data.update(newParams)];
                    case 1:
                        _a.sent();
                        b.description = b.data.getDescription();
                        return [2 /*return*/, StateTransformer.UpdateResult.Updated];
                }
            });
        }); });
    }
});
// export type MeshVisualGroupTransformer = typeof MeshVisualGroupTransformer;
export var MeshVisualGroupTransformer = VolsegTransform({
    name: 'mesh-visual-group-from-streaming',
    display: { name: 'Mesh Visuals for a Segment' },
    from: MeshStreaming,
    to: PluginStateObject.Group,
    params: {
        /** Shown on the node in GUI */
        label: PD.Text('', { isHidden: true }),
        /** Shown on the node in GUI (gray letters) */
        description: PD.Text(''),
        segmentId: PD.Numeric(NO_SEGMENT, {}, { isHidden: true }),
        opacity: PD.Numeric(-1, { min: 0, max: 1, step: 0.01 }),
    }
})({
    apply: function (_a, plugin) {
        var a = _a.a, params = _a.params;
        trySetAutoOpacity(params, a);
        return new PluginStateObject.Group({ opacity: params.opacity }, params);
    },
    update: function (_a, plugin) {
        var a = _a.a, b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams;
        if (shallowEqualObjects(oldParams, newParams)) {
            return StateTransformer.UpdateResult.Unchanged;
        }
        newParams.label || (newParams.label = oldParams.label); // Protect against resetting params to invalid defaults
        if (newParams.segmentId === NO_SEGMENT)
            newParams.segmentId = oldParams.segmentId; // Protect against resetting params to invalid defaults
        trySetAutoOpacity(newParams, a);
        b.label = newParams.label;
        b.description = newParams.description;
        b.data.opacity = newParams.opacity;
        return StateTransformer.UpdateResult.Updated;
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
            params.opacity = isBgSegment ? BACKGROUND_OPACITY : FOREROUND_OPACITY;
        }
    }
}
// // // // // // // // // // // // // // // // // // // // // // // //
export var MeshVisualTransformer = VolsegTransform({
    name: 'mesh-visual-from-streaming',
    display: { name: 'Mesh Visual from Streaming' },
    from: MeshStreaming,
    to: PluginStateObject.Shape.Representation3D,
    params: {
        /** Must be set to PluginStateObject reference to self */
        ref: PD.Text('', { isHidden: true, isEssential: true }),
        /** Identification of the mesh visual, e.g. 'low-2' */
        tag: PD.Text('', { isHidden: true, isEssential: true }),
        /** Opacity of the visual (not to be set directly, but controlled by the opacity of the parent Group, and by VisualInfo.visible) */
        opacity: PD.Numeric(-1, { min: 0, max: 1, step: 0.01 }, { isHidden: true }),
    }
})({
    apply: function (_a, plugin) {
        var _this = this;
        var a = _a.a, params = _a.params, spine = _a.spine;
        return Task.create('Mesh Visual', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var visualInfo, groupData, props, repr;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        visualInfo = a.data.visuals[params.tag];
                        if (!visualInfo)
                            throw new Error("VisualInfo with tag '".concat(params.tag, "' is missing."));
                        groupData = (_a = spine.getAncestorOfType(PluginStateObject.Group)) === null || _a === void 0 ? void 0 : _a.data;
                        params.opacity = visualInfo.visible ? ((_b = groupData === null || groupData === void 0 ? void 0 : groupData.opacity) !== null && _b !== void 0 ? _b : FOREROUND_OPACITY) : 0.0;
                        props = PD.getDefaultValues(Mesh.Params);
                        props.flatShaded = true; // `flatShaded: true` is to see the real mesh vertices and triangles (default: false)
                        props.alpha = params.opacity;
                        repr = ShapeRepresentation(function (ctx, meshlist) { return MeshlistData.getShape(meshlist, visualInfo.color); }, Mesh.Utils);
                        return [4 /*yield*/, repr.createOrUpdate(props, (_c = visualInfo.data) !== null && _c !== void 0 ? _c : MeshlistData.empty()).runInContext(ctx)];
                    case 1:
                        _d.sent();
                        return [2 /*return*/, new PluginStateObject.Shape.Representation3D({ repr: repr, sourceData: visualInfo.data }, { label: 'Mesh Visual', description: params.tag })];
                }
            });
        }); });
    },
    update: function (_a, plugin) {
        var _this = this;
        var a = _a.a, b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams, spine = _a.spine;
        return Task.create('Update Mesh Visual', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var visualInfo, oldData, groupData, newOpacity;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        newParams.ref || (newParams.ref = oldParams.ref); // Protect against resetting params to invalid defaults
                        newParams.tag || (newParams.tag = oldParams.tag); // Protect against resetting params to invalid defaults
                        visualInfo = a.data.visuals[newParams.tag];
                        if (!visualInfo)
                            throw new Error("VisualInfo with tag '".concat(newParams.tag, "' is missing."));
                        oldData = b.data.sourceData;
                        if (((_a = visualInfo.data) === null || _a === void 0 ? void 0 : _a.detail) !== (oldData === null || oldData === void 0 ? void 0 : oldData.detail)) {
                            return [2 /*return*/, StateTransformer.UpdateResult.Recreate];
                        }
                        groupData = (_b = spine.getAncestorOfType(PluginStateObject.Group)) === null || _b === void 0 ? void 0 : _b.data;
                        newOpacity = visualInfo.visible ? ((_c = groupData === null || groupData === void 0 ? void 0 : groupData.opacity) !== null && _c !== void 0 ? _c : FOREROUND_OPACITY) : 0.0;
                        if (!(newOpacity !== oldParams.opacity)) return [3 /*break*/, 2];
                        newParams.opacity = newOpacity;
                        return [4 /*yield*/, b.data.repr.createOrUpdate({ alpha: newParams.opacity }).runInContext(ctx)];
                    case 1:
                        _d.sent();
                        return [2 /*return*/, StateTransformer.UpdateResult.Updated];
                    case 2: return [2 /*return*/, StateTransformer.UpdateResult.Unchanged];
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
export var InitMeshStreaming = StateAction.build({
    display: { name: 'Mesh Streaming' },
    from: PluginStateObject.Root,
    params: MeshServerInfo.Params,
    isApplicable: function (a, _, plugin) { return true; }
})(function (p, plugin) {
    var _this = this;
    return Task.create('Mesh Streaming', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
        var params, serverNode, streamingNode, visuals, bgSegments, segmentGroups, _a, _b, _c, _i, tag, segid, description, group, visualsUpdate, tag, ref, segid;
        var _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    params = p.params;
                    return [4 /*yield*/, plugin.build().to(p.ref).apply(MeshServerTransformer, params).commit()];
                case 1:
                    serverNode = _h.sent();
                    return [4 /*yield*/, plugin.build().to(serverNode).apply(MeshStreamingTransformer, {}).commit()];
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
                    return [4 /*yield*/, plugin.build().to(streamingNode).apply(MeshVisualGroupTransformer, { label: "Segment ".concat(segid), description: description, segmentId: segid }, { state: { isCollapsed: true } }).commit()];
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
                        visualsUpdate.to(segmentGroups[segid]).apply(MeshVisualTransformer, { ref: ref, tag: tag }, { ref: ref }); // ref - hack to allow the node make itself invisible
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
