"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolsegLatticeSegmentationData = void 0;
var tslib_1 = require("tslib");
var volume_1 = require("../../mol-model/volume");
var volume_representation_params_1 = require("../../mol-plugin-state/helpers/volume-representation-params");
var transforms_1 = require("../../mol-plugin-state/transforms");
var data_1 = require("../../mol-plugin-state/transforms/data");
var misc_1 = require("../../mol-plugin-state/transforms/misc");
var volume_2 = require("../../mol-plugin-state/transforms/volume");
var commands_1 = require("../../mol-plugin/commands");
var color_1 = require("../../mol-util/color");
var entry_root_1 = require("./entry-root");
var global_state_1 = require("./global-state");
var GROUP_TAG = 'lattice-segmentation-group';
var SEGMENT_VISUAL_TAG = 'lattice-segment-visual';
var DEFAULT_SEGMENT_COLOR = color_1.Color.fromNormalizedRgb(0.8, 0.8, 0.8);
var VolsegLatticeSegmentationData = /** @class */ (function () {
    function VolsegLatticeSegmentationData(rootData) {
        this.entryData = rootData;
    }
    VolsegLatticeSegmentationData.prototype.loadSegmentation = function () {
        var _a, _b, _c;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var hasLattices, url, group, newGroupNode, segmentLabels, volumeNode, volumeData, segmentation, segmentIds;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        hasLattices = this.entryData.metadata.raw.grid.segmentation_lattices.segmentation_lattice_ids.length > 0;
                        if (!hasLattices) return [3 /*break*/, 5];
                        url = this.entryData.api.latticeUrl(this.entryData.source, this.entryData.entryId, 0, entry_root_1.BOX, entry_root_1.MAX_VOXELS);
                        group = (_a = this.entryData.findNodesByTags(GROUP_TAG)[0]) === null || _a === void 0 ? void 0 : _a.transform.ref;
                        if (!!group) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.entryData.newUpdate().apply(misc_1.CreateGroup, { label: 'Segmentation', description: 'Lattice' }, { tags: [GROUP_TAG], state: { isCollapsed: true } }).commit()];
                    case 1:
                        newGroupNode = _d.sent();
                        group = newGroupNode.ref;
                        _d.label = 2;
                    case 2:
                        segmentLabels = this.entryData.metadata.allSegments.map(function (seg) { return ({ id: seg.id, label: seg.biological_annotation.name ? "<b>".concat(seg.biological_annotation.name, "</b>") : '' }); });
                        return [4 /*yield*/, this.entryData.newUpdate().to(group)
                                .apply(data_1.Download, { url: url, isBinary: true, label: "Segmentation Data: ".concat(url) })
                                .apply(data_1.ParseCif)
                                .apply(volume_2.VolumeFromSegmentationCif, { blockHeader: 'SEGMENTATION_DATA', segmentLabels: segmentLabels, ownerId: this.entryData.ref })
                                .commit()];
                    case 3:
                        volumeNode = _d.sent();
                        volumeData = volumeNode.data;
                        segmentation = volume_1.Volume.Segmentation.get(volumeData);
                        segmentIds = Array.from((_b = segmentation === null || segmentation === void 0 ? void 0 : segmentation.segments.keys()) !== null && _b !== void 0 ? _b : []);
                        return [4 /*yield*/, this.entryData.newUpdate().to(volumeNode)
                                .apply(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, (0, volume_representation_params_1.createVolumeRepresentationParams)(this.entryData.plugin, volumeData, {
                                type: 'segment',
                                typeParams: { tryUseGpu: (_c = global_state_1.VolsegGlobalStateData.getGlobalState(this.entryData.plugin)) === null || _c === void 0 ? void 0 : _c.tryUseGpu },
                                color: 'volume-segment',
                                colorParams: { palette: this.createPalette(segmentIds) },
                            }), { tags: [SEGMENT_VISUAL_TAG] }).commit()];
                    case 4:
                        _d.sent();
                        _d.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    VolsegLatticeSegmentationData.prototype.createPalette = function (segmentIds) {
        var colorMap = new Map();
        for (var _i = 0, _a = this.entryData.metadata.allSegments; _i < _a.length; _i++) {
            var segment = _a[_i];
            var color = color_1.Color.fromNormalizedArray(segment.colour, 0);
            colorMap.set(segment.id, color);
        }
        if (colorMap.size === 0)
            return undefined;
        for (var _b = 0, segmentIds_1 = segmentIds; _b < segmentIds_1.length; _b++) {
            var segid = segmentIds_1[_b];
            colorMap.get(segid);
        }
        var colors = segmentIds.map(function (segid) { var _a; return (_a = colorMap.get(segid)) !== null && _a !== void 0 ? _a : DEFAULT_SEGMENT_COLOR; });
        return { name: 'colors', params: { list: { kind: 'set', colors: colors } } };
    };
    VolsegLatticeSegmentationData.prototype.updateOpacity = function (opacity) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var reprs, update, _i, reprs_1, s;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reprs = this.entryData.findNodesByTags(SEGMENT_VISUAL_TAG);
                        update = this.entryData.newUpdate();
                        for (_i = 0, reprs_1 = reprs; _i < reprs_1.length; _i++) {
                            s = reprs_1[_i];
                            update.to(s).update(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, function (p) { p.type.params.alpha = opacity; });
                        }
                        return [4 /*yield*/, update.commit()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VolsegLatticeSegmentationData.prototype.makeLoci = function (segments) {
        var _a;
        var vis = this.entryData.findNodesByTags(SEGMENT_VISUAL_TAG)[0];
        if (!vis)
            return undefined;
        var repr = (_a = vis.obj) === null || _a === void 0 ? void 0 : _a.data.repr;
        var wholeLoci = repr.getAllLoci()[0];
        if (!wholeLoci || !volume_1.Volume.Segment.isLoci(wholeLoci))
            return undefined;
        return { loci: volume_1.Volume.Segment.Loci(wholeLoci.volume, segments), repr: repr };
    };
    VolsegLatticeSegmentationData.prototype.highlightSegment = function (segment) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var segmentLoci;
            return tslib_1.__generator(this, function (_a) {
                segmentLoci = this.makeLoci([segment.id]);
                if (!segmentLoci)
                    return [2 /*return*/];
                this.entryData.plugin.managers.interactivity.lociHighlights.highlight(segmentLoci, false);
                return [2 /*return*/];
            });
        });
    };
    VolsegLatticeSegmentationData.prototype.selectSegment = function (segment) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var segmentLoci;
            return tslib_1.__generator(this, function (_a) {
                if (segment === undefined || segment < 0)
                    return [2 /*return*/];
                segmentLoci = this.makeLoci([segment]);
                if (!segmentLoci)
                    return [2 /*return*/];
                this.entryData.plugin.managers.interactivity.lociSelects.select(segmentLoci, false);
                return [2 /*return*/];
            });
        });
    };
    /** Make visible the specified set of lattice segments */
    VolsegLatticeSegmentationData.prototype.showSegments = function (segments) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var repr, selectedSegment, mustReselect, update;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        repr = this.entryData.findNodesByTags(SEGMENT_VISUAL_TAG)[0];
                        if (!repr)
                            return [2 /*return*/];
                        selectedSegment = this.entryData.currentState.value.selectedSegment;
                        mustReselect = segments.includes(selectedSegment) && !((_a = repr.params) === null || _a === void 0 ? void 0 : _a.values.type.params.segments.includes(selectedSegment));
                        update = this.entryData.newUpdate();
                        update.to(repr).update(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, function (p) { p.type.params.segments = segments; });
                        return [4 /*yield*/, update.commit()];
                    case 1:
                        _b.sent();
                        if (!mustReselect) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.selectSegment(this.entryData.currentState.value.selectedSegment)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    VolsegLatticeSegmentationData.prototype.setTryUseGpu = function (tryUseGpu) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var visuals, _i, visuals_1, visual, oldParams, newParams, update;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        visuals = this.entryData.findNodesByTags(SEGMENT_VISUAL_TAG);
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
    return VolsegLatticeSegmentationData;
}());
exports.VolsegLatticeSegmentationData = VolsegLatticeSegmentationData;
