/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Ke Ma <mark.ma@rcsb.org>
 * @author Adam Midlik <midlik@gmail.com>
 */
import { __assign } from "tslib";
import { BoundaryHelper } from '../../mol-math/geometry/boundary-helper';
import { Mat3 } from '../../mol-math/linear-algebra';
import { Loci } from '../../mol-model/loci';
import { StructureElement } from '../../mol-model/structure';
import { PluginStateObject } from '../objects';
import { pcaFocus } from './focus-camera/focus-first-residue';
import { changeCameraRotation, structureLayingTransform } from './focus-camera/orient-axes';
// TODO: make this customizable somewhere?
var DefaultCameraFocusOptions = {
    minRadius: 5,
    extraRadius: 4,
    durationMs: 250,
};
var CameraManager = /** @class */ (function () {
    function CameraManager(plugin) {
        this.plugin = plugin;
        this.boundaryHelper = new BoundaryHelper('98');
    }
    CameraManager.prototype.transformedLoci = function (loci) {
        var _a, _b;
        if (StructureElement.Loci.is(loci)) {
            // use decorated (including 3d transforms) parent structure
            var parent_1 = (_b = (_a = this.plugin.helpers.substructureParent.get(loci.structure)) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
            if (parent_1)
                loci = StructureElement.Loci.remap(loci, parent_1);
        }
        return loci;
    };
    CameraManager.prototype.focusRenderObjects = function (objects, options) {
        if (!objects)
            return;
        var spheres = [];
        for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
            var o = objects_1[_i];
            var s = o.values.boundingSphere.ref.value;
            if (s.radius === 0)
                continue;
            spheres.push(s);
        }
        this.focusSpheres(spheres, function (s) { return s; }, options);
    };
    CameraManager.prototype.focusLoci = function (loci, options) {
        // TODO: allow computation of principal axes here?
        // perhaps have an optimized function, that does exact axes small Loci and approximate/sampled from big ones?
        var sphere;
        if (Array.isArray(loci) && loci.length > 1) {
            var spheres = [];
            for (var _i = 0, loci_1 = loci; _i < loci_1.length; _i++) {
                var l = loci_1[_i];
                var s = Loci.getBoundingSphere(this.transformedLoci(l));
                if (s)
                    spheres.push(s);
            }
            if (spheres.length === 0)
                return;
            this.boundaryHelper.reset();
            for (var _a = 0, spheres_1 = spheres; _a < spheres_1.length; _a++) {
                var s = spheres_1[_a];
                this.boundaryHelper.includeSphere(s);
            }
            this.boundaryHelper.finishedIncludeStep();
            for (var _b = 0, spheres_2 = spheres; _b < spheres_2.length; _b++) {
                var s = spheres_2[_b];
                this.boundaryHelper.radiusSphere(s);
            }
            sphere = this.boundaryHelper.getSphere();
        }
        else if (Array.isArray(loci)) {
            if (loci.length === 0)
                return;
            sphere = Loci.getBoundingSphere(this.transformedLoci(loci[0]));
        }
        else {
            sphere = Loci.getBoundingSphere(this.transformedLoci(loci));
        }
        if (sphere) {
            this.focusSphere(sphere, options);
        }
    };
    CameraManager.prototype.focusSpheres = function (xs, sphere, options) {
        var spheres = [];
        for (var _i = 0, xs_1 = xs; _i < xs_1.length; _i++) {
            var x = xs_1[_i];
            var s = sphere(x);
            if (s)
                spheres.push(s);
        }
        if (spheres.length === 0)
            return;
        if (spheres.length === 1)
            return this.focusSphere(spheres[0], options);
        this.boundaryHelper.reset();
        for (var _a = 0, spheres_3 = spheres; _a < spheres_3.length; _a++) {
            var s = spheres_3[_a];
            this.boundaryHelper.includeSphere(s);
        }
        this.boundaryHelper.finishedIncludeStep();
        for (var _b = 0, spheres_4 = spheres; _b < spheres_4.length; _b++) {
            var s = spheres_4[_b];
            this.boundaryHelper.radiusSphere(s);
        }
        this.focusSphere(this.boundaryHelper.getSphere(), options);
    };
    CameraManager.prototype.focusSphere = function (sphere, options) {
        var _a;
        var canvas3d = this.plugin.canvas3d;
        if (!canvas3d)
            return;
        var _b = __assign(__assign({}, DefaultCameraFocusOptions), options), extraRadius = _b.extraRadius, minRadius = _b.minRadius, durationMs = _b.durationMs;
        var radius = Math.max(sphere.radius + extraRadius, minRadius);
        if (options === null || options === void 0 ? void 0 : options.principalAxes) {
            var snapshot = pcaFocus(this.plugin, radius, options);
            (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.requestCameraReset({ durationMs: durationMs, snapshot: snapshot });
        }
        else {
            var snapshot = canvas3d.camera.getFocus(sphere.center, radius);
            canvas3d.requestCameraReset({ durationMs: durationMs, snapshot: snapshot });
        }
    };
    /** Align PCA axes of `structures` (default: all loaded structures) to the screen axes. */
    CameraManager.prototype.orientAxes = function (structures, durationMs) {
        if (!this.plugin.canvas3d)
            return;
        if (!structures) {
            var structCells = this.plugin.state.data.selectQ(function (q) { return q.ofType(PluginStateObject.Molecule.Structure); });
            var rootStructCells = structCells.filter(function (cell) { return cell.obj && !cell.transform.transformer.definition.isDecorator && !cell.obj.data.parent; });
            structures = rootStructCells.map(function (cell) { var _a; return (_a = cell.obj) === null || _a === void 0 ? void 0 : _a.data; }).filter(function (struct) { return !!struct; });
        }
        var rotation = structureLayingTransform(structures).rotation;
        var newSnapshot = changeCameraRotation(this.plugin.canvas3d.camera.getSnapshot(), rotation);
        this.setSnapshot(newSnapshot, durationMs);
    };
    /** Align Cartesian axes to the screen axes (X right, Y up). */
    CameraManager.prototype.resetAxes = function (durationMs) {
        if (!this.plugin.canvas3d)
            return;
        var newSnapshot = changeCameraRotation(this.plugin.canvas3d.camera.getSnapshot(), Mat3.Identity);
        this.setSnapshot(newSnapshot, durationMs);
    };
    CameraManager.prototype.setSnapshot = function (snapshot, durationMs) {
        var _a;
        // TODO: setState and requestCameraReset are very similar now: unify them?
        (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.requestCameraReset({ snapshot: snapshot, durationMs: durationMs });
    };
    CameraManager.prototype.reset = function (snapshot, durationMs) {
        var _a;
        (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.requestCameraReset({ snapshot: snapshot, durationMs: durationMs });
    };
    return CameraManager;
}());
export { CameraManager };
