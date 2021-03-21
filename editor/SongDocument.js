// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var _this = this;
var synth_1 = require("../synth/synth");
var SongRecovery_1 = require("./SongRecovery");
var ColorConfig_1 = require("./ColorConfig");
var Layout_1 = require("./Layout");
var Selection_1 = require("./Selection");
var Change_1 = require("./Change");
var ChangeNotifier_1 = require("./ChangeNotifier");
var changes_1 = require("./changes");
var SongDocument = (function () {
    function SongDocument() {
        this.notifier = new ChangeNotifier_1.ChangeNotifier();
        this.selection = new Selection_1.Selection(this);
        this.channel = 0;
        this.bar = 0;
        this.volume = 75;
        this.trackVisibleBars = 16;
        this.barScrollPos = 0;
        this.prompt = null = null;
        this.number = 100;
        this._recovery = new SongRecovery_1.SongRecovery();
        this._recentChange = null = null;
        this._sequenceNumber = 0;
        this._lastSequenceNumber = 0;
        this._stateShouldBePushed = false;
        this._recordedNewSong = false;
        this._waitingToUpdateState = false;
        this.notifier.watch(this._normalizeSelection);
        this.autoPlay = window.localStorage.getItem("autoPlay") == "true";
        this.autoFollow = window.localStorage.getItem("autoFollow") == "true";
        this.enableNotePreview = window.localStorage.getItem("enableNotePreview") != "false";
        this.showFifth = window.localStorage.getItem("showFifth") == "true";
        this.showLetters = window.localStorage.getItem("showLetters") == "true";
        this.showChannels = window.localStorage.getItem("showChannels") == "true";
        this.showScrollBar = window.localStorage.getItem("showScrollBar") == "true";
        this.alwaysShowSettings = window.localStorage.getItem("alwaysShowSettings") == "true";
        this.enableChannelMuting = window.localStorage.getItem("enableChannelMuting") == "true";
        this.displayBrowserUrl = window.localStorage.getItem("displayBrowserUrl") != "false";
        this.fullScreen = window.localStorage.getItem("fullScreen") == "true";
        this.colorTheme = window.localStorage.getItem("colorTheme") || "dark classic";
        ColorConfig_1.ColorConfig.setTheme(this.colorTheme);
        Layout_1.Layout.setFullScreen(this.fullScreen);
        if (window.localStorage.getItem("volume") != null) {
            this.volume = Math.min(window.localStorage.getItem("volume") >>> 0, 75);
        }
        if (window.sessionStorage.getItem("currentUndoIndex") == null) {
            window.sessionStorage.setItem("currentUndoIndex", "0");
            window.sessionStorage.setItem("oldestUndoIndex", "0");
            window.sessionStorage.setItem("newestUndoIndex", "0");
        }
        var songString = window.location.hash;
        if (songString == "") {
            songString = this._getHash();
        }
        this.song = new synth_1.Song(songString);
        if (songString == "" || songString == undefined)
            changes_1.setDefaultInstruments(this.song);
        songString = this.song.toBase64String();
        this.synth = new synth_1.Synth(this.song);
        this.synth.volume = this._calcVolume();
        var state = null = this._getHistoryState();
        if (state == null) {
            // When the page is first loaded, indicate that undo is NOT possible.
            state = { canUndo: false, sequenceNumber: 0, bar: 0, channel: 0, recoveryUid: SongRecovery_1.generateUid(), prompt: null, selection: this.selection.toJSON() };
        }
        if (state.recoveryUid == undefined)
            state.recoveryUid = SongRecovery_1.generateUid();
        this._replaceState(state, songString);
        window.addEventListener("hashchange", this._whenHistoryStateChanged);
        window.addEventListener("popstate", this._whenHistoryStateChanged);
        this.bar = state.bar;
        this.channel = state.channel;
        this._recoveryUid = state.recoveryUid;
        this.barScrollPos = Math.max(0, this.bar - (this.trackVisibleBars - 6));
        this.prompt = state.prompt;
        this.selection.fromJSON(state.selection);
        // For all input events, catch them when they are about to finish bubbling,
        // presumably after all handlers are done updating the model, then update the
        // view before the screen renders. mouseenter and mouseleave do not bubble,
        // but they are immediately followed by mousemove which does. 
        for (var _i = 0, _a = ["input", "change", "click", "keyup", "keydown", "mousedown", "mousemove", "mouseup", "touchstart", "touchmove", "touchend", "touchcancel"]; _i < _a.length; _i++) {
            var eventName = _a[_i];
            window.addEventListener(eventName, this._cleanDocument);
        }
    }
    SongDocument.prototype.toggleDisplayBrowserUrl = function () {
        var state = this._getHistoryState();
        !;
        this.displayBrowserUrl = !this.displayBrowserUrl;
        this._replaceState(state, this.song.toBase64String());
    };
    SongDocument.prototype._getHistoryState = ;
    SongDocument.readonly = _maximumUndoHistory;
    return SongDocument;
})();
exports.SongDocument = SongDocument;
null;
{
    if (this.displayBrowserUrl) {
        return window.history.state;
    }
    else {
        var json = JSON.parse(window.sessionStorage.getItem(window.sessionStorage.getItem("currentUndoIndex"), !), !);
        return json == null ? null : json.state;
    }
}
_getHash();
string;
{
    if (this.displayBrowserUrl) {
        return window.location.hash;
    }
    else {
        var json = JSON.parse(window.sessionStorage.getItem(window.sessionStorage.getItem("currentUndoIndex"), !), !);
        return json == null ? "" : json.hash;
    }
}
_replaceState(state, HistoryState, hash, string);
void {
    if: function () { }, this: .displayBrowserUrl };
{
    window.history.replaceState(state, "", "#" + hash);
}
{
    window.sessionStorage.setItem(window.sessionStorage.getItem("currentUndoIndex") || "0", JSON.stringify({ state: state, hash: hash }));
    window.history.replaceState(null, "", location.pathname);
}
_pushState(state, HistoryState, hash, string);
void {
    if: function () { }, this: .displayBrowserUrl };
{
    window.history.pushState(state, "", "#" + hash);
}
{
    var currentIndex = Number(window.sessionStorage.getItem("currentUndoIndex"));
    var oldestIndex = Number(window.sessionStorage.getItem("oldestUndoIndex"));
    currentIndex = (currentIndex + 1) % SongDocument._maximumUndoHistory;
    window.sessionStorage.setItem("currentUndoIndex", String(currentIndex));
    window.sessionStorage.setItem("newestUndoIndex", String(currentIndex));
    if (currentIndex == oldestIndex) {
        oldestIndex = (oldestIndex + 1) % SongDocument._maximumUndoHistory;
        window.sessionStorage.setItem("oldestUndoIndex", String(oldestIndex));
    }
    window.sessionStorage.setItem(String(currentIndex), JSON.stringify({ state: state, hash: hash }));
    window.history.replaceState(null, "", location.pathname);
}
this._lastSequenceNumber = state.sequenceNumber;
hasRedoHistory();
boolean;
{
    return this._lastSequenceNumber > this._sequenceNumber;
}
_forward();
void {
    if: function () { }, this: .displayBrowserUrl };
{
    window.history.forward();
}
{
    var currentIndex = Number(window.sessionStorage.getItem("currentUndoIndex"));
    var newestIndex = Number(window.sessionStorage.getItem("newestUndoIndex"));
    if (currentIndex != newestIndex) {
        currentIndex = (currentIndex + 1) % SongDocument._maximumUndoHistory;
        window.sessionStorage.setItem("currentUndoIndex", String(currentIndex));
        setTimeout(this._whenHistoryStateChanged);
    }
}
_back();
void {
    if: function () { }, this: .displayBrowserUrl };
{
    window.history.back();
}
{
    var currentIndex = Number(window.sessionStorage.getItem("currentUndoIndex"));
    var oldestIndex = Number(window.sessionStorage.getItem("oldestUndoIndex"));
    if (currentIndex != oldestIndex) {
        currentIndex = (currentIndex + SongDocument._maximumUndoHistory - 1) % SongDocument._maximumUndoHistory;
        window.sessionStorage.setItem("currentUndoIndex", String(currentIndex));
        setTimeout(this._whenHistoryStateChanged);
    }
}
_whenHistoryStateChanged = function () {
    if (window.history.state == null && window.location.hash != "") {
        // The user changed the hash directly.
        _this._sequenceNumber++;
        _this._resetSongRecoveryUid();
        var state_1 = { canUndo: true, sequenceNumber: _this._sequenceNumber, bar: _this.bar, channel: _this.channel, recoveryUid: _this._recoveryUid, prompt: null, selection: _this.selection.toJSON() };
        new changes_1.ChangeSong(_this, window.location.hash);
        _this.prompt = state_1.prompt;
        if (_this.displayBrowserUrl) {
            _this._replaceState(state_1, _this.song.toBase64String());
        }
        else {
            _this._pushState(state_1, _this.song.toBase64String());
        }
        _this.forgetLastChange();
        _this.notifier.notifyWatchers();
        return;
    }
    var state = null = _this._getHistoryState();
    if (state == null)
        throw new Error("History state is null.");
    // Abort if we've already handled the current state. 
    if (state.sequenceNumber == _this._sequenceNumber)
        return;
    _this.bar = state.bar;
    _this.channel = state.channel;
    _this._sequenceNumber = state.sequenceNumber;
    _this.prompt = state.prompt;
    new changes_1.ChangeSong(_this, _this._getHash());
    _this._recoveryUid = state.recoveryUid;
    _this.selection.fromJSON(state.selection);
    //this.barScrollPos = Math.min(this.bar, Math.max(this.bar - (this.trackVisibleBars - 1), this.barScrollPos));
    _this.forgetLastChange();
    _this.notifier.notifyWatchers();
};
_cleanDocument = function () {
    _this.notifier.notifyWatchers();
};
_normalizeSelection = function () {
    // I'm allowing the doc.bar to drift outside the box selection while playing
    // because it may auto-follow the playhead outside the selection but it would
    // be annoying to lose your selection just because the song is playing.
    if ((!_this.synth.playing && (_this.bar < _this.selection.boxSelectionBar || _this.selection.boxSelectionBar + _this.selection.boxSelectionWidth <= _this.bar)) ||
        _this.channel < _this.selection.boxSelectionChannel ||
        _this.selection.boxSelectionChannel + _this.selection.boxSelectionHeight <= _this.channel ||
        _this.song.barCount < _this.selection.boxSelectionBar + _this.selection.boxSelectionWidth ||
        _this.song.getChannelCount() < _this.selection.boxSelectionChannel + _this.selection.boxSelectionHeight ||
        (_this.selection.boxSelectionWidth == 1 && _this.selection.boxSelectionHeight == 1)) {
        _this.selection.resetBoxSelection();
    }
};
_updateHistoryState = function () {
    _this._waitingToUpdateState = false;
    var hash = _this.song.toBase64String();
    if (_this._stateShouldBePushed)
        _this._sequenceNumber++;
    if (_this._recordedNewSong) {
        _this._resetSongRecoveryUid();
    }
    else {
        _this._recovery.saveVersion(_this._recoveryUid, hash);
    }
    var state = { canUndo: true, sequenceNumber: _this._sequenceNumber, bar: _this.bar, channel: _this.channel, recoveryUid: _this._recoveryUid, prompt: _this.prompt, selection: _this.selection.toJSON() };
    if (_this._stateShouldBePushed) {
        _this._pushState(state, hash);
    }
    else {
        _this._replaceState(state, hash);
    }
    _this._stateShouldBePushed = false;
    _this._recordedNewSong = false;
};
record(change, Change_1.Change, replace, boolean = false, newSong, boolean = false);
void {
    if: function (change, isNoop) {
        if (isNoop === void 0) { isNoop = (); }
        this._recentChange = null;
        if (replace)
            this._back();
    }, else: {
        change: .commit(),
        this: ._recentChange = change,
        this: ._stateShouldBePushed = this._stateShouldBePushed || !replace,
        this: ._recordedNewSong = this._recordedNewSong || newSong,
        if: function () { } } };
!this._waitingToUpdateState;
{
    // Defer updating the url/history until all sequenced changes have
    // committed and the interface has rendered the latest changes to
    // improve perceived responsiveness.
    window.requestAnimationFrame(this._updateHistoryState);
    this._waitingToUpdateState = true;
}
_resetSongRecoveryUid();
void {
    this: ._recoveryUid = SongRecovery_1.generateUid()
};
openPrompt(prompt, string);
void {
    this: .prompt = prompt,
    const: hash, string:  = this.song.toBase64String(),
    this: ._sequenceNumber++,
    const: state = { canUndo: true, sequenceNumber: this._sequenceNumber, bar: this.bar, channel: this.channel, recoveryUid: this._recoveryUid, prompt: this.prompt, selection: this.selection.toJSON() },
    this: ._pushState(state, hash)
};
undo();
void {
    const: state, HistoryState:  = this._getHistoryState() };
!;
if (state.canUndo)
    this._back();
redo();
void {
    this: ._forward()
};
setProspectiveChange(change, Change_1.Change | null);
void {
    this: ._recentChange = change
};
forgetLastChange();
void {
    this: ._recentChange = null
};
lastChangeWas(change, Change_1.Change | null);
boolean;
{
    return change != null && change == this._recentChange;
}
goBackToStart();
void {
    this: .channel = 0,
    this: .bar = 0,
    this: .barScrollPos = 0,
    this: .notifier.changed(),
    this: .synth.snapToStart(),
    this: .notifier.changed()
};
savePreferences();
void {
    window: .localStorage.setItem("autoPlay", this.autoPlay ? "true" : "false"),
    window: .localStorage.setItem("autoFollow", this.autoFollow ? "true" : "false"),
    window: .localStorage.setItem("enableNotePreview", this.enableNotePreview ? "true" : "false"),
    window: .localStorage.setItem("showFifth", this.showFifth ? "true" : "false"),
    window: .localStorage.setItem("showLetters", this.showLetters ? "true" : "false"),
    window: .localStorage.setItem("showChannels", this.showChannels ? "true" : "false"),
    window: .localStorage.setItem("showScrollBar", this.showScrollBar ? "true" : "false"),
    window: .localStorage.setItem("alwaysShowSettings", this.alwaysShowSettings ? "true" : "false"),
    window: .localStorage.setItem("enableChannelMuting", this.enableChannelMuting ? "true" : "false"),
    window: .localStorage.setItem("displayBrowserUrl", this.displayBrowserUrl ? "true" : "false"),
    window: .localStorage.setItem("fullScreen", this.fullScreen ? "true" : "false"),
    window: .localStorage.setItem("colorTheme", this.colorTheme),
    window: .localStorage.setItem("volume", String(this.volume))
};
setVolume(val, number);
void {
    this: .volume = val,
    this: .savePreferences(),
    this: .synth.volume = this._calcVolume()
};
_calcVolume();
number;
{
    return Math.min(1.0, Math.pow(this.volume / 50.0, 0.5)) * Math.pow(2.0, (this.volume - 75.0) / 25.0);
}
getCurrentPattern(barOffset, number = 0);
synth_1.Pattern | null;
{
    return this.song.getPattern(this.channel, this.bar + barOffset);
}
getCurrentInstrument(barOffset, number = 0);
number;
{
    var pattern = null = this.getCurrentPattern(barOffset);
    return pattern == null ? 0 : pattern.instrument;
}
getMobileLayout();
boolean;
{
    return window.innerWidth <= 700;
}
getBarWidth();
number;
{
    return (!this.getMobileLayout() && this.enableChannelMuting && !this.getFullScreen()) ? 30 : 32;
}
getChannelHeight();
number;
{
    var squashed = this.getMobileLayout() || this.song.getChannelCount() > 4 || (this.song.barCount > this.trackVisibleBars && this.song.getChannelCount() > 3);
    return squashed ? 27 : 32;
}
getFullScreen();
boolean;
{
    return !this.getMobileLayout() && this.fullScreen;
}
//}
