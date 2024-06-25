/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export function createState(gl) {
    var enabledCapabilities = {};
    var currentFrontFace = gl.getParameter(gl.FRONT_FACE);
    var currentCullFace = gl.getParameter(gl.CULL_FACE_MODE);
    var currentDepthMask = gl.getParameter(gl.DEPTH_WRITEMASK);
    var currentClearDepth = gl.getParameter(gl.DEPTH_CLEAR_VALUE);
    var currentDepthFunc = gl.getParameter(gl.DEPTH_FUNC);
    var currentColorMask = gl.getParameter(gl.COLOR_WRITEMASK);
    var currentClearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);
    var currentBlendSrcRGB = gl.getParameter(gl.BLEND_SRC_RGB);
    var currentBlendDstRGB = gl.getParameter(gl.BLEND_DST_RGB);
    var currentBlendSrcAlpha = gl.getParameter(gl.BLEND_SRC_ALPHA);
    var currentBlendDstAlpha = gl.getParameter(gl.BLEND_DST_ALPHA);
    var currentBlendColor = gl.getParameter(gl.BLEND_COLOR);
    var currentBlendEqRGB = gl.getParameter(gl.BLEND_EQUATION_RGB);
    var currentBlendEqAlpha = gl.getParameter(gl.BLEND_EQUATION_ALPHA);
    var currentStencilFunc = gl.getParameter(gl.STENCIL_FUNC);
    var currentStencilValueMask = gl.getParameter(gl.STENCIL_VALUE_MASK);
    var currentStencilRef = gl.getParameter(gl.STENCIL_REF);
    var currentStencilBackFunc = gl.getParameter(gl.STENCIL_BACK_FUNC);
    var currentStencilBackValueMask = gl.getParameter(gl.STENCIL_BACK_VALUE_MASK);
    var currentStencilBackRef = gl.getParameter(gl.STENCIL_BACK_REF);
    var currentStencilWriteMask = gl.getParameter(gl.STENCIL_WRITEMASK);
    var currentStencilBackWriteMask = gl.getParameter(gl.STENCIL_BACK_WRITEMASK);
    var currentStencilFail = gl.getParameter(gl.STENCIL_FAIL);
    var currentStencilPassDepthPass = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);
    var currentStencilPassDepthFail = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);
    var currentStencilBackFail = gl.getParameter(gl.STENCIL_BACK_FAIL);
    var currentStencilBackPassDepthPass = gl.getParameter(gl.STENCIL_BACK_PASS_DEPTH_PASS);
    var currentStencilBackPassDepthFail = gl.getParameter(gl.STENCIL_BACK_PASS_DEPTH_FAIL);
    var maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    var vertexAttribsState = [];
    var currentViewport = gl.getParameter(gl.VIEWPORT);
    var currentScissor = gl.getParameter(gl.SCISSOR_BOX);
    var clearVertexAttribsState = function () {
        for (var i = 0; i < maxVertexAttribs; ++i) {
            vertexAttribsState[i] = 0;
        }
    };
    clearVertexAttribsState();
    return {
        currentProgramId: -1,
        currentMaterialId: -1,
        currentRenderItemId: -1,
        enable: function (cap) {
            if (enabledCapabilities[cap] !== true) {
                gl.enable(cap);
                enabledCapabilities[cap] = true;
            }
        },
        disable: function (cap) {
            if (enabledCapabilities[cap] !== false) {
                gl.disable(cap);
                enabledCapabilities[cap] = false;
            }
        },
        frontFace: function (mode) {
            if (mode !== currentFrontFace) {
                gl.frontFace(mode);
                currentFrontFace = mode;
            }
        },
        cullFace: function (mode) {
            if (mode !== currentCullFace) {
                gl.cullFace(mode);
                currentCullFace = mode;
            }
        },
        depthMask: function (flag) {
            if (flag !== currentDepthMask) {
                gl.depthMask(flag);
                currentDepthMask = flag;
            }
        },
        clearDepth: function (depth) {
            if (depth !== currentClearDepth) {
                gl.clearDepth(depth);
                currentClearDepth = depth;
            }
        },
        depthFunc: function (func) {
            if (func !== currentDepthFunc) {
                gl.depthFunc(func);
                currentDepthFunc = func;
            }
        },
        colorMask: function (red, green, blue, alpha) {
            if (red !== currentColorMask[0] || green !== currentColorMask[1] || blue !== currentColorMask[2] || alpha !== currentColorMask[3]) {
                gl.colorMask(red, green, blue, alpha);
                currentColorMask[0] = red;
                currentColorMask[1] = green;
                currentColorMask[2] = blue;
                currentColorMask[3] = alpha;
            }
        },
        clearColor: function (red, green, blue, alpha) {
            if (red !== currentClearColor[0] || green !== currentClearColor[1] || blue !== currentClearColor[2] || alpha !== currentClearColor[3]) {
                gl.clearColor(red, green, blue, alpha);
                currentClearColor[0] = red;
                currentClearColor[1] = green;
                currentClearColor[2] = blue;
                currentClearColor[3] = alpha;
            }
        },
        blendFunc: function (src, dst) {
            if (src !== currentBlendSrcRGB || dst !== currentBlendDstRGB || src !== currentBlendSrcAlpha || dst !== currentBlendDstAlpha) {
                gl.blendFunc(src, dst);
                currentBlendSrcRGB = src;
                currentBlendDstRGB = dst;
                currentBlendSrcAlpha = src;
                currentBlendDstAlpha = dst;
            }
        },
        blendFuncSeparate: function (srcRGB, dstRGB, srcAlpha, dstAlpha) {
            if (srcRGB !== currentBlendSrcRGB || dstRGB !== currentBlendDstRGB || srcAlpha !== currentBlendSrcAlpha || dstAlpha !== currentBlendDstAlpha) {
                gl.blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
                currentBlendSrcRGB = srcRGB;
                currentBlendDstRGB = dstRGB;
                currentBlendSrcAlpha = srcAlpha;
                currentBlendDstAlpha = dstAlpha;
            }
        },
        blendEquation: function (mode) {
            if (mode !== currentBlendEqRGB || mode !== currentBlendEqAlpha) {
                gl.blendEquation(mode);
                currentBlendEqRGB = mode;
                currentBlendEqAlpha = mode;
            }
        },
        blendEquationSeparate: function (modeRGB, modeAlpha) {
            if (modeRGB !== currentBlendEqRGB || modeAlpha !== currentBlendEqAlpha) {
                gl.blendEquationSeparate(modeRGB, modeAlpha);
                currentBlendEqRGB = modeRGB;
                currentBlendEqAlpha = modeAlpha;
            }
        },
        blendColor: function (red, green, blue, alpha) {
            if (red !== currentBlendColor[0] || green !== currentBlendColor[1] || blue !== currentBlendColor[2] || alpha !== currentBlendColor[3]) {
                gl.blendColor(red, green, blue, alpha);
                currentBlendColor[0] = red;
                currentBlendColor[1] = green;
                currentBlendColor[2] = blue;
                currentBlendColor[3] = alpha;
            }
        },
        stencilFunc: function (func, ref, mask) {
            if (func !== currentStencilFunc || ref !== currentStencilRef || mask !== currentStencilValueMask || func !== currentStencilBackFunc || ref !== currentStencilBackRef || mask !== currentStencilBackValueMask) {
                gl.stencilFunc(func, ref, mask);
                currentStencilFunc = func;
                currentStencilRef = ref;
                currentStencilValueMask = mask;
                currentStencilBackFunc = func;
                currentStencilBackRef = ref;
                currentStencilBackValueMask = mask;
            }
        },
        stencilFuncSeparate: function (face, func, ref, mask) {
            if (face === gl.FRONT) {
                if (func !== currentStencilFunc || ref !== currentStencilRef || mask !== currentStencilValueMask) {
                    gl.stencilFuncSeparate(face, func, ref, mask);
                    currentStencilFunc = func;
                    currentStencilRef = ref;
                    currentStencilValueMask = mask;
                }
            }
            else if (face === gl.BACK) {
                if (func !== currentStencilBackFunc || ref !== currentStencilBackRef || mask !== currentStencilBackValueMask) {
                    gl.stencilFuncSeparate(face, func, ref, mask);
                    currentStencilBackFunc = func;
                    currentStencilBackRef = ref;
                    currentStencilBackValueMask = mask;
                }
            }
            else if (face === gl.FRONT_AND_BACK) {
                if (func !== currentStencilFunc || ref !== currentStencilRef || mask !== currentStencilValueMask || func !== currentStencilBackFunc || ref !== currentStencilBackRef || mask !== currentStencilBackValueMask) {
                    gl.stencilFuncSeparate(face, func, ref, mask);
                    currentStencilFunc = func;
                    currentStencilRef = ref;
                    currentStencilValueMask = mask;
                    currentStencilBackFunc = func;
                    currentStencilBackRef = ref;
                    currentStencilBackValueMask = mask;
                }
            }
        },
        stencilMask: function (mask) {
            if (mask !== currentStencilWriteMask || mask !== currentStencilBackWriteMask) {
                gl.stencilMask(mask);
                currentStencilWriteMask = mask;
                currentStencilBackWriteMask = mask;
            }
        },
        stencilMaskSeparate: function (face, mask) {
            if (face === gl.FRONT) {
                if (mask !== currentStencilWriteMask) {
                    gl.stencilMaskSeparate(face, mask);
                    currentStencilWriteMask = mask;
                }
            }
            else if (face === gl.BACK) {
                if (mask !== currentStencilBackWriteMask) {
                    gl.stencilMaskSeparate(face, mask);
                    currentStencilBackWriteMask = mask;
                }
            }
            else if (face === gl.FRONT_AND_BACK) {
                if (mask !== currentStencilWriteMask || mask !== currentStencilBackWriteMask) {
                    gl.stencilMaskSeparate(face, mask);
                    currentStencilWriteMask = mask;
                    currentStencilBackWriteMask = mask;
                }
            }
        },
        stencilOp: function (fail, zfail, zpass) {
            if (fail !== currentStencilFail || zfail !== currentStencilPassDepthFail || zpass !== currentStencilPassDepthPass || fail !== currentStencilBackFail || zfail !== currentStencilBackPassDepthFail || zpass !== currentStencilBackPassDepthPass) {
                gl.stencilOp(fail, zfail, zpass);
                currentStencilFail = fail;
                currentStencilPassDepthFail = zfail;
                currentStencilPassDepthPass = zpass;
                currentStencilBackFail = fail;
                currentStencilBackPassDepthFail = zfail;
                currentStencilBackPassDepthPass = zpass;
            }
        },
        stencilOpSeparate: function (face, fail, zfail, zpass) {
            if (face === gl.FRONT) {
                if (fail !== currentStencilFail || zfail !== currentStencilPassDepthFail || zpass !== currentStencilPassDepthPass) {
                    gl.stencilOpSeparate(face, fail, zfail, zpass);
                    currentStencilFail = fail;
                    currentStencilPassDepthFail = zfail;
                    currentStencilPassDepthPass = zpass;
                }
            }
            else if (face === gl.BACK) {
                if (fail !== currentStencilBackFail || zfail !== currentStencilBackPassDepthFail || zpass !== currentStencilBackPassDepthPass) {
                    gl.stencilOpSeparate(face, fail, zfail, zpass);
                    currentStencilBackFail = fail;
                    currentStencilBackPassDepthFail = zfail;
                    currentStencilBackPassDepthPass = zpass;
                }
            }
            else if (face === gl.FRONT_AND_BACK) {
                if (fail !== currentStencilFail || zfail !== currentStencilPassDepthFail || zpass !== currentStencilPassDepthPass || fail !== currentStencilBackFail || zfail !== currentStencilBackPassDepthFail || zpass !== currentStencilBackPassDepthPass) {
                    gl.stencilOpSeparate(face, fail, zfail, zpass);
                    currentStencilFail = fail;
                    currentStencilPassDepthFail = zfail;
                    currentStencilPassDepthPass = zpass;
                    currentStencilBackFail = fail;
                    currentStencilBackPassDepthFail = zfail;
                    currentStencilBackPassDepthPass = zpass;
                }
            }
        },
        enableVertexAttrib: function (index) {
            gl.enableVertexAttribArray(index);
            vertexAttribsState[index] = 1;
        },
        clearVertexAttribsState: clearVertexAttribsState,
        disableUnusedVertexAttribs: function () {
            for (var i = 0; i < maxVertexAttribs; ++i) {
                if (vertexAttribsState[i] === 0)
                    gl.disableVertexAttribArray(i);
            }
        },
        viewport: function (x, y, width, height) {
            if (x !== currentViewport[0] || y !== currentViewport[1] || width !== currentViewport[2] || height !== currentViewport[3]) {
                gl.viewport(x, y, width, height);
                currentViewport[0] = x;
                currentViewport[1] = y;
                currentViewport[2] = width;
                currentViewport[3] = height;
            }
        },
        scissor: function (x, y, width, height) {
            if (x !== currentScissor[0] || y !== currentScissor[1] || width !== currentScissor[2] || height !== currentScissor[3]) {
                gl.scissor(x, y, width, height);
                currentScissor[0] = x;
                currentScissor[1] = y;
                currentScissor[2] = width;
                currentScissor[3] = height;
            }
        },
        reset: function () {
            enabledCapabilities = {};
            currentFrontFace = gl.getParameter(gl.FRONT_FACE);
            currentCullFace = gl.getParameter(gl.CULL_FACE_MODE);
            currentDepthMask = gl.getParameter(gl.DEPTH_WRITEMASK);
            currentClearDepth = gl.getParameter(gl.DEPTH_CLEAR_VALUE);
            currentDepthFunc = gl.getParameter(gl.DEPTH_FUNC);
            currentColorMask = gl.getParameter(gl.COLOR_WRITEMASK);
            currentClearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);
            currentBlendSrcRGB = gl.getParameter(gl.BLEND_SRC_RGB);
            currentBlendDstRGB = gl.getParameter(gl.BLEND_DST_RGB);
            currentBlendSrcAlpha = gl.getParameter(gl.BLEND_SRC_ALPHA);
            currentBlendDstAlpha = gl.getParameter(gl.BLEND_DST_ALPHA);
            currentBlendColor = gl.getParameter(gl.BLEND_COLOR);
            currentBlendEqRGB = gl.getParameter(gl.BLEND_EQUATION_RGB);
            currentBlendEqAlpha = gl.getParameter(gl.BLEND_EQUATION_ALPHA);
            currentStencilFunc = gl.getParameter(gl.STENCIL_FUNC);
            currentStencilValueMask = gl.getParameter(gl.STENCIL_VALUE_MASK);
            currentStencilRef = gl.getParameter(gl.STENCIL_REF);
            currentStencilBackFunc = gl.getParameter(gl.STENCIL_BACK_FUNC);
            currentStencilBackValueMask = gl.getParameter(gl.STENCIL_BACK_VALUE_MASK);
            currentStencilBackRef = gl.getParameter(gl.STENCIL_BACK_REF);
            currentStencilWriteMask = gl.getParameter(gl.STENCIL_WRITEMASK);
            currentStencilBackWriteMask = gl.getParameter(gl.STENCIL_BACK_WRITEMASK);
            currentStencilFail = gl.getParameter(gl.STENCIL_FAIL);
            currentStencilPassDepthPass = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);
            currentStencilPassDepthFail = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);
            currentStencilBackFail = gl.getParameter(gl.STENCIL_BACK_FAIL);
            currentStencilBackPassDepthPass = gl.getParameter(gl.STENCIL_BACK_PASS_DEPTH_PASS);
            currentStencilBackPassDepthFail = gl.getParameter(gl.STENCIL_BACK_PASS_DEPTH_FAIL);
            maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
            vertexAttribsState.length = 0;
            for (var i = 0; i < maxVertexAttribs; ++i) {
                vertexAttribsState[i] = 0;
            }
            currentViewport = gl.getParameter(gl.VIEWPORT);
            currentScissor = gl.getParameter(gl.SCISSOR_BOX);
        }
    };
}
