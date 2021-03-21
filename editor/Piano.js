// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var SynthConfig_1 = require("../synth/SynthConfig");
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
var ColorConfig_1 = require("./ColorConfig");
//namespace beepbox {
var Piano = (function () {
    function Piano(_doc) {
        var _this = this;
        this._doc = _doc;
        this.readonly = _pianoContainer;
        this.HTMLDivElement = elements_strict_1.HTML.div({ style: "width: 100%; height: 100%; display: flex; flex-direction: column-reverse; align-items: stretch;" });
        this.readonly = _drumContainer;
        this.HTMLDivElement = elements_strict_1.HTML.div({ style: "width: 100%; height: 100%; display: flex; flex-direction: column-reverse; align-items: stretch;" });
        this.readonly = _preview;
        this.HTMLDivElement = elements_strict_1.HTML.div({ style: "width: 100%; height: 40px; border: 2px solid " + ColorConfig_1.ColorConfig.primaryText + "; position: absolute; box-sizing: border-box; pointer-events: none;" });
        this.readonly = container;
        this.HTMLDivElement = elements_strict_1.HTML.div({ style: "width: 32px; height: 100%; overflow: hidden; position: relative; flex-shrink: 0; touch-action: none;" }, this._pianoContainer, this._drumContainer, this._preview);
        this.readonly = _editorHeight;
        this.number = 481;
        this.readonly = _pianoKeys;
        this.HTMLDivElement = (_a = [], _a);
        this.readonly = _pianoLabels;
        this.HTMLDivElement = (_b = [], _b);
        //private _mouseX: number = 0;
        this._mouseY = 0;
        this._mouseDown = false;
        this._mouseOver = false;
        this._playedPitch = -1;
        this._renderedScale = -1;
        this._renderedDrums = false;
        this._renderedKey = -1;
        this._whenMouseOver = function (event) {
            if (_this._mouseOver)
                return;
            _this._mouseOver = true;
            _this._updatePreview();
        };
        this._whenMouseOut = function (event) {
            if (!_this._mouseOver)
                return;
            _this._mouseOver = false;
            _this._updatePreview();
        };
        this._whenMousePressed = function (event) {
            event.preventDefault();
            _this._doc.synth.maintainLiveInput();
            _this._mouseDown = true;
            var boundingRect = _this.container.getBoundingClientRect();
            //this._mouseX = (event.clientX || event.pageX) - boundingRect.left;
            _this._mouseY = ((event.clientY || event.pageY) - boundingRect.top) * _this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(_this._mouseY))
                _this._mouseY = 0;
            _this._playLiveInput();
            _this._updatePreview();
        };
        this._whenMouseMoved = function (event) {
            if (_this._mouseDown || _this._mouseOver)
                _this._doc.synth.maintainLiveInput();
            var boundingRect = _this.container.getBoundingClientRect();
            //this._mouseX = (event.clientX || event.pageX) - boundingRect.left;
            _this._mouseY = ((event.clientY || event.pageY) - boundingRect.top) * _this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(_this._mouseY))
                _this._mouseY = 0;
            _this._updateCursorPitch();
            if (_this._mouseDown)
                _this._playLiveInput();
            _this._updatePreview();
        };
        this._whenMouseReleased = function (event) {
            if (_this._mouseDown)
                _this._releaseLiveInput();
            _this._mouseDown = false;
            _this._updatePreview();
        };
        this._whenTouchPressed = function (event) {
            event.preventDefault();
            _this._doc.synth.maintainLiveInput();
            _this._mouseDown = true;
            var boundingRect = _this.container.getBoundingClientRect();
            //this._mouseX = event.touches[0].clientX - boundingRect.left;
            _this._mouseY = (event.touches[0].clientY - boundingRect.top) * _this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(_this._mouseY))
                _this._mouseY = 0;
            _this._updateCursorPitch();
            _this._playLiveInput();
        };
        this._whenTouchMoved = function (event) {
            event.preventDefault();
            _this._doc.synth.maintainLiveInput();
            var boundingRect = _this.container.getBoundingClientRect();
            //this._mouseX = event.touches[0].clientX - boundingRect.left;
            _this._mouseY = (event.touches[0].clientY - boundingRect.top) * _this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(_this._mouseY))
                _this._mouseY = 0;
            _this._updateCursorPitch();
            if (_this._mouseDown)
                _this._playLiveInput();
        };
        this._whenTouchReleased = function (event) {
            event.preventDefault();
            _this._releaseLiveInput();
        };
        this._documentChanged = function () {
            var isDrum = _this._doc.song.getChannelIsNoise(_this._doc.channel);
            _this._pitchHeight = isDrum ? 40 : 13;
            _this._pitchCount = isDrum ? SynthConfig_1.Config.drumCount : SynthConfig_1.Config.windowPitchCount;
            _this._updateCursorPitch();
            if (_this._mouseDown)
                _this._playLiveInput();
            _this._doc.synth.liveInputChannel = _this._doc.channel;
            _this._render();
        };
        this._render = function () {
            if (!_this._doc.showLetters)
                return;
            var isDrum = _this._doc.song.getChannelIsNoise(_this._doc.channel);
            if (_this._renderedScale == _this._doc.song.scale && _this._renderedKey == _this._doc.song.key && _this._renderedDrums == isDrum)
                return;
            _this._renderedScale = _this._doc.song.scale;
            _this._renderedKey = _this._doc.song.key;
            _this._renderedDrums = isDrum;
            _this._pianoContainer.style.display = isDrum ? "none" : "flex";
            _this._drumContainer.style.display = isDrum ? "flex" : "none";
            if (!isDrum) {
                for (var j = 0; j < _this._pitchCount; j++) {
                    var pitchNameIndex = (j + SynthConfig_1.Config.keys[_this._doc.song.key].basePitch) % 12;
                    var isWhiteKey = SynthConfig_1.Config.keys[pitchNameIndex].isWhiteKey;
                    _this._pianoKeys[j].style.background = isWhiteKey ? ColorConfig_1.ColorConfig.whitePianoKey : ColorConfig_1.ColorConfig.blackPianoKey;
                    if (!SynthConfig_1.Config.scales[_this._doc.song.scale].flags[j % 12]) {
                        _this._pianoKeys[j].classList.add("disabled");
                        _this._pianoLabels[j].style.display = "none";
                    }
                    else {
                        _this._pianoKeys[j].classList.remove("disabled");
                        _this._pianoLabels[j].style.display = "";
                        var text = void 0;
                        if (SynthConfig_1.Config.keys[pitchNameIndex].isWhiteKey) {
                            text = SynthConfig_1.Config.keys[pitchNameIndex].name;
                        }
                        else {
                            var shiftDir = SynthConfig_1.Config.blackKeyNameParents[j % 12];
                            text = SynthConfig_1.Config.keys[(pitchNameIndex + 12 + shiftDir) % 12].name;
                            if (shiftDir == 1) {
                                text += "♭";
                            }
                            else if (shiftDir == -1) {
                                text += "♯";
                            }
                        }
                        var label = _this._pianoLabels[j];
                        label.style.color = SynthConfig_1.Config.keys[pitchNameIndex].isWhiteKey ? "black" : "white";
                        label.textContent = text;
                    }
                }
            }
            _this._updatePreview();
        };
        for (var i = 0; i < SynthConfig_1.Config.windowPitchCount; i++) {
            var pianoLabel = elements_strict_1.HTML.div({ class: "piano-label", style: "font-weight: bold; -webkit-text-stroke-width: 0; font-size: 11px; font-family: sans-serif; position: absolute; padding-left: 15px;" });
            var pianoKey = elements_strict_1.HTML.div({ class: "piano-button", style: "background: gray;" }, pianoLabel);
            this._pianoContainer.appendChild(pianoKey);
            this._pianoLabels.push(pianoLabel);
            this._pianoKeys.push(pianoKey);
        }
        for (var i = 0; i < SynthConfig_1.Config.drumCount; i++) {
            var scale = (1.0 - (i / SynthConfig_1.Config.drumCount) * 0.35) * 100;
            var brightness = 1.0 + ((i - SynthConfig_1.Config.drumCount / 2.0) / SynthConfig_1.Config.drumCount) * 0.5;
            this._drumContainer.appendChild(elements_strict_1.HTML.div({ class: "drum-button", style: "background-size: " + scale + "% " + scale + "%; filter: brightness(" + brightness + ")" }));
        }
        this.container.addEventListener("mousedown", this._whenMousePressed);
        document.addEventListener("mousemove", this._whenMouseMoved);
        document.addEventListener("mouseup", this._whenMouseReleased);
        this.container.addEventListener("mouseover", this._whenMouseOver);
        this.container.addEventListener("mouseout", this._whenMouseOut);
        this.container.addEventListener("touchstart", this._whenTouchPressed);
        this.container.addEventListener("touchmove", this._whenTouchMoved);
        this.container.addEventListener("touchend", this._whenTouchReleased);
        this.container.addEventListener("touchcancel", this._whenTouchReleased);
        this._doc.notifier.watch(this._documentChanged);
        this._documentChanged();
        var _a, _b;
    }
    Piano.prototype._updateCursorPitch = function () {
        var scale = SynthConfig_1.Config.scales[this._doc.song.scale].flags;
        var mousePitch = Math.max(0, Math.min(this._pitchCount - 1, this._pitchCount - (this._mouseY / this._pitchHeight)));
        if (scale[Math.floor(mousePitch) % 12] || this._doc.song.getChannelIsNoise(this._doc.channel)) {
            this._cursorPitch = Math.floor(mousePitch);
        }
        else {
            var topPitch = Math.floor(mousePitch) + 1;
            var bottomPitch = Math.floor(mousePitch) - 1;
            while (!scale[topPitch % 12]) {
                topPitch++;
            }
            while (!scale[(bottomPitch) % 12]) {
                bottomPitch--;
            }
            var topRange = topPitch;
            var bottomRange = bottomPitch + 1;
            if (topPitch % 12 == 0 || topPitch % 12 == 7) {
                topRange -= 0.5;
            }
            if (bottomPitch % 12 == 0 || bottomPitch % 12 == 7) {
                bottomRange += 0.5;
            }
            this._cursorPitch = mousePitch - bottomRange > topRange - mousePitch ? topPitch : bottomPitch;
        }
    };
    Piano.prototype._playLiveInput = function () {
        var currentPitch = this._cursorPitch + this._doc.song.channels[this._doc.channel].octave * 12;
        if (this._playedPitch == currentPitch)
            return;
        this._playedPitch = currentPitch;
        this._doc.synth.liveInputDuration = Number.MAX_SAFE_INTEGER;
        this._doc.synth.liveInputPitches = [this._playedPitch];
        this._doc.synth.liveInputStarted = true;
    };
    Piano.prototype._releaseLiveInput = function () {
        this._playedPitch = -1;
        this._doc.synth.liveInputDuration = 0;
    };
    Piano.prototype._updatePreview = function () {
        this._preview.style.visibility = (!this._mouseOver || this._mouseDown) ? "hidden" : "visible";
        if (!this._mouseOver || this._mouseDown)
            return;
        var boundingRect = this.container.getBoundingClientRect();
        var pitchHeight = this._pitchHeight / (this._editorHeight / (boundingRect.bottom - boundingRect.top));
        this._preview.style.left = "0px";
        this._preview.style.top = pitchHeight * (this._pitchCount - this._cursorPitch - 1) + "px";
        this._preview.style.height = pitchHeight + "px";
    };
    return Piano;
})();
exports.Piano = Piano;
//}
