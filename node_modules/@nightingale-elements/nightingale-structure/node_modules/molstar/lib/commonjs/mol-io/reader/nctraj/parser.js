"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNctraj = void 0;
var tslib_1 = require("tslib");
var mol_task_1 = require("../../../mol-task");
var reader_1 = require("../../common/netcdf/reader");
var result_1 = require("../result");
function parseInternal(data) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var nc, f, _i, _a, c, velocities, _b, _c, v, forces, _d, _e, f_1, cell_lengths, _f, _g, l, cell_angles, _h, _j, a, time, _k, _l, t;
        return tslib_1.__generator(this, function (_m) {
            nc = new reader_1.NetcdfReader(data);
            f = {
                coordinates: [],
                time: [],
                timeOffset: 0,
                deltaTime: 1
            };
            for (_i = 0, _a = nc.getDataVariable('coordinates'); _i < _a.length; _i++) {
                c = _a[_i];
                f.coordinates.push(c);
            }
            if (nc.hasDataVariable('velocities')) {
                velocities = [];
                for (_b = 0, _c = nc.getDataVariable('velocities'); _b < _c.length; _b++) {
                    v = _c[_b];
                    velocities.push(v);
                }
                f.velocities = velocities;
            }
            if (nc.hasDataVariable('forces')) {
                forces = [];
                for (_d = 0, _e = nc.getDataVariable('forces'); _d < _e.length; _d++) {
                    f_1 = _e[_d];
                    forces.push(f_1);
                }
                f.forces = forces;
            }
            if (nc.hasDataVariable('cell_lengths')) {
                cell_lengths = [];
                for (_f = 0, _g = nc.getDataVariable('cell_lengths'); _f < _g.length; _f++) {
                    l = _g[_f];
                    cell_lengths.push(l);
                }
                f.cell_lengths = cell_lengths;
            }
            if (nc.hasDataVariable('cell_angles')) {
                cell_angles = [];
                for (_h = 0, _j = nc.getDataVariable('cell_angles'); _h < _j.length; _h++) {
                    a = _j[_h];
                    cell_angles.push(a);
                }
                f.cell_angles = cell_angles;
            }
            if (nc.hasDataVariable('time')) {
                time = [];
                for (_k = 0, _l = nc.getDataVariable('time'); _k < _l.length; _k++) {
                    t = _l[_k];
                    time.push(t);
                }
                f.time = time;
            }
            if (f.time) {
                if (f.time.length >= 1) {
                    f.timeOffset = f.time[0];
                }
                if (f.time.length >= 2) {
                    f.deltaTime = f.time[1] - f.time[0];
                }
            }
            return [2 /*return*/, f];
        });
    });
}
function parseNctraj(data) {
    var _this = this;
    return mol_task_1.Task.create('Parse NCTRAJ', function (ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var file, e_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    ctx.update({ canAbort: true, message: 'Parsing trajectory...' });
                    return [4 /*yield*/, parseInternal(data)];
                case 1:
                    file = _a.sent();
                    return [2 /*return*/, result_1.ReaderResult.success(file)];
                case 2:
                    e_1 = _a.sent();
                    return [2 /*return*/, result_1.ReaderResult.error('' + e_1)];
                case 3: return [2 /*return*/];
            }
        });
    }); });
}
exports.parseNctraj = parseNctraj;
