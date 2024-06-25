"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clip_pixel = void 0;
exports.clip_pixel = "\n#if defined(dClipVariant_pixel) && dClipObjectCount != 0\n    if (clipTest(vec4(vModelPosition, 0.0)))\n        discard;\n#endif\n";
