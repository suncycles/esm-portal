"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfalPyramidsProvider = exports.ConfalPyramidsParams = void 0;
var tslib_1 = require("tslib");
var property_1 = require("../property");
var custom_property_1 = require("../../../mol-model/custom-property");
var custom_model_property_1 = require("../../../mol-model-props/common/custom-model-property");
var param_definition_1 = require("../../../mol-util/param-definition");
exports.ConfalPyramidsParams = tslib_1.__assign({}, property_1.DnatcoParams);
exports.ConfalPyramidsProvider = custom_model_property_1.CustomModelProperty.createProvider({
    label: 'Confal Pyramids',
    descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
        name: 'confal_pyramids',
    }),
    type: 'static',
    defaultParams: exports.ConfalPyramidsParams,
    getParams: function (data) { return exports.ConfalPyramidsParams; },
    isApplicable: function (data) { return property_1.Dnatco.isApplicable(data); },
    obtain: function (ctx, data, props) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var p;
        return tslib_1.__generator(this, function (_a) {
            p = tslib_1.__assign(tslib_1.__assign({}, param_definition_1.ParamDefinition.getDefaultValues(exports.ConfalPyramidsParams)), props);
            return [2 /*return*/, property_1.Dnatco.fromCif(ctx, data, p)];
        });
    }); }
});
