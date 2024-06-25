/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Gianluca Tomasello <giagitom@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * Adapted from https://github.com/tsherif/webgl2examples, The MIT License, Copyright © 2017 Tarek Sherif, Shuai Shao
 */
import { __assign } from "tslib";
import { QuadSchema, QuadValues } from '../../mol-gl/compute/util';
import { createComputeRenderable } from '../../mol-gl/renderable';
import { TextureSpec, UniformSpec } from '../../mol-gl/renderable/schema';
import { ShaderCode } from '../../mol-gl/shader-code';
import { createComputeRenderItem } from '../../mol-gl/webgl/render-item';
import { ValueCell } from '../../mol-util';
import { quad_vert } from '../../mol-gl/shader/quad.vert';
import { evaluateDpoit_frag } from '../../mol-gl/shader/evaluate-dpoit.frag';
import { blendBackDpoit_frag } from '../../mol-gl/shader/blend-back-dpoit.frag';
import { Vec2 } from '../../mol-math/linear-algebra';
import { isDebugMode, isTimingMode } from '../../mol-util/debug';
import { isWebGL2 } from '../../mol-gl/webgl/compat';
var BlendBackDpoitSchema = __assign(__assign({}, QuadSchema), { tDpoitBackColor: TextureSpec('texture', 'rgba', 'float', 'nearest'), uTexSize: UniformSpec('v2') });
var BlendBackDpoitShaderCode = ShaderCode('blend-back-dpoit', quad_vert, blendBackDpoit_frag);
function getBlendBackDpoitRenderable(ctx, dopitBlendBackTexture) {
    var values = __assign(__assign({}, QuadValues), { tDpoitBackColor: ValueCell.create(dopitBlendBackTexture), uTexSize: ValueCell.create(Vec2.create(dopitBlendBackTexture.getWidth(), dopitBlendBackTexture.getHeight())) });
    var schema = __assign({}, BlendBackDpoitSchema);
    var renderItem = createComputeRenderItem(ctx, 'triangles', BlendBackDpoitShaderCode, schema, values);
    return createComputeRenderable(renderItem, values);
}
var EvaluateDpoitSchema = __assign(__assign({}, QuadSchema), { tDpoitFrontColor: TextureSpec('texture', 'rgba', 'float', 'nearest'), uTexSize: UniformSpec('v2') });
var EvaluateDpoitShaderCode = ShaderCode('evaluate-dpoit', quad_vert, evaluateDpoit_frag);
function getEvaluateDpoitRenderable(ctx, dpoitFrontColorTexture) {
    var values = __assign(__assign({}, QuadValues), { tDpoitFrontColor: ValueCell.create(dpoitFrontColorTexture), uTexSize: ValueCell.create(Vec2.create(dpoitFrontColorTexture.getWidth(), dpoitFrontColorTexture.getHeight())) });
    var schema = __assign({}, EvaluateDpoitSchema);
    var renderItem = createComputeRenderItem(ctx, 'triangles', EvaluateDpoitShaderCode, schema, values);
    return createComputeRenderable(renderItem, values);
}
var DpoitPass = /** @class */ (function () {
    function DpoitPass(webgl, width, height) {
        this.webgl = webgl;
        this.DEPTH_CLEAR_VALUE = -99999.0; // NOTE same constant is set in shaders
        this.MAX_DEPTH = 1.0;
        this.MIN_DEPTH = 0.0;
        this.passCount = 0;
        this._supported = false;
        if (!DpoitPass.isSupported(webgl))
            return;
        var resources = webgl.resources, _a = webgl.extensions, colorBufferHalfFloat = _a.colorBufferHalfFloat, textureHalfFloat = _a.textureHalfFloat;
        // textures
        if (isWebGL2(webgl.gl)) {
            this.depthTextures = [
                resources.texture('image-float32', 'rg', 'float', 'nearest'),
                resources.texture('image-float32', 'rg', 'float', 'nearest')
            ];
            this.colorFrontTextures = colorBufferHalfFloat && textureHalfFloat ? [
                resources.texture('image-float16', 'rgba', 'fp16', 'nearest'),
                resources.texture('image-float16', 'rgba', 'fp16', 'nearest')
            ] : [
                resources.texture('image-float32', 'rgba', 'float', 'nearest'),
                resources.texture('image-float32', 'rgba', 'float', 'nearest')
            ];
            this.colorBackTextures = colorBufferHalfFloat && textureHalfFloat ? [
                resources.texture('image-float16', 'rgba', 'fp16', 'nearest'),
                resources.texture('image-float16', 'rgba', 'fp16', 'nearest')
            ] : [
                resources.texture('image-float32', 'rgba', 'float', 'nearest'),
                resources.texture('image-float32', 'rgba', 'float', 'nearest')
            ];
        }
        else {
            // in webgl1 drawbuffers must be in the same format for some reason
            this.depthTextures = [
                resources.texture('image-float32', 'rgba', 'float', 'nearest'),
                resources.texture('image-float32', 'rgba', 'float', 'nearest')
            ];
            this.colorFrontTextures = [
                resources.texture('image-float32', 'rgba', 'float', 'nearest'),
                resources.texture('image-float32', 'rgba', 'float', 'nearest')
            ];
            this.colorBackTextures = [
                resources.texture('image-float32', 'rgba', 'float', 'nearest'),
                resources.texture('image-float32', 'rgba', 'float', 'nearest')
            ];
        }
        this.depthTextures[0].define(width, height);
        this.depthTextures[1].define(width, height);
        this.colorFrontTextures[0].define(width, height);
        this.colorFrontTextures[1].define(width, height);
        this.colorBackTextures[0].define(width, height);
        this.colorBackTextures[1].define(width, height);
        // framebuffers
        this.depthFramebuffers = [resources.framebuffer(), resources.framebuffer()];
        this.colorFramebuffers = [resources.framebuffer(), resources.framebuffer()];
        // renderables
        this.blendBackRenderable = getBlendBackDpoitRenderable(webgl, this.colorBackTextures[0]);
        this.renderable = getEvaluateDpoitRenderable(webgl, this.colorFrontTextures[0]);
        this._supported = true;
        this._init();
    }
    Object.defineProperty(DpoitPass.prototype, "supported", {
        get: function () {
            return this._supported;
        },
        enumerable: false,
        configurable: true
    });
    DpoitPass.prototype.bind = function () {
        var _a = this.webgl, state = _a.state, gl = _a.gl, blendMinMax = _a.extensions.blendMinMax;
        // initialize
        this.passCount = 0;
        this.depthFramebuffers[0].bind();
        state.clearColor(this.DEPTH_CLEAR_VALUE, this.DEPTH_CLEAR_VALUE, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.depthFramebuffers[1].bind();
        state.clearColor(-this.MIN_DEPTH, this.MAX_DEPTH, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.colorFramebuffers[0].bind();
        state.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.colorFramebuffers[1].bind();
        state.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.depthFramebuffers[0].bind();
        state.blendEquation(blendMinMax.MAX);
        state.depthMask(false);
        return {
            depth: this.depthTextures[1],
            frontColor: this.colorFrontTextures[1],
            backColor: this.colorBackTextures[1]
        };
    };
    DpoitPass.prototype.bindDualDepthPeeling = function () {
        var _a = this.webgl, state = _a.state, gl = _a.gl, blendMinMax = _a.extensions.blendMinMax;
        this.readId = this.passCount % 2;
        this.writeId = 1 - this.readId; // ping-pong: 0 or 1
        this.passCount += 1; // increment for next pass
        this.depthFramebuffers[this.writeId].bind();
        state.clearColor(this.DEPTH_CLEAR_VALUE, this.DEPTH_CLEAR_VALUE, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.colorFramebuffers[this.writeId].bind();
        state.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.depthFramebuffers[this.writeId].bind();
        state.blendEquation(blendMinMax.MAX);
        state.depthMask(false);
        return {
            depth: this.depthTextures[this.readId],
            frontColor: this.colorFrontTextures[this.readId],
            backColor: this.colorBackTextures[this.readId]
        };
    };
    DpoitPass.prototype.renderBlendBack = function () {
        if (isTimingMode)
            this.webgl.timer.mark('DpoitPass.renderBlendBack');
        var _a = this.webgl, state = _a.state, gl = _a.gl;
        state.blendEquation(gl.FUNC_ADD);
        state.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        ValueCell.update(this.blendBackRenderable.values.tDpoitBackColor, this.colorBackTextures[this.writeId]);
        this.blendBackRenderable.update();
        this.blendBackRenderable.render();
        if (isTimingMode)
            this.webgl.timer.markEnd('DpoitPass.renderBlendBack');
    };
    DpoitPass.prototype.render = function () {
        if (isTimingMode)
            this.webgl.timer.mark('DpoitPass.render');
        var _a = this.webgl, state = _a.state, gl = _a.gl;
        state.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        ValueCell.update(this.renderable.values.tDpoitFrontColor, this.colorFrontTextures[this.writeId]);
        this.renderable.update();
        this.renderable.render();
        if (isTimingMode)
            this.webgl.timer.markEnd('DpoitPass.render');
    };
    DpoitPass.prototype.setSize = function (width, height) {
        var _a = this.renderable.values.uTexSize.ref.value, w = _a[0], h = _a[1];
        if (width !== w || height !== h) {
            for (var i = 0; i < 2; i++) {
                this.depthTextures[i].define(width, height);
                this.colorFrontTextures[i].define(width, height);
                this.colorBackTextures[i].define(width, height);
            }
            ValueCell.update(this.renderable.values.uTexSize, Vec2.set(this.renderable.values.uTexSize.ref.value, width, height));
            ValueCell.update(this.blendBackRenderable.values.uTexSize, Vec2.set(this.blendBackRenderable.values.uTexSize.ref.value, width, height));
        }
    };
    DpoitPass.prototype.reset = function () {
        if (this._supported)
            this._init();
    };
    DpoitPass.prototype._init = function () {
        var drawBuffers = this.webgl.extensions.drawBuffers;
        for (var i = 0; i < 2; i++) {
            // depth
            this.depthFramebuffers[i].bind();
            drawBuffers.drawBuffers([
                drawBuffers.COLOR_ATTACHMENT0,
                drawBuffers.COLOR_ATTACHMENT1,
                drawBuffers.COLOR_ATTACHMENT2
            ]);
            this.colorFrontTextures[i].attachFramebuffer(this.depthFramebuffers[i], 'color0');
            this.colorBackTextures[i].attachFramebuffer(this.depthFramebuffers[i], 'color1');
            this.depthTextures[i].attachFramebuffer(this.depthFramebuffers[i], 'color2');
            // color
            this.colorFramebuffers[i].bind();
            drawBuffers.drawBuffers([
                drawBuffers.COLOR_ATTACHMENT0,
                drawBuffers.COLOR_ATTACHMENT1
            ]);
            this.colorFrontTextures[i].attachFramebuffer(this.colorFramebuffers[i], 'color0');
            this.colorBackTextures[i].attachFramebuffer(this.colorFramebuffers[i], 'color1');
        }
    };
    DpoitPass.isSupported = function (webgl) {
        var _a = webgl.extensions, drawBuffers = _a.drawBuffers, textureFloat = _a.textureFloat, colorBufferFloat = _a.colorBufferFloat, blendMinMax = _a.blendMinMax;
        if (!textureFloat || !colorBufferFloat || !drawBuffers || !blendMinMax) {
            if (isDebugMode) {
                var missing = [];
                if (!textureFloat)
                    missing.push('textureFloat');
                if (!colorBufferFloat)
                    missing.push('colorBufferFloat');
                if (!drawBuffers)
                    missing.push('drawBuffers');
                if (!blendMinMax)
                    missing.push('blendMinMax');
                console.log("Missing \"".concat(missing.join('", "'), "\" extensions required for \"dpoit\""));
            }
            return false;
        }
        else {
            return true;
        }
    };
    return DpoitPass;
}());
export { DpoitPass };
