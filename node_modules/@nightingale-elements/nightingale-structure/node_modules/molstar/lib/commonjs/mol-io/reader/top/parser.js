"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTop = void 0;
var tslib_1 = require("tslib");
var mol_task_1 = require("../../../mol-task");
var tokenizer_1 = require("../common/text/tokenizer");
var result_1 = require("../result");
var token_1 = require("../common/text/column/token");
var db_1 = require("../../../mol-data/db");
// https://manual.gromacs.org/2021-current/reference-manual/file-formats.html#top
var AtomsSchema = {
    nr: db_1.Column.Schema.Int(),
    type: db_1.Column.Schema.Str(),
    resnr: db_1.Column.Schema.Int(),
    residu: db_1.Column.Schema.Str(),
    atom: db_1.Column.Schema.Str(),
    cgnr: db_1.Column.Schema.Int(),
    charge: db_1.Column.Schema.Float(),
    mass: db_1.Column.Schema.Float(),
};
var BondsSchema = {
    ai: db_1.Column.Schema.Int(),
    aj: db_1.Column.Schema.Int(),
};
var MoleculesSchema = {
    compound: db_1.Column.Schema.Str(),
    molCount: db_1.Column.Schema.Int(),
};
var readLine = tokenizer_1.Tokenizer.readLine, markLine = tokenizer_1.Tokenizer.markLine, skipWhitespace = tokenizer_1.Tokenizer.skipWhitespace, markStart = tokenizer_1.Tokenizer.markStart, eatValue = tokenizer_1.Tokenizer.eatValue, eatLine = tokenizer_1.Tokenizer.eatLine;
function State(tokenizer, runtimeCtx) {
    return {
        tokenizer: tokenizer,
        runtimeCtx: runtimeCtx,
    };
}
var reField = /\[ (.+) \]/;
var reWhitespace = /\s+/;
function handleMoleculetype(state) {
    var tokenizer = state.tokenizer;
    var molName = undefined;
    while (tokenizer.tokenEnd < tokenizer.length) {
        skipWhitespace(tokenizer);
        var c = tokenizer.data[tokenizer.position];
        if (c === '[')
            break;
        if (c === ';' || c === '*') {
            markLine(tokenizer);
            continue;
        }
        if (molName !== undefined)
            throw new Error('more than one molName');
        var line = readLine(tokenizer);
        molName = line.split(reWhitespace)[0];
    }
    if (molName === undefined)
        throw new Error('missing molName');
    return molName;
}
function handleAtoms(state) {
    var tokenizer = state.tokenizer;
    var nr = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    var type = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    var resnr = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    var residu = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    var atom = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    var cgnr = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    var charge = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    var mass = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    while (tokenizer.tokenEnd < tokenizer.length) {
        skipWhitespace(tokenizer);
        var c = tokenizer.data[tokenizer.position];
        if (c === '[')
            break;
        if (c === ';' || c === '*') {
            markLine(tokenizer);
            continue;
        }
        for (var j = 0; j < 8; ++j) {
            skipWhitespace(tokenizer);
            markStart(tokenizer);
            eatValue(tokenizer);
            switch (j) {
                case 0:
                    tokenizer_1.TokenBuilder.add(nr, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 1:
                    tokenizer_1.TokenBuilder.add(type, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 2:
                    tokenizer_1.TokenBuilder.add(resnr, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 3:
                    tokenizer_1.TokenBuilder.add(residu, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 4:
                    tokenizer_1.TokenBuilder.add(atom, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 5:
                    tokenizer_1.TokenBuilder.add(cgnr, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 6:
                    tokenizer_1.TokenBuilder.add(charge, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 7:
                    tokenizer_1.TokenBuilder.add(mass, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
            }
        }
        // ignore any extra columns
        markLine(tokenizer);
    }
    return db_1.Table.ofColumns(AtomsSchema, {
        nr: (0, token_1.TokenColumnProvider)(nr)(db_1.Column.Schema.int),
        type: (0, token_1.TokenColumnProvider)(type)(db_1.Column.Schema.str),
        resnr: (0, token_1.TokenColumnProvider)(resnr)(db_1.Column.Schema.int),
        residu: (0, token_1.TokenColumnProvider)(residu)(db_1.Column.Schema.str),
        atom: (0, token_1.TokenColumnProvider)(atom)(db_1.Column.Schema.str),
        cgnr: (0, token_1.TokenColumnProvider)(cgnr)(db_1.Column.Schema.int),
        charge: (0, token_1.TokenColumnProvider)(charge)(db_1.Column.Schema.float),
        mass: (0, token_1.TokenColumnProvider)(mass)(db_1.Column.Schema.float),
    });
}
function handleBonds(state) {
    var tokenizer = state.tokenizer;
    var ai = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    var aj = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    while (tokenizer.tokenEnd < tokenizer.length) {
        skipWhitespace(tokenizer);
        var c = tokenizer.data[tokenizer.position];
        if (c === '[')
            break;
        if (c === ';' || c === '*') {
            markLine(tokenizer);
            continue;
        }
        for (var j = 0; j < 2; ++j) {
            skipWhitespace(tokenizer);
            markStart(tokenizer);
            eatValue(tokenizer);
            switch (j) {
                case 0:
                    tokenizer_1.TokenBuilder.add(ai, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 1:
                    tokenizer_1.TokenBuilder.add(aj, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
            }
        }
        // ignore any extra columns
        markLine(tokenizer);
    }
    return db_1.Table.ofColumns(BondsSchema, {
        ai: (0, token_1.TokenColumnProvider)(ai)(db_1.Column.Schema.int),
        aj: (0, token_1.TokenColumnProvider)(aj)(db_1.Column.Schema.int),
    });
}
function handleSystem(state) {
    var tokenizer = state.tokenizer;
    var system = undefined;
    while (tokenizer.tokenEnd < tokenizer.length) {
        skipWhitespace(tokenizer);
        var c = tokenizer.data[tokenizer.position];
        if (c === '[')
            break;
        if (c === ';' || c === '*') {
            markLine(tokenizer);
            continue;
        }
        if (system !== undefined)
            throw new Error('more than one system');
        system = readLine(tokenizer).trim();
    }
    if (system === undefined)
        throw new Error('missing system');
    return system;
}
function handleMolecules(state) {
    var tokenizer = state.tokenizer;
    var compound = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    var molCount = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    while (tokenizer.tokenEnd < tokenizer.length) {
        skipWhitespace(tokenizer);
        if (tokenizer.position >= tokenizer.length)
            break;
        var c = tokenizer.data[tokenizer.position];
        if (c === '[')
            break;
        if (c === ';' || c === '*') {
            markLine(tokenizer);
            continue;
        }
        for (var j = 0; j < 2; ++j) {
            skipWhitespace(tokenizer);
            markStart(tokenizer);
            eatValue(tokenizer);
            switch (j) {
                case 0:
                    tokenizer_1.TokenBuilder.add(compound, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 1:
                    tokenizer_1.TokenBuilder.add(molCount, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
            }
        }
        // ignore any extra columns
        eatLine(tokenizer);
        markStart(tokenizer);
    }
    return db_1.Table.ofColumns(MoleculesSchema, {
        compound: (0, token_1.TokenColumnProvider)(compound)(db_1.Column.Schema.str),
        molCount: (0, token_1.TokenColumnProvider)(molCount)(db_1.Column.Schema.int),
    });
}
function parseInternal(data, ctx) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        function addMol() {
            if (currentMolName && currentCompound.atoms) {
                result.compounds[currentMolName] = currentCompound;
                currentCompound = {};
                currentMolName = '';
            }
        }
        var t, state, result, prevPosition, currentCompound, currentMolName, line, fieldMatch, fieldName;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    t = (0, tokenizer_1.Tokenizer)(data);
                    state = State(t, ctx);
                    result = Object.create(null);
                    prevPosition = 0;
                    result.compounds = {};
                    currentCompound = {};
                    currentMolName = '';
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
                    if (!line || line[0] === '*' || line[0] === ';') {
                        return [3 /*break*/, 1];
                    }
                    if (line.startsWith('#include')) {
                        throw new Error('#include statements not allowed');
                    }
                    if (line.startsWith('[')) {
                        fieldMatch = line.match(reField);
                        if (fieldMatch === null)
                            throw new Error('expected field name');
                        fieldName = fieldMatch[1];
                        if (fieldName === 'moleculetype') {
                            addMol();
                            currentMolName = handleMoleculetype(state);
                        }
                        else if (fieldName === 'atoms') {
                            currentCompound.atoms = handleAtoms(state);
                        }
                        else if (fieldName === 'bonds') {
                            currentCompound.bonds = handleBonds(state);
                        }
                        else if (fieldName === 'system') {
                            result.system = handleSystem(state);
                        }
                        else if (fieldName === 'molecules') {
                            addMol(); // add the last compound
                            result.molecules = handleMolecules(state);
                        }
                        else {
                            while (t.tokenEnd < t.length) {
                                if (t.data[t.position] === '[')
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
function parseTop(data) {
    var _this = this;
    return mol_task_1.Task.create('Parse TOP', function (ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, parseInternal(data, ctx)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); });
}
exports.parseTop = parseTop;
