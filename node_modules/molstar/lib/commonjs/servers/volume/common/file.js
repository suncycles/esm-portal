"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeInt = exports.createFile = exports.exists = exports.openRead = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const simple_buffer_1 = require("../../../mol-io/common/simple-buffer");
async function openRead(filename) {
    return new Promise((res, rej) => {
        fs.open(filename, 'r', async (err, file) => {
            if (err) {
                rej(err);
                return;
            }
            try {
                res(file);
            }
            catch (e) {
                fs.closeSync(file);
            }
        });
    });
}
exports.openRead = openRead;
function makeDir(path, root) {
    const dirs = path.split(/\/|\\/g), dir = dirs.shift();
    root = (root || '') + dir + '/';
    try {
        fs.mkdirSync(root);
    }
    catch (e) {
        if (!fs.statSync(root).isDirectory())
            throw new Error(e);
    }
    return !dirs.length || makeDir(dirs.join('/'), root);
}
function exists(filename) {
    return fs.existsSync(filename);
}
exports.exists = exists;
function createFile(filename) {
    return new Promise((res, rej) => {
        if (fs.existsSync(filename))
            fs.unlinkSync(filename);
        makeDir(path.dirname(filename));
        fs.open(filename, 'w', (err, file) => {
            if (err)
                rej(err);
            else
                res(file);
        });
    });
}
exports.createFile = createFile;
const smallBuffer = simple_buffer_1.SimpleBuffer.fromBuffer(Buffer.alloc(8));
async function writeInt(file, value, position) {
    smallBuffer.writeInt32LE(value, 0);
    await file.writeBuffer(position, smallBuffer, 4);
}
exports.writeInt = writeInt;
