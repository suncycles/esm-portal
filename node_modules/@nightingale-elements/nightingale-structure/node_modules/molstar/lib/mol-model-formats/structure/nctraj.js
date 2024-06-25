/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { Task } from '../../mol-task';
import { Coordinates, Time } from '../../mol-model/structure/coordinates';
import { Cell } from '../../mol-math/geometry/spacegroup/cell';
import { Vec3 } from '../../mol-math/linear-algebra';
export function coordinatesFromNctraj(file) {
    var _this = this;
    return Task.create('Parse NCTRAJ', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
        var deltaTime, offsetTime, frames, i, il, c, elementCount, x, y, z, j, jl, frame, lengths, x_1, y_1, z_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ctx.update('Converting to coordinates')];
                case 1:
                    _a.sent();
                    deltaTime = Time(file.deltaTime, 'step');
                    offsetTime = Time(file.timeOffset, deltaTime.unit);
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
                            time: Time(offsetTime.value + deltaTime.value * i, deltaTime.unit)
                        };
                        // TODO: handle case where cell_lengths and cell_angles are set, i.e., angles not 90deg
                        if (file.cell_lengths) {
                            lengths = file.cell_lengths[i];
                            x_1 = Vec3.scale(Vec3(), Vec3.unitX, lengths[0]);
                            y_1 = Vec3.scale(Vec3(), Vec3.unitY, lengths[1]);
                            z_1 = Vec3.scale(Vec3(), Vec3.unitZ, lengths[2]);
                            frame.cell = Cell.fromBasis(x_1, y_1, z_1);
                        }
                        frames.push(frame);
                    }
                    return [2 /*return*/, Coordinates.create(frames, deltaTime, offsetTime)];
            }
        });
    }); });
}
