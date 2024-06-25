"use strict";
/**
 * Copyright (c) 2021-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.alignAndSuperposeWithSIFTSMapping = void 0;
var int_1 = require("../../../../mol-data/int");
var minimize_rmsd_1 = require("../../../../mol-math/linear-algebra/3d/minimize-rmsd");
var sifts_mapping_1 = require("../../../../mol-model-props/sequence/sifts-mapping");
var element_1 = require("../element");
function alignAndSuperposeWithSIFTSMapping(structures, options) {
    var _a, _b;
    var indexMap = new Map();
    for (var i = 0; i < structures.length; i++) {
        buildIndex(structures[i], indexMap, i, (_a = options === null || options === void 0 ? void 0 : options.traceOnly) !== null && _a !== void 0 ? _a : true, (_b = options === null || options === void 0 ? void 0 : options.includeResidueTest) !== null && _b !== void 0 ? _b : _includeAllResidues);
    }
    var index = Array.from(indexMap.values());
    // TODO: support non-first structure pivots
    var pairs = findPairs(structures.length, index);
    var zeroOverlapPairs = [];
    var failedPairs = [];
    var entries = [];
    for (var _i = 0, pairs_1 = pairs; _i < pairs_1.length; _i++) {
        var p = pairs_1[_i];
        if (p.count === 0) {
            zeroOverlapPairs.push([p.i, p.j]);
        }
        else {
            var _c = getPositionTables(index, p.i, p.j, p.count), a = _c[0], b = _c[1];
            var transform = minimize_rmsd_1.MinimizeRmsd.compute({ a: a, b: b });
            if (Number.isNaN(transform.rmsd)) {
                failedPairs.push([p.i, p.j]);
            }
            else {
                entries.push({ transform: transform, pivot: p.i, other: p.j });
            }
        }
    }
    return { entries: entries, zeroOverlapPairs: zeroOverlapPairs, failedPairs: failedPairs };
}
exports.alignAndSuperposeWithSIFTSMapping = alignAndSuperposeWithSIFTSMapping;
function getPositionTables(index, pivot, other, N) {
    var xs = minimize_rmsd_1.MinimizeRmsd.Positions.empty(N);
    var ys = minimize_rmsd_1.MinimizeRmsd.Positions.empty(N);
    var o = 0;
    for (var _i = 0, index_1 = index; _i < index_1.length; _i++) {
        var pivots = index_1[_i].pivots;
        var a = pivots[pivot];
        var b = pivots[other];
        if (!a || !b)
            continue;
        var l = Math.min(a[2] - a[1], b[2] - b[1]);
        // TODO: check if residue types match?
        for (var i = 0; i < l; i++) {
            var eI = (a[1] + i);
            xs.x[o] = a[0].conformation.x(eI);
            xs.y[o] = a[0].conformation.y(eI);
            xs.z[o] = a[0].conformation.z(eI);
            eI = (b[1] + i);
            ys.x[o] = b[0].conformation.x(eI);
            ys.y[o] = b[0].conformation.y(eI);
            ys.z[o] = b[0].conformation.z(eI);
            o++;
        }
    }
    return [xs, ys];
}
function findPairs(N, index) {
    var pairwiseCounts = [];
    for (var i = 0; i < N; i++) {
        pairwiseCounts[i] = [];
        for (var j = 0; j < N; j++)
            pairwiseCounts[i][j] = 0;
    }
    for (var _i = 0, index_2 = index; _i < index_2.length; _i++) {
        var pivots = index_2[_i].pivots;
        for (var i = 0; i < N; i++) {
            if (!pivots[i])
                continue;
            var lI = pivots[i][2] - pivots[i][1];
            for (var j = i + 1; j < N; j++) {
                if (!pivots[j])
                    continue;
                var lJ = pivots[j][2] - pivots[j][1];
                pairwiseCounts[i][j] = pairwiseCounts[i][j] + Math.min(lI, lJ);
            }
        }
    }
    var ret = [];
    for (var j = 1; j < N; j++) {
        ret[j - 1] = { i: 0, j: j, count: pairwiseCounts[0][j] };
    }
    // TODO: support non-first structure pivots
    // for (let i = 0; i < N - 1; i++) {
    //     let max = 0, maxJ = i;
    //     for (let j = i + 1; j < N; j++) {
    //         if (pairwiseCounts[i][j] > max) {
    //             maxJ = j;
    //             max = pairwiseCounts[i][j];
    //         }
    //     }
    //     ret[i] = { i, j: maxJ, count: max };
    // }
    return ret;
}
function _includeAllResidues() { return true; }
function buildIndex(structure, index, sI, traceOnly, includeTest) {
    var _a;
    var loc = element_1.StructureElement.Location.create(structure);
    for (var _i = 0, _b = structure.units; _i < _b.length; _i++) {
        var unit = _b[_i];
        if (unit.kind !== 0 /* Unit.Kind.Atomic */)
            continue;
        var elements = unit.elements, model = unit.model;
        loc.unit = unit;
        var map = sifts_mapping_1.SIFTSMapping.Provider.get(model).value;
        if (!map)
            return;
        var dbName = map.dbName, accession = map.accession, num = map.num;
        var chainsIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.chainAtomSegments, elements);
        var residuesIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, elements);
        var traceElementIndex = unit.model.atomicHierarchy.derived.residue.traceElementIndex;
        while (chainsIt.hasNext) {
            var chainSegment = chainsIt.move();
            residuesIt.setSegment(chainSegment);
            while (residuesIt.hasNext) {
                var residueSegment = residuesIt.move();
                var rI = residueSegment.index;
                if (!dbName[rI])
                    continue;
                var traceElement = traceElementIndex[rI];
                var start = void 0, end = void 0;
                if (traceOnly) {
                    start = traceElement;
                    if (start === -1)
                        continue;
                    end = start + 1;
                }
                else {
                    start = elements[residueSegment.start];
                    end = elements[residueSegment.end - 1] + 1;
                }
                loc.element = (traceElement >= 0 ? traceElement : start);
                if (!includeTest(loc, rI, start, end))
                    continue;
                var key = "".concat(dbName[rI], "-").concat(accession[rI], "-").concat(num[rI]);
                if (!index.has(key)) {
                    index.set(key, { key: key, pivots: (_a = {}, _a[sI] = [unit, start, end], _a) });
                }
                else {
                    var entry = index.get(key);
                    if (!entry.pivots[sI]) {
                        entry.pivots[sI] = [unit, start, end];
                    }
                }
            }
        }
    }
}
