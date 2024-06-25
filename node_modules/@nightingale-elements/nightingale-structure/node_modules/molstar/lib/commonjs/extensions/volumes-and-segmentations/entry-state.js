"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VOLSEG_STATE_FROM_ENTRY_TRANSFORMER_NAME = exports.VolsegState = exports.VolsegStateParams = exports.VolumeTypeChoice = void 0;
var tslib_1 = require("tslib");
var objects_1 = require("../../mol-plugin-state/objects");
var param_definition_1 = require("../../mol-util/param-definition");
var helpers_1 = require("./helpers");
exports.VolumeTypeChoice = new helpers_1.Choice({ 'isosurface': 'Isosurface', 'direct-volume': 'Direct volume', 'off': 'Off' }, 'isosurface');
exports.VolsegStateParams = {
    volumeType: exports.VolumeTypeChoice.PDSelect(),
    volumeIsovalueKind: param_definition_1.ParamDefinition.Select('relative', [['relative', 'Relative'], ['absolute', 'Absolute']]),
    volumeIsovalueValue: param_definition_1.ParamDefinition.Numeric(1),
    volumeOpacity: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 1, step: 0.05 }),
    segmentOpacity: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 1, step: 0.05 }),
    selectedSegment: param_definition_1.ParamDefinition.Numeric(-1, { step: 1 }),
    visibleSegments: param_definition_1.ParamDefinition.ObjectList({ segmentId: param_definition_1.ParamDefinition.Numeric(0) }, function (s) { return s.segmentId.toString(); }),
    visibleModels: param_definition_1.ParamDefinition.ObjectList({ pdbId: param_definition_1.ParamDefinition.Text('') }, function (s) { return s.pdbId.toString(); }),
};
var VolsegState = /** @class */ (function (_super) {
    tslib_1.__extends(VolsegState, _super);
    function VolsegState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VolsegState;
}(objects_1.PluginStateObject.Create({ name: 'Vol & Seg Entry State', typeClass: 'Data' })));
exports.VolsegState = VolsegState;
exports.VOLSEG_STATE_FROM_ENTRY_TRANSFORMER_NAME = 'volseg-state-from-entry'; // defined here to avoid cyclic dependency
