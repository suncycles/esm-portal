"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.treeSchemaToMarkdown = exports.treeSchemaToString = exports.validateTree = exports.treeValidationIssues = exports.TreeSchemaWithAllRequired = exports.TreeSchema = exports.getChildren = exports.getParams = void 0;
const json_1 = require("../../../../mol-util/json");
const object_1 = require("../../../../mol-util/object");
const params_schema_1 = require("./params-schema");
const tree_utils_1 = require("./tree-utils");
/** Get params from a tree node */
function getParams(node) {
    var _a;
    return (_a = node.params) !== null && _a !== void 0 ? _a : {};
}
exports.getParams = getParams;
/** Get children from a tree node */
function getChildren(tree) {
    var _a;
    return (_a = tree.children) !== null && _a !== void 0 ? _a : [];
}
exports.getChildren = getChildren;
function TreeSchema(schema) {
    return schema;
}
exports.TreeSchema = TreeSchema;
function TreeSchemaWithAllRequired(schema) {
    return {
        ...schema,
        nodes: (0, object_1.mapObjectMap)(schema.nodes, node => ({ ...node, params: (0, params_schema_1.AllRequired)(node.params) })),
    };
}
exports.TreeSchemaWithAllRequired = TreeSchemaWithAllRequired;
/** Return `undefined` if a tree conforms to the given schema,
 * return validation issues (as a list of lines) if it does not conform.
 * If `options.requireAll`, all parameters (including optional) must have a value provided.
 * If `options.noExtra` is true, presence of any extra parameters is treated as an issue.
 * If `options.anyRoot` is true, the kind of the root node is not enforced.
 */
function treeValidationIssues(schema, tree, options = {}) {
    if (!(0, object_1.isPlainObject)(tree))
        return [`Node must be an object, not ${tree}`];
    if (!options.anyRoot && tree.kind !== schema.rootKind)
        return [`Invalid root node kind "${tree.kind}", root must be of kind "${schema.rootKind}"`];
    const nodeSchema = schema.nodes[tree.kind];
    if (!nodeSchema)
        return [`Unknown node kind "${tree.kind}"`];
    if (nodeSchema.parent && (options.parent !== undefined) && !nodeSchema.parent.includes(options.parent)) {
        return [`Node of kind "${tree.kind}" cannot appear as a child of "${options.parent}". Allowed parents for "${tree.kind}" are: ${nodeSchema.parent.map(s => `"${s}"`).join(', ')}`];
    }
    const issues = (0, params_schema_1.paramsValidationIssues)(nodeSchema.params, getParams(tree), options);
    if (issues)
        return [`Invalid parameters for node of kind "${tree.kind}":`, ...issues.map(s => '  ' + s)];
    for (const child of getChildren(tree)) {
        const issues = treeValidationIssues(schema, child, { ...options, anyRoot: true, parent: tree.kind });
        if (issues)
            return issues;
    }
    return undefined;
}
exports.treeValidationIssues = treeValidationIssues;
/** Validate a tree against the given schema.
 * Do nothing if OK; print validation issues on console and throw an error is the tree does not conform.
 * Include `label` in the printed output. */
function validateTree(schema, tree, label) {
    const issues = treeValidationIssues(schema, tree, { noExtra: true });
    if (issues) {
        console.warn(`Invalid ${label} tree:\n${(0, tree_utils_1.treeToString)(tree)}`);
        console.error(`${label} tree validation issues:`);
        for (const line of issues) {
            console.error(' ', line);
        }
        throw new Error('FormatError');
    }
}
exports.validateTree = validateTree;
/** Return documentation for a tree schema as plain text */
function treeSchemaToString(schema, defaults) {
    return treeSchemaToString_(schema, defaults, false);
}
exports.treeSchemaToString = treeSchemaToString;
/** Return documentation for a tree schema as markdown text */
function treeSchemaToMarkdown(schema, defaults) {
    return treeSchemaToString_(schema, defaults, true);
}
exports.treeSchemaToMarkdown = treeSchemaToMarkdown;
function treeSchemaToString_(schema, defaults, markdown = false) {
    var _a;
    const out = [];
    const bold = (str) => markdown ? `**${str}**` : str;
    const code = (str) => markdown ? `\`${str}\`` : str;
    const h1 = markdown ? '## ' : '  - ';
    const p1 = markdown ? '' : '    ';
    const h2 = markdown ? '- ' : '      - ';
    const p2 = markdown ? '  ' : '        ';
    const newline = markdown ? '\n\n' : '\n';
    out.push(`Tree schema:`);
    for (const kind in schema.nodes) {
        const { description, params, parent } = schema.nodes[kind];
        out.push(`${h1}${code(kind)}`);
        if (kind === schema.rootKind) {
            out.push(`${p1}[Root of the tree must be of this kind]`);
        }
        if (description) {
            out.push(`${p1}${description}`);
        }
        out.push(`${p1}Parent: ${!parent ? 'any' : parent.length === 0 ? 'none' : parent.map(code).join(' or ')}`);
        out.push(`${p1}Params:${Object.keys(params).length > 0 ? '' : ' none'}`);
        for (const key in params) {
            const field = params[key];
            let typeString = field.type.name;
            if (typeString.startsWith('(') && typeString.endsWith(')')) {
                typeString = typeString.slice(1, -1);
            }
            out.push(`${h2}${bold(code(key + (field.required ? ': ' : '?: ')))}${code(typeString)}`);
            const defaultValue = (_a = defaults === null || defaults === void 0 ? void 0 : defaults[kind]) === null || _a === void 0 ? void 0 : _a[key];
            if (field.description) {
                out.push(`${p2}${field.description}`);
            }
            if (defaultValue !== undefined) {
                out.push(`${p2}Default: ${code((0, json_1.onelinerJsonString)(defaultValue))}`);
            }
        }
    }
    return out.join(newline);
}
