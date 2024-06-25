"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeStructureMolecularSurface = exports.computeUnitMolecularSurface = void 0;
var tslib_1 = require("tslib");
var mol_task_1 = require("../../../../mol-task");
var common_1 = require("./common");
var molecular_surface_1 = require("../../../../mol-math/geometry/molecular-surface");
var int_1 = require("../../../../mol-data/int");
function getUnitPositionDataAndMaxRadius(structure, unit, sizeTheme, props) {
    var probeRadius = props.probeRadius;
    var _a = (0, common_1.getUnitConformationAndRadius)(structure, unit, sizeTheme, props), position = _a.position, boundary = _a.boundary, radius = _a.radius;
    var indices = position.indices;
    var n = int_1.OrderedSet.size(indices);
    var radii = new Float32Array(int_1.OrderedSet.end(indices));
    var maxRadius = 0;
    for (var i = 0; i < n; ++i) {
        var j = int_1.OrderedSet.getAt(indices, i);
        var r = radius(j);
        if (maxRadius < r)
            maxRadius = r;
        radii[j] = r + probeRadius;
    }
    return { position: tslib_1.__assign(tslib_1.__assign({}, position), { radius: radii }), boundary: boundary, maxRadius: maxRadius };
}
function computeUnitMolecularSurface(structure, unit, sizeTheme, props) {
    var _this = this;
    var _a = getUnitPositionDataAndMaxRadius(structure, unit, sizeTheme, props), position = _a.position, boundary = _a.boundary, maxRadius = _a.maxRadius;
    var p = (0, common_1.ensureReasonableResolution)(boundary.box, props);
    return mol_task_1.Task.create('Molecular Surface', function (ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, MolecularSurface(ctx, position, boundary, maxRadius, boundary.box, p)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); });
}
exports.computeUnitMolecularSurface = computeUnitMolecularSurface;
//
function getStructurePositionDataAndMaxRadius(structure, sizeTheme, props) {
    var probeRadius = props.probeRadius;
    var _a = (0, common_1.getStructureConformationAndRadius)(structure, sizeTheme, props), position = _a.position, boundary = _a.boundary, radius = _a.radius;
    var indices = position.indices;
    var n = int_1.OrderedSet.size(indices);
    var radii = new Float32Array(int_1.OrderedSet.end(indices));
    var maxRadius = 0;
    for (var i = 0; i < n; ++i) {
        var j = int_1.OrderedSet.getAt(indices, i);
        var r = radius(j);
        if (maxRadius < r)
            maxRadius = r;
        radii[j] = r + probeRadius;
    }
    return { position: tslib_1.__assign(tslib_1.__assign({}, position), { radius: radii }), boundary: boundary, maxRadius: maxRadius };
}
function computeStructureMolecularSurface(structure, sizeTheme, props) {
    var _this = this;
    var _a = getStructurePositionDataAndMaxRadius(structure, sizeTheme, props), position = _a.position, boundary = _a.boundary, maxRadius = _a.maxRadius;
    var p = (0, common_1.ensureReasonableResolution)(boundary.box, props);
    return mol_task_1.Task.create('Molecular Surface', function (ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, MolecularSurface(ctx, position, boundary, maxRadius, boundary.box, p)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); });
}
exports.computeStructureMolecularSurface = computeStructureMolecularSurface;
//
function MolecularSurface(ctx, position, boundary, maxRadius, box, props) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, (0, molecular_surface_1.calcMolecularSurface)(ctx, position, boundary, maxRadius, box, props)];
        });
    });
}
