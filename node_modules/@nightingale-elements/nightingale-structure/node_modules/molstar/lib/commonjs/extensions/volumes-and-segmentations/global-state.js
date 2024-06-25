"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolsegGlobalStateData = exports.VolsegGlobalState = exports.VolsegGlobalStateParams = void 0;
var tslib_1 = require("tslib");
var rxjs_1 = require("rxjs");
var objects_1 = require("../../mol-plugin-state/objects");
var behavior_1 = require("../../mol-plugin/behavior");
var param_definition_1 = require("../../mol-util/param-definition");
var entry_root_1 = require("./entry-root");
var helpers_1 = require("./helpers");
exports.VolsegGlobalStateParams = {
    tryUseGpu: param_definition_1.ParamDefinition.Boolean(true, { description: 'Attempt using GPU for faster rendering. \nCaution: with some hardware setups, this might render some objects incorrectly or not at all.' }),
    selectionMode: param_definition_1.ParamDefinition.Boolean(true, { description: 'Allow selecting/deselecting a segment by clicking on it.' }),
};
var VolsegGlobalState = /** @class */ (function (_super) {
    tslib_1.__extends(VolsegGlobalState, _super);
    function VolsegGlobalState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VolsegGlobalState;
}(objects_1.PluginStateObject.CreateBehavior({ name: 'Vol & Seg Global State' })));
exports.VolsegGlobalState = VolsegGlobalState;
var VolsegGlobalStateData = /** @class */ (function (_super) {
    tslib_1.__extends(VolsegGlobalStateData, _super);
    function VolsegGlobalStateData(plugin, params) {
        var _this = _super.call(this, plugin, params) || this;
        _this.currentState = new rxjs_1.BehaviorSubject(param_definition_1.ParamDefinition.getDefaultValues(exports.VolsegGlobalStateParams));
        _this.currentState.next(params);
        return _this;
    }
    VolsegGlobalStateData.prototype.register = function (ref) {
        this.ref = ref;
    };
    VolsegGlobalStateData.prototype.unregister = function () {
        this.ref = '';
    };
    VolsegGlobalStateData.prototype.isRegistered = function () {
        return this.ref !== '';
    };
    VolsegGlobalStateData.prototype.updateState = function (plugin, state) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var oldState, promises, allEntries, _i, allEntries_1, entry, _a, allEntries_2, entry;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        oldState = this.currentState.value;
                        promises = [];
                        allEntries = plugin.state.data.selectQ(function (q) { return q.ofType(entry_root_1.VolsegEntry); }).map(function (cell) { var _a; return (_a = cell.obj) === null || _a === void 0 ? void 0 : _a.data; }).filter(helpers_1.isDefined);
                        if (state.tryUseGpu !== undefined && state.tryUseGpu !== oldState.tryUseGpu) {
                            for (_i = 0, allEntries_1 = allEntries; _i < allEntries_1.length; _i++) {
                                entry = allEntries_1[_i];
                                promises.push(entry.setTryUseGpu(state.tryUseGpu));
                            }
                        }
                        if (state.selectionMode !== undefined && state.selectionMode !== oldState.selectionMode) {
                            for (_a = 0, allEntries_2 = allEntries; _a < allEntries_2.length; _a++) {
                                entry = allEntries_2[_a];
                                promises.push(entry.setSelectionMode(state.selectionMode));
                            }
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, plugin.build().to(this.ref).update(state).commit()];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    VolsegGlobalStateData.getGlobalState = function (plugin) {
        var _a, _b;
        return (_b = (_a = plugin.state.data.selectQ(function (q) { return q.ofType(VolsegGlobalState); })[0]) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data.currentState.value;
    };
    return VolsegGlobalStateData;
}(behavior_1.PluginBehavior.WithSubscribers));
exports.VolsegGlobalStateData = VolsegGlobalStateData;
