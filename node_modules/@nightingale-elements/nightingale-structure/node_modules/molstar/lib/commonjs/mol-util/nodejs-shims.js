"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 * @author Russell Parker <russell@benchling.com>
 *
 * Implements some browser-only global variables for Node.js environment.
 * These workarounds will also work in browsers as usual.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.File_ = exports.XMLHttpRequest_ = exports.RUNNING_IN_NODEJS = void 0;
/** Determines whether the current code is running in Node.js */
exports.RUNNING_IN_NODEJS = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
/** Like `XMLHttpRequest` but works also in Node.js */
exports.XMLHttpRequest_ = getXMLHttpRequest();
/** Like `File` but works also in Node.js */
exports.File_ = getFile();
function getXMLHttpRequest() {
    if (typeof XMLHttpRequest === 'undefined' || exports.RUNNING_IN_NODEJS) {
        return require('xhr2');
    }
    else {
        return XMLHttpRequest;
    }
}
function getFile() {
    if (typeof File === 'undefined' || exports.RUNNING_IN_NODEJS) {
        var File_NodeJs = /** @class */ (function () {
            function File_NodeJs(fileBits, fileName, options) {
                var _a;
                this.blob = new Blob(fileBits, options);
                // Blob fields
                this.size = this.blob.size;
                this.type = this.blob.type;
                // File fields
                this.name = fileName;
                this.lastModified = (_a = options === null || options === void 0 ? void 0 : options.lastModified) !== null && _a !== void 0 ? _a : 0;
                this.webkitRelativePath = '';
            }
            File_NodeJs.prototype.arrayBuffer = function () { return this.blob.arrayBuffer(); };
            File_NodeJs.prototype.slice = function (start, end, contentType) { return this.blob.slice(start, end, contentType); };
            File_NodeJs.prototype.stream = function () { return this.blob.stream(); };
            File_NodeJs.prototype.text = function () { return this.blob.text(); };
            return File_NodeJs;
        }());
        return File_NodeJs;
    }
    else {
        return File;
    }
}
