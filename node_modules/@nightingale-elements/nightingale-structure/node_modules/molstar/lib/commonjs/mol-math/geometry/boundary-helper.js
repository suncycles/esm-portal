"use strict";
/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundaryHelper = void 0;
var tslib_1 = require("tslib");
var vec3_1 = require("../linear-algebra/3d/vec3");
var centroid_helper_1 = require("./centroid-helper");
var geometry_1 = require("../geometry");
var box3d_1 = require("./primitives/box3d");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
var v3dot = vec3_1.Vec3.dot;
var v3copy = vec3_1.Vec3.copy;
var v3scaleAndSub = vec3_1.Vec3.scaleAndSub;
var v3scaleAndAdd = vec3_1.Vec3.scaleAndAdd;
// implementing http://www.ep.liu.se/ecp/034/009/ecp083409.pdf
var BoundaryHelper = /** @class */ (function () {
    function BoundaryHelper(quality) {
        this.minDist = [];
        this.maxDist = [];
        this.extrema = [];
        this.centroidHelper = new centroid_helper_1.CentroidHelper();
        this.dir = getEposDir(quality);
        this.dirLength = this.dir.length;
        this.reset();
    }
    BoundaryHelper.prototype.computeExtrema = function (i, p) {
        var d = v3dot(this.dir[i], p);
        if (d < this.minDist[i]) {
            this.minDist[i] = d;
            v3copy(this.extrema[i * 2], p);
        }
        if (d > this.maxDist[i]) {
            this.maxDist[i] = d;
            v3copy(this.extrema[i * 2 + 1], p);
        }
    };
    BoundaryHelper.prototype.computeSphereExtrema = function (i, center, radius) {
        var di = this.dir[i];
        var d = v3dot(di, center);
        if (d - radius < this.minDist[i]) {
            this.minDist[i] = d - radius;
            v3scaleAndSub(this.extrema[i * 2], center, di, radius);
        }
        if (d + radius > this.maxDist[i]) {
            this.maxDist[i] = d + radius;
            v3scaleAndAdd(this.extrema[i * 2 + 1], center, di, radius);
        }
    };
    BoundaryHelper.prototype.includeSphere = function (s) {
        if (geometry_1.Sphere3D.hasExtrema(s) && s.extrema.length > 1) {
            for (var _i = 0, _a = s.extrema; _i < _a.length; _i++) {
                var e = _a[_i];
                this.includePosition(e);
            }
        }
        else {
            this.includePositionRadius(s.center, s.radius);
        }
    };
    BoundaryHelper.prototype.includePosition = function (p) {
        for (var i = 0; i < this.dirLength; ++i) {
            this.computeExtrema(i, p);
        }
    };
    BoundaryHelper.prototype.includePositionRadius = function (center, radius) {
        for (var i = 0; i < this.dirLength; ++i) {
            this.computeSphereExtrema(i, center, radius);
        }
    };
    BoundaryHelper.prototype.finishedIncludeStep = function () {
        for (var i = 0; i < this.extrema.length; i++) {
            this.centroidHelper.includeStep(this.extrema[i]);
        }
        this.centroidHelper.finishedIncludeStep();
    };
    BoundaryHelper.prototype.radiusSphere = function (s) {
        if (geometry_1.Sphere3D.hasExtrema(s) && s.extrema.length > 1) {
            for (var _i = 0, _a = s.extrema; _i < _a.length; _i++) {
                var e = _a[_i];
                this.radiusPosition(e);
            }
        }
        else {
            this.radiusPositionRadius(s.center, s.radius);
        }
    };
    BoundaryHelper.prototype.radiusPosition = function (p) {
        this.centroidHelper.radiusStep(p);
    };
    BoundaryHelper.prototype.radiusPositionRadius = function (center, radius) {
        this.centroidHelper.radiusSphereStep(center, radius);
    };
    BoundaryHelper.prototype.getSphere = function (sphere) {
        return geometry_1.Sphere3D.setExtrema(this.centroidHelper.getSphere(sphere), this.extrema.slice());
    };
    BoundaryHelper.prototype.getBox = function (box) {
        return box3d_1.Box3D.fromVec3Array(box || (0, box3d_1.Box3D)(), this.extrema);
    };
    BoundaryHelper.prototype.reset = function () {
        for (var i = 0; i < this.dirLength; ++i) {
            this.minDist[i] = Infinity;
            this.maxDist[i] = -Infinity;
            this.extrema[i * 2] = (0, vec3_1.Vec3)();
            this.extrema[i * 2 + 1] = (0, vec3_1.Vec3)();
        }
        this.centroidHelper.reset();
    };
    return BoundaryHelper;
}());
exports.BoundaryHelper = BoundaryHelper;
function getEposDir(quality) {
    var dir;
    switch (quality) {
        case '6':
            dir = tslib_1.__spreadArray([], Type001, true);
            break;
        case '14':
            dir = tslib_1.__spreadArray(tslib_1.__spreadArray([], Type001, true), Type111, true);
            break;
        case '26':
            dir = tslib_1.__spreadArray(tslib_1.__spreadArray(tslib_1.__spreadArray([], Type001, true), Type111, true), Type011, true);
            break;
        case '98':
            dir = tslib_1.__spreadArray(tslib_1.__spreadArray(tslib_1.__spreadArray(tslib_1.__spreadArray(tslib_1.__spreadArray(tslib_1.__spreadArray([], Type001, true), Type111, true), Type011, true), Type012, true), Type112, true), Type122, true);
            break;
    }
    return dir.map(function (a) {
        var v = vec3_1.Vec3.create(a[0], a[1], a[2]);
        return vec3_1.Vec3.normalize(v, v);
    });
}
var Type001 = [
    [1, 0, 0], [0, 1, 0], [0, 0, 1]
];
var Type111 = [
    [1, 1, 1], [-1, 1, 1], [-1, -1, 1], [1, -1, 1]
];
var Type011 = [
    [1, 1, 0], [1, -1, 0], [1, 0, 1], [1, 0, -1], [0, 1, 1], [0, 1, -1]
];
var Type012 = [
    [0, 1, 2], [0, 2, 1], [1, 0, 2], [2, 0, 1], [1, 2, 0], [2, 1, 0],
    [0, 1, -2], [0, 2, -1], [1, 0, -2], [2, 0, -1], [1, -2, 0], [2, -1, 0]
];
var Type112 = [
    [1, 1, 2], [2, 1, 1], [1, 2, 1], [1, -1, 2], [1, 1, -2], [1, -1, -2],
    [2, -1, 1], [2, 1, -1], [2, -1, -1], [1, -2, 1], [1, 2, -1], [1, -2, -1]
];
var Type122 = [
    [2, 2, 1], [1, 2, 2], [2, 1, 2], [2, -2, 1], [2, 2, -1], [2, -2, -1],
    [1, -2, 2], [1, 2, -2], [1, -2, -2], [2, -1, 2], [2, 1, -2], [2, -1, -2]
];
