/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 *
 * Adapted from MolQL project
 */
import { properties } from './properties';
import { operators } from './operators';
import { keywords } from './keywords';
import { functions } from './functions';
var _docs = [
    'VMD',
    '============',
    '--------------------------------',
    ''
];
_docs.push("## Properties\n\n");
_docs.push('--------------------------------\n');
for (var name_1 in properties) {
    if (properties[name_1].isUnsupported)
        continue;
    var names = [name_1];
    if (properties[name_1].abbr)
        names.push.apply(names, properties[name_1].abbr);
    _docs.push("```\n".concat(names.join(', '), "\n```\n"));
    if (properties[name_1]['@desc']) {
        _docs.push("*".concat(properties[name_1]['@desc'], "*\n"));
    }
}
_docs.push("## Operators\n\n");
_docs.push('--------------------------------\n');
operators.forEach(function (o) {
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
for (var name_2 in keywords) {
    if (!keywords[name_2].map)
        continue;
    var names = [name_2];
    if (keywords[name_2].abbr)
        names.push.apply(names, keywords[name_2].abbr);
    _docs.push("```\n".concat(names.join(', '), "\n```\n"));
    if (keywords[name_2]['@desc']) {
        _docs.push("*".concat(keywords[name_2]['@desc'], "*\n"));
    }
}
_docs.push("## Functions\n\n");
_docs.push('--------------------------------\n');
for (var name_3 in functions) {
    if (!functions[name_3].map)
        continue;
    var names = [name_3];
    _docs.push("```\n".concat(names.join(', '), "\n```\n"));
    if (functions[name_3]['@desc']) {
        _docs.push("*".concat(functions[name_3]['@desc'], "*\n"));
    }
}
export var docs = _docs.join('\n');
