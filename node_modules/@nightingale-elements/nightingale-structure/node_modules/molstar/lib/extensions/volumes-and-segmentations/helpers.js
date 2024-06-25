/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { setSubtreeVisibility } from '../../mol-plugin/behavior/static/state';
import { StateTransformer } from '../../mol-state';
import { ParamDefinition } from '../../mol-util/param-definition';
/** Split entry ID (e.g. 'emd-1832') into source ('emdb') and number ('1832') */
export function splitEntryId(entryId) {
    var _a;
    var PREFIX_TO_SOURCE = { 'emd': 'emdb' };
    var _b = entryId.split('-'), prefix = _b[0], entry = _b[1];
    return {
        source: (_a = PREFIX_TO_SOURCE[prefix]) !== null && _a !== void 0 ? _a : prefix,
        entryNumber: entry
    };
}
/** Create entry ID (e.g. 'emd-1832') for a combination of source ('emdb') and number ('1832') */
export function createEntryId(source, entryNumber) {
    var _a;
    var SOURCE_TO_PREFIX = { 'emdb': 'emd' };
    var prefix = (_a = SOURCE_TO_PREFIX[source]) !== null && _a !== void 0 ? _a : source;
    return "".concat(prefix, "-").concat(entryNumber);
}
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
        return ParamDefinition.Select(defaultValue !== null && defaultValue !== void 0 ? defaultValue : this.defaultValue, this.options, info);
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
export { Choice };
export function isDefined(x) {
    return x !== undefined;
}
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
            setSubtreeVisibility(node.state, node.ref, true); // hide
        }
    };
    NodeManager.prototype.showNode = function (key, factory, forceVisible) {
        if (forceVisible === void 0) { forceVisible = true; }
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = this.getNode(key);
                        if (!node) return [3 /*break*/, 1];
                        if (forceVisible) {
                            setSubtreeVisibility(node.state, node.ref, false); // show
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
export { NodeManager };
var CreateTransformer = StateTransformer.builderFactory('volseg');
export var CreateVolume = CreateTransformer({
    name: 'create-transformer',
    from: PluginStateObject.Root,
    to: PluginStateObject.Volume.Data,
    params: {
        label: ParamDefinition.Text('Volume', { isHidden: true }),
        description: ParamDefinition.Text('', { isHidden: true }),
        volume: ParamDefinition.Value(undefined, { isHidden: true }),
    }
})({
    apply: function (_a) {
        var params = _a.params;
        return new PluginStateObject.Volume.Data(params.volume, { label: params.label, description: params.description });
    }
});
export function applyEllipsis(name, max_chars) {
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
export function lazyGetter(getter, errorIfUndefined) {
    var value = undefined;
    return function () {
        if (value === undefined)
            value = getter();
        if (errorIfUndefined && value === undefined)
            throw new Error(errorIfUndefined);
        return value;
    };
}
