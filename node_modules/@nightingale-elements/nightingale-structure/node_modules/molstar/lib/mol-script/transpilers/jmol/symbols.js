/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Koya Sakuma <koya.sakuma.work@gmail.com>
 *
 * Adapted from MolQL project
 */
import { properties } from './properties';
import { operators } from './operators';
import { keywords } from './keywords';
export var Properties = [];
for (var name_1 in properties) {
    if (properties[name_1].isUnsupported)
        continue;
    Properties.push(name_1);
    if (properties[name_1].abbr)
        Properties.push.apply(Properties, properties[name_1].abbr);
}
export var Operators = [];
operators.forEach(function (o) {
    if (o.isUnsupported)
        return;
    Operators.push(o.name);
    if (o.abbr)
        Operators.push.apply(Operators, o.abbr);
});
export var Keywords = [];
for (var name_2 in keywords) {
    if (!keywords[name_2].map)
        continue;
    Keywords.push(name_2);
    if (keywords[name_2].abbr)
        Keywords.push.apply(Keywords, keywords[name_2].abbr);
}
export var _all = { Properties: Properties, Operators: Operators, Keywords: Keywords };
