// Copyright (C) 2020 John Nesky, distributed under the MIT license.
//namespace beepbox {
function transfer(source, length) {
    var dest = new ArrayBuffer(length);
    var nextOffset = 0;
    var leftBytes = Math.min(source.byteLength, dest.byteLength);
    var wordSizes = [8, 4, 2, 1];
    for (var _i = 0; _i < wordSizes.length; _i++) {
        var wordSize = wordSizes[_i];
        if (leftBytes >= wordSize) {
            var done = transferWith(wordSize, source, dest, nextOffset, leftBytes);
            nextOffset = done.nextOffset;
            leftBytes = done.leftBytes;
        }
    }
    return dest;
    function transferWith(wordSize, source, dest, nextOffset, leftBytes) {
        var ViewClass = Uint8Array;
        switch (wordSize) {
            case 8:
                ViewClass = Float64Array;
                break;
            case 4:
                ViewClass = Float32Array;
                break;
            case 2:
                ViewClass = Uint16Array;
                break;
            case 1:
                ViewClass = Uint8Array;
                break;
            default:
                ViewClass = Uint8Array;
                break;
        }
        var view_source = new ViewClass(source, nextOffset, (leftBytes / wordSize) | 0);
        var view_dest = new ViewClass(dest, nextOffset, (leftBytes / wordSize) | 0);
        for (var i = 0; i < view_dest.length; i++) {
            view_dest[i] = view_source[i];
        }
        return {
            nextOffset: view_source.byteOffset + view_source.byteLength,
            leftBytes: leftBytes - view_dest.length * wordSize
        };
    }
}
// Note: All methods are big endian.
var ArrayBufferWriter = (function () {
    function ArrayBufferWriter(initialCapacity) {
        this._writeIndex = 0;
        this._fileSize = 0;
        this._arrayBuffer = new ArrayBuffer(initialCapacity);
        this._data = new DataView(this._arrayBuffer);
    }
    ArrayBufferWriter.prototype._addBytes = function (numBytes) {
        this._fileSize += numBytes;
        if (this._fileSize > this._arrayBuffer.byteLength) {
            this._arrayBuffer = transfer(this._arrayBuffer, Math.max(this._arrayBuffer.byteLength * 2, this._fileSize));
            this._data = new DataView(this._arrayBuffer);
        }
    };
    ArrayBufferWriter.prototype.getWriteIndex = function () {
        return this._writeIndex;
    };
    ArrayBufferWriter.prototype.rewriteUint32 = function (index, value) {
        this._data.setUint32(index, value >>> 0, false);
    };
    ArrayBufferWriter.prototype.writeUint32 = function (value) {
        value = value >>> 0;
        this._addBytes(4);
        this._data.setUint32(this._writeIndex, value, false);
        this._writeIndex = this._fileSize;
    };
    ArrayBufferWriter.prototype.writeUint24 = function (value) {
        value = value >>> 0;
        this._addBytes(3);
        this._data.setUint8(this._writeIndex, (value >> 16) & 0xff);
        this._data.setUint8(this._writeIndex + 1, (value >> 8) & 0xff);
        this._data.setUint8(this._writeIndex + 2, (value) & 0xff);
        this._writeIndex = this._fileSize;
    };
    ArrayBufferWriter.prototype.writeUint16 = function (value) {
        value = value >>> 0;
        this._addBytes(2);
        this._data.setUint16(this._writeIndex, value, false);
        this._writeIndex = this._fileSize;
    };
    ArrayBufferWriter.prototype.writeUint8 = function (value) {
        value = value >>> 0;
        this._addBytes(1);
        this._data.setUint8(this._writeIndex, value);
        this._writeIndex = this._fileSize;
    };
    ArrayBufferWriter.prototype.writeInt8 = function (value) {
        value = value | 0;
        this._addBytes(1);
        this._data.setInt8(this._writeIndex, value);
        this._writeIndex = this._fileSize;
    };
    ArrayBufferWriter.prototype.writeMidi7Bits = function (value) {
        value = value >>> 0;
        if (value >= 0x80)
            throw new Error("7 bit value contained 8th bit!");
        this._addBytes(1);
        this._data.setUint8(this._writeIndex, value);
        this._writeIndex = this._fileSize;
    };
    ArrayBufferWriter.prototype.writeMidiVariableLength = function (value) {
        value = value >>> 0;
        if (value > 0x0fffffff)
            throw new Error("writeVariableLength value too big.");
        var startWriting = false;
        for (var i = 0; i < 4; i++) {
            var shift = 21 - i * 7;
            var bits = (value >>> shift) & 0x7f;
            if (bits != 0 || i == 3)
                startWriting = true; // skip leading zero bytes, but always write the last byte even if it's zero. 
            if (startWriting)
                this.writeUint8((i == 3 ? 0x00 : 0x80) | bits);
        }
    };
    ArrayBufferWriter.prototype.writeMidiAscii = function (string) {
        this.writeMidiVariableLength(string.length);
        for (var i = 0; i < string.length; i++) {
            var charCode = string.charCodeAt(i);
            if (charCode > 0x7f)
                throw new Error("Trying to write unicode character as ascii.");
            this.writeUint8(charCode); // technically charCodeAt returns 2 byte values, but this string should contain exclusively 1 byte values.
        }
    };
    ArrayBufferWriter.prototype.toCompactArrayBuffer = function () {
        return transfer(this._arrayBuffer, this._fileSize);
    };
    return ArrayBufferWriter;
})();
exports.ArrayBufferWriter = ArrayBufferWriter;
//}
