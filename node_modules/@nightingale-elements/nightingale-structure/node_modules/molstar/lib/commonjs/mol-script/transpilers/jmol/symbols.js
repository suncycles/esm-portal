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
exports._all = exports.Keywords = exports.Operators = exports.Properties = void 0;
var properties_1 = require("./properties");
var operators_1 = require("./operators");
var keywords_1 = require("./keywords");
exports.Properties = [];
for (var name_1 in properties_1.properties) {
    if (properties_1.properties[name_1].isUnsupported)
        continue;
    exports.Properties.push(name_1);
    if (properties_1.properties[name_1].abbr)
        exports.Properties.push.apply(exports.Properties, properties_1.properties[name_1].abbr);
}
exports.Operators = [];
operators_1.operators.forEach(function (o) {
    if (o.isUnsupported)
        return;
    exports.Operators.push(o.name);
    if (o.abbr)
        exports.Operators.push.apply(exports.Operators, o.abbr);
});
exports.Keywords = [];
for (var name_2 in keywords_1.keywords) {
    if (!keywords_1.keywords[name_2].map)
        continue;
    exports.Keywords.push(name_2);
    if (keywords_1.keywords[name_2].abbr)
        exports.Keywords.push.apply(exports.Keywords, keywords_1.keywords[name_2].abbr);
}
exports._all = { Properties: exports.Properties, Operators: exports.Operators, Keywords: exports.Keywords };
