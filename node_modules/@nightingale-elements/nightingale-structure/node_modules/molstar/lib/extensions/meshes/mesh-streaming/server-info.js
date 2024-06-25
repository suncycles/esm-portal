/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { __extends } from "tslib";
import { PluginStateObject } from '../../../mol-plugin-state/objects';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Choice } from '../../volumes-and-segmentations/helpers';
export var DEFAULT_MESH_SERVER = 'http://localhost:9000/v2';
var MeshServerInfo = /** @class */ (function (_super) {
    __extends(MeshServerInfo, _super);
    function MeshServerInfo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MeshServerInfo;
}(PluginStateObject.Create({ name: 'Volume Server', typeClass: 'Object' })));
export { MeshServerInfo };
(function (MeshServerInfo) {
    MeshServerInfo.MeshSourceChoice = new Choice({ empiar: 'EMPIAR', emdb: 'EMDB' }, 'empiar');
    MeshServerInfo.Params = {
        serverUrl: PD.Text(DEFAULT_MESH_SERVER),
        source: MeshServerInfo.MeshSourceChoice.PDSelect(),
        entryId: PD.Text(''),
    };
})(MeshServerInfo || (MeshServerInfo = {}));
