/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { __assign, __awaiter, __generator } from "tslib";
import { Dnatco, DnatcoParams } from '../property';
import { CustomPropertyDescriptor } from '../../../mol-model/custom-property';
import { CustomModelProperty } from '../../../mol-model-props/common/custom-model-property';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
export var ConfalPyramidsParams = __assign({}, DnatcoParams);
export var ConfalPyramidsProvider = CustomModelProperty.createProvider({
    label: 'Confal Pyramids',
    descriptor: CustomPropertyDescriptor({
        name: 'confal_pyramids',
    }),
    type: 'static',
    defaultParams: ConfalPyramidsParams,
    getParams: function (data) { return ConfalPyramidsParams; },
    isApplicable: function (data) { return Dnatco.isApplicable(data); },
    obtain: function (ctx, data, props) { return __awaiter(void 0, void 0, void 0, function () {
        var p;
        return __generator(this, function (_a) {
            p = __assign(__assign({}, PD.getDefaultValues(ConfalPyramidsParams)), props);
            return [2 /*return*/, Dnatco.fromCif(ctx, data, p)];
        });
    }); }
});
