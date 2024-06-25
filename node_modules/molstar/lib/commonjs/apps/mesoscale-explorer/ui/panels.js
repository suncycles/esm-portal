"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RightPanel = exports.LeftPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const ui_1 = require("../../../extensions/mp4-export/ui");
const base_1 = require("../../../mol-plugin-ui/base");
const common_1 = require("../../../mol-plugin-ui/controls/common");
const state_1 = require("../data/state");
const entities_1 = require("./entities");
const states_1 = require("./states");
const Spacer = () => (0, jsx_runtime_1.jsx)("div", { style: { height: '2em' } });
class LeftPanel extends base_1.PluginUIComponent {
    render() {
        var _a;
        const customState = this.plugin.customState;
        return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-scrollable-container', children: [(0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Database' }), (0, jsx_runtime_1.jsx)(states_1.DatabaseControls, {}), (0, jsx_runtime_1.jsx)(Spacer, {}), (0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Open' }), (0, jsx_runtime_1.jsx)(states_1.LoaderControls, {}), (0, jsx_runtime_1.jsx)(Spacer, {}), ((_a = customState.examples) === null || _a === void 0 ? void 0 : _a.length) && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Example' }), (0, jsx_runtime_1.jsx)(states_1.ExampleControls, {}), (0, jsx_runtime_1.jsx)(Spacer, {})] }), (0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Session' }), (0, jsx_runtime_1.jsx)(states_1.SessionControls, {}), (0, jsx_runtime_1.jsx)(Spacer, {}), (0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Snapshots' }), (0, jsx_runtime_1.jsx)(states_1.SnapshotControls, {}), (0, jsx_runtime_1.jsx)(Spacer, {}), (0, jsx_runtime_1.jsx)(ui_1.Mp4EncoderUI, {})] });
    }
}
exports.LeftPanel = LeftPanel;
class RightPanel extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = {
            isDisabled: false,
        };
    }
    get hasModelInfo() {
        return (state_1.MesoscaleState.has(this.plugin) &&
            !!(state_1.MesoscaleState.get(this.plugin).description ||
                state_1.MesoscaleState.get(this.plugin).link));
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.data.behaviors.isUpdating, v => {
            this.setState({ isDisabled: v });
        });
        this.subscribe(this.plugin.state.events.cell.stateUpdated, e => {
            if (!this.state.isDisabled && state_1.MesoscaleState.has(this.plugin) && state_1.MesoscaleState.ref(this.plugin) === e.ref) {
                this.forceUpdate();
            }
        });
        this.subscribe(this.plugin.managers.structure.selection.events.changed, e => {
            if (!this.state.isDisabled) {
                this.forceUpdate();
            }
        });
    }
    render() {
        return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-scrollable-container', children: [this.hasModelInfo && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Model' }), (0, jsx_runtime_1.jsx)(entities_1.ModelInfo, {}), (0, jsx_runtime_1.jsx)(Spacer, {})] }), (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Selection' }), (0, jsx_runtime_1.jsx)(entities_1.SelectionInfo, {}), (0, jsx_runtime_1.jsx)(Spacer, {})] }), (0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Entities' }), (0, jsx_runtime_1.jsx)(entities_1.EntityControls, {})] });
    }
}
exports.RightPanel = RightPanel;
