"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlCombine = exports.urlQueryParameter = void 0;
function urlQueryParameter(id) {
    if (typeof window === 'undefined')
        return undefined;
    const a = new RegExp(`${id}=([^&#=]*)`);
    const m = a.exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : undefined;
}
exports.urlQueryParameter = urlQueryParameter;
function urlCombine(base, query) {
    return `${base}${base[base.length - 1] === '/' || query[0] === '/' ? '' : '/'}${query}`;
}
exports.urlCombine = urlCombine;
