/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Russell Parker <russell@benchling.com>
 */
// TODO only support compressed files for which uncompression support is available???
// TODO store globally with decompression plugins?
var COMPRESSED_EXT_LIST = ['gz', 'zip'];
export function getFileNameInfo(fileName) {
    var path = fileName;
    var protocol = '';
    var queryIndex = path.lastIndexOf('?');
    var query = queryIndex !== -1 ? path.substring(queryIndex) : '';
    path = path.substring(0, queryIndex === -1 ? path.length : queryIndex);
    var name = path.replace(/^.*[\\/]/, '');
    var base = name.substring(0, name.lastIndexOf('.'));
    var nameSplit = name.split('.');
    var ext = nameSplit.length > 1 ? (nameSplit.pop() || '').toLowerCase() : '';
    var protocolMatch = path.match(/^(.+):\/\/(.+)$/);
    if (protocolMatch) {
        protocol = protocolMatch[1].toLowerCase();
        path = protocolMatch[2] || '';
    }
    var dir = path.substring(0, path.lastIndexOf('/') + 1);
    if (COMPRESSED_EXT_LIST.includes(ext)) {
        var n = path.length - ext.length - 1;
        // TODO: change logic to String.prototype.substring since substr is deprecated
        ext = (path.substr(0, n).split('.').pop() || '').toLowerCase();
        var m = base.length - ext.length - 1;
        base = base.substr(0, m);
    }
    // Note: it appears that most of this data never gets used.
    return { path: path, name: name, ext: ext, base: base, dir: dir, protocol: protocol, query: query };
}
