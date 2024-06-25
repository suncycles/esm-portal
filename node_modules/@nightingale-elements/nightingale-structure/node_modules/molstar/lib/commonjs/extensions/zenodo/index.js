"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZenodoImport = void 0;
var tslib_1 = require("tslib");
var behavior_1 = require("../../mol-plugin/behavior/behavior");
var ui_1 = require("./ui");
exports.ZenodoImport = behavior_1.PluginBehavior.create({
    name: 'extension-zenodo-import',
    category: 'misc',
    display: {
        name: 'Zenodo Export'
    },
    ctor: /** @class */ (function (_super) {
        tslib_1.__extends(class_1, _super);
        function class_1() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        class_1.prototype.register = function () {
            this.ctx.customImportControls.set('zenodo-import', ui_1.ZenodoImportUI);
        };
        class_1.prototype.update = function () {
            return false;
        };
        class_1.prototype.unregister = function () {
            this.ctx.customImportControls.delete('zenodo-import');
        };
        return class_1;
    }(behavior_1.PluginBehavior.Handler)),
    params: function () { return ({}); }
});
