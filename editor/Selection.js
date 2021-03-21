// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var SynthConfig_1 = require("../synth/SynthConfig");
var Change_1 = require("./Change");
var changes_1 = require("./changes");
var Selection = (function () {
    function Selection(_doc) {
        this._doc = _doc;
        this.boxSelectionX0 = 0;
        this.boxSelectionY0 = 0;
        this.boxSelectionX1 = 0;
        this.boxSelectionY1 = 0;
        this.digits = "";
        this.patternSelectionStart = 0;
        this.patternSelectionEnd = 0;
        this.patternSelectionActive = false;
        this._changeTranspose = null = null;
        this._changeTrack = null = null;
    }
    Selection.prototype.toJSON = function () {
        return {
            "x0": this.boxSelectionX0,
            "x1": this.boxSelectionX1,
            "y0": this.boxSelectionY0,
            "y1": this.boxSelectionY1,
            "start": this.patternSelectionStart,
            "end": this.patternSelectionEnd
        };
    };
    Selection.prototype.fromJSON = function (json) {
        if (json == null)
            return;
        this.boxSelectionX0 = +json["x0"];
        this.boxSelectionX1 = +json["x1"];
        this.boxSelectionY0 = +json["y0"];
        this.boxSelectionY1 = +json["y1"];
        this.patternSelectionStart = +json["start"];
        this.patternSelectionEnd = +json["end"];
        this.digits = "";
        this.patternSelectionActive = this.patternSelectionStart < this.patternSelectionEnd;
    };
    Selection.prototype.selectionUpdated = function () {
        this._doc.notifier.changed();
        this.digits = "";
    };
    Object.defineProperty(Selection.prototype, "boxSelectionBar", {
        get: function () {
            return Math.min(this.boxSelectionX0, this.boxSelectionX1);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Selection.prototype, "boxSelectionChannel", {
        get: function () {
            return Math.min(this.boxSelectionY0, this.boxSelectionY1);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Selection.prototype, "boxSelectionWidth", {
        get: function () {
            return Math.abs(this.boxSelectionX0 - this.boxSelectionX1) + 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Selection.prototype, "boxSelectionHeight", {
        get: function () {
            return Math.abs(this.boxSelectionY0 - this.boxSelectionY1) + 1;
        },
        enumerable: true,
        configurable: true
    });
    Selection.prototype.scrollToSelection = function () {
        this._doc.barScrollPos = Math.min(this._doc.barScrollPos, this.boxSelectionX1);
        this._doc.barScrollPos = Math.max(this._doc.barScrollPos, this.boxSelectionX1 - (this._doc.trackVisibleBars - 1));
    };
    Selection.prototype.setChannelBar = function (channel, bar) {
        var canReplaceLastChange = this._doc.lastChangeWas(this._changeTrack);
        this._changeTrack = new Change_1.ChangeGroup();
        this._changeTrack.append(new changes_1.ChangeChannelBar(this._doc, channel, bar));
        // Don't erase existing redo history just to look at highlighted pattern.
        if (!this._doc.hasRedoHistory()) {
            this._doc.record(this._changeTrack, canReplaceLastChange);
        }
        this.selectionUpdated();
    };
    Selection.prototype.setPattern = function (pattern) {
        this._doc.record(new changes_1.ChangePatternNumbers(this._doc, pattern, this.boxSelectionBar, this.boxSelectionChannel, this.boxSelectionWidth, this.boxSelectionHeight));
    };
    Selection.prototype.nextDigit = function (digit) {
        if (this.digits.length > 0 && this.digits != String(this._doc.song.channels[this.boxSelectionChannel].bars[this.boxSelectionBar])) {
            this.digits = "";
        }
        this.digits += digit;
        var parsed = parseInt(this.digits);
        if (parsed <= this._doc.song.patternsPerChannel) {
            this.setPattern(parsed);
            return;
        }
        this.digits = digit;
        parsed = parseInt(this.digits);
        if (parsed <= this._doc.song.patternsPerChannel) {
            this.setPattern(parsed);
            return;
        }
        this.digits = "";
    };
    Selection.prototype.insertBars = function () {
        this._doc.record(new changes_1.ChangeInsertBars(this._doc, this.boxSelectionBar + this.boxSelectionWidth, this.boxSelectionWidth));
        var width = this.boxSelectionWidth;
        this.boxSelectionX0 += width;
        this.boxSelectionX1 += width;
    };
    Selection.prototype.deleteBars = function () {
        var group = new Change_1.ChangeGroup();
        if (this._doc.selection.patternSelectionActive) {
            if (this.boxSelectionWidth > 1 || this.boxSelectionHeight > 1) {
                group.append(new changes_1.ChangeDuplicateSelectedReusedPatterns(this._doc, this.boxSelectionBar, this.boxSelectionWidth, this.boxSelectionChannel, this.boxSelectionHeight));
            }
            for (var _i = 0, _a = this._eachSelectedChannel(); _i < _a.length; _i++) {
                var channel = _a[_i];
                for (var _b = 0, _c = this._eachSelectedPattern(channel); _b < _c.length; _b++) {
                    var pattern = _c[_b];
                    group.append(new changes_1.ChangeNoteTruncate(this._doc, pattern, this._doc.selection.patternSelectionStart, this._doc.selection.patternSelectionEnd));
                }
            }
            group.append(new changes_1.ChangePatternSelection(this._doc, 0, 0));
        }
        else {
            group.append(new changes_1.ChangeDeleteBars(this._doc, this.boxSelectionBar, this.boxSelectionWidth));
            var width = this.boxSelectionWidth;
            this.boxSelectionX0 = Math.max(0, this.boxSelectionX0 - width);
            this.boxSelectionX1 = Math.max(0, this.boxSelectionX1 - width);
        }
        this._doc.record(group);
    };
    Selection.prototype._eachSelectedChannel = function () {
        for (var channel = this.boxSelectionChannel; channel < this.boxSelectionChannel + this.boxSelectionHeight; channel++) {
            yield channel;
        }
    };
    Selection.prototype._eachSelectedBar = function () {
        for (var bar = this.boxSelectionBar; bar < this.boxSelectionBar + this.boxSelectionWidth; bar++) {
            yield bar;
        }
    };
    Selection.prototype._eachSelectedPattern = function (channel) {
        var handledPatterns = {};
        for (var _i = 0, _a = this._eachSelectedBar(); _i < _a.length; _i++) {
            var bar = _a[_i];
            var currentPatternIndex = this._doc.song.channels[channel].bars[bar];
            if (currentPatternIndex == 0)
                continue;
            if (handledPatterns[String(currentPatternIndex)])
                continue;
            handledPatterns[String(currentPatternIndex)] = true;
            var pattern = null = this._doc.song.getPattern(channel, bar);
            if (pattern == null)
                throw new Error();
            yield pattern;
        }
    };
    Selection.prototype._patternIndexIsUnused = function (channel, patternIndex) {
        for (var i = 0; i < this._doc.song.barCount; i++) {
            if (this._doc.song.channels[channel].bars[i] == patternIndex) {
                return false;
            }
        }
        return true;
    };
    Selection.prototype.copy = function () {
        var channels = [];
        for (var _i = 0, _a = this._eachSelectedChannel(); _i < _a.length; _i++) {
            var channel = _a[_i];
            var patterns = {};
            var bars = [];
            for (var _b = 0, _c = this._eachSelectedBar(); _b < _c.length; _b++) {
                var bar = _c[_b];
                var patternNumber = this._doc.song.channels[channel].bars[bar];
                bars.push(patternNumber);
                if (patterns[String(patternNumber)] == undefined) {
                    var pattern = null = this._doc.song.getPattern(channel, bar);
                    var instrument = 0;
                    var notes = [];
                    if (pattern != null) {
                        instrument = pattern.instrument;
                        if (this.patternSelectionActive) {
                            for (var _d = 0, _e = pattern.cloneNotes(); _d < _e.length; _d++) {
                                var note = _e[_d];
                                if (note.end <= this.patternSelectionStart)
                                    continue;
                                if (note.start >= this.patternSelectionEnd)
                                    continue;
                                if (note.start < this.patternSelectionStart || note.end > this.patternSelectionEnd) {
                                    new changes_1.ChangeNoteLength(null, note, Math.max(note.start, this.patternSelectionStart), Math.min(this.patternSelectionEnd, note.end));
                                }
                                note.start -= this.patternSelectionStart;
                                note.end -= this.patternSelectionStart;
                                notes.push(note);
                            }
                        }
                        else {
                            notes = pattern.notes;
                        }
                    }
                    patterns[String(patternNumber)] = { "instrument": instrument, "notes": notes };
                }
            }
            var channelCopy = {
                "isNoise": this._doc.song.getChannelIsNoise(channel),
                "patterns": patterns,
                "bars": bars
            };
            channels.push(channelCopy);
        }
        var selectionCopy = {
            "partDuration": this.patternSelectionActive ? this.patternSelectionEnd - this.patternSelectionStart : this._doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat,
            "channels": channels
        };
        window.localStorage.setItem("selectionCopy", JSON.stringify(selectionCopy));
    };
    // I'm sorry this function is so complicated!
    // Basically I'm trying to avoid accidentally modifying patterns that are used
    // elsewhere in the song (unless we're just pasting a single pattern) but I'm
    // also trying to reuse patterns where it makes sense to do so, especially 
    // in the same channel it was copied from.
    Selection.prototype.pasteNotes = function () {
        var selectionCopy = null = JSON.parse(String(window.localStorage.getItem("selectionCopy")));
        if (selectionCopy == null)
            return;
        var channelCopies = selectionCopy["channels"] || [];
        var copiedPartDuration = selectionCopy["partDuration"] >>> 0;
        var group = new Change_1.ChangeGroup();
        var fillSelection = (this.boxSelectionWidth > 1 || this.boxSelectionHeight > 1);
        var pasteHeight = fillSelection ? this.boxSelectionHeight : Math.min(channelCopies.length, this._doc.song.getChannelCount() - this.boxSelectionChannel);
        for (var pasteChannel = 0; pasteChannel < pasteHeight; pasteChannel++) {
            var channelCopy = channelCopies[pasteChannel % channelCopies.length];
            var channel = this.boxSelectionChannel + pasteChannel;
            var isNoise = !!channelCopy["isNoise"];
            var patternCopies = channelCopy["patterns"] || {};
            var copiedBars = channelCopy["bars"] || [];
            if (copiedBars.length == 0)
                continue;
            if (isNoise != this._doc.song.getChannelIsNoise(channel))
                continue;
            var pasteWidth = fillSelection ? this.boxSelectionWidth : Math.min(copiedBars.length, this._doc.song.barCount - this.boxSelectionBar);
            if (!fillSelection && copiedBars.length == 1 && channelCopies.length == 1) {
                // Special case: if there's just one pattern being copied, try to insert it
                // into whatever pattern is already selected.
                var copiedPatternIndex = copiedBars[0] >>> 0;
                var bar = this.boxSelectionBar;
                var currentPatternIndex = this._doc.song.channels[channel].bars[bar];
                if (copiedPatternIndex == 0 && currentPatternIndex == 0)
                    continue;
                var patternCopy = patternCopies[String(copiedPatternIndex)];
                var instrumentCopy = Math.min(patternCopy["instrument"] >>> 0, this._doc.song.instrumentsPerChannel - 1);
                if (currentPatternIndex == 0) {
                    var existingPattern = this._doc.song.channels[channel].patterns[copiedPatternIndex - 1];
                    if (existingPattern != undefined &&
                        !this.patternSelectionActive &&
                        ((changes_1.comparePatternNotes(patternCopy["notes"], existingPattern.notes) && instrumentCopy == existingPattern.instrument) ||
                            this._patternIndexIsUnused(channel, copiedPatternIndex))) {
                        group.append(new changes_1.ChangePatternNumbers(this._doc, copiedPatternIndex, bar, channel, 1, 1));
                    }
                    else {
                        group.append(new changes_1.ChangeEnsurePatternExists(this._doc, channel, bar));
                    }
                }
                var pattern = null = this._doc.song.getPattern(channel, bar);
                if (pattern == null)
                    throw new Error();
                group.append(new changes_1.ChangePaste(this._doc, pattern, patternCopy["notes"], this.patternSelectionActive ? this.patternSelectionStart : 0, this.patternSelectionActive ? this.patternSelectionEnd : SynthConfig_1.Config.partsPerBeat * this._doc.song.beatsPerBar, copiedPartDuration));
                group.append(new changes_1.ChangePatternInstrument(this._doc, instrumentCopy, pattern));
            }
            else if (this.patternSelectionActive) {
                var reusablePatterns = {};
                var usedPatterns = {};
                group.append(new changes_1.ChangeDuplicateSelectedReusedPatterns(this._doc, this.boxSelectionBar, pasteWidth, this.boxSelectionChannel, pasteHeight));
                for (var pasteBar = 0; pasteBar < pasteWidth; pasteBar++) {
                    var bar = this.boxSelectionBar + pasteBar;
                    var copiedPatternIndex = copiedBars[pasteBar % copiedBars.length] >>> 0;
                    var currentPatternIndex = this._doc.song.channels[channel].bars[bar];
                    var reusedIndex = [copiedPatternIndex, currentPatternIndex].join(",");
                    if (copiedPatternIndex == 0 && currentPatternIndex == 0)
                        continue;
                    if (reusablePatterns[reusedIndex] != undefined) {
                        group.append(new changes_1.ChangePatternNumbers(this._doc, reusablePatterns[reusedIndex], bar, channel, 1, 1));
                        continue;
                    }
                    if (currentPatternIndex == 0) {
                        group.append(new changes_1.ChangeEnsurePatternExists(this._doc, channel, bar));
                        var patternCopy = patternCopies[String(copiedPatternIndex)];
                        var instrumentCopy = Math.min(patternCopy["instrument"] >>> 0, this._doc.song.instrumentsPerChannel - 1);
                        var pattern_1 = this._doc.song.getPattern(channel, bar);
                        !;
                        group.append(new changes_1.ChangePatternInstrument(this._doc, instrumentCopy, pattern_1));
                    }
                    else {
                        var pattern_2 = null = this._doc.song.getPattern(channel, bar);
                        if (pattern_2 == null)
                            throw new Error();
                        if (!usedPatterns[String(currentPatternIndex)]) {
                            usedPatterns[String(currentPatternIndex)] = true;
                        }
                        else {
                            // If this pattern is used here and elsewhere, it's not safe to modify it directly, so
                            // make a duplicate of it and modify that instead.
                            group.append(new changes_1.ChangePatternNumbers(this._doc, 0, bar, channel, 1, 1));
                            group.append(new changes_1.ChangeEnsurePatternExists(this._doc, channel, bar));
                            var newPattern = null = this._doc.song.getPattern(channel, bar);
                            if (newPattern == null)
                                throw new Error();
                            group.append(new changes_1.ChangePatternInstrument(this._doc, pattern_2.instrument, newPattern));
                            for (var _i = 0, _a = pattern_2.cloneNotes(); _i < _a.length; _i++) {
                                var note = _a[_i];
                                group.append(new changes_1.ChangeNoteAdded(this._doc, newPattern, note, newPattern.notes.length, false));
                            }
                        }
                    }
                    var pattern = null = this._doc.song.getPattern(channel, bar);
                    if (pattern == null)
                        throw new Error();
                    if (copiedPatternIndex == 0) {
                        group.append(new changes_1.ChangeNoteTruncate(this._doc, pattern, this.patternSelectionStart, this.patternSelectionEnd));
                    }
                    else {
                        var patternCopy = patternCopies[String(copiedPatternIndex)];
                        group.append(new changes_1.ChangePaste(this._doc, pattern, patternCopy["notes"], this.patternSelectionStart, this.patternSelectionEnd, copiedPartDuration));
                    }
                    reusablePatterns[reusedIndex] = this._doc.song.channels[channel].bars[bar];
                }
            }
            else {
                for (var pasteBar = 0; pasteBar < pasteWidth; pasteBar++) {
                    var bar = this.boxSelectionBar + pasteBar;
                    var removedPattern = this._doc.song.channels[channel].bars[bar];
                    if (removedPattern != 0) {
                        group.append(new changes_1.ChangePatternNumbers(this._doc, 0, bar, channel, 1, 1));
                        if (this._patternIndexIsUnused(channel, removedPattern)) {
                            // When a pattern becomes unused when replaced by rectangular selection pasting,
                            // remove all the notes from the pattern so that it may be reused.
                            this._doc.song.channels[channel].patterns[removedPattern - 1].notes.length = 0;
                        }
                    }
                }
                var reusablePatterns = {};
                for (var pasteBar = 0; pasteBar < pasteWidth; pasteBar++) {
                    var bar = this.boxSelectionBar + pasteBar;
                    var copiedPatternIndex = copiedBars[pasteBar % copiedBars.length] >>> 0;
                    var reusedIndex = String(copiedPatternIndex);
                    if (copiedPatternIndex == 0)
                        continue;
                    if (reusablePatterns[reusedIndex] != undefined) {
                        group.append(new changes_1.ChangePatternNumbers(this._doc, reusablePatterns[reusedIndex], bar, channel, 1, 1));
                        continue;
                    }
                    var patternCopy = patternCopies[String(copiedPatternIndex)];
                    var instrumentCopy = Math.min(patternCopy["instrument"] >>> 0, this._doc.song.instrumentsPerChannel - 1);
                    var existingPattern = this._doc.song.channels[channel].patterns[copiedPatternIndex - 1];
                    if (existingPattern != undefined &&
                        copiedPartDuration == SynthConfig_1.Config.partsPerBeat * this._doc.song.beatsPerBar &&
                        changes_1.comparePatternNotes(patternCopy["notes"], existingPattern.notes) &&
                        instrumentCopy == existingPattern.instrument) {
                        group.append(new changes_1.ChangePatternNumbers(this._doc, copiedPatternIndex, bar, channel, 1, 1));
                    }
                    else {
                        if (existingPattern != undefined && this._patternIndexIsUnused(channel, copiedPatternIndex)) {
                            group.append(new changes_1.ChangePatternNumbers(this._doc, copiedPatternIndex, bar, channel, 1, 1));
                        }
                        else {
                            group.append(new changes_1.ChangeEnsurePatternExists(this._doc, channel, bar));
                        }
                        var pattern = null = this._doc.song.getPattern(channel, bar);
                        if (pattern == null)
                            throw new Error();
                        group.append(new changes_1.ChangePaste(this._doc, pattern, patternCopy["notes"], this.patternSelectionActive ? this.patternSelectionStart : 0, this.patternSelectionActive ? this.patternSelectionEnd : SynthConfig_1.Config.partsPerBeat * this._doc.song.beatsPerBar, copiedPartDuration));
                        group.append(new changes_1.ChangePatternInstrument(this._doc, instrumentCopy, pattern));
                    }
                    reusablePatterns[reusedIndex] = this._doc.song.channels[channel].bars[bar];
                }
            }
        }
        this._doc.record(group);
    };
    Selection.prototype.pasteNumbers = function () {
        var selectionCopy = null = JSON.parse(String(window.localStorage.getItem("selectionCopy")));
        if (selectionCopy == null)
            return;
        var channelCopies = selectionCopy["channels"] || [];
        var group = new Change_1.ChangeGroup();
        var fillSelection = (this.boxSelectionWidth > 1 || this.boxSelectionHeight > 1);
        var pasteHeight = fillSelection ? this.boxSelectionHeight : Math.min(channelCopies.length, this._doc.song.getChannelCount() - this.boxSelectionChannel);
        for (var pasteChannel = 0; pasteChannel < pasteHeight; pasteChannel++) {
            var channelCopy = channelCopies[pasteChannel % channelCopies.length];
            var channel = this.boxSelectionChannel + pasteChannel;
            var copiedBars = channelCopy["bars"] || [];
            if (copiedBars.length == 0)
                continue;
            var pasteWidth = fillSelection ? this.boxSelectionWidth : Math.min(copiedBars.length, this._doc.song.barCount - this.boxSelectionBar);
            for (var pasteBar = 0; pasteBar < pasteWidth; pasteBar++) {
                var copiedPatternIndex = copiedBars[pasteBar % copiedBars.length] >>> 0;
                var bar = this.boxSelectionBar + pasteBar;
                if (copiedPatternIndex > this._doc.song.patternsPerChannel) {
                    group.append(new changes_1.ChangePatternsPerChannel(this._doc, copiedPatternIndex));
                }
                group.append(new changes_1.ChangePatternNumbers(this._doc, copiedPatternIndex, bar, channel, 1, 1));
            }
        }
        this._doc.record(group);
    };
    Selection.prototype.selectAll = function () {
        new changes_1.ChangePatternSelection(this._doc, 0, 0);
        if (this.boxSelectionBar == 0 &&
            this.boxSelectionChannel == 0 &&
            this.boxSelectionWidth == this._doc.song.barCount &&
            this.boxSelectionHeight == this._doc.song.getChannelCount()) {
            this.setTrackSelection(this._doc.bar, this._doc.bar, this._doc.channel, this._doc.channel);
        }
        else {
            this.setTrackSelection(0, this._doc.song.barCount - 1, 0, this._doc.song.getChannelCount() - 1);
        }
        this.selectionUpdated();
    };
    Selection.prototype.selectChannel = function () {
        new changes_1.ChangePatternSelection(this._doc, 0, 0);
        if (this.boxSelectionBar == 0 && this.boxSelectionWidth == this._doc.song.barCount) {
            this.setTrackSelection(this._doc.bar, this._doc.bar, this.boxSelectionY0, this.boxSelectionY1);
        }
        else {
            this.setTrackSelection(0, this._doc.song.barCount - 1, this.boxSelectionY0, this.boxSelectionY1);
        }
        this.selectionUpdated();
    };
    Selection.prototype.duplicatePatterns = function () {
        this._doc.record(new changes_1.ChangeDuplicateSelectedReusedPatterns(this._doc, this.boxSelectionBar, this.boxSelectionWidth, this.boxSelectionChannel, this.boxSelectionHeight));
    };
    Selection.prototype.muteChannels = function (allChannels) {
        if (allChannels) {
            var anyMuted = false;
            for (var channel = 0; channel < this._doc.song.channels.length; channel++) {
                if (this._doc.song.channels[channel].muted) {
                    anyMuted = true;
                    break;
                }
            }
            for (var channel = 0; channel < this._doc.song.channels.length; channel++) {
                this._doc.song.channels[channel].muted = !anyMuted;
            }
        }
        else {
            var anyUnmuted = false;
            for (var _i = 0, _a = this._eachSelectedChannel(); _i < _a.length; _i++) {
                var channel = _a[_i];
                if (!this._doc.song.channels[channel].muted) {
                    anyUnmuted = true;
                    break;
                }
            }
            for (var _b = 0, _c = this._eachSelectedChannel(); _b < _c.length; _b++) {
                var channel = _c[_b];
                this._doc.song.channels[channel].muted = anyUnmuted;
            }
        }
        this._doc.notifier.changed();
    };
    Selection.prototype.soloChannels = function () {
        var alreadySoloed = true;
        for (var channel = 0; channel < this._doc.song.channels.length; channel++) {
            var shouldBeMuted = channel < this.boxSelectionChannel || channel >= this.boxSelectionChannel + this.boxSelectionHeight;
            if (this._doc.song.channels[channel].muted != shouldBeMuted) {
                alreadySoloed = false;
                break;
            }
        }
        if (alreadySoloed) {
            for (var channel = 0; channel < this._doc.song.channels.length; channel++) {
                this._doc.song.channels[channel].muted = false;
            }
        }
        else {
            for (var channel = 0; channel < this._doc.song.channels.length; channel++) {
                this._doc.song.channels[channel].muted = channel < this.boxSelectionChannel || channel >= this.boxSelectionChannel + this.boxSelectionHeight;
            }
        }
        this._doc.notifier.changed();
    };
    Selection.prototype.forceRhythm = function () {
        var group = new Change_1.ChangeGroup();
        if (this.boxSelectionWidth > 1 || this.boxSelectionHeight > 1) {
            group.append(new changes_1.ChangeDuplicateSelectedReusedPatterns(this._doc, this.boxSelectionBar, this.boxSelectionWidth, this.boxSelectionChannel, this.boxSelectionHeight));
        }
        for (var _i = 0, _a = this._eachSelectedChannel(); _i < _a.length; _i++) {
            var channel = _a[_i];
            for (var _b = 0, _c = this._eachSelectedPattern(channel); _b < _c.length; _b++) {
                var pattern = _c[_b];
                group.append(new changes_1.ChangePatternRhythm(this._doc, pattern));
            }
        }
        this._doc.record(group);
    };
    Selection.prototype.forceScale = function () {
        var group = new Change_1.ChangeGroup();
        if (this.boxSelectionWidth > 1 || this.boxSelectionHeight > 1) {
            group.append(new changes_1.ChangeDuplicateSelectedReusedPatterns(this._doc, this.boxSelectionBar, this.boxSelectionWidth, this.boxSelectionChannel, this.boxSelectionHeight));
        }
        var scaleFlags = [true, false, false, false, false, false, false, false, false, false, false, false];
        for (var _i = 0, _a = this._eachSelectedChannel(); _i < _a.length; _i++) {
            var channel = _a[_i];
            if (this._doc.song.getChannelIsNoise(channel))
                continue;
            for (var _b = 0, _c = this._eachSelectedPattern(channel); _b < _c.length; _b++) {
                var pattern = _c[_b];
                changes_1.unionOfUsedNotes(pattern, scaleFlags);
            }
        }
        var scaleMap = changes_1.generateScaleMap(scaleFlags, this._doc.song.scale);
        for (var _d = 0, _e = this._eachSelectedChannel(); _d < _e.length; _d++) {
            var channel = _e[_d];
            if (this._doc.song.getChannelIsNoise(channel))
                continue;
            for (var _f = 0, _g = this._eachSelectedPattern(channel); _f < _g.length; _f++) {
                var pattern = _g[_f];
                group.append(new changes_1.ChangePatternScale(this._doc, pattern, scaleMap));
            }
        }
        this._doc.record(group);
    };
    Selection.prototype.setTrackSelection = function (newX0, newX1, newY0, newY1) {
        var canReplaceLastChange = this._doc.lastChangeWas(this._changeTrack);
        this._changeTrack = new Change_1.ChangeGroup();
        this._changeTrack.append(new changes_1.ChangeTrackSelection(this._doc, newX0, newX1, newY0, newY1));
        // Don't erase existing redo history just to change track selection.
        if (!this._doc.hasRedoHistory()) {
            this._doc.record(this._changeTrack, canReplaceLastChange);
        }
    };
    Selection.prototype.transpose = function (upward, octave) {
        var canReplaceLastChange = this._doc.lastChangeWas(this._changeTranspose);
        this._changeTranspose = new Change_1.ChangeGroup();
        if (this.boxSelectionWidth > 1 || this.boxSelectionHeight > 1) {
            this._changeTranspose.append(new changes_1.ChangeDuplicateSelectedReusedPatterns(this._doc, this.boxSelectionBar, this.boxSelectionWidth, this.boxSelectionChannel, this.boxSelectionHeight));
        }
        for (var _i = 0, _a = this._eachSelectedChannel(); _i < _a.length; _i++) {
            var channel = _a[_i];
            for (var _b = 0, _c = this._eachSelectedPattern(channel); _b < _c.length; _b++) {
                var pattern = _c[_b];
                this._changeTranspose.append(new changes_1.ChangeTranspose(this._doc, channel, pattern, upward, false, octave));
            }
        }
        this._doc.record(this._changeTranspose, canReplaceLastChange);
    };
    Selection.prototype.setInstrument = function (instrument) {
        var group = new Change_1.ChangeGroup();
        if (this.boxSelectionWidth > 1 || this.boxSelectionHeight > 1) {
            group.append(new changes_1.ChangeDuplicateSelectedReusedPatterns(this._doc, this.boxSelectionBar, this.boxSelectionWidth, this.boxSelectionChannel, this.boxSelectionHeight));
        }
        for (var _i = 0, _a = this._eachSelectedChannel(); _i < _a.length; _i++) {
            var channel = _a[_i];
            for (var _b = 0, _c = this._eachSelectedPattern(channel); _b < _c.length; _b++) {
                var pattern = _c[_b];
                group.append(new changes_1.ChangePatternInstrument(this._doc, instrument, pattern));
            }
        }
        this._doc.record(group);
    };
    Selection.prototype.resetBoxSelection = function () {
        this.boxSelectionX0 = this.boxSelectionX1 = this._doc.bar;
        this.boxSelectionY0 = this.boxSelectionY1 = this._doc.channel;
    };
    return Selection;
})();
exports.Selection = Selection;
