/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { SortedArray } from '../../../../mol-data/int/sorted-array';
import { sortedCantorPairing } from '../../../../mol-data/util';
import { BondType } from '../../model/types';
export function getResonance(unit) {
    return {
        delocalizedTriplets: getDelocalizedTriplets(unit)
    };
}
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
        triplets.push(SortedArray.ofUnsortedArray([a, b, c]));
        thirdElementMap.set(sortedCantorPairing(a, b), c);
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
            if (!BondType.is(f, 16 /* BondType.Flag.Aromatic */))
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
            return thirdElementMap.get(sortedCantorPairing(a, b));
        },
        getTripletIndices: function (a) {
            return indicesMap.get(a);
        },
        triplets: triplets,
    };
}
