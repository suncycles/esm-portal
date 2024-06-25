/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Column } from '../../../../mol-data/db';
import { DensityServer_Data_Schema } from './density-server';
var Schema = Column.Schema;
var int = Schema.int;
export var Segmentation_Data_Schema = {
    volume_data_3d_info: DensityServer_Data_Schema.volume_data_3d_info,
    segmentation_data_table: {
        set_id: int,
        segment_id: int,
    },
    segmentation_data_3d: {
        values: int
    }
};
