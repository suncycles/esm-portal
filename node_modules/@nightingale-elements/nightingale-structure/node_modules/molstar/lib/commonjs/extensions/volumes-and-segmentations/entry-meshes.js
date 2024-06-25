"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolsegMeshSegmentationData = void 0;
var tslib_1 = require("tslib");
var misc_1 = require("../../mol-plugin-state/transforms/misc");
var representation_1 = require("../../mol-plugin-state/transforms/representation");
var state_1 = require("../../mol-plugin/behavior/static/state");
var commands_1 = require("../../mol-plugin/commands");
var color_1 = require("../../mol-util/color");
var names_1 = require("../../mol-util/color/names");
var behavior_1 = require("../meshes/mesh-streaming/behavior");
var mesh_extension_1 = require("../meshes/mesh-extension");
var DEFAULT_MESH_DETAIL = 5; // null means worst
var VolsegMeshSegmentationData = /** @class */ (function () {
    function VolsegMeshSegmentationData(rootData) {
        this.entryData = rootData;
    }
    VolsegMeshSegmentationData.prototype.loadSegmentation = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var hasMeshes;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hasMeshes = this.entryData.metadata.meshSegmentIds.length > 0;
                        if (!hasMeshes) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.showSegments(this.entryData.metadata.allSegmentIds)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    VolsegMeshSegmentationData.prototype.updateOpacity = function (opacity) {
        var visuals = this.entryData.findNodesByTags('mesh-segment-visual');
        var update = this.entryData.newUpdate();
        for (var _i = 0, visuals_1 = visuals; _i < visuals_1.length; _i++) {
            var visual = visuals_1[_i];
            update.to(visual).update(representation_1.ShapeRepresentation3D, function (p) { p.alpha = opacity; });
        }
        return update.commit();
    };
    VolsegMeshSegmentationData.prototype.highlightSegment = function (segment) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var visuals, _i, visuals_2, visual;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        visuals = this.entryData.findNodesByTags('mesh-segment-visual', "segment-".concat(segment.id));
                        _i = 0, visuals_2 = visuals;
                        _a.label = 1;
                    case 1:
                        if (!(_i < visuals_2.length)) return [3 /*break*/, 4];
                        visual = visuals_2[_i];
                        return [4 /*yield*/, commands_1.PluginCommands.Interactivity.Object.Highlight(this.entryData.plugin, { state: this.entryData.plugin.state.data, ref: visual.transform.ref })];
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
    VolsegMeshSegmentationData.prototype.selectSegment = function (segment) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var visuals, reprNode, loci;
            return tslib_1.__generator(this, function (_b) {
                if (segment === undefined || segment < 0)
                    return [2 /*return*/];
                visuals = this.entryData.findNodesByTags('mesh-segment-visual', "segment-".concat(segment));
                reprNode = (_a = visuals[0]) === null || _a === void 0 ? void 0 : _a.obj;
                if (!reprNode)
                    return [2 /*return*/];
                loci = reprNode.data.repr.getAllLoci()[0];
                if (!loci)
                    return [2 /*return*/];
                this.entryData.plugin.managers.interactivity.lociSelects.select({ loci: loci, repr: reprNode.data.repr }, false);
                return [2 /*return*/];
            });
        });
    };
    /** Make visible the specified set of mesh segments */
    VolsegMeshSegmentationData.prototype.showSegments = function (segments) {
        var _a, _b, _c, _d;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var segmentsToShow, visuals, _i, visuals_3, visual, theTag, id, visibility, segmentsToCreate, group, newGroupNode, totalVolume, awaiting, _e, segmentsToCreate_1, seg, segment, detail, color, url, label, meshPromise, _f, awaiting_1, promise;
            return tslib_1.__generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        segmentsToShow = new Set(segments);
                        visuals = this.entryData.findNodesByTags('mesh-segment-visual');
                        for (_i = 0, visuals_3 = visuals; _i < visuals_3.length; _i++) {
                            visual = visuals_3[_i];
                            theTag = (_b = (_a = visual.obj) === null || _a === void 0 ? void 0 : _a.tags) === null || _b === void 0 ? void 0 : _b.find(function (tag) { return tag.startsWith('segment-'); });
                            if (!theTag)
                                continue;
                            id = parseInt(theTag.split('-')[1]);
                            visibility = segmentsToShow.has(id);
                            (0, state_1.setSubtreeVisibility)(this.entryData.plugin.state.data, visual.transform.ref, !visibility); // true means hide, ¯\_(ツ)_/¯
                            segmentsToShow.delete(id);
                        }
                        segmentsToCreate = this.entryData.metadata.meshSegmentIds.filter(function (seg) { return segmentsToShow.has(seg); });
                        if (segmentsToCreate.length === 0)
                            return [2 /*return*/];
                        group = (_c = this.entryData.findNodesByTags('mesh-segmentation-group')[0]) === null || _c === void 0 ? void 0 : _c.transform.ref;
                        if (!!group) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.entryData.newUpdate().apply(misc_1.CreateGroup, { label: 'Segmentation', description: 'Mesh' }, { tags: ['mesh-segmentation-group'], state: { isCollapsed: true } }).commit()];
                    case 1:
                        newGroupNode = _g.sent();
                        group = newGroupNode.ref;
                        _g.label = 2;
                    case 2:
                        totalVolume = this.entryData.metadata.gridTotalVolume;
                        awaiting = [];
                        for (_e = 0, segmentsToCreate_1 = segmentsToCreate; _e < segmentsToCreate_1.length; _e++) {
                            seg = segmentsToCreate_1[_e];
                            segment = this.entryData.metadata.getSegment(seg);
                            if (!segment)
                                continue;
                            detail = this.entryData.metadata.getSufficientMeshDetail(seg, DEFAULT_MESH_DETAIL);
                            color = segment.colour.length >= 3 ? color_1.Color.fromNormalizedArray(segment.colour, 0) : names_1.ColorNames.gray;
                            url = this.entryData.api.meshUrl_Bcif(this.entryData.source, this.entryData.entryId, seg, detail);
                            label = (_d = segment.biological_annotation.name) !== null && _d !== void 0 ? _d : "Segment ".concat(seg);
                            meshPromise = (0, mesh_extension_1.createMeshFromUrl)(this.entryData.plugin, url, seg, detail, true, color, group, behavior_1.BACKGROUND_SEGMENT_VOLUME_THRESHOLD * totalVolume, "<b>".concat(label, "</b>"), this.entryData.ref);
                            awaiting.push(meshPromise);
                        }
                        _f = 0, awaiting_1 = awaiting;
                        _g.label = 3;
                    case 3:
                        if (!(_f < awaiting_1.length)) return [3 /*break*/, 6];
                        promise = awaiting_1[_f];
                        return [4 /*yield*/, promise];
                    case 4:
                        _g.sent();
                        _g.label = 5;
                    case 5:
                        _f++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return VolsegMeshSegmentationData;
}());
exports.VolsegMeshSegmentationData = VolsegMeshSegmentationData;
