"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CIF_schema_mesh = exports.Mesh_Data_Schema = void 0;
var db_1 = require("../../mol-data/db");
var schema_1 = require("../../mol-io/reader/cif/schema");
var int = db_1.Column.Schema.int;
var float = db_1.Column.Schema.float;
// TODO in future, move to molstar/src/mol-io/reader/cif/schema/mesh.ts
exports.Mesh_Data_Schema = {
    mesh: {
        id: int,
    },
    mesh_vertex: {
        mesh_id: int,
        vertex_id: int,
        x: float,
        y: float,
        z: float,
    },
    /** Table of triangles, 3 rows per triangle */
    mesh_triangle: {
        mesh_id: int,
        /** Indices of vertices within mesh */
        vertex_id: int,
    }
};
// TODO in future, move to molstar/src/mol-io/reader/cif.ts: CIF.schema.mesh
var CIF_schema_mesh = function (frame) { return (0, schema_1.toDatabase)(exports.Mesh_Data_Schema, frame); };
exports.CIF_schema_mesh = CIF_schema_mesh;
