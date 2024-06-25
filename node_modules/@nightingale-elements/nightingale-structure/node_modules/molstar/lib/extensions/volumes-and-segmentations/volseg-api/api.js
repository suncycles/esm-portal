/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
export var DEFAULT_VOLSEG_SERVER = 'https://molstarvolseg.ncbr.muni.cz/v2';
var VolumeApiV2 = /** @class */ (function () {
    function VolumeApiV2(volumeServerUrl) {
        if (volumeServerUrl === void 0) { volumeServerUrl = DEFAULT_VOLSEG_SERVER; }
        this.volumeServerUrl = volumeServerUrl.replace(/\/$/, ''); // trim trailing slash
    }
    VolumeApiV2.prototype.entryListUrl = function (maxEntries, keyword) {
        return "".concat(this.volumeServerUrl, "/list_entries/").concat(maxEntries, "/").concat(keyword !== null && keyword !== void 0 ? keyword : '');
    };
    VolumeApiV2.prototype.metadataUrl = function (source, entryId) {
        return "".concat(this.volumeServerUrl, "/").concat(source, "/").concat(entryId, "/metadata");
    };
    VolumeApiV2.prototype.volumeUrl = function (source, entryId, box, maxPoints) {
        if (box) {
            var _a = box[0], a1 = _a[0], a2 = _a[1], a3 = _a[2], _b = box[1], b1 = _b[0], b2 = _b[1], b3 = _b[2];
            return "".concat(this.volumeServerUrl, "/").concat(source, "/").concat(entryId, "/volume/box/").concat(a1, "/").concat(a2, "/").concat(a3, "/").concat(b1, "/").concat(b2, "/").concat(b3, "?max_points=").concat(maxPoints);
        }
        else {
            return "".concat(this.volumeServerUrl, "/").concat(source, "/").concat(entryId, "/volume/cell?max_points=").concat(maxPoints);
        }
    };
    VolumeApiV2.prototype.latticeUrl = function (source, entryId, segmentation, box, maxPoints) {
        if (box) {
            var _a = box[0], a1 = _a[0], a2 = _a[1], a3 = _a[2], _b = box[1], b1 = _b[0], b2 = _b[1], b3 = _b[2];
            return "".concat(this.volumeServerUrl, "/").concat(source, "/").concat(entryId, "/segmentation/box/").concat(segmentation, "/").concat(a1, "/").concat(a2, "/").concat(a3, "/").concat(b1, "/").concat(b2, "/").concat(b3, "?max_points=").concat(maxPoints);
        }
        else {
            return "".concat(this.volumeServerUrl, "/").concat(source, "/").concat(entryId, "/segmentation/cell/").concat(segmentation, "?max_points=").concat(maxPoints);
        }
    };
    VolumeApiV2.prototype.meshUrl_Json = function (source, entryId, segment, detailLevel) {
        return "".concat(this.volumeServerUrl, "/").concat(source, "/").concat(entryId, "/mesh/").concat(segment, "/").concat(detailLevel);
    };
    VolumeApiV2.prototype.meshUrl_Bcif = function (source, entryId, segment, detailLevel) {
        return "".concat(this.volumeServerUrl, "/").concat(source, "/").concat(entryId, "/mesh_bcif/").concat(segment, "/").concat(detailLevel);
    };
    VolumeApiV2.prototype.volumeInfoUrl = function (source, entryId) {
        return "".concat(this.volumeServerUrl, "/").concat(source, "/").concat(entryId, "/volume_info");
    };
    VolumeApiV2.prototype.getEntryList = function (maxEntries, keyword) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(this.entryListUrl(maxEntries, keyword))];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VolumeApiV2.prototype.getMetadata = function (source, entryId) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.metadataUrl(source, entryId);
                        return [4 /*yield*/, fetch(url)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to fetch metadata from ".concat(url));
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return VolumeApiV2;
}());
export { VolumeApiV2 };
