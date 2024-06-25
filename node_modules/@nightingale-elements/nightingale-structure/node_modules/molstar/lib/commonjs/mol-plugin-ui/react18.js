"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPluginUI = void 0;
var tslib_1 = require("tslib");
var react_1 = require("react");
var client_1 = require("react-dom/client");
var plugin_1 = require("./plugin");
var context_1 = require("./context");
var spec_1 = require("./spec");
function createPluginUI(target, spec, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var ctx, _a;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    ctx = new context_1.PluginUIContext(spec || (0, spec_1.DefaultPluginUISpec)());
                    return [4 /*yield*/, ctx.init()];
                case 1:
                    _b.sent();
                    if (!(options === null || options === void 0 ? void 0 : options.onBeforeUIRender)) return [3 /*break*/, 3];
                    return [4 /*yield*/, options.onBeforeUIRender(ctx)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    (0, client_1.createRoot)(target).render((0, react_1.createElement)(plugin_1.Plugin, { plugin: ctx }));
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, ctx.canvas3dInitialized];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _a = _b.sent();
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, ctx];
            }
        });
    });
}
exports.createPluginUI = createPluginUI;
