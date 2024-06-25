"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateDpoit_frag = void 0;
exports.evaluateDpoit_frag = "\nprecision highp float;\n\nuniform sampler2D tDpoitFrontColor;\nuniform vec2 uTexSize;\n\nvoid main() {\n    vec2 coords = gl_FragCoord.xy / uTexSize;\n    gl_FragColor = texture2D(tDpoitFrontColor, coords);\n}\n";
