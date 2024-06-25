/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
import { PluginStateObject, PluginStateTransform } from '../../mol-plugin-state/objects';
import { StateTransformer } from '../../mol-state';
import { Task } from '../../mol-task';
import { VolsegEntry, VolsegEntryData, createVolsegEntryParams } from './entry-root';
import { VolsegState, VolsegStateParams, VOLSEG_STATE_FROM_ENTRY_TRANSFORMER_NAME } from './entry-state';
import { VolsegGlobalState, VolsegGlobalStateData, VolsegGlobalStateParams } from './global-state';
export var VolsegEntryFromRoot = PluginStateTransform.BuiltIn({
    name: 'volseg-entry-from-root',
    display: { name: 'Vol & Seg Entry', description: 'Vol & Seg Entry' },
    from: PluginStateObject.Root,
    to: VolsegEntry,
    params: function (a, plugin) { return createVolsegEntryParams(plugin); },
})({
    apply: function (_a, plugin) {
        var _this = this;
        var a = _a.a, params = _a.params;
        return Task.create('Load Vol & Seg Entry', function () { return __awaiter(_this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VolsegEntryData.create(plugin, params)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, new VolsegEntry(data, { label: data.entryId, description: 'Vol & Seg Entry' })];
                }
            });
        }); });
    },
    update: function (_a) {
        var b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams;
        Object.assign(newParams, oldParams);
        console.error('Changing params of existing VolsegEntry node is not allowed');
        return StateTransformer.UpdateResult.Unchanged;
    }
});
export var VolsegStateFromEntry = PluginStateTransform.BuiltIn({
    name: VOLSEG_STATE_FROM_ENTRY_TRANSFORMER_NAME,
    display: { name: 'Vol & Seg Entry State', description: 'Vol & Seg Entry State' },
    from: VolsegEntry,
    to: VolsegState,
    params: VolsegStateParams,
})({
    apply: function (_a, plugin) {
        var _this = this;
        var a = _a.a, params = _a.params;
        return Task.create('Create Vol & Seg Entry State', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new VolsegState(params, { label: 'State' })];
            });
        }); });
    }
});
export var VolsegGlobalStateFromRoot = PluginStateTransform.BuiltIn({
    name: 'volseg-global-state-from-root',
    display: { name: 'Vol & Seg Global State', description: 'Vol & Seg Global State' },
    from: PluginStateObject.Root,
    to: VolsegGlobalState,
    params: VolsegGlobalStateParams,
})({
    apply: function (_a, plugin) {
        var _this = this;
        var a = _a.a, params = _a.params;
        return Task.create('Create Vol & Seg Global State', function () { return __awaiter(_this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                data = new VolsegGlobalStateData(plugin, params);
                return [2 /*return*/, new VolsegGlobalState(data, { label: 'Global State', description: 'Vol & Seg Global State' })];
            });
        }); });
    },
    update: function (_a) {
        var b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams;
        b.data.currentState.next(newParams);
        return StateTransformer.UpdateResult.Updated;
    }
});
