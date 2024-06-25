"use strict";
/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlaneDataFromStructureSelections = exports.getOrientationDataFromStructureSelections = exports.getLabelDataFromStructureSelections = exports.getDihedralDataFromStructureSelections = exports.getAngleDataFromStructureSelections = exports.getDistanceDataFromStructureSelections = void 0;
function getDistanceDataFromStructureSelections(s) {
    const lociA = s[0].loci;
    const lociB = s[1].loci;
    return { pairs: [{ loci: [lociA, lociB] }] };
}
exports.getDistanceDataFromStructureSelections = getDistanceDataFromStructureSelections;
function getAngleDataFromStructureSelections(s) {
    const lociA = s[0].loci;
    const lociB = s[1].loci;
    const lociC = s[2].loci;
    return { triples: [{ loci: [lociA, lociB, lociC] }] };
}
exports.getAngleDataFromStructureSelections = getAngleDataFromStructureSelections;
function getDihedralDataFromStructureSelections(s) {
    const lociA = s[0].loci;
    const lociB = s[1].loci;
    const lociC = s[2].loci;
    const lociD = s[3].loci;
    return { quads: [{ loci: [lociA, lociB, lociC, lociD] }] };
}
exports.getDihedralDataFromStructureSelections = getDihedralDataFromStructureSelections;
function getLabelDataFromStructureSelections(s) {
    const loci = s[0].loci;
    return { infos: [{ loci }] };
}
exports.getLabelDataFromStructureSelections = getLabelDataFromStructureSelections;
function getOrientationDataFromStructureSelections(s) {
    return { locis: s.map(v => v.loci) };
}
exports.getOrientationDataFromStructureSelections = getOrientationDataFromStructureSelections;
function getPlaneDataFromStructureSelections(s) {
    return { locis: s.map(v => v.loci) };
}
exports.getPlaneDataFromStructureSelections = getPlaneDataFromStructureSelections;
