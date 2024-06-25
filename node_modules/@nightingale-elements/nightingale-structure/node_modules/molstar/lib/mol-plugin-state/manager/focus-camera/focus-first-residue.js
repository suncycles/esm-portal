import { Vec3 } from '../../..//mol-math/linear-algebra/3d/vec3';
import { PrincipalAxes } from '../../../mol-math/linear-algebra/matrix/principal-axes';
import { Camera } from '../../../mol-canvas3d/camera';
function getPolymerResiduePositions(structure) {
    if (structure.atomicResidueCount === 1)
        return undefined;
    var polymerResidueCount = structure.polymerResidueCount;
    if (polymerResidueCount <= 1)
        return undefined;
    var stride = Math.pow(2, Math.max(Math.ceil(Math.log10(polymerResidueCount / 1000)), 0));
    var size = stride === 1
        ? polymerResidueCount
        : Math.ceil(polymerResidueCount / stride) + structure.units.length;
    var tmpPos = Vec3();
    var positions = new Float32Array(3 * size);
    var o = 0;
    for (var _i = 0, _a = structure.units; _i < _a.length; _i++) {
        var unit = _a[_i];
        var polymerElements = unit.props.polymerElements;
        var position = unit.conformation.position;
        if (polymerElements) {
            for (var i = 0; i < polymerElements.length; i += stride) {
                position(polymerElements[i], tmpPos);
                Vec3.toArray(tmpPos, positions, 3 * o);
                o++;
            }
        }
    }
    return positions.length !== o ? positions.slice(0, 3 * o) : positions;
}
function calculateDisplacement(position, origin, normalDir) {
    var A = normalDir[0];
    var B = normalDir[1];
    var C = normalDir[2];
    var D = -A * origin[0] - B * origin[1] - C * origin[2];
    var x = position[0];
    var y = position[1];
    var z = position[2];
    var displacement = (A * x + B * y + C * z + D) / Math.sqrt(A * A + B * B + C * C);
    return displacement;
}
function getAxesToFlip(position, origin, up, normalDir) {
    var toYAxis = calculateDisplacement(position, origin, normalDir);
    var toXAxis = calculateDisplacement(position, origin, up);
    return {
        aroundX: toXAxis < 0,
        aroundY: toYAxis < 0,
    };
}
function getFirstResidueOrAveragePosition(structure, polymerPositions) {
    if (structure.units.length === 1) {
        // if only one chain, return the coordinates of the first residue
        return Vec3.create(polymerPositions[0], polymerPositions[1], polymerPositions[2]);
    }
    else {
        // if more than one chain, return average of the coordinates of the first polymer chain
        var firstPolymerUnit = structure.units.find(function (u) { return u.props.polymerElements; });
        if (firstPolymerUnit) {
            var pos = Vec3();
            var center = Vec3();
            var polymerElements = firstPolymerUnit.polymerElements, position = firstPolymerUnit.conformation.position;
            for (var i = 0, il = polymerElements.length; i < il; i++) {
                position(polymerElements[i], pos);
                Vec3.add(center, center, pos);
            }
            return Vec3.scale(center, center, 1 / polymerElements.length);
        }
        else {
            return Vec3.create(polymerPositions[0], polymerPositions[1], polymerPositions[2]);
        }
    }
}
export function pcaFocus(plugin, radius, options) {
    if (!plugin.canvas3d)
        return;
    var _a = options.principalAxes.boxAxes, origin = _a.origin, dirA = _a.dirA, dirB = _a.dirB, dirC = _a.dirC;
    var up = Vec3.clone(dirA);
    var dir = Vec3.clone(dirC);
    if (options.positionToFlip) {
        var _b = getAxesToFlip(options.positionToFlip, origin, up, dirB), aroundX = _b.aroundX, aroundY = _b.aroundY;
        if (aroundX) {
            Vec3.negate(dir, dir);
            Vec3.negate(up, up);
        }
        if (aroundY) {
            Vec3.negate(dir, dir);
        }
    }
    var position = Vec3.scale(Vec3(), origin, -100);
    if (Vec3.dot(position, up) <= 0) {
        Vec3.negate(dir, dir);
    }
    if (Vec3.dot(Vec3.unitY, dir) <= 0) {
        Vec3.negate(up, up);
    }
    return plugin.canvas3d.camera.getFocus(origin, radius, up, dir, Camera.createDefaultSnapshot());
}
export function getPcaTransform(group) {
    var _a;
    var structure = (_a = group[0].cell.obj) === null || _a === void 0 ? void 0 : _a.data;
    if (!structure)
        return undefined;
    if ('_pcaTransformData' in structure.currentPropertyData) {
        return structure.currentPropertyData._pcaTransformData;
    }
    var positions = getPolymerResiduePositions(structure);
    if (!positions) {
        structure.currentPropertyData._pcaTransformData = undefined;
        return undefined;
    }
    var positionToFlip = getFirstResidueOrAveragePosition(structure, positions);
    var pcaTransfromData = {
        principalAxes: PrincipalAxes.ofPositions(positions),
        positionToFlip: positionToFlip
    };
    structure.currentPropertyData._pcaTransformData = pcaTransfromData;
    return pcaTransfromData;
}
