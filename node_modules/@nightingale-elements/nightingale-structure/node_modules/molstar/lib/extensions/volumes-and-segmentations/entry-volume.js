/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { __assign, __awaiter, __generator } from "tslib";
import { Vec2 } from '../../mol-math/linear-algebra';
import { Volume } from '../../mol-model/volume';
import { createVolumeRepresentationParams } from '../../mol-plugin-state/helpers/volume-representation-params';
import { StateTransforms } from '../../mol-plugin-state/transforms';
import { Download } from '../../mol-plugin-state/transforms/data';
import { CreateGroup } from '../../mol-plugin-state/transforms/misc';
import { setSubtreeVisibility } from '../../mol-plugin/behavior/static/state';
import { PluginCommands } from '../../mol-plugin/commands';
import { Color } from '../../mol-util/color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { BOX, MAX_VOXELS } from './entry-root';
import { VolsegStateParams, VolumeTypeChoice } from './entry-state';
import * as ExternalAPIs from './external-api';
import { VolsegGlobalStateData } from './global-state';
var GROUP_TAG = 'volume-group';
export var VOLUME_VISUAL_TAG = 'volume-visual';
var DIRECT_VOLUME_RELATIVE_PEAK_HALFWIDTH = 0.5;
;
export var SimpleVolumeParams = {
    volumeType: VolumeTypeChoice.PDSelect(),
    opacity: PD.Numeric(0.2, { min: 0, max: 1, step: 0.05 }, { hideIf: function (p) { return p.volumeType === 'off'; } }),
};
var VolsegVolumeData = /** @class */ (function () {
    function VolsegVolumeData(rootData) {
        this.visualTypeParamCache = {};
        this.entryData = rootData;
    }
    VolsegVolumeData.prototype.loadVolume = function () {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var hasVolumes, isoLevelPromise, group, newGroupNode, url, data, parsed, volumeNode, volumeData, volumeType, isovalue, stats, maxRelative, adjustedIsovalue, visualParams;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        hasVolumes = this.entryData.metadata.raw.grid.volumes.volume_downsamplings.length > 0;
                        if (!hasVolumes) return [3 /*break*/, 7];
                        isoLevelPromise = ExternalAPIs.tryGetIsovalue((_a = this.entryData.metadata.raw.grid.general.source_db_id) !== null && _a !== void 0 ? _a : this.entryData.entryId);
                        group = (_b = this.entryData.findNodesByTags(GROUP_TAG)[0]) === null || _b === void 0 ? void 0 : _b.transform.ref;
                        if (!!group) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.entryData.newUpdate().apply(CreateGroup, { label: 'Volume' }, { tags: [GROUP_TAG], state: { isCollapsed: true } }).commit()];
                    case 1:
                        newGroupNode = _e.sent();
                        group = newGroupNode.ref;
                        _e.label = 2;
                    case 2:
                        url = this.entryData.api.volumeUrl(this.entryData.source, this.entryData.entryId, BOX, MAX_VOXELS);
                        return [4 /*yield*/, this.entryData.newUpdate().to(group).apply(Download, { url: url, isBinary: true, label: "Volume Data: ".concat(url) }).commit()];
                    case 3:
                        data = _e.sent();
                        return [4 /*yield*/, this.entryData.plugin.dataFormats.get('dscif').parse(this.entryData.plugin, data)];
                    case 4:
                        parsed = _e.sent();
                        volumeNode = (_d = (_c = parsed.volumes) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : parsed.volume;
                        volumeData = volumeNode.cell.obj.data;
                        volumeType = VolsegStateParams.volumeType.defaultValue;
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
                        adjustedIsovalue = Volume.adjustedIsoValue(volumeData, isovalue.value, isovalue.kind);
                        visualParams = this.createVolumeVisualParams(volumeData, volumeType);
                        this.changeIsovalueInVolumeVisualParams(visualParams, adjustedIsovalue, volumeData.grid.stats);
                        return [4 /*yield*/, this.entryData.newUpdate()
                                .to(volumeNode)
                                .apply(StateTransforms.Representation.VolumeRepresentation3D, visualParams, { tags: [VOLUME_VISUAL_TAG], state: { isHidden: volumeType === 'off' } })
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
        return __awaiter(this, void 0, void 0, function () {
            var visual, oldParams, newParams, volumeStats, update;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        visual = this.entryData.findNodesByTags(VOLUME_VISUAL_TAG)[0];
                        if (!visual)
                            return [2 /*return*/];
                        oldParams = visual.transform.params;
                        this.visualTypeParamCache[oldParams.type.name] = oldParams.type.params;
                        if (!(type === 'off')) return [3 /*break*/, 1];
                        setSubtreeVisibility(this.entryData.plugin.state.data, visual.transform.ref, true); // true means hide, ¯\_(ツ)_/¯
                        return [3 /*break*/, 3];
                    case 1:
                        setSubtreeVisibility(this.entryData.plugin.state.data, visual.transform.ref, false); // true means hide, ¯\_(ツ)_/¯
                        if (oldParams.type.name === type)
                            return [2 /*return*/];
                        newParams = __assign(__assign({}, oldParams), { type: {
                                name: type,
                                params: (_a = this.visualTypeParamCache[type]) !== null && _a !== void 0 ? _a : oldParams.type.params,
                            } });
                        volumeStats = (_b = visual.obj) === null || _b === void 0 ? void 0 : _b.data.sourceData.grid.stats;
                        if (!volumeStats)
                            throw new Error("Cannot get volume stats from volume visual ".concat(visual.transform.ref));
                        this.changeIsovalueInVolumeVisualParams(newParams, undefined, volumeStats);
                        update = this.entryData.newUpdate().to(visual.transform.ref).update(newParams);
                        return [4 /*yield*/, PluginCommands.State.Update(this.entryData.plugin, { state: this.entryData.plugin.state.data, tree: update, options: { doNotUpdateCurrent: true } })];
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
        return __awaiter(this, void 0, void 0, function () {
            var volumeType, opacity, visual, oldVisualParams, newVisualParams, volumeStats, update;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        volumeType = newParams.volumeType, opacity = newParams.opacity;
                        visual = this.entryData.findNodesByTags(VOLUME_VISUAL_TAG)[0];
                        if (!visual)
                            return [2 /*return*/];
                        oldVisualParams = visual.transform.params;
                        this.visualTypeParamCache[oldVisualParams.type.name] = oldVisualParams.type.params;
                        if (!(volumeType === 'off')) return [3 /*break*/, 1];
                        setSubtreeVisibility(this.entryData.plugin.state.data, visual.transform.ref, true); // true means hide, ¯\_(ツ)_/¯
                        return [3 /*break*/, 3];
                    case 1:
                        setSubtreeVisibility(this.entryData.plugin.state.data, visual.transform.ref, false); // true means hide, ¯\_(ツ)_/¯
                        newVisualParams = __assign(__assign({}, oldVisualParams), { type: {
                                name: volumeType,
                                params: (_a = this.visualTypeParamCache[volumeType]) !== null && _a !== void 0 ? _a : oldVisualParams.type.params,
                            } });
                        newVisualParams.type.params.alpha = opacity;
                        volumeStats = (_b = visual.obj) === null || _b === void 0 ? void 0 : _b.data.sourceData.grid.stats;
                        if (!volumeStats)
                            throw new Error("Cannot get volume stats from volume visual ".concat(visual.transform.ref));
                        this.changeIsovalueInVolumeVisualParams(newVisualParams, undefined, volumeStats);
                        update = this.entryData.newUpdate().to(visual.transform.ref).update(newVisualParams);
                        return [4 /*yield*/, PluginCommands.State.Update(this.entryData.plugin, { state: this.entryData.plugin.state.data, tree: update, options: { doNotUpdateCurrent: true } })];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    VolsegVolumeData.prototype.setTryUseGpu = function (tryUseGpu) {
        return __awaiter(this, void 0, void 0, function () {
            var visuals, _i, visuals_1, visual, oldParams, newParams, update;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        visuals = this.entryData.findNodesByTags(VOLUME_VISUAL_TAG);
                        _i = 0, visuals_1 = visuals;
                        _a.label = 1;
                    case 1:
                        if (!(_i < visuals_1.length)) return [3 /*break*/, 4];
                        visual = visuals_1[_i];
                        oldParams = visual.transform.params;
                        if (!(oldParams.type.params.tryUseGpu === !tryUseGpu)) return [3 /*break*/, 3];
                        newParams = __assign(__assign({}, oldParams), { type: __assign(__assign({}, oldParams.type), { params: __assign(__assign({}, oldParams.type.params), { tryUseGpu: tryUseGpu }) }) });
                        update = this.entryData.newUpdate().to(visual.transform.ref).update(newParams);
                        return [4 /*yield*/, PluginCommands.State.Update(this.entryData.plugin, { state: this.entryData.plugin.state.data, tree: update, options: { doNotUpdateCurrent: true } })];
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
            ? Volume.IsoValue.relative(volumeIsovalueValue)
            : Volume.IsoValue.absolute(volumeIsovalueValue);
    };
    VolsegVolumeData.prototype.createVolumeVisualParams = function (volume, type) {
        var _a;
        if (type === 'off')
            type = 'isosurface';
        return createVolumeRepresentationParams(this.entryData.plugin, volume, {
            type: type,
            typeParams: { alpha: 0.2, tryUseGpu: (_a = VolsegGlobalStateData.getGlobalState(this.entryData.plugin)) === null || _a === void 0 ? void 0 : _a.tryUseGpu },
            color: 'uniform',
            colorParams: { value: Color(0x121212) },
        });
    };
    VolsegVolumeData.prototype.changeIsovalueInVolumeVisualParams = function (params, isovalue, stats) {
        var _a;
        isovalue !== null && isovalue !== void 0 ? isovalue : (isovalue = this.getIsovalueFromState());
        switch (params.type.name) {
            case 'isosurface':
                params.type.params.isoValue = isovalue;
                params.type.params.tryUseGpu = (_a = VolsegGlobalStateData.getGlobalState(this.entryData.plugin)) === null || _a === void 0 ? void 0 : _a.tryUseGpu;
                break;
            case 'direct-volume':
                var absIso = Volume.IsoValue.toAbsolute(isovalue, stats).absoluteValue;
                var fractIso = (absIso - stats.min) / (stats.max - stats.min);
                var peakHalfwidth = DIRECT_VOLUME_RELATIVE_PEAK_HALFWIDTH * stats.sigma / (stats.max - stats.min);
                params.type.params.controlPoints = [
                    Vec2.create(Math.max(fractIso - peakHalfwidth, 0), 0),
                    Vec2.create(fractIso, 1),
                    Vec2.create(Math.min(fractIso + peakHalfwidth, 1), 0),
                ];
                break;
        }
    };
    return VolsegVolumeData;
}());
export { VolsegVolumeData };
