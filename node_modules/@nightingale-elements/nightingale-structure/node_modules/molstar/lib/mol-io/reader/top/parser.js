/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { Task } from '../../../mol-task';
import { Tokenizer, TokenBuilder } from '../common/text/tokenizer';
import { ReaderResult as Result } from '../result';
import { TokenColumnProvider as TokenColumn } from '../common/text/column/token';
import { Column, Table } from '../../../mol-data/db';
// https://manual.gromacs.org/2021-current/reference-manual/file-formats.html#top
var AtomsSchema = {
    nr: Column.Schema.Int(),
    type: Column.Schema.Str(),
    resnr: Column.Schema.Int(),
    residu: Column.Schema.Str(),
    atom: Column.Schema.Str(),
    cgnr: Column.Schema.Int(),
    charge: Column.Schema.Float(),
    mass: Column.Schema.Float(),
};
var BondsSchema = {
    ai: Column.Schema.Int(),
    aj: Column.Schema.Int(),
};
var MoleculesSchema = {
    compound: Column.Schema.Str(),
    molCount: Column.Schema.Int(),
};
var readLine = Tokenizer.readLine, markLine = Tokenizer.markLine, skipWhitespace = Tokenizer.skipWhitespace, markStart = Tokenizer.markStart, eatValue = Tokenizer.eatValue, eatLine = Tokenizer.eatLine;
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
    var nr = TokenBuilder.create(tokenizer.data, 64);
    var type = TokenBuilder.create(tokenizer.data, 64);
    var resnr = TokenBuilder.create(tokenizer.data, 64);
    var residu = TokenBuilder.create(tokenizer.data, 64);
    var atom = TokenBuilder.create(tokenizer.data, 64);
    var cgnr = TokenBuilder.create(tokenizer.data, 64);
    var charge = TokenBuilder.create(tokenizer.data, 64);
    var mass = TokenBuilder.create(tokenizer.data, 64);
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
                    TokenBuilder.add(nr, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 1:
                    TokenBuilder.add(type, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 2:
                    TokenBuilder.add(resnr, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 3:
                    TokenBuilder.add(residu, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 4:
                    TokenBuilder.add(atom, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 5:
                    TokenBuilder.add(cgnr, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 6:
                    TokenBuilder.add(charge, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 7:
                    TokenBuilder.add(mass, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
            }
        }
        // ignore any extra columns
        markLine(tokenizer);
    }
    return Table.ofColumns(AtomsSchema, {
        nr: TokenColumn(nr)(Column.Schema.int),
        type: TokenColumn(type)(Column.Schema.str),
        resnr: TokenColumn(resnr)(Column.Schema.int),
        residu: TokenColumn(residu)(Column.Schema.str),
        atom: TokenColumn(atom)(Column.Schema.str),
        cgnr: TokenColumn(cgnr)(Column.Schema.int),
        charge: TokenColumn(charge)(Column.Schema.float),
        mass: TokenColumn(mass)(Column.Schema.float),
    });
}
function handleBonds(state) {
    var tokenizer = state.tokenizer;
    var ai = TokenBuilder.create(tokenizer.data, 64);
    var aj = TokenBuilder.create(tokenizer.data, 64);
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
                    TokenBuilder.add(ai, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 1:
                    TokenBuilder.add(aj, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
            }
        }
        // ignore any extra columns
        markLine(tokenizer);
    }
    return Table.ofColumns(BondsSchema, {
        ai: TokenColumn(ai)(Column.Schema.int),
        aj: TokenColumn(aj)(Column.Schema.int),
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
    var compound = TokenBuilder.create(tokenizer.data, 64);
    var molCount = TokenBuilder.create(tokenizer.data, 64);
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
                    TokenBuilder.add(compound, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 1:
                    TokenBuilder.add(molCount, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
            }
        }
        // ignore any extra columns
        eatLine(tokenizer);
        markStart(tokenizer);
    }
    return Table.ofColumns(MoleculesSchema, {
        compound: TokenColumn(compound)(Column.Schema.str),
        molCount: TokenColumn(molCount)(Column.Schema.int),
    });
}
function parseInternal(data, ctx) {
    return __awaiter(this, void 0, void 0, function () {
        function addMol() {
            if (currentMolName && currentCompound.atoms) {
                result.compounds[currentMolName] = currentCompound;
                currentCompound = {};
                currentMolName = '';
            }
        }
        var t, state, result, prevPosition, currentCompound, currentMolName, line, fieldMatch, fieldName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    t = Tokenizer(data);
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
                case 4: return [2 /*return*/, Result.success(result)];
            }
        });
    });
}
export function parseTop(data) {
    var _this = this;
    return Task.create('Parse TOP', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, parseInternal(data, ctx)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); });
}
