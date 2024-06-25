"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataWrapper = void 0;
var color_1 = require("../../../mol-util/color");
var MetadataWrapper = /** @class */ (function () {
    function MetadataWrapper(rawMetadata) {
        this.raw = rawMetadata;
    }
    Object.defineProperty(MetadataWrapper.prototype, "allSegments", {
        get: function () {
            var _a, _b;
            return (_b = (_a = this.raw.annotation) === null || _a === void 0 ? void 0 : _a.segment_list) !== null && _b !== void 0 ? _b : [];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MetadataWrapper.prototype, "allSegmentIds", {
        get: function () {
            return this.allSegments.map(function (segment) { return segment.id; });
        },
        enumerable: false,
        configurable: true
    });
    MetadataWrapper.prototype.getSegment = function (segmentId) {
        if (!this.segmentMap) {
            this.segmentMap = {};
            for (var _i = 0, _a = this.allSegments; _i < _a.length; _i++) {
                var segment = _a[_i];
                this.segmentMap[segment.id] = segment;
            }
        }
        return this.segmentMap[segmentId];
    };
    MetadataWrapper.prototype.getSegmentColor = function (segmentId) {
        var _a;
        var colorArray = (_a = this.getSegment(segmentId)) === null || _a === void 0 ? void 0 : _a.colour;
        return colorArray ? color_1.Color.fromNormalizedArray(colorArray, 0) : undefined;
    };
    /** Get the list of detail levels available for the given mesh segment. */
    MetadataWrapper.prototype.getMeshDetailLevels = function (segmentId) {
        var segmentIds = this.raw.grid.segmentation_meshes.mesh_component_numbers.segment_ids;
        if (!segmentIds)
            return [];
        var details = segmentIds[segmentId].detail_lvls;
        return Object.keys(details).map(function (s) { return parseInt(s); });
    };
    /** Get the worst available detail level that is not worse than preferredDetail.
     * If preferredDetail is null, get the worst detail level overall.
     * (worse = greater number) */
    MetadataWrapper.prototype.getSufficientMeshDetail = function (segmentId, preferredDetail) {
        var availDetails = this.getMeshDetailLevels(segmentId);
        if (preferredDetail !== null) {
            availDetails = availDetails.filter(function (det) { return det <= preferredDetail; });
        }
        return Math.max.apply(Math, availDetails);
    };
    Object.defineProperty(MetadataWrapper.prototype, "meshSegmentIds", {
        /** IDs of all segments available as meshes */
        get: function () {
            var segmentIds = this.raw.grid.segmentation_meshes.mesh_component_numbers.segment_ids;
            if (!segmentIds)
                return [];
            return Object.keys(segmentIds).map(function (s) { return parseInt(s); });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MetadataWrapper.prototype, "gridTotalVolume", {
        get: function () {
            var _a = this.raw.grid.volumes.voxel_size[1], vx = _a[0], vy = _a[1], vz = _a[2];
            var _b = this.raw.grid.volumes.grid_dimensions, gx = _b[0], gy = _b[1], gz = _b[2];
            return vx * vy * vz * gx * gy * gz;
        },
        enumerable: false,
        configurable: true
    });
    return MetadataWrapper;
}());
exports.MetadataWrapper = MetadataWrapper;
