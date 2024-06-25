/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from NGL.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { Task } from '../../../mol-task';
import { ReaderResult as Result } from '../result';
function parseInternal(data) {
    return __awaiter(this, void 0, void 0, function () {
        var dv, f, coordinates, boxes, times, offset, versionSize, boxSize, virSize, presSize, coordSize, velocitySize, forceSize, natoms, floatSize, natoms3, box, i, i, x, y, z, i, tmp, i, value, frameCoords, i;
        return __generator(this, function (_a) {
            dv = new DataView(data.buffer);
            f = {
                frames: [],
                boxes: [],
                times: [],
                timeOffset: 0,
                deltaTime: 0
            };
            coordinates = f.frames;
            boxes = f.boxes;
            times = f.times;
            offset = 0;
            while (true) {
                // const magicnum = dv.getInt32(offset)
                // const i1 = dv.getFloat32(offset + 4)
                offset += 8;
                versionSize = dv.getInt32(offset);
                offset += 4;
                offset += versionSize;
                boxSize = dv.getInt32(offset + 8);
                virSize = dv.getInt32(offset + 12);
                presSize = dv.getInt32(offset + 16);
                coordSize = dv.getInt32(offset + 28);
                velocitySize = dv.getInt32(offset + 32);
                forceSize = dv.getInt32(offset + 36);
                natoms = dv.getInt32(offset + 40);
                // const step = dv.getInt32(offset + 44)
                // const nre = dv.getInt32(offset + 48)
                offset += 52;
                floatSize = boxSize / 9;
                natoms3 = natoms * 3;
                // let lambda
                if (floatSize === 8) {
                    times.push(dv.getFloat64(offset));
                    // lambda = dv.getFloat64(offset + 8)
                }
                else {
                    times.push(dv.getFloat32(offset));
                    // lambda = dv.getFloat32(offset + 4)
                }
                offset += 2 * floatSize;
                if (boxSize) {
                    box = new Float32Array(9);
                    if (floatSize === 8) {
                        for (i = 0; i < 9; ++i) {
                            box[i] = dv.getFloat64(offset) * 10;
                            offset += 8;
                        }
                    }
                    else {
                        for (i = 0; i < 9; ++i) {
                            box[i] = dv.getFloat32(offset) * 10;
                            offset += 4;
                        }
                    }
                    boxes.push(box);
                }
                // ignore, unused
                offset += virSize;
                // ignore, unused
                offset += presSize;
                if (coordSize) {
                    x = new Float32Array(natoms);
                    y = new Float32Array(natoms);
                    z = new Float32Array(natoms);
                    if (floatSize === 8) {
                        for (i = 0; i < natoms; ++i) {
                            x[i] = dv.getFloat64(offset) * 10;
                            y[i] = dv.getFloat64(offset + 8) * 10;
                            z[i] = dv.getFloat64(offset + 16) * 10;
                            offset += 24;
                        }
                    }
                    else {
                        tmp = new Uint32Array(data.buffer, offset, natoms3);
                        for (i = 0; i < natoms3; ++i) {
                            value = tmp[i];
                            tmp[i] = (((value & 0xFF) << 24) | ((value & 0xFF00) << 8) |
                                ((value >> 8) & 0xFF00) | ((value >> 24) & 0xFF));
                        }
                        frameCoords = new Float32Array(data.buffer, offset, natoms3);
                        for (i = 0; i < natoms; ++i) {
                            x[i] = frameCoords[i * 3] * 10;
                            y[i] = frameCoords[i * 3 + 1] * 10;
                            z[i] = frameCoords[i * 3 + 2] * 10;
                            offset += 12;
                        }
                    }
                    coordinates.push({ count: natoms, x: x, y: y, z: z });
                }
                // ignore, unused
                offset += velocitySize;
                // ignore, unused
                offset += forceSize;
                if (offset >= data.byteLength)
                    break;
            }
            if (times.length >= 1) {
                f.timeOffset = times[0];
            }
            if (times.length >= 2) {
                f.deltaTime = times[1] - times[0];
            }
            return [2 /*return*/, f];
        });
    });
}
export function parseTrr(data) {
    var _this = this;
    return Task.create('Parse TRR', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
        var file, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    ctx.update({ canAbort: true, message: 'Parsing trajectory...' });
                    return [4 /*yield*/, parseInternal(data)];
                case 1:
                    file = _a.sent();
                    return [2 /*return*/, Result.success(file)];
                case 2:
                    e_1 = _a.sent();
                    return [2 /*return*/, Result.error('' + e_1)];
                case 3: return [2 /*return*/];
            }
        });
    }); });
}
