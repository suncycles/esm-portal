/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { __awaiter, __extends, __generator } from "tslib";
import fs from 'fs';
import { PluginContext } from './context';
import { HeadlessScreenshotHelper } from './util/headless-screenshot';
/** PluginContext that can be used in Node.js (without DOM) */
var HeadlessPluginContext = /** @class */ (function (_super) {
    __extends(HeadlessPluginContext, _super);
    /** External modules (`gl` and optionally `pngjs` and `jpeg-js`) must be provided to the constructor (this is to avoid Mol* being dependent on these packages which are only used here) */
    function HeadlessPluginContext(externalModules, spec, canvasSize, rendererOptions) {
        if (canvasSize === void 0) { canvasSize = { width: 640, height: 480 }; }
        var _this = _super.call(this, spec) || this;
        _this.renderer = new HeadlessScreenshotHelper(externalModules, canvasSize, undefined, rendererOptions);
        _this.canvas3d = _this.renderer.canvas3d;
        return _this;
    }
    /** Render the current plugin state and save to a PNG or JPEG file */
    HeadlessPluginContext.prototype.saveImage = function (outPath, imageSize, props, format, jpegQuality) {
        if (jpegQuality === void 0) { jpegQuality = 90; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var snapshot, snapshot_json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        snapshot = this.getStateSnapshot();
                        snapshot_json = JSON.stringify(snapshot, null, 2);
                        return [4 /*yield*/, new Promise(function (resolve) {
                                fs.writeFile(outPath, snapshot_json, function () { return resolve(); });
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return HeadlessPluginContext;
}(PluginContext));
export { HeadlessPluginContext };
