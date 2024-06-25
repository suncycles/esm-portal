/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
/**
 * on node `process.env.NODE_ENV` is available, in webpack build it is automatically set
 * by the DefinePlugin to the webpack `mode` value
 */
var isProductionMode = function () {
    try {
        return process.env.NODE_ENV === 'production';
    }
    catch (_a) {
        return false;
    }
}();
/**
 * set to true to enable more comprehensive checks and assertions,
 * mostly used in `mol-gl` and in valence-model calculation
 */
var isDebugMode = function getIsDebug() {
    try {
        var val = process.env.DEBUG;
        return val === '*' || val === 'molstar';
    }
    catch (_a) {
        return false;
    }
}();
/**
 * set to true to gather timings, mostly used in `mol-gl`
 */
var isTimingMode = false;
export { isProductionMode, isDebugMode, isTimingMode };
export function setProductionMode(value) {
    if (typeof value !== 'undefined')
        isProductionMode = value;
}
export function setDebugMode(value) {
    if (typeof value !== 'undefined')
        isDebugMode = value;
}
export function setTimingMode(value) {
    if (typeof value !== 'undefined')
        isTimingMode = value;
}
var consoleStatsProviders = [];
export function addConsoleStatsProvider(p) {
    if (!consoleStatsProviders.includes(p))
        consoleStatsProviders.push(p);
}
export function removeConsoleStatsProvider(p) {
    var idx = consoleStatsProviders.indexOf(p);
    if (idx !== -1)
        consoleStatsProviders.splice(idx, 1);
}
export function consoleStats() {
    for (var _i = 0, consoleStatsProviders_1 = consoleStatsProviders; _i < consoleStatsProviders_1.length; _i++) {
        var p = consoleStatsProviders_1[_i];
        p();
    }
}
