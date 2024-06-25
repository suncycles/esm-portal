"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPdbIdsForEmdbEntry = exports.tryGetIsovalue = void 0;
var tslib_1 = require("tslib");
var helpers_1 = require("./helpers");
/** Try to get author-defined contour value for isosurface from EMDB API. Return relative value 1.0, if not applicable or fails.  */
function tryGetIsovalue(entryId) {
    var _a, _b;
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var split, response, json, contours, theContour, _c;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    split = (0, helpers_1.splitEntryId)(entryId);
                    if (!(split.source === 'emdb')) return [3 /*break*/, 5];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("https://www.ebi.ac.uk/emdb/api/entry/map/".concat(split.entryNumber))];
                case 2:
                    response = _d.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    json = _d.sent();
                    contours = (_b = (_a = json === null || json === void 0 ? void 0 : json.map) === null || _a === void 0 ? void 0 : _a.contour_list) === null || _b === void 0 ? void 0 : _b.contour;
                    if (contours && contours.length > 0) {
                        theContour = contours.find(function (c) { return c.primary; }) || contours[0];
                        if (theContour.level === undefined)
                            throw new Error('EMDB API response missing contour level.');
                        return [2 /*return*/, { kind: 'absolute', value: theContour.level }];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _c = _d.sent();
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, undefined];
            }
        });
    });
}
exports.tryGetIsovalue = tryGetIsovalue;
function getPdbIdsForEmdbEntry(entryId) {
    var _a, _b, _c;
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var split, result, apiUrl, response, json, jsonEntry, _i, jsonEntry_1, record, pdbs, ex_1;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    split = (0, helpers_1.splitEntryId)(entryId);
                    result = [];
                    if (!(split.source === 'emdb')) return [3 /*break*/, 6];
                    entryId = entryId.toUpperCase();
                    apiUrl = "https://www.ebi.ac.uk/pdbe/api/emdb/entry/fitted/".concat(entryId);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch(apiUrl)];
                case 2:
                    response = _d.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    json = _d.sent();
                    jsonEntry = (_a = json[entryId]) !== null && _a !== void 0 ? _a : [];
                    for (_i = 0, jsonEntry_1 = jsonEntry; _i < jsonEntry_1.length; _i++) {
                        record = jsonEntry_1[_i];
                        pdbs = (_c = (_b = record === null || record === void 0 ? void 0 : record.fitted_emdb_id_list) === null || _b === void 0 ? void 0 : _b.pdb_id) !== null && _c !== void 0 ? _c : [];
                        result.push.apply(result, pdbs);
                    }
                    _d.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    ex_1 = _d.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/, result];
            }
        });
    });
}
exports.getPdbIdsForEmdbEntry = getPdbIdsForEmdbEntry;
