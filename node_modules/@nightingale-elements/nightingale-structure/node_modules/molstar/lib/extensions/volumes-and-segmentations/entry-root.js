/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { __assign, __awaiter, __extends, __generator, __spreadArray } from "tslib";
import { BehaviorSubject, distinctUntilChanged, Subject, throttleTime } from 'rxjs';
import { VolsegVolumeServerConfig } from '.';
import { ShapeGroup } from '../../mol-model/shape';
import { Volume } from '../../mol-model/volume';
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { PluginBehavior } from '../../mol-plugin/behavior';
import { PluginCommands } from '../../mol-plugin/commands';
import { StateSelection } from '../../mol-state';
import { shallowEqualObjects } from '../../mol-util';
import { ParamDefinition } from '../../mol-util/param-definition';
import { DEFAULT_VOLSEG_SERVER, VolumeApiV2 } from './volseg-api/api';
import { MetadataWrapper } from './volseg-api/utils';
import { VolsegMeshSegmentationData } from './entry-meshes';
import { VolsegModelData } from './entry-models';
import { VolsegLatticeSegmentationData } from './entry-segmentation';
import { VolsegState, VolsegStateParams } from './entry-state';
import { VolsegVolumeData, VOLUME_VISUAL_TAG } from './entry-volume';
import * as ExternalAPIs from './external-api';
import { VolsegGlobalStateData } from './global-state';
import { applyEllipsis, Choice, isDefined, lazyGetter, splitEntryId } from './helpers';
export var MAX_VOXELS = Math.pow(10, 7);
// export const MAX_VOXELS = 10 ** 2; // DEBUG
export var BOX = null;
// export const BOX: [[number, number, number], [number, number, number]] | null = [[-90, -90, -90], [90, 90, 90]]; // DEBUG
var MAX_ANNOTATIONS_IN_LABEL = 6;
var SourceChoice = new Choice({ emdb: 'EMDB', empiar: 'EMPIAR', idr: 'IDR' }, 'emdb');
export function createLoadVolsegParams(plugin, entrylists) {
    var _a;
    if (entrylists === void 0) { entrylists = {}; }
    var defaultVolumeServer = (_a = plugin === null || plugin === void 0 ? void 0 : plugin.config.get(VolsegVolumeServerConfig.DefaultServer)) !== null && _a !== void 0 ? _a : DEFAULT_VOLSEG_SERVER;
    return {
        serverUrl: ParamDefinition.Text(defaultVolumeServer),
        source: ParamDefinition.Mapped(SourceChoice.values[0], SourceChoice.options, function (src) { return entryParam(entrylists[src]); }),
    };
}
function entryParam(entries) {
    if (entries === void 0) { entries = []; }
    var options = entries.map(function (e) { return [e, e]; });
    options.push(['__custom__', 'Custom']);
    return ParamDefinition.Group({
        entryId: ParamDefinition.Select(options[0][0], options, { description: 'Choose an entry from the list, or choose "Custom" and type any entry ID (useful when using other than default server).' }),
        customEntryId: ParamDefinition.Text('', { hideIf: function (p) { return p.entryId !== '__custom__'; }, description: 'Entry identifier, including the source prefix, e.g. "emd-1832"' }),
    }, { isFlat: true });
}
export function createVolsegEntryParams(plugin) {
    var _a;
    var defaultVolumeServer = (_a = plugin === null || plugin === void 0 ? void 0 : plugin.config.get(VolsegVolumeServerConfig.DefaultServer)) !== null && _a !== void 0 ? _a : DEFAULT_VOLSEG_SERVER;
    return {
        serverUrl: ParamDefinition.Text(defaultVolumeServer),
        source: SourceChoice.PDSelect(),
        entryId: ParamDefinition.Text('emd-1832', { description: 'Entry identifier, including the source prefix, e.g. "emd-1832"' }),
    };
}
export var VolsegEntryParamValues;
(function (VolsegEntryParamValues) {
    function fromLoadVolsegParamValues(params) {
        var entryId = params.source.params.entryId;
        if (entryId === '__custom__') {
            entryId = params.source.params.customEntryId;
        }
        return {
            serverUrl: params.serverUrl,
            source: params.source.name,
            entryId: entryId
        };
    }
    VolsegEntryParamValues.fromLoadVolsegParamValues = fromLoadVolsegParamValues;
})(VolsegEntryParamValues || (VolsegEntryParamValues = {}));
var VolsegEntry = /** @class */ (function (_super) {
    __extends(VolsegEntry, _super);
    function VolsegEntry() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VolsegEntry;
}(PluginStateObject.CreateBehavior({ name: 'Vol & Seg Entry' })));
export { VolsegEntry };
var VolsegEntryData = /** @class */ (function (_super) {
    __extends(VolsegEntryData, _super);
    function VolsegEntryData(plugin, params) {
        var _this = _super.call(this, plugin, params) || this;
        _this.ref = '';
        _this.volumeData = new VolsegVolumeData(_this);
        _this.latticeSegmentationData = new VolsegLatticeSegmentationData(_this);
        _this.meshSegmentationData = new VolsegMeshSegmentationData(_this);
        _this.modelData = new VolsegModelData(_this);
        _this.highlightRequest = new Subject();
        _this.getStateNode = lazyGetter(function () { return _this.plugin.state.data.selectQ(function (q) { return q.byRef(_this.ref).subtree().ofType(VolsegState); })[0]; }, 'Missing VolsegState node. Must first create VolsegState for this VolsegEntry.');
        _this.currentState = new BehaviorSubject(ParamDefinition.getDefaultValues(VolsegStateParams));
        _this.currentVolume = new BehaviorSubject(undefined);
        _this.labelProvider = {
            label: function (loci) {
                var segmentId = _this.getSegmentIdFromLoci(loci);
                if (segmentId === undefined)
                    return;
                var segment = _this.metadata.getSegment(segmentId);
                if (!segment)
                    return;
                var annotLabels = segment.biological_annotation.external_references.map(function (annot) { return "".concat(applyEllipsis(annot.label), " [").concat(annot.resource, ":").concat(annot.accession, "]"); });
                if (annotLabels.length === 0)
                    return;
                if (annotLabels.length > MAX_ANNOTATIONS_IN_LABEL + 1) {
                    var nHidden = annotLabels.length - MAX_ANNOTATIONS_IN_LABEL;
                    annotLabels.length = MAX_ANNOTATIONS_IN_LABEL;
                    annotLabels.push("(".concat(nHidden, " more annotations, click on the segment to see all)"));
                }
                return '<hr class="msp-highlight-info-hr"/>' + annotLabels.filter(isDefined).join('<br/>');
            }
        };
        _this.plugin = plugin;
        _this.api = new VolumeApiV2(params.serverUrl);
        _this.source = params.source;
        _this.entryId = params.entryId;
        _this.entryNumber = splitEntryId(_this.entryId).entryNumber;
        return _this;
    }
    VolsegEntryData.prototype.initialize = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var metadata, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.api.getMetadata(this.source, this.entryId)];
                    case 1:
                        metadata = _c.sent();
                        this.metadata = new MetadataWrapper(metadata);
                        _b = this;
                        return [4 /*yield*/, ExternalAPIs.getPdbIdsForEmdbEntry((_a = this.metadata.raw.grid.general.source_db_id) !== null && _a !== void 0 ? _a : this.entryId)];
                    case 2:
                        _b.pdbs = _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    VolsegEntryData.create = function (plugin, params) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = new VolsegEntryData(plugin, params);
                        return [4 /*yield*/, result.initialize()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    VolsegEntryData.prototype.register = function (ref) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var params, volumeVisual, volumeRef;
            var _this = this;
            return __generator(this, function (_b) {
                this.ref = ref;
                this.plugin.managers.lociLabels.addProvider(this.labelProvider);
                try {
                    params = (_a = this.getStateNode().obj) === null || _a === void 0 ? void 0 : _a.data;
                    if (params) {
                        this.currentState.next(params);
                    }
                }
                catch (_c) {
                    // do nothing
                }
                volumeVisual = this.findNodesByTags(VOLUME_VISUAL_TAG)[0];
                if (volumeVisual)
                    this.currentVolume.next(volumeVisual.transform);
                this.subscribeObservable(this.plugin.state.data.events.cell.stateUpdated, function (e) {
                    var _a, _b;
                    try {
                        (_this.getStateNode());
                    }
                    catch (_c) {
                        return;
                    } // if state not does not exist yet
                    if (e.cell.transform.ref === _this.getStateNode().transform.ref) {
                        var newState = (_a = _this.getStateNode().obj) === null || _a === void 0 ? void 0 : _a.data;
                        if (newState && !shallowEqualObjects(newState, _this.currentState.value)) { // avoid repeated update
                            _this.currentState.next(newState);
                        }
                    }
                    else if ((_b = e.cell.transform.tags) === null || _b === void 0 ? void 0 : _b.includes(VOLUME_VISUAL_TAG)) {
                        if (e.ref === volumeRef) {
                            _this.currentVolume.next(e.cell.transform);
                        }
                        else if (StateSelection.findAncestor(_this.plugin.state.data.tree, _this.plugin.state.data.cells, e.ref, function (a) { return a.transform.ref === ref; })) {
                            volumeRef = e.ref;
                            _this.currentVolume.next(e.cell.transform);
                        }
                    }
                });
                this.subscribeObservable(this.plugin.state.data.events.cell.removed, function (e) {
                    if (e.ref === volumeRef) {
                        volumeRef = undefined;
                        _this.currentVolume.next(undefined);
                    }
                });
                this.subscribeObservable(this.plugin.behaviors.interaction.click, function (e) { return __awaiter(_this, void 0, void 0, function () {
                    var loci, clickedSegment;
                    return __generator(this, function (_a) {
                        loci = e.current.loci;
                        clickedSegment = this.getSegmentIdFromLoci(loci);
                        if (clickedSegment === undefined)
                            return [2 /*return*/];
                        if (clickedSegment === this.currentState.value.selectedSegment) {
                            this.actionSelectSegment(undefined);
                        }
                        else {
                            this.actionSelectSegment(clickedSegment);
                        }
                        return [2 /*return*/];
                    });
                }); });
                this.subscribeObservable(this.highlightRequest.pipe(throttleTime(50, undefined, { leading: true, trailing: true })), function (segment) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.highlightSegment(segment)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                }); }); });
                this.subscribeObservable(this.currentState.pipe(distinctUntilChanged(function (a, b) { return a.selectedSegment === b.selectedSegment; })), function (state) { return __awaiter(_this, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!((_a = VolsegGlobalStateData.getGlobalState(this.plugin)) === null || _a === void 0 ? void 0 : _a.selectionMode)) return [3 /*break*/, 2];
                                return [4 /*yield*/, this.selectSegment(state.selectedSegment)];
                            case 1:
                                _b.sent();
                                _b.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    VolsegEntryData.prototype.unregister = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.plugin.managers.lociLabels.removeProvider(this.labelProvider);
                return [2 /*return*/];
            });
        });
    };
    VolsegEntryData.prototype.loadVolume = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, isovalue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.volumeData.loadVolume()];
                    case 1:
                        result = _a.sent();
                        if (!result) return [3 /*break*/, 3];
                        isovalue = result.isovalue.kind === 'relative' ? result.isovalue.relativeValue : result.isovalue.absoluteValue;
                        return [4 /*yield*/, this.updateStateNode({ volumeIsovalueKind: result.isovalue.kind, volumeIsovalueValue: isovalue })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    VolsegEntryData.prototype.loadSegmentations = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.latticeSegmentationData.loadSegmentation()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.meshSegmentationData.loadSegmentation()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.actionShowSegments(this.metadata.allSegmentIds)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    VolsegEntryData.prototype.actionHighlightSegment = function (segment) {
        this.highlightRequest.next(segment);
    };
    VolsegEntryData.prototype.actionToggleSegment = function (segment) {
        return __awaiter(this, void 0, void 0, function () {
            var current;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        current = this.currentState.value.visibleSegments.map(function (seg) { return seg.segmentId; });
                        if (!current.includes(segment)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.actionShowSegments(current.filter(function (s) { return s !== segment; }))];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.actionShowSegments(__spreadArray(__spreadArray([], current, true), [segment], false))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    VolsegEntryData.prototype.actionToggleAllSegments = function () {
        return __awaiter(this, void 0, void 0, function () {
            var current;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        current = this.currentState.value.visibleSegments.map(function (seg) { return seg.segmentId; });
                        if (!(current.length !== this.metadata.allSegments.length)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.actionShowSegments(this.metadata.allSegmentIds)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.actionShowSegments([])];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    VolsegEntryData.prototype.actionSelectSegment = function (segment) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(segment !== undefined && this.currentState.value.visibleSegments.find(function (s) { return s.segmentId === segment; }) === undefined)) return [3 /*break*/, 2];
                        // first make the segment visible if it is not
                        return [4 /*yield*/, this.actionToggleSegment(segment)];
                    case 1:
                        // first make the segment visible if it is not
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.updateStateNode({ selectedSegment: segment })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    VolsegEntryData.prototype.actionSetOpacity = function (opacity) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (opacity === ((_a = this.getStateNode().obj) === null || _a === void 0 ? void 0 : _a.data.segmentOpacity))
                            return [2 /*return*/];
                        this.latticeSegmentationData.updateOpacity(opacity);
                        this.meshSegmentationData.updateOpacity(opacity);
                        return [4 /*yield*/, this.updateStateNode({ segmentOpacity: opacity })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    VolsegEntryData.prototype.actionShowFittedModel = function (pdbIds) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.modelData.showPdbs(pdbIds)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.updateStateNode({ visibleModels: pdbIds.map(function (pdbId) { return ({ pdbId: pdbId }); }) })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    VolsegEntryData.prototype.actionSetVolumeVisual = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.volumeData.setVolumeVisual(type)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.updateStateNode({ volumeType: type })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    VolsegEntryData.prototype.actionUpdateVolumeVisual = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.volumeData.updateVolumeVisual(params)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.updateStateNode({
                                volumeType: params.volumeType,
                                volumeOpacity: params.opacity,
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    VolsegEntryData.prototype.actionShowSegments = function (segments) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.latticeSegmentationData.showSegments(segments)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.meshSegmentationData.showSegments(segments)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.updateStateNode({ visibleSegments: segments.map(function (s) { return ({ segmentId: s }); }) })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    VolsegEntryData.prototype.highlightSegment = function (segment) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, PluginCommands.Interactivity.ClearHighlights(this.plugin)];
                    case 1:
                        _a.sent();
                        if (!segment) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.latticeSegmentationData.highlightSegment(segment)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.meshSegmentationData.highlightSegment(segment)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    VolsegEntryData.prototype.selectSegment = function (segment) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.plugin.managers.interactivity.lociSelects.deselectAll();
                        return [4 /*yield*/, this.latticeSegmentationData.selectSegment(segment)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.meshSegmentationData.selectSegment(segment)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.highlightSegment()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    VolsegEntryData.prototype.updateStateNode = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var oldParams, newParams, state, update;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        oldParams = this.getStateNode().transform.params;
                        newParams = __assign(__assign({}, oldParams), params);
                        state = this.plugin.state.data;
                        update = state.build().to(this.getStateNode().transform.ref).update(newParams);
                        return [4 /*yield*/, PluginCommands.State.Update(this.plugin, { state: state, tree: update, options: { doNotUpdateCurrent: true } })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** Find the nodes under this entry root which have all of the given tags. */
    VolsegEntryData.prototype.findNodesByTags = function () {
        var _this = this;
        var tags = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tags[_i] = arguments[_i];
        }
        return this.plugin.state.data.selectQ(function (q) {
            var builder = q.byRef(_this.ref).subtree();
            for (var _i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
                var tag = tags_1[_i];
                builder = builder.withTag(tag);
            }
            return builder;
        });
    };
    VolsegEntryData.prototype.newUpdate = function () {
        if (this.ref !== '') {
            return this.plugin.build().to(this.ref);
        }
        else {
            return this.plugin.build().toRoot();
        }
    };
    VolsegEntryData.prototype.getSegmentIdFromLoci = function (loci) {
        var _a;
        if (Volume.Segment.isLoci(loci) && loci.volume._propertyData.ownerId === this.ref) {
            if (loci.segments.length === 1) {
                return loci.segments[0];
            }
        }
        if (ShapeGroup.isLoci(loci)) {
            var meshData = ((_a = loci.shape.sourceData) !== null && _a !== void 0 ? _a : {});
            if (meshData.ownerId === this.ref && meshData.segmentId !== undefined) {
                return meshData.segmentId;
            }
        }
    };
    VolsegEntryData.prototype.setTryUseGpu = function (tryUseGpu) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.volumeData.setTryUseGpu(tryUseGpu),
                            this.latticeSegmentationData.setTryUseGpu(tryUseGpu),
                        ])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    VolsegEntryData.prototype.setSelectionMode = function (selectSegments) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!selectSegments) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.selectSegment(this.currentState.value.selectedSegment)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        this.plugin.managers.interactivity.lociSelects.deselectAll();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return VolsegEntryData;
}(PluginBehavior.WithSubscribers));
export { VolsegEntryData };
