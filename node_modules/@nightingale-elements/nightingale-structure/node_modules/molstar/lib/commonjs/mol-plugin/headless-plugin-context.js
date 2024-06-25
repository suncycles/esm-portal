"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeadlessPluginContext = void 0;
var tslib_1 = require("tslib");
var fs_1 = tslib_1.__importDefault(require("fs"));
var context_1 = require("./context");
var headless_screenshot_1 = require("./util/headless-screenshot");
/** PluginContext that can be used in Node.js (without DOM) */
var HeadlessPluginContext = /** @class */ (function (_super) {
    tslib_1.__extends(HeadlessPluginContext, _super);
    /** External modules (`gl` and optionally `pngjs` and `jpeg-js`) must be provided to the constructor (this is to avoid Mol* being dependent on these packages which are only used here) */
    function HeadlessPluginContext(externalModules, spec, canvasSize, rendererOptions) {
        if (canvasSize === void 0) { canvasSize = { width: 640, height: 480 }; }
        var _this = _super.call(this, spec) || this;
        _this.renderer = new headless_screenshot_1.HeadlessScreenshotHelper(externalModules, canvasSize, undefined, rendererOptions);
        _this.canvas3d = _this.renderer.canvas3d;
        return _this;
    }
    /** Render the current plugin state and save to a PNG or JPEG file */
    HeadlessPluginContext.prototype.saveImage = function (outPath, imageSize, props, format, jpegQuality) {
        if (jpegQuality === void 0) { jpegQuality = 90; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.canvas3d.commit(true);
                        return [4 /*yield*/, this.renderer.saveImage(outPath, imageSize, props, format, jpegQuality)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Render the current plugin state and return as raw image data */
    HeadlessPluginContext.prototype.getImageRaw = function (imageSize, props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.canvas3d.commit(true);
                        return [4 /*yield*/, this.renderer.getImageRaw(imageSize, props)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Render the current plugin state and return as a PNG object */
    HeadlessPluginContext.prototype.getImagePng = function (imageSize, props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.canvas3d.commit(true);
                        return [4 /*yield*/, this.renderer.getImagePng(imageSize, props)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Render the current plugin state and return as a JPEG object */
    HeadlessPluginContext.prototype.getImageJpeg = function (imageSize, props, jpegQuality) {
        if (jpegQuality === void 0) { jpegQuality = 90; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.canvas3d.commit(true);
                        return [4 /*yield*/, this.renderer.getImageJpeg(imageSize, props)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Get the current plugin state */
    HeadlessPluginContext.prototype.getStateSnapshot = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.canvas3d.commit(true);
                        return [4 /*yield*/, this.managers.snapshot.getStateSnapshot({ params: {} })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Save the current plugin state to a MOLJ file */
    HeadlessPluginContext.prototype.saveStateSnapshot = function (outPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var snapshot, snapshot_json;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        snapshot = this.getStateSnapshot();
                        snapshot_json = JSON.stringify(snapshot, null, 2);
                        return [4 /*yield*/, new Promise(function (resolve) {
                                fs_1.default.writeFile(outPath, snapshot_json, function () { return resolve(); });
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return HeadlessPluginContext;
}(context_1.PluginContext));
exports.HeadlessPluginContext = HeadlessPluginContext;
