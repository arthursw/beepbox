// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var ChangeNotifier = (function () {
    function ChangeNotifier() {
        this._watchers = [];
        this._dirty = false;
    }
    ChangeNotifier.prototype.watch = function (watcher) {
        if (this._watchers.indexOf(watcher) == -1) {
            this._watchers.push(watcher);
        }
    };
    ChangeNotifier.prototype.unwatch = function (watcher) {
        var index = this._watchers.indexOf(watcher);
        if (index != -1) {
            this._watchers.splice(index, 1);
        }
    };
    ChangeNotifier.prototype.changed = function () {
        this._dirty = true;
    };
    ChangeNotifier.prototype.notifyWatchers = function () {
        if (!this._dirty)
            return;
        this._dirty = false;
        for (var _i = 0, _a = this._watchers.concat(); _i < _a.length; _i++) {
            var watcher = _a[_i];
            watcher();
        }
    };
    return ChangeNotifier;
})();
exports.ChangeNotifier = ChangeNotifier;
