// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var SynthConfig_1 = require("../synth/SynthConfig");
var synth_1 = require("../synth/synth");
var ColorConfig_1 = require("./ColorConfig");
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
var Change_1 = require("./Change");
var changes_1 = require("./changes");
var EditorConfig_1 = require("./EditorConfig");
//namespace beepbox {
function makeEmptyReplacementElement(node) {
    var clone = node.cloneNode(false);
    node.parentNode;
    !.replaceChild(clone, node);
    return clone;
}
var PatternCursor = (function () {
    function PatternCursor() {
        this.valid = false;
        this.prevNote = null = null;
        this.curNote = null = null;
        this.nextNote = null = null;
        this.pitch = 0;
        this.pitchIndex = -1;
        this.curIndex = 0;
        this.start = 0;
        this.end = 0;
        this.part = 0;
        this.exactPart = 0;
        this.nearPinIndex = 0;
        this.pins = [];
    }
    return PatternCursor;
})();
var PatternEditor = (function () {
    function PatternEditor(_doc, _interactive, _barOffset) {
        var _this = this;
        this._doc = _doc;
        this._interactive = _interactive;
        this._barOffset = _barOffset;
        this.readonly = _svgNoteBackground;
        this.SVGPatternElement = elements_strict_1.SVG.pattern({ id: "patternEditorNoteBackground" + this._barOffset, x: "0", y: "0", patternUnits: "userSpaceOnUse" });
        this.readonly = _svgDrumBackground;
        this.SVGPatternElement = elements_strict_1.SVG.pattern({ id: "patternEditorDrumBackground" + this._barOffset, x: "0", y: "0", patternUnits: "userSpaceOnUse" });
        this.readonly = _svgBackground;
        this.SVGRectElement = elements_strict_1.SVG.rect({ x: "0", y: "0", "pointer-events": "none", fill: "url(#patternEditorNoteBackground" + this._barOffset + ")" });
        this._svgNoteContainer = elements_strict_1.SVG.svg();
        this.readonly = _svgPlayhead;
        this.SVGRectElement = elements_strict_1.SVG.rect({ x: "0", y: "0", width: "4", fill: ColorConfig_1.ColorConfig.playhead, "pointer-events": "none" });
        this.readonly = _selectionRect;
        this.SVGRectElement = elements_strict_1.SVG.rect({ fill: ColorConfig_1.ColorConfig.boxSelectionFill, stroke: ColorConfig_1.ColorConfig.hoverPreview, "stroke-width": 2, "stroke-dasharray": "5, 3", "pointer-events": "none", visibility: "hidden" });
        this.readonly = _svgPreview;
        this.SVGPathElement = elements_strict_1.SVG.path({ fill: "none", stroke: ColorConfig_1.ColorConfig.hoverPreview, "stroke-width": "2", "pointer-events": "none" });
        this.readonly = _svg;
        this.SVGSVGElement = elements_strict_1.SVG.svg({ style: "background-color: " + ColorConfig_1.ColorConfig.editorBackground + "; touch-action: none; position: absolute;", width: "100%", height: "100%" }, elements_strict_1.SVG.defs(this._svgNoteBackground, this._svgDrumBackground), this._svgBackground, this._selectionRect, this._svgNoteContainer, this._svgPreview, this._svgPlayhead);
        this.readonly = container;
        this.HTMLDivElement = elements_strict_1.HTML.div({ style: "height: 100%; overflow:hidden; position: relative; flex-grow: 1;" }, this._svg);
        this.readonly = _backgroundPitchRows;
        this.SVGRectElement = (_a = [], _a);
        this.readonly = _backgroundDrumRow;
        this.SVGRectElement = elements_strict_1.SVG.rect();
        this._pitchHeight = -1;
        this._mouseX = 0;
        this._mouseY = 0;
        this._mouseDown = false;
        this._mouseOver = false;
        this._mouseDragging = false;
        this._mouseHorizontal = false;
        this._usingTouch = false;
        this._copiedPinChannels = [];
        this._mouseXStart = 0;
        this._mouseYStart = 0;
        this._shiftHeld = false;
        this._touchTime = 0;
        this._draggingStartOfSelection = false;
        this._draggingEndOfSelection = false;
        this._draggingSelectionContents = false;
        this._dragTime = 0;
        this._dragPitch = 0;
        this._dragVolume = 0;
        this._dragVisible = false;
        this._dragChange = null = null;
        this._changePatternSelection = null = null;
        this._lastChangeWasPatternSelection = false;
        this._cursor = new PatternCursor();
        this._pattern = null = null;
        this._playheadX = 0.0;
        this._octaveOffset = 0;
        this._renderedWidth = -1;
        this._renderedHeight = -1;
        this._renderedBeatWidth = -1;
        this._renderedPitchHeight = -1;
        this._renderedFifths = false;
        this._renderedDrums = false;
        this._renderedRhythm = -1;
        this._renderedPitchChannelCount = -1;
        this._renderedNoiseChannelCount = -1;
        this._followPlayheadBar = -1;
        this.resetCopiedPins = function () {
            var maxDivision = _this._getMaxDivision();
            _this._copiedPinChannels.length = _this._doc.song.getChannelCount();
            for (var i = 0; i < _this._doc.song.pitchChannelCount; i++) {
                _this._copiedPinChannels[i] = [synth_1.makeNotePin(0, 0, 3), synth_1.makeNotePin(0, maxDivision, 3)];
            }
            for (var i = _this._doc.song.pitchChannelCount; i < _this._doc.song.getChannelCount(); i++) {
                _this._copiedPinChannels[i] = [synth_1.makeNotePin(0, 0, 3), synth_1.makeNotePin(0, maxDivision, 0)];
            }
        };
        this._animatePlayhead = function (timestamp) {
            if (_this._usingTouch && !_this._shiftHeld && !_this._mouseDragging && _this._mouseDown && performance.now() > _this._touchTime + 1000 && _this._cursor.valid && _this._doc.lastChangeWas(_this._dragChange)) {
                _this._dragChange;
                !.undo();
                _this._shiftHeld = true;
                _this._whenCursorPressed();
                _this._doc.notifier.notifyWatchers();
            }
            var playheadBar = Math.floor(_this._doc.synth.playhead);
            if (_this._doc.synth.playing && ((_this._pattern != null && _this._doc.song.getPattern(_this._doc.channel, Math.floor(_this._doc.synth.playhead)) == _this._pattern) || Math.floor(_this._doc.synth.playhead) == _this._doc.bar + _this._barOffset)) {
                _this._svgPlayhead.setAttribute("visibility", "visible");
                var modPlayhead = _this._doc.synth.playhead - playheadBar;
                if (Math.abs(modPlayhead - _this._playheadX) > 0.1) {
                    _this._playheadX = modPlayhead;
                }
                else {
                    _this._playheadX += (modPlayhead - _this._playheadX) * 0.2;
                }
                _this._svgPlayhead.setAttribute("x", "" + EditorConfig_1.prettyNumber(_this._playheadX * _this._editorWidth - 2));
            }
            else {
                _this._svgPlayhead.setAttribute("visibility", "hidden");
            }
            if (_this._doc.synth.playing && _this._doc.autoFollow && _this._followPlayheadBar != playheadBar) {
                new changes_1.ChangeChannelBar(_this._doc, _this._doc.channel, playheadBar);
                _this._doc.notifier.notifyWatchers();
            }
            _this._followPlayheadBar = playheadBar;
            window.requestAnimationFrame(_this._animatePlayhead);
        };
        this._whenMouseOver = function (event) {
            if (_this._mouseOver)
                return;
            _this._mouseOver = true;
            _this._usingTouch = false;
        };
        this._whenMouseOut = function (event) {
            if (!_this._mouseOver)
                return;
            _this._mouseOver = false;
        };
        this._whenMousePressed = function (event) {
            event.preventDefault();
            var boundingRect = _this._svg.getBoundingClientRect();
            _this._mouseX = ((event.clientX || event.pageX) - boundingRect.left) * _this._editorWidth / (boundingRect.right - boundingRect.left);
            _this._mouseY = ((event.clientY || event.pageY) - boundingRect.top) * _this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(_this._mouseX))
                _this._mouseX = 0;
            if (isNaN(_this._mouseY))
                _this._mouseY = 0;
            _this._usingTouch = false;
            _this._shiftHeld = event.shiftKey;
            _this._whenCursorPressed();
        };
        this._whenTouchPressed = function (event) {
            event.preventDefault();
            var boundingRect = _this._svg.getBoundingClientRect();
            _this._mouseX = (event.touches[0].clientX - boundingRect.left) * _this._editorWidth / (boundingRect.right - boundingRect.left);
            _this._mouseY = (event.touches[0].clientY - boundingRect.top) * _this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(_this._mouseX))
                _this._mouseX = 0;
            if (isNaN(_this._mouseY))
                _this._mouseY = 0;
            _this._usingTouch = true;
            _this._shiftHeld = event.shiftKey;
            _this._touchTime = performance.now();
            _this._whenCursorPressed();
        };
        this._whenMouseMoved = function (event) {
            var boundingRect = _this._svg.getBoundingClientRect();
            _this._mouseX = ((event.clientX || event.pageX) - boundingRect.left) * _this._editorWidth / (boundingRect.right - boundingRect.left);
            _this._mouseY = ((event.clientY || event.pageY) - boundingRect.top) * _this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(_this._mouseX))
                _this._mouseX = 0;
            if (isNaN(_this._mouseY))
                _this._mouseY = 0;
            _this._usingTouch = false;
            _this._whenCursorMoved();
        };
        this._whenTouchMoved = function (event) {
            if (!_this._mouseDown)
                return;
            event.preventDefault();
            var boundingRect = _this._svg.getBoundingClientRect();
            _this._mouseX = (event.touches[0].clientX - boundingRect.left) * _this._editorWidth / (boundingRect.right - boundingRect.left);
            _this._mouseY = (event.touches[0].clientY - boundingRect.top) * _this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(_this._mouseX))
                _this._mouseX = 0;
            if (isNaN(_this._mouseY))
                _this._mouseY = 0;
            _this._whenCursorMoved();
        };
        this._whenCursorReleased = function (event) {
            if (event === void 0) { event = null; }
            if (!_this._cursor.valid)
                return;
            var continuousState = _this._doc.lastChangeWas(_this._dragChange);
            if (_this._mouseDown && continuousState && _this._dragChange != null) {
                if (_this._draggingSelectionContents) {
                    _this._doc.record(_this._dragChange);
                    _this._dragChange = null;
                }
                else if (_this._draggingStartOfSelection || _this._draggingEndOfSelection || _this._shiftHeld) {
                    _this._setPatternSelection(_this._dragChange);
                    _this._dragChange = null;
                }
                else if (_this._mouseDragging || _this._cursor.curNote == null || !_this._dragChange.isNoop() || _this._draggingStartOfSelection || _this._draggingEndOfSelection || _this._draggingSelectionContents || _this._shiftHeld) {
                    _this._doc.record(_this._dragChange);
                    _this._dragChange = null;
                }
                else {
                    if (_this._pattern == null)
                        throw new Error();
                    var sequence = new Change_1.ChangeSequence();
                    sequence.append(new changes_1.ChangePatternSelection(_this._doc, 0, 0));
                    if (_this._cursor.pitchIndex == -1) {
                        if (_this._cursor.curNote.pitches.length == SynthConfig_1.Config.maxChordSize) {
                            sequence.append(new changes_1.ChangePitchAdded(_this._doc, _this._cursor.curNote, _this._cursor.curNote.pitches[0], 0, true));
                        }
                        sequence.append(new changes_1.ChangePitchAdded(_this._doc, _this._cursor.curNote, _this._cursor.pitch, _this._cursor.curNote.pitches.length));
                        _this._copyPins(_this._cursor.curNote);
                        if (_this._doc.enableNotePreview && !_this._doc.synth.playing) {
                            var duration = Math.min(SynthConfig_1.Config.partsPerBeat, _this._cursor.end - _this._cursor.start);
                            _this._doc.synth.liveInputDuration = duration;
                            _this._doc.synth.liveInputPitches = _this._cursor.curNote.pitches.concat();
                            _this._doc.synth.liveInputStarted = true;
                        }
                    }
                    else {
                        if (_this._cursor.curNote.pitches.length == 1) {
                            sequence.append(new changes_1.ChangeNoteAdded(_this._doc, _this._pattern, _this._cursor.curNote, _this._cursor.curIndex, true));
                        }
                        else {
                            sequence.append(new changes_1.ChangePitchAdded(_this._doc, _this._cursor.curNote, _this._cursor.pitch, _this._cursor.curNote.pitches.indexOf(_this._cursor.pitch), true));
                        }
                    }
                    _this._doc.record(sequence);
                }
            }
            _this._mouseDown = false;
            _this._mouseDragging = false;
            _this._draggingStartOfSelection = false;
            _this._draggingEndOfSelection = false;
            _this._draggingSelectionContents = false;
            _this._lastChangeWasPatternSelection = false;
            _this._updateCursorStatus();
            _this._updatePreview();
        };
        for (var i = 0; i < SynthConfig_1.Config.pitchesPerOctave; i++) {
            var rectangle = elements_strict_1.SVG.rect();
            rectangle.setAttribute("x", "1");
            rectangle.setAttribute("fill", (i == 0) ? ColorConfig_1.ColorConfig.tonic : ColorConfig_1.ColorConfig.pitchBackground);
            this._svgNoteBackground.appendChild(rectangle);
            this._backgroundPitchRows[i] = rectangle;
        }
        this._backgroundDrumRow.setAttribute("x", "1");
        this._backgroundDrumRow.setAttribute("y", "1");
        this._backgroundDrumRow.setAttribute("fill", ColorConfig_1.ColorConfig.pitchBackground);
        this._svgDrumBackground.appendChild(this._backgroundDrumRow);
        if (this._interactive) {
            this._updateCursorStatus();
            this._updatePreview();
            window.requestAnimationFrame(this._animatePlayhead);
            this._svg.addEventListener("mousedown", this._whenMousePressed);
            document.addEventListener("mousemove", this._whenMouseMoved);
            document.addEventListener("mouseup", this._whenCursorReleased);
            this._svg.addEventListener("mouseover", this._whenMouseOver);
            this._svg.addEventListener("mouseout", this._whenMouseOut);
            this._svg.addEventListener("touchstart", this._whenTouchPressed);
            this._svg.addEventListener("touchmove", this._whenTouchMoved);
            this._svg.addEventListener("touchend", this._whenCursorReleased);
            this._svg.addEventListener("touchcancel", this._whenCursorReleased);
        }
        else {
            this._svgPlayhead.style.display = "none";
            this._svg.appendChild(elements_strict_1.SVG.rect({ x: 0, y: 0, width: 10000, height: 10000, fill: ColorConfig_1.ColorConfig.editorBackground, style: "opacity: 0.5;" }));
        }
        this.resetCopiedPins();
        var _a;
    }
    PatternEditor.prototype._getMaxDivision = function () {
        var rhythmStepsPerBeat = SynthConfig_1.Config.rhythms[this._doc.song.rhythm].stepsPerBeat;
        if (rhythmStepsPerBeat % 4 == 0) {
            // Beat is divisible by 2 (and 4).
            return SynthConfig_1.Config.partsPerBeat / 2;
        }
        else if (rhythmStepsPerBeat % 3 == 0) {
            // Beat is divisible by 3.
            return SynthConfig_1.Config.partsPerBeat / 3;
        }
        else if (rhythmStepsPerBeat % 2 == 0) {
            // Beat is divisible by 2.
            return SynthConfig_1.Config.partsPerBeat / 2;
        }
        return SynthConfig_1.Config.partsPerBeat;
    };
    PatternEditor.prototype._getMinDivision = function () {
        return SynthConfig_1.Config.partsPerBeat / SynthConfig_1.Config.rhythms[this._doc.song.rhythm].stepsPerBeat;
    };
    PatternEditor.prototype._snapToMinDivision = function (input) {
        var minDivision = this._getMinDivision();
        return Math.floor(input / minDivision) * minDivision;
    };
    PatternEditor.prototype._updateCursorStatus = function () {
        this._cursor = new PatternCursor();
        if (this._mouseX < 0 || this._mouseX > this._editorWidth || this._mouseY < 0 || this._mouseY > this._editorHeight || this._pitchHeight <= 0)
            return;
        var minDivision = this._getMinDivision();
        this._cursor.exactPart = this._mouseX / this._partWidth;
        this._cursor.part =
            Math.floor(Math.max(0, Math.min(this._doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat - minDivision, this._cursor.exactPart))
                / minDivision) * minDivision;
        if (this._pattern != null) {
            for (var _i = 0, _a = this._pattern.notes; _i < _a.length; _i++) {
                var note = _a[_i];
                if (note.end <= this._cursor.exactPart) {
                    this._cursor.prevNote = note;
                    this._cursor.curIndex++;
                }
                else if (note.start <= this._cursor.exactPart && note.end > this._cursor.exactPart) {
                    this._cursor.curNote = note;
                }
                else if (note.start > this._cursor.exactPart) {
                    this._cursor.nextNote = note;
                    break;
                }
            }
        }
        var mousePitch = this._findMousePitch(this._mouseY);
        if (this._cursor.curNote != null) {
            this._cursor.start = this._cursor.curNote.start;
            this._cursor.end = this._cursor.curNote.end;
            this._cursor.pins = this._cursor.curNote.pins;
            var interval = 0;
            var error = 0;
            var prevPin;
            var nextPin = this._cursor.curNote.pins[0];
            for (var j = 1; j < this._cursor.curNote.pins.length; j++) {
                prevPin = nextPin;
                nextPin = this._cursor.curNote.pins[j];
                var leftSide = this._partWidth * (this._cursor.curNote.start + prevPin.time);
                var rightSide = this._partWidth * (this._cursor.curNote.start + nextPin.time);
                if (this._mouseX > rightSide)
                    continue;
                if (this._mouseX < leftSide)
                    throw new Error();
                var intervalRatio = (this._mouseX - leftSide) / (rightSide - leftSide);
                var arc = Math.sqrt(1.0 / Math.sqrt(4.0) - Math.pow(intervalRatio - 0.5, 2.0)) - 0.5;
                var bendHeight = Math.abs(nextPin.interval - prevPin.interval);
                interval = prevPin.interval * (1.0 - intervalRatio) + nextPin.interval * intervalRatio;
                error = arc * bendHeight + 0.95;
                break;
            }
            var minInterval = Number.MAX_VALUE;
            var maxInterval = -Number.MAX_VALUE;
            var bestDistance = Number.MAX_VALUE;
            for (var _b = 0, _c = this._cursor.curNote.pins; _b < _c.length; _b++) {
                var pin = _c[_b];
                if (minInterval > pin.interval)
                    minInterval = pin.interval;
                if (maxInterval < pin.interval)
                    maxInterval = pin.interval;
                var pinDistance = Math.abs(this._cursor.curNote.start + pin.time - this._mouseX / this._partWidth);
                if (bestDistance > pinDistance) {
                    bestDistance = pinDistance;
                    this._cursor.nearPinIndex = this._cursor.curNote.pins.indexOf(pin);
                }
            }
            mousePitch -= interval;
            this._cursor.pitch = this._snapToPitch(mousePitch, -minInterval, (this._doc.song.getChannelIsNoise(this._doc.channel) ? SynthConfig_1.Config.drumCount - 1 : SynthConfig_1.Config.maxPitch) - maxInterval);
            // Snap to nearby existing note if present.
            if (!this._doc.song.getChannelIsNoise(this._doc.channel)) {
                var nearest = error;
                for (var i = 0; i < this._cursor.curNote.pitches.length; i++) {
                    var distance = Math.abs(this._cursor.curNote.pitches[i] - mousePitch + 0.5);
                    if (distance > nearest)
                        continue;
                    nearest = distance;
                    this._cursor.pitch = this._cursor.curNote.pitches[i];
                }
            }
            for (var i = 0; i < this._cursor.curNote.pitches.length; i++) {
                if (this._cursor.curNote.pitches[i] == this._cursor.pitch) {
                    this._cursor.pitchIndex = i;
                    break;
                }
            }
        }
        else {
            this._cursor.pitch = this._snapToPitch(mousePitch, 0, SynthConfig_1.Config.maxPitch);
            var defaultLength = this._copiedPins[this._copiedPins.length - 1].time;
            var fullBeats = Math.floor(this._cursor.part / SynthConfig_1.Config.partsPerBeat);
            var maxDivision = this._getMaxDivision();
            var modMouse = this._cursor.part % SynthConfig_1.Config.partsPerBeat;
            if (defaultLength == 1) {
                this._cursor.start = this._cursor.part;
            }
            else if (defaultLength > SynthConfig_1.Config.partsPerBeat) {
                this._cursor.start = fullBeats * SynthConfig_1.Config.partsPerBeat;
            }
            else if (defaultLength == SynthConfig_1.Config.partsPerBeat) {
                this._cursor.start = fullBeats * SynthConfig_1.Config.partsPerBeat;
                if (maxDivision < SynthConfig_1.Config.partsPerBeat && modMouse > maxDivision) {
                    this._cursor.start += Math.floor(modMouse / maxDivision) * maxDivision;
                }
            }
            else {
                this._cursor.start = fullBeats * SynthConfig_1.Config.partsPerBeat;
                var division = SynthConfig_1.Config.partsPerBeat % defaultLength == 0 ? defaultLength : Math.min(defaultLength, maxDivision);
                while (division < maxDivision && SynthConfig_1.Config.partsPerBeat % division != 0) {
                    division++;
                }
                this._cursor.start += Math.floor(modMouse / division) * division;
            }
            this._cursor.end = this._cursor.start + defaultLength;
            var forceStart = 0;
            var forceEnd = this._doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat;
            if (this._cursor.prevNote != null) {
                forceStart = this._cursor.prevNote.end;
            }
            if (this._cursor.nextNote != null) {
                forceEnd = this._cursor.nextNote.start;
            }
            if (this._cursor.start < forceStart) {
                this._cursor.start = forceStart;
                this._cursor.end = this._cursor.start + defaultLength;
                if (this._cursor.end > forceEnd) {
                    this._cursor.end = forceEnd;
                }
            }
            else if (this._cursor.end > forceEnd) {
                this._cursor.end = forceEnd;
                this._cursor.start = this._cursor.end - defaultLength;
                if (this._cursor.start < forceStart) {
                    this._cursor.start = forceStart;
                }
            }
            if (this._cursor.end - this._cursor.start == defaultLength) {
                this._cursor.pins = this._copiedPins;
            }
            else {
                this._cursor.pins = [];
                for (var _d = 0, _e = this._copiedPins; _d < _e.length; _d++) {
                    var oldPin = _e[_d];
                    if (oldPin.time <= this._cursor.end - this._cursor.start) {
                        this._cursor.pins.push(synth_1.makeNotePin(0, oldPin.time, oldPin.volume));
                        if (oldPin.time == this._cursor.end - this._cursor.start)
                            break;
                    }
                    else {
                        this._cursor.pins.push(synth_1.makeNotePin(0, this._cursor.end - this._cursor.start, oldPin.volume));
                        break;
                    }
                }
            }
        }
        this._cursor.valid = true;
    };
    PatternEditor.prototype._cursorIsInSelection = function () {
        return this._cursor.valid && this._doc.selection.patternSelectionActive && this._doc.selection.patternSelectionStart <= this._cursor.exactPart && this._cursor.exactPart <= this._doc.selection.patternSelectionEnd;
    };
    PatternEditor.prototype._cursorAtStartOfSelection = function () {
        return this._cursor.valid && this._doc.selection.patternSelectionActive && this._cursor.pitchIndex == -1 && this._doc.selection.patternSelectionStart - 3 <= this._cursor.exactPart && this._cursor.exactPart <= this._doc.selection.patternSelectionStart + 1.25;
    };
    PatternEditor.prototype._cursorAtEndOfSelection = function () {
        return this._cursor.valid && this._doc.selection.patternSelectionActive && this._cursor.pitchIndex == -1 && this._doc.selection.patternSelectionEnd - 1.25 <= this._cursor.exactPart && this._cursor.exactPart <= this._doc.selection.patternSelectionEnd + 3;
    };
    PatternEditor.prototype._findMousePitch = function (pixelY) {
        return Math.max(0, Math.min(this._pitchCount - 1, this._pitchCount - (pixelY / this._pitchHeight))) + this._octaveOffset;
    };
    PatternEditor.prototype._snapToPitch = function (guess, min, max) {
        if (guess < min)
            guess = min;
        if (guess > max)
            guess = max;
        var scale = SynthConfig_1.Config.scales[this._doc.song.scale].flags;
        if (scale[Math.floor(guess) % SynthConfig_1.Config.pitchesPerOctave] || this._doc.song.getChannelIsNoise(this._doc.channel)) {
            return Math.floor(guess);
        }
        else {
            var topPitch = Math.floor(guess) + 1;
            var bottomPitch = Math.floor(guess) - 1;
            while (!scale[topPitch % SynthConfig_1.Config.pitchesPerOctave]) {
                topPitch++;
            }
            while (!scale[(bottomPitch) % SynthConfig_1.Config.pitchesPerOctave]) {
                bottomPitch--;
            }
            if (topPitch > max) {
                if (bottomPitch < min) {
                    return min;
                }
                else {
                    return bottomPitch;
                }
            }
            else if (bottomPitch < min) {
                return topPitch;
            }
            var topRange = topPitch;
            var bottomRange = bottomPitch + 1;
            if (topPitch % SynthConfig_1.Config.pitchesPerOctave == 0 || topPitch % SynthConfig_1.Config.pitchesPerOctave == 7) {
                topRange -= 0.5;
            }
            if (bottomPitch % SynthConfig_1.Config.pitchesPerOctave == 0 || bottomPitch % SynthConfig_1.Config.pitchesPerOctave == 7) {
                bottomRange += 0.5;
            }
            return guess - bottomRange > topRange - guess ? topPitch : bottomPitch;
        }
    };
    PatternEditor.prototype._copyPins = function (note) {
        this._copiedPins = [];
        for (var _i = 0, _a = note.pins; _i < _a.length; _i++) {
            var oldPin = _a[_i];
            this._copiedPins.push(synth_1.makeNotePin(0, oldPin.time, oldPin.volume));
        }
        for (var i = 1; i < this._copiedPins.length - 1;) {
            if (this._copiedPins[i - 1].volume == this._copiedPins[i].volume &&
                this._copiedPins[i].volume == this._copiedPins[i + 1].volume) {
                this._copiedPins.splice(i, 1);
            }
            else {
                i++;
            }
        }
        this._copiedPinChannels[this._doc.channel] = this._copiedPins;
    };
    PatternEditor.prototype._whenCursorPressed = function () {
        if (this._doc.enableNotePreview)
            this._doc.synth.maintainLiveInput();
        this._mouseDown = true;
        this._mouseXStart = this._mouseX;
        this._mouseYStart = this._mouseY;
        this._updateCursorStatus();
        this._updatePreview();
        var sequence = new Change_1.ChangeSequence();
        this._dragChange = sequence;
        this._lastChangeWasPatternSelection = this._doc.lastChangeWas(this._changePatternSelection);
        this._doc.setProspectiveChange(this._dragChange);
        if (this._cursorAtStartOfSelection()) {
            this._draggingStartOfSelection = true;
        }
        else if (this._cursorAtEndOfSelection()) {
            this._draggingEndOfSelection = true;
        }
        else if (this._shiftHeld) {
            if ((this._doc.selection.patternSelectionActive && this._cursor.pitchIndex == -1) || this._cursorIsInSelection()) {
                sequence.append(new changes_1.ChangePatternSelection(this._doc, 0, 0));
            }
            else {
                if (this._cursor.curNote != null) {
                    sequence.append(new changes_1.ChangePatternSelection(this._doc, this._cursor.curNote.start, this._cursor.curNote.end));
                }
                else {
                    var start = Math.max(0, Math.min((this._doc.song.beatsPerBar - 1) * SynthConfig_1.Config.partsPerBeat, Math.floor(this._cursor.exactPart / SynthConfig_1.Config.partsPerBeat) * SynthConfig_1.Config.partsPerBeat));
                    var end = start + SynthConfig_1.Config.partsPerBeat;
                    sequence.append(new changes_1.ChangePatternSelection(this._doc, start, end));
                }
            }
        }
        else if (this._cursorIsInSelection()) {
            this._draggingSelectionContents = true;
        }
        else if (this._cursor.valid && this._cursor.curNote == null) {
            sequence.append(new changes_1.ChangePatternSelection(this._doc, 0, 0));
            // If clicking in empty space, the result will be adding a note,
            // so we can safely add it immediately. Note that if clicking on
            // or near an existing note, the result will depend on whether
            // a drag follows, so we couldn't add the note yet without being
            // confusing.
            var note = new synth_1.Note(this._cursor.pitch, this._cursor.start, this._cursor.end, 3, this._doc.song.getChannelIsNoise(this._doc.channel));
            note.pins = [];
            for (var _i = 0, _a = this._cursor.pins; _i < _a.length; _i++) {
                var oldPin = _a[_i];
                note.pins.push(synth_1.makeNotePin(0, oldPin.time, oldPin.volume));
            }
            sequence.append(new changes_1.ChangeEnsurePatternExists(this._doc, this._doc.channel, this._doc.bar));
            var pattern = null = this._doc.getCurrentPattern(this._barOffset);
            if (pattern == null)
                throw new Error();
            sequence.append(new changes_1.ChangeNoteAdded(this._doc, pattern, note, this._cursor.curIndex));
            if (this._doc.enableNotePreview && !this._doc.synth.playing) {
                // Play the new note out loud if enabled.
                var duration = Math.min(SynthConfig_1.Config.partsPerBeat, this._cursor.end - this._cursor.start);
                this._doc.synth.liveInputDuration = duration;
                this._doc.synth.liveInputPitches = [this._cursor.pitch];
                this._doc.synth.liveInputStarted = true;
            }
        }
        this._updateSelection();
    };
    PatternEditor.prototype._whenCursorMoved = function () {
        if (this._doc.enableNotePreview && this._mouseOver)
            this._doc.synth.maintainLiveInput();
        // HACK: Undoable pattern changes rely on persistent instance
        // references. Loading song from hash via undo/redo breaks that,
        // so changes are no longer undoable and the cursor status may be
        // invalid. Abort further drag changes until the mouse is released.
        var continuousState = this._doc.lastChangeWas(this._dragChange);
        if (!this._mouseDragging && this._mouseDown && this._cursor.valid && continuousState) {
            var dx = this._mouseX - this._mouseXStart;
            var dy = this._mouseY - this._mouseYStart;
            if (Math.sqrt(dx * dx + dy * dy) > 5) {
                this._mouseDragging = true;
                this._mouseHorizontal = Math.abs(dx) >= Math.abs(dy);
            }
        }
        if (this._mouseDragging && this._mouseDown && this._cursor.valid && continuousState) {
            this._dragChange;
            !.undo();
            var sequence = new Change_1.ChangeSequence();
            this._dragChange = sequence;
            this._doc.setProspectiveChange(this._dragChange);
            var minDivision = this._getMinDivision();
            var currentPart = this._snapToMinDivision(this._mouseX / this._partWidth);
            if (this._draggingStartOfSelection) {
                sequence.append(new changes_1.ChangePatternSelection(this._doc, Math.max(0, Math.min(this._doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat, currentPart)), this._doc.selection.patternSelectionEnd));
                this._updateSelection();
            }
            else if (this._draggingEndOfSelection) {
                sequence.append(new changes_1.ChangePatternSelection(this._doc, this._doc.selection.patternSelectionStart, Math.max(0, Math.min(this._doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat, currentPart))));
                this._updateSelection();
            }
            else if (this._draggingSelectionContents) {
                var pattern = null = this._doc.getCurrentPattern(this._barOffset);
                if (this._mouseDragging && pattern != null) {
                    this._dragChange;
                    !.undo();
                    var sequence_1 = new Change_1.ChangeSequence();
                    this._dragChange = sequence_1;
                    this._doc.setProspectiveChange(this._dragChange);
                    var notesInScale = SynthConfig_1.Config.scales[this._doc.song.scale].flags.filter(function (x) { return x; }).length;
                    var pitchRatio = this._doc.song.getChannelIsNoise(this._doc.channel) ? 1 : 12 / notesInScale;
                    var draggedParts = Math.round((this._mouseX - this._mouseXStart) / (this._partWidth * minDivision)) * minDivision;
                    var draggedTranspose = Math.round((this._mouseYStart - this._mouseY) / (this._pitchHeight * pitchRatio));
                    sequence_1.append(new changes_1.ChangeDragSelectedNotes(this._doc, this._doc.channel, pattern, draggedParts, draggedTranspose));
                }
            }
            else if (this._shiftHeld) {
                if (this._mouseDragging) {
                    var start = Math.max(0, Math.min((this._doc.song.beatsPerBar - 1) * SynthConfig_1.Config.partsPerBeat, Math.floor(this._cursor.exactPart / SynthConfig_1.Config.partsPerBeat) * SynthConfig_1.Config.partsPerBeat));
                    var end = start + SynthConfig_1.Config.partsPerBeat;
                    if (this._cursor.curNote != null) {
                        start = Math.max(start, this._cursor.curNote.start);
                        end = Math.min(end, this._cursor.curNote.end);
                    }
                    // Todo: The following two conditional blocks could maybe be refactored.
                    if (currentPart < start) {
                        start = 0;
                        var pattern = null = this._doc.getCurrentPattern(this._barOffset);
                        if (pattern != null) {
                            for (var i = 0; i < pattern.notes.length; i++) {
                                if (pattern.notes[i].start <= currentPart) {
                                    start = pattern.notes[i].start;
                                }
                                if (pattern.notes[i].end <= currentPart) {
                                    start = pattern.notes[i].end;
                                }
                            }
                        }
                        for (var beat = 0; beat <= this._doc.song.beatsPerBar; beat++) {
                            var part = beat * SynthConfig_1.Config.partsPerBeat;
                            if (start <= part && part <= currentPart) {
                                start = part;
                            }
                        }
                    }
                    if (currentPart > end) {
                        end = SynthConfig_1.Config.partsPerBeat * this._doc.song.beatsPerBar;
                        var pattern = null = this._doc.getCurrentPattern(this._barOffset);
                        if (pattern != null) {
                            for (var i = 0; i < pattern.notes.length; i++) {
                                if (pattern.notes[i].start >= currentPart) {
                                    end = pattern.notes[i].start;
                                    break;
                                }
                                if (pattern.notes[i].end >= currentPart) {
                                    end = pattern.notes[i].end;
                                    break;
                                }
                            }
                        }
                        for (var beat = 0; beat <= this._doc.song.beatsPerBar; beat++) {
                            var part = beat * SynthConfig_1.Config.partsPerBeat;
                            if (currentPart < part && part < end) {
                                end = part;
                            }
                        }
                    }
                    sequence.append(new changes_1.ChangePatternSelection(this._doc, start, end));
                    this._updateSelection();
                }
            }
            else {
                if (this._cursor.curNote == null) {
                    sequence.append(new changes_1.ChangePatternSelection(this._doc, 0, 0));
                    var backwards;
                    var directLength;
                    if (currentPart < this._cursor.start) {
                        backwards = true;
                        directLength = this._cursor.start - currentPart;
                    }
                    else {
                        backwards = false;
                        directLength = currentPart - this._cursor.start + minDivision;
                    }
                    var defaultLength = minDivision;
                    for (var i = minDivision; i <= this._doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat; i += minDivision) {
                        if (minDivision == 1) {
                            if (i < 5) {
                            }
                            else if (i <= SynthConfig_1.Config.partsPerBeat / 2.0) {
                                if (i % 3 != 0 && i % 4 != 0) {
                                    continue;
                                }
                            }
                            else if (i <= SynthConfig_1.Config.partsPerBeat * 1.5) {
                                if (i % 6 != 0 && i % 8 != 0) {
                                    continue;
                                }
                            }
                            else if (i % SynthConfig_1.Config.partsPerBeat != 0) {
                                continue;
                            }
                        }
                        else {
                            if (i >= 5 * minDivision &&
                                i % SynthConfig_1.Config.partsPerBeat != 0 &&
                                i != SynthConfig_1.Config.partsPerBeat * 3.0 / 4.0 &&
                                i != SynthConfig_1.Config.partsPerBeat * 3.0 / 2.0 &&
                                i != SynthConfig_1.Config.partsPerBeat * 4.0 / 3.0) {
                                continue;
                            }
                        }
                        var blessedLength = i;
                        if (blessedLength == directLength) {
                            defaultLength = blessedLength;
                            break;
                        }
                        if (blessedLength < directLength) {
                            defaultLength = blessedLength;
                        }
                        if (blessedLength > directLength) {
                            if (defaultLength < directLength - minDivision) {
                                defaultLength = blessedLength;
                            }
                            break;
                        }
                    }
                    var start;
                    var end;
                    if (backwards) {
                        end = this._cursor.start;
                        start = end - defaultLength;
                    }
                    else {
                        start = this._cursor.start;
                        end = start + defaultLength;
                    }
                    if (start < 0)
                        start = 0;
                    if (end > this._doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat)
                        end = this._doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat;
                    if (start < end) {
                        sequence.append(new changes_1.ChangeEnsurePatternExists(this._doc, this._doc.channel, this._doc.bar));
                        var pattern = null = this._doc.getCurrentPattern(this._barOffset);
                        if (pattern == null)
                            throw new Error();
                        sequence.append(new changes_1.ChangeNoteTruncate(this._doc, pattern, start, end));
                        var i;
                        for (i = 0; i < pattern.notes.length; i++) {
                            if (pattern.notes[i].start >= end)
                                break;
                        }
                        var theNote = new synth_1.Note(this._cursor.pitch, start, end, 3, this._doc.song.getChannelIsNoise(this._doc.channel));
                        sequence.append(new changes_1.ChangeNoteAdded(this._doc, pattern, theNote, i));
                        this._copyPins(theNote);
                        this._dragTime = backwards ? start : end;
                        this._dragPitch = this._cursor.pitch;
                        this._dragVolume = theNote.pins[backwards ? 0 : 1].volume;
                        this._dragVisible = true;
                    }
                    this._pattern = this._doc.getCurrentPattern(this._barOffset);
                }
                else if (this._mouseHorizontal) {
                    sequence.append(new changes_1.ChangePatternSelection(this._doc, 0, 0));
                    var shift = (this._mouseX - this._mouseXStart) / this._partWidth;
                    var shiftedPin = this._cursor.curNote.pins[this._cursor.nearPinIndex];
                    var shiftedTime = Math.round((this._cursor.curNote.start + shiftedPin.time + shift) / minDivision) * minDivision;
                    if (shiftedTime < 0)
                        shiftedTime = 0;
                    if (shiftedTime > this._doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat)
                        shiftedTime = this._doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat;
                    if (this._pattern == null)
                        throw new Error();
                    if (shiftedTime <= this._cursor.curNote.start && this._cursor.nearPinIndex == this._cursor.curNote.pins.length - 1 ||
                        shiftedTime >= this._cursor.curNote.end && this._cursor.nearPinIndex == 0) {
                        sequence.append(new changes_1.ChangeNoteAdded(this._doc, this._pattern, this._cursor.curNote, this._cursor.curIndex, true));
                        this._dragVisible = false;
                    }
                    else {
                        var start = Math.min(this._cursor.curNote.start, shiftedTime);
                        var end = Math.max(this._cursor.curNote.end, shiftedTime);
                        this._dragTime = shiftedTime;
                        this._dragPitch = this._cursor.curNote.pitches[this._cursor.pitchIndex == -1 ? 0 : this._cursor.pitchIndex] + this._cursor.curNote.pins[this._cursor.nearPinIndex].interval;
                        this._dragVolume = this._cursor.curNote.pins[this._cursor.nearPinIndex].volume;
                        this._dragVisible = true;
                        sequence.append(new changes_1.ChangeNoteTruncate(this._doc, this._pattern, start, end, this._cursor.curNote));
                        sequence.append(new changes_1.ChangePinTime(this._doc, this._cursor.curNote, this._cursor.nearPinIndex, shiftedTime));
                        this._copyPins(this._cursor.curNote);
                    }
                }
                else if (this._cursor.pitchIndex == -1) {
                    sequence.append(new changes_1.ChangePatternSelection(this._doc, 0, 0));
                    var bendPart = Math.max(this._cursor.curNote.start, Math.min(this._cursor.curNote.end, Math.round(this._mouseX / (this._partWidth * minDivision)) * minDivision)) - this._cursor.curNote.start;
                    var prevPin;
                    var nextPin = this._cursor.curNote.pins[0];
                    var bendVolume = 0;
                    var bendInterval = 0;
                    for (var i = 1; i < this._cursor.curNote.pins.length; i++) {
                        prevPin = nextPin;
                        nextPin = this._cursor.curNote.pins[i];
                        if (bendPart > nextPin.time)
                            continue;
                        if (bendPart < prevPin.time)
                            throw new Error();
                        var volumeRatio = (bendPart - prevPin.time) / (nextPin.time - prevPin.time);
                        bendVolume = Math.round(prevPin.volume * (1.0 - volumeRatio) + nextPin.volume * volumeRatio + ((this._mouseYStart - this._mouseY) / 25.0));
                        if (bendVolume < 0)
                            bendVolume = 0;
                        if (bendVolume > 3)
                            bendVolume = 3;
                        bendInterval = this._snapToPitch(prevPin.interval * (1.0 - volumeRatio) + nextPin.interval * volumeRatio + this._cursor.curNote.pitches[0], 0, SynthConfig_1.Config.maxPitch) - this._cursor.curNote.pitches[0];
                        break;
                    }
                    this._dragTime = this._cursor.curNote.start + bendPart;
                    this._dragPitch = this._cursor.curNote.pitches[this._cursor.pitchIndex == -1 ? 0 : this._cursor.pitchIndex] + bendInterval;
                    this._dragVolume = bendVolume;
                    this._dragVisible = true;
                    sequence.append(new changes_1.ChangeVolumeBend(this._doc, this._cursor.curNote, bendPart, bendVolume, bendInterval));
                    this._copyPins(this._cursor.curNote);
                }
                else {
                    sequence.append(new changes_1.ChangePatternSelection(this._doc, 0, 0));
                    this._dragVolume = this._cursor.curNote.pins[this._cursor.nearPinIndex].volume;
                    if (this._pattern == null)
                        throw new Error();
                    var bendStart;
                    var bendEnd;
                    if (this._mouseX >= this._mouseXStart) {
                        bendStart = Math.max(this._cursor.curNote.start, this._cursor.part);
                        bendEnd = currentPart + minDivision;
                    }
                    else {
                        bendStart = Math.min(this._cursor.curNote.end, this._cursor.part + minDivision);
                        bendEnd = currentPart;
                    }
                    if (bendEnd < 0)
                        bendEnd = 0;
                    if (bendEnd > this._doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat)
                        bendEnd = this._doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat;
                    if (bendEnd > this._cursor.curNote.end) {
                        sequence.append(new changes_1.ChangeNoteTruncate(this._doc, this._pattern, this._cursor.curNote.start, bendEnd, this._cursor.curNote));
                    }
                    if (bendEnd < this._cursor.curNote.start) {
                        sequence.append(new changes_1.ChangeNoteTruncate(this._doc, this._pattern, bendEnd, this._cursor.curNote.end, this._cursor.curNote));
                    }
                    var minPitch = Number.MAX_VALUE;
                    var maxPitch = -Number.MAX_VALUE;
                    for (var _i = 0, _a = this._cursor.curNote.pitches; _i < _a.length; _i++) {
                        var pitch = _a[_i];
                        if (minPitch > pitch)
                            minPitch = pitch;
                        if (maxPitch < pitch)
                            maxPitch = pitch;
                    }
                    minPitch -= this._cursor.curNote.pitches[this._cursor.pitchIndex];
                    maxPitch -= this._cursor.curNote.pitches[this._cursor.pitchIndex];
                    var bendTo = this._snapToPitch(this._findMousePitch(this._mouseY), -minPitch, (this._doc.song.getChannelIsNoise(this._doc.channel) ? SynthConfig_1.Config.drumCount - 1 : SynthConfig_1.Config.maxPitch) - maxPitch);
                    sequence.append(new changes_1.ChangePitchBend(this._doc, this._cursor.curNote, bendStart, bendEnd, bendTo, this._cursor.pitchIndex));
                    this._copyPins(this._cursor.curNote);
                    this._dragTime = bendEnd;
                    this._dragPitch = bendTo;
                    this._dragVisible = true;
                }
            }
        }
        if (!(this._mouseDown && this._cursor.valid && continuousState)) {
            this._updateCursorStatus();
            this._updatePreview();
        }
    };
    PatternEditor.prototype._setPatternSelection = function (change) {
        this._changePatternSelection = change;
        // Don't erase existing redo history just to change pattern selection.
        if (!this._doc.hasRedoHistory()) {
            this._doc.record(this._changePatternSelection, this._lastChangeWasPatternSelection);
        }
    };
    PatternEditor.prototype._updatePreview = function () {
        if (this._usingTouch) {
            if (!this._mouseDown || !this._cursor.valid || !this._mouseDragging || !this._dragVisible || this._shiftHeld || this._draggingStartOfSelection || this._draggingEndOfSelection || this._draggingSelectionContents) {
                this._svgPreview.setAttribute("visibility", "hidden");
            }
            else {
                this._svgPreview.setAttribute("visibility", "visible");
                var x = this._partWidth * this._dragTime;
                var y = this._pitchToPixelHeight(this._dragPitch - this._octaveOffset);
                var radius = this._pitchHeight / 2;
                var width = 80;
                var height = 60;
                //this._drawNote(this._svgPreview, this._cursor.pitch, this._cursor.start, this._cursor.pins, this._pitchHeight / 2 + 1, true, this._octaveOffset);
                var pathString = "";
                pathString += "M " + EditorConfig_1.prettyNumber(x) + " " + EditorConfig_1.prettyNumber(y - radius * (this._dragVolume / 3.0)) + " ";
                pathString += "L " + EditorConfig_1.prettyNumber(x) + " " + EditorConfig_1.prettyNumber(y - radius * (this._dragVolume / 3.0) - height) + " ";
                pathString += "M " + EditorConfig_1.prettyNumber(x) + " " + EditorConfig_1.prettyNumber(y + radius * (this._dragVolume / 3.0)) + " ";
                pathString += "L " + EditorConfig_1.prettyNumber(x) + " " + EditorConfig_1.prettyNumber(y + radius * (this._dragVolume / 3.0) + height) + " ";
                pathString += "M " + EditorConfig_1.prettyNumber(x) + " " + EditorConfig_1.prettyNumber(y - radius * (this._dragVolume / 3.0)) + " ";
                pathString += "L " + EditorConfig_1.prettyNumber(x + width) + " " + EditorConfig_1.prettyNumber(y - radius * (this._dragVolume / 3.0)) + " ";
                pathString += "M " + EditorConfig_1.prettyNumber(x) + " " + EditorConfig_1.prettyNumber(y + radius * (this._dragVolume / 3.0)) + " ";
                pathString += "L " + EditorConfig_1.prettyNumber(x + width) + " " + EditorConfig_1.prettyNumber(y + radius * (this._dragVolume / 3.0)) + " ";
                pathString += "M " + EditorConfig_1.prettyNumber(x) + " " + EditorConfig_1.prettyNumber(y - radius * (this._dragVolume / 3.0)) + " ";
                pathString += "L " + EditorConfig_1.prettyNumber(x - width) + " " + EditorConfig_1.prettyNumber(y - radius * (this._dragVolume / 3.0)) + " ";
                pathString += "M " + EditorConfig_1.prettyNumber(x) + " " + EditorConfig_1.prettyNumber(y + radius * (this._dragVolume / 3.0)) + " ";
                pathString += "L " + EditorConfig_1.prettyNumber(x - width) + " " + EditorConfig_1.prettyNumber(y + radius * (this._dragVolume / 3.0)) + " ";
                this._svgPreview.setAttribute("d", pathString);
            }
        }
        else {
            if (!this._mouseOver || this._mouseDown || !this._cursor.valid) {
                this._svgPreview.setAttribute("visibility", "hidden");
            }
            else {
                this._svgPreview.setAttribute("visibility", "visible");
                if (this._cursorAtStartOfSelection()) {
                    var center = this._partWidth * this._doc.selection.patternSelectionStart;
                    var left = EditorConfig_1.prettyNumber(center - 4);
                    var right = EditorConfig_1.prettyNumber(center + 4);
                    var bottom = this._pitchToPixelHeight(-0.5);
                    this._svgPreview.setAttribute("d", "M " + left + " 0 L " + left + " " + bottom + " L " + right + " " + bottom + " L " + right + " 0 z");
                }
                else if (this._cursorAtEndOfSelection()) {
                    var center = this._partWidth * this._doc.selection.patternSelectionEnd;
                    var left = EditorConfig_1.prettyNumber(center - 4);
                    var right = EditorConfig_1.prettyNumber(center + 4);
                    var bottom = this._pitchToPixelHeight(-0.5);
                    this._svgPreview.setAttribute("d", "M " + left + " 0 L " + left + " " + bottom + " L " + right + " " + bottom + " L " + right + " 0 z");
                }
                else if (this._cursorIsInSelection()) {
                    var left = EditorConfig_1.prettyNumber(this._partWidth * this._doc.selection.patternSelectionStart - 2);
                    var right = EditorConfig_1.prettyNumber(this._partWidth * this._doc.selection.patternSelectionEnd + 2);
                    var bottom = this._pitchToPixelHeight(-0.5);
                    this._svgPreview.setAttribute("d", "M " + left + " 0 L " + left + " " + bottom + " L " + right + " " + bottom + " L " + right + " 0 z");
                }
                else {
                    this._drawNote(this._svgPreview, this._cursor.pitch, this._cursor.start, this._cursor.pins, this._pitchHeight / 2 + 1, true, this._octaveOffset);
                }
            }
        }
    };
    PatternEditor.prototype._updateSelection = function () {
        if (this._doc.selection.patternSelectionActive) {
            this._selectionRect.setAttribute("visibility", "visible");
            this._selectionRect.setAttribute("x", String(this._partWidth * this._doc.selection.patternSelectionStart));
            this._selectionRect.setAttribute("width", String(this._partWidth * (this._doc.selection.patternSelectionEnd - this._doc.selection.patternSelectionStart)));
        }
        else {
            this._selectionRect.setAttribute("visibility", "hidden");
        }
    };
    PatternEditor.prototype.render = function () {
        var nextPattern = null = this._doc.getCurrentPattern(this._barOffset);
        if (this._pattern != nextPattern && this._pattern != null) {
            this._dragChange = null;
            this._whenCursorReleased(null);
        }
        this._pattern = nextPattern;
        this._editorWidth = this.container.clientWidth;
        this._editorHeight = this.container.clientHeight;
        this._partWidth = this._editorWidth / (this._doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat);
        this._pitchCount = this._doc.song.getChannelIsNoise(this._doc.channel) ? SynthConfig_1.Config.drumCount : SynthConfig_1.Config.windowPitchCount;
        this._pitchHeight = this._editorHeight / this._pitchCount;
        this._octaveOffset = this._doc.song.channels[this._doc.channel].octave * SynthConfig_1.Config.pitchesPerOctave;
        if (this._renderedRhythm != this._doc.song.rhythm ||
            this._renderedPitchChannelCount != this._doc.song.pitchChannelCount ||
            this._renderedNoiseChannelCount != this._doc.song.noiseChannelCount) {
            this._renderedRhythm = this._doc.song.rhythm;
            this._renderedPitchChannelCount = this._doc.song.pitchChannelCount;
            this._renderedNoiseChannelCount = this._doc.song.noiseChannelCount;
            this.resetCopiedPins();
        }
        this._copiedPins = this._copiedPinChannels[this._doc.channel];
        if (this._renderedWidth != this._editorWidth || this._renderedHeight != this._editorHeight) {
            this._renderedWidth = this._editorWidth;
            this._renderedHeight = this._editorHeight;
            this._svgBackground.setAttribute("width", "" + this._editorWidth);
            this._svgBackground.setAttribute("height", "" + this._editorHeight);
            this._svgPlayhead.setAttribute("height", "" + this._editorHeight);
            this._selectionRect.setAttribute("y", "0");
            this._selectionRect.setAttribute("height", "" + this._editorHeight);
        }
        var beatWidth = this._editorWidth / this._doc.song.beatsPerBar;
        if (this._renderedBeatWidth != beatWidth || this._renderedPitchHeight != this._pitchHeight) {
            this._renderedBeatWidth = beatWidth;
            this._renderedPitchHeight = this._pitchHeight;
            this._svgNoteBackground.setAttribute("width", "" + beatWidth);
            this._svgNoteBackground.setAttribute("height", "" + (this._pitchHeight * SynthConfig_1.Config.pitchesPerOctave));
            this._svgDrumBackground.setAttribute("width", "" + beatWidth);
            this._svgDrumBackground.setAttribute("height", "" + this._pitchHeight);
            this._backgroundDrumRow.setAttribute("width", "" + (beatWidth - 2));
            this._backgroundDrumRow.setAttribute("height", "" + (this._pitchHeight - 2));
            for (var j = 0; j < SynthConfig_1.Config.pitchesPerOctave; j++) {
                var rectangle = this._backgroundPitchRows[j];
                var y = (SynthConfig_1.Config.pitchesPerOctave - j) % SynthConfig_1.Config.pitchesPerOctave;
                rectangle.setAttribute("width", "" + (beatWidth - 2));
                rectangle.setAttribute("y", "" + (y * this._pitchHeight + 1));
                rectangle.setAttribute("height", "" + (this._pitchHeight - 2));
            }
        }
        this._svgNoteContainer = makeEmptyReplacementElement(this._svgNoteContainer);
        if (this._interactive) {
            if (!this._mouseDown)
                this._updateCursorStatus();
            this._updatePreview();
            this._updateSelection();
        }
        if (this._renderedFifths != this._doc.showFifth) {
            this._renderedFifths = this._doc.showFifth;
            this._backgroundPitchRows[7].setAttribute("fill", this._doc.showFifth ? ColorConfig_1.ColorConfig.fifthNote : ColorConfig_1.ColorConfig.pitchBackground);
        }
        for (var j = 0; j < SynthConfig_1.Config.pitchesPerOctave; j++) {
            this._backgroundPitchRows[j].style.visibility = SynthConfig_1.Config.scales[this._doc.song.scale].flags[j] ? "visible" : "hidden";
        }
        if (this._doc.song.getChannelIsNoise(this._doc.channel)) {
            if (!this._renderedDrums) {
                this._renderedDrums = true;
                this._svgBackground.setAttribute("fill", "url(#patternEditorDrumBackground" + this._barOffset + ")");
            }
        }
        else {
            if (this._renderedDrums) {
                this._renderedDrums = false;
                this._svgBackground.setAttribute("fill", "url(#patternEditorNoteBackground" + this._barOffset + ")");
            }
        }
        if (this._doc.showChannels) {
            for (var channel = this._doc.song.getChannelCount() - 1; channel >= 0; channel--) {
                if (channel == this._doc.channel)
                    continue;
                if (this._doc.song.getChannelIsNoise(channel) != this._doc.song.getChannelIsNoise(this._doc.channel))
                    continue;
                var pattern2 = null = this._doc.song.getPattern(channel, this._doc.bar + this._barOffset);
                if (pattern2 == null)
                    continue;
                for (var _i = 0, _a = pattern2.notes; _i < _a.length; _i++) {
                    var note = _a[_i];
                    for (var _b = 0, _c = note.pitches; _b < _c.length; _b++) {
                        var pitch = _c[_b];
                        var notePath = elements_strict_1.SVG.path();
                        notePath.setAttribute("fill", ColorConfig_1.ColorConfig.getChannelColor(this._doc.song, channel).secondaryNote);
                        notePath.setAttribute("pointer-events", "none");
                        this._drawNote(notePath, pitch, note.start, note.pins, this._pitchHeight * 0.19, false, this._doc.song.channels[channel].octave * SynthConfig_1.Config.pitchesPerOctave);
                        this._svgNoteContainer.appendChild(notePath);
                    }
                }
            }
        }
        if (this._pattern != null) {
            for (var _d = 0, _e = this._pattern.notes; _d < _e.length; _d++) {
                var note = _e[_d];
                for (var i = 0; i < note.pitches.length; i++) {
                    var pitch = note.pitches[i];
                    var notePath = elements_strict_1.SVG.path();
                    notePath.setAttribute("fill", ColorConfig_1.ColorConfig.getChannelColor(this._doc.song, this._doc.channel).secondaryNote);
                    notePath.setAttribute("pointer-events", "none");
                    this._drawNote(notePath, pitch, note.start, note.pins, this._pitchHeight / 2 + 1, false, this._octaveOffset);
                    this._svgNoteContainer.appendChild(notePath);
                    notePath = elements_strict_1.SVG.path();
                    notePath.setAttribute("fill", ColorConfig_1.ColorConfig.getChannelColor(this._doc.song, this._doc.channel).primaryNote);
                    notePath.setAttribute("pointer-events", "none");
                    this._drawNote(notePath, pitch, note.start, note.pins, this._pitchHeight / 2 + 1, true, this._octaveOffset);
                    this._svgNoteContainer.appendChild(notePath);
                    if (note.pitches.length > 1) {
                        var instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
                        var chord = instrument.getChord();
                        if (!chord.harmonizes || chord.arpeggiates || chord.strumParts > 0) {
                            var oscillatorLabel = elements_strict_1.SVG.text();
                            oscillatorLabel.setAttribute("x", "" + EditorConfig_1.prettyNumber(this._partWidth * note.start + 2));
                            oscillatorLabel.setAttribute("y", "" + EditorConfig_1.prettyNumber(this._pitchToPixelHeight(pitch - this._octaveOffset)));
                            oscillatorLabel.setAttribute("width", "30");
                            oscillatorLabel.setAttribute("fill", ColorConfig_1.ColorConfig.invertedText);
                            oscillatorLabel.setAttribute("text-anchor", "start");
                            oscillatorLabel.setAttribute("dominant-baseline", "central");
                            oscillatorLabel.setAttribute("pointer-events", "none");
                            oscillatorLabel.textContent = "" + (i + 1);
                            this._svgNoteContainer.appendChild(oscillatorLabel);
                        }
                    }
                }
            }
        }
    };
    PatternEditor.prototype._drawNote = function (svgElement, pitch, start, pins, radius, showVolume, offset) {
        var totalWidth = this._partWidth * (pins[pins.length - 1].time + pins[0].time);
        var endOffset = 0.5 * Math.min(2, totalWidth - 1);
        var nextPin = pins[0];
        var pathString = "M " + EditorConfig_1.prettyNumber(this._partWidth * (start + nextPin.time) + endOffset) + " " + EditorConfig_1.prettyNumber(this._pitchToPixelHeight(pitch - offset) + radius * (showVolume ? nextPin.volume / 3.0 : 1.0)) + " ";
        for (var i = 1; i < pins.length; i++) {
            var prevPin = nextPin;
            nextPin = pins[i];
            var prevSide = this._partWidth * (start + prevPin.time) + (i == 1 ? endOffset : 0);
            var nextSide = this._partWidth * (start + nextPin.time) - (i == pins.length - 1 ? endOffset : 0);
            var prevHeight = this._pitchToPixelHeight(pitch + prevPin.interval - offset);
            var nextHeight = this._pitchToPixelHeight(pitch + nextPin.interval - offset);
            var prevVolume = showVolume ? prevPin.volume / 3.0 : 1.0;
            var nextVolume = showVolume ? nextPin.volume / 3.0 : 1.0;
            pathString += "L " + EditorConfig_1.prettyNumber(prevSide) + " " + EditorConfig_1.prettyNumber(prevHeight - radius * prevVolume) + " ";
            if (prevPin.interval > nextPin.interval)
                pathString += "L " + EditorConfig_1.prettyNumber(prevSide + 1) + " " + EditorConfig_1.prettyNumber(prevHeight - radius * prevVolume) + " ";
            if (prevPin.interval < nextPin.interval)
                pathString += "L " + EditorConfig_1.prettyNumber(nextSide - 1) + " " + EditorConfig_1.prettyNumber(nextHeight - radius * nextVolume) + " ";
            pathString += "L " + EditorConfig_1.prettyNumber(nextSide) + " " + EditorConfig_1.prettyNumber(nextHeight - radius * nextVolume) + " ";
        }
        for (var i = pins.length - 2; i >= 0; i--) {
            var prevPin = nextPin;
            nextPin = pins[i];
            var prevSide = this._partWidth * (start + prevPin.time) - (i == pins.length - 2 ? endOffset : 0);
            var nextSide = this._partWidth * (start + nextPin.time) + (i == 0 ? endOffset : 0);
            var prevHeight = this._pitchToPixelHeight(pitch + prevPin.interval - offset);
            var nextHeight = this._pitchToPixelHeight(pitch + nextPin.interval - offset);
            var prevVolume = showVolume ? prevPin.volume / 3.0 : 1.0;
            var nextVolume = showVolume ? nextPin.volume / 3.0 : 1.0;
            pathString += "L " + EditorConfig_1.prettyNumber(prevSide) + " " + EditorConfig_1.prettyNumber(prevHeight + radius * prevVolume) + " ";
            if (prevPin.interval < nextPin.interval)
                pathString += "L " + EditorConfig_1.prettyNumber(prevSide - 1) + " " + EditorConfig_1.prettyNumber(prevHeight + radius * prevVolume) + " ";
            if (prevPin.interval > nextPin.interval)
                pathString += "L " + EditorConfig_1.prettyNumber(nextSide + 1) + " " + EditorConfig_1.prettyNumber(nextHeight + radius * nextVolume) + " ";
            pathString += "L " + EditorConfig_1.prettyNumber(nextSide) + " " + EditorConfig_1.prettyNumber(nextHeight + radius * nextVolume) + " ";
        }
        pathString += "z";
        svgElement.setAttribute("d", pathString);
    };
    PatternEditor.prototype._pitchToPixelHeight = function (pitch) {
        return this._pitchHeight * (this._pitchCount - (pitch) - 0.5);
    };
    return PatternEditor;
})();
exports.PatternEditor = PatternEditor;
//}
