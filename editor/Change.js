// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//namespace beepbox {
var Change = (function () {
    function Change() {
        this._noop = true;
    }
    Change.prototype._didSomething = function () {
        this._noop = false;
    };
    Change.prototype.isNoop = function () {
        return this._noop;
    };
    Change.prototype.commit = function () { };
    return Change;
})();
exports.Change = Change;
var UndoableChange = (function (_super) {
    __extends(UndoableChange, _super);
    function UndoableChange(reversed) {
        _super.call(this);
        this._reversed = reversed;
        this._doneForwards = !reversed;
    }
    UndoableChange.prototype.undo = function () {
        if (this._reversed) {
            this._doForwards();
            this._doneForwards = true;
        }
        else {
            this._doBackwards();
            this._doneForwards = false;
        }
    };
    UndoableChange.prototype.redo = function () {
        if (this._reversed) {
            this._doBackwards();
            this._doneForwards = false;
        }
        else {
            this._doForwards();
            this._doneForwards = true;
        }
    };
    // isDoneForwards() returns whether or not the Change was most recently 
    // performed forwards or backwards. If the change created something, do not 
    // delete it in the change destructor unless the Change was performed 
    // backwards: 
    UndoableChange.prototype._isDoneForwards = function () {
        return this._doneForwards;
    };
    UndoableChange.prototype._doForwards = function () {
        throw new Error("Change.doForwards(): Override me.");
    };
    UndoableChange.prototype._doBackwards = function () {
        throw new Error("Change.doBackwards(): Override me.");
    };
    return UndoableChange;
})(Change);
exports.UndoableChange = UndoableChange;
var ChangeGroup = (function (_super) {
    __extends(ChangeGroup, _super);
    function ChangeGroup() {
        _super.call(this);
    }
    ChangeGroup.prototype.append = function (change) {
        if (change.isNoop())
            return;
        this._didSomething();
    };
    return ChangeGroup;
})(Change);
exports.ChangeGroup = ChangeGroup;
var ChangeSequence = (function (_super) {
    __extends(ChangeSequence, _super);
    function ChangeSequence(changes) {
        _super.call(this, false);
        if (changes == undefined) {
            this._changes = [];
        }
        else {
            this._changes = changes.concat();
        }
    }
    ChangeSequence.prototype.append = function (change) {
        if (change.isNoop())
            return;
        this._changes[this._changes.length] = change;
        this._didSomething();
    };
    ChangeSequence.prototype._doForwards = function () {
        for (var i = 0; i < this._changes.length; i++) {
            this._changes[i].redo();
        }
    };
    ChangeSequence.prototype._doBackwards = function () {
        for (var i = this._changes.length - 1; i >= 0; i--) {
            this._changes[i].undo();
        }
    };
    return ChangeSequence;
})(UndoableChange);
exports.ChangeSequence = ChangeSequence;
//}
