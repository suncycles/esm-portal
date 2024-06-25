"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 *
 * Example command-line application generating images of PDB structures
 * Build: npm install --no-save gl jpeg-js pngjs  // these packages are not listed in dependencies for performance reasons
 *        npm run build
 * Run:   node lib/commonjs/examples/image-renderer 1cbs ../outputs_1cbs/
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var argparse_1 = require("argparse");
var fs_1 = tslib_1.__importDefault(require("fs"));
var path_1 = tslib_1.__importDefault(require("path"));
var gl_1 = tslib_1.__importDefault(require("gl"));
var pngjs_1 = tslib_1.__importDefault(require("pngjs"));
var jpeg_js_1 = tslib_1.__importDefault(require("jpeg-js"));
var data_1 = require("../../mol-plugin-state/transforms/data");
var model_1 = require("../../mol-plugin-state/transforms/model");
var representation_1 = require("../../mol-plugin-state/transforms/representation");
var headless_plugin_context_1 = require("../../mol-plugin/headless-plugin-context");
var spec_1 = require("../../mol-plugin/spec");
var headless_screenshot_1 = require("../../mol-plugin/util/headless-screenshot");
var data_source_1 = require("../../mol-util/data-source");
(0, data_source_1.setFSModule)(fs_1.default);
function parseArguments() {
    var parser = new argparse_1.ArgumentParser({ description: 'Example command-line application generating images of PDB structures' });
    parser.add_argument('pdbId', { help: 'PDB identifier' });
    parser.add_argument('outDirectory', { help: 'Directory for outputs' });
    var args = parser.parse_args();
    return tslib_1.__assign({}, args);
}
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var args, url, externalModules, plugin, update, structure, polymer, ligand;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = parseArguments();
                    url = "https://www.ebi.ac.uk/pdbe/entry-files/download/".concat(args.pdbId, ".bcif");
                    console.log('PDB ID:', args.pdbId);
                    console.log('Source URL:', url);
                    console.log('Outputs:', args.outDirectory);
                    externalModules = { gl: gl_1.default, pngjs: pngjs_1.default, 'jpeg-js': jpeg_js_1.default };
                    plugin = new headless_plugin_context_1.HeadlessPluginContext(externalModules, (0, spec_1.DefaultPluginSpec)(), { width: 800, height: 800 });
                    return [4 /*yield*/, plugin.init()];
                case 1:
                    _a.sent();
                    update = plugin.build();
                    structure = update.toRoot()
                        .apply(data_1.Download, { url: url, isBinary: true })
                        .apply(data_1.ParseCif)
                        .apply(model_1.TrajectoryFromMmCif)
                        .apply(model_1.ModelFromTrajectory)
                        .apply(model_1.StructureFromModel);
                    polymer = structure.apply(model_1.StructureComponent, { type: { name: 'static', params: 'polymer' } });
                    ligand = structure.apply(model_1.StructureComponent, { type: { name: 'static', params: 'ligand' } });
                    polymer.apply(representation_1.StructureRepresentation3D, {
                        type: { name: 'cartoon', params: { alpha: 1 } },
                        colorTheme: { name: 'sequence-id', params: {} },
                    });
                    ligand.apply(representation_1.StructureRepresentation3D, {
                        type: { name: 'ball-and-stick', params: { sizeFactor: 1 } },
                        colorTheme: { name: 'element-symbol', params: { carbonColor: { name: 'element-symbol', params: {} } } },
                        sizeTheme: { name: 'physical', params: {} },
                    });
                    return [4 /*yield*/, update.commit()];
                case 2:
                    _a.sent();
                    // Export images
                    fs_1.default.mkdirSync(args.outDirectory, { recursive: true });
                    return [4 /*yield*/, plugin.saveImage(path_1.default.join(args.outDirectory, 'basic.png'))];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, plugin.saveImage(path_1.default.join(args.outDirectory, 'basic.jpg'))];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, plugin.saveImage(path_1.default.join(args.outDirectory, 'large.png'), { width: 1600, height: 1200 })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, plugin.saveImage(path_1.default.join(args.outDirectory, 'large.jpg'), { width: 1600, height: 1200 })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, plugin.saveImage(path_1.default.join(args.outDirectory, 'stylized.png'), undefined, headless_screenshot_1.STYLIZED_POSTPROCESSING)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, plugin.saveImage(path_1.default.join(args.outDirectory, 'stylized.jpg'), undefined, headless_screenshot_1.STYLIZED_POSTPROCESSING)];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, plugin.saveImage(path_1.default.join(args.outDirectory, 'stylized-compressed-jpg.jpg'), undefined, headless_screenshot_1.STYLIZED_POSTPROCESSING, undefined, 10)];
                case 9:
                    _a.sent();
                    // Export state loadable in Mol* Viewer
                    return [4 /*yield*/, plugin.saveStateSnapshot(path_1.default.join(args.outDirectory, 'molstar-state.molj'))];
                case 10:
                    // Export state loadable in Mol* Viewer
                    _a.sent();
                    // Cleanup
                    return [4 /*yield*/, plugin.clear()];
                case 11:
                    // Cleanup
                    _a.sent();
                    plugin.dispose();
                    return [2 /*return*/];
            }
        });
    });
}
main();
