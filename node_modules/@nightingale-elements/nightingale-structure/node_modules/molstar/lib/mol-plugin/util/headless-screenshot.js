/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Jesse Liang <jesse.liang@rcsb.org>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 * @author Ke Ma <mark.ma@rcsb.org>
 * @author Adam Midlik <midlik@gmail.com>
 */
import { __assign, __awaiter, __generator } from "tslib";
import fs from 'fs';
import path from 'path';
import { Canvas3D, Canvas3DContext, DefaultCanvas3DParams } from '../../mol-canvas3d/canvas3d';
import { Passes } from '../../mol-canvas3d/passes/passes';
import { PostprocessingParams } from '../../mol-canvas3d/passes/postprocessing';
import { createContext } from '../../mol-gl/webgl/context';
import { AssetManager } from '../../mol-util/assets';
import { ColorNames } from '../../mol-util/color/names';
import { PixelData } from '../../mol-util/image';
import { InputObserver } from '../../mol-util/input/input-observer';
import { ParamDefinition } from '../../mol-util/param-definition';
/** To render Canvas3D when running in Node.js (without DOM) */
var HeadlessScreenshotHelper = /** @class */ (function () {
    function HeadlessScreenshotHelper(externalModules, canvasSize, canvas3d, options) {
        var _a, _b, _c;
        this.externalModules = externalModules;
        this.canvasSize = canvasSize;
        if (canvas3d) {
            this.canvas3d = canvas3d;
        }
        else {
            var glContext = this.externalModules.gl(this.canvasSize.width, this.canvasSize.height, (_a = options === null || options === void 0 ? void 0 : options.webgl) !== null && _a !== void 0 ? _a : defaultWebGLAttributes());
            var webgl = createContext(glContext);
            var input = InputObserver.create();
            var attribs = __assign({}, Canvas3DContext.DefaultAttribs);
            var passes = new Passes(webgl, new AssetManager(), attribs);
            this.canvas3d = Canvas3D.create({ webgl: webgl, input: input, passes: passes, attribs: attribs }, (_b = options === null || options === void 0 ? void 0 : options.canvas) !== null && _b !== void 0 ? _b : defaultCanvas3DParams());
        }
        this.imagePass = this.canvas3d.getImagePass((_c = options === null || options === void 0 ? void 0 : options.imagePass) !== null && _c !== void 0 ? _c : defaultImagePassParams());
        this.imagePass.setSize(this.canvasSize.width, this.canvasSize.height);
    }
    HeadlessScreenshotHelper.prototype.getImageData = function (width, height) {
        this.imagePass.setSize(width, height);
        this.imagePass.render();
        this.imagePass.colorTarget.bind();
        var array = new Uint8Array(width * height * 4);
        this.canvas3d.webgl.readPixels(0, 0, width, height, array);
        var pixelData = PixelData.create(array, width, height);
        PixelData.flipY(pixelData);
        PixelData.divideByAlpha(pixelData);
        // ImageData is not defined in Node.js
        return { data: new Uint8ClampedArray(array), width: width, height: height };
    };
    HeadlessScreenshotHelper.prototype.getImageRaw = function (imageSize, postprocessing) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var width, height;
            return __generator(this, function (_c) {
                width = (_a = imageSize === null || imageSize === void 0 ? void 0 : imageSize.width) !== null && _a !== void 0 ? _a : this.canvasSize.width;
                height = (_b = imageSize === null || imageSize === void 0 ? void 0 : imageSize.height) !== null && _b !== void 0 ? _b : this.canvasSize.height;
                this.canvas3d.commit(true);
                this.imagePass.setProps({
                    postprocessing: ParamDefinition.merge(PostprocessingParams, this.canvas3d.props.postprocessing, postprocessing),
                });
                return [2 /*return*/, this.getImageData(width, height)];
            });
        });
    };
    HeadlessScreenshotHelper.prototype.getImagePng = function (imageSize, postprocessing) {
        return __awaiter(this, void 0, void 0, function () {
            var imageData, generatedPng;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getImageRaw(imageSize, postprocessing)];
                    case 1:
                        imageData = _a.sent();
                        if (!this.externalModules.pngjs) {
                            throw new Error("External module 'pngjs' was not provided. If you want to use getImagePng, you must import 'pngjs' and provide it to the HeadlessPluginContext/HeadlessScreenshotHelper constructor.");
                        }
                        generatedPng = new this.externalModules.pngjs.PNG({ width: imageData.width, height: imageData.height });
                        generatedPng.data = Buffer.from(imageData.data.buffer);
                        return [2 /*return*/, generatedPng];
                }
            });
        });
    };
    HeadlessScreenshotHelper.prototype.getImageJpeg = function (imageSize, postprocessing, jpegQuality) {
        if (jpegQuality === void 0) { jpegQuality = 90; }
        return __awaiter(this, void 0, void 0, function () {
            var imageData, generatedJpeg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getImageRaw(imageSize, postprocessing)];
                    case 1:
                        imageData = _a.sent();
                        if (!this.externalModules['jpeg-js']) {
                            throw new Error("External module 'jpeg-js' was not provided. If you want to use getImageJpeg, you must import 'jpeg-js' and provide it to the HeadlessPluginContext/HeadlessScreenshotHelper constructor.");
                        }
                        generatedJpeg = this.externalModules['jpeg-js'].encode(imageData, jpegQuality);
                        return [2 /*return*/, generatedJpeg];
                }
            });
        });
    };
    HeadlessScreenshotHelper.prototype.saveImage = function (outPath, imageSize, postprocessing, format, jpegQuality) {
        if (jpegQuality === void 0) { jpegQuality = 90; }
        return __awaiter(this, void 0, void 0, function () {
            var extension, generatedPng, generatedJpeg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!format) {
                            extension = path.extname(outPath).toLowerCase();
                            if (extension === '.png')
                                format = 'png';
                            else if (extension === '.jpg' || extension === '.jpeg')
                                format = 'jpeg';
                            else
                                throw new Error("Cannot guess image format from file path '".concat(outPath, "'. Specify format explicitly or use path with one of these extensions: .png, .jpg, .jpeg"));
                        }
                        if (!(format === 'png')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getImagePng(imageSize, postprocessing)];
                    case 1:
                        generatedPng = _a.sent();
                        return [4 /*yield*/, writePngFile(generatedPng, outPath)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 3:
                        if (!(format === 'jpeg')) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getImageJpeg(imageSize, postprocessing, jpegQuality)];
                    case 4:
                        generatedJpeg = _a.sent();
                        return [4 /*yield*/, writeJpegFile(generatedJpeg, outPath)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6: throw new Error("Invalid format: ".concat(format));
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return HeadlessScreenshotHelper;
}());
export { HeadlessScreenshotHelper };
function writePngFile(png, outPath) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve) {
                        png.pack().pipe(fs.createWriteStream(outPath)).on('finish', resolve);
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function writeJpegFile(jpeg, outPath) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve) {
                        fs.writeFile(outPath, jpeg.data, function () { return resolve(); });
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
export function defaultCanvas3DParams() {
    return {
        camera: {
            mode: 'orthographic',
            helper: {
                axes: { name: 'off', params: {} }
            },
            stereo: {
                name: 'off', params: {}
            },
            fov: 90,
            manualReset: false,
        },
        cameraResetDurationMs: 0,
        cameraFog: {
            name: 'on',
            params: {
                intensity: 50
            }
        },
        renderer: __assign(__assign({}, DefaultCanvas3DParams.renderer), { backgroundColor: ColorNames.white }),
        postprocessing: {
            occlusion: {
                name: 'off', params: {}
            },
            outline: {
                name: 'off', params: {}
            },
            antialiasing: {
                name: 'fxaa',
                params: {
                    edgeThresholdMin: 0.0312,
                    edgeThresholdMax: 0.063,
                    iterations: 12,
                    subpixelQuality: 0.3
                }
            },
            background: { variant: { name: 'off', params: {} } },
            shadow: { name: 'off', params: {} },
        }
    };
}
export function defaultWebGLAttributes() {
    return {
        antialias: true,
        preserveDrawingBuffer: true,
        alpha: true,
        depth: true,
        premultipliedAlpha: true, // the renderer outputs PMA
    };
}
export function defaultImagePassParams() {
    return {
        cameraHelper: {
            axes: { name: 'off', params: {} },
        },
        multiSample: {
            mode: 'on',
            sampleLevel: 4
        }
    };
}
export var STYLIZED_POSTPROCESSING = {
    occlusion: {
        name: 'on', params: {
            samples: 32,
            multiScale: { name: 'off', params: {} },
            radius: 5,
            bias: 0.8,
            blurKernelSize: 15,
            resolutionScale: 1,
            color: ColorNames.black,
        }
    }, outline: {
        name: 'on', params: {
            scale: 1,
            threshold: 0.95,
            color: ColorNames.black,
            includeTransparent: true,
        }
    }
};
