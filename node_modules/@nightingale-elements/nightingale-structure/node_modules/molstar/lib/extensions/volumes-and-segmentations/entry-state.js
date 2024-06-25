/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { __extends } from "tslib";
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Choice } from './helpers';
export var VolumeTypeChoice = new Choice({ 'isosurface': 'Isosurface', 'direct-volume': 'Direct volume', 'off': 'Off' }, 'isosurface');
export var VolsegStateParams = {
    volumeType: VolumeTypeChoice.PDSelect(),
    volumeIsovalueKind: PD.Select('relative', [['relative', 'Relative'], ['absolute', 'Absolute']]),
    volumeIsovalueValue: PD.Numeric(1),
    volumeOpacity: PD.Numeric(0.2, { min: 0, max: 1, step: 0.05 }),
    segmentOpacity: PD.Numeric(1, { min: 0, max: 1, step: 0.05 }),
    selectedSegment: PD.Numeric(-1, { step: 1 }),
    visibleSegments: PD.ObjectList({ segmentId: PD.Numeric(0) }, function (s) { return s.segmentId.toString(); }),
    visibleModels: PD.ObjectList({ pdbId: PD.Text('') }, function (s) { return s.pdbId.toString(); }),
};
var VolsegState = /** @class */ (function (_super) {
    __extends(VolsegState, _super);
    function VolsegState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VolsegState;
}(PluginStateObject.Create({ name: 'Vol & Seg Entry State', typeClass: 'Data' })));
export { VolsegState };
export var VOLSEG_STATE_FROM_ENTRY_TRANSFORMER_NAME = 'volseg-state-from-entry'; // defined here to avoid cyclic dependency
