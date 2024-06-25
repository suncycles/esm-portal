/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { __assign, __awaiter, __extends, __generator } from "tslib";
import { distinctUntilChanged, map } from 'rxjs';
import { CIF } from '../../../mol-io/reader/cif';
import { Box3D } from '../../../mol-math/geometry';
import { PluginStateObject } from '../../../mol-plugin-state/objects';
import { PluginBehavior } from '../../../mol-plugin/behavior';
import { PluginCommands } from '../../../mol-plugin/commands';
import { UUID } from '../../../mol-util';
import { Asset } from '../../../mol-util/assets';
import { ColorNames } from '../../../mol-util/color/names';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Choice } from '../../volumes-and-segmentations/helpers';
import { MetadataWrapper } from '../../volumes-and-segmentations/volseg-api/utils';
import { MeshlistData } from '../mesh-extension';
var DEFAULT_SEGMENT_NAME = 'Untitled segment';
var DEFAULT_SEGMENT_COLOR = ColorNames.lightgray;
export var NO_SEGMENT = -1;
/** Maximum (worst) detail level available in GUI (TODO set actual maximum possible value) */
var MAX_DETAIL = 10;
var DEFAULT_DETAIL = 7; // TODO decide a reasonable default
/** Segments whose bounding box volume is above this value (relative to the overall bounding box) are considered as background segments */
export var BACKGROUND_SEGMENT_VOLUME_THRESHOLD = 0.5;
var MeshStreaming = /** @class */ (function (_super) {
    __extends(MeshStreaming, _super);
    function MeshStreaming() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MeshStreaming;
}(PluginStateObject.CreateBehavior({ name: 'Mesh Streaming' })));
export { MeshStreaming };
(function (MeshStreaming) {
    var Params;
    (function (Params) {
        Params.ViewTypeChoice = new Choice({ off: 'Off', select: 'Select', all: 'All' }, 'select'); // TODO add camera target?
        function create(options) {
            return {
                view: PD.MappedStatic('select', {
                    'off': PD.Group({}),
                    'select': PD.Group({
                        baseDetail: PD.Numeric(DEFAULT_DETAIL, { min: 1, max: MAX_DETAIL, step: 1 }, { description: 'Detail level for the non-selected segments (lower number = better)' }),
                        focusDetail: PD.Numeric(1, { min: 1, max: MAX_DETAIL, step: 1 }, { description: 'Detail level for the selected segment (lower number = better)' }),
                        selectedSegment: PD.Numeric(NO_SEGMENT, {}, { isHidden: true }),
                    }, { isFlat: true }),
                    'all': PD.Group({
                        detail: PD.Numeric(DEFAULT_DETAIL, { min: 1, max: MAX_DETAIL, step: 1 }, { description: 'Detail level for all segments (lower number = better)' })
                    }, { isFlat: true }),
                }, { description: '"Off" hides all segments. \n"Select" shows all segments in lower detail, clicked segment in better detail. "All" shows all segment in the same level.' }),
            };
        }
        Params.create = create;
        function copyValues(params) {
            return {
                view: {
                    name: params.view.name,
                    params: __assign({}, params.view.params),
                }
            };
        }
        Params.copyValues = copyValues;
        function valuesEqual(p, q) {
            if (p.view.name !== q.view.name)
                return false;
            for (var key in p.view.params) {
                if (p.view.params[key] !== q.view.params[key])
                    return false;
            }
            return true;
        }
        Params.valuesEqual = valuesEqual;
        function detailsEqual(p, q) {
            switch (p.view.name) {
                case 'off':
                    return q.view.name === 'off';
                case 'select':
                    return q.view.name === 'select' && p.view.params.baseDetail === q.view.params.baseDetail && p.view.params.focusDetail === q.view.params.focusDetail;
                case 'all':
                    return q.view.name === 'all' && p.view.params.detail === q.view.params.detail;
                default:
                    throw new Error('Not implemented');
            }
        }
        Params.detailsEqual = detailsEqual;
    })(Params = MeshStreaming.Params || (MeshStreaming.Params = {}));
    var VisualInfo;
    (function (VisualInfo) {
        VisualInfo.DetailTypes = ['low', 'high'];
        function tagFor(segmentId, detail) {
            return "".concat(detail, "-").concat(segmentId);
        }
        VisualInfo.tagFor = tagFor;
    })(VisualInfo = MeshStreaming.VisualInfo || (MeshStreaming.VisualInfo = {}));
    var Behavior = /** @class */ (function (_super) {
        __extends(Behavior, _super);
        function Behavior(plugin, data, params) {
            var _this = _super.call(this, plugin, params) || this;
            _this.ref = '';
            _this.backgroundSegments = {};
            _this.focusObservable = _this.plugin.behaviors.interaction.click.pipe(// QUESTION is this OK way to get focused segment?
            map(function (evt) { return evt.current.loci; }), map(function (loci) { return (loci.kind === 'group-loci') ? loci.shape.sourceData : null; }), map(function (data) { return ((data === null || data === void 0 ? void 0 : data.ownerId) === _this.id) ? data : null; }), // do not process shapes created by others
            distinctUntilChanged(function (old, current) { return (old === null || old === void 0 ? void 0 : old.segmentId) === (current === null || current === void 0 ? void 0 : current.segmentId); }));
            _this.focusSubscription = undefined;
            _this.backgroundSegmentsInitialized = false;
            _this.id = UUID.create22();
            _this.parentData = data;
            return _this;
        }
        Behavior.prototype.register = function (ref) {
            this.ref = ref;
        };
        Behavior.prototype.unregister = function () {
            if (this.focusSubscription) {
                this.focusSubscription.unsubscribe();
                this.focusSubscription = undefined;
            }
            // TODO empty cache here (if used)
        };
        Behavior.prototype.selectSegment = function (segmentId) {
            if (this.params.view.name === 'select') {
                if (this.params.view.params.selectedSegment === segmentId)
                    return;
                var newParams = Params.copyValues(this.params);
                if (newParams.view.name === 'select') {
                    newParams.view.params.selectedSegment = segmentId;
                }
                var state = this.plugin.state.data;
                var update = state.build().to(this.ref).update(newParams);
                PluginCommands.State.Update(this.plugin, { state: state, tree: update, options: { doNotUpdateCurrent: true } });
            }
        };
        Behavior.prototype.update = function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var oldParams, response, rawMetadata, _a;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            oldParams = this.params;
                            this.params = params;
                            if (!!this.metadata) return [3 /*break*/, 3];
                            return [4 /*yield*/, fetch(this.getMetadataUrl())];
                        case 1:
                            response = _b.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            rawMetadata = _b.sent();
                            this.metadata = new MetadataWrapper(rawMetadata);
                            _b.label = 3;
                        case 3:
                            if (!this.visuals) {
                                this.initVisualInfos();
                            }
                            else if (!Params.detailsEqual(this.params, oldParams)) {
                                this.updateVisualInfoDetails();
                            }
                            _a = params.view.name;
                            switch (_a) {
                                case 'off': return [3 /*break*/, 4];
                                case 'select': return [3 /*break*/, 6];
                                case 'all': return [3 /*break*/, 8];
                            }
                            return [3 /*break*/, 10];
                        case 4: return [4 /*yield*/, this.disableVisuals()];
                        case 5:
                            _b.sent();
                            return [3 /*break*/, 11];
                        case 6: return [4 /*yield*/, this.enableVisuals(params.view.params.selectedSegment)];
                        case 7:
                            _b.sent();
                            return [3 /*break*/, 11];
                        case 8: return [4 /*yield*/, this.enableVisuals()];
                        case 9:
                            _b.sent();
                            return [3 /*break*/, 11];
                        case 10: throw new Error('Not implemented');
                        case 11:
                            if (params.view.name !== 'off' && !this.backgroundSegmentsInitialized) {
                                this.guessBackgroundSegments();
                                this.backgroundSegmentsInitialized = true;
                            }
                            if (params.view.name === 'select' && !this.focusSubscription) {
                                this.focusSubscription = this.subscribeObservable(this.focusObservable, function (data) { var _a; _this.selectSegment((_a = data === null || data === void 0 ? void 0 : data.segmentId) !== null && _a !== void 0 ? _a : NO_SEGMENT); });
                            }
                            else if (params.view.name !== 'select' && this.focusSubscription) {
                                this.focusSubscription.unsubscribe();
                                this.focusSubscription = undefined;
                            }
                            return [2 /*return*/, true];
                    }
                });
            });
        };
        Behavior.prototype.getMetadataUrl = function () {
            return "".concat(this.parentData.serverUrl, "/").concat(this.parentData.source, "/").concat(this.parentData.entryId, "/metadata");
        };
        Behavior.prototype.getMeshUrl = function (segment, detail) {
            return "".concat(this.parentData.serverUrl, "/").concat(this.parentData.source, "/").concat(this.parentData.entryId, "/mesh_bcif/").concat(segment, "/").concat(detail);
        };
        Behavior.prototype.initVisualInfos = function () {
            var _a, _b, _c, _d, _e;
            var visuals = {};
            for (var _i = 0, _f = this.metadata.meshSegmentIds; _i < _f.length; _i++) {
                var segid = _f[_i];
                var name_1 = (_c = (_b = (_a = this.metadata) === null || _a === void 0 ? void 0 : _a.getSegment(segid)) === null || _b === void 0 ? void 0 : _b.biological_annotation.name) !== null && _c !== void 0 ? _c : DEFAULT_SEGMENT_NAME;
                var color = (_e = (_d = this.metadata) === null || _d === void 0 ? void 0 : _d.getSegmentColor(segid)) !== null && _e !== void 0 ? _e : DEFAULT_SEGMENT_COLOR;
                for (var _g = 0, _h = VisualInfo.DetailTypes; _g < _h.length; _g++) {
                    var detailType = _h[_g];
                    var visual = {
                        tag: VisualInfo.tagFor(segid, detailType),
                        segmentId: segid,
                        segmentName: name_1,
                        detailType: detailType,
                        detail: -1,
                        color: color,
                        visible: false,
                        data: undefined,
                    };
                    visuals[visual.tag] = visual;
                }
            }
            this.visuals = visuals;
            this.updateVisualInfoDetails();
        };
        Behavior.prototype.updateVisualInfoDetails = function () {
            var highDetail;
            var lowDetail;
            switch (this.params.view.name) {
                case 'off':
                    lowDetail = undefined;
                    highDetail = undefined;
                    break;
                case 'select':
                    lowDetail = this.params.view.params.baseDetail;
                    highDetail = this.params.view.params.focusDetail;
                    break;
                case 'all':
                    lowDetail = this.params.view.params.detail;
                    highDetail = undefined;
                    break;
            }
            for (var tag in this.visuals) {
                var visual = this.visuals[tag];
                var preferredDetail = (visual.detailType === 'high') ? highDetail : lowDetail;
                if (preferredDetail !== undefined) {
                    visual.detail = this.metadata.getSufficientMeshDetail(visual.segmentId, preferredDetail);
                }
            }
        };
        Behavior.prototype.enableVisuals = function (highDetailSegment) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, _c, _i, tag, visual, requiredDetailType, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _a = this.visuals;
                            _b = [];
                            for (_c in _a)
                                _b.push(_c);
                            _i = 0;
                            _e.label = 1;
                        case 1:
                            if (!(_i < _b.length)) return [3 /*break*/, 5];
                            _c = _b[_i];
                            if (!(_c in _a)) return [3 /*break*/, 4];
                            tag = _c;
                            visual = this.visuals[tag];
                            requiredDetailType = visual.segmentId === highDetailSegment ? 'high' : 'low';
                            if (!(visual.detailType === requiredDetailType)) return [3 /*break*/, 3];
                            _d = visual;
                            return [4 /*yield*/, this.getMeshData(visual)];
                        case 2:
                            _d.data = _e.sent();
                            visual.visible = true;
                            return [3 /*break*/, 4];
                        case 3:
                            visual.visible = false;
                            _e.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 1];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        Behavior.prototype.disableVisuals = function () {
            return __awaiter(this, void 0, void 0, function () {
                var tag, visual;
                return __generator(this, function (_a) {
                    for (tag in this.visuals) {
                        visual = this.visuals[tag];
                        visual.visible = false;
                    }
                    return [2 /*return*/];
                });
            });
        };
        /** Fetch data in current `visual.detail`, or return already fetched data (if available in the correct detail). */
        Behavior.prototype.getMeshData = function (visual) {
            return __awaiter(this, void 0, void 0, function () {
                var url, urlAsset, asset, parsed, meshlistData;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (visual.data && visual.data.detail === visual.detail) {
                                // Do not recreate
                                return [2 /*return*/, visual.data];
                            }
                            url = this.getMeshUrl(visual.segmentId, visual.detail);
                            urlAsset = Asset.getUrlAsset(this.plugin.managers.asset, url);
                            return [4 /*yield*/, this.plugin.runTask(this.plugin.managers.asset.resolve(urlAsset, 'binary'))];
                        case 1:
                            asset = _a.sent();
                            return [4 /*yield*/, this.plugin.runTask(CIF.parseBinary(asset.data))];
                        case 2:
                            parsed = _a.sent();
                            if (parsed.isError) {
                                throw new Error("Failed parsing CIF file from ".concat(url));
                            }
                            return [4 /*yield*/, MeshlistData.fromCIF(parsed.result, visual.segmentId, visual.segmentName, visual.detail)];
                        case 3:
                            meshlistData = _a.sent();
                            meshlistData.ownerId = this.id;
                            // const bbox = MeshlistData.bbox(meshlistData);
                            // const bboxVolume = bbox ? MS.Box3D.volume(bbox) : 0.0;
                            // console.log(`BBox ${visual.segmentId}: ${Math.round(bboxVolume! / 1e6)} M`, bbox); // DEBUG
                            return [2 /*return*/, meshlistData];
                    }
                });
            });
        };
        Behavior.prototype.guessBackgroundSegments = function () {
            return __awaiter(this, void 0, void 0, function () {
                var bboxes, tag, visual, bbox, totalBbox, totalVolume, isBgSegment, segid, bbox, bboxVolume;
                return __generator(this, function (_a) {
                    bboxes = {};
                    for (tag in this.visuals) {
                        visual = this.visuals[tag];
                        if (visual.detailType === 'low' && visual.data) {
                            bbox = MeshlistData.bbox(visual.data);
                            if (bbox) {
                                bboxes[visual.segmentId] = bbox;
                            }
                        }
                    }
                    totalBbox = MeshlistData.combineBBoxes(Object.values(bboxes));
                    totalVolume = totalBbox ? Box3D.volume(totalBbox) : 0.0;
                    isBgSegment = {};
                    for (segid in bboxes) {
                        bbox = bboxes[segid];
                        bboxVolume = Box3D.volume(bbox);
                        isBgSegment[segid] = (bboxVolume > totalVolume * BACKGROUND_SEGMENT_VOLUME_THRESHOLD);
                        // console.log(`BBox ${segid}: ${Math.round(bboxVolume! / 1e6)} M, ${bboxVolume / totalVolume}`, bbox); // DEBUG
                    }
                    this.backgroundSegments = isBgSegment;
                    return [2 /*return*/];
                });
            });
        };
        Behavior.prototype.getDescription = function () {
            return Params.ViewTypeChoice.prettyName(this.params.view.name);
        };
        return Behavior;
    }(PluginBehavior.WithSubscribers));
    MeshStreaming.Behavior = Behavior;
})(MeshStreaming || (MeshStreaming = {}));
