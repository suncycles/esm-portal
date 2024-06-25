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
import { __assign, __awaiter, __generator } from "tslib";
import { ArgumentParser } from 'argparse';
import fs from 'fs';
import path from 'path';
import gl from 'gl';
import pngjs from 'pngjs';
import jpegjs from 'jpeg-js';
import { Download, ParseCif } from '../../mol-plugin-state/transforms/data';
import { ModelFromTrajectory, StructureComponent, StructureFromModel, TrajectoryFromMmCif } from '../../mol-plugin-state/transforms/model';
import { StructureRepresentation3D } from '../../mol-plugin-state/transforms/representation';
import { HeadlessPluginContext } from '../../mol-plugin/headless-plugin-context';
import { DefaultPluginSpec } from '../../mol-plugin/spec';
import { STYLIZED_POSTPROCESSING } from '../../mol-plugin/util/headless-screenshot';
import { setFSModule } from '../../mol-util/data-source';
setFSModule(fs);
function parseArguments() {
    var parser = new ArgumentParser({ description: 'Example command-line application generating images of PDB structures' });
    parser.add_argument('pdbId', { help: 'PDB identifier' });
    parser.add_argument('outDirectory', { help: 'Directory for outputs' });
    var args = parser.parse_args();
    return __assign({}, args);
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var args, url, externalModules, plugin, update, structure, polymer, ligand;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = parseArguments();
                    url = "https://www.ebi.ac.uk/pdbe/entry-files/download/".concat(args.pdbId, ".bcif");
                    console.log('PDB ID:', args.pdbId);
                    console.log('Source URL:', url);
                    console.log('Outputs:', args.outDirectory);
                    externalModules = { gl: gl, pngjs: pngjs, 'jpeg-js': jpegjs };
                    plugin = new HeadlessPluginContext(externalModules, DefaultPluginSpec(), { width: 800, height: 800 });
                    return [4 /*yield*/, plugin.init()];
                case 1:
                    _a.sent();
                    update = plugin.build();
                    structure = update.toRoot()
                        .apply(Download, { url: url, isBinary: true })
                        .apply(ParseCif)
                        .apply(TrajectoryFromMmCif)
                        .apply(ModelFromTrajectory)
                        .apply(StructureFromModel);
                    polymer = structure.apply(StructureComponent, { type: { name: 'static', params: 'polymer' } });
                    ligand = structure.apply(StructureComponent, { type: { name: 'static', params: 'ligand' } });
                    polymer.apply(StructureRepresentation3D, {
                        type: { name: 'cartoon', params: { alpha: 1 } },
                        colorTheme: { name: 'sequence-id', params: {} },
                    });
                    ligand.apply(StructureRepresentation3D, {
                        type: { name: 'ball-and-stick', params: { sizeFactor: 1 } },
                        colorTheme: { name: 'element-symbol', params: { carbonColor: { name: 'element-symbol', params: {} } } },
                        sizeTheme: { name: 'physical', params: {} },
                    });
                    return [4 /*yield*/, update.commit()];
                case 2:
                    _a.sent();
                    // Export images
                    fs.mkdirSync(args.outDirectory, { recursive: true });
                    return [4 /*yield*/, plugin.saveImage(path.join(args.outDirectory, 'basic.png'))];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, plugin.saveImage(path.join(args.outDirectory, 'basic.jpg'))];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, plugin.saveImage(path.join(args.outDirectory, 'large.png'), { width: 1600, height: 1200 })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, plugin.saveImage(path.join(args.outDirectory, 'large.jpg'), { width: 1600, height: 1200 })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, plugin.saveImage(path.join(args.outDirectory, 'stylized.png'), undefined, STYLIZED_POSTPROCESSING)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, plugin.saveImage(path.join(args.outDirectory, 'stylized.jpg'), undefined, STYLIZED_POSTPROCESSING)];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, plugin.saveImage(path.join(args.outDirectory, 'stylized-compressed-jpg.jpg'), undefined, STYLIZED_POSTPROCESSING, undefined, 10)];
                case 9:
                    _a.sent();
                    // Export state loadable in Mol* Viewer
                    return [4 /*yield*/, plugin.saveStateSnapshot(path.join(args.outDirectory, 'molstar-state.molj'))];
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
