"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Mandar Deshpande <mandar@ebi.ac.uk>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLDDTConfidenceColorThemeProvider = exports.PLDDTConfidenceColorTheme = exports.getPLDDTConfidenceColorThemeParams = void 0;
const prop_1 = require("../prop");
const structure_1 = require("../../../../mol-model/structure");
const color_1 = require("../../../../mol-theme/color");
const color_2 = require("../../../../mol-util/color");
const param_definition_1 = require("../../../../mol-util/param-definition");
const legend_1 = require("../../../../mol-util/legend");
const DefaultColor = (0, color_2.Color)(0xaaaaaa);
const ConfidenceColors = {
    'No Score': DefaultColor,
    'Very Low': (0, color_2.Color)(0xff7d45),
    'Low': (0, color_2.Color)(0xffdb13),
    'Confident': (0, color_2.Color)(0x65cbf3),
    'Very High': (0, color_2.Color)(0x0053d6)
};
const ConfidenceColorLegend = (0, legend_1.TableLegend)(Object.entries(ConfidenceColors));
function getPLDDTConfidenceColorThemeParams(ctx) {
    return {};
}
exports.getPLDDTConfidenceColorThemeParams = getPLDDTConfidenceColorThemeParams;
function PLDDTConfidenceColorTheme(ctx, props) {
    let color = () => DefaultColor;
    if (ctx.structure) {
        const l = structure_1.StructureElement.Location.create(ctx.structure.root);
        const getColor = (location) => {
            var _a, _b;
            const { unit, element } = location;
            if (!structure_1.Unit.isAtomic(unit))
                return DefaultColor;
            const qualityAssessment = prop_1.QualityAssessmentProvider.get(unit.model).value;
            const score = (_b = (_a = qualityAssessment === null || qualityAssessment === void 0 ? void 0 : qualityAssessment.pLDDT) === null || _a === void 0 ? void 0 : _a.get(unit.model.atomicHierarchy.residueAtomSegments.index[element])) !== null && _b !== void 0 ? _b : -1;
            if (score < 0) {
                return DefaultColor;
            }
            else if (score <= 50) {
                return (0, color_2.Color)(0xff7d45);
            }
            else if (score <= 70) {
                return (0, color_2.Color)(0xffdb13);
            }
            else if (score <= 90) {
                return (0, color_2.Color)(0x65cbf3);
            }
            else {
                return (0, color_2.Color)(0x0053d6);
            }
        };
        color = (location) => {
            if (structure_1.StructureElement.Location.is(location)) {
                return getColor(location);
            }
            else if (structure_1.Bond.isLocation(location)) {
                l.unit = location.aUnit;
                l.element = location.aUnit.elements[location.aIndex];
                return getColor(l);
            }
            return DefaultColor;
        };
    }
    return {
        factory: PLDDTConfidenceColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color,
        props,
        description: 'Assigns residue colors according to the pLDDT Confidence score.',
        legend: ConfidenceColorLegend
    };
}
exports.PLDDTConfidenceColorTheme = PLDDTConfidenceColorTheme;
exports.PLDDTConfidenceColorThemeProvider = {
    name: 'plddt-confidence',
    label: 'pLDDT Confidence',
    category: color_1.ColorTheme.Category.Validation,
    factory: PLDDTConfidenceColorTheme,
    getParams: getPLDDTConfidenceColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(getPLDDTConfidenceColorThemeParams({})),
    isApplicable: (ctx) => { var _a; return !!((_a = ctx.structure) === null || _a === void 0 ? void 0 : _a.models.some(m => prop_1.QualityAssessment.isApplicable(m, 'pLDDT'))); },
    ensureCustomProperties: {
        attach: async (ctx, data) => {
            if (data.structure) {
                for (const m of data.structure.models) {
                    await prop_1.QualityAssessmentProvider.attach(ctx, m, void 0, true);
                }
            }
        },
        detach: async (data) => {
            if (data.structure) {
                for (const m of data.structure.models) {
                    prop_1.QualityAssessmentProvider.ref(m, false);
                }
            }
        }
    }
};
