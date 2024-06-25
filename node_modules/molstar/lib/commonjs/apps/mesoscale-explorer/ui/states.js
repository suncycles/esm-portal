"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotControls = exports.SessionControls = exports.openState = exports.ExampleControls = exports.LoaderControls = exports.DatabaseControls = exports.LoadModel = exports.LoadExample = exports.LoadDatabase = exports.loadPdbDev = exports.loadPdb = exports.loadUrl = exports.loadExampleEntry = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const mmcif_1 = require("../../../mol-model-formats/structure/mmcif");
const trajectory_1 = require("../../../mol-plugin-state/formats/trajectory");
const objects_1 = require("../../../mol-plugin-state/objects");
const base_1 = require("../../../mol-plugin-ui/base");
const common_1 = require("../../../mol-plugin-ui/controls/common");
const icons_1 = require("../../../mol-plugin-ui/controls/icons");
const apply_action_1 = require("../../../mol-plugin-ui/state/apply-action");
const snapshots_1 = require("../../../mol-plugin-ui/state/snapshots");
const commands_1 = require("../../../mol-plugin/commands");
const mol_state_1 = require("../../../mol-state");
const mol_task_1 = require("../../../mol-task");
const color_1 = require("../../../mol-util/color/color");
const file_info_1 = require("../../../mol-util/file-info");
const param_definition_1 = require("../../../mol-util/param-definition");
const preset_1 = require("../data/cellpack/preset");
const preset_2 = require("../data/generic/preset");
const preset_3 = require("../data/mmcif/preset");
const preset_4 = require("../data/petworld/preset");
const state_1 = require("../data/state");
function adjustPluginProps(ctx) {
    var _a;
    ctx.managers.interactivity.setProps({ granularity: 'chain' });
    (_a = ctx.canvas3d) === null || _a === void 0 ? void 0 : _a.setProps({
        multiSample: { mode: 'off' },
        cameraClipping: { far: false, minNear: 50 },
        sceneRadiusFactor: 2,
        renderer: {
            colorMarker: true,
            highlightColor: (0, color_1.Color)(0xffffff),
            highlightStrength: 0,
            selectColor: (0, color_1.Color)(0xffffff),
            selectStrength: 0,
            dimColor: (0, color_1.Color)(0xffffff),
            dimStrength: 1,
            markerPriority: 2,
            interiorColorFlag: false,
            interiorDarkening: 0.15,
            exposure: 1.1,
            xrayEdgeFalloff: 3,
        },
        marking: {
            enabled: true,
            highlightEdgeColor: (0, color_1.Color)(0x999999),
            selectEdgeColor: (0, color_1.Color)(0xffff00),
            highlightEdgeStrength: 1,
            selectEdgeStrength: 1,
            ghostEdgeStrength: 1,
            innerEdgeFactor: 2.5,
            edgeScale: 2,
        },
        postprocessing: {
            occlusion: {
                name: 'on',
                params: {
                    samples: 32,
                    multiScale: {
                        name: 'on',
                        params: {
                            levels: [
                                { radius: 2, bias: 1.0 },
                                { radius: 5, bias: 1.0 },
                                { radius: 8, bias: 1.0 },
                                { radius: 11, bias: 1.0 },
                            ],
                            nearThreshold: 10,
                            farThreshold: 1500,
                        }
                    },
                    radius: 5,
                    bias: 1,
                    blurKernelSize: 11,
                    resolutionScale: 1,
                    color: (0, color_1.Color)(0x000000),
                }
            },
            shadow: {
                name: 'on',
                params: {
                    bias: 0.6,
                    maxDistance: 80,
                    steps: 3,
                    tolerance: 1.0,
                }
            },
            outline: {
                name: 'on',
                params: {
                    scale: 1,
                    threshold: 0.15,
                    color: (0, color_1.Color)(0x000000),
                    includeTransparent: false,
                }
            }
        }
    });
    const { graphics } = state_1.MesoscaleState.get(ctx);
    (0, state_1.setGraphicsCanvas3DProps)(ctx, graphics);
}
async function createHierarchy(ctx, ref) {
    var _a, _b;
    const parsed = await trajectory_1.MmcifProvider.parse(ctx, ref);
    const tr = (_b = (_a = mol_state_1.StateObjectRef.resolveAndCheck(ctx.state.data, parsed.trajectory)) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
    if (!tr)
        throw new Error('no trajectory');
    if (!mmcif_1.MmcifFormat.is(tr.representative.sourceData)) {
        throw new Error('not mmcif');
    }
    const { frame, db } = tr.representative.sourceData.data;
    let hasCellpackAssemblyMethodDetails = false;
    const { method_details } = db.pdbx_struct_assembly;
    for (let i = 0, il = method_details.rowCount; i < il; ++i) {
        if (method_details.value(i).toUpperCase() === 'CELLPACK') {
            hasCellpackAssemblyMethodDetails = true;
            break;
        }
    }
    if (frame.categories.pdbx_model) {
        await (0, preset_4.createPetworldHierarchy)(ctx, parsed.trajectory);
    }
    else if (frame.header.toUpperCase().includes('CELLPACK') ||
        hasCellpackAssemblyMethodDetails) {
        await (0, preset_1.createCellpackHierarchy)(ctx, parsed.trajectory);
    }
    else {
        await (0, preset_3.createMmcifHierarchy)(ctx, parsed.trajectory);
    }
}
async function reset(ctx) {
    const customState = ctx.customState;
    delete customState.stateRef;
    customState.stateCache = {};
    ctx.managers.asset.clear();
    await commands_1.PluginCommands.State.Snapshots.Clear(ctx);
    await commands_1.PluginCommands.State.RemoveObject(ctx, { state: ctx.state.data, ref: mol_state_1.StateTransform.RootRef });
    await state_1.MesoscaleState.init(ctx);
    adjustPluginProps(ctx);
}
async function loadExampleEntry(ctx, entry) {
    const { url, type } = entry;
    await loadUrl(ctx, url, type);
    state_1.MesoscaleState.set(ctx, {
        description: entry.description || entry.label,
        link: entry.link,
    });
}
exports.loadExampleEntry = loadExampleEntry;
async function loadUrl(ctx, url, type) {
    if (type === 'molx' || type === 'molj') {
        await commands_1.PluginCommands.State.Snapshots.OpenUrl(ctx, { url, type });
    }
    else {
        await reset(ctx);
        const isBinary = type === 'bcif';
        const data = await ctx.builders.data.download({ url, isBinary });
        await createHierarchy(ctx, data.ref);
    }
}
exports.loadUrl = loadUrl;
async function loadPdb(ctx, id) {
    await reset(ctx);
    const url = `https://models.rcsb.org/${id.toUpperCase()}.bcif`;
    const data = await ctx.builders.data.download({ url, isBinary: true });
    await createHierarchy(ctx, data.ref);
}
exports.loadPdb = loadPdb;
async function loadPdbDev(ctx, id) {
    await reset(ctx);
    const nId = id.toUpperCase().startsWith('PDBDEV_') ? id : `PDBDEV_${id.padStart(8, '0')}`;
    const url = `https://pdb-dev.wwpdb.org/bcif/${nId.toUpperCase()}.bcif`;
    const data = await ctx.builders.data.download({ url, isBinary: true });
    await createHierarchy(ctx, data.ref);
}
exports.loadPdbDev = loadPdbDev;
//
exports.LoadDatabase = mol_state_1.StateAction.build({
    display: { name: 'Database', description: 'Load from Database' },
    params: (a, ctx) => {
        return {
            source: param_definition_1.ParamDefinition.Select('pdb', param_definition_1.ParamDefinition.objectToOptions({ pdb: 'PDB', pdbDev: 'PDB-Dev' })),
            entry: param_definition_1.ParamDefinition.Text(''),
        };
    },
    from: objects_1.PluginStateObject.Root
})(({ params }, ctx) => mol_task_1.Task.create('Loading from database...', async (taskCtx) => {
    if (params.source === 'pdb') {
        await loadPdb(ctx, params.entry);
    }
    else if (params.source === 'pdbDev') {
        await loadPdbDev(ctx, params.entry);
    }
}));
exports.LoadExample = mol_state_1.StateAction.build({
    display: { name: 'Load', description: 'Load an example' },
    params: (a, ctx) => {
        const entries = ctx.customState.examples || [];
        return {
            entry: param_definition_1.ParamDefinition.Select(0, entries.map((s, i) => [i, s.label])),
        };
    },
    from: objects_1.PluginStateObject.Root
})(({ params }, ctx) => mol_task_1.Task.create('Loading example...', async (taskCtx) => {
    const entries = ctx.customState.examples || [];
    await loadExampleEntry(ctx, entries[params.entry]);
}));
exports.LoadModel = mol_state_1.StateAction.build({
    display: { name: 'Load', description: 'Load a model' },
    params: {
        files: param_definition_1.ParamDefinition.FileList({ accept: '.cif,.bcif,.cif.gz,.bcif.gz,.zip', multiple: true, description: 'mmCIF or Cellpack- or Petworld-style cif file.', label: 'File(s)' }),
    },
    from: objects_1.PluginStateObject.Root
})(({ params }, ctx) => mol_task_1.Task.create('Loading model...', async (taskCtx) => {
    if (params.files === null || params.files.length === 0) {
        ctx.log.error('No file(s) selected');
        return;
    }
    await reset(ctx);
    const firstFile = params.files[0];
    const firstInfo = (0, file_info_1.getFileNameInfo)(firstFile.file.name);
    if (firstInfo.name.endsWith('zip')) {
        try {
            await (0, preset_2.createGenericHierarchy)(ctx, firstFile);
        }
        catch (e) {
            console.error(e);
            ctx.log.error(`Error opening file '${firstFile.name}'`);
        }
    }
    else {
        for (const file of params.files) {
            try {
                const info = (0, file_info_1.getFileNameInfo)(file.file.name);
                if (!['cif', 'bcif'].includes(info.ext))
                    continue;
                const isBinary = ctx.dataFormats.binaryExtensions.has(info.ext);
                const { data } = await ctx.builders.data.readFile({ file, isBinary });
                await createHierarchy(ctx, data.ref);
            }
            catch (e) {
                console.error(e);
                ctx.log.error(`Error opening file '${file.name}'`);
            }
        }
    }
}));
//
class DatabaseControls extends base_1.PluginUIComponent {
    componentDidMount() {
    }
    render() {
        return (0, jsx_runtime_1.jsx)("div", { style: { margin: '5px' }, children: (0, jsx_runtime_1.jsx)(apply_action_1.ApplyActionControl, { state: this.plugin.state.data, action: exports.LoadDatabase, nodeRef: this.plugin.state.data.tree.root.ref, applyLabel: 'Load', hideHeader: true }) });
    }
}
exports.DatabaseControls = DatabaseControls;
class LoaderControls extends base_1.PluginUIComponent {
    componentDidMount() {
    }
    render() {
        return (0, jsx_runtime_1.jsx)("div", { style: { margin: '5px' }, children: (0, jsx_runtime_1.jsx)(apply_action_1.ApplyActionControl, { state: this.plugin.state.data, action: exports.LoadModel, nodeRef: this.plugin.state.data.tree.root.ref, applyLabel: 'Load', hideHeader: true }) });
    }
}
exports.LoaderControls = LoaderControls;
class ExampleControls extends base_1.PluginUIComponent {
    componentDidMount() {
    }
    render() {
        return (0, jsx_runtime_1.jsx)("div", { style: { margin: '5px' }, children: (0, jsx_runtime_1.jsx)(apply_action_1.ApplyActionControl, { state: this.plugin.state.data, action: exports.LoadExample, nodeRef: this.plugin.state.data.tree.root.ref, applyLabel: 'Load', hideHeader: true }) });
    }
}
exports.ExampleControls = ExampleControls;
async function openState(ctx, file) {
    var _a;
    const customState = ctx.customState;
    delete customState.stateRef;
    customState.stateCache = {};
    ctx.managers.asset.clear();
    await commands_1.PluginCommands.State.Snapshots.Clear(ctx);
    await commands_1.PluginCommands.State.Snapshots.OpenFile(ctx, { file });
    const cell = ctx.state.data.selectQ(q => q.ofType(state_1.MesoscaleStateObject))[0];
    if (!cell)
        throw new Error('Missing MesoscaleState');
    customState.stateRef = cell.transform.ref;
    customState.graphicsMode = ((_a = cell.obj) === null || _a === void 0 ? void 0 : _a.data.graphics) || customState.graphicsMode;
}
exports.openState = openState;
class SessionControls extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.downloadToFileZip = () => {
            commands_1.PluginCommands.State.Snapshots.DownloadToFile(this.plugin, { type: 'zip' });
        };
        this.open = (e) => {
            if (!e.target.files || !e.target.files[0]) {
                this.plugin.log.error('No state file selected');
                return;
            }
            openState(this.plugin, e.target.files[0]);
        };
    }
    render() {
        return (0, jsx_runtime_1.jsx)("div", { style: { margin: '5px' }, children: (0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsx)(common_1.Button, { icon: icons_1.GetAppSvg, onClick: this.downloadToFileZip, title: 'Download the state.', children: "Download" }), (0, jsx_runtime_1.jsxs)("div", { className: 'msp-btn msp-btn-block msp-btn-action msp-loader-msp-btn-file', children: [(0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.OpenInBrowserSvg, inline: true }), " Open ", (0, jsx_runtime_1.jsx)("input", { onChange: this.open, type: 'file', multiple: false, accept: '.molx,.molj' })] })] }) });
    }
}
exports.SessionControls = SessionControls;
class SnapshotControls extends base_1.PluginUIComponent {
    render() {
        return (0, jsx_runtime_1.jsxs)("div", { style: { margin: '5px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '10px' }, children: (0, jsx_runtime_1.jsx)(snapshots_1.LocalStateSnapshotList, {}) }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '10px' }, children: (0, jsx_runtime_1.jsx)(snapshots_1.LocalStateSnapshots, {}) }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '10px' }, children: (0, jsx_runtime_1.jsx)(common_1.ExpandGroup, { header: 'Snapshot Options', initiallyExpanded: false, children: (0, jsx_runtime_1.jsx)(snapshots_1.LocalStateSnapshotParams, {}) }) })] });
    }
}
exports.SnapshotControls = SnapshotControls;
