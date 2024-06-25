/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
/** Helper functions for manipulation with mesh data. */
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { CIF } from '../../mol-io/reader/cif';
import { Box3D } from '../../mol-math/geometry';
import { Vec3 } from '../../mol-math/linear-algebra';
import { volumeFromDensityServerData } from '../../mol-model-formats/volume/density-server';
import { Grid } from '../../mol-model/volume';
import { ColorNames } from '../../mol-util/color/names';
import { CIF_schema_mesh } from './mesh-cif-schema';
/** Modify mesh in-place */
export function modify(m, params) {
    if (params.scale !== undefined) {
        var _a = params.scale, qx = _a[0], qy = _a[1], qz = _a[2];
        var vertices = m.vertexBuffer.ref.value;
        for (var i = 0; i < vertices.length; i += 3) {
            vertices[i] *= qx;
            vertices[i + 1] *= qy;
            vertices[i + 2] *= qz;
        }
    }
    if (params.shift !== undefined) {
        var _b = params.shift, dx = _b[0], dy = _b[1], dz = _b[2];
        var vertices = m.vertexBuffer.ref.value;
        for (var i = 0; i < vertices.length; i += 3) {
            vertices[i] += dx;
            vertices[i + 1] += dy;
            vertices[i + 2] += dz;
        }
    }
    if (params.matrix !== undefined) {
        var r = m.vertexBuffer.ref.value;
        var matrix = params.matrix;
        var size = 3 * m.vertexCount;
        for (var i = 0; i < size; i += 3) {
            Vec3.transformMat4Offset(r, r, matrix, i, i, 0);
        }
    }
    if (params.group !== undefined) {
        var groups = m.groupBuffer.ref.value;
        for (var i = 0; i < groups.length; i++) {
            groups[i] = params.group;
        }
    }
    if (params.invertSides) {
        var indices = m.indexBuffer.ref.value;
        var tmp = void 0;
        for (var i = 0; i < indices.length; i += 3) {
            tmp = indices[i];
            indices[i] = indices[i + 1];
            indices[i + 1] = tmp;
        }
        var normals = m.normalBuffer.ref.value;
        for (var i = 0; i < normals.length; i++) {
            normals[i] *= -1;
        }
    }
}
/** Create a copy a mesh, possibly modified */
export function copy(m, modification) {
    var nVertices = m.vertexCount;
    var nTriangles = m.triangleCount;
    var vertices = new Float32Array(m.vertexBuffer.ref.value);
    var indices = new Uint32Array(m.indexBuffer.ref.value);
    var normals = new Float32Array(m.normalBuffer.ref.value);
    var groups = new Float32Array(m.groupBuffer.ref.value);
    var result = Mesh.create(vertices, indices, normals, groups, nVertices, nTriangles);
    if (modification) {
        modify(result, modification);
    }
    return result;
}
/** Join more meshes into one */
export function concat() {
    var meshes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        meshes[_i] = arguments[_i];
    }
    var nVertices = sum(meshes.map(function (m) { return m.vertexCount; }));
    var nTriangles = sum(meshes.map(function (m) { return m.triangleCount; }));
    var vertices = concatArrays(Float32Array, meshes.map(function (m) { return m.vertexBuffer.ref.value; }));
    var normals = concatArrays(Float32Array, meshes.map(function (m) { return m.normalBuffer.ref.value; }));
    var groups = concatArrays(Float32Array, meshes.map(function (m) { return m.groupBuffer.ref.value; }));
    var newIndices = [];
    var offset = 0;
    for (var _a = 0, meshes_1 = meshes; _a < meshes_1.length; _a++) {
        var m = meshes_1[_a];
        newIndices.push(m.indexBuffer.ref.value.map(function (i) { return i + offset; }));
        offset += m.vertexCount;
    }
    var indices = concatArrays(Uint32Array, newIndices);
    return Mesh.create(vertices, indices, normals, groups, nVertices, nTriangles);
}
/** Return Mesh from CIF data and mesh IDs (group IDs).
 * Assume the CIF contains coords in grid space,
 * transform the output mesh to `space` */
export function meshFromCif(data, invertSides, outSpace) {
    if (invertSides === void 0) { invertSides = undefined; }
    if (outSpace === void 0) { outSpace = 'cartesian'; }
    return __awaiter(this, void 0, void 0, function () {
        var volumeInfoBlock, meshesBlock, volumeInfoCif, meshCif, nVertices, nTriangles, mesh_id, vertex_meshId, x, y, z, triangle_meshId, triangle_vertexId, indices, offsets, i, offset, vertices, normals, groups, mesh, volume, gridToCartesian, gridSize, originFract, dimensionFract, scale;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    volumeInfoBlock = data.blocks.find(function (b) { return b.header === 'VOLUME_INFO'; });
                    meshesBlock = data.blocks.find(function (b) { return b.header === 'MESHES'; });
                    if (!volumeInfoBlock || !meshesBlock)
                        throw new Error('Missing VOLUME_INFO or MESHES block in mesh CIF file');
                    volumeInfoCif = CIF.schema.densityServer(volumeInfoBlock);
                    meshCif = CIF_schema_mesh(meshesBlock);
                    nVertices = meshCif.mesh_vertex._rowCount;
                    nTriangles = Math.floor(meshCif.mesh_triangle._rowCount / 3);
                    mesh_id = meshCif.mesh.id.toArray();
                    vertex_meshId = meshCif.mesh_vertex.mesh_id.toArray();
                    x = meshCif.mesh_vertex.x.toArray();
                    y = meshCif.mesh_vertex.y.toArray();
                    z = meshCif.mesh_vertex.z.toArray();
                    triangle_meshId = meshCif.mesh_triangle.mesh_id.toArray();
                    triangle_vertexId = meshCif.mesh_triangle.vertex_id.toArray();
                    indices = new Uint32Array(3 * nTriangles);
                    offsets = offsetMap(vertex_meshId);
                    for (i = 0; i < 3 * nTriangles; i++) {
                        offset = offsets.get(triangle_meshId[i]);
                        indices[i] = offset + triangle_vertexId[i];
                    }
                    vertices = flattenCoords(x, y, z);
                    normals = new Float32Array(3 * nVertices);
                    groups = new Float32Array(vertex_meshId);
                    mesh = Mesh.create(vertices, indices, normals, groups, nVertices, nTriangles);
                    invertSides !== null && invertSides !== void 0 ? invertSides : (invertSides = isInverted(mesh));
                    if (invertSides) {
                        modify(mesh, { invertSides: true }); // Vertex orientation convention is opposite in Volseg API and in MolStar
                    }
                    if (!(outSpace === 'cartesian')) return [3 /*break*/, 2];
                    return [4 /*yield*/, volumeFromDensityServerData(volumeInfoCif).run()];
                case 1:
                    volume = _a.sent();
                    gridToCartesian = Grid.getGridToCartesianTransform(volume.grid);
                    modify(mesh, { matrix: gridToCartesian });
                    return [3 /*break*/, 3];
                case 2:
                    if (outSpace === 'fractional') {
                        gridSize = volumeInfoCif.volume_data_3d_info.sample_count.value(0);
                        originFract = volumeInfoCif.volume_data_3d_info.origin.value(0);
                        dimensionFract = volumeInfoCif.volume_data_3d_info.dimensions.value(0);
                        if (dimensionFract[0] !== 1 || dimensionFract[1] !== 1 || dimensionFract[2] !== 1)
                            throw new Error("Asserted the fractional dimensions are [1,1,1], but are actually [".concat(dimensionFract, "]"));
                        scale = [1 / gridSize[0], 1 / gridSize[1], 1 / gridSize[2]];
                        modify(mesh, { scale: scale, shift: Array.from(originFract) });
                    }
                    _a.label = 3;
                case 3:
                    Mesh.computeNormals(mesh); // normals only necessary if flatShaded==false
                    // const boxMesh = makeMeshFromBox([[0,0,0], [1,1,1]], 1);
                    // const gridSize = volumeInfoCif.volume_data_3d_info.sample_count.value(0); const boxMesh = makeMeshFromBox([[0,0,0], Array.from(gridSize)] as any, 1);
                    // const cellSize = volumeInfoCif.volume_data_3d_info.spacegroup_cell_size.value(0); const boxMesh = makeMeshFromBox([[0, 0, 0], Array.from(cellSize)] as any, 1);
                    // mesh = concat(mesh, boxMesh);  // debug
                    return [2 /*return*/, { mesh: mesh, meshIds: Array.from(mesh_id) }];
            }
        });
    });
}
function isInverted(mesh) {
    var vertices = mesh.vertexBuffer.ref.value;
    var indices = mesh.indexBuffer.ref.value;
    var center = meshCenter(mesh);
    var center3 = Vec3.create(3 * center[0], 3 * center[1], 3 * center[2]);
    var dirMetric = 0.0;
    var _a = [Vec3(), Vec3(), Vec3(), Vec3(), Vec3(), Vec3(), Vec3()], a = _a[0], b = _a[1], c = _a[2], u = _a[3], v = _a[4], normal = _a[5], radius = _a[6];
    for (var i = 0; i < indices.length; i += 3) {
        Vec3.fromArray(a, vertices, 3 * indices[i]);
        Vec3.fromArray(b, vertices, 3 * indices[i + 1]);
        Vec3.fromArray(c, vertices, 3 * indices[i + 2]);
        Vec3.sub(u, b, a);
        Vec3.sub(v, c, b);
        Vec3.cross(normal, u, v); // direction of the surface
        Vec3.add(radius, a, b);
        Vec3.add(radius, radius, c);
        Vec3.sub(radius, radius, center3); // direction center -> this triangle
        dirMetric += Vec3.dot(radius, normal);
    }
    return dirMetric < 0;
}
function meshCenter(mesh) {
    var vertices = mesh.vertexBuffer.ref.value;
    var n = vertices.length;
    var x = 0.0;
    var y = 0.0;
    var z = 0.0;
    for (var i = 0; i < vertices.length; i += 3) {
        x += vertices[i];
        y += vertices[i + 1];
        z += vertices[i + 2];
    }
    return Vec3.create(x / n, y / n, z / n);
}
function flattenCoords(x, y, z) {
    var n = x.length;
    var out = new Float32Array(3 * n);
    for (var i = 0; i < n; i++) {
        out[3 * i] = x[i];
        out[3 * i + 1] = y[i];
        out[3 * i + 2] = z[i];
    }
    return out;
}
/** Get mapping of unique values to the position of their first occurrence */
function offsetMap(values) {
    var result = new Map();
    for (var i = 0; i < values.length; i++) {
        if (!result.has(values[i])) {
            result.set(values[i], i);
        }
    }
    return result;
}
/** Return bounding box */
export function bbox(mesh) {
    var nVertices = mesh.vertexCount;
    var coords = mesh.vertexBuffer.ref.value;
    if (nVertices === 0) {
        return null;
    }
    var minX = coords[0], minY = coords[1], minZ = coords[2];
    var maxX = minX, maxY = minY, maxZ = minZ;
    for (var i = 0; i < 3 * nVertices; i += 3) {
        var x = coords[i], y = coords[i + 1], z = coords[i + 2];
        if (x < minX)
            minX = x;
        if (y < minY)
            minY = y;
        if (z < minZ)
            minZ = z;
        if (x > maxX)
            maxX = x;
        if (y > maxY)
            maxY = y;
        if (z > maxZ)
            maxZ = z;
    }
    return Box3D.create(Vec3.create(minX, minY, minZ), Vec3.create(maxX, maxY, maxZ));
}
/** Example mesh - 1 triangle */
export function fakeFakeMesh1() {
    var nVertices = 3;
    var nTriangles = 1;
    var vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    var indices = new Uint32Array([0, 1, 2]);
    var normals = new Float32Array([0, 0, 1]);
    var groups = new Float32Array([0]);
    return Mesh.create(vertices, indices, normals, groups, nVertices, nTriangles);
}
/** Example mesh - irregular tetrahedron */
export function fakeMesh4() {
    var nVertices = 4;
    var nTriangles = 4;
    var vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]);
    var indices = new Uint32Array([0, 2, 1, 0, 1, 3, 1, 2, 3, 2, 0, 3]);
    var normals = new Float32Array([-1, -1, -1, 1, 0, 0, 0, 1, 0, 0, 0, 1]);
    var groups = new Float32Array([0, 1, 2, 3]);
    return Mesh.create(vertices, indices, normals, groups, nVertices, nTriangles);
}
/** Return a box-shaped mesh */
export function meshFromBox(box, group) {
    if (group === void 0) { group = 0; }
    var _a = box[0], x0 = _a[0], y0 = _a[1], z0 = _a[2], _b = box[1], x1 = _b[0], y1 = _b[1], z1 = _b[2];
    var vertices = new Float32Array([
        x0, y0, z0,
        x1, y0, z0,
        x0, y1, z0,
        x1, y1, z0,
        x0, y0, z1,
        x1, y0, z1,
        x0, y1, z1,
        x1, y1, z1,
    ]);
    var indices = new Uint32Array([
        2, 1, 0, 1, 2, 3,
        1, 4, 0, 4, 1, 5,
        3, 5, 1, 5, 3, 7,
        2, 7, 3, 7, 2, 6,
        0, 6, 2, 6, 0, 4,
        4, 7, 6, 7, 4, 5,
    ]);
    var groups = new Float32Array([group, group, group, group, group, group, group, group]);
    var normals = new Float32Array(8);
    var mesh = Mesh.create(vertices, indices, normals, groups, 8, 12);
    Mesh.computeNormals(mesh); // normals only necessary if flatShaded==false
    return mesh;
}
function sum(array) {
    return array.reduce(function (a, b) { return a + b; }, 0);
}
function concatArrays(t, arrays) {
    var totalLength = arrays.map(function (a) { return a.length; }).reduce(function (a, b) { return a + b; }, 0);
    var result = new t(totalLength);
    var offset = 0;
    for (var _i = 0, arrays_1 = arrays; _i < arrays_1.length; _i++) {
        var array = arrays_1[_i];
        result.set(array, offset);
        offset += array.length;
    }
    return result;
}
/** Generate random colors (in a cycle) */
export var ColorGenerator = function () {
    var colors, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                colors = shuffleArray(Object.values(ColorNames));
                i = 0;
                _a.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 3];
                return [4 /*yield*/, colors[i]];
            case 2:
                _a.sent();
                i++;
                if (i >= colors.length)
                    i = 0;
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}();
function shuffleArray(array) {
    // Stealed from https://www.w3docs.com/snippets/javascript/how-to-randomize-shuffle-a-javascript-array.html
    var curId = array.length;
    // There remain elements to shuffle
    while (0 !== curId) {
        // Pick a remaining element
        var randId = Math.floor(Math.random() * curId);
        curId -= 1;
        // Swap it with the current element.
        var tmp = array[curId];
        array[curId] = array[randId];
        array[randId] = tmp;
    }
    return array;
}
