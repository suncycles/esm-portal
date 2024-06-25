"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 *
 * Adapted from MolQL project
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.transpiler = void 0;
var tslib_1 = require("tslib");
// https://pymol.org/dokuwiki/doku.php?id=selection:alpha
// https://pymolwiki.org/index.php/Selection_Algebra
// https://github.com/evonove/pymol/blob/master/pymol/layer3/Selector.cpp
var P = tslib_1.__importStar(require("../../../mol-util/monadic-parser"));
var h = tslib_1.__importStar(require("../helper"));
var builder_1 = require("../../../mol-script/language/builder");
var B = builder_1.MolScriptBuilder;
var properties_1 = require("./properties");
var operators_1 = require("./operators");
var keywords_1 = require("./keywords");
var propertiesDict = h.getPropertyRules(properties_1.properties);
var slash = P.MonadicParser.string('/');
function orNull(rule) {
    return rule.or(P.MonadicParser.of(null));
}
function atomSelectionQuery(x) {
    var tests = {};
    var props = {};
    for (var k in x) {
        var ps = properties_1.properties[k];
        if (!ps) {
            throw new Error("property '".concat(k, "' not supported, value '").concat(x[k], "'"));
        }
        if (x[k] === null)
            continue;
        if (!props[ps.level])
            props[ps.level] = [];
        props[ps.level].push(x[k]);
    }
    for (var p in props) {
        tests[p] = h.andExpr(props[p]);
    }
    return B.struct.generator.atomGroups(tests);
}
var lang = P.MonadicParser.createLanguage({
    Parens: function (r) {
        return P.MonadicParser.alt(r.Parens, r.Operator, r.Expression).wrap(P.MonadicParser.string('('), P.MonadicParser.string(')'));
    },
    Expression: function (r) {
        return P.MonadicParser.alt(r.Keywords, r.AtomSelectionMacro.map(atomSelectionQuery), r.NamedAtomProperties, r.Pepseq, r.Rep, r.Object);
    },
    AtomSelectionMacro: function (r) {
        return P.MonadicParser.alt(slash.then(P.MonadicParser.alt(P.MonadicParser.seq(orNull(r.ObjectProperty).skip(slash), orNull(propertiesDict.segi).skip(slash), orNull(propertiesDict.chain).skip(slash), orNull(propertiesDict.resi).skip(slash), orNull(propertiesDict.name)).map(function (x) { return { object: x[0], segi: x[1], chain: x[2], resi: x[3], name: x[4] }; }), P.MonadicParser.seq(orNull(r.ObjectProperty).skip(slash), orNull(propertiesDict.segi).skip(slash), orNull(propertiesDict.chain).skip(slash), orNull(propertiesDict.resi)).map(function (x) { return { object: x[0], segi: x[1], chain: x[2], resi: x[3] }; }), P.MonadicParser.seq(orNull(r.ObjectProperty).skip(slash), orNull(propertiesDict.segi).skip(slash), orNull(propertiesDict.chain)).map(function (x) { return { object: x[0], segi: x[1], chain: x[2] }; }), P.MonadicParser.seq(orNull(r.ObjectProperty).skip(slash), orNull(propertiesDict.segi)).map(function (x) { return { object: x[0], segi: x[1] }; }), P.MonadicParser.seq(orNull(r.ObjectProperty)).map(function (x) { return { object: x[0] }; }))), P.MonadicParser.alt(P.MonadicParser.seq(orNull(r.ObjectProperty).skip(slash), orNull(propertiesDict.segi).skip(slash), orNull(propertiesDict.chain).skip(slash), orNull(propertiesDict.resi).skip(slash), orNull(propertiesDict.name)).map(function (x) { return { object: x[0], segi: x[1], chain: x[2], resi: x[3], name: x[4] }; }), P.MonadicParser.seq(orNull(propertiesDict.segi).skip(slash), orNull(propertiesDict.chain).skip(slash), orNull(propertiesDict.resi).skip(slash), orNull(propertiesDict.name)).map(function (x) { return { segi: x[0], chain: x[1], resi: x[2], name: x[3] }; }), P.MonadicParser.seq(orNull(propertiesDict.chain).skip(slash), orNull(propertiesDict.resi).skip(slash), orNull(propertiesDict.name)).map(function (x) { return { chain: x[0], resi: x[1], name: x[2] }; }), P.MonadicParser.seq(orNull(propertiesDict.resi).skip(slash), orNull(propertiesDict.name)).map(function (x) { return { resi: x[0], name: x[1] }; })));
    },
    NamedAtomProperties: function () {
        var _a;
        return (_a = P.MonadicParser).alt.apply(_a, h.getNamedPropertyRules(properties_1.properties));
    },
    Keywords: function () {
        var _a;
        return (_a = P.MonadicParser).alt.apply(_a, h.getKeywordRules(keywords_1.keywords));
    },
    ObjectProperty: function () {
        var w = h.getReservedWords(properties_1.properties, keywords_1.keywords, operators_1.operators)
            .sort(h.strLenSortFn).map(h.escapeRegExp).join('|');
        return P.MonadicParser.regexp(new RegExp("(?!(".concat(w, "))[A-Z0-9_]+"), 'i'));
    },
    Object: function (r) {
        return r.ObjectProperty.notFollowedBy(slash)
            .map(function (x) { throw new Error("property 'object' not supported, value '".concat(x, "'")); });
    },
    // Selects peptide sequence matching upper-case one-letter
    // sequence SEQ (see also FindSeq).
    // PEPSEQ seq
    Pepseq: function () {
        return P.MonadicParser.regexp(/(PEPSEQ|ps\.)\s+([a-z]+)/i, 2)
            .map(h.makeError("operator 'pepseq' not supported"));
    },
    // Selects atoms which show representation rep.
    // REP rep
    Rep: function () {
        return P.MonadicParser.regexp(/REP\s+(lines|spheres|mesh|ribbon|cartoon|sticks|dots|surface|labels|extent|nonbonded|nb_spheres|slice|extent|slice|dashes|angles|dihedrals|cgo|cell|callback|everything)/i, 1)
            .map(h.makeError("operator 'rep' not supported"));
    },
    Operator: function (r) {
        return h.combineOperators(operators_1.operators, P.MonadicParser.alt(r.Parens, r.Expression, r.Operator));
    },
    Query: function (r) {
        return P.MonadicParser.alt(r.Operator, r.Parens, r.Expression).trim(P.MonadicParser.optWhitespace);
    }
});
var transpiler = function (str) { return lang.Query.tryParse(str); };
exports.transpiler = transpiler;
