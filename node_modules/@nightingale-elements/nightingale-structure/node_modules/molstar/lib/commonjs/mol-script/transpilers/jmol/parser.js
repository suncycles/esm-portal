"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Koya Sakuma < koya.sakuma.work@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * Adapted from MolQL project
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.transpiler = void 0;
var tslib_1 = require("tslib");
var P = tslib_1.__importStar(require("../../../mol-util/monadic-parser"));
var h = tslib_1.__importStar(require("../helper"));
var builder_1 = require("../../../mol-script/language/builder");
var B = builder_1.MolScriptBuilder;
var properties_1 = require("./properties");
var operators_1 = require("./operators");
var keywords_1 = require("./keywords");
// <, <=, =, >=, >, !=, and LIKE
var valueOperators = [
    {
        '@desc': 'value comparisons',
        '@examples': [],
        name: '=',
        abbr: ['=='],
        type: h.binaryLeft,
        rule: P.MonadicParser.regexp(/\s*(LIKE|>=|<=|=|!=|>|<)\s*/i, 1),
        map: function (op, e1, e2) {
            var expr;
            if (e1 === 'structure') {
                expr = B.core.flags.hasAny([B.ammp('secondaryStructureFlags'), (0, properties_1.structureMap)(e2)]);
            }
            else if (e2 === 'structure') {
                expr = B.core.flags.hasAny([B.ammp('secondaryStructureFlags'), (0, properties_1.structureMap)(e1)]);
            }
            else if (e1.head !== undefined) {
                if (e1.head.name === 'core.type.regex') {
                    expr = B.core.str.match([e1, B.core.type.str([e2])]);
                }
            }
            else if (e2.head !== undefined) {
                if (e2.head.name === 'core.type.regex') {
                    expr = B.core.str.match([e2, B.core.type.str([e1])]);
                }
            }
            else if (op.toUpperCase() === 'LIKE') {
                if (e1.head) {
                    expr = B.core.str.match([
                        B.core.type.regex(["^".concat(e2, "$"), 'i']),
                        B.core.type.str([e1])
                    ]);
                }
                else {
                    expr = B.core.str.match([
                        B.core.type.regex(["^".concat(e1, "$"), 'i']),
                        B.core.type.str([e2])
                    ]);
                }
            }
            if (!expr) {
                if (e1.head)
                    e2 = h.wrapValue(e1, e2);
                if (e2.head)
                    e1 = h.wrapValue(e2, e1);
                switch (op) {
                    case '=':
                        expr = B.core.rel.eq([e1, e2]);
                        break;
                    case '!=':
                        expr = B.core.rel.neq([e1, e2]);
                        break;
                    case '>':
                        expr = B.core.rel.gr([e1, e2]);
                        break;
                    case '<':
                        expr = B.core.rel.lt([e1, e2]);
                        break;
                    case '>=':
                        expr = B.core.rel.gre([e1, e2]);
                        break;
                    case '<=':
                        expr = B.core.rel.lte([e1, e2]);
                        break;
                    default: throw new Error("value operator '".concat(op, "' not supported"));
                }
            }
            return B.struct.generator.atomGroups({ 'atom-test': expr });
        }
    }
];
function atomExpressionQuery(x) {
    var _a = x[1], resname = _a[0], resnoRange = _a[1], resno = _a[2], inscode = _a[3], chainname = _a[4], atomname = _a[5], altloc = _a[6];
    var tests = {};
    if (chainname) {
        // TODO: should be configurable, there is an option in Jmol to use auth or label
        tests['chain-test'] = B.core.rel.eq([B.ammp('auth_asym_id'), chainname]);
    }
    var resProps = [];
    if (resname)
        resProps.push(B.core.rel.eq([B.ammp('label_comp_id'), resname]));
    if (resnoRange)
        resProps.push(B.core.logic.and([
            B.core.rel.gre([B.ammp('auth_seq_id'), resnoRange[0]]),
            B.core.rel.lte([B.ammp('auth_seq_id'), resnoRange[1]])
        ]));
    if (resno)
        resProps.push(B.core.rel.eq([B.ammp('auth_seq_id'), resno]));
    if (inscode)
        resProps.push(B.core.rel.eq([B.ammp('pdbx_PDB_ins_code'), inscode]));
    if (resProps.length)
        tests['residue-test'] = h.andExpr(resProps);
    var atomProps = [];
    if (atomname)
        atomProps.push(B.core.rel.eq([B.ammp('auth_atom_id'), atomname]));
    if (altloc)
        atomProps.push(B.core.rel.eq([B.ammp('label_alt_id'), altloc]));
    if (atomProps.length)
        tests['atom-test'] = h.andExpr(atomProps);
    return B.struct.generator.atomGroups(tests);
}
var lang = P.MonadicParser.createLanguage({
    Integer: function () { return P.MonadicParser.regexp(/-?[0-9]+/).map(Number).desc('integer'); },
    Parens: function (r) {
        return P.MonadicParser.alt(r.Parens, r.Operator, r.Expression).wrap(P.MonadicParser.regexp(/\(\s*/), P.MonadicParser.regexp(/\s*\)/));
    },
    Expression: function (r) {
        return P.MonadicParser.alt(r.Keywords, r.AtomExpression.map(atomExpressionQuery), r.Within.map(function (x) { return B.struct.modifier.includeSurroundings({ 0: x[1], radius: x[0] }); }), r.ValueQuery, r.Element.map(function (x) { return B.struct.generator.atomGroups({
            'atom-test': B.core.rel.eq([B.acp('elementSymbol'), B.struct.type.elementSymbol(x)])
        }); }), r.Resname.map(function (x) { return B.struct.generator.atomGroups({
            'residue-test': B.core.rel.eq([B.ammp('label_comp_id'), x])
        }); }));
    },
    Operator: function (r) {
        return h.combineOperators(operators_1.operators, P.MonadicParser.alt(r.Parens, r.Expression));
    },
    AtomExpression: function (r) {
        return P.MonadicParser.seq(P.MonadicParser.lookahead(r.AtomPrefix), P.MonadicParser.seq(r.BracketedResname.or(P.MonadicParser.of(null)), r.ResnoRange.or(P.MonadicParser.of(null)), r.Resno.or(P.MonadicParser.of(null)), r.Inscode.or(P.MonadicParser.of(null)), r.Chainname.or(P.MonadicParser.of(null)), r.Atomname.or(P.MonadicParser.of(null)), r.Altloc.or(P.MonadicParser.of(null)), r.Model.or(P.MonadicParser.of(null)))).desc('expression');
    },
    AtomPrefix: function () { return P.MonadicParser.regexp(/[\[0-9:^%/.-]/).desc('atom-prefix'); },
    Chainname: function () { return P.MonadicParser.regexp(/:([A-Za-z]{1,3})/, 1).desc('chainname'); },
    Model: function () { return P.MonadicParser.regexp(/\/([0-9]+)/, 1).map(Number).desc('model'); },
    Element: function () { return P.MonadicParser.regexp(/_([A-Za-z]{1,3})/, 1).desc('element'); },
    Atomname: function () { return P.MonadicParser.regexp(/\.([a-zA-Z0-9]{1,4})/, 1).map(B.atomName).desc('atomname'); },
    Resname: function () { return P.MonadicParser.regexp(/[a-zA-Z0-9]{1,4}/).desc('resname'); },
    Resno: function (r) { return r.Integer.desc('resno'); },
    Altloc: function () { return P.MonadicParser.regexp(/%([a-zA-Z0-9])/, 1).desc('altloc'); },
    Inscode: function () { return P.MonadicParser.regexp(/\^([a-zA-Z0-9])/, 1).desc('inscode'); },
    BracketedResname: function () { return P.MonadicParser.regexp(/\[([a-zA-Z0-9]{1,4})\]/, 1).desc('bracketed-resname'); },
    ResnoRange: function (r) {
        return P.MonadicParser.seq(r.Integer.skip(P.MonadicParser.seq(P.MonadicParser.optWhitespace, P.MonadicParser.string('-'), P.MonadicParser.optWhitespace)), r.Integer).desc('resno-range');
    },
    Within: function (r) {
        return P.MonadicParser.regexp(/within/i)
            .skip(P.MonadicParser.regexp(/\s*\(\s*/))
            .then(P.MonadicParser.seq(r.Integer.skip(P.MonadicParser.regexp(/\s*,\s*/)), r.Query))
            .skip(P.MonadicParser.regexp(/\)/));
    },
    Keywords: function () {
        var _a;
        return (_a = P.MonadicParser).alt.apply(_a, h.getKeywordRules(keywords_1.keywords)).desc('keyword');
    },
    Query: function (r) {
        return P.MonadicParser.alt(r.Operator, r.Parens, r.Expression).trim(P.MonadicParser.optWhitespace);
    },
    Number: function () {
        return P.MonadicParser.regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/)
            .map(Number)
            .desc('number');
    },
    String: function () {
        var w = h.getReservedWords(properties_1.properties, keywords_1.keywords, operators_1.operators)
            .sort(h.strLenSortFn).map(h.escapeRegExp).join('|');
        return P.MonadicParser.alt(P.MonadicParser.regexp(new RegExp("(?!(".concat(w, "))[A-Z0-9_]+"), 'i')), P.MonadicParser.regexp(/'((?:[^"\\]|\\.)*)'/, 1), P.MonadicParser.regexp(/"((?:[^"\\]|\\.)*)"/, 1).map(function (x) { return B.core.type.regex(["^".concat(x, "$"), 'i']); })).desc('string');
    },
    Value: function (r) {
        return P.MonadicParser.alt(r.Number, r.String);
    },
    ValueParens: function (r) {
        return P.MonadicParser.alt(r.ValueParens, r.ValueOperator, r.ValueExpressions).wrap(P.MonadicParser.string('('), P.MonadicParser.string(')'));
    },
    ValuePropertyNames: function () {
        var _a;
        return (_a = P.MonadicParser).alt.apply(_a, h.getPropertyNameRules(properties_1.properties, /LIKE|>=|<=|=|!=|>|<|\)|\s/i));
    },
    ValueOperator: function (r) {
        return h.combineOperators(valueOperators, P.MonadicParser.alt(r.ValueParens, r.ValueExpressions));
    },
    ValueExpressions: function (r) {
        return P.MonadicParser.alt(r.Value, r.ValuePropertyNames);
    },
    ValueQuery: function (r) {
        return P.MonadicParser.alt(r.ValueOperator.map(function (x) {
            if (x.head) {
                if (x.head.name.startsWith('structure-query.generator'))
                    return x;
            }
            else {
                if (typeof x === 'string' && x.length <= 4) {
                    return B.struct.generator.atomGroups({
                        'residue-test': B.core.rel.eq([B.ammp('label_comp_id'), x])
                    });
                }
            }
            throw new Error("values must be part of an comparison, value '".concat(x, "'"));
        }));
    }
});
var transpiler = function (str) { return lang.Query.tryParse(str); };
exports.transpiler = transpiler;
