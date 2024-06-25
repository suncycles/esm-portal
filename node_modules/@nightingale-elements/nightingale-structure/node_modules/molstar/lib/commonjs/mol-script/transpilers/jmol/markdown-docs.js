"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Koya Sakuma <koya.sakuma.work@gmail.com>
 *
 * Adapted from MolQL project
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.docs = void 0;
var properties_1 = require("./properties");
var operators_1 = require("./operators");
var keywords_1 = require("./keywords");
var _docs = [
    'Jmol',
    '============',
    '--------------------------------',
    ''
];
_docs.push("## Properties\n\n");
_docs.push('--------------------------------\n');
for (var name_1 in properties_1.properties) {
    if (properties_1.properties[name_1].isUnsupported)
        continue;
    var names = [name_1];
    if (properties_1.properties[name_1].abbr)
        names.push.apply(names, properties_1.properties[name_1].abbr);
    _docs.push("```\n".concat(names.join(', '), "\n```\n"));
    if (properties_1.properties[name_1]['@desc']) {
        _docs.push("*".concat(properties_1.properties[name_1]['@desc'], "*\n"));
    }
}
_docs.push("## Operators\n\n");
_docs.push('--------------------------------\n');
operators_1.operators.forEach(function (o) {
    if (o.isUnsupported)
        return;
    var names = [o.name];
    if (o.abbr)
        names.push.apply(names, o.abbr);
    _docs.push("```\n".concat(names.join(', '), "\n```\n"));
    if (o['@desc']) {
        _docs.push("*".concat(o['@desc'], "*\n"));
    }
});
_docs.push("## Keywords\n\n");
_docs.push('--------------------------------\n');
for (var name_2 in keywords_1.keywords) {
    if (!keywords_1.keywords[name_2].map)
        continue;
    var names = [name_2];
    if (keywords_1.keywords[name_2].abbr)
        names.push.apply(names, keywords_1.keywords[name_2].abbr);
    _docs.push("```\n".concat(names.join(', '), "\n```\n"));
    if (keywords_1.keywords[name_2]['@desc']) {
        _docs.push("*".concat(keywords_1.keywords[name_2]['@desc'], "*\n"));
    }
}
exports.docs = _docs.join('\n');
