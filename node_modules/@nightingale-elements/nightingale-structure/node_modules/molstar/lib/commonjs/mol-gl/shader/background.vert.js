"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.background_vert = void 0;
exports.background_vert = "\nprecision mediump float;\n\nattribute vec2 aPosition;\n\nvarying vec4 vPosition;\n\nvoid main() {\n    vPosition = vec4(aPosition, 1.0, 1.0);\n    gl_Position = vec4(aPosition, 1.0, 1.0);\n}\n";
