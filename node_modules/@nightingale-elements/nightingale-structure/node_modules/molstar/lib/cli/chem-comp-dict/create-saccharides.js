#!/usr/bin/env node
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import * as argparse from 'argparse';
import * as path from 'path';
import util from 'util';
import fs from 'fs';
require('util.promisify').shim();
var writeFile = util.promisify(fs.writeFile);
import { DefaultDataOptions, ensureDataAvailable, readCCD } from './util';
function extractSaccharideNames(ccd) {
    var saccharideNames = [];
    for (var k in ccd) {
        var chem_comp = ccd[k].chem_comp;
        var type = chem_comp.type.value(0).toUpperCase();
        if (type.includes('SACCHARIDE')) {
            saccharideNames.push(chem_comp.id.value(0));
        }
    }
    // these are extra saccharides that don't have SACCHARIDE in their type
    saccharideNames.push('UMQ', // UNDECYL-MALTOSIDE, via GlyFinder
    'SQD');
    return saccharideNames;
}
function writeSaccharideNamesFile(filePath, ionNames) {
    var output = "/**\n * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.\n *\n * Code-generated ion names params file. Names extracted from CCD components.\n *\n * @author molstar/cli/chem-comp-dict/create-saccharides\n */\n\nexport const SaccharideNames = new Set(".concat(JSON.stringify(ionNames).replace(/"/g, "'").replace(/,/g, ', '), ");\n");
    writeFile(filePath, output);
}
function run(out, options) {
    if (options === void 0) { options = DefaultDataOptions; }
    return __awaiter(this, void 0, void 0, function () {
        var ccd, saccharideNames;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ensureDataAvailable(options)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, readCCD()];
                case 2:
                    ccd = _a.sent();
                    saccharideNames = extractSaccharideNames(ccd);
                    if (!fs.existsSync(path.dirname(out))) {
                        fs.mkdirSync(path.dirname(out));
                    }
                    writeSaccharideNamesFile(out, saccharideNames);
                    return [2 /*return*/];
            }
        });
    });
}
var parser = new argparse.ArgumentParser({
    add_help: true,
    description: 'Extract and save SaccharideNames from CCD.'
});
parser.add_argument('out', {
    help: 'Generated file output path.'
});
parser.add_argument('--forceDownload', '-f', {
    action: 'store_true',
    help: 'Force download of CCD and PVCD.'
});
parser.add_argument('--ccdUrl', '-c', {
    help: 'Fetch the CCD from a custom URL. This forces download of the CCD.',
    required: false
});
var args = parser.parse_args();
run(args.out, { forceDownload: args.forceDownload, ccdUrl: args.ccdUrl });
