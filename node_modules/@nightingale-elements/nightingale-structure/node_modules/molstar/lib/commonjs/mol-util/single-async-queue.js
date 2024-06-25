"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleAsyncQueue = void 0;
var tslib_1 = require("tslib");
/** Job queue that allows at most one running and one pending job.
 * A newly enqueued job will cancel any other pending jobs. */
var SingleAsyncQueue = /** @class */ (function () {
    function SingleAsyncQueue(log) {
        if (log === void 0) { log = false; }
        this.isRunning = false;
        this.queue = [];
        this.counter = 0;
        this.log = log;
    }
    SingleAsyncQueue.prototype.enqueue = function (job) {
        if (this.log)
            console.log('SingleAsyncQueue enqueue', this.counter);
        this.queue[0] = { id: this.counter, func: job };
        this.counter++;
        this.run(); // do not await
    };
    SingleAsyncQueue.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var job;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isRunning)
                            return [2 /*return*/];
                        job = this.queue.pop();
                        if (!job)
                            return [2 /*return*/];
                        this.isRunning = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        if (this.log)
                            console.log('SingleAsyncQueue run', job.id);
                        return [4 /*yield*/, job.func()];
                    case 2:
                        _a.sent();
                        if (this.log)
                            console.log('SingleAsyncQueue complete', job.id);
                        return [3 /*break*/, 4];
                    case 3:
                        this.isRunning = false;
                        this.run();
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return SingleAsyncQueue;
}());
exports.SingleAsyncQueue = SingleAsyncQueue;
