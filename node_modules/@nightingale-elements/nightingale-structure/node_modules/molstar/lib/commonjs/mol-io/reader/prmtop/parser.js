"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePrmtop = void 0;
var tslib_1 = require("tslib");
var mol_task_1 = require("../../../mol-task");
var tokenizer_1 = require("../common/text/tokenizer");
var result_1 = require("../result");
var token_1 = require("../common/text/column/token");
var db_1 = require("../../../mol-data/db");
// http://ambermd.org/prmtop.pdf
// https://ambermd.org/FileFormats.php#topology
var Pointers = {
    'NATOM': '', 'NTYPES': '', 'NBONH': '', 'MBONA': '', 'NTHETH': '', 'MTHETA': '',
    'NPHIH': '', 'MPHIA': '', 'NHPARM': '', 'NPARM': '', 'NNB': '', 'NRES': '',
    'NBONA': '', 'NTHETA': '', 'NPHIA': '', 'NUMBND': '', 'NUMANG': '', 'NPTRA': '',
    'NATYP': '', 'NPHB': '', 'IFPERT': '', 'NBPER': '', 'NGPER': '', 'NDPER': '',
    'MBPER': '', 'MGPER': '', 'MDPER': '', 'IFBOX': '', 'NMXRS': '', 'IFCAP': '',
    'NUMEXTRA': '', 'NCOPY': '',
};
var PointersNames = Object.keys(Pointers);
var readLine = tokenizer_1.Tokenizer.readLine, markLine = tokenizer_1.Tokenizer.markLine, trim = tokenizer_1.Tokenizer.trim;
function State(tokenizer, runtimeCtx) {
    return {
        tokenizer: tokenizer,
        runtimeCtx: runtimeCtx,
    };
}
function handleTitle(state) {
    var tokenizer = state.tokenizer;
    var title = [];
    while (tokenizer.tokenEnd < tokenizer.length) {
        if (tokenizer.data[tokenizer.position] === '%')
            break;
        var line = readLine(tokenizer).trim();
        if (line)
            title.push(line);
    }
    return title;
}
function handlePointers(state) {
    var tokenizer = state.tokenizer;
    var pointers = Object.create(null);
    PointersNames.forEach(function (name) { pointers[name] = 0; });
    var curIdx = 0;
    while (tokenizer.tokenEnd < tokenizer.length) {
        if (tokenizer.data[tokenizer.position] === '%')
            break;
        var line = readLine(tokenizer);
        var n = Math.min(curIdx + 10, 32);
        for (var i = 0; curIdx < n; ++i, ++curIdx) {
            pointers[PointersNames[curIdx]] = parseInt(line.substring(i * 8, i * 8 + 8).trim());
        }
    }
    return pointers;
}
function handleTokens(state, count, countPerLine, itemSize) {
    var tokenizer = state.tokenizer;
    var tokens = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    var curIdx = 0;
    while (tokenizer.tokenEnd < tokenizer.length) {
        if (tokenizer.data[tokenizer.position] === '%')
            break;
        tokenizer.tokenStart = tokenizer.position;
        var n = Math.min(curIdx + countPerLine, count);
        for (var i = 0; curIdx < n; ++i, ++curIdx) {
            var p = tokenizer.position;
            trim(tokenizer, tokenizer.position, tokenizer.position + itemSize);
            tokenizer_1.TokenBuilder.addUnchecked(tokens, tokenizer.tokenStart, tokenizer.tokenEnd);
            tokenizer.position = p + itemSize;
        }
        markLine(tokenizer);
    }
    return tokens;
}
function parseInternal(data, ctx) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var t, state, result, prevPosition, line, flag, formatLine, tokens, tokens, tokens, tokens, tokens, tokens, tokens, tokens;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    t = (0, tokenizer_1.Tokenizer)(data);
                    state = State(t, ctx);
                    result = Object.create(null);
                    prevPosition = 0;
                    _a.label = 1;
                case 1:
                    if (!(t.tokenEnd < t.length)) return [3 /*break*/, 4];
                    if (!(t.position - prevPosition > 100000 && ctx.shouldUpdate)) return [3 /*break*/, 3];
                    prevPosition = t.position;
                    return [4 /*yield*/, ctx.update({ current: t.position, max: t.length })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    line = readLine(state.tokenizer).trim();
                    if (line.startsWith('%VERSION')) {
                        result.version = line.substring(8).trim();
                    }
                    else if (line.startsWith('%FLAG')) {
                        flag = line.substring(5).trim();
                        formatLine = readLine(state.tokenizer).trim();
                        if (!formatLine.startsWith('%FORMAT'))
                            throw new Error('expected %FORMAT');
                        if (flag === 'TITLE') {
                            result.title = handleTitle(state);
                        }
                        else if (flag === 'POINTERS') {
                            result.pointers = handlePointers(state);
                        }
                        else if (flag === 'ATOM_NAME') {
                            tokens = handleTokens(state, result.pointers['NATOM'], 20, 4);
                            result.atomName = (0, token_1.TokenColumnProvider)(tokens)(db_1.Column.Schema.str);
                        }
                        else if (flag === 'CHARGE') {
                            tokens = handleTokens(state, result.pointers['NATOM'], 5, 16);
                            result.charge = (0, token_1.TokenColumnProvider)(tokens)(db_1.Column.Schema.float);
                        }
                        else if (flag === 'MASS') {
                            tokens = handleTokens(state, result.pointers['NATOM'], 5, 16);
                            result.mass = (0, token_1.TokenColumnProvider)(tokens)(db_1.Column.Schema.float);
                        }
                        else if (flag === 'RESIDUE_LABEL') {
                            tokens = handleTokens(state, result.pointers['NRES'], 20, 4);
                            result.residueLabel = (0, token_1.TokenColumnProvider)(tokens)(db_1.Column.Schema.str);
                        }
                        else if (flag === 'RESIDUE_POINTER') {
                            tokens = handleTokens(state, result.pointers['NRES'], 10, 8);
                            result.residuePointer = (0, token_1.TokenColumnProvider)(tokens)(db_1.Column.Schema.int);
                        }
                        else if (flag === 'BONDS_INC_HYDROGEN') {
                            tokens = handleTokens(state, result.pointers['NBONH'] * 3, 10, 8);
                            result.bondsIncHydrogen = (0, token_1.TokenColumnProvider)(tokens)(db_1.Column.Schema.int);
                        }
                        else if (flag === 'BONDS_WITHOUT_HYDROGEN') {
                            tokens = handleTokens(state, result.pointers['NBONA'] * 3, 10, 8);
                            result.bondsWithoutHydrogen = (0, token_1.TokenColumnProvider)(tokens)(db_1.Column.Schema.int);
                        }
                        else if (flag === 'RADII') {
                            tokens = handleTokens(state, result.pointers['NATOM'], 5, 16);
                            result.radii = (0, token_1.TokenColumnProvider)(tokens)(db_1.Column.Schema.float);
                        }
                        else {
                            while (t.tokenEnd < t.length) {
                                if (t.data[t.position] === '%')
                                    break;
                                markLine(t);
                            }
                        }
                    }
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, result_1.ReaderResult.success(result)];
            }
        });
    });
}
function parsePrmtop(data) {
    var _this = this;
    return mol_task_1.Task.create('Parse PRMTOP', function (ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, parseInternal(data, ctx)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); });
}
exports.parsePrmtop = parsePrmtop;
