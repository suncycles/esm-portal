"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 * @author Koya Sakuma <koya.sakuma.work@gmail.com>
 *
 * Adapted from MolQL project
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resnameExpr = exports.valuesTest = exports.testLevel = exports.wrapValue = exports.asAtoms = exports.atomNameSet = exports.getReservedWords = exports.getPropertyNameRules = exports.getFunctionRules = exports.getKeywordRules = exports.getNamedPropertyRules = exports.getPropertyRules = exports.strLenSortFn = exports.invertExpr = exports.testExpr = exports.orExpr = exports.andExpr = exports.makeError = exports.ofOp = exports.postfixOp = exports.prefixOp = exports.infixOp = exports.combineOperators = exports.binaryLeft = exports.binaryRight = exports.postfix = exports.prefix = exports.escapeRegExp = void 0;
var tslib_1 = require("tslib");
var P = tslib_1.__importStar(require("../../mol-util/monadic-parser"));
var builder_1 = require("../../mol-script/language/builder");
var B = builder_1.MolScriptBuilder;
var string_1 = require("../../mol-util/string");
Object.defineProperty(exports, "escapeRegExp", { enumerable: true, get: function () { return string_1.escapeRegExp; } });
// Takes a parser for the prefix operator, and a parser for the base thing being
// parsed, and parses as many occurrences as possible of the prefix operator.
// Note that the parser is created using `P.lazy` because it's recursive. It's
// valid for there to be zero occurrences of the prefix operator.
function prefix(opParser, nextParser, mapFn) {
    var parser = P.MonadicParser.lazy(function () {
        return P.MonadicParser.seq(opParser, parser)
            .map(function (x) { return mapFn.apply(void 0, x); })
            .or(nextParser);
    });
    return parser;
}
exports.prefix = prefix;
// Ideally this function would be just like `PREFIX` but reordered like
// `P.seq(parser, opParser).or(nextParser)`, but that doesn't work. The
// reason for that is that Parsimmon will get stuck in infinite recursion, since
// the very first rule. Inside `parser` is to match parser again. Alternatively,
// you might think to try `nextParser.or(P.seq(parser, opParser))`, but
// that won't work either because in a call to `.or` (aka `P.alt`), Parsimmon
// takes the first possible match, even if subsequent matches are longer, so the
// parser will never actually look far enough ahead to see the postfix
// operators.
function postfix(opParser, nextParser, mapFn) {
    // Because we can't use recursion like stated above, we just match a flat list
    // of as many occurrences of the postfix operator as possible, then use
    // `.reduce` to manually nest the list.
    //
    // Example:
    //
    // INPUT  :: "4!!!"
    // PARSE  :: [4, "factorial", "factorial", "factorial"]
    // REDUCE :: ["factorial", ["factorial", ["factorial", 4]]]
    return P.MonadicParser.seqMap(nextParser, opParser.many(), function (x, suffixes) {
        return suffixes.reduce(function (acc, x) {
            return mapFn(x, acc);
        }, x);
    });
}
exports.postfix = postfix;
// Takes a parser for all the operators at this precedence level, and a parser
// that parsers everything at the next precedence level, and returns a parser
// that parses as many binary operations as possible, associating them to the
// right. (e.g. 1^2^3 is 1^(2^3) not (1^2)^3)
function binaryRight(opParser, nextParser, mapFn) {
    var parser = P.MonadicParser.lazy(function () {
        return nextParser.chain(function (next) {
            return P.MonadicParser.seq(opParser, P.MonadicParser.of(next), parser).map(function (x) {
                return x;
            }).or(P.MonadicParser.of(next));
        });
    });
    return parser;
}
exports.binaryRight = binaryRight;
// Takes a parser for all the operators at this precedence level, and a parser
// that parsers everything at the next precedence level, and returns a parser
// that parses as many binary operations as possible, associating them to the
// left. (e.g. 1-2-3 is (1-2)-3 not 1-(2-3))
function binaryLeft(opParser, nextParser, mapFn) {
    // We run into a similar problem as with the `POSTFIX` parser above where we
    // can't recurse in the direction we want, so we have to resort to parsing an
    // entire list of operator chunks and then using `.reduce` to manually nest
    // them again.
    //
    // Example:
    //
    // INPUT  :: "1+2+3"
    // PARSE  :: [1, ["+", 2], ["+", 3]]
    // REDUCE :: ["+", ["+", 1, 2], 3]
    return P.MonadicParser.seqMap(nextParser, P.MonadicParser.seq(opParser, nextParser).many(), function (first, rest) {
        return rest.reduce(function (acc, ch) {
            var op = ch[0], another = ch[1];
            return mapFn(op, acc, another);
        }, first);
    });
}
exports.binaryLeft = binaryLeft;
/**
 * combine operators of decreasing binding strength
 */
function combineOperators(opList, rule) {
    var x = opList.reduce(function (acc, level) {
        var map = level.isUnsupported ? makeError("operator '".concat(level.name, "' not supported")) : level.map;
        return level.type(level.rule, acc, map);
    }, rule);
    return x;
}
exports.combineOperators = combineOperators;
function infixOp(re, group) {
    if (group === void 0) { group = 0; }
    return P.MonadicParser.optWhitespace.then(P.MonadicParser.regexp(re, group).skip(P.MonadicParser.optWhitespace));
}
exports.infixOp = infixOp;
function prefixOp(re, group) {
    if (group === void 0) { group = 0; }
    return P.MonadicParser.regexp(re, group).skip(P.MonadicParser.optWhitespace);
}
exports.prefixOp = prefixOp;
function postfixOp(re, group) {
    if (group === void 0) { group = 0; }
    return P.MonadicParser.optWhitespace.then(P.MonadicParser.regexp(re, group));
}
exports.postfixOp = postfixOp;
function ofOp(name, short) {
    var op = short ? "".concat(name, "|").concat((0, string_1.escapeRegExp)(short)) : name;
    var re = RegExp("(".concat(op, ")\\s+([-+]?[0-9]*\\.?[0-9]+)\\s+OF"), 'i');
    return infixOp(re, 2).map(parseFloat);
}
exports.ofOp = ofOp;
function makeError(msg) {
    return function () {
        throw new Error(msg);
    };
}
exports.makeError = makeError;
function andExpr(selections) {
    if (selections.length === 1) {
        return selections[0];
    }
    else if (selections.length > 1) {
        return B.core.logic.and(selections);
    }
    else {
        return undefined;
    }
}
exports.andExpr = andExpr;
function orExpr(selections) {
    if (selections.length === 1) {
        return selections[0];
    }
    else if (selections.length > 1) {
        return B.core.logic.or(selections);
    }
    else {
        return undefined;
    }
}
exports.orExpr = orExpr;
function testExpr(property, args) {
    if (args && args.op !== undefined && args.val !== undefined) {
        var opArgs = [property, args.val];
        switch (args.op) {
            case '=': return B.core.rel.eq(opArgs);
            case '!=': return B.core.rel.neq(opArgs);
            case '>': return B.core.rel.gr(opArgs);
            case '<': return B.core.rel.lt(opArgs);
            case '>=': return B.core.rel.gre(opArgs);
            case '<=': return B.core.rel.lte(opArgs);
            default: throw new Error("operator '".concat(args.op, "' not supported"));
        }
    }
    else if (args && args.flags !== undefined) {
        return B.core.flags.hasAny([property, args.flags]);
    }
    else if (args && args.min !== undefined && args.max !== undefined) {
        return B.core.rel.inRange([property, args.min, args.max]);
    }
    else if (!Array.isArray(args)) {
        return B.core.rel.eq([property, args]);
    }
    else if (args.length > 1) {
        return B.core.set.has([B.core.type.set(args), property]);
    }
    else {
        return B.core.rel.eq([property, args[0]]);
    }
}
exports.testExpr = testExpr;
function invertExpr(selection) {
    return B.struct.generator.queryInSelection({
        0: selection, query: B.struct.generator.all(), 'in-complement': true
    });
}
exports.invertExpr = invertExpr;
function strLenSortFn(a, b) {
    return a.length < b.length ? 1 : -1;
}
exports.strLenSortFn = strLenSortFn;
function getNamesRegex(name, abbr) {
    var names = (abbr ? [name].concat(abbr) : [name])
        .sort(strLenSortFn).map(string_1.escapeRegExp).join('|');
    return RegExp("".concat(names), 'i');
}
function getPropertyRules(properties) {
    // in keyof typeof properties
    var propertiesDict = {};
    Object.keys(properties).sort(strLenSortFn).forEach(function (name) {
        var ps = properties[name];
        var errorFn = makeError("property '".concat(name, "' not supported"));
        var rule = P.MonadicParser.regexp(ps.regex).map(function (x) {
            if (ps.isUnsupported)
                errorFn();
            return testExpr(ps.property, ps.map(x));
        });
        if (!ps.isNumeric) {
            propertiesDict[name] = rule;
        }
    });
    return propertiesDict;
}
exports.getPropertyRules = getPropertyRules;
function getNamedPropertyRules(properties) {
    var namedPropertiesList = [];
    Object.keys(properties).sort(strLenSortFn).forEach(function (name) {
        var ps = properties[name];
        var errorFn = makeError("property '".concat(name, "' not supported"));
        var rule = P.MonadicParser.regexp(ps.regex).map(function (x) {
            if (ps.isUnsupported)
                errorFn();
            return testExpr(ps.property, ps.map(x));
        });
        var nameRule = P.MonadicParser.regexp(getNamesRegex(name, ps.abbr)).trim(P.MonadicParser.optWhitespace);
        var groupMap = function (x) {
            var _a;
            return B.struct.generator.atomGroups((_a = {}, _a[ps.level] = x, _a));
        };
        if (ps.isNumeric) {
            namedPropertiesList.push(nameRule.then(P.MonadicParser.seq(P.MonadicParser.regexp(/>=|<=|=|!=|>|</).trim(P.MonadicParser.optWhitespace), P.MonadicParser.regexp(ps.regex).map(ps.map))).map(function (x) {
                if (ps.isUnsupported)
                    errorFn();
                return testExpr(ps.property, { op: x[0], val: x[1] });
            }).map(groupMap));
        }
        else {
            namedPropertiesList.push(nameRule.then(rule).map(groupMap));
        }
    });
    return namedPropertiesList;
}
exports.getNamedPropertyRules = getNamedPropertyRules;
function getKeywordRules(keywords) {
    var keywordsList = [];
    Object.keys(keywords).sort(strLenSortFn).forEach(function (name) {
        var ks = keywords[name];
        var mapFn = ks.map ? ks.map : makeError("keyword '".concat(name, "' not supported"));
        var rule = P.MonadicParser.regexp(getNamesRegex(name, ks.abbr)).map(mapFn);
        keywordsList.push(rule);
    });
    return keywordsList;
}
exports.getKeywordRules = getKeywordRules;
function getFunctionRules(functions, argRule) {
    var functionsList = [];
    var begRule = P.MonadicParser.regexp(/\(\s*/);
    var endRule = P.MonadicParser.regexp(/\s*\)/);
    Object.keys(functions).sort(strLenSortFn).forEach(function (name) {
        var fs = functions[name];
        var mapFn = fs.map ? fs.map : makeError("function '".concat(name, "' not supported"));
        var rule = P.MonadicParser.regexp(new RegExp(name, 'i')).skip(begRule).then(argRule).skip(endRule).map(mapFn);
        functionsList.push(rule);
    });
    return functionsList;
}
exports.getFunctionRules = getFunctionRules;
function getPropertyNameRules(properties, lookahead) {
    var list = [];
    Object.keys(properties).sort(strLenSortFn).forEach(function (name) {
        var ps = properties[name];
        var errorFn = makeError("property '".concat(name, "' not supported"));
        var rule = P.MonadicParser.regexp(getNamesRegex(name, ps.abbr)).lookahead(lookahead).map(function () {
            if (ps.isUnsupported)
                errorFn();
            return ps.property;
        });
        list.push(rule);
    });
    return list;
}
exports.getPropertyNameRules = getPropertyNameRules;
function getReservedWords(properties, keywords, operators, functions) {
    var w = [];
    for (var name_1 in properties) {
        w.push(name_1);
        if (properties[name_1].abbr)
            w.push.apply(w, properties[name_1].abbr);
    }
    for (var name_2 in keywords) {
        w.push(name_2);
        if (keywords[name_2].abbr)
            w.push.apply(w, keywords[name_2].abbr);
    }
    operators.forEach(function (o) {
        w.push(o.name);
        if (o.abbr)
            w.push.apply(w, o.abbr);
    });
    return w;
}
exports.getReservedWords = getReservedWords;
function atomNameSet(ids) {
    return B.core.type.set(ids.map(B.atomName));
}
exports.atomNameSet = atomNameSet;
function asAtoms(e) {
    return B.struct.generator.queryInSelection({
        0: e,
        query: B.struct.generator.all()
    });
}
exports.asAtoms = asAtoms;
function wrapValue(property, value, sstrucDict) {
    switch (property.head.name) {
        case 'structure-query.atom-property.macromolecular.label_atom_id':
            return B.atomName(value);
        case 'structure-query.atom-property.core.element-symbol':
            return B.es(value);
        case 'structure-query.atom-property.macromolecular.secondary-structure-flags':
            if (sstrucDict) {
                value = [sstrucDict[value.toUpperCase()] || 'none'];
            }
            return B.struct.type.secondaryStructureFlags([value]);
        default:
            return value;
    }
}
exports.wrapValue = wrapValue;
var propPrefix = 'structure-query.atom-property.macromolecular.';
var entityProps = ['entityKey', 'label_entity_id', 'entityType'];
var chainProps = ['chainKey', 'label_asym_id', 'label_entity_id', 'auth_asym_id', 'entityType'];
var residueProps = ['residueKey', 'label_comp_id', 'label_seq_id', 'auth_comp_id', 'auth_seq_id', 'pdbx_formal_charge', 'secondaryStructureKey', 'secondaryStructureFlags', 'isModified', 'modifiedParentName'];
function testLevel(property) {
    if (property.head.name.startsWith(propPrefix)) {
        var name_3 = property.head.name.substr(propPrefix.length);
        if (entityProps.includes(name_3))
            return 'entity-test';
        if (chainProps.includes(name_3))
            return 'chain-test';
        if (residueProps.includes(name_3))
            return 'residue-test';
    }
    return 'atom-test';
}
exports.testLevel = testLevel;
var flagProps = [
    'structure-query.atom-property.macromolecular.secondary-structure-flags'
];
function valuesTest(property, values) {
    if (flagProps.includes(property.head.name)) {
        var name_4 = values[0].head;
        var flags_1 = [];
        values.forEach(function (v) { return flags_1.push.apply(flags_1, v.args[0]); });
        return B.core.flags.hasAny([property, { head: name_4, args: flags_1 }]);
    }
    else {
        if (values.length === 1) {
            return B.core.rel.eq([property, values[0]]);
        }
        else if (values.length > 1) {
            return B.core.set.has([B.core.type.set(values), property]);
        }
    }
}
exports.valuesTest = valuesTest;
function resnameExpr(resnameList) {
    return B.struct.generator.atomGroups({
        'residue-test': B.core.set.has([
            B.core.type.set(resnameList),
            B.ammp('label_comp_id')
        ])
    });
}
exports.resnameExpr = resnameExpr;
