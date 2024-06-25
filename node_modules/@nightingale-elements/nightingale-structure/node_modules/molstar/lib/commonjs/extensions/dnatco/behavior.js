"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DnatcoNtCs = void 0;
var tslib_1 = require("tslib");
var behavior_1 = require("../../mol-plugin/behavior/behavior");
var param_definition_1 = require("../../mol-util/param-definition");
var behavior_2 = require("./confal-pyramids/behavior");
var color_1 = require("./confal-pyramids/color");
var property_1 = require("./confal-pyramids/property");
var representation_1 = require("./confal-pyramids/representation");
var behavior_3 = require("./ntc-tube/behavior");
var color_2 = require("./ntc-tube/color");
var property_2 = require("./ntc-tube/property");
var representation_2 = require("./ntc-tube/representation");
exports.DnatcoNtCs = behavior_1.PluginBehavior.create({
    name: 'dnatco-ntcs',
    category: 'custom-props',
    display: {
        name: 'DNATCO NtC Annotations',
        description: 'DNATCO NtC Annotations',
    },
    ctor: /** @class */ (function (_super) {
        tslib_1.__extends(class_1, _super);
        function class_1() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        class_1.prototype.register = function () {
            this.ctx.customModelProperties.register(property_1.ConfalPyramidsProvider, this.params.autoAttach);
            this.ctx.customModelProperties.register(property_2.NtCTubeProvider, this.params.autoAttach);
            this.ctx.representation.structure.themes.colorThemeRegistry.add(color_1.ConfalPyramidsColorThemeProvider);
            this.ctx.representation.structure.registry.add(representation_1.ConfalPyramidsRepresentationProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.add(color_2.NtCTubeColorThemeProvider);
            this.ctx.representation.structure.registry.add(representation_2.NtCTubeRepresentationProvider);
            this.ctx.builders.structure.representation.registerPreset(behavior_2.ConfalPyramidsPreset);
            this.ctx.builders.structure.representation.registerPreset(behavior_3.NtCTubePreset);
        };
        class_1.prototype.unregister = function () {
            this.ctx.customModelProperties.unregister(property_1.ConfalPyramidsProvider.descriptor.name);
            this.ctx.customModelProperties.unregister(property_2.NtCTubeProvider.descriptor.name);
            this.ctx.representation.structure.registry.remove(representation_1.ConfalPyramidsRepresentationProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.remove(color_1.ConfalPyramidsColorThemeProvider);
            this.ctx.representation.structure.registry.remove(representation_2.NtCTubeRepresentationProvider);
            this.ctx.representation.structure.themes.colorThemeRegistry.remove(color_2.NtCTubeColorThemeProvider);
            this.ctx.builders.structure.representation.unregisterPreset(behavior_2.ConfalPyramidsPreset);
            this.ctx.builders.structure.representation.unregisterPreset(behavior_3.NtCTubePreset);
        };
        return class_1;
    }(behavior_1.PluginBehavior.Handler)),
    params: function () { return ({
        autoAttach: param_definition_1.ParamDefinition.Boolean(true),
        showToolTip: param_definition_1.ParamDefinition.Boolean(true)
    }); }
});
