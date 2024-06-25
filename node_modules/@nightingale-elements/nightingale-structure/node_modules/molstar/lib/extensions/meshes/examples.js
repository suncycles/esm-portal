/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
/** Testing examples for using mesh-extension.ts. */
import { CIF } from '../../mol-io/reader/cif';
import { Volume } from '../../mol-model/volume';
import { createStructureRepresentationParams } from '../../mol-plugin-state/helpers/structure-representation-params';
import { createVolumeRepresentationParams } from '../../mol-plugin-state/helpers/volume-representation-params';
import { StateTransforms } from '../../mol-plugin-state/transforms';
import { Asset } from '../../mol-util/assets';
import { Color } from '../../mol-util/color';
import { ParamDefinition } from '../../mol-util/param-definition';
import { createMeshFromUrl } from './mesh-extension';
import { MeshServerInfo } from './mesh-streaming/server-info';
import { InitMeshStreaming } from './mesh-streaming/transformers';
import * as MeshUtils from './mesh-utils';
export var DB_URL = '/db'; // local
export function runMeshExtensionExamples(plugin, db_url) {
    if (db_url === void 0) { db_url = DB_URL; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.time('TIME MESH EXAMPLES');
                    // await runIsosurfaceExample(plugin, db_url);
                    // await runMolsurfaceExample(plugin);
                    // Focused Ion Beam-Scanning Electron Microscopy of mitochondrial reticulum in murine skeletal muscle: https://www.ebi.ac.uk/empiar/EMPIAR-10070/
                    // await runMeshExample(plugin, 'all', db_url);
                    // await runMeshExample(plugin, 'fg', db_url);
                    // await runMultimeshExample(plugin, 'fg', 'worst', db_url);
                    // await runCifMeshExample(plugin);
                    // await runMeshExample2(plugin, 'fg');
                    return [4 /*yield*/, runMeshStreamingExample(plugin)];
                case 1:
                    // await runIsosurfaceExample(plugin, db_url);
                    // await runMolsurfaceExample(plugin);
                    // Focused Ion Beam-Scanning Electron Microscopy of mitochondrial reticulum in murine skeletal muscle: https://www.ebi.ac.uk/empiar/EMPIAR-10070/
                    // await runMeshExample(plugin, 'all', db_url);
                    // await runMeshExample(plugin, 'fg', db_url);
                    // await runMultimeshExample(plugin, 'fg', 'worst', db_url);
                    // await runCifMeshExample(plugin);
                    // await runMeshExample2(plugin, 'fg');
                    _a.sent();
                    console.timeEnd('TIME MESH EXAMPLES');
                    return [2 /*return*/];
            }
        });
    });
}
/** Example for downloading multiple separate segments, each containing 1 mesh. */
export function runMeshExample(plugin, segments, db_url) {
    if (db_url === void 0) { db_url = DB_URL; }
    return __awaiter(this, void 0, void 0, function () {
        var detail, segmentIds, _i, segmentIds_1, segmentId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    detail = 2;
                    segmentIds = (segments === 'all') ?
                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17] // segment-16 has no detail-2
                        : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 17];
                    _i = 0, segmentIds_1 = segmentIds;
                    _a.label = 1;
                case 1:
                    if (!(_i < segmentIds_1.length)) return [3 /*break*/, 4];
                    segmentId = segmentIds_1[_i];
                    return [4 /*yield*/, createMeshFromUrl(plugin, "".concat(db_url, "/empiar-10070-mesh-rounded/segment-").concat(segmentId, "/detail-").concat(detail), segmentId, detail, true, undefined)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/** Example for downloading multiple separate segments, each containing 1 mesh. */
export function runMeshExample2(plugin, segments) {
    return __awaiter(this, void 0, void 0, function () {
        var detail, segmentIds, _i, segmentIds_2, segmentId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    detail = 1;
                    segmentIds = (segments === 'one') ? [15]
                        : (segments === 'few') ? [1, 4, 7, 10, 16]
                            : (segments === 'all') ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17] // segment-16 has no detail-2
                                : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 17];
                    _i = 0, segmentIds_2 = segmentIds;
                    _a.label = 1;
                case 1:
                    if (!(_i < segmentIds_2.length)) return [3 /*break*/, 4];
                    segmentId = segmentIds_2[_i];
                    return [4 /*yield*/, createMeshFromUrl(plugin, "http://localhost:9000/v2/empiar/empiar-10070/mesh_bcif/".concat(segmentId, "/").concat(detail), segmentId, detail, false, undefined)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/** Example for downloading a single segment containing multiple meshes. */
export function runMultimeshExample(plugin, segments, detailChoice, db_url) {
    if (db_url === void 0) { db_url = DB_URL; }
    return __awaiter(this, void 0, void 0, function () {
        var urlDetail, numDetail;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    urlDetail = (detailChoice === 'best') ? '2' : 'worst';
                    numDetail = (detailChoice === 'best') ? 2 : 1000;
                    return [4 /*yield*/, createMeshFromUrl(plugin, "".concat(db_url, "/empiar-10070-multimesh-rounded/segments-").concat(segments, "/detail-").concat(urlDetail), 0, numDetail, false, undefined)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
export function runMeshStreamingExample(plugin, source, entryId, serverUrl, parent) {
    if (source === void 0) { source = 'empiar'; }
    if (entryId === void 0) { entryId = 'empiar-10070'; }
    return __awaiter(this, void 0, void 0, function () {
        var params;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = ParamDefinition.getDefaultValues(MeshServerInfo.Params);
                    if (serverUrl)
                        params.serverUrl = serverUrl;
                    params.source = source;
                    params.entryId = entryId;
                    return [4 /*yield*/, plugin.runTask(plugin.state.data.applyAction(InitMeshStreaming, params, parent === null || parent === void 0 ? void 0 : parent.ref), { useOverlay: false })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/** Example for downloading a protein structure and visualizing molecular surface. */
export function runMolsurfaceExample(plugin) {
    return __awaiter(this, void 0, void 0, function () {
        var entryId, data, parsed, trajectory, model, structure, reprParams, repr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    entryId = 'pdb-7etq';
                    return [4 /*yield*/, plugin.builders.data.download({ url: 'https://www.ebi.ac.uk/pdbe/entry-files/download/7etq.bcif', isBinary: true }, { state: { isGhost: false } })];
                case 1:
                    data = _a.sent();
                    console.log('formats:', plugin.dataFormats.list);
                    return [4 /*yield*/, plugin.dataFormats.get('mmcif').parse(plugin, data, { entryId: entryId })];
                case 2:
                    parsed = _a.sent();
                    trajectory = parsed.trajectory;
                    console.log('parsed', parsed);
                    console.log('trajectory', trajectory);
                    return [4 /*yield*/, plugin.build().to(trajectory).apply(StateTransforms.Model.ModelFromTrajectory).commit()];
                case 3:
                    model = _a.sent();
                    console.log('model:', model);
                    return [4 /*yield*/, plugin.build().to(model).apply(StateTransforms.Model.StructureFromModel).commit()];
                case 4:
                    structure = _a.sent();
                    console.log('structure:', structure);
                    reprParams = createStructureRepresentationParams(plugin, undefined, { type: 'molecular-surface' });
                    return [4 /*yield*/, plugin.build().to(structure).apply(StateTransforms.Representation.StructureRepresentation3D, reprParams).commit()];
                case 5:
                    repr = _a.sent();
                    console.log('repr:', repr);
                    return [2 /*return*/];
            }
        });
    });
}
/** Example for downloading an EMDB density data and visualizing isosurface. */
export function runIsosurfaceExample(plugin, db_url) {
    var _a, _b;
    if (db_url === void 0) { db_url = DB_URL; }
    return __awaiter(this, void 0, void 0, function () {
        var entryId, isoLevel, root, data, parsed, volume, volumeData, volumeParams;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    entryId = 'emd-1832';
                    isoLevel = 2.73;
                    return [4 /*yield*/, plugin.build()];
                case 1:
                    root = _c.sent();
                    return [4 /*yield*/, plugin.builders.data.download({ url: "".concat(db_url, "/emd-1832-box"), isBinary: true }, { state: { isGhost: false } })];
                case 2:
                    data = _c.sent();
                    return [4 /*yield*/, plugin.dataFormats.get('dscif').parse(plugin, data, { entryId: entryId })];
                case 3:
                    parsed = _c.sent();
                    volume = (_b = (_a = parsed.volumes) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : parsed.volume;
                    volumeData = volume.cell.obj.data;
                    console.log('data:', data);
                    console.log('parsed:', parsed);
                    console.log('volume:', volume);
                    console.log('volumeData:', volumeData);
                    return [4 /*yield*/, plugin.build()];
                case 4:
                    root = _c.sent();
                    console.log('root:', root);
                    console.log('to:', root.to(volume));
                    console.log('toRoot:', root.toRoot());
                    volumeParams = createVolumeRepresentationParams(plugin, volumeData, {
                        type: 'isosurface',
                        typeParams: {
                            alpha: 0.5,
                            isoValue: Volume.adjustedIsoValue(volumeData, isoLevel, 'relative'),
                            visuals: ['solid'],
                            sizeFactor: 1,
                        },
                        color: 'uniform',
                        colorParams: { value: Color(0x00aaaa) },
                    });
                    root.to(volume).apply(StateTransforms.Representation.VolumeRepresentation3D, volumeParams);
                    volumeParams = createVolumeRepresentationParams(plugin, volumeData, {
                        type: 'isosurface',
                        typeParams: {
                            alpha: 1.0,
                            isoValue: Volume.adjustedIsoValue(volumeData, isoLevel, 'relative'),
                            visuals: ['wireframe'],
                            sizeFactor: 1,
                        },
                        color: 'uniform',
                        colorParams: { value: Color(0x8800aa) },
                    });
                    root.to(volume).apply(StateTransforms.Representation.VolumeRepresentation3D, volumeParams);
                    return [4 /*yield*/, root.commit()];
                case 5:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
export function runCifMeshExample(plugin, api, source, entryId, segmentId, detail) {
    if (api === void 0) { api = 'http://localhost:9000/v2'; }
    if (source === void 0) { source = 'empiar'; }
    if (entryId === void 0) { entryId = 'empiar-10070'; }
    if (segmentId === void 0) { segmentId = 1; }
    if (detail === void 0) { detail = 10; }
    return __awaiter(this, void 0, void 0, function () {
        var url;
        return __generator(this, function (_a) {
            url = "".concat(api, "/").concat(source, "/").concat(entryId, "/mesh_bcif/").concat(segmentId, "/").concat(detail);
            getMeshFromBcif(plugin, url);
            return [2 /*return*/];
        });
    });
}
function getMeshFromBcif(plugin, url) {
    return __awaiter(this, void 0, void 0, function () {
        var urlAsset, asset, parsed, mesh;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    urlAsset = Asset.getUrlAsset(plugin.managers.asset, url);
                    return [4 /*yield*/, plugin.runTask(plugin.managers.asset.resolve(urlAsset, 'binary'))];
                case 1:
                    asset = _a.sent();
                    return [4 /*yield*/, plugin.runTask(CIF.parseBinary(asset.data))];
                case 2:
                    parsed = _a.sent();
                    if (parsed.isError) {
                        plugin.log.error('VolumeStreaming, parsing CIF: ' + parsed.toString());
                        return [2 /*return*/];
                    }
                    console.log('blocks:', parsed.result.blocks);
                    return [4 /*yield*/, MeshUtils.meshFromCif(parsed.result)];
                case 3:
                    mesh = _a.sent();
                    console.log(mesh);
                    return [2 /*return*/];
            }
        });
    });
}
