"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointInPolygon = void 0;
/** raycast along x-axis and apply even-odd rule */
function pointInPolygon(point, polygon, count) {
    var x = point[0], y = point[1];
    var inside = false;
    for (var i = 0, j = count - 1; i < count; j = i++) {
        var xi = polygon[i * 2], yi = polygon[i * 2 + 1];
        var xj = polygon[j * 2], yj = polygon[j * 2 + 1];
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}
exports.pointInPolygon = pointInPolygon;
