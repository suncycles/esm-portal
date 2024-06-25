/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { __assign, __awaiter, __generator } from "tslib";
import { Dnatco, DnatcoParams } from '../property';
import { CustomPropertyDescriptor } from '../../../mol-model/custom-property';
import { CustomModelProperty } from '../../../mol-model-props/common/custom-model-property';
import { PropertyWrapper } from '../../../mol-model-props/common/wrapper';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
export var NtCTubeParams = __assign({}, DnatcoParams);
function fromCif(ctx, model, props) {
    return __awaiter(this, void 0, void 0, function () {
        var info, data, steps;
        return __generator(this, function (_a) {
            info = PropertyWrapper.createInfo();
            data = Dnatco.getCifData(model);
            if (data === undefined)
                return [2 /*return*/, { value: { info: info, data: undefined } }];
            steps = Dnatco.getStepsFromCif(model, data.steps, data.stepsSummary);
            return [2 /*return*/, { value: { info: info, data: { data: steps } } }];
        });
    });
}
export var NtCTubeProvider = CustomModelProperty.createProvider({
    label: 'NtC Tube',
    descriptor: CustomPropertyDescriptor({
        name: 'ntc-tube',
    }),
    type: 'static',
    defaultParams: NtCTubeParams,
    getParams: function (data) { return NtCTubeParams; },
    isApplicable: function (data) { return Dnatco.isApplicable(data); },
    obtain: function (ctx, data, props) { return __awaiter(void 0, void 0, void 0, function () {
        var p;
        return __generator(this, function (_a) {
            p = __assign(__assign({}, PD.getDefaultValues(NtCTubeParams)), props);
            return [2 /*return*/, fromCif(ctx, data, p)];
        });
    }); }
});
