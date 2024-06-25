/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { __assign } from "tslib";
import { NtCTubeProvider } from './property';
import { DnatcoUtil } from '../util';
import { Segmentation, SortedArray } from '../../../mol-data/int';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { StructureElement } from '../../../mol-model/structure';
function getAtomPosition(vec, loc, residue, names, altId, insCode) {
    var eI = DnatcoUtil.getAtomIndex(loc, residue, names, altId, insCode);
    if (eI !== -1) {
        loc.unit.conformation.invariantPosition(eI, vec);
        return true;
    }
    return false; // Atom not found
}
var p_1 = Vec3();
var p0 = Vec3();
var p1 = Vec3();
var p2 = Vec3();
var p3 = Vec3();
var p4 = Vec3();
var pP = Vec3();
var C5PrimeNames = ['C5\'', 'C5*'];
var O3PrimeNames = ['O3\'', 'O3*'];
var O5PrimeNames = ['O5\'', 'O5*'];
var PNames = ['P'];
function getPoints(loc, r0, r1, r2, altId0, altId1, altId2, insCode0, insCode1, insCode2) {
    if (r0) {
        if (!getAtomPosition(p_1, loc, r0, C5PrimeNames, altId0, insCode0))
            return void 0;
        if (!getAtomPosition(p0, loc, r0, O3PrimeNames, altId0, insCode0))
            return void 0;
    }
    else {
        if (!getAtomPosition(p0, loc, r1, O5PrimeNames, altId1, insCode1))
            return void 0;
    }
    if (!getAtomPosition(p1, loc, r1, C5PrimeNames, altId1, insCode1))
        return void 0;
    if (!getAtomPosition(p2, loc, r1, O3PrimeNames, altId1, insCode1))
        return void 0;
    if (!getAtomPosition(p3, loc, r2, C5PrimeNames, altId2, insCode2))
        return void 0;
    if (!getAtomPosition(p4, loc, r2, O3PrimeNames, altId2, insCode2))
        return void 0;
    if (!getAtomPosition(pP, loc, r2, PNames, altId2, insCode2))
        return void 0;
    return { p_1: p_1, p0: p0, p1: p1, p2: p2, p3: p3, p4: p4, pP: pP };
}
function hasGapElements(r, unit) {
    for (var xI = r.start; xI < r.end; xI++) {
        var eI = unit.elements[xI];
        if (SortedArray.has(unit.gapElements, eI)) {
            return true;
        }
    }
    return false;
}
var NtCTubeSegmentsIterator = /** @class */ (function () {
    function NtCTubeSegmentsIterator(structure, unit) {
        this.altIdOne = '';
        this.insCodeOne = '';
        this.chainIt = Segmentation.transientSegments(unit.model.atomicHierarchy.chainAtomSegments, unit.elements);
        this.residueIt = Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, unit.elements);
        var prop = NtCTubeProvider.get(unit.model).value;
        this.data = prop === null || prop === void 0 ? void 0 : prop.data;
        if (this.chainIt.hasNext) {
            this.residueIt.setSegment(this.chainIt.move());
            this.prime();
        }
        this.loc = StructureElement.Location.create(structure, unit, -1);
    }
    NtCTubeSegmentsIterator.prototype.moveStep = function () {
        if (!this.residueNext)
            return void 0;
        /* Assume discontinuity of the ResidueIndex of the residue that would become residue one (= first residue of the corresponding step)
         * does not equal to ResidueIndex of what would be residue two (= second residue of the corresponding step). */
        if (this.residueTwo.index + 1 === this.residueNext.index) {
            this.residuePrev = DnatcoUtil.copyResidue(this.residueOne);
            this.residueOne = DnatcoUtil.copyResidue(this.residueTwo);
            this.residueTwo = DnatcoUtil.copyResidue(this.residueNext);
            this.residueNext = this.residueIt.hasNext ? DnatcoUtil.copyResidue(this.residueIt.move()) : void 0;
        }
        else {
            if (!this.residueIt.hasNext) {
                this.residueNext = void 0;
                return void 0;
            }
            // There is discontinuity, act as if we were at the beginning of a chain
            this.residuePrev = void 0;
            this.residueOne = DnatcoUtil.copyResidue(this.residueNext);
            this.residueTwo = DnatcoUtil.copyResidue(this.residueIt.move());
            this.residueNext = this.residueIt.hasNext ? DnatcoUtil.copyResidue(this.residueIt.move()) : void 0;
        }
        return this.toSegment(this.residuePrev, this.residueOne, this.residueTwo, this.residueNext);
    };
    NtCTubeSegmentsIterator.prototype.prime = function () {
        if (this.residueIt.hasNext)
            this.residueTwo = DnatcoUtil.copyResidue(this.residueIt.move());
        if (this.residueIt.hasNext)
            this.residueNext = this.residueIt.move();
    };
    NtCTubeSegmentsIterator.prototype.toSegment = function (r0, r1, r2, r3) {
        var indices = DnatcoUtil.getStepIndices(this.data.data, this.loc, r1);
        if (indices.length === 0)
            return void 0;
        var stepIdx = indices[0];
        var step = this.data.data.steps[stepIdx];
        var altIdPrev = this.altIdOne;
        var insCodePrev = this.insCodeOne;
        this.altIdOne = step.label_alt_id_1;
        this.insCodeOne = step.PDB_ins_code_1;
        var altIdTwo = step.label_alt_id_2;
        var insCodeTwo = step.PDB_ins_code_2;
        var followsGap = !!r0 && hasGapElements(r0, this.loc.unit) && hasGapElements(r1, this.loc.unit);
        var precedesDiscontinuity = r3 ? r3.index !== r2.index + 1 : false;
        var points = getPoints(this.loc, r0, r1, r2, altIdPrev, this.altIdOne, altIdTwo, insCodePrev, this.insCodeOne, insCodeTwo);
        if (!points)
            return void 0;
        return __assign(__assign({}, points), { stepIdx: stepIdx, followsGap: followsGap, firstInChain: !r0, capEnd: !this.residueNext || precedesDiscontinuity || hasGapElements(r2, this.loc.unit) });
    };
    Object.defineProperty(NtCTubeSegmentsIterator.prototype, "hasNext", {
        get: function () {
            if (!this.data)
                return false;
            return !!this.residueNext
                ? true
                : this.chainIt.hasNext;
        },
        enumerable: false,
        configurable: true
    });
    NtCTubeSegmentsIterator.prototype.move = function () {
        if (!!this.residueNext) {
            return this.moveStep();
        }
        else {
            this.residuePrev = void 0; // Assume discontinuity when we switch chains
            this.residueNext = void 0;
            this.residueIt.setSegment(this.chainIt.move());
            this.prime();
            return this.moveStep();
        }
    };
    return NtCTubeSegmentsIterator;
}());
export { NtCTubeSegmentsIterator };
