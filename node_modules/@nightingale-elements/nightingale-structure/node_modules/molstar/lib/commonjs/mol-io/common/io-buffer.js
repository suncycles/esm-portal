"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted and converted to TypeScript from https://github.com/image-js/iobuffer
 * MIT License, Copyright (c) 2015 Michaël Zasso
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IOBuffer = void 0;
var defaultByteLength = 1024 * 8;
var charArray = [];
/**
 * Class for writing and reading binary data
 */
var IOBuffer = /** @class */ (function () {
    /**
     * If it's a number, it will initialize the buffer with the number as
     * the buffer's length. If it's undefined, it will initialize the buffer
     * with a default length of 8 Kb. If its an ArrayBuffer, a TypedArray,
     * it will create a view over the underlying ArrayBuffer.
     */
    function IOBuffer(data, params) {
        if (params === void 0) { params = {}; }
        this._mark = 0;
        this._marks = [];
        this.offset = 0; // The current offset of the buffer's pointer
        this.littleEndian = true;
        var dataIsGiven = false;
        if (data === undefined) {
            data = defaultByteLength;
        }
        if (typeof data === 'number') {
            data = new ArrayBuffer(data);
        }
        else {
            dataIsGiven = true;
        }
        var offset = params.offset ? params.offset >>> 0 : 0;
        var byteLength = data.byteLength - offset;
        var dvOffset = offset;
        if (!(data instanceof ArrayBuffer)) {
            if (data.byteLength !== data.buffer.byteLength) {
                dvOffset = data.byteOffset + offset;
            }
            data = data.buffer;
        }
        if (dataIsGiven) {
            this._lastWrittenByte = byteLength;
        }
        else {
            this._lastWrittenByte = 0;
        }
        this.buffer = data;
        this.length = byteLength;
        this.byteLength = byteLength;
        this.byteOffset = dvOffset;
        this._data = new DataView(this.buffer, dvOffset, byteLength);
    }
    /**
     * Checks if the memory allocated to the buffer is sufficient to store more bytes after the offset
     * @param byteLength The needed memory in bytes
     */
    IOBuffer.prototype.available = function (byteLength) {
        if (byteLength === void 0) { byteLength = 1; }
        return (this.offset + byteLength) <= this.length;
    };
    /**
     * Check if little-endian mode is used for reading and writing multi-byte values
     * Returns true if little-endian mode is used, false otherwise
     */
    IOBuffer.prototype.isLittleEndian = function () {
        return this.littleEndian;
    };
    /**
     * Set little-endian mode for reading and writing multi-byte values
     */
    IOBuffer.prototype.setLittleEndian = function () {
        this.littleEndian = true;
        return this;
    };
    /**
     * Check if big-endian mode is used for reading and writing multi-byte values
     * Returns true if big-endian mode is used, false otherwise
     */
    IOBuffer.prototype.isBigEndian = function () {
        return !this.littleEndian;
    };
    /**
     * Switches to big-endian mode for reading and writing multi-byte values
     */
    IOBuffer.prototype.setBigEndian = function () {
        this.littleEndian = false;
        return this;
    };
    /**
     * Move the pointer n bytes forward
     */
    IOBuffer.prototype.skip = function (n) {
        if (n === undefined)
            n = 1;
        this.offset += n;
        return this;
    };
    /**
     * Move the pointer to the given offset
     */
    IOBuffer.prototype.seek = function (offset) {
        this.offset = offset;
        return this;
    };
    /**
     * Store the current pointer offset.
     */
    IOBuffer.prototype.mark = function () {
        this._mark = this.offset;
        return this;
    };
    /**
     * Move the pointer back to the last pointer offset set by mark
     */
    IOBuffer.prototype.reset = function () {
        this.offset = this._mark;
        return this;
    };
    /**
     * Push the current pointer offset to the mark stack
     */
    IOBuffer.prototype.pushMark = function () {
        this._marks.push(this.offset);
        return this;
    };
    /**
     * Pop the last pointer offset from the mark stack, and set the current pointer offset to the popped value
     */
    IOBuffer.prototype.popMark = function () {
        var offset = this._marks.pop();
        if (offset === undefined)
            throw new Error('Mark stack empty');
        this.seek(offset);
        return this;
    };
    /**
     * Move the pointer offset back to 0
     */
    IOBuffer.prototype.rewind = function () {
        this.offset = 0;
        return this;
    };
    /**
     * Make sure the buffer has sufficient memory to write a given byteLength at the current pointer offset
     * If the buffer's memory is insufficient, this method will create a new buffer (a copy) with a length
     * that is twice (byteLength + current offset)
     */
    IOBuffer.prototype.ensureAvailable = function (byteLength) {
        if (byteLength === undefined)
            byteLength = 1;
        if (!this.available(byteLength)) {
            var lengthNeeded = this.offset + byteLength;
            var newLength = lengthNeeded * 2;
            var newArray = new Uint8Array(newLength);
            newArray.set(new Uint8Array(this.buffer));
            this.buffer = newArray.buffer;
            this.length = this.byteLength = newLength;
            this._data = new DataView(this.buffer);
        }
        return this;
    };
    /**
     * Read a byte and return false if the byte's value is 0, or true otherwise
     * Moves pointer forward
     */
    IOBuffer.prototype.readBoolean = function () {
        return this.readUint8() !== 0;
    };
    /**
     * Read a signed 8-bit integer and move pointer forward
     */
    IOBuffer.prototype.readInt8 = function () {
        return this._data.getInt8(this.offset++);
    };
    /**
     * Read an unsigned 8-bit integer and move pointer forward
     */
    IOBuffer.prototype.readUint8 = function () {
        return this._data.getUint8(this.offset++);
    };
    /**
     * Alias for {@link IOBuffer#readUint8}
     */
    IOBuffer.prototype.readByte = function () {
        return this.readUint8();
    };
    /**
     * Read n bytes and move pointer forward.
     */
    IOBuffer.prototype.readBytes = function (n) {
        if (n === undefined)
            n = 1;
        var bytes = new Uint8Array(n);
        for (var i = 0; i < n; i++) {
            bytes[i] = this.readByte();
        }
        return bytes;
    };
    /**
     * Read a 16-bit signed integer and move pointer forward
     */
    IOBuffer.prototype.readInt16 = function () {
        var value = this._data.getInt16(this.offset, this.littleEndian);
        this.offset += 2;
        return value;
    };
    /**
     * Read a 16-bit unsigned integer and move pointer forward
     */
    IOBuffer.prototype.readUint16 = function () {
        var value = this._data.getUint16(this.offset, this.littleEndian);
        this.offset += 2;
        return value;
    };
    /**
     * Read a 32-bit signed integer and move pointer forward
     */
    IOBuffer.prototype.readInt32 = function () {
        var value = this._data.getInt32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    };
    /**
     * Read a 32-bit unsigned integer and move pointer forward
     */
    IOBuffer.prototype.readUint32 = function () {
        var value = this._data.getUint32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    };
    /**
     * Read a 32-bit floating number and move pointer forward
     */
    IOBuffer.prototype.readFloat32 = function () {
        var value = this._data.getFloat32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    };
    /**
     * Read a 64-bit floating number and move pointer forward
     */
    IOBuffer.prototype.readFloat64 = function () {
        var value = this._data.getFloat64(this.offset, this.littleEndian);
        this.offset += 8;
        return value;
    };
    /**
     * Read 1-byte ascii character and move pointer forward
     */
    IOBuffer.prototype.readChar = function () {
        return String.fromCharCode(this.readInt8());
    };
    /**
     * Read n 1-byte ascii characters and move pointer forward
     */
    IOBuffer.prototype.readChars = function (n) {
        if (n === void 0) { n = 1; }
        charArray.length = n;
        for (var i = 0; i < n; i++) {
            charArray[i] = this.readChar();
        }
        return charArray.join('');
    };
    /**
     * Write 0xff if the passed value is truthy, 0x00 otherwise
     */
    IOBuffer.prototype.writeBoolean = function (value) {
        if (value === void 0) { value = false; }
        this.writeUint8(value ? 0xff : 0x00);
        return this;
    };
    /**
     * Write value as an 8-bit signed integer
     */
    IOBuffer.prototype.writeInt8 = function (value) {
        this.ensureAvailable(1);
        this._data.setInt8(this.offset++, value);
        this._updateLastWrittenByte();
        return this;
    };
    /**
     * Write value as a 8-bit unsigned integer
     */
    IOBuffer.prototype.writeUint8 = function (value) {
        this.ensureAvailable(1);
        this._data.setUint8(this.offset++, value);
        this._updateLastWrittenByte();
        return this;
    };
    /**
     * An alias for IOBuffer#writeUint8
     */
    IOBuffer.prototype.writeByte = function (value) {
        return this.writeUint8(value);
    };
    /**
     * Write bytes
     */
    IOBuffer.prototype.writeBytes = function (bytes) {
        this.ensureAvailable(bytes.length);
        for (var i = 0; i < bytes.length; i++) {
            this._data.setUint8(this.offset++, bytes[i]);
        }
        this._updateLastWrittenByte();
        return this;
    };
    /**
     * Write value as an 16-bit signed integer
     */
    IOBuffer.prototype.writeInt16 = function (value) {
        this.ensureAvailable(2);
        this._data.setInt16(this.offset, value, this.littleEndian);
        this.offset += 2;
        this._updateLastWrittenByte();
        return this;
    };
    /**
     * Write value as a 16-bit unsigned integer
     */
    IOBuffer.prototype.writeUint16 = function (value) {
        this.ensureAvailable(2);
        this._data.setUint16(this.offset, value, this.littleEndian);
        this.offset += 2;
        this._updateLastWrittenByte();
        return this;
    };
    /**
     * Write a 32-bit signed integer at the current pointer offset
     */
    IOBuffer.prototype.writeInt32 = function (value) {
        this.ensureAvailable(4);
        this._data.setInt32(this.offset, value, this.littleEndian);
        this.offset += 4;
        this._updateLastWrittenByte();
        return this;
    };
    /**
     * Write a 32-bit unsigned integer at the current pointer offset
     */
    IOBuffer.prototype.writeUint32 = function (value) {
        this.ensureAvailable(4);
        this._data.setUint32(this.offset, value, this.littleEndian);
        this.offset += 4;
        this._updateLastWrittenByte();
        return this;
    };
    /**
     * Write a 32-bit floating number at the current pointer offset
     */
    IOBuffer.prototype.writeFloat32 = function (value) {
        this.ensureAvailable(4);
        this._data.setFloat32(this.offset, value, this.littleEndian);
        this.offset += 4;
        this._updateLastWrittenByte();
        return this;
    };
    /**
     * Write a 64-bit floating number at the current pointer offset
     */
    IOBuffer.prototype.writeFloat64 = function (value) {
        this.ensureAvailable(8);
        this._data.setFloat64(this.offset, value, this.littleEndian);
        this.offset += 8;
        this._updateLastWrittenByte();
        return this;
    };
    /**
     * Write the charCode of the passed string's first character to the current pointer offset
     */
    IOBuffer.prototype.writeChar = function (str) {
        return this.writeUint8(str.charCodeAt(0));
    };
    /**
     * Write the charCodes of the passed string's characters to the current pointer offset
     */
    IOBuffer.prototype.writeChars = function (str) {
        for (var i = 0; i < str.length; i++) {
            this.writeUint8(str.charCodeAt(i));
        }
        return this;
    };
    /**
     * Export a Uint8Array view of the internal buffer.
     * The view starts at the byte offset and its length
     * is calculated to stop at the last written byte or the original length.
     */
    IOBuffer.prototype.toArray = function () {
        return new Uint8Array(this.buffer, this.byteOffset, this._lastWrittenByte);
    };
    /**
     * Update the last written byte offset
     */
    IOBuffer.prototype._updateLastWrittenByte = function () {
        if (this.offset > this._lastWrittenByte) {
            this._lastWrittenByte = this.offset;
        }
    };
    return IOBuffer;
}());
exports.IOBuffer = IOBuffer;
