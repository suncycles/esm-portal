import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Mp4EncoderUI } from '../../../extensions/mp4-export/ui';
import { PluginUIComponent } from '../../../mol-plugin-ui/base';
import { SectionHeader } from '../../../mol-plugin-ui/controls/common';
import { MesoscaleState } from '../data/state';
import { EntityControls, ModelInfo, SelectionInfo } from './entities';
import { LoaderControls, ExampleControls, SessionControls, SnapshotControls, DatabaseControls } from './states';
const Spacer = () => _jsx("div", { style: { height: '2em' } });
export class LeftPanel extends PluginUIComponent {
    render() {
        var _a;
        const customState = this.plugin.customState;
        return _jsxs("div", { className: 'msp-scrollable-container', children: [_jsx(SectionHeader, { title: 'Database' }), _jsx(DatabaseControls, {}), _jsx(Spacer, {}), _jsx(SectionHeader, { title: 'Open' }), _jsx(LoaderControls, {}), _jsx(Spacer, {}), ((_a = customState.examples) === null || _a === void 0 ? void 0 : _a.length) && _jsxs(_Fragment, { children: [_jsx(SectionHeader, { title: 'Example' }), _jsx(ExampleControls, {}), _jsx(Spacer, {})] }), _jsx(SectionHeader, { title: 'Session' }), _jsx(SessionControls, {}), _jsx(Spacer, {}), _jsx(SectionHeader, { title: 'Snapshots' }), _jsx(SnapshotControls, {}), _jsx(Spacer, {}), _jsx(Mp4EncoderUI, {})] });
    }
}
export class RightPanel extends PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = {
            isDisabled: false,
        };
    }
    get hasModelInfo() {
        return (MesoscaleState.has(this.plugin) &&
            !!(MesoscaleState.get(this.plugin).description ||
                MesoscaleState.get(this.plugin).link));
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.data.behaviors.isUpdating, v => {
            this.setState({ isDisabled: v });
        });
        this.subscribe(this.plugin.state.events.cell.stateUpdated, e => {
            if (!this.state.isDisabled && MesoscaleState.has(this.plugin) && MesoscaleState.ref(this.plugin) === e.ref) {
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
        return _jsxs("div", { className: 'msp-scrollable-container', children: [this.hasModelInfo && _jsxs(_Fragment, { children: [_jsx(SectionHeader, { title: 'Model' }), _jsx(ModelInfo, {}), _jsx(Spacer, {})] }), _jsxs(_Fragment, { children: [_jsx(SectionHeader, { title: 'Selection' }), _jsx(SelectionInfo, {}), _jsx(Spacer, {})] }), _jsx(SectionHeader, { title: 'Entities' }), _jsx(EntityControls, {})] });
    }
}
