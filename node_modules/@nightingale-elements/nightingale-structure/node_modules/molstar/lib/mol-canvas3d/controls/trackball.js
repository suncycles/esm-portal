/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 *
 * This code has been modified from https://github.com/mrdoob/three.js/,
 * copyright (c) 2010-2018 three.js authors. MIT License
 */
import { __assign } from "tslib";
import { Quat, Vec2, Vec3, EPSILON } from '../../mol-math/linear-algebra';
import { Viewport } from '../camera/util';
import { ButtonsType, ModifiersKeys } from '../../mol-util/input/input-observer';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { absMax, degToRad } from '../../mol-math/misc';
import { Binding } from '../../mol-util/binding';
var B = ButtonsType;
var M = ModifiersKeys;
var Trigger = Binding.Trigger;
var Key = Binding.TriggerKey;
export var DefaultTrackballBindings = {
    dragRotate: Binding([Trigger(B.Flag.Primary, M.create())], 'Rotate', 'Drag using ${triggers}'),
    dragRotateZ: Binding([Trigger(B.Flag.Primary, M.create({ shift: true, control: true }))], 'Rotate around z-axis (roll)', 'Drag using ${triggers}'),
    dragPan: Binding([
        Trigger(B.Flag.Secondary, M.create()),
        Trigger(B.Flag.Primary, M.create({ control: true }))
    ], 'Pan', 'Drag using ${triggers}'),
    dragZoom: Binding.Empty,
    dragFocus: Binding([Trigger(B.Flag.Forth, M.create())], 'Focus', 'Drag using ${triggers}'),
    dragFocusZoom: Binding([Trigger(B.Flag.Auxilary, M.create())], 'Focus and zoom', 'Drag using ${triggers}'),
    scrollZoom: Binding([Trigger(B.Flag.Auxilary, M.create())], 'Zoom', 'Scroll using ${triggers}'),
    scrollFocus: Binding([Trigger(B.Flag.Auxilary, M.create({ shift: true }))], 'Clip', 'Scroll using ${triggers}'),
    scrollFocusZoom: Binding.Empty,
    keyMoveForward: Binding([Key('KeyW')], 'Move forward', 'Press ${triggers}'),
    keyMoveBack: Binding([Key('KeyS')], 'Move back', 'Press ${triggers}'),
    keyMoveLeft: Binding([Key('KeyA')], 'Move left', 'Press ${triggers}'),
    keyMoveRight: Binding([Key('KeyD')], 'Move right', 'Press ${triggers}'),
    keyMoveUp: Binding([Key('KeyR')], 'Move up', 'Press ${triggers}'),
    keyMoveDown: Binding([Key('KeyF')], 'Move down', 'Press ${triggers}'),
    keyRollLeft: Binding([Key('KeyQ')], 'Roll left', 'Press ${triggers}'),
    keyRollRight: Binding([Key('KeyE')], 'Roll right', 'Press ${triggers}'),
    keyPitchUp: Binding([Key('ArrowUp', M.create({ shift: true }))], 'Pitch up', 'Press ${triggers}'),
    keyPitchDown: Binding([Key('ArrowDown', M.create({ shift: true }))], 'Pitch down', 'Press ${triggers}'),
    keyYawLeft: Binding([Key('ArrowLeft', M.create({ shift: true }))], 'Yaw left', 'Press ${triggers}'),
    keyYawRight: Binding([Key('ArrowRight', M.create({ shift: true }))], 'Yaw right', 'Press ${triggers}'),
    boostMove: Binding([Key('ShiftLeft')], 'Boost move', 'Press ${triggers}'),
    enablePointerLock: Binding([Key('Space', M.create({ control: true }))], 'Enable pointer lock', 'Press ${triggers}'),
};
export var TrackballControlsParams = {
    noScroll: PD.Boolean(true, { isHidden: true }),
    rotateSpeed: PD.Numeric(5.0, { min: 1, max: 10, step: 1 }),
    zoomSpeed: PD.Numeric(7.0, { min: 1, max: 15, step: 1 }),
    panSpeed: PD.Numeric(1.0, { min: 0.1, max: 5, step: 0.1 }),
    moveSpeed: PD.Numeric(0.75, { min: 0.1, max: 3, step: 0.1 }),
    boostMoveFactor: PD.Numeric(5.0, { min: 0.1, max: 10, step: 0.1 }),
    flyMode: PD.Boolean(false),
    animate: PD.MappedStatic('off', {
        off: PD.EmptyGroup(),
        spin: PD.Group({
            speed: PD.Numeric(1, { min: -20, max: 20, step: 1 }),
        }, { description: 'Spin the 3D scene around the x-axis in view space' }),
        rock: PD.Group({
            speed: PD.Numeric(0.3, { min: -5, max: 5, step: 0.1 }),
            angle: PD.Numeric(10, { min: 0, max: 90, step: 1 }, { description: 'How many degrees to rotate in each direction.' }),
        }, { description: 'Rock the 3D scene around the x-axis in view space' })
    }),
    staticMoving: PD.Boolean(true, { isHidden: true }),
    dynamicDampingFactor: PD.Numeric(0.2, {}, { isHidden: true }),
    minDistance: PD.Numeric(0.01, {}, { isHidden: true }),
    maxDistance: PD.Numeric(1e150, {}, { isHidden: true }),
    gestureScaleFactor: PD.Numeric(1, {}, { isHidden: true }),
    maxWheelDelta: PD.Numeric(0.02, {}, { isHidden: true }),
    bindings: PD.Value(DefaultTrackballBindings, { isHidden: true }),
    /**
     * minDistance = minDistanceFactor * boundingSphere.radius + minDistancePadding
     * maxDistance = max(maxDistanceFactor * boundingSphere.radius, maxDistanceMin)
     */
    autoAdjustMinMaxDistance: PD.MappedStatic('on', {
        off: PD.EmptyGroup(),
        on: PD.Group({
            minDistanceFactor: PD.Numeric(0),
            minDistancePadding: PD.Numeric(5),
            maxDistanceFactor: PD.Numeric(10),
            maxDistanceMin: PD.Numeric(20)
        })
    }, { isHidden: true })
};
export { TrackballControls };
var TrackballControls;
(function (TrackballControls) {
    function create(input, camera, scene, props) {
        if (props === void 0) { props = {}; }
        var p = __assign(__assign(__assign({}, PD.getDefaultValues(TrackballControlsParams)), props), { 
            // include default bindings for backwards state compatibility
            bindings: __assign(__assign({}, DefaultTrackballBindings), props.bindings) });
        var b = p.bindings;
        var viewport = Viewport.clone(camera.viewport);
        var disposed = false;
        var dragSub = input.drag.subscribe(onDrag);
        var interactionEndSub = input.interactionEnd.subscribe(onInteractionEnd);
        var wheelSub = input.wheel.subscribe(onWheel);
        var pinchSub = input.pinch.subscribe(onPinch);
        var gestureSub = input.gesture.subscribe(onGesture);
        var keyDownSub = input.keyDown.subscribe(onKeyDown);
        var keyUpSub = input.keyUp.subscribe(onKeyUp);
        var moveSub = input.move.subscribe(onMove);
        var lockSub = input.lock.subscribe(onLock);
        var leaveSub = input.leave.subscribe(onLeave);
        var _isInteracting = false;
        // For internal use
        var lastPosition = Vec3();
        var _eye = Vec3();
        var _rotPrev = Vec2();
        var _rotCurr = Vec2();
        var _rotLastAxis = Vec3();
        var _rotLastAngle = 0;
        var _rollPrev = Vec2();
        var _rollCurr = Vec2();
        var _rollLastAngle = 0;
        var _pitchLastAngle = 0;
        var _yawLastAngle = 0;
        var _zoomStart = Vec2();
        var _zoomEnd = Vec2();
        var _focusStart = Vec2();
        var _focusEnd = Vec2();
        var _panStart = Vec2();
        var _panEnd = Vec2();
        // Initial values for reseting
        var target0 = Vec3.clone(camera.target);
        var position0 = Vec3.clone(camera.position);
        var up0 = Vec3.clone(camera.up);
        var mouseOnScreenVec2 = Vec2();
        function getMouseOnScreen(pageX, pageY) {
            return Vec2.set(mouseOnScreenVec2, (pageX - viewport.x) / viewport.width, (pageY - viewport.y) / viewport.height);
        }
        var mouseOnCircleVec2 = Vec2();
        function getMouseOnCircle(pageX, pageY) {
            return Vec2.set(mouseOnCircleVec2, (pageX - viewport.width * 0.5 - viewport.x) / (viewport.width * 0.5), (viewport.height + 2 * (viewport.y - pageY)) / viewport.width // viewport.width intentional
            );
        }
        function getRotateFactor() {
            var aspectRatio = input.width / input.height;
            return p.rotateSpeed * input.pixelRatio * aspectRatio;
        }
        var rotAxis = Vec3();
        var rotQuat = Quat();
        var rotEyeDir = Vec3();
        var rotObjUpDir = Vec3();
        var rotObjSideDir = Vec3();
        var rotMoveDir = Vec3();
        function rotateCamera() {
            var dx = _rotCurr[0] - _rotPrev[0];
            var dy = _rotCurr[1] - _rotPrev[1];
            Vec3.set(rotMoveDir, dx, dy, 0);
            var angle = Vec3.magnitude(rotMoveDir) * getRotateFactor();
            if (angle) {
                Vec3.sub(_eye, camera.position, camera.target);
                Vec3.normalize(rotEyeDir, _eye);
                Vec3.normalize(rotObjUpDir, camera.up);
                Vec3.normalize(rotObjSideDir, Vec3.cross(rotObjSideDir, rotObjUpDir, rotEyeDir));
                Vec3.setMagnitude(rotObjUpDir, rotObjUpDir, dy);
                Vec3.setMagnitude(rotObjSideDir, rotObjSideDir, dx);
                Vec3.add(rotMoveDir, rotObjUpDir, rotObjSideDir);
                Vec3.normalize(rotAxis, Vec3.cross(rotAxis, rotMoveDir, _eye));
                Quat.setAxisAngle(rotQuat, rotAxis, angle);
                Vec3.transformQuat(_eye, _eye, rotQuat);
                Vec3.transformQuat(camera.up, camera.up, rotQuat);
                Vec3.copy(_rotLastAxis, rotAxis);
                _rotLastAngle = angle;
            }
            else if (!p.staticMoving && _rotLastAngle) {
                _rotLastAngle *= Math.sqrt(1.0 - p.dynamicDampingFactor);
                Vec3.sub(_eye, camera.position, camera.target);
                Quat.setAxisAngle(rotQuat, _rotLastAxis, _rotLastAngle);
                Vec3.transformQuat(_eye, _eye, rotQuat);
                Vec3.transformQuat(camera.up, camera.up, rotQuat);
            }
            Vec2.copy(_rotPrev, _rotCurr);
        }
        var rollQuat = Quat();
        var rollDir = Vec3();
        function rollCamera() {
            var k = (keyState.rollRight - keyState.rollLeft) / 45;
            var dx = (_rollCurr[0] - _rollPrev[0]) * -Math.sign(_rollCurr[1]);
            var dy = (_rollCurr[1] - _rollPrev[1]) * -Math.sign(_rollCurr[0]);
            var angle = -p.rotateSpeed * (-dx + dy) + k;
            if (angle) {
                Vec3.normalize(rollDir, _eye);
                Quat.setAxisAngle(rollQuat, rollDir, angle);
                Vec3.transformQuat(camera.up, camera.up, rollQuat);
                _rollLastAngle = angle;
            }
            else if (!p.staticMoving && _rollLastAngle) {
                _rollLastAngle *= Math.sqrt(1.0 - p.dynamicDampingFactor);
                Vec3.normalize(rollDir, _eye);
                Quat.setAxisAngle(rollQuat, rollDir, _rollLastAngle);
                Vec3.transformQuat(camera.up, camera.up, rollQuat);
            }
            Vec2.copy(_rollPrev, _rollCurr);
        }
        var pitchQuat = Quat();
        var pitchDir = Vec3();
        function pitchCamera() {
            var m = (keyState.pitchUp - keyState.pitchDown) / (p.flyMode ? 360 : 90);
            var angle = -p.rotateSpeed * m;
            if (angle) {
                Vec3.cross(pitchDir, _eye, camera.up);
                Vec3.normalize(pitchDir, pitchDir);
                Quat.setAxisAngle(pitchQuat, pitchDir, angle);
                Vec3.transformQuat(_eye, _eye, pitchQuat);
                Vec3.transformQuat(camera.up, camera.up, pitchQuat);
                _pitchLastAngle = angle;
            }
            else if (!p.staticMoving && _pitchLastAngle) {
                _pitchLastAngle *= Math.sqrt(1.0 - p.dynamicDampingFactor);
                Vec3.cross(pitchDir, _eye, camera.up);
                Vec3.normalize(pitchDir, pitchDir);
                Quat.setAxisAngle(pitchQuat, pitchDir, _pitchLastAngle);
                Vec3.transformQuat(_eye, _eye, pitchQuat);
                Vec3.transformQuat(camera.up, camera.up, pitchQuat);
            }
        }
        var yawQuat = Quat();
        var yawDir = Vec3();
        function yawCamera() {
            var m = (keyState.yawRight - keyState.yawLeft) / (p.flyMode ? 360 : 90);
            var angle = -p.rotateSpeed * m;
            if (angle) {
                Vec3.normalize(yawDir, camera.up);
                Quat.setAxisAngle(yawQuat, yawDir, angle);
                Vec3.transformQuat(_eye, _eye, yawQuat);
                Vec3.transformQuat(camera.up, camera.up, yawQuat);
                _yawLastAngle = angle;
            }
            else if (!p.staticMoving && _yawLastAngle) {
                _yawLastAngle *= Math.sqrt(1.0 - p.dynamicDampingFactor);
                Vec3.normalize(yawDir, camera.up);
                Quat.setAxisAngle(yawQuat, yawDir, _yawLastAngle);
                Vec3.transformQuat(_eye, _eye, yawQuat);
                Vec3.transformQuat(camera.up, camera.up, yawQuat);
            }
        }
        function zoomCamera() {
            var factor = 1.0 + (_zoomEnd[1] - _zoomStart[1]) * p.zoomSpeed;
            if (factor !== 1.0 && factor > 0.0) {
                Vec3.scale(_eye, _eye, factor);
            }
            if (p.staticMoving) {
                Vec2.copy(_zoomStart, _zoomEnd);
            }
            else {
                _zoomStart[1] += (_zoomEnd[1] - _zoomStart[1]) * p.dynamicDampingFactor;
            }
        }
        function focusCamera() {
            var factor = (_focusEnd[1] - _focusStart[1]) * p.zoomSpeed;
            if (factor !== 0.0) {
                var radius = Math.max(1, camera.state.radius + camera.state.radius * factor);
                camera.setState({ radius: radius });
            }
            if (p.staticMoving) {
                Vec2.copy(_focusStart, _focusEnd);
            }
            else {
                _focusStart[1] += (_focusEnd[1] - _focusStart[1]) * p.dynamicDampingFactor;
            }
        }
        var panMouseChange = Vec2();
        var panObjUp = Vec3();
        var panOffset = Vec3();
        function panCamera() {
            Vec2.sub(panMouseChange, Vec2.copy(panMouseChange, _panEnd), _panStart);
            if (Vec2.squaredMagnitude(panMouseChange)) {
                var factor = input.pixelRatio * p.panSpeed;
                panMouseChange[0] *= (1 / camera.zoom) * camera.viewport.width * factor;
                panMouseChange[1] *= (1 / camera.zoom) * camera.viewport.height * factor;
                Vec3.cross(panOffset, Vec3.copy(panOffset, _eye), camera.up);
                Vec3.setMagnitude(panOffset, panOffset, panMouseChange[0]);
                Vec3.setMagnitude(panObjUp, camera.up, panMouseChange[1]);
                Vec3.add(panOffset, panOffset, panObjUp);
                Vec3.add(camera.position, camera.position, panOffset);
                Vec3.add(camera.target, camera.target, panOffset);
                if (p.staticMoving) {
                    Vec2.copy(_panStart, _panEnd);
                }
                else {
                    Vec2.sub(panMouseChange, _panEnd, _panStart);
                    Vec2.scale(panMouseChange, panMouseChange, p.dynamicDampingFactor);
                    Vec2.add(_panStart, _panStart, panMouseChange);
                }
            }
        }
        var keyState = {
            moveUp: 0, moveDown: 0, moveLeft: 0, moveRight: 0, moveForward: 0, moveBack: 0,
            pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0,
            boostMove: 0,
        };
        var moveDir = Vec3();
        var moveEye = Vec3();
        function moveCamera(deltaT) {
            Vec3.sub(moveEye, camera.position, camera.target);
            var minDistance = Math.max(camera.state.minNear, p.minDistance);
            Vec3.setMagnitude(moveEye, moveEye, minDistance);
            var moveSpeed = deltaT * (60 / 1000) * p.moveSpeed * (keyState.boostMove === 1 ? p.boostMoveFactor : 1);
            if (keyState.moveForward === 1) {
                Vec3.normalize(moveDir, moveEye);
                Vec3.scaleAndSub(camera.position, camera.position, moveDir, moveSpeed);
                var dt = Vec3.distance(camera.target, camera.position);
                var ds = Vec3.distance(scene.boundingSphereVisible.center, camera.position);
                if (p.flyMode || input.pointerLock || (dt < minDistance && ds < camera.state.radiusMax)) {
                    Vec3.sub(camera.target, camera.position, moveEye);
                }
            }
            if (keyState.moveBack === 1) {
                Vec3.normalize(moveDir, moveEye);
                Vec3.scaleAndAdd(camera.position, camera.position, moveDir, moveSpeed);
                if (p.flyMode || input.pointerLock) {
                    Vec3.sub(camera.target, camera.position, moveEye);
                }
            }
            if (keyState.moveLeft === 1) {
                Vec3.cross(moveDir, moveEye, camera.up);
                Vec3.normalize(moveDir, moveDir);
                if (p.flyMode || input.pointerLock) {
                    Vec3.scaleAndAdd(camera.position, camera.position, moveDir, moveSpeed);
                    Vec3.sub(camera.target, camera.position, moveEye);
                }
                else {
                    Vec3.scaleAndSub(camera.position, camera.position, moveDir, moveSpeed);
                    Vec3.sub(camera.target, camera.position, _eye);
                }
            }
            if (keyState.moveRight === 1) {
                Vec3.cross(moveDir, moveEye, camera.up);
                Vec3.normalize(moveDir, moveDir);
                if (p.flyMode || input.pointerLock) {
                    Vec3.scaleAndSub(camera.position, camera.position, moveDir, moveSpeed);
                    Vec3.sub(camera.target, camera.position, moveEye);
                }
                else {
                    Vec3.scaleAndAdd(camera.position, camera.position, moveDir, moveSpeed);
                    Vec3.sub(camera.target, camera.position, _eye);
                }
            }
            if (keyState.moveUp === 1) {
                Vec3.normalize(moveDir, camera.up);
                if (p.flyMode || input.pointerLock) {
                    Vec3.scaleAndAdd(camera.position, camera.position, moveDir, moveSpeed);
                    Vec3.sub(camera.target, camera.position, moveEye);
                }
                else {
                    Vec3.scaleAndSub(camera.position, camera.position, moveDir, moveSpeed);
                    Vec3.sub(camera.target, camera.position, _eye);
                }
            }
            if (keyState.moveDown === 1) {
                Vec3.normalize(moveDir, camera.up);
                if (p.flyMode || input.pointerLock) {
                    Vec3.scaleAndSub(camera.position, camera.position, moveDir, moveSpeed);
                    Vec3.sub(camera.target, camera.position, moveEye);
                }
                else {
                    Vec3.scaleAndAdd(camera.position, camera.position, moveDir, moveSpeed);
                    Vec3.sub(camera.target, camera.position, _eye);
                }
            }
            if (p.flyMode || input.pointerLock) {
                var cameraDistance = Vec3.distance(camera.position, scene.boundingSphereVisible.center);
                camera.setState({ minFar: cameraDistance + scene.boundingSphereVisible.radius });
            }
        }
        /**
         * Ensure the distance between object and target is within the min/max distance
         * and not too large compared to `camera.state.radiusMax`
         */
        function checkDistances() {
            var maxDistance = Math.min(Math.max(camera.state.radiusMax * 1000, 0.01), p.maxDistance);
            if (Vec3.squaredMagnitude(_eye) > maxDistance * maxDistance) {
                Vec3.setMagnitude(_eye, _eye, maxDistance);
                Vec3.add(camera.position, camera.target, _eye);
                Vec2.copy(_zoomStart, _zoomEnd);
                Vec2.copy(_focusStart, _focusEnd);
            }
            if (Vec3.squaredMagnitude(_eye) < p.minDistance * p.minDistance) {
                Vec3.setMagnitude(_eye, _eye, p.minDistance);
                Vec3.add(camera.position, camera.target, _eye);
                Vec2.copy(_zoomStart, _zoomEnd);
                Vec2.copy(_focusStart, _focusEnd);
            }
        }
        function outsideViewport(x, y) {
            x *= input.pixelRatio;
            y *= input.pixelRatio;
            return (x > viewport.x + viewport.width ||
                input.height - y > viewport.y + viewport.height ||
                x < viewport.x ||
                input.height - y < viewport.y);
        }
        var lastUpdated = -1;
        /** Update the object's position, direction and up vectors */
        function update(t) {
            if (lastUpdated === t)
                return;
            var deltaT = t - lastUpdated;
            if (lastUpdated > 0) {
                if (p.animate.name === 'spin')
                    spin(deltaT);
                else if (p.animate.name === 'rock')
                    rock(deltaT);
            }
            Vec3.sub(_eye, camera.position, camera.target);
            rotateCamera();
            rollCamera();
            pitchCamera();
            yawCamera();
            zoomCamera();
            focusCamera();
            panCamera();
            Vec3.add(camera.position, camera.target, _eye);
            checkDistances();
            if (lastUpdated > 0) {
                // clamp the maximum step size at 15 frames to avoid too big jumps
                // TODO: make this a parameter?
                moveCamera(Math.min(deltaT, 15 * 1000 / 60));
            }
            Vec3.sub(_eye, camera.position, camera.target);
            checkDistances();
            if (Vec3.squaredDistance(lastPosition, camera.position) > EPSILON) {
                Vec3.copy(lastPosition, camera.position);
            }
            lastUpdated = t;
        }
        /** Reset object's vectors and the target vector to their initial values */
        function reset() {
            Vec3.copy(camera.target, target0);
            Vec3.copy(camera.position, position0);
            Vec3.copy(camera.up, up0);
            Vec3.sub(_eye, camera.position, camera.target);
            Vec3.copy(lastPosition, camera.position);
        }
        // listeners
        function onDrag(_a) {
            var x = _a.x, y = _a.y, pageX = _a.pageX, pageY = _a.pageY, buttons = _a.buttons, modifiers = _a.modifiers, isStart = _a.isStart;
            var isOutside = outsideViewport(x, y);
            if (isStart && isOutside)
                return;
            if (!isStart && !_isInteracting)
                return;
            _isInteracting = true;
            resetRock(); // start rocking from the center after interactions
            var dragRotate = Binding.match(b.dragRotate, buttons, modifiers);
            var dragRotateZ = Binding.match(b.dragRotateZ, buttons, modifiers);
            var dragPan = Binding.match(b.dragPan, buttons, modifiers);
            var dragZoom = Binding.match(b.dragZoom, buttons, modifiers);
            var dragFocus = Binding.match(b.dragFocus, buttons, modifiers);
            var dragFocusZoom = Binding.match(b.dragFocusZoom, buttons, modifiers);
            getMouseOnCircle(pageX, pageY);
            getMouseOnScreen(pageX, pageY);
            var pr = input.pixelRatio;
            var vx = (x * pr - viewport.width / 2 - viewport.x) / viewport.width;
            var vy = -(input.height - y * pr - viewport.height / 2 - viewport.y) / viewport.height;
            if (isStart) {
                if (dragRotate) {
                    Vec2.copy(_rotCurr, mouseOnCircleVec2);
                    Vec2.copy(_rotPrev, _rotCurr);
                }
                if (dragRotateZ) {
                    Vec2.set(_rollCurr, vx, vy);
                    Vec2.copy(_rollPrev, _rollCurr);
                }
                if (dragZoom || dragFocusZoom) {
                    Vec2.copy(_zoomStart, mouseOnScreenVec2);
                    Vec2.copy(_zoomEnd, _zoomStart);
                }
                if (dragFocus) {
                    Vec2.copy(_focusStart, mouseOnScreenVec2);
                    Vec2.copy(_focusEnd, _focusStart);
                }
                if (dragPan) {
                    Vec2.copy(_panStart, mouseOnScreenVec2);
                    Vec2.copy(_panEnd, _panStart);
                }
            }
            if (dragRotate)
                Vec2.copy(_rotCurr, mouseOnCircleVec2);
            if (dragRotateZ)
                Vec2.set(_rollCurr, vx, vy);
            if (dragZoom || dragFocusZoom)
                Vec2.copy(_zoomEnd, mouseOnScreenVec2);
            if (dragFocus)
                Vec2.copy(_focusEnd, mouseOnScreenVec2);
            if (dragFocusZoom) {
                var dist = Vec3.distance(camera.state.position, camera.state.target);
                camera.setState({ radius: dist / 5 });
            }
            if (dragPan)
                Vec2.copy(_panEnd, mouseOnScreenVec2);
        }
        function onInteractionEnd() {
            _isInteracting = false;
        }
        function onWheel(_a) {
            var x = _a.x, y = _a.y, spinX = _a.spinX, spinY = _a.spinY, dz = _a.dz, buttons = _a.buttons, modifiers = _a.modifiers;
            if (outsideViewport(x, y))
                return;
            var delta = absMax(spinX * 0.075, spinY * 0.075, dz * 0.0001);
            if (delta < -p.maxWheelDelta)
                delta = -p.maxWheelDelta;
            else if (delta > p.maxWheelDelta)
                delta = p.maxWheelDelta;
            if (Binding.match(b.scrollZoom, buttons, modifiers)) {
                _zoomEnd[1] += delta;
            }
            if (Binding.match(b.scrollFocus, buttons, modifiers)) {
                _focusEnd[1] += delta;
            }
        }
        function onPinch(_a) {
            var fractionDelta = _a.fractionDelta, buttons = _a.buttons, modifiers = _a.modifiers;
            if (Binding.match(b.scrollZoom, buttons, modifiers)) {
                _isInteracting = true;
                _zoomEnd[1] += p.gestureScaleFactor * fractionDelta;
            }
        }
        function onGesture(_a) {
            var deltaScale = _a.deltaScale;
            _isInteracting = true;
            _zoomEnd[1] += p.gestureScaleFactor * deltaScale;
        }
        function onMove(_a) {
            var movementX = _a.movementX, movementY = _a.movementY;
            if (!input.pointerLock || movementX === undefined || movementY === undefined)
                return;
            var cx = viewport.width * 0.5 - viewport.x;
            var cy = viewport.height * 0.5 - viewport.y;
            Vec2.copy(_rotPrev, getMouseOnCircle(cx, cy));
            Vec2.copy(_rotCurr, getMouseOnCircle(movementX + cx, movementY + cy));
        }
        function onKeyDown(_a) {
            var modifiers = _a.modifiers, code = _a.code, x = _a.x, y = _a.y;
            if (outsideViewport(x, y))
                return;
            if (Binding.matchKey(b.keyMoveForward, code, modifiers)) {
                keyState.moveForward = 1;
            }
            else if (Binding.matchKey(b.keyMoveBack, code, modifiers)) {
                keyState.moveBack = 1;
            }
            else if (Binding.matchKey(b.keyMoveLeft, code, modifiers)) {
                keyState.moveLeft = 1;
            }
            else if (Binding.matchKey(b.keyMoveRight, code, modifiers)) {
                keyState.moveRight = 1;
            }
            else if (Binding.matchKey(b.keyMoveUp, code, modifiers)) {
                keyState.moveUp = 1;
            }
            else if (Binding.matchKey(b.keyMoveDown, code, modifiers)) {
                keyState.moveDown = 1;
            }
            else if (Binding.matchKey(b.keyRollLeft, code, modifiers)) {
                keyState.rollLeft = 1;
            }
            else if (Binding.matchKey(b.keyRollRight, code, modifiers)) {
                keyState.rollRight = 1;
            }
            else if (Binding.matchKey(b.keyPitchUp, code, modifiers)) {
                keyState.pitchUp = 1;
            }
            else if (Binding.matchKey(b.keyPitchDown, code, modifiers)) {
                keyState.pitchDown = 1;
            }
            else if (Binding.matchKey(b.keyYawLeft, code, modifiers)) {
                keyState.yawLeft = 1;
            }
            else if (Binding.matchKey(b.keyYawRight, code, modifiers)) {
                keyState.yawRight = 1;
            }
            if (Binding.matchKey(b.boostMove, code, modifiers)) {
                keyState.boostMove = 1;
            }
            if (Binding.matchKey(b.enablePointerLock, code, modifiers)) {
                input.requestPointerLock(viewport);
            }
        }
        function onKeyUp(_a) {
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            var modifiers = _a.modifiers, code = _a.code, x = _a.x, y = _a.y;
            if (outsideViewport(x, y))
                return;
            var isModifierCode = false;
            if (code.startsWith('Alt')) {
                isModifierCode = true;
                modifiers.alt = true;
            }
            else if (code.startsWith('Shift')) {
                isModifierCode = true;
                modifiers.shift = true;
            }
            else if (code.startsWith('Control')) {
                isModifierCode = true;
                modifiers.control = true;
            }
            else if (code.startsWith('Meta')) {
                isModifierCode = true;
                modifiers.meta = true;
            }
            var codes = [];
            if (isModifierCode) {
                if (keyState.moveForward)
                    codes.push(((_b = b.keyMoveForward.triggers[0]) === null || _b === void 0 ? void 0 : _b.code) || '');
                if (keyState.moveBack)
                    codes.push(((_c = b.keyMoveBack.triggers[0]) === null || _c === void 0 ? void 0 : _c.code) || '');
                if (keyState.moveLeft)
                    codes.push(((_d = b.keyMoveLeft.triggers[0]) === null || _d === void 0 ? void 0 : _d.code) || '');
                if (keyState.moveRight)
                    codes.push(((_e = b.keyMoveRight.triggers[0]) === null || _e === void 0 ? void 0 : _e.code) || '');
                if (keyState.moveUp)
                    codes.push(((_f = b.keyMoveUp.triggers[0]) === null || _f === void 0 ? void 0 : _f.code) || '');
                if (keyState.moveDown)
                    codes.push(((_g = b.keyMoveDown.triggers[0]) === null || _g === void 0 ? void 0 : _g.code) || '');
                if (keyState.rollLeft)
                    codes.push(((_h = b.keyRollLeft.triggers[0]) === null || _h === void 0 ? void 0 : _h.code) || '');
                if (keyState.rollRight)
                    codes.push(((_j = b.keyRollRight.triggers[0]) === null || _j === void 0 ? void 0 : _j.code) || '');
                if (keyState.pitchUp)
                    codes.push(((_k = b.keyPitchUp.triggers[0]) === null || _k === void 0 ? void 0 : _k.code) || '');
                if (keyState.pitchDown)
                    codes.push(((_l = b.keyPitchDown.triggers[0]) === null || _l === void 0 ? void 0 : _l.code) || '');
                if (keyState.yawLeft)
                    codes.push(((_m = b.keyYawLeft.triggers[0]) === null || _m === void 0 ? void 0 : _m.code) || '');
                if (keyState.yawRight)
                    codes.push(((_o = b.keyYawRight.triggers[0]) === null || _o === void 0 ? void 0 : _o.code) || '');
            }
            else {
                codes.push(code);
            }
            for (var _i = 0, codes_1 = codes; _i < codes_1.length; _i++) {
                var code_1 = codes_1[_i];
                if (Binding.matchKey(b.keyMoveForward, code_1, modifiers)) {
                    keyState.moveForward = 0;
                }
                else if (Binding.matchKey(b.keyMoveBack, code_1, modifiers)) {
                    keyState.moveBack = 0;
                }
                else if (Binding.matchKey(b.keyMoveLeft, code_1, modifiers)) {
                    keyState.moveLeft = 0;
                }
                else if (Binding.matchKey(b.keyMoveRight, code_1, modifiers)) {
                    keyState.moveRight = 0;
                }
                else if (Binding.matchKey(b.keyMoveUp, code_1, modifiers)) {
                    keyState.moveUp = 0;
                }
                else if (Binding.matchKey(b.keyMoveDown, code_1, modifiers)) {
                    keyState.moveDown = 0;
                }
                else if (Binding.matchKey(b.keyRollLeft, code_1, modifiers)) {
                    keyState.rollLeft = 0;
                }
                else if (Binding.matchKey(b.keyRollRight, code_1, modifiers)) {
                    keyState.rollRight = 0;
                }
                else if (Binding.matchKey(b.keyPitchUp, code_1, modifiers)) {
                    keyState.pitchUp = 0;
                }
                else if (Binding.matchKey(b.keyPitchDown, code_1, modifiers)) {
                    keyState.pitchDown = 0;
                }
                else if (Binding.matchKey(b.keyYawLeft, code_1, modifiers)) {
                    keyState.yawLeft = 0;
                }
                else if (Binding.matchKey(b.keyYawRight, code_1, modifiers)) {
                    keyState.yawRight = 0;
                }
            }
            if (Binding.matchKey(b.boostMove, code, modifiers)) {
                keyState.boostMove = 0;
            }
        }
        function initCameraMove() {
            Vec3.sub(moveEye, camera.position, camera.target);
            var minDistance = Math.max(camera.state.minNear, p.minDistance);
            Vec3.setMagnitude(moveEye, moveEye, minDistance);
            Vec3.sub(camera.target, camera.position, moveEye);
            var cameraDistance = Vec3.distance(camera.position, scene.boundingSphereVisible.center);
            camera.setState({ minFar: cameraDistance + scene.boundingSphereVisible.radius });
        }
        function resetCameraMove() {
            var _a = scene.boundingSphereVisible, center = _a.center, radius = _a.radius;
            var cameraDistance = Vec3.distance(camera.position, center);
            if (cameraDistance > radius) {
                var focus_1 = camera.getFocus(center, radius);
                camera.setState(__assign(__assign({}, focus_1), { minFar: 0 }));
            }
            else {
                camera.setState({
                    minFar: 0,
                    radius: scene.boundingSphereVisible.radius,
                });
            }
        }
        function onLock(isLocked) {
            if (isLocked) {
                initCameraMove();
            }
            else {
                resetCameraMove();
            }
        }
        function unsetKeyState() {
            keyState.moveForward = 0;
            keyState.moveBack = 0;
            keyState.moveLeft = 0;
            keyState.moveRight = 0;
            keyState.moveUp = 0;
            keyState.moveDown = 0;
            keyState.rollLeft = 0;
            keyState.rollRight = 0;
            keyState.pitchUp = 0;
            keyState.pitchDown = 0;
            keyState.yawLeft = 0;
            keyState.yawRight = 0;
            keyState.boostMove = 0;
        }
        function onLeave() {
            unsetKeyState();
        }
        function dispose() {
            if (disposed)
                return;
            disposed = true;
            dragSub.unsubscribe();
            wheelSub.unsubscribe();
            pinchSub.unsubscribe();
            gestureSub.unsubscribe();
            interactionEndSub.unsubscribe();
            keyDownSub.unsubscribe();
            keyUpSub.unsubscribe();
            moveSub.unsubscribe();
            lockSub.unsubscribe();
            leaveSub.unsubscribe();
        }
        var _spinSpeed = Vec2.create(0.005, 0);
        function spin(deltaT) {
            if (p.animate.name !== 'spin' || p.animate.params.speed === 0 || _isInteracting)
                return;
            var frameSpeed = p.animate.params.speed / 1000;
            _spinSpeed[0] = 60 * Math.min(Math.abs(deltaT), 1000 / 8) / 1000 * frameSpeed;
            Vec2.add(_rotCurr, _rotPrev, _spinSpeed);
        }
        var _rockPhase = 0;
        var _rockSpeed = Vec2.create(0.005, 0);
        function rock(deltaT) {
            if (p.animate.name !== 'rock' || p.animate.params.speed === 0 || _isInteracting)
                return;
            var dt = deltaT / 1000 * p.animate.params.speed;
            var maxAngle = degToRad(p.animate.params.angle) / getRotateFactor();
            var angleA = Math.sin(_rockPhase * Math.PI * 2) * maxAngle;
            var angleB = Math.sin((_rockPhase + dt) * Math.PI * 2) * maxAngle;
            _rockSpeed[0] = angleB - angleA;
            Vec2.add(_rotCurr, _rotPrev, _rockSpeed);
            _rockPhase += dt;
            if (_rockPhase >= 1) {
                _rockPhase = 0;
            }
        }
        function resetRock() {
            _rockPhase = 0;
        }
        function start(t) {
            lastUpdated = -1;
            update(t);
        }
        return {
            viewport: viewport,
            get isAnimating() { return p.animate.name !== 'off'; },
            get isMoving() {
                return (keyState.moveForward === 1 || keyState.moveBack === 1 ||
                    keyState.moveLeft === 1 || keyState.moveRight === 1 ||
                    keyState.moveUp === 1 || keyState.moveDown === 1 ||
                    keyState.rollLeft === 1 || keyState.rollRight === 1 ||
                    keyState.pitchUp === 1 || keyState.pitchDown === 1 ||
                    keyState.yawLeft === 1 || keyState.yawRight === 1);
            },
            get props() { return p; },
            setProps: function (props) {
                var _a;
                if (((_a = props.animate) === null || _a === void 0 ? void 0 : _a.name) === 'rock' && p.animate.name !== 'rock') {
                    resetRock(); // start rocking from the center
                }
                if (props.flyMode !== undefined && props.flyMode !== p.flyMode) {
                    if (props.flyMode) {
                        initCameraMove();
                    }
                    else {
                        resetCameraMove();
                    }
                }
                Object.assign(p, props);
                Object.assign(b, props.bindings);
            },
            start: start,
            update: update,
            reset: reset,
            dispose: dispose
        };
    }
    TrackballControls.create = create;
})(TrackballControls || (TrackballControls = {}));
