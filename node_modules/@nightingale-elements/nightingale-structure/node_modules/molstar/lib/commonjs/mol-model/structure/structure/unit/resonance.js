"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResonance = void 0;
var sorted_array_1 = require("../../../../mol-data/int/sorted-array");
var util_1 = require("../../../../mol-data/util");
var types_1 = require("../../model/types");
function getResonance(unit) {
    return {
        delocalizedTriplets: getDelocalizedTriplets(unit)
    };
}
exports.getResonance = getResonance;
function getDelocalizedTriplets(unit) {
    var bonds = unit.bonds;
    var b = bonds.b, edgeProps = bonds.edgeProps, offset = bonds.offset;
    var _order = edgeProps.order, _flags = edgeProps.flags;
    var elementAromaticRingIndices = unit.rings.elementAromaticRingIndices;
    var triplets = [];
    var thirdElementMap = new Map();
    var indicesMap = new Map();
    var add = function (a, b, c) {
        var index = triplets.length;
        triplets.push(sorted_array_1.SortedArray.ofUnsortedArray([a, b, c]));
        thirdElementMap.set((0, util_1.sortedCantorPairing)(a, b), c);
        if (indicesMap.has(a))
            indicesMap.get(a).push(index);
        else
            indicesMap.set(a, [index]);
    };
    for (var i = 0; i < unit.elements.length; i++) {
        if (elementAromaticRingIndices.has(i))
            continue;
        var count = offset[i + 1] - offset[i] + 1;
        if (count < 2)
            continue;
        var deloBonds = [];
        for (var t = offset[i], _t = offset[i + 1]; t < _t; t++) {
            var f = _flags[t];
            if (!types_1.BondType.is(f, 16 /* BondType.Flag.Aromatic */))
                continue;
            deloBonds.push(b[t]);
        }
        if (deloBonds.length >= 2) {
            add(i, deloBonds[0], deloBonds[1]);
            for (var j = 1, jl = deloBonds.length; j < jl; j++) {
                add(i, deloBonds[j], deloBonds[0]);
            }
        }
    }
    return {
        getThirdElement: function (a, b) {
            return thirdElementMap.get((0, util_1.sortedCantorPairing)(a, b));
        },
        getTripletIndices: function (a) {
            return indicesMap.get(a);
        },
        triplets: triplets,
    };
}
