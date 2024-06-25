"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MesoSelectLoci = void 0;
const loci_1 = require("../../../mol-model/loci");
const param_definition_1 = require("../../../mol-util/param-definition");
const behavior_1 = require("../../../mol-plugin/behavior");
const input_observer_1 = require("../../../mol-util/input/input-observer");
const binding_1 = require("../../../mol-util/binding");
const objects_1 = require("../../../mol-plugin-state/objects");
const structure_1 = require("../../../mol-model/structure");
const mol_state_1 = require("../../../mol-state");
const spine_1 = require("../../../mol-state/tree/spine");
const marker_action_1 = require("../../../mol-util/marker-action");
const B = input_observer_1.ButtonsType;
const M = input_observer_1.ModifiersKeys;
const Trigger = binding_1.Binding.Trigger;
const DefaultMesoSelectLociBindings = {
    clickToggleSelect: (0, binding_1.Binding)([
        Trigger(B.Flag.Primary, M.create({ shift: true })),
        Trigger(B.Flag.Primary, M.create({ control: true })),
    ], 'Toggle select', 'Click element using ${triggers}'),
    hoverHighlightOnly: (0, binding_1.Binding)([
        Trigger(B.Flag.None, M.create({ shift: true })),
        Trigger(B.Flag.None, M.create({ control: true })),
    ], 'Highlight', 'Hover element using ${triggers}'),
};
const MesoSelectLociParams = {
    bindings: param_definition_1.ParamDefinition.Value(DefaultMesoSelectLociBindings, { isHidden: true }),
};
exports.MesoSelectLoci = behavior_1.PluginBehavior.create({
    name: 'camera-meso-select-loci',
    category: 'interaction',
    ctor: class extends behavior_1.PluginBehavior.Handler {
        applySelectMark(ref, clear) {
            const cell = this.ctx.state.data.cells.get(ref);
            if (cell && objects_1.PluginStateObject.isRepresentation3D(cell.obj)) {
                this.spine.current = cell;
                const so = this.spine.getRootOfType(objects_1.PluginStateObject.Molecule.Structure);
                if (so) {
                    if (clear) {
                        this.lociMarkProvider({ loci: structure_1.Structure.Loci(so.data) }, marker_action_1.MarkerAction.Deselect);
                    }
                    const loci = this.ctx.managers.structure.selection.getLoci(so.data);
                    this.lociMarkProvider({ loci }, marker_action_1.MarkerAction.Select);
                }
            }
        }
        register() {
            this.subscribeObservable(this.ctx.behaviors.interaction.click, ({ current, button, modifiers }) => {
                if (!this.ctx.canvas3d || this.ctx.isBusy)
                    return;
                const { clickToggleSelect } = this.params.bindings;
                if (binding_1.Binding.match(clickToggleSelect, button, modifiers)) {
                    if (loci_1.Loci.isEmpty(current.loci)) {
                        this.ctx.managers.interactivity.lociSelects.deselectAll();
                        return;
                    }
                    const loci = loci_1.Loci.normalize(current.loci, modifiers.control ? 'entity' : 'chain');
                    this.ctx.managers.interactivity.lociSelects.toggle({ loci }, false);
                }
            });
            this.ctx.managers.interactivity.lociSelects.addProvider(this.lociMarkProvider);
            this.subscribeObservable(this.ctx.behaviors.interaction.hover, ({ current, button, modifiers }) => {
                var _a, _b;
                if (!this.ctx.canvas3d || this.ctx.isBusy)
                    return;
                const pointerLock = !!((_a = this.ctx.canvas3dContext) === null || _a === void 0 ? void 0 : _a.input.pointerLock);
                const { hoverHighlightOnly } = this.params.bindings;
                if (!pointerLock && binding_1.Binding.match(hoverHighlightOnly, button, modifiers)) {
                    if (loci_1.Loci.isEmpty(current.loci)) {
                        this.ctx.managers.interactivity.lociHighlights.clearHighlights();
                        return;
                    }
                    if (modifiers.control) {
                        this.ctx.managers.interactivity.lociHighlights.highlightOnly({ repr: current.repr, loci: loci_1.EveryLoci }, false);
                    }
                    else {
                        const loci = loci_1.Loci.normalize(current.loci, 'chain');
                        this.ctx.managers.interactivity.lociHighlights.highlightOnly({ repr: current.repr, loci }, false);
                    }
                }
                if (loci_1.Loci.isEmpty(current.loci)) {
                    this.ctx.behaviors.labels.highlight.next({ labels: [] });
                }
                else {
                    const labels = [];
                    if (structure_1.StructureElement.Loci.is(current.loci)) {
                        const cell = this.ctx.helpers.substructureParent.get(current.loci.structure);
                        labels.push(((_b = cell === null || cell === void 0 ? void 0 : cell.obj) === null || _b === void 0 ? void 0 : _b.label) || 'Unknown');
                    }
                    this.ctx.behaviors.labels.highlight.next({ labels });
                }
            });
            this.ctx.managers.interactivity.lociHighlights.addProvider(this.lociMarkProvider);
            let dimDisabled = false;
            this.subscribeObservable(this.ctx.behaviors.interaction.keyReleased, ({ code, modifiers }) => {
                var _a;
                if (!this.ctx.canvas3d)
                    return;
                if ((code.startsWith('Shift') && !modifiers.control) || (code.startsWith('Control') && !modifiers.shift)) {
                    if (dimDisabled) {
                        dimDisabled = false;
                        (_a = this.ctx.canvas3d) === null || _a === void 0 ? void 0 : _a.setProps({ renderer: { dimStrength: 1 } }, true);
                    }
                    this.ctx.managers.interactivity.lociHighlights.clearHighlights();
                }
            });
            this.subscribeObservable(this.ctx.behaviors.interaction.key, ({ modifiers }) => {
                var _a;
                if (!this.ctx.canvas3d)
                    return;
                if (!dimDisabled && modifiers.control && modifiers.shift) {
                    dimDisabled = true;
                    (_a = this.ctx.canvas3d) === null || _a === void 0 ? void 0 : _a.setProps({ renderer: { dimStrength: 0 } });
                }
            });
            this.subscribeObservable(this.ctx.state.events.object.created, ({ ref }) => this.applySelectMark(ref));
            // re-apply select-mark to all representation of an updated structure
            this.subscribeObservable(this.ctx.state.events.object.updated, ({ ref, obj, oldObj, oldData, action }) => {
                const cell = this.ctx.state.data.cells.get(ref);
                if (cell && objects_1.PluginStateObject.Molecule.Structure.is(cell.obj)) {
                    const structure = obj.data;
                    const oldStructure = action === 'recreate' ? oldObj === null || oldObj === void 0 ? void 0 : oldObj.data :
                        action === 'in-place' ? oldData : undefined;
                    if (oldStructure &&
                        structure_1.Structure.areEquivalent(structure, oldStructure) &&
                        structure_1.Structure.areHierarchiesEqual(structure, oldStructure))
                        return;
                    const reprs = this.ctx.state.data.select(mol_state_1.StateSelection.children(ref).ofType(objects_1.PluginStateObject.Molecule.Structure.Representation3D));
                    for (const repr of reprs)
                        this.applySelectMark(repr.transform.ref, true);
                }
            });
        }
        unregister() {
            this.ctx.managers.interactivity.lociSelects.removeProvider(this.lociMarkProvider);
            this.ctx.managers.interactivity.lociHighlights.removeProvider(this.lociMarkProvider);
        }
        constructor(ctx, params) {
            super(ctx, params);
            this.lociMarkProvider = (interactionLoci, action) => {
                if (!this.ctx.canvas3d)
                    return;
                this.ctx.canvas3d.mark(interactionLoci, action);
            };
            this.spine = new spine_1.StateTreeSpine.Impl(ctx.state.data.cells);
        }
    },
    params: () => MesoSelectLociParams,
    display: { name: 'Camera Meso Select Loci on Canvas' }
});
