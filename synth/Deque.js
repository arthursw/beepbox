// Copyright (C) 2020 John Nesky, distributed under the MIT license.
//namespace beepbox {
var Deque = (function () {
    function Deque() {
        this._capacity = 1;
        this._buffer = [undefined];
        this._mask = 0;
        this._offset = 0;
        this._count = 0;
    }
    Deque.prototype.pushFront = function (element) {
        if (this._count >= this._capacity)
            this._expandCapacity();
        this._offset = (this._offset - 1) & this._mask;
        this._buffer[this._offset] = element;
        this._count++;
    };
    Deque.prototype.pushBack = function (element) {
        if (this._count >= this._capacity)
            this._expandCapacity();
        this._buffer[(this._offset + this._count) & this._mask] = element;
        this._count++;
    };
    Deque.prototype.popFront = function () {
        if (this._count <= 0)
            throw new Error("No elements left to pop.");
        var element = this._buffer[this._offset];
        this._buffer[this._offset] = undefined;
        this._offset = (this._offset + 1) & this._mask;
        this._count--;
        return element;
    };
    Deque.prototype.popBack = function () {
        if (this._count <= 0)
            throw new Error("No elements left to pop.");
        this._count--;
        var index = (this._offset + this._count) & this._mask;
        var element = this._buffer[index];
        this._buffer[index] = undefined;
        return element;
    };
    Deque.prototype.peakFront = function () {
        if (this._count <= 0)
            throw new Error("No elements left to pop.");
        return this._buffer[this._offset];
    };
    Deque.prototype.peakBack = function () {
        if (this._count <= 0)
            throw new Error("No elements left to pop.");
        return this._buffer[(this._offset + this._count - 1) & this._mask];
    };
    Deque.prototype.count = function () {
        return this._count;
    };
    Deque.prototype.set = function (index, element) {
        if (index < 0 || index >= this._count)
            throw new Error("Invalid index");
        this._buffer[(this._offset + index) & this._mask] = element;
    };
    Deque.prototype.get = function (index) {
        if (index < 0 || index >= this._count)
            throw new Error("Invalid index");
        return this._buffer[(this._offset + index) & this._mask];
    };
    Deque.prototype.remove = function (index) {
        if (index < 0 || index >= this._count)
            throw new Error("Invalid index");
        if (index <= (this._count >> 1)) {
            while (index > 0) {
                this.set(index, this.get(index - 1));
                index--;
            }
            this.popFront();
        }
        else {
            index++;
            while (index < this._count) {
                this.set(index - 1, this.get(index));
                index++;
            }
            this.popBack();
        }
    };
    Deque.prototype._expandCapacity = function () {
        if (this._capacity >= 0x40000000)
            throw new Error("Capacity too big.");
        this._capacity = this._capacity << 1;
        var oldBuffer = this._buffer;
        var newBuffer = new Array(this._capacity);
        var size = this._count | 0;
        var offset = this._offset | 0;
        for (var i = 0; i < size; i++) {
            newBuffer[i] = oldBuffer[(offset + i) & this._mask];
        }
        for (var i = size; i < this._capacity; i++) {
            newBuffer[i] = undefined;
        }
        this._offset = 0;
        this._buffer = newBuffer;
        this._mask = this._capacity - 1;
    };
    return Deque;
})();
exports.Deque = Deque;
//}
