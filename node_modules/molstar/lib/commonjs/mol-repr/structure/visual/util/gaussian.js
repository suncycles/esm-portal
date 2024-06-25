"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeStructureGaussianDensityTexture2d = exports.computeStructureGaussianDensityTexture = exports.computeStructureGaussianDensity = exports.computeUnitGaussianDensityTexture2d = exports.computeUnitGaussianDensityTexture = exports.computeUnitGaussianDensity = exports.getTextureMaxCells = exports.DefaultGaussianDensityProps = exports.GaussianDensityParams = void 0;
const mol_task_1 = require("../../../../mol-task");
const param_definition_1 = require("../../../../mol-util/param-definition");
const gpu_1 = require("../../../../mol-math/geometry/gaussian-density/gpu");
const common_1 = require("./common");
const base_1 = require("../../../../mol-geo/geometry/base");
const cpu_1 = require("../../../../mol-math/geometry/gaussian-density/cpu");
exports.GaussianDensityParams = {
    resolution: param_definition_1.ParamDefinition.Numeric(1, { min: 0.1, max: 20, step: 0.1 }, { description: 'Grid resolution/cell spacing.', ...base_1.BaseGeometry.CustomQualityParamInfo }),
    radiusOffset: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 10, step: 0.1 }, { description: 'Extra/offset radius added to the atoms/coarse elements for gaussian calculation. Useful to create coarse, low resolution surfaces.' }),
    smoothness: param_definition_1.ParamDefinition.Numeric(1.5, { min: 0.5, max: 2.5, step: 0.1 }, { description: 'Smoothness of the gausian surface, lower is smoother.' }),
    ...common_1.CommonSurfaceParams
};
exports.DefaultGaussianDensityProps = param_definition_1.ParamDefinition.getDefaultValues(exports.GaussianDensityParams);
//
function getTextureMaxCells(webgl, structure) {
    const d = webgl.maxTextureSize / 3;
    return (d * d) / Math.max(1, (structure ? structure.units.length / 16 : 1));
}
exports.getTextureMaxCells = getTextureMaxCells;
//
function computeUnitGaussianDensity(structure, unit, sizeTheme, props) {
    const { position, boundary, radius } = (0, common_1.getUnitConformationAndRadius)(structure, unit, sizeTheme, props);
    const p = (0, common_1.ensureReasonableResolution)(boundary.box, props);
    return mol_task_1.Task.create('Gaussian Density', async (ctx) => {
        return await (0, cpu_1.GaussianDensityCPU)(ctx, position, boundary.box, radius, p);
    });
}
exports.computeUnitGaussianDensity = computeUnitGaussianDensity;
function computeUnitGaussianDensityTexture(structure, unit, sizeTheme, props, webgl, texture) {
    const { position, boundary, radius } = (0, common_1.getUnitConformationAndRadius)(structure, unit, sizeTheme, props);
    const p = (0, common_1.ensureReasonableResolution)(boundary.box, props, getTextureMaxCells(webgl, structure));
    return mol_task_1.Task.create('Gaussian Density', async (ctx) => {
        return (0, gpu_1.GaussianDensityTexture)(webgl, position, boundary.box, radius, p, texture);
    });
}
exports.computeUnitGaussianDensityTexture = computeUnitGaussianDensityTexture;
function computeUnitGaussianDensityTexture2d(structure, unit, sizeTheme, powerOfTwo, props, webgl, texture) {
    const { position, boundary, radius } = (0, common_1.getUnitConformationAndRadius)(structure, unit, sizeTheme, props);
    const p = (0, common_1.ensureReasonableResolution)(boundary.box, props, getTextureMaxCells(webgl, structure));
    return mol_task_1.Task.create('Gaussian Density', async (ctx) => {
        return (0, gpu_1.GaussianDensityTexture2d)(webgl, position, boundary.box, radius, powerOfTwo, p, texture);
    });
}
exports.computeUnitGaussianDensityTexture2d = computeUnitGaussianDensityTexture2d;
//
function computeStructureGaussianDensity(structure, sizeTheme, props) {
    const { position, boundary, radius } = (0, common_1.getStructureConformationAndRadius)(structure, sizeTheme, props);
    const p = (0, common_1.ensureReasonableResolution)(boundary.box, props);
    return mol_task_1.Task.create('Gaussian Density', async (ctx) => {
        return await (0, cpu_1.GaussianDensityCPU)(ctx, position, boundary.box, radius, p);
    });
}
exports.computeStructureGaussianDensity = computeStructureGaussianDensity;
function computeStructureGaussianDensityTexture(structure, sizeTheme, props, webgl, texture) {
    const { position, boundary, radius } = (0, common_1.getStructureConformationAndRadius)(structure, sizeTheme, props);
    const p = (0, common_1.ensureReasonableResolution)(boundary.box, props);
    return mol_task_1.Task.create('Gaussian Density', async (ctx) => {
        return (0, gpu_1.GaussianDensityTexture)(webgl, position, boundary.box, radius, p, texture);
    });
}
exports.computeStructureGaussianDensityTexture = computeStructureGaussianDensityTexture;
function computeStructureGaussianDensityTexture2d(structure, sizeTheme, powerOfTwo, props, webgl, texture) {
    const { box } = structure.lookup3d.boundary;
    const { position, boundary, radius } = (0, common_1.getStructureConformationAndRadius)(structure, sizeTheme, props);
    const p = (0, common_1.ensureReasonableResolution)(boundary.box, props);
    return mol_task_1.Task.create('Gaussian Density', async (ctx) => {
        return (0, gpu_1.GaussianDensityTexture2d)(webgl, position, box, radius, powerOfTwo, p, texture);
    });
}
exports.computeStructureGaussianDensityTexture2d = computeStructureGaussianDensityTexture2d;
