"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeFilters = exports.ListCol = exports.MatrixCol = exports.VectorCol = exports.EnumCol = exports.CoordCol = exports.FloatCol = exports.StrCol = exports.IntCol = void 0;
function IntCol(description) { return { type: 'int', description }; }
exports.IntCol = IntCol;
function StrCol(description) { return { type: 'str', description }; }
exports.StrCol = StrCol;
function FloatCol(description) { return { type: 'float', description }; }
exports.FloatCol = FloatCol;
function CoordCol(description) { return { type: 'coord', description }; }
exports.CoordCol = CoordCol;
function EnumCol(values, subType, description) {
    return { type: 'enum', description, values, subType };
}
exports.EnumCol = EnumCol;
function VectorCol(length, description) {
    return { type: 'vector', description, length };
}
exports.VectorCol = VectorCol;
function MatrixCol(columns, rows, description) {
    return { type: 'matrix', description, columns, rows };
}
exports.MatrixCol = MatrixCol;
function ListCol(subType, separator, description) {
    return { type: 'list', description, separator, subType };
}
exports.ListCol = ListCol;
function mergeFilters(...filters) {
    const n = filters.length;
    const mergedFilter = {};
    const fields = new Map();
    filters.forEach(filter => {
        Object.keys(filter).forEach(category => {
            Object.keys(filter[category]).forEach(field => {
                const key = `${category}.${field}`;
                const value = fields.get(key) || 0;
                fields.set(key, value + 1);
            });
        });
    });
    fields.forEach((v, k) => {
        if (v !== n)
            return;
        const [categoryName, fieldName] = k.split('.');
        if (categoryName in mergedFilter) {
            mergedFilter[categoryName][fieldName] = true;
        }
        else {
            mergedFilter[categoryName] = { fieldName: true };
        }
    });
    return mergedFilter;
}
exports.mergeFilters = mergeFilters;
