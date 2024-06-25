/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { now } from '../../mol-util/now';
function movingAverage(avg, sample, count) {
    avg -= avg / count;
    avg += sample / count;
    return avg;
}
var MovingAverage = /** @class */ (function () {
    function MovingAverage(count) {
        this.count = count;
        this.avgs = new Map();
    }
    MovingAverage.prototype.add = function (label, sample) {
        var avg = this.avgs.get(label) || sample;
        avg = movingAverage(avg, sample, this.count);
        this.avgs.set(label, avg);
        return avg;
    };
    MovingAverage.prototype.get = function (label) {
        return this.avgs.get(label);
    };
    MovingAverage.prototype.stats = function () {
        return Object.fromEntries(this.avgs.entries());
    };
    return MovingAverage;
}());
function clearStatsCalls(stats) {
    stats.calls.drawInstanced = 0;
    stats.calls.counts = 0;
}
function getQuery(extensions) {
    return extensions.disjointTimerQuery ? extensions.disjointTimerQuery.createQuery() : null;
}
export function createTimer(gl, extensions, stats, options) {
    var _a;
    var dtq = extensions.disjointTimerQuery;
    var avgCount = (_a = options === null || options === void 0 ? void 0 : options.avgCount) !== null && _a !== void 0 ? _a : 30;
    var queries = new Map();
    var pending = new Map();
    var stack = [];
    var gpuAvgs = new MovingAverage(avgCount);
    var cpuAvgs = new MovingAverage(avgCount);
    var measures = [];
    var current = null;
    var capturingCalls = false;
    var clear = function () {
        if (!dtq)
            return;
        queries.forEach(function (_, query) {
            dtq.deleteQuery(query);
        });
        pending.clear();
        measures = [];
        current = null;
    };
    var add = function () {
        if (!dtq)
            return;
        var query = getQuery(extensions);
        if (!query)
            return;
        dtq.beginQuery(dtq.TIME_ELAPSED, query);
        pending.forEach(function (measure, _) {
            measure.queries.push(query);
        });
        queries.set(query, { refCount: pending.size });
        current = query;
    };
    return {
        resolve: function () {
            var results = [];
            if (!dtq || !measures.length)
                return results;
            // console.log('resolve');
            queries.forEach(function (result, query) {
                if (result.timeElapsed !== undefined)
                    return;
                var available = dtq.getQueryParameter(query, dtq.QUERY_RESULT_AVAILABLE);
                var disjoint = gl.getParameter(dtq.GPU_DISJOINT);
                if (available && !disjoint) {
                    var timeElapsed = dtq.getQueryParameter(query, dtq.QUERY_RESULT);
                    result.timeElapsed = timeElapsed;
                    // console.log('timeElapsed', result.timeElapsed);
                }
                if (available || disjoint) {
                    dtq.deleteQuery(query);
                }
            });
            var unresolved = [];
            var _loop_1 = function (measure) {
                if (measure.queries.every(function (q) { var _a; return ((_a = queries.get(q)) === null || _a === void 0 ? void 0 : _a.timeElapsed) !== undefined; })) {
                    var timeElapsed = 0;
                    for (var _a = 0, _b = measure.queries; _a < _b.length; _a++) {
                        var query = _b[_a];
                        var result = queries.get(query);
                        timeElapsed += result.timeElapsed;
                        result.refCount -= 1;
                    }
                    measure.timeElapsed = timeElapsed;
                    if (measure.root) {
                        var children = [];
                        var add_1 = function (measures, children) {
                            for (var _i = 0, measures_2 = measures; _i < measures_2.length; _i++) {
                                var measure_1 = measures_2[_i];
                                var timeElapsed_1 = measure_1.timeElapsed;
                                var cpuElapsed_1 = measure_1.cpu.end - measure_1.cpu.start;
                                var result = {
                                    label: measure_1.label,
                                    gpuElapsed: timeElapsed_1,
                                    gpuAvg: gpuAvgs.add(measure_1.label, timeElapsed_1),
                                    cpuElapsed: cpuElapsed_1,
                                    cpuAvg: cpuAvgs.add(measure_1.label, cpuElapsed_1),
                                    children: [],
                                    calls: measure_1.calls,
                                };
                                children.push(result);
                                add_1(measure_1.children, result.children);
                            }
                        };
                        add_1(measure.children, children);
                        var cpuElapsed = measure.cpu.end - measure.cpu.start;
                        results.push({
                            label: measure.label,
                            gpuElapsed: timeElapsed,
                            gpuAvg: gpuAvgs.add(measure.label, timeElapsed),
                            cpuElapsed: cpuElapsed,
                            cpuAvg: cpuAvgs.add(measure.label, cpuElapsed),
                            children: children,
                            calls: measure.calls,
                        });
                    }
                }
                else {
                    unresolved.push(measure);
                }
            };
            for (var _i = 0, measures_1 = measures; _i < measures_1.length; _i++) {
                var measure = measures_1[_i];
                _loop_1(measure);
            }
            measures = unresolved;
            queries.forEach(function (result, query) {
                if (result.refCount === 0) {
                    queries.delete(query);
                }
            });
            return results;
        },
        mark: function (label, captureCalls) {
            if (captureCalls === void 0) { captureCalls = false; }
            if (!dtq)
                return;
            if (pending.has(label)) {
                throw new Error("Timer mark for '".concat(label, "' already exists"));
            }
            if (current !== null) {
                dtq.endQuery(dtq.TIME_ELAPSED);
            }
            var measure = {
                label: label,
                queries: [],
                children: [],
                root: current === null,
                cpu: { start: now(), end: -1 },
                captureCalls: captureCalls,
            };
            pending.set(label, measure);
            if (stack.length) {
                stack[stack.length - 1].children.push(measure);
            }
            stack.push(measure);
            if (captureCalls) {
                if (capturingCalls) {
                    throw new Error('Already capturing calls');
                }
                clearStatsCalls(stats);
                capturingCalls = true;
            }
            add();
        },
        markEnd: function (label) {
            var _a;
            if (!dtq)
                return;
            var measure = pending.get(label);
            if (!measure) {
                throw new Error("Timer mark for '".concat(label, "' does not exist"));
            }
            if (((_a = stack.pop()) === null || _a === void 0 ? void 0 : _a.label) !== label) {
                throw new Error("Timer mark for '".concat(label, "' has pending nested mark"));
            }
            dtq.endQuery(dtq.TIME_ELAPSED);
            pending.delete(label);
            measure.cpu.end = now();
            if (measure.captureCalls) {
                measure.calls = {
                    drawInstanced: stats.calls.drawInstanced,
                    counts: stats.calls.counts,
                };
                capturingCalls = false;
            }
            measures.push(measure);
            if (pending.size > 0) {
                add();
            }
            else {
                current = null;
            }
        },
        stats: function () {
            return {
                gpu: gpuAvgs.stats(),
                cpu: cpuAvgs.stats(),
            };
        },
        formatedStats: function () {
            var stats = {};
            var gpu = gpuAvgs.stats();
            var cpu = cpuAvgs.stats();
            for (var _i = 0, _a = Object.keys(gpu); _i < _a.length; _i++) {
                var l = _a[_i];
                var g = "".concat((gpu[l] / 1000 / 1000).toFixed(2));
                var c = "".concat(cpu[l].toFixed(2));
                stats[l] = "".concat(g, " ms | CPU: ").concat(c, " ms");
            }
            return stats;
        },
        clear: clear,
        destroy: function () {
            clear();
        }
    };
}
function formatTimerResult(result) {
    var gpu = "".concat((result.gpuElapsed / 1000 / 1000).toFixed(2));
    var gpuAvg = "".concat((result.gpuAvg / 1000 / 1000).toFixed(2));
    var cpu = "".concat(result.cpuElapsed.toFixed(2));
    var cpuAvg = "".concat(result.cpuAvg.toFixed(2));
    return "".concat(result.label, " ").concat(gpu, " ms (avg. ").concat(gpuAvg, " ms) | CPU: ").concat(cpu, " ms (avg. ").concat(cpuAvg, " ms)");
}
export function printTimerResults(results) {
    results.map(function (r) {
        var f = formatTimerResult(r);
        if (r.children.length || r.calls) {
            console.groupCollapsed(f);
            if (r.calls)
                console.log(r.calls);
            printTimerResults(r.children);
            console.groupEnd();
        }
        else {
            console.log(f);
        }
    });
}
