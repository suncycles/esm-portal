"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.lazyGetter = exports.applyEllipsis = exports.CreateVolume = exports.NodeManager = exports.isDefined = exports.Choice = exports.createEntryId = exports.splitEntryId = void 0;
var tslib_1 = require("tslib");
var objects_1 = require("../../mol-plugin-state/objects");
var state_1 = require("../../mol-plugin/behavior/static/state");
var mol_state_1 = require("../../mol-state");
var param_definition_1 = require("../../mol-util/param-definition");
/** Split entry ID (e.g. 'emd-1832') into source ('emdb') and number ('1832') */
function splitEntryId(entryId) {
    var _a;
    var PREFIX_TO_SOURCE = { 'emd': 'emdb' };
    var _b = entryId.split('-'), prefix = _b[0], entry = _b[1];
    return {
        source: (_a = PREFIX_TO_SOURCE[prefix]) !== null && _a !== void 0 ? _a : prefix,
        entryNumber: entry
    };
}
exports.splitEntryId = splitEntryId;
/** Create entry ID (e.g. 'emd-1832') for a combination of source ('emdb') and number ('1832') */
function createEntryId(source, entryNumber) {
    var _a;
    var SOURCE_TO_PREFIX = { 'emdb': 'emd' };
    var prefix = (_a = SOURCE_TO_PREFIX[source]) !== null && _a !== void 0 ? _a : source;
    return "".concat(prefix, "-").concat(entryNumber);
}
exports.createEntryId = createEntryId;
/**
 * Represents a set of values to choose from, with a default value. Example:
 * ```
 * export const MyChoice = new Choice({ yes: 'I agree', no: 'Nope' }, 'yes');
 * export type MyChoiceType = Choice.Values<typeof MyChoice>; // 'yes'|'no'
 * ```
 */
var Choice = /** @class */ (function () {
    function Choice(opts, defaultValue) {
        this.defaultValue = defaultValue;
        this.options = Object.keys(opts).map(function (k) { return [k, opts[k]]; });
        this.nameDict = opts;
    }
    Choice.prototype.PDSelect = function (defaultValue, info) {
        return param_definition_1.ParamDefinition.Select(defaultValue !== null && defaultValue !== void 0 ? defaultValue : this.defaultValue, this.options, info);
    };
    Choice.prototype.prettyName = function (value) {
        return this.nameDict[value];
    };
    Object.defineProperty(Choice.prototype, "values", {
        get: function () {
            return this.options.map(function (_a) {
                var value = _a[0], pretty = _a[1];
                return value;
            });
        },
        enumerable: false,
        configurable: true
    });
    return Choice;
}());
exports.Choice = Choice;
function isDefined(x) {
    return x !== undefined;
}
exports.isDefined = isDefined;
var NodeManager = /** @class */ (function () {
    function NodeManager() {
        this.nodes = {};
    }
    NodeManager.nodeExists = function (node) {
        try {
            return node.checkValid();
        }
        catch (_a) {
            return false;
        }
    };
    NodeManager.prototype.getNode = function (key) {
        var node = this.nodes[key];
        if (node && !NodeManager.nodeExists(node)) {
            delete this.nodes[key];
            return undefined;
        }
        return node;
    };
    NodeManager.prototype.getNodes = function () {
        var _this = this;
        return Object.keys(this.nodes).map(function (key) { return _this.getNode(key); }).filter(function (node) { return node; });
    };
    NodeManager.prototype.deleteAllNodes = function (update) {
        for (var _i = 0, _a = this.getNodes(); _i < _a.length; _i++) {
            var node = _a[_i];
            update.delete(node);
        }
        this.nodes = {};
    };
    NodeManager.prototype.hideAllNodes = function () {
        for (var _i = 0, _a = this.getNodes(); _i < _a.length; _i++) {
            var node = _a[_i];
            (0, state_1.setSubtreeVisibility)(node.state, node.ref, true); // hide
        }
    };
    NodeManager.prototype.showNode = function (key, factory, forceVisible) {
        if (forceVisible === void 0) { forceVisible = true; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.getNode(key);
                        if (!node) return [3 /*break*/, 1];
                        if (forceVisible) {
                            (0, state_1.setSubtreeVisibility)(node.state, node.ref, false); // show
                        }
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, factory()];
                    case 2:
                        node = _a.sent();
                        this.nodes[key] = node;
                        _a.label = 3;
                    case 3: return [2 /*return*/, node];
                }
            });
        });
    };
    return NodeManager;
}());
exports.NodeManager = NodeManager;
var CreateTransformer = mol_state_1.StateTransformer.builderFactory('volseg');
exports.CreateVolume = CreateTransformer({
    name: 'create-transformer',
    from: objects_1.PluginStateObject.Root,
    to: objects_1.PluginStateObject.Volume.Data,
    params: {
        label: param_definition_1.ParamDefinition.Text('Volume', { isHidden: true }),
        description: param_definition_1.ParamDefinition.Text('', { isHidden: true }),
        volume: param_definition_1.ParamDefinition.Value(undefined, { isHidden: true }),
    }
})({
    apply: function (_a) {
        var params = _a.params;
        return new objects_1.PluginStateObject.Volume.Data(params.volume, { label: params.label, description: params.description });
    }
});
function applyEllipsis(name, max_chars) {
    if (max_chars === void 0) { max_chars = 60; }
    if (name.length <= max_chars)
        return name;
    var beginning = name.substring(0, max_chars);
    var lastSpace = beginning.lastIndexOf(' ');
    if (lastSpace === -1)
        return beginning + '...';
    if (lastSpace > 0 && ',;.'.includes(name.charAt(lastSpace - 1)))
        lastSpace--;
    return name.substring(0, lastSpace) + '...';
}
exports.applyEllipsis = applyEllipsis;
function lazyGetter(getter, errorIfUndefined) {
    var value = undefined;
    return function () {
        if (value === undefined)
            value = getter();
        if (errorIfUndefined && value === undefined)
            throw new Error(errorIfUndefined);
        return value;
    };
}
exports.lazyGetter = lazyGetter;
