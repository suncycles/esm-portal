/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Jason Pattle <jpattle.exscientia.co.uk>
 */
import { __assign, __extends } from "tslib";
import { Loci } from '../../../mol-model/loci';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { PluginBehavior } from '../behavior';
import { ButtonsType, ModifiersKeys } from '../../../mol-util/input/input-observer';
import { Binding } from '../../../mol-util/binding';
import { PluginCommands } from '../../commands';
import { CameraHelperAxis, isCameraAxesLoci } from '../../../mol-canvas3d/helper/camera-helper';
import { Vec3 } from '../../../mol-math/linear-algebra';
var B = ButtonsType;
var M = ModifiersKeys;
var Trigger = Binding.Trigger;
var Key = Binding.TriggerKey;
export var DefaultClickResetCameraOnEmpty = Binding([
    Trigger(B.Flag.Primary, M.create()),
    Trigger(B.Flag.Secondary, M.create()),
    Trigger(B.Flag.Primary, M.create({ control: true }))
], 'Reset camera focus', 'Click on nothing using ${triggers}');
export var DefaultClickResetCameraOnEmptySelectMode = Binding([
    Trigger(B.Flag.Secondary, M.create()),
    Trigger(B.Flag.Primary, M.create({ control: true }))
], 'Reset camera focus', 'Click on nothing using ${triggers}');
export var DefaultFocusLociBindings = {
    clickCenterFocus: Binding([
        Trigger(B.Flag.Primary, M.create()),
        Trigger(B.Flag.Secondary, M.create()),
        Trigger(B.Flag.Primary, M.create({ control: true }))
    ], 'Camera center and focus', 'Click element using ${triggers}'),
    clickCenterFocusSelectMode: Binding([
        Trigger(B.Flag.Secondary, M.create()),
        Trigger(B.Flag.Primary, M.create({ control: true }))
    ], 'Camera center and focus', 'Click element using ${triggers}'),
    clickResetCameraOnEmpty: DefaultClickResetCameraOnEmpty,
    clickResetCameraOnEmptySelectMode: DefaultClickResetCameraOnEmptySelectMode,
};
var FocusLociParams = {
    minRadius: PD.Numeric(8, { min: 1, max: 50, step: 1 }),
    extraRadius: PD.Numeric(4, { min: 1, max: 50, step: 1 }, { description: 'Value added to the bounding-sphere radius of the Loci' }),
    durationMs: PD.Numeric(250, { min: 0, max: 1000, step: 1 }, { description: 'Camera transition duration' }),
    bindings: PD.Value(DefaultFocusLociBindings, { isHidden: true }),
};
export var FocusLoci = PluginBehavior.create({
    name: 'camera-focus-loci',
    category: 'interaction',
    ctor: /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        class_1.prototype.register = function () {
            var _this = this;
            this.subscribeObservable(this.ctx.behaviors.interaction.click, function (_a) {
                var _b, _c;
                var current = _a.current, button = _a.button, modifiers = _a.modifiers;
                if (!_this.ctx.canvas3d)
                    return;
                var binding = _this.ctx.selectionMode
                    ? _this.params.bindings.clickCenterFocusSelectMode
                    : _this.params.bindings.clickCenterFocus;
                var resetBinding = _this.ctx.selectionMode
                    ? ((_b = _this.params.bindings.clickResetCameraOnEmptySelectMode) !== null && _b !== void 0 ? _b : DefaultClickResetCameraOnEmptySelectMode)
                    : ((_c = _this.params.bindings.clickResetCameraOnEmpty) !== null && _c !== void 0 ? _c : DefaultClickResetCameraOnEmpty);
                if (Loci.isEmpty(current.loci) && Binding.match(resetBinding, button, modifiers)) {
                    PluginCommands.Camera.Reset(_this.ctx, {});
                    return;
                }
                if (Binding.match(binding, button, modifiers)) {
                    var loci = Loci.normalize(current.loci, _this.ctx.managers.interactivity.props.granularity);
                    _this.ctx.managers.camera.focusLoci(loci, _this.params);
                }
            });
        };
        return class_1;
    }(PluginBehavior.Handler)),
    params: function () { return FocusLociParams; },
    display: { name: 'Camera Focus Loci on Canvas' }
});
export var CameraAxisHelper = PluginBehavior.create({
    name: 'camera-axis-helper',
    category: 'interaction',
    ctor: /** @class */ (function (_super) {
        __extends(class_2, _super);
        function class_2() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        class_2.prototype.register = function () {
            var _this = this;
            var lastPlane = CameraHelperAxis.None;
            var state = 0;
            this.subscribeObservable(this.ctx.behaviors.interaction.click, function (_a) {
                var current = _a.current;
                if (!_this.ctx.canvas3d || !isCameraAxesLoci(current.loci))
                    return;
                var axis = current.loci.elements[0].groupId;
                if (axis === CameraHelperAxis.None) {
                    lastPlane = CameraHelperAxis.None;
                    state = 0;
                    return;
                }
                var camera = _this.ctx.canvas3d.camera;
                var dir, up;
                if (axis >= CameraHelperAxis.X && axis <= CameraHelperAxis.Z) {
                    lastPlane = CameraHelperAxis.None;
                    state = 0;
                    var d = Vec3.sub(Vec3(), camera.target, camera.position);
                    var c = Vec3.cross(Vec3(), d, camera.up);
                    up = Vec3();
                    up[axis - 1] = 1;
                    dir = Vec3.cross(Vec3(), up, c);
                    if (Vec3.magnitude(dir) === 0)
                        dir = d;
                }
                else {
                    if (lastPlane === axis) {
                        state = (state + 1) % 2;
                    }
                    else {
                        lastPlane = axis;
                        state = 0;
                    }
                    if (axis === CameraHelperAxis.XY) {
                        up = state ? Vec3.unitX : Vec3.unitY;
                        dir = Vec3.negUnitZ;
                    }
                    else if (axis === CameraHelperAxis.XZ) {
                        up = state ? Vec3.unitX : Vec3.unitZ;
                        dir = Vec3.negUnitY;
                    }
                    else {
                        up = state ? Vec3.unitY : Vec3.unitZ;
                        dir = Vec3.negUnitX;
                    }
                }
                _this.ctx.canvas3d.requestCameraReset({
                    snapshot: function (scene, camera) { return camera.getInvariantFocus(scene.boundingSphereVisible.center, scene.boundingSphereVisible.radius, up, dir); }
                });
            });
        };
        return class_2;
    }(PluginBehavior.Handler)),
    params: function () { return ({}); },
    display: { name: 'Camera Axis Helper' }
});
var DefaultCameraControlsBindings = {
    keySpinAnimation: Binding([Key('KeyI')], 'Spin Animation', 'Press ${triggers}'),
    keyRockAnimation: Binding([Key('KeyO')], 'Rock Animation', 'Press ${triggers}'),
    keyToggleFlyMode: Binding([Key('Space', M.create({ shift: true }))], 'Toggle Fly Mode', 'Press ${triggers}'),
    keyResetView: Binding([Key('KeyT')], 'Reset View', 'Press ${triggers}'),
};
var CameraControlsParams = {
    bindings: PD.Value(DefaultCameraControlsBindings, { isHidden: true }),
};
export var CameraControls = PluginBehavior.create({
    name: 'camera-controls',
    category: 'interaction',
    ctor: /** @class */ (function (_super) {
        __extends(class_3, _super);
        function class_3() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        class_3.prototype.register = function () {
            var _this = this;
            this.subscribeObservable(this.ctx.behaviors.interaction.key, function (_a) {
                var code = _a.code, modifiers = _a.modifiers;
                if (!_this.ctx.canvas3d)
                    return;
                // include defaults for backwards state compatibility
                var b = __assign(__assign({}, DefaultCameraControlsBindings), _this.params.bindings);
                var p = _this.ctx.canvas3d.props.trackball;
                if (Binding.matchKey(b.keySpinAnimation, code, modifiers)) {
                    var name_1 = p.animate.name !== 'spin' ? 'spin' : 'off';
                    if (name_1 === 'off') {
                        _this.ctx.canvas3d.setProps({
                            trackball: { animate: { name: name_1, params: {} } }
                        });
                    }
                    else {
                        _this.ctx.canvas3d.setProps({
                            trackball: { animate: {
                                    name: name_1,
                                    params: { speed: 1 }
                                }
                            }
                        });
                    }
                }
                if (Binding.matchKey(b.keyRockAnimation, code, modifiers)) {
                    var name_2 = p.animate.name !== 'rock' ? 'rock' : 'off';
                    if (name_2 === 'off') {
                        _this.ctx.canvas3d.setProps({
                            trackball: { animate: { name: name_2, params: {} } }
                        });
                    }
                    else {
                        _this.ctx.canvas3d.setProps({
                            trackball: { animate: {
                                    name: name_2,
                                    params: { speed: 0.3, angle: 10 }
                                }
                            }
                        });
                    }
                }
                if (Binding.matchKey(b.keyToggleFlyMode, code, modifiers)) {
                    var flyMode = !p.flyMode;
                    _this.ctx.canvas3d.setProps({
                        trackball: { flyMode: flyMode }
                    });
                    if (_this.ctx.canvas3dContext) {
                        _this.ctx.canvas3dContext.canvas.style.cursor = flyMode ? 'crosshair' : 'unset';
                    }
                }
                if (Binding.matchKey(b.keyResetView, code, modifiers)) {
                    PluginCommands.Camera.Reset(_this.ctx, {});
                }
            });
        };
        return class_3;
    }(PluginBehavior.Handler)),
    params: function () { return CameraControlsParams; },
    display: { name: 'Camera Controls on Canvas' }
});
