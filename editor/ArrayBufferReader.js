// Copyright (C) 2020 John Nesky, distributed under the MIT license.
//namespace beepbox {
// Note: All methods are big endian.
var ArrayBufferReader = (function () {
    function ArrayBufferReader(data) {
        this._readIndex = 0;
        this._data = data;
    }
    ArrayBufferReader.prototype.getReadIndex = function () {
        return this._readIndex;
    };
    ArrayBufferReader.prototype.readUint32 = function () {
        if (this._readIndex + 4 > this._data.byteLength)
            throw new Error("Reading past the end of the buffer.");
        var result = this._data.getUint32(this._readIndex, false);
        this._readIndex += 4;
        return result;
    };
    ArrayBufferReader.prototype.readUint24 = function () {
        return (this.readUint8() << 16) | (this.readUint8() << 8) | (this.readUint8());
    };
    ArrayBufferReader.prototype.readUint16 = function () {
        if (this._readIndex + 2 > this._data.byteLength)
            throw new Error("Reading past the end of the buffer.");
        var result = this._data.getUint16(this._readIndex, false);
        this._readIndex += 2;
        return result;
    };
    ArrayBufferReader.prototype.readUint8 = function () {
        if (this._readIndex + 1 > this._data.byteLength)
            throw new Error("Reading past the end of the buffer.");
        var result = this._data.getUint8(this._readIndex);
        this._readIndex++;
        return result;
    };
    ArrayBufferReader.prototype.readInt8 = function () {
        if (this._readIndex + 1 > this._data.byteLength)
            throw new Error("Reading past the end of the buffer.");
        var result = this._data.getInt8(this._readIndex);
        this._readIndex++;
        return result;
    };
    ArrayBufferReader.prototype.peakUint8 = function () {
        if (this._readIndex + 1 > this._data.byteLength)
            throw new Error("Reading past the end of the buffer.");
        return this._data.getUint8(this._readIndex);
    };
    ArrayBufferReader.prototype.readMidi7Bits = function () {
        var result = this.readUint8();
        if (result >= 0x80)
            console.log("7 bit value contained 8th bit! value " + result + ", index " + this._readIndex);
        return result & 0x7f;
    };
    ArrayBufferReader.prototype.readMidiVariableLength = function () {
        var result = 0;
        for (var i = 0; i < 4; i++) {
            var nextByte = this.readUint8();
            result += nextByte & 0x7f;
            if (nextByte & 0x80) {
                result = result << 7;
            }
            else {
                break;
            }
        }
        return result;
    };
    ArrayBufferReader.prototype.skipBytes = function (length) {
        this._readIndex += length;
    };
    ArrayBufferReader.prototype.hasMore = function () {
        return this._data.byteLength > this._readIndex;
    };
    ArrayBufferReader.prototype.getReaderForNextBytes = function (length) {
        if (this._readIndex + length > this._data.byteLength)
            throw new Error("Reading past the end of the buffer.");
        var result = new ArrayBufferReader(new DataView(this._data.buffer, this._data.byteOffset + this._readIndex, length));
        this.skipBytes(length);
        return result;
    };
    return ArrayBufferReader;
})();
exports.ArrayBufferReader = ArrayBufferReader;
//}
