"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadVolseg = exports.Volseg = exports.VolsegVolumeServerConfig = void 0;
var tslib_1 = require("tslib");
var objects_1 = require("../../mol-plugin-state/objects");
var behavior_1 = require("../../mol-plugin/behavior");
var config_1 = require("../../mol-plugin/config");
var mol_state_1 = require("../../mol-state");
var mol_task_1 = require("../../mol-task");
var api_1 = require("./volseg-api/api");
var entry_root_1 = require("./entry-root");
var global_state_1 = require("./global-state");
var helpers_1 = require("./helpers");
var transformers_1 = require("./transformers");
var ui_1 = require("./ui");
var DEBUGGING = typeof window !== 'undefined' ? ((_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.hostname) === 'localhost' : false;
exports.VolsegVolumeServerConfig = {
    // DefaultServer: new PluginConfigItem('volseg-volume-server', DEFAULT_VOLUME_SERVER_V2),
    DefaultServer: new config_1.PluginConfigItem('volseg-volume-server', DEBUGGING ? 'http://localhost:9000/v2' : api_1.DEFAULT_VOLSEG_SERVER),
};
exports.Volseg = behavior_1.PluginBehavior.create({
    name: 'volseg',
    category: 'misc',
    display: {
        name: 'Volseg',
        description: 'Volseg'
    },
    ctor: /** @class */ (function (_super) {
        tslib_1.__extends(class_1, _super);
        function class_1() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        class_1.prototype.register = function () {
            this.ctx.state.data.actions.add(exports.LoadVolseg);
            this.ctx.customStructureControls.set('volseg', ui_1.VolsegUI);
            this.initializeEntryLists(); // do not await
            var entries = new Map();
            this.subscribeObservable(this.ctx.state.data.events.cell.created, function (o) {
                if (o.cell.obj instanceof entry_root_1.VolsegEntryData)
                    entries.set(o.ref, o.cell.obj);
            });
            this.subscribeObservable(this.ctx.state.data.events.cell.removed, function (o) {
                if (entries.has(o.ref)) {
                    entries.get(o.ref).dispose();
                    entries.delete(o.ref);
                }
            });
        };
        class_1.prototype.unregister = function () {
            this.ctx.state.data.actions.remove(exports.LoadVolseg);
            this.ctx.customStructureControls.delete('volseg');
        };
        class_1.prototype.initializeEntryLists = function () {
            var _a;
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var apiUrl, api, entryLists;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            apiUrl = (_a = this.ctx.config.get(exports.VolsegVolumeServerConfig.DefaultServer)) !== null && _a !== void 0 ? _a : api_1.DEFAULT_VOLSEG_SERVER;
                            api = new api_1.VolumeApiV2(apiUrl);
                            return [4 /*yield*/, api.getEntryList(Math.pow(10, 6))];
                        case 1:
                            entryLists = _b.sent();
                            Object.values(entryLists).forEach(function (l) { return l.sort(); });
                            this.ctx.customState.volsegAvailableEntries = entryLists;
                            return [2 /*return*/];
                    }
                });
            });
        };
        return class_1;
    }(behavior_1.PluginBehavior.Handler))
});
exports.LoadVolseg = mol_state_1.StateAction.build({
    display: { name: 'Load Volume & Segmentation' },
    from: objects_1.PluginStateObject.Root,
    params: function (a, plugin) {
        var res = (0, entry_root_1.createLoadVolsegParams)(plugin, plugin.customState.volsegAvailableEntries);
        return res;
    },
})(function (_a, ctx) {
    var params = _a.params, state = _a.state;
    return mol_task_1.Task.create('Loading Volume & Segmentation', function (taskCtx) {
        return state.transaction(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var entryParams, globalStateNode, entryNode;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        entryParams = entry_root_1.VolsegEntryParamValues.fromLoadVolsegParamValues(params);
                        if (entryParams.entryId.trim().length === 0) {
                            alert('Must specify Entry Id!');
                            throw new Error('Specify Entry Id');
                        }
                        if (!entryParams.entryId.includes('-')) {
                            // add source prefix if the user omitted it (e.g. 1832 -> emd-1832)
                            entryParams.entryId = (0, helpers_1.createEntryId)(entryParams.source, entryParams.entryId);
                        }
                        ctx.behaviors.layout.leftPanelTabName.next('data');
                        globalStateNode = ctx.state.data.selectQ(function (q) { return q.ofType(global_state_1.VolsegGlobalState); })[0];
                        if (!!globalStateNode) return [3 /*break*/, 2];
                        return [4 /*yield*/, state.build().toRoot().apply(transformers_1.VolsegGlobalStateFromRoot, {}, { state: { isGhost: !DEBUGGING } }).commit()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, state.build().toRoot().apply(transformers_1.VolsegEntryFromRoot, entryParams).commit()];
                    case 3:
                        entryNode = _a.sent();
                        return [4 /*yield*/, state.build().to(entryNode).apply(transformers_1.VolsegStateFromEntry, {}, { state: { isGhost: !DEBUGGING } }).commit()];
                    case 4:
                        _a.sent();
                        if (!entryNode.data) return [3 /*break*/, 7];
                        return [4 /*yield*/, entryNode.data.loadVolume()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, entryNode.data.loadSegmentations()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        }); }).runInContext(taskCtx);
    });
});
