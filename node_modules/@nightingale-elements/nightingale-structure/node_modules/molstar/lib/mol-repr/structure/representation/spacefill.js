/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { ElementSphereVisual, ElementSphereParams } from '../visual/element-sphere';
import { UnitsRepresentation } from '../units-representation';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { StructureRepresentationProvider, StructureRepresentationStateBuilder } from '../representation';
import { Representation } from '../../../mol-repr/representation';
import { BaseGeometry } from '../../../mol-geo/geometry/base';
var SpacefillVisuals = {
    'element-sphere': function (ctx, getParams) { return UnitsRepresentation('Sphere mesh', ctx, getParams, ElementSphereVisual); },
};
export var SpacefillParams = __assign(__assign({}, ElementSphereParams), { bumpFrequency: PD.Numeric(1, { min: 0, max: 10, step: 0.1 }, BaseGeometry.ShadingCategory) });
var CoarseGrainedSpacefillParams;
export function getSpacefillParams(ctx, structure) {
    if (structure.isCoarseGrained) {
        if (!CoarseGrainedSpacefillParams) {
            CoarseGrainedSpacefillParams = PD.clone(SpacefillParams);
            CoarseGrainedSpacefillParams.sizeFactor.defaultValue = 2;
        }
        return CoarseGrainedSpacefillParams;
    }
    return SpacefillParams;
}
export function SpacefillRepresentation(ctx, getParams) {
    return Representation.createMulti('Spacefill', ctx, getParams, StructureRepresentationStateBuilder, SpacefillVisuals);
}
export var SpacefillRepresentationProvider = StructureRepresentationProvider({
    name: 'spacefill',
    label: 'Spacefill',
    description: 'Displays atomic/coarse elements as spheres.',
    factory: SpacefillRepresentation,
    getParams: getSpacefillParams,
    defaultValues: PD.getDefaultValues(SpacefillParams),
    defaultColorTheme: { name: 'element-symbol' },
    defaultSizeTheme: { name: 'physical' },
    isApplicable: function (structure) { return structure.elementCount > 0; }
});
