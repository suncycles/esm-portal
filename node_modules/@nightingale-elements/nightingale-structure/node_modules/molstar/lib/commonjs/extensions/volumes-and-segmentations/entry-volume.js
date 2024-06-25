"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolsegVolumeData = exports.SimpleVolumeParams = exports.VOLUME_VISUAL_TAG = void 0;
var tslib_1 = require("tslib");
var linear_algebra_1 = require("../../mol-math/linear-algebra");
var volume_1 = require("../../mol-model/volume");
var volume_representation_params_1 = require("../../mol-plugin-state/helpers/volume-representation-params");
var transforms_1 = require("../../mol-plugin-state/transforms");
var data_1 = require("../../mol-plugin-state/transforms/data");
var misc_1 = require("../../mol-plugin-state/transforms/misc");
var state_1 = require("../../mol-plugin/behavior/static/state");
var commands_1 = require("../../mol-plugin/commands");
var color_1 = require("../../mol-util/color");
var param_definition_1 = require("../../mol-util/param-definition");
var entry_root_1 = require("./entry-root");
var entry_state_1 = require("./entry-state");
var ExternalAPIs = tslib_1.__importStar(require("./external-api"));
var global_state_1 = require("./global-state");
var GROUP_TAG = 'volume-group';
exports.VOLUME_VISUAL_TAG = 'volume-visual';
var DIRECT_VOLUME_RELATIVE_PEAK_HALFWIDTH = 0.5;
;
exports.SimpleVolumeParams = {
    volumeType: entry_state_1.VolumeTypeChoice.PDSelect(),
    opacity: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 1, step: 0.05 }, { hideIf: function (p) { return p.volumeType === 'off'; } }),
};
var VolsegVolumeData = /** @class */ (function () {
    function VolsegVolumeData(rootData) {
        this.visualTypeParamCache = {};
        this.entryData = rootData;
    }
    VolsegVolumeData.prototype.loadVolume = function () {
        var _a, _b, _c, _d;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var hasVolumes, isoLevelPromise, group, newGroupNode, url, data, parsed, volumeNode, volumeData, volumeType, isovalue, stats, maxRelative, adjustedIsovalue, visualParams;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        hasVolumes = this.entryData.metadata.raw.grid.volumes.volume_downsamplings.length > 0;
                        if (!hasVolumes) return [3 /*break*/, 7];
                        isoLevelPromise = ExternalAPIs.tryGetIsovalue((_a = this.entryData.metadata.raw.grid.general.source_db_id) !== null && _a !== void 0 ? _a : this.entryData.entryId);
                        group = (_b = this.entryData.findNodesByTags(GROUP_TAG)[0]) === null || _b === void 0 ? void 0 : _b.transform.ref;
                        if (!!group) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.entryData.newUpdate().apply(misc_1.CreateGroup, { label: 'Volume' }, { tags: [GROUP_TAG], state: { isCollapsed: true } }).commit()];
                    case 1:
                        newGroupNode = _e.sent();
                        group = newGroupNode.ref;
                        _e.label = 2;
                    case 2:
                        url = this.entryData.api.volumeUrl(this.entryData.source, this.entryData.entryId, entry_root_1.BOX, entry_root_1.MAX_VOXELS);
                        return [4 /*yield*/, this.entryData.newUpdate().to(group).apply(data_1.Download, { url: url, isBinary: true, label: "Volume Data: ".concat(url) }).commit()];
                    case 3:
                        data = _e.sent();
                        return [4 /*yield*/, this.entryData.plugin.dataFormats.get('dscif').parse(this.entryData.plugin, data)];
                    case 4:
                        parsed = _e.sent();
                        volumeNode = (_d = (_c = parsed.volumes) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : parsed.volume;
                        volumeData = volumeNode.cell.obj.data;
                        volumeType = entry_state_1.VolsegStateParams.volumeType.defaultValue;
                        return [4 /*yield*/, isoLevelPromise];
                    case 5:
                        isovalue = _e.sent();
                        if (!isovalue) {
                            stats = volumeData.grid.stats;
                            maxRelative = (stats.max - stats.mean) / stats.sigma;
                            if (maxRelative > 1) {
                                isovalue = { kind: 'relative', value: 1.0 };
                            }
                            else {
                                isovalue = { kind: 'relative', value: maxRelative * 0.5 };
                            }
                        }
                        adjustedIsovalue = volume_1.Volume.adjustedIsoValue(volumeData, isovalue.value, isovalue.kind);
                        visualParams = this.createVolumeVisualParams(volumeData, volumeType);
                        this.changeIsovalueInVolumeVisualParams(visualParams, adjustedIsovalue, volumeData.grid.stats);
                        return [4 /*yield*/, this.entryData.newUpdate()
                                .to(volumeNode)
                                .apply(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, visualParams, { tags: [exports.VOLUME_VISUAL_TAG], state: { isHidden: volumeType === 'off' } })
                                .commit()];
                    case 6:
                        _e.sent();
                        return [2 /*return*/, { isovalue: adjustedIsovalue }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    VolsegVolumeData.prototype.setVolumeVisual = function (type) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var visual, oldParams, newParams, volumeStats, update;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        visual = this.entryData.findNodesByTags(exports.VOLUME_VISUAL_TAG)[0];
                        if (!visual)
                            return [2 /*return*/];
                        oldParams = visual.transform.params;
                        this.visualTypeParamCache[oldParams.type.name] = oldParams.type.params;
                        if (!(type === 'off')) return [3 /*break*/, 1];
                        (0, state_1.setSubtreeVisibility)(this.entryData.plugin.state.data, visual.transform.ref, true); // true means hide, ¯\_(ツ)_/¯
                        return [3 /*break*/, 3];
                    case 1:
                        (0, state_1.setSubtreeVisibility)(this.entryData.plugin.state.data, visual.transform.ref, false); // true means hide, ¯\_(ツ)_/¯
                        if (oldParams.type.name === type)
                            return [2 /*return*/];
                        newParams = tslib_1.__assign(tslib_1.__assign({}, oldParams), { type: {
                                name: type,
                                params: (_a = this.visualTypeParamCache[type]) !== null && _a !== void 0 ? _a : oldParams.type.params,
                            } });
                        volumeStats = (_b = visual.obj) === null || _b === void 0 ? void 0 : _b.data.sourceData.grid.stats;
                        if (!volumeStats)
                            throw new Error("Cannot get volume stats from volume visual ".concat(visual.transform.ref));
                        this.changeIsovalueInVolumeVisualParams(newParams, undefined, volumeStats);
                        update = this.entryData.newUpdate().to(visual.transform.ref).update(newParams);
                        return [4 /*yield*/, commands_1.PluginCommands.State.Update(this.entryData.plugin, { state: this.entryData.plugin.state.data, tree: update, options: { doNotUpdateCurrent: true } })];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    VolsegVolumeData.prototype.updateVolumeVisual = function (newParams) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var volumeType, opacity, visual, oldVisualParams, newVisualParams, volumeStats, update;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        volumeType = newParams.volumeType, opacity = newParams.opacity;
                        visual = this.entryData.findNodesByTags(exports.VOLUME_VISUAL_TAG)[0];
                        if (!visual)
                            return [2 /*return*/];
                        oldVisualParams = visual.transform.params;
                        this.visualTypeParamCache[oldVisualParams.type.name] = oldVisualParams.type.params;
                        if (!(volumeType === 'off')) return [3 /*break*/, 1];
                        (0, state_1.setSubtreeVisibility)(this.entryData.plugin.state.data, visual.transform.ref, true); // true means hide, ¯\_(ツ)_/¯
                        return [3 /*break*/, 3];
                    case 1:
                        (0, state_1.setSubtreeVisibility)(this.entryData.plugin.state.data, visual.transform.ref, false); // true means hide, ¯\_(ツ)_/¯
                        newVisualParams = tslib_1.__assign(tslib_1.__assign({}, oldVisualParams), { type: {
                                name: volumeType,
                                params: (_a = this.visualTypeParamCache[volumeType]) !== null && _a !== void 0 ? _a : oldVisualParams.type.params,
                            } });
                        newVisualParams.type.params.alpha = opacity;
                        volumeStats = (_b = visual.obj) === null || _b === void 0 ? void 0 : _b.data.sourceData.grid.stats;
                        if (!volumeStats)
                            throw new Error("Cannot get volume stats from volume visual ".concat(visual.transform.ref));
                        this.changeIsovalueInVolumeVisualParams(newVisualParams, undefined, volumeStats);
                        update = this.entryData.newUpdate().to(visual.transform.ref).update(newVisualParams);
                        return [4 /*yield*/, commands_1.PluginCommands.State.Update(this.entryData.plugin, { state: this.entryData.plugin.state.data, tree: update, options: { doNotUpdateCurrent: true } })];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    VolsegVolumeData.prototype.setTryUseGpu = function (tryUseGpu) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var visuals, _i, visuals_1, visual, oldParams, newParams, update;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        visuals = this.entryData.findNodesByTags(exports.VOLUME_VISUAL_TAG);
                        _i = 0, visuals_1 = visuals;
                        _a.label = 1;
                    case 1:
                        if (!(_i < visuals_1.length)) return [3 /*break*/, 4];
                        visual = visuals_1[_i];
                        oldParams = visual.transform.params;
                        if (!(oldParams.type.params.tryUseGpu === !tryUseGpu)) return [3 /*break*/, 3];
                        newParams = tslib_1.__assign(tslib_1.__assign({}, oldParams), { type: tslib_1.__assign(tslib_1.__assign({}, oldParams.type), { params: tslib_1.__assign(tslib_1.__assign({}, oldParams.type.params), { tryUseGpu: tryUseGpu }) }) });
                        update = this.entryData.newUpdate().to(visual.transform.ref).update(newParams);
                        return [4 /*yield*/, commands_1.PluginCommands.State.Update(this.entryData.plugin, { state: this.entryData.plugin.state.data, tree: update, options: { doNotUpdateCurrent: true } })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    VolsegVolumeData.prototype.getIsovalueFromState = function () {
        var _a = this.entryData.currentState.value, volumeIsovalueKind = _a.volumeIsovalueKind, volumeIsovalueValue = _a.volumeIsovalueValue;
        return volumeIsovalueKind === 'relative'
            ? volume_1.Volume.IsoValue.relative(volumeIsovalueValue)
            : volume_1.Volume.IsoValue.absolute(volumeIsovalueValue);
    };
    VolsegVolumeData.prototype.createVolumeVisualParams = function (volume, type) {
        var _a;
        if (type === 'off')
            type = 'isosurface';
        return (0, volume_representation_params_1.createVolumeRepresentationParams)(this.entryData.plugin, volume, {
            type: type,
            typeParams: { alpha: 0.2, tryUseGpu: (_a = global_state_1.VolsegGlobalStateData.getGlobalState(this.entryData.plugin)) === null || _a === void 0 ? void 0 : _a.tryUseGpu },
            color: 'uniform',
            colorParams: { value: (0, color_1.Color)(0x121212) },
        });
    };
    VolsegVolumeData.prototype.changeIsovalueInVolumeVisualParams = function (params, isovalue, stats) {
        var _a;
        isovalue !== null && isovalue !== void 0 ? isovalue : (isovalue = this.getIsovalueFromState());
        switch (params.type.name) {
            case 'isosurface':
                params.type.params.isoValue = isovalue;
                params.type.params.tryUseGpu = (_a = global_state_1.VolsegGlobalStateData.getGlobalState(this.entryData.plugin)) === null || _a === void 0 ? void 0 : _a.tryUseGpu;
                break;
            case 'direct-volume':
                var absIso = volume_1.Volume.IsoValue.toAbsolute(isovalue, stats).absoluteValue;
                var fractIso = (absIso - stats.min) / (stats.max - stats.min);
                var peakHalfwidth = DIRECT_VOLUME_RELATIVE_PEAK_HALFWIDTH * stats.sigma / (stats.max - stats.min);
                params.type.params.controlPoints = [
                    linear_algebra_1.Vec2.create(Math.max(fractIso - peakHalfwidth, 0), 0),
                    linear_algebra_1.Vec2.create(fractIso, 1),
                    linear_algebra_1.Vec2.create(Math.min(fractIso + peakHalfwidth, 1), 0),
                ];
                break;
        }
    };
    return VolsegVolumeData;
}());
exports.VolsegVolumeData = VolsegVolumeData;
