/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3 } from '../../mol-math/linear-algebra';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { PluginStateObject as SO } from '../objects';
export { VolumeFromCcp4 };
export { VolumeFromDsn6 };
export { VolumeFromCube };
export { VolumeFromDx };
export { AssignColorVolume };
export { VolumeFromDensityServerCif };
export { VolumeFromSegmentationCif };
type VolumeFromCcp4 = typeof VolumeFromCcp4;
declare const VolumeFromCcp4: import("../../mol-state/transformer").StateTransformer<SO.Format.Ccp4, SO.Volume.Data, PD.Normalize<{
    voxelSize: Vec3;
    offset: Vec3;
    entryId: string;
}>>;
type VolumeFromDsn6 = typeof VolumeFromDsn6;
declare const VolumeFromDsn6: import("../../mol-state/transformer").StateTransformer<SO.Format.Dsn6, SO.Volume.Data, PD.Normalize<{
    voxelSize: Vec3;
    entryId: string;
}>>;
type VolumeFromCube = typeof VolumeFromCube;
declare const VolumeFromCube: import("../../mol-state/transformer").StateTransformer<SO.Format.Cube, SO.Volume.Data, PD.Normalize<{
    dataIndex: number;
    entryId: string;
}>>;
type VolumeFromDx = typeof VolumeFromDx;
declare const VolumeFromDx: import("../../mol-state/transformer").StateTransformer<SO.Format.Dx, SO.Volume.Data, PD.Normalize<{}>>;
type VolumeFromDensityServerCif = typeof VolumeFromDensityServerCif;
declare const VolumeFromDensityServerCif: import("../../mol-state/transformer").StateTransformer<SO.Format.Cif, SO.Volume.Data, PD.Normalize<{
    blockHeader: string | undefined;
    entryId: string;
}>>;
type VolumeFromSegmentationCif = typeof VolumeFromSegmentationCif;
declare const VolumeFromSegmentationCif: import("../../mol-state/transformer").StateTransformer<SO.Format.Cif, SO.Volume.Data, PD.Normalize<{
    blockHeader: string | undefined;
    segmentLabels: PD.Normalize<{
        id: any;
        label: any;
    }>[];
    ownerId: string;
}>>;
type AssignColorVolume = typeof AssignColorVolume;
declare const AssignColorVolume: import("../../mol-state/transformer").StateTransformer<SO.Volume.Data, SO.Volume.Data, PD.Normalize<{
    ref: string;
}>>;
