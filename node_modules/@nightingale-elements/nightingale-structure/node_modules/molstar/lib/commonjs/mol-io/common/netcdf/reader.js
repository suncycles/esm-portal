"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from https://github.com/cheminfo-js/netcdfjs
 * MIT License, Copyright (c) 2016 cheminfo
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetcdfReader = void 0;
var io_buffer_1 = require("../io-buffer");
/**
 * Throws a non-valid NetCDF exception if the statement it's true
 */
function notNetcdf(statement, reason) {
    if (statement) {
        throw new TypeError('Not a valid NetCDF v3.x file: ' + reason);
    }
}
/**
 * Moves 1, 2, or 3 bytes to next 4-byte boundary
 */
function padding(buffer) {
    if ((buffer.offset % 4) !== 0) {
        buffer.skip(4 - (buffer.offset % 4));
    }
}
/**
 * Reads the name
 */
function readName(buffer) {
    // Read name
    var nameLength = buffer.readUint32();
    var name = buffer.readChars(nameLength);
    // validate name
    // TODO
    // Apply padding
    padding(buffer);
    return name;
}
var types = {
    BYTE: 1,
    CHAR: 2,
    SHORT: 3,
    INT: 4,
    FLOAT: 5,
    DOUBLE: 6
};
/**
 * Parse a number into their respective type
 */
function num2str(type) {
    switch (Number(type)) {
        case types.BYTE:
            return 'byte';
        case types.CHAR:
            return 'char';
        case types.SHORT:
            return 'short';
        case types.INT:
            return 'int';
        case types.FLOAT:
            return 'float';
        case types.DOUBLE:
            return 'double';
        default:
            return 'undefined';
    }
}
/**
 * Parse a number type identifier to his size in bytes
 */
function num2bytes(type) {
    switch (Number(type)) {
        case types.BYTE:
            return 1;
        case types.CHAR:
            return 1;
        case types.SHORT:
            return 2;
        case types.INT:
            return 4;
        case types.FLOAT:
            return 4;
        case types.DOUBLE:
            return 8;
        default:
            return -1;
    }
}
/**
 * Reverse search of num2str
 */
function str2num(type) {
    switch (String(type)) {
        case 'byte':
            return types.BYTE;
        case 'char':
            return types.CHAR;
        case 'short':
            return types.SHORT;
        case 'int':
            return types.INT;
        case 'float':
            return types.FLOAT;
        case 'double':
            return types.DOUBLE;
        default:
            return -1;
    }
}
/**
 * Auxiliary function to read numeric data
 */
function readNumber(size, bufferReader) {
    if (size !== 1) {
        var numbers = new Array(size);
        for (var i = 0; i < size; i++) {
            numbers[i] = bufferReader();
        }
        return numbers;
    }
    else {
        return bufferReader();
    }
}
/**
 * Given a type and a size reads the next element
 */
function readType(buffer, type, size) {
    switch (type) {
        case types.BYTE:
            return buffer.readBytes(size);
        case types.CHAR:
            return trimNull(buffer.readChars(size));
        case types.SHORT:
            return readNumber(size, buffer.readInt16.bind(buffer));
        case types.INT:
            return readNumber(size, buffer.readInt32.bind(buffer));
        case types.FLOAT:
            return readNumber(size, buffer.readFloat32.bind(buffer));
        case types.DOUBLE:
            return readNumber(size, buffer.readFloat64.bind(buffer));
        default:
            notNetcdf(true, 'non valid type ' + type);
            return undefined;
    }
}
/**
 * Removes null terminate value
 */
function trimNull(value) {
    if (value.charCodeAt(value.length - 1) === 0) {
        return value.substring(0, value.length - 1);
    }
    return value;
}
// const STREAMING = 4294967295;
/**
 * Read data for the given non-record variable
 */
function nonRecord(buffer, variable) {
    // variable type
    var type = str2num(variable.type);
    // size of the data
    var size = variable.size / num2bytes(type);
    // iterates over the data
    var data = new Array(size);
    for (var i = 0; i < size; i++) {
        data[i] = readType(buffer, type, 1);
    }
    return data;
}
/**
 * Read data for the given record variable
 */
function record(buffer, variable, recordDimension) {
    // variable type
    var type = str2num(variable.type);
    var width = variable.size ? variable.size / num2bytes(type) : 1;
    // size of the data
    // TODO streaming data
    var size = recordDimension.length;
    // iterates over the data
    var data = new Array(size);
    var step = recordDimension.recordStep;
    for (var i = 0; i < size; i++) {
        var currentOffset = buffer.offset;
        data[i] = readType(buffer, type, width);
        buffer.seek(currentOffset + step);
    }
    return data;
}
// Grammar constants
var ZERO = 0;
var NC_DIMENSION = 10;
var NC_VARIABLE = 11;
var NC_ATTRIBUTE = 12;
/**
 * Read the header of the file
 * Returns object with the fields:
 *  - `recordDimension`: Number with the length of record dimension
 *  - `dimensions`: List of dimensions
 *  - `globalAttributes`: List of global attributes
 *  - `variables`: List of variables
 */
function header(buffer, version) {
    // Length of record dimension
    // sum of the varSize's of all the record variables.
    var header = { recordDimension: { length: buffer.readUint32() } };
    // Version
    header.version = version;
    // List of dimensions
    var dimList = dimensionsList(buffer);
    header.recordDimension.id = dimList.recordId;
    header.recordDimension.name = dimList.recordName;
    header.dimensions = dimList.dimensions;
    // List of global attributes
    header.globalAttributes = attributesList(buffer);
    // List of variables
    var variables = variablesList(buffer, dimList.recordId, version);
    header.variables = variables.variables;
    header.recordDimension.recordStep = variables.recordStep;
    return header;
}
/**
 * List of dimensions
 */
function dimensionsList(buffer) {
    var dimensions, recordId, recordName;
    var dimList = buffer.readUint32();
    if (dimList === ZERO) {
        notNetcdf((buffer.readUint32() !== ZERO), 'wrong empty tag for list of dimensions');
        return [];
    }
    else {
        notNetcdf((dimList !== NC_DIMENSION), 'wrong tag for list of dimensions');
        // Length of dimensions
        var dimensionSize = buffer.readUint32();
        dimensions = new Array(dimensionSize);
        for (var dim = 0; dim < dimensionSize; dim++) {
            // Read name
            var name_1 = readName(buffer);
            // Read dimension size
            var size = buffer.readUint32();
            if (size === 0) {
                recordId = dim;
                recordName = name_1;
            }
            dimensions[dim] = {
                name: name_1,
                size: size
            };
        }
        return {
            dimensions: dimensions,
            recordId: recordId,
            recordName: recordName
        };
    }
}
/**
 * List of attributes
 */
function attributesList(buffer) {
    var attributes;
    var gAttList = buffer.readUint32();
    if (gAttList === ZERO) {
        notNetcdf((buffer.readUint32() !== ZERO), 'wrong empty tag for list of attributes');
        return [];
    }
    else {
        notNetcdf((gAttList !== NC_ATTRIBUTE), 'wrong tag for list of attributes');
        // Length of attributes
        var attributeSize = buffer.readUint32();
        attributes = new Array(attributeSize);
        for (var gAtt = 0; gAtt < attributeSize; gAtt++) {
            // Read name
            var name_2 = readName(buffer);
            // Read type
            var type = buffer.readUint32();
            notNetcdf(((type < 1) || (type > 6)), 'non valid type ' + type);
            // Read attribute
            var size = buffer.readUint32();
            var value = readType(buffer, type, size);
            // Apply padding
            padding(buffer);
            attributes[gAtt] = {
                name: name_2,
                type: num2str(type),
                value: value
            };
        }
    }
    return attributes;
}
/**
 * List of variables
 */
function variablesList(buffer, recordId, version) {
    var varList = buffer.readUint32();
    var recordStep = 0;
    var variables;
    if (varList === ZERO) {
        notNetcdf((buffer.readUint32() !== ZERO), 'wrong empty tag for list of variables');
        return [];
    }
    else {
        notNetcdf((varList !== NC_VARIABLE), 'wrong tag for list of variables');
        // Length of variables
        var variableSize = buffer.readUint32();
        variables = new Array(variableSize);
        for (var v = 0; v < variableSize; v++) {
            // Read name
            var name_3 = readName(buffer);
            // Read dimensionality of the variable
            var dimensionality = buffer.readUint32();
            // Index into the list of dimensions
            var dimensionsIds = new Array(dimensionality);
            for (var dim = 0; dim < dimensionality; dim++) {
                dimensionsIds[dim] = buffer.readUint32();
            }
            // Read variables size
            var attributes = attributesList(buffer);
            // Read type
            var type = buffer.readUint32();
            notNetcdf(((type < 1) && (type > 6)), 'non valid type ' + type);
            // Read variable size
            // The 32-bit varSize field is not large enough to contain the
            // size of variables that require more than 2^32 - 4 bytes,
            // so 2^32 - 1 is used in the varSize field for such variables.
            var varSize = buffer.readUint32();
            // Read offset
            var offset = buffer.readUint32();
            if (version === 2) {
                notNetcdf((offset > 0), 'offsets larger than 4GB not supported');
                offset = buffer.readUint32();
            }
            // Count amount of record variables
            if (dimensionsIds[0] === recordId) {
                recordStep += varSize;
            }
            variables[v] = {
                name: name_3,
                dimensions: dimensionsIds,
                attributes: attributes,
                type: num2str(type),
                size: varSize,
                offset: offset,
                record: (dimensionsIds[0] === recordId)
            };
        }
    }
    return {
        variables: variables,
        recordStep: recordStep
    };
}
/**
 * Reads a NetCDF v3.x file
 * https://www.unidata.ucar.edu/software/netcdf/docs/file_format_specifications.html
 */
var NetcdfReader = /** @class */ (function () {
    function NetcdfReader(data) {
        var buffer = new io_buffer_1.IOBuffer(data);
        buffer.setBigEndian();
        // Validate that it's a NetCDF file
        notNetcdf((buffer.readChars(3) !== 'CDF'), 'should start with CDF');
        // Check the NetCDF format
        var version = buffer.readByte();
        notNetcdf((version > 2), 'unknown version');
        // Read the header
        this.header = header(buffer, version);
        this.buffer = buffer;
    }
    Object.defineProperty(NetcdfReader.prototype, "version", {
        /**
         * Version for the NetCDF format
         */
        get: function () {
            if (this.header.version === 1) {
                return 'classic format';
            }
            else {
                return '64-bit offset format';
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NetcdfReader.prototype, "recordDimension", {
        get: function () {
            return this.header.recordDimension;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NetcdfReader.prototype, "dimensions", {
        get: function () {
            return this.header.dimensions;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NetcdfReader.prototype, "globalAttributes", {
        get: function () {
            return this.header.globalAttributes;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NetcdfReader.prototype, "variables", {
        get: function () {
            return this.header.variables;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Checks if a variable is available
     * @param {string|object} variableName - Name of the variable to check
     * @return {Boolean} - Variable existence
     */
    NetcdfReader.prototype.hasDataVariable = function (variableName) {
        return this.header.variables && this.header.variables.findIndex(function (val) { return val.name === variableName; }) !== -1;
    };
    /**
     * Retrieves the data for a given variable
     * @param {string|object} variableName - Name of the variable to search or variable object
     * @return {Array} - List with the variable values
     */
    NetcdfReader.prototype.getDataVariable = function (variableName) {
        var _a;
        var variable;
        if (typeof variableName === 'string') {
            // search the variable
            variable = (_a = this.header.variables) === null || _a === void 0 ? void 0 : _a.find(function (val) { return val.name === variableName; });
        }
        else {
            variable = variableName;
        }
        // throws if variable not found
        if (variable === undefined)
            throw new Error('variable not found');
        // go to the offset position
        this.buffer.seek(variable.offset);
        if (variable.record) {
            // record variable case
            return record(this.buffer, variable, this.header.recordDimension);
        }
        else {
            // non-record variable case
            return nonRecord(this.buffer, variable);
        }
    };
    return NetcdfReader;
}());
exports.NetcdfReader = NetcdfReader;
