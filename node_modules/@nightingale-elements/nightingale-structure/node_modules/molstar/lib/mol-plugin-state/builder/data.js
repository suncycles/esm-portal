/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
import { Download, ReadFile, DownloadBlob, RawData } from '../transforms/data';
import { getFileNameInfo } from '../../mol-util/file-info';
var DataBuilder = /** @class */ (function () {
    function DataBuilder(plugin) {
        this.plugin = plugin;
    }
    Object.defineProperty(DataBuilder.prototype, "dataState", {
        get: function () {
            return this.plugin.state.data;
        },
        enumerable: false,
        configurable: true
    });
    DataBuilder.prototype.rawData = function (params, options) {
        var data = this.dataState.build().toRoot().apply(RawData, params, options);
        return data.commit({ revertOnError: true });
    };
    DataBuilder.prototype.download = function (params, options) {
        var data = this.dataState.build().toRoot().apply(Download, params, options);
        return data.commit({ revertOnError: true });
    };
    DataBuilder.prototype.downloadBlob = function (params, options) {
        var data = this.dataState.build().toRoot().apply(DownloadBlob, params, options);
        return data.commit({ revertOnError: true });
    };
    DataBuilder.prototype.readFile = function (params, options) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var data, fileInfo;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.dataState.build().toRoot().apply(ReadFile, params, options).commit({ revertOnError: true })];
                    case 1:
                        data = _d.sent();
                        fileInfo = getFileNameInfo((_c = (_b = (_a = params.file) === null || _a === void 0 ? void 0 : _a.file) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : '');
                        return [2 /*return*/, { data: data, fileInfo: fileInfo }];
                }
            });
        });
    };
    return DataBuilder;
}());
export { DataBuilder };
