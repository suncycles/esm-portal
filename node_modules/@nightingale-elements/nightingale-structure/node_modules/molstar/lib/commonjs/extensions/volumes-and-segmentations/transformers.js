"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolsegGlobalStateFromRoot = exports.VolsegStateFromEntry = exports.VolsegEntryFromRoot = void 0;
var tslib_1 = require("tslib");
var objects_1 = require("../../mol-plugin-state/objects");
var mol_state_1 = require("../../mol-state");
var mol_task_1 = require("../../mol-task");
var entry_root_1 = require("./entry-root");
var entry_state_1 = require("./entry-state");
var global_state_1 = require("./global-state");
exports.VolsegEntryFromRoot = objects_1.PluginStateTransform.BuiltIn({
    name: 'volseg-entry-from-root',
    display: { name: 'Vol & Seg Entry', description: 'Vol & Seg Entry' },
    from: objects_1.PluginStateObject.Root,
    to: entry_root_1.VolsegEntry,
    params: function (a, plugin) { return (0, entry_root_1.createVolsegEntryParams)(plugin); },
})({
    apply: function (_a, plugin) {
        var _this = this;
        var a = _a.a, params = _a.params;
        return mol_task_1.Task.create('Load Vol & Seg Entry', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var data;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, entry_root_1.VolsegEntryData.create(plugin, params)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, new entry_root_1.VolsegEntry(data, { label: data.entryId, description: 'Vol & Seg Entry' })];
                }
            });
        }); });
    },
    update: function (_a) {
        var b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams;
        Object.assign(newParams, oldParams);
        console.error('Changing params of existing VolsegEntry node is not allowed');
        return mol_state_1.StateTransformer.UpdateResult.Unchanged;
    }
});
exports.VolsegStateFromEntry = objects_1.PluginStateTransform.BuiltIn({
    name: entry_state_1.VOLSEG_STATE_FROM_ENTRY_TRANSFORMER_NAME,
    display: { name: 'Vol & Seg Entry State', description: 'Vol & Seg Entry State' },
    from: entry_root_1.VolsegEntry,
    to: entry_state_1.VolsegState,
    params: entry_state_1.VolsegStateParams,
})({
    apply: function (_a, plugin) {
        var _this = this;
        var a = _a.a, params = _a.params;
        return mol_task_1.Task.create('Create Vol & Seg Entry State', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, new entry_state_1.VolsegState(params, { label: 'State' })];
            });
        }); });
    }
});
exports.VolsegGlobalStateFromRoot = objects_1.PluginStateTransform.BuiltIn({
    name: 'volseg-global-state-from-root',
    display: { name: 'Vol & Seg Global State', description: 'Vol & Seg Global State' },
    from: objects_1.PluginStateObject.Root,
    to: global_state_1.VolsegGlobalState,
    params: global_state_1.VolsegGlobalStateParams,
})({
    apply: function (_a, plugin) {
        var _this = this;
        var a = _a.a, params = _a.params;
        return mol_task_1.Task.create('Create Vol & Seg Global State', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var data;
            return tslib_1.__generator(this, function (_a) {
                data = new global_state_1.VolsegGlobalStateData(plugin, params);
                return [2 /*return*/, new global_state_1.VolsegGlobalState(data, { label: 'Global State', description: 'Vol & Seg Global State' })];
            });
        }); });
    },
    update: function (_a) {
        var b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams;
        b.data.currentState.next(newParams);
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
});
