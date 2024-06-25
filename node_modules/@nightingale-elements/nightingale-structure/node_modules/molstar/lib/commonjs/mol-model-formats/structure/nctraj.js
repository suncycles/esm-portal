"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.coordinatesFromNctraj = void 0;
var tslib_1 = require("tslib");
var mol_task_1 = require("../../mol-task");
var coordinates_1 = require("../../mol-model/structure/coordinates");
var cell_1 = require("../../mol-math/geometry/spacegroup/cell");
var linear_algebra_1 = require("../../mol-math/linear-algebra");
function coordinatesFromNctraj(file) {
    var _this = this;
    return mol_task_1.Task.create('Parse NCTRAJ', function (ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var deltaTime, offsetTime, frames, i, il, c, elementCount, x, y, z, j, jl, frame, lengths, x_1, y_1, z_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ctx.update('Converting to coordinates')];
                case 1:
                    _a.sent();
                    deltaTime = (0, coordinates_1.Time)(file.deltaTime, 'step');
                    offsetTime = (0, coordinates_1.Time)(file.timeOffset, deltaTime.unit);
                    frames = [];
                    for (i = 0, il = file.coordinates.length; i < il; ++i) {
                        c = file.coordinates[i];
                        elementCount = c.length / 3;
                        x = new Float32Array(elementCount);
                        y = new Float32Array(elementCount);
                        z = new Float32Array(elementCount);
                        for (j = 0, jl = c.length; j < jl; j += 3) {
                            x[j / 3] = c[j];
                            y[j / 3] = c[j + 1];
                            z[j / 3] = c[j + 2];
                        }
                        frame = {
                            elementCount: elementCount,
                            x: x,
                            y: y,
                            z: z,
                            xyzOrdering: { isIdentity: true },
                            time: (0, coordinates_1.Time)(offsetTime.value + deltaTime.value * i, deltaTime.unit)
                        };
                        // TODO: handle case where cell_lengths and cell_angles are set, i.e., angles not 90deg
                        if (file.cell_lengths) {
                            lengths = file.cell_lengths[i];
                            x_1 = linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.unitX, lengths[0]);
                            y_1 = linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.unitY, lengths[1]);
                            z_1 = linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.unitZ, lengths[2]);
                            frame.cell = cell_1.Cell.fromBasis(x_1, y_1, z_1);
                        }
                        frames.push(frame);
                    }
                    return [2 /*return*/, coordinates_1.Coordinates.create(frames, deltaTime, offsetTime)];
            }
        });
    }); });
}
exports.coordinatesFromNctraj = coordinatesFromNctraj;
