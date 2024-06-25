/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import produce from 'immer';
import { Interval } from '../../mol-data/int/interval';
import { addCylinder } from '../../mol-geo/geometry/mesh/builder/cylinder';
import { addSphere } from '../../mol-geo/geometry/mesh/builder/sphere';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { MeshBuilder } from '../../mol-geo/geometry/mesh/mesh-builder';
import { Text } from '../../mol-geo/geometry/text/text';
import { TextBuilder } from '../../mol-geo/geometry/text/text-builder';
import { Scene } from '../../mol-gl/scene';
import { GraphicsRenderVariantsBlended } from '../../mol-gl/webgl/render-item';
import { Sphere3D } from '../../mol-math/geometry';
import { Mat4, Vec3 } from '../../mol-math/linear-algebra';
import { DataLoci, EmptyLoci, isEveryLoci } from '../../mol-model/loci';
import { Shape } from '../../mol-model/shape';
import { Visual } from '../../mol-repr/visual';
import { ColorNames } from '../../mol-util/color/names';
import { MarkerActions } from '../../mol-util/marker-action';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { assertUnreachable } from '../../mol-util/type-helpers';
import { Camera } from '../camera';
// TODO add scale line/grid
var AxesParams = {
    alpha: PD.Numeric(0.51, { min: 0, max: 1, step: 0.01 }, { isEssential: true, label: 'Opacity' }),
    colorX: PD.Color(ColorNames.red, { isEssential: true }),
    colorY: PD.Color(ColorNames.green, { isEssential: true }),
    colorZ: PD.Color(ColorNames.blue, { isEssential: true }),
    scale: PD.Numeric(0.33, { min: 0.1, max: 2, step: 0.1 }, { isEssential: true }),
    location: PD.Select('bottom-left', PD.arrayToOptions(['bottom-left', 'bottom-right', 'top-left', 'top-right'])),
    locationOffsetX: PD.Numeric(0),
    locationOffsetY: PD.Numeric(0),
    originColor: PD.Color(ColorNames.grey),
    radiusScale: PD.Numeric(0.075, { min: 0.01, max: 0.3, step: 0.001 }),
    showPlanes: PD.Boolean(true),
    planeColorXY: PD.Color(ColorNames.grey, { label: 'Plane Color XY' }),
    planeColorXZ: PD.Color(ColorNames.grey, { label: 'Plane Color XZ' }),
    planeColorYZ: PD.Color(ColorNames.grey, { label: 'Plane Color YZ' }),
    showLabels: PD.Boolean(false),
    labelX: PD.Text('X'),
    labelY: PD.Text('Y'),
    labelZ: PD.Text('Z'),
    labelColorX: PD.Color(ColorNames.grey),
    labelColorY: PD.Color(ColorNames.grey),
    labelColorZ: PD.Color(ColorNames.grey),
    labelOpacity: PD.Numeric(1, { min: 0, max: 1, step: 0.01 }),
    labelScale: PD.Numeric(0.25, { min: 0.1, max: 1.0, step: 0.01 }),
};
export var CameraHelperParams = {
    axes: PD.MappedStatic('on', {
        on: PD.Group(AxesParams),
        off: PD.Group({})
    }, { cycle: true, description: 'Show camera orientation axes' }),
};
var CameraHelper = /** @class */ (function () {
    function CameraHelper(webgl, props) {
        if (props === void 0) { props = {}; }
        var _this = this;
        this.webgl = webgl;
        this.props = {
            axes: { name: 'off', params: {} }
        };
        this.pixelRatio = 1;
        this.eachGroup = function (loci, apply) {
            if (!isCameraAxesLoci(loci))
                return false;
            var changed = false;
            if (_this.meshRenderObject) {
                var groupCount = _this.meshRenderObject.values.uGroupCount.ref.value;
                for (var _i = 0, _a = loci.elements; _i < _a.length; _i++) {
                    var _b = _a[_i], groupId = _b.groupId, instanceId = _b.instanceId;
                    var idx = instanceId * groupCount + groupId;
                    if (apply(Interval.ofSingleton(idx)))
                        changed = true;
                }
            }
            if (_this.textRenderObject) {
                var groupCount = _this.textRenderObject.values.uGroupCount.ref.value;
                for (var _c = 0, _d = loci.elements; _c < _d.length; _c++) {
                    var _e = _d[_c], groupId = _e.groupId, instanceId = _e.instanceId;
                    var idx = instanceId * groupCount + groupId;
                    if (apply(Interval.ofSingleton(idx)))
                        changed = true;
                }
            }
            return changed;
        };
        this.scene = Scene.create(webgl, GraphicsRenderVariantsBlended);
        this.camera = new Camera();
        Vec3.set(this.camera.up, 0, 1, 0);
        Vec3.set(this.camera.target, 0, 0, 0);
        this.setProps(props);
    }
    CameraHelper.prototype.setProps = function (props) {
        var _this = this;
        this.props = produce(this.props, function (p) {
            if (props.axes !== undefined) {
                p.axes.name = props.axes.name;
                if (props.axes.name === 'on') {
                    _this.scene.clear();
                    _this.pixelRatio = _this.webgl.pixelRatio;
                    var params = __assign(__assign({}, props.axes.params), { scale: props.axes.params.scale * _this.pixelRatio, labelScale: props.axes.params.labelScale * _this.pixelRatio });
                    _this.meshRenderObject = createMeshRenderObject(params);
                    _this.scene.add(_this.meshRenderObject);
                    if (props.axes.params.showLabels) {
                        _this.textRenderObject = createTextRenderObject(params);
                        _this.scene.add(_this.textRenderObject);
                    }
                    else {
                        _this.textRenderObject = undefined;
                    }
                    _this.scene.commit();
                    Vec3.set(_this.camera.position, 0, 0, params.scale * 200);
                    Mat4.lookAt(_this.camera.view, _this.camera.position, _this.camera.target, _this.camera.up);
                    p.axes.params = __assign({}, props.axes.params);
                }
            }
        });
    };
    Object.defineProperty(CameraHelper.prototype, "isEnabled", {
        get: function () {
            return this.props.axes.name === 'on';
        },
        enumerable: false,
        configurable: true
    });
    CameraHelper.prototype.getLoci = function (pickingId) {
        var objectId = pickingId.objectId, groupId = pickingId.groupId, instanceId = pickingId.instanceId;
        if (((!this.meshRenderObject || objectId !== this.meshRenderObject.id) &&
            (!this.textRenderObject || objectId !== this.textRenderObject.id)) || groupId === CameraHelperAxis.None)
            return EmptyLoci;
        return CameraAxesLoci(this, groupId, instanceId);
    };
    CameraHelper.prototype.mark = function (loci, action) {
        if (!MarkerActions.is(MarkerActions.Highlighting, action))
            return false;
        if (!isEveryLoci(loci)) {
            if (!isCameraAxesLoci(loci))
                return false;
            if (loci.data !== this)
                return false;
        }
        return (Visual.mark(this.meshRenderObject, loci, action, this.eachGroup) ||
            Visual.mark(this.textRenderObject, loci, action, this.eachGroup));
    };
    CameraHelper.prototype.update = function (camera) {
        if (!this.meshRenderObject || this.props.axes.name === 'off')
            return;
        if (this.pixelRatio !== this.webgl.pixelRatio) {
            this.setProps(this.props);
        }
        updateCamera(this.camera, camera.viewport, camera.viewOffset);
        Mat4.extractRotation(this.scene.view, camera.view);
        var r = this.textRenderObject
            ? this.textRenderObject.values.boundingSphere.ref.value.radius
            : this.meshRenderObject.values.boundingSphere.ref.value.radius;
        var l = this.props.axes.params.location;
        var ox = this.props.axes.params.locationOffsetX * this.pixelRatio;
        var oy = this.props.axes.params.locationOffsetY * this.pixelRatio;
        if (l === 'bottom-left') {
            Mat4.setTranslation(this.scene.view, Vec3.create(-camera.viewport.width / 2 + r + ox, -camera.viewport.height / 2 + r + oy, 0));
        }
        else if (l === 'bottom-right') {
            Mat4.setTranslation(this.scene.view, Vec3.create(camera.viewport.width / 2 - r - ox, -camera.viewport.height / 2 + r + oy, 0));
        }
        else if (l === 'top-left') {
            Mat4.setTranslation(this.scene.view, Vec3.create(-camera.viewport.width / 2 + r + ox, camera.viewport.height / 2 - r - oy, 0));
        }
        else if (l === 'top-right') {
            Mat4.setTranslation(this.scene.view, Vec3.create(camera.viewport.width / 2 - r - ox, camera.viewport.height / 2 - r - oy, 0));
        }
        else {
            assertUnreachable(l);
        }
    };
    return CameraHelper;
}());
export { CameraHelper };
export var CameraHelperAxis;
(function (CameraHelperAxis) {
    CameraHelperAxis[CameraHelperAxis["None"] = 0] = "None";
    CameraHelperAxis[CameraHelperAxis["X"] = 1] = "X";
    CameraHelperAxis[CameraHelperAxis["Y"] = 2] = "Y";
    CameraHelperAxis[CameraHelperAxis["Z"] = 3] = "Z";
    CameraHelperAxis[CameraHelperAxis["XY"] = 4] = "XY";
    CameraHelperAxis[CameraHelperAxis["XZ"] = 5] = "XZ";
    CameraHelperAxis[CameraHelperAxis["YZ"] = 6] = "YZ";
    CameraHelperAxis[CameraHelperAxis["Origin"] = 7] = "Origin";
})(CameraHelperAxis || (CameraHelperAxis = {}));
function getAxisLabel(axis, cameraHelper) {
    var a = cameraHelper.props.axes;
    var x = a.name === 'on' ? a.params.labelX : 'X';
    var y = a.name === 'on' ? a.params.labelY : 'Y';
    var z = a.name === 'on' ? a.params.labelZ : 'Z';
    switch (axis) {
        case CameraHelperAxis.X: return "".concat(x, " Axis");
        case CameraHelperAxis.Y: return "".concat(y, " Axis");
        case CameraHelperAxis.Z: return "".concat(z, " Axis");
        case CameraHelperAxis.XY: return "".concat(x).concat(y, " Plane");
        case CameraHelperAxis.XZ: return "".concat(x).concat(z, " Plane");
        case CameraHelperAxis.YZ: return "".concat(y).concat(z, " Plane");
        case CameraHelperAxis.Origin: return 'Origin';
        default: return 'Axes';
    }
}
function CameraAxesLoci(cameraHelper, groupId, instanceId) {
    return DataLoci('camera-axes', cameraHelper, [{ groupId: groupId, instanceId: instanceId }], void 0 /** bounding sphere */, function () { return getAxisLabel(groupId, cameraHelper); });
}
export function isCameraAxesLoci(x) {
    return x.kind === 'data-loci' && x.tag === 'camera-axes';
}
function updateCamera(camera, viewport, viewOffset) {
    var near = camera.near, far = camera.far;
    var fullLeft = -viewport.width / 2;
    var fullRight = viewport.width / 2;
    var fullTop = viewport.height / 2;
    var fullBottom = -viewport.height / 2;
    var dx = (fullRight - fullLeft) / 2;
    var dy = (fullTop - fullBottom) / 2;
    var cx = (fullRight + fullLeft) / 2;
    var cy = (fullTop + fullBottom) / 2;
    var left = cx - dx;
    var right = cx + dx;
    var top = cy + dy;
    var bottom = cy - dy;
    if (viewOffset.enabled) {
        var scaleW = (fullRight - fullLeft) / viewOffset.width;
        var scaleH = (fullTop - fullBottom) / viewOffset.height;
        left += scaleW * viewOffset.offsetX;
        right = left + scaleW * viewOffset.width;
        top -= scaleH * viewOffset.offsetY;
        bottom = top - scaleH * viewOffset.height;
    }
    Mat4.ortho(camera.projection, left, right, top, bottom, near, far);
}
function createAxesMesh(props, mesh) {
    var state = MeshBuilder.createState(512, 256, mesh);
    var scale = 100 * props.scale;
    var radius = props.radiusScale * scale;
    var textScale = props.showLabels ? 100 * props.labelScale / 3 : 0;
    var x = Vec3.scale(Vec3(), Vec3.unitX, scale - textScale);
    var y = Vec3.scale(Vec3(), Vec3.unitY, scale - textScale);
    var z = Vec3.scale(Vec3(), Vec3.unitZ, scale - textScale);
    var cylinderProps = { radiusTop: radius, radiusBottom: radius, radialSegments: 32 };
    state.currentGroup = CameraHelperAxis.Origin;
    addSphere(state, Vec3.origin, radius, 2);
    state.currentGroup = CameraHelperAxis.X;
    addSphere(state, x, radius, 2);
    addCylinder(state, Vec3.origin, x, 1, cylinderProps);
    state.currentGroup = CameraHelperAxis.Y;
    addSphere(state, y, radius, 2);
    addCylinder(state, Vec3.origin, y, 1, cylinderProps);
    state.currentGroup = CameraHelperAxis.Z;
    addSphere(state, z, radius, 2);
    addCylinder(state, Vec3.origin, z, 1, cylinderProps);
    if (props.showPlanes) {
        Vec3.scale(x, x, 0.5);
        Vec3.scale(y, y, 0.5);
        Vec3.scale(z, z, 0.5);
        state.currentGroup = CameraHelperAxis.XY;
        MeshBuilder.addTriangle(state, Vec3.origin, x, y);
        MeshBuilder.addTriangle(state, Vec3.origin, y, x);
        var xy = Vec3.add(Vec3(), x, y);
        MeshBuilder.addTriangle(state, xy, x, y);
        MeshBuilder.addTriangle(state, xy, y, x);
        state.currentGroup = CameraHelperAxis.XZ;
        MeshBuilder.addTriangle(state, Vec3.origin, x, z);
        MeshBuilder.addTriangle(state, Vec3.origin, z, x);
        var xz = Vec3.add(Vec3(), x, z);
        MeshBuilder.addTriangle(state, xz, x, z);
        MeshBuilder.addTriangle(state, xz, z, x);
        state.currentGroup = CameraHelperAxis.YZ;
        MeshBuilder.addTriangle(state, Vec3.origin, y, z);
        MeshBuilder.addTriangle(state, Vec3.origin, z, y);
        var yz = Vec3.add(Vec3(), y, z);
        MeshBuilder.addTriangle(state, yz, y, z);
        MeshBuilder.addTriangle(state, yz, z, y);
    }
    return MeshBuilder.getMesh(state);
}
function getAxesMeshShape(props, shape) {
    var scale = 100 * props.scale;
    var mesh = createAxesMesh(props, shape === null || shape === void 0 ? void 0 : shape.geometry);
    mesh.setBoundingSphere(Sphere3D.create(Vec3.create(scale / 2, scale / 2, scale / 2), scale + scale / 4));
    var getColor = function (groupId) {
        switch (groupId) {
            case CameraHelperAxis.X: return props.colorX;
            case CameraHelperAxis.Y: return props.colorY;
            case CameraHelperAxis.Z: return props.colorZ;
            case CameraHelperAxis.XY: return props.planeColorXY;
            case CameraHelperAxis.XZ: return props.planeColorXZ;
            case CameraHelperAxis.YZ: return props.planeColorYZ;
            case CameraHelperAxis.Origin: return props.originColor;
            default: return ColorNames.grey;
        }
    };
    return Shape.create('axes-mesh', {}, mesh, getColor, function () { return 1; }, function () { return ''; });
}
function createMeshRenderObject(props) {
    var shape = getAxesMeshShape(props);
    return Shape.createRenderObject(shape, __assign(__assign(__assign({}, PD.getDefaultValues(Mesh.Params)), props), { ignoreLight: true }));
}
//
function createAxesText(props, text) {
    var builder = TextBuilder.create(props, 8, 8, text);
    var scale = 100 * props.scale;
    var x = Vec3.scale(Vec3(), Vec3.unitX, scale);
    var y = Vec3.scale(Vec3(), Vec3.unitY, scale);
    var z = Vec3.scale(Vec3(), Vec3.unitZ, scale);
    var textScale = 100 * props.labelScale;
    builder.add(props.labelX, x[0], x[1], x[2], 0.0, textScale, CameraHelperAxis.X);
    builder.add(props.labelY, y[0], y[1], y[2], 0.0, textScale, CameraHelperAxis.Y);
    builder.add(props.labelZ, z[0], z[1], z[2], 0.0, textScale, CameraHelperAxis.Z);
    return builder.getText();
}
function getAxesTextShape(props, shape) {
    var scale = 100 * props.scale;
    var text = createAxesText(props, shape === null || shape === void 0 ? void 0 : shape.geometry);
    text.setBoundingSphere(Sphere3D.create(Vec3.create(scale / 2, scale / 2, scale / 2), scale));
    var getColor = function (groupId) {
        switch (groupId) {
            case CameraHelperAxis.X: return props.labelColorX;
            case CameraHelperAxis.Y: return props.labelColorY;
            case CameraHelperAxis.Z: return props.labelColorZ;
            default: return ColorNames.grey;
        }
    };
    return Shape.create('axes-text', {}, text, getColor, function () { return 1; }, function () { return ''; });
}
function createTextRenderObject(props) {
    var shape = getAxesTextShape(props);
    return Shape.createRenderObject(shape, __assign(__assign(__assign({}, PD.getDefaultValues(Text.Params)), props), { alpha: props.labelOpacity }));
}
