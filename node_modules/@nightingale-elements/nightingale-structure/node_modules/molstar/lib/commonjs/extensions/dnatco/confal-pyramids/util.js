"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfalPyramidsIterator = void 0;
var property_1 = require("./property");
var util_1 = require("../util");
var int_1 = require("../../../mol-data/int");
var structure_1 = require("../../../mol-model/structure");
function getPyramid(loc, one, two, altIdOne, altIdTwo, insCodeOne, insCodeTwo, confalScore, stepIdx) {
    var O3 = util_1.DnatcoUtil.getAtomIndex(loc, one, ['O3\'', 'O3*'], altIdOne, insCodeOne);
    var P = util_1.DnatcoUtil.getAtomIndex(loc, two, ['P'], altIdTwo, insCodeTwo);
    var OP1 = util_1.DnatcoUtil.getAtomIndex(loc, two, ['OP1'], altIdTwo, insCodeTwo);
    var OP2 = util_1.DnatcoUtil.getAtomIndex(loc, two, ['OP2'], altIdTwo, insCodeTwo);
    var O5 = util_1.DnatcoUtil.getAtomIndex(loc, two, ['O5\'', 'O5*'], altIdTwo, insCodeTwo);
    return { O3: O3, P: P, OP1: OP1, OP2: OP2, O5: O5, confalScore: confalScore, stepIdx: stepIdx };
}
var ConfalPyramidsIterator = /** @class */ (function () {
    function ConfalPyramidsIterator(structure, unit) {
        this.chainIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.chainAtomSegments, unit.elements);
        this.residueIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, unit.elements);
        var prop = property_1.ConfalPyramidsProvider.get(unit.model).value;
        this.data = prop === null || prop === void 0 ? void 0 : prop.data;
        if (this.chainIt.hasNext) {
            this.residueIt.setSegment(this.chainIt.move());
            if (this.residueIt.hasNext)
                this.residueTwo = this.residueIt.move();
        }
        this.loc = structure_1.StructureElement.Location.create(structure, unit, -1);
    }
    ConfalPyramidsIterator.prototype.moveStep = function () {
        this.residueOne = util_1.DnatcoUtil.copyResidue(this.residueTwo);
        this.residueTwo = util_1.DnatcoUtil.copyResidue(this.residueIt.move());
        // Check for discontinuity
        if (this.residueTwo.index !== (this.residueOne.index + 1))
            return void 0;
        return this.toPyramids(this.residueOne, this.residueTwo);
    };
    ConfalPyramidsIterator.prototype.toPyramids = function (one, two) {
        var indices = util_1.DnatcoUtil.getStepIndices(this.data, this.loc, one);
        var points = [];
        for (var _i = 0, indices_1 = indices; _i < indices_1.length; _i++) {
            var idx = indices_1[_i];
            var step = this.data.steps[idx];
            points.push(getPyramid(this.loc, one, two, step.label_alt_id_1, step.label_alt_id_2, step.PDB_ins_code_1, step.PDB_ins_code_2, step.confal_score, idx));
        }
        return points;
    };
    Object.defineProperty(ConfalPyramidsIterator.prototype, "hasNext", {
        get: function () {
            if (!this.data)
                return false;
            return this.residueIt.hasNext
                ? true
                : this.chainIt.hasNext;
        },
        enumerable: false,
        configurable: true
    });
    ConfalPyramidsIterator.prototype.move = function () {
        if (this.residueIt.hasNext) {
            return this.moveStep();
        }
        else {
            this.residueIt.setSegment(this.chainIt.move());
            if (this.residueIt.hasNext)
                this.residueTwo = this.residueIt.move();
            return this.moveStep();
        }
    };
    return ConfalPyramidsIterator;
}());
exports.ConfalPyramidsIterator = ConfalPyramidsIterator;
