"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NtCTubeProvider = exports.NtCTubeParams = void 0;
var tslib_1 = require("tslib");
var property_1 = require("../property");
var custom_property_1 = require("../../../mol-model/custom-property");
var custom_model_property_1 = require("../../../mol-model-props/common/custom-model-property");
var wrapper_1 = require("../../../mol-model-props/common/wrapper");
var param_definition_1 = require("../../../mol-util/param-definition");
exports.NtCTubeParams = tslib_1.__assign({}, property_1.DnatcoParams);
function fromCif(ctx, model, props) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var info, data, steps;
        return tslib_1.__generator(this, function (_a) {
            info = wrapper_1.PropertyWrapper.createInfo();
            data = property_1.Dnatco.getCifData(model);
            if (data === undefined)
                return [2 /*return*/, { value: { info: info, data: undefined } }];
            steps = property_1.Dnatco.getStepsFromCif(model, data.steps, data.stepsSummary);
            return [2 /*return*/, { value: { info: info, data: { data: steps } } }];
        });
    });
}
exports.NtCTubeProvider = custom_model_property_1.CustomModelProperty.createProvider({
    label: 'NtC Tube',
    descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
        name: 'ntc-tube',
    }),
    type: 'static',
    defaultParams: exports.NtCTubeParams,
    getParams: function (data) { return exports.NtCTubeParams; },
    isApplicable: function (data) { return property_1.Dnatco.isApplicable(data); },
    obtain: function (ctx, data, props) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var p;
        return tslib_1.__generator(this, function (_a) {
            p = tslib_1.__assign(tslib_1.__assign({}, param_definition_1.ParamDefinition.getDefaultValues(exports.NtCTubeParams)), props);
            return [2 /*return*/, fromCif(ctx, data, p)];
        });
    }); }
});
