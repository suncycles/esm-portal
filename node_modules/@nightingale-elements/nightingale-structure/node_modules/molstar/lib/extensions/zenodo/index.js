/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __extends } from "tslib";
import { PluginBehavior } from '../../mol-plugin/behavior/behavior';
import { ZenodoImportUI } from './ui';
export var ZenodoImport = PluginBehavior.create({
    name: 'extension-zenodo-import',
    category: 'misc',
    display: {
        name: 'Zenodo Export'
    },
    ctor: /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        class_1.prototype.register = function () {
            this.ctx.customImportControls.set('zenodo-import', ZenodoImportUI);
        };
        class_1.prototype.update = function () {
            return false;
        };
        class_1.prototype.unregister = function () {
            this.ctx.customImportControls.delete('zenodo-import');
        };
        return class_1;
    }(PluginBehavior.Handler)),
    params: function () { return ({}); }
});
