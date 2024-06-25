/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
var _a;
import { __awaiter, __extends, __generator } from "tslib";
import { PluginStateObject as SO } from '../../mol-plugin-state/objects';
import { PluginBehavior } from '../../mol-plugin/behavior';
import { PluginConfigItem } from '../../mol-plugin/config';
import { StateAction } from '../../mol-state';
import { Task } from '../../mol-task';
import { DEFAULT_VOLSEG_SERVER, VolumeApiV2 } from './volseg-api/api';
import { VolsegEntryData, VolsegEntryParamValues, createLoadVolsegParams } from './entry-root';
import { VolsegGlobalState } from './global-state';
import { createEntryId } from './helpers';
import { VolsegEntryFromRoot, VolsegGlobalStateFromRoot, VolsegStateFromEntry } from './transformers';
import { VolsegUI } from './ui';
var DEBUGGING = typeof window !== 'undefined' ? ((_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.hostname) === 'localhost' : false;
export var VolsegVolumeServerConfig = {
    // DefaultServer: new PluginConfigItem('volseg-volume-server', DEFAULT_VOLUME_SERVER_V2),
    DefaultServer: new PluginConfigItem('volseg-volume-server', DEBUGGING ? 'http://localhost:9000/v2' : DEFAULT_VOLSEG_SERVER),
};
export var Volseg = PluginBehavior.create({
    name: 'volseg',
    category: 'misc',
    display: {
        name: 'Volseg',
        description: 'Volseg'
    },
    ctor: /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        class_1.prototype.register = function () {
            this.ctx.state.data.actions.add(LoadVolseg);
            this.ctx.customStructureControls.set('volseg', VolsegUI);
            this.initializeEntryLists(); // do not await
            var entries = new Map();
            this.subscribeObservable(this.ctx.state.data.events.cell.created, function (o) {
                if (o.cell.obj instanceof VolsegEntryData)
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
            this.ctx.state.data.actions.remove(LoadVolseg);
            this.ctx.customStructureControls.delete('volseg');
        };
        class_1.prototype.initializeEntryLists = function () {
            var _a;
            return __awaiter(this, void 0, void 0, function () {
                var apiUrl, api, entryLists;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            apiUrl = (_a = this.ctx.config.get(VolsegVolumeServerConfig.DefaultServer)) !== null && _a !== void 0 ? _a : DEFAULT_VOLSEG_SERVER;
                            api = new VolumeApiV2(apiUrl);
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
    }(PluginBehavior.Handler))
});
export var LoadVolseg = StateAction.build({
    display: { name: 'Load Volume & Segmentation' },
    from: SO.Root,
    params: function (a, plugin) {
        var res = createLoadVolsegParams(plugin, plugin.customState.volsegAvailableEntries);
        return res;
    },
})(function (_a, ctx) {
    var params = _a.params, state = _a.state;
    return Task.create('Loading Volume & Segmentation', function (taskCtx) {
        return state.transaction(function () { return __awaiter(void 0, void 0, void 0, function () {
            var entryParams, globalStateNode, entryNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        entryParams = VolsegEntryParamValues.fromLoadVolsegParamValues(params);
                        if (entryParams.entryId.trim().length === 0) {
                            alert('Must specify Entry Id!');
                            throw new Error('Specify Entry Id');
                        }
                        if (!entryParams.entryId.includes('-')) {
                            // add source prefix if the user omitted it (e.g. 1832 -> emd-1832)
                            entryParams.entryId = createEntryId(entryParams.source, entryParams.entryId);
                        }
                        ctx.behaviors.layout.leftPanelTabName.next('data');
                        globalStateNode = ctx.state.data.selectQ(function (q) { return q.ofType(VolsegGlobalState); })[0];
                        if (!!globalStateNode) return [3 /*break*/, 2];
                        return [4 /*yield*/, state.build().toRoot().apply(VolsegGlobalStateFromRoot, {}, { state: { isGhost: !DEBUGGING } }).commit()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, state.build().toRoot().apply(VolsegEntryFromRoot, entryParams).commit()];
                    case 3:
                        entryNode = _a.sent();
                        return [4 /*yield*/, state.build().to(entryNode).apply(VolsegStateFromEntry, {}, { state: { isGhost: !DEBUGGING } }).commit()];
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
