/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { Segment } from './volseg-api/data';
import { VolsegEntryData } from './entry-root';
export declare class VolsegMeshSegmentationData {
    private entryData;
    constructor(rootData: VolsegEntryData);
    loadSegmentation(): Promise<void>;
    updateOpacity(opacity: number): Promise<import("../../mol-state").StateObjectSelector<import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, import("../../mol-state/transformer").StateTransformer<import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, any>>>;
    highlightSegment(segment: Segment): Promise<void>;
    selectSegment(segment?: number): Promise<void>;
    /** Make visible the specified set of mesh segments */
    showSegments(segments: number[]): Promise<void>;
}
