/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3 } from '../../mol-math/linear-algebra/3d/vec3';
import { Sphere3D } from './primitives/sphere3d';
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
var v3add = Vec3.add;
var v3squaredDistance = Vec3.squaredDistance;
var v3distance = Vec3.distance;
export { CentroidHelper };
var CentroidHelper = /** @class */ (function () {
    function CentroidHelper() {
        this.count = 0;
        this.center = Vec3();
        this.radiusSq = 0;
    }
    CentroidHelper.prototype.reset = function () {
        Vec3.set(this.center, 0, 0, 0);
        this.radiusSq = 0;
        this.count = 0;
    };
    CentroidHelper.prototype.includeStep = function (p) {
        v3add(this.center, this.center, p);
        this.count++;
    };
    CentroidHelper.prototype.finishedIncludeStep = function () {
        if (this.count === 0)
            return;
        Vec3.scale(this.center, this.center, 1 / this.count);
    };
    CentroidHelper.prototype.radiusStep = function (p) {
        var d = v3squaredDistance(p, this.center);
        if (d > this.radiusSq)
            this.radiusSq = d;
    };
    CentroidHelper.prototype.radiusSphereStep = function (center, radius) {
        var _d = v3distance(center, this.center) + radius;
        var d = _d * _d;
        if (d > this.radiusSq)
            this.radiusSq = d;
    };
    CentroidHelper.prototype.getSphere = function (sphere) {
        if (!sphere)
            sphere = Sphere3D();
        Vec3.copy(sphere.center, this.center);
        sphere.radius = Math.sqrt(this.radiusSq);
        return sphere;
    };
    CentroidHelper.prototype.getCount = function () {
        return this.count;
    };
    return CentroidHelper;
}());
(function (CentroidHelper) {
    var helper = new CentroidHelper();
    var posA = Vec3();
    var posB = Vec3();
    function fromArrays(_a, to) {
        var x = _a.x, y = _a.y, z = _a.z;
        helper.reset();
        var n = x.length;
        for (var i = 0; i < n; i++) {
            Vec3.set(posA, x[i], y[i], z[i]);
            helper.includeStep(posA);
        }
        helper.finishedIncludeStep();
        for (var i = 0; i < n; i++) {
            Vec3.set(posA, x[i], y[i], z[i]);
            helper.radiusStep(posA);
        }
        Vec3.copy(to.center, helper.center);
        to.radius = Math.sqrt(helper.radiusSq);
        return to;
    }
    CentroidHelper.fromArrays = fromArrays;
    function fromProvider(count, getter, to) {
        helper.reset();
        for (var i = 0; i < count; i++) {
            getter(i, posA);
            helper.includeStep(posA);
        }
        helper.finishedIncludeStep();
        for (var i = 0; i < count; i++) {
            getter(i, posA);
            helper.radiusStep(posA);
        }
        Vec3.copy(to.center, helper.center);
        to.radius = Math.sqrt(helper.radiusSq);
        return to;
    }
    CentroidHelper.fromProvider = fromProvider;
    function fromPairProvider(count, getter, to) {
        helper.reset();
        for (var i = 0; i < count; i++) {
            getter(i, posA, posB);
            helper.includeStep(posA);
            helper.includeStep(posB);
        }
        helper.finishedIncludeStep();
        for (var i = 0; i < count; i++) {
            getter(i, posA, posB);
            helper.radiusStep(posA);
            helper.radiusStep(posB);
        }
        Vec3.copy(to.center, helper.center);
        to.radius = Math.sqrt(helper.radiusSq);
        return to;
    }
    CentroidHelper.fromPairProvider = fromPairProvider;
})(CentroidHelper || (CentroidHelper = {}));
