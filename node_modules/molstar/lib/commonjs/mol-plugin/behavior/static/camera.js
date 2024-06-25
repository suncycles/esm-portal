"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetAxes = exports.OrientAxes = exports.Focus = exports.SetSnapshot = exports.Reset = exports.registerDefault = void 0;
const commands_1 = require("../../commands");
function registerDefault(ctx) {
    Reset(ctx);
    Focus(ctx);
    SetSnapshot(ctx);
    OrientAxes(ctx);
    ResetAxes(ctx);
}
exports.registerDefault = registerDefault;
function Reset(ctx) {
    commands_1.PluginCommands.Camera.Reset.subscribe(ctx, options => {
        ctx.managers.camera.reset(options === null || options === void 0 ? void 0 : options.snapshot, options === null || options === void 0 ? void 0 : options.durationMs);
    });
}
exports.Reset = Reset;
function SetSnapshot(ctx) {
    commands_1.PluginCommands.Camera.SetSnapshot.subscribe(ctx, ({ snapshot, durationMs }) => {
        ctx.managers.camera.setSnapshot(snapshot, durationMs);
    });
}
exports.SetSnapshot = SetSnapshot;
function Focus(ctx) {
    commands_1.PluginCommands.Camera.Focus.subscribe(ctx, ({ center, radius, durationMs }) => {
        ctx.managers.camera.focusSphere({ center, radius }, { durationMs });
        ctx.events.canvas3d.settingsUpdated.next(void 0);
    });
}
exports.Focus = Focus;
function OrientAxes(ctx) {
    commands_1.PluginCommands.Camera.OrientAxes.subscribe(ctx, ({ structures, durationMs }) => {
        ctx.managers.camera.orientAxes(structures, durationMs);
    });
}
exports.OrientAxes = OrientAxes;
function ResetAxes(ctx) {
    commands_1.PluginCommands.Camera.ResetAxes.subscribe(ctx, ({ durationMs }) => {
        ctx.managers.camera.resetAxes(durationMs);
    });
}
exports.ResetAxes = ResetAxes;
