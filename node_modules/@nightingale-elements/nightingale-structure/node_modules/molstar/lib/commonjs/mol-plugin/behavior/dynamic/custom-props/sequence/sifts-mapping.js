"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIFTSMapping = void 0;
var tslib_1 = require("tslib");
var int_1 = require("../../../../../mol-data/int");
var sifts_mapping_1 = require("../../../../../mol-model-props/sequence/sifts-mapping");
var sifts_mapping_2 = require("../../../../../mol-model-props/sequence/themes/sifts-mapping");
var structure_1 = require("../../../../../mol-model/structure");
var param_definition_1 = require("../../../../../mol-util/param-definition");
var behavior_1 = require("../../../behavior");
exports.SIFTSMapping = behavior_1.PluginBehavior.create({
    name: 'sifts-mapping-prop',
    category: 'custom-props',
    display: { name: 'SIFTS Mapping' },
    ctor: /** @class */ (function (_super) {
        tslib_1.__extends(class_1, _super);
        function class_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.provider = sifts_mapping_1.SIFTSMapping.Provider;
            _this.labelProvider = {
                label: function (loci) {
                    if (!_this.params.showTooltip)
                        return;
                    return bestDatabaseSequenceMappingLabel(loci);
                }
            };
            return _this;
        }
        class_1.prototype.update = function (p) {
            var updated = (this.params.autoAttach !== p.autoAttach ||
                this.params.showTooltip !== p.showTooltip);
            this.params.autoAttach = p.autoAttach;
            this.params.showTooltip = p.showTooltip;
            this.ctx.customStructureProperties.setDefaultAutoAttach(this.provider.descriptor.name, this.params.autoAttach);
            return updated;
        };
        class_1.prototype.register = function () {
            this.ctx.customModelProperties.register(this.provider, this.params.autoAttach);
            this.ctx.representation.structure.themes.colorThemeRegistry.add(sifts_mapping_2.SIFTSMappingColorThemeProvider);
            this.ctx.managers.lociLabels.addProvider(this.labelProvider);
        };
        class_1.prototype.unregister = function () {
            this.ctx.customModelProperties.unregister(this.provider.descriptor.name);
            this.ctx.representation.structure.themes.colorThemeRegistry.remove(sifts_mapping_2.SIFTSMappingColorThemeProvider);
            this.ctx.managers.lociLabels.removeProvider(this.labelProvider);
        };
        return class_1;
    }(behavior_1.PluginBehavior.Handler)),
    params: function () { return ({
        autoAttach: param_definition_1.ParamDefinition.Boolean(true),
        showTooltip: param_definition_1.ParamDefinition.Boolean(true)
    }); }
});
//
function bestDatabaseSequenceMappingLabel(loci) {
    if (loci.kind === 'element-loci') {
        if (loci.elements.length === 0)
            return;
        var e = loci.elements[0];
        var u = e.unit;
        var se = structure_1.StructureElement.Location.create(loci.structure, u, u.elements[int_1.OrderedSet.getAt(e.indices, 0)]);
        return sifts_mapping_1.SIFTSMapping.getLabel(se);
    }
}
