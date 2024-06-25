/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StateTransforms } from '../transforms';
import { DataFormatProvider } from './provider';
export var CoordinatesFormatCategory = 'Coordinates';
export { DcdProvider };
var DcdProvider = DataFormatProvider({
    label: 'DCD',
    description: 'DCD',
    category: CoordinatesFormatCategory,
    binaryExtensions: ['dcd'],
    parse: function (plugin, data) {
        var coordinates = plugin.state.data.build()
            .to(data)
            .apply(StateTransforms.Model.CoordinatesFromDcd);
        return coordinates.commit();
    }
});
export { XtcProvider };
var XtcProvider = DataFormatProvider({
    label: 'XTC',
    description: 'XTC',
    category: CoordinatesFormatCategory,
    binaryExtensions: ['xtc'],
    parse: function (plugin, data) {
        var coordinates = plugin.state.data.build()
            .to(data)
            .apply(StateTransforms.Model.CoordinatesFromXtc);
        return coordinates.commit();
    }
});
export { TrrProvider };
var TrrProvider = DataFormatProvider({
    label: 'TRR',
    description: 'TRR',
    category: CoordinatesFormatCategory,
    binaryExtensions: ['trr'],
    parse: function (plugin, data) {
        var coordinates = plugin.state.data.build()
            .to(data)
            .apply(StateTransforms.Model.CoordinatesFromTrr);
        return coordinates.commit();
    }
});
export { NctrajProvider };
var NctrajProvider = DataFormatProvider({
    label: 'NCTRAJ',
    description: 'NCTRAJ',
    category: CoordinatesFormatCategory,
    binaryExtensions: ['nc', 'nctraj'],
    parse: function (plugin, data) {
        var coordinates = plugin.state.data.build()
            .to(data)
            .apply(StateTransforms.Model.CoordinatesFromNctraj);
        return coordinates.commit();
    }
});
export var BuiltInCoordinatesFormats = [
    ['dcd', DcdProvider],
    ['xtc', XtcProvider],
    ['trr', TrrProvider],
    ['nctraj', NctrajProvider],
];
