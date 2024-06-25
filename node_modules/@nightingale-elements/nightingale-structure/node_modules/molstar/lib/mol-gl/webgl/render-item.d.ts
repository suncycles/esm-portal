/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { WebGLContext } from './context';
import { ShaderCode } from '../shader-code';
import { Program } from './program';
import { RenderableSchema, RenderableValues } from '../renderable/schema';
export type DrawMode = 'points' | 'lines' | 'line-strip' | 'line-loop' | 'triangles' | 'triangle-strip' | 'triangle-fan';
export declare function getDrawMode(ctx: WebGLContext, drawMode: DrawMode): 0 | 1 | 2 | 3 | 6 | 5 | 4;
export interface RenderItem<T extends string> {
    readonly id: number;
    readonly materialId: number;
    getProgram: (variant: T) => Program;
    render: (variant: T, sharedTexturesCount: number) => void;
    update: () => void;
    destroy: () => void;
}
declare const GraphicsRenderVariant: {
    colorBlended: string;
    colorWboit: string;
    colorDpoit: string;
    pick: string;
    depth: string;
    marking: string;
};
export type GraphicsRenderVariant = keyof typeof GraphicsRenderVariant;
export declare const GraphicsRenderVariants: ("depth" | "colorBlended" | "colorWboit" | "colorDpoit" | "pick" | "marking")[];
export declare const GraphicsRenderVariantsBlended: ("depth" | "colorBlended" | "colorWboit" | "colorDpoit" | "pick" | "marking")[];
export declare const GraphicsRenderVariantsWboit: ("depth" | "colorBlended" | "colorWboit" | "colorDpoit" | "pick" | "marking")[];
export declare const GraphicsRenderVariantsDpoit: ("depth" | "colorBlended" | "colorWboit" | "colorDpoit" | "pick" | "marking")[];
declare const ComputeRenderVariant: {
    compute: string;
};
export type ComputeRenderVariant = keyof typeof ComputeRenderVariant;
export declare const ComputeRenderVariants: "compute"[];
export type GraphicsRenderItem = RenderItem<GraphicsRenderVariant>;
export declare function createGraphicsRenderItem(ctx: WebGLContext, drawMode: DrawMode, shaderCode: ShaderCode, schema: RenderableSchema, values: RenderableValues, materialId: number, variants: GraphicsRenderVariant[]): RenderItem<"depth" | "colorBlended" | "colorWboit" | "colorDpoit" | "pick" | "marking">;
export type ComputeRenderItem = RenderItem<ComputeRenderVariant>;
export declare function createComputeRenderItem(ctx: WebGLContext, drawMode: DrawMode, shaderCode: ShaderCode, schema: RenderableSchema, values: RenderableValues, materialId?: number): RenderItem<"compute">;
/**
 * Creates a render item
 *
 * - assumes that `values.drawCount` and `values.instanceCount` exist
 */
export declare function createRenderItem<T extends string>(ctx: WebGLContext, drawMode: DrawMode, shaderCode: ShaderCode, schema: RenderableSchema, values: RenderableValues, materialId: number, renderVariants: T[]): RenderItem<T>;
export {};
