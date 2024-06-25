/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
import { Download, ParseCif } from '../../mol-plugin-state/transforms/data';
import { CreateGroup } from '../../mol-plugin-state/transforms/misc';
import { TrajectoryFromMmCif } from '../../mol-plugin-state/transforms/model';
import { setSubtreeVisibility } from '../../mol-plugin/behavior/static/state';
var VolsegModelData = /** @class */ (function () {
    function VolsegModelData(rootData) {
        this.entryData = rootData;
    }
    VolsegModelData.prototype.loadPdb = function (pdbId, parent) {
        return __awaiter(this, void 0, void 0, function () {
            var url, dataNode, cifNode, trajectoryNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "https://www.ebi.ac.uk/pdbe/entry-files/download/".concat(pdbId, ".bcif");
                        return [4 /*yield*/, this.entryData.plugin.build().to(parent).apply(Download, { url: url, isBinary: true }, { tags: ['fitted-model-data', "pdbid-".concat(pdbId)] }).commit()];
                    case 1:
                        dataNode = _a.sent();
                        return [4 /*yield*/, this.entryData.plugin.build().to(dataNode).apply(ParseCif).commit()];
                    case 2:
                        cifNode = _a.sent();
                        return [4 /*yield*/, this.entryData.plugin.build().to(cifNode).apply(TrajectoryFromMmCif).commit()];
                    case 3:
                        trajectoryNode = _a.sent();
                        return [4 /*yield*/, this.entryData.plugin.builders.structure.hierarchy.applyPreset(trajectoryNode, 'default', { representationPreset: 'polymer-cartoon' })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, dataNode];
                }
            });
        });
    };
    VolsegModelData.prototype.showPdbs = function (pdbIds) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var segmentsToShow, visuals, _i, visuals_1, visual, theTag, id, visibility, segmentsToCreate, group, newGroupNode, awaiting, _d, segmentsToCreate_1, pdbId, _e, awaiting_1, promise;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        segmentsToShow = new Set(pdbIds);
                        visuals = this.entryData.findNodesByTags('fitted-model-data');
                        for (_i = 0, visuals_1 = visuals; _i < visuals_1.length; _i++) {
                            visual = visuals_1[_i];
                            theTag = (_b = (_a = visual.obj) === null || _a === void 0 ? void 0 : _a.tags) === null || _b === void 0 ? void 0 : _b.find(function (tag) { return tag.startsWith('pdbid-'); });
                            if (!theTag)
                                continue;
                            id = theTag.split('-')[1];
                            visibility = segmentsToShow.has(id);
                            setSubtreeVisibility(this.entryData.plugin.state.data, visual.transform.ref, !visibility); // true means hide, ¯\_(ツ)_/¯
                            segmentsToShow.delete(id);
                        }
                        segmentsToCreate = Array.from(segmentsToShow);
                        if (segmentsToCreate.length === 0)
                            return [2 /*return*/];
                        group = (_c = this.entryData.findNodesByTags('fitted-models-group')[0]) === null || _c === void 0 ? void 0 : _c.transform.ref;
                        if (!!group) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.entryData.newUpdate().apply(CreateGroup, { label: 'Fitted Models' }, { tags: ['fitted-models-group'], state: { isCollapsed: true } }).commit()];
                    case 1:
                        newGroupNode = _f.sent();
                        group = newGroupNode.ref;
                        _f.label = 2;
                    case 2:
                        awaiting = [];
                        for (_d = 0, segmentsToCreate_1 = segmentsToCreate; _d < segmentsToCreate_1.length; _d++) {
                            pdbId = segmentsToCreate_1[_d];
                            awaiting.push(this.loadPdb(pdbId, group));
                        }
                        _e = 0, awaiting_1 = awaiting;
                        _f.label = 3;
                    case 3:
                        if (!(_e < awaiting_1.length)) return [3 /*break*/, 6];
                        promise = awaiting_1[_e];
                        return [4 /*yield*/, promise];
                    case 4:
                        _f.sent();
                        _f.label = 5;
                    case 5:
                        _e++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return VolsegModelData;
}());
export { VolsegModelData };
