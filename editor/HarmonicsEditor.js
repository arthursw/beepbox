// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var SynthConfig_1 = require("../synth/SynthConfig");
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
var ColorConfig_1 = require("./ColorConfig");
var changes_1 = require("./changes");
var EditorConfig_1 = require("./EditorConfig");
//namespace beepbox {
var HarmonicsEditor = (function () {
    function HarmonicsEditor(_doc) {
        var _this = this;
        this._doc = _doc;
        this.readonly = _editorWidth;
        this.number = 112;
        this.readonly = _editorHeight;
        this.number = 26;
        this.readonly = _octaves;
        this.SVGSVGElement = elements_strict_1.SVG.svg({ "pointer-events": "none" });
        this.readonly = _fifths;
        this.SVGSVGElement = elements_strict_1.SVG.svg({ "pointer-events": "none" });
        this.readonly = _curve;
        this.SVGPathElement = elements_strict_1.SVG.path({ fill: "none", stroke: "currentColor", "stroke-width": 2, "pointer-events": "none" });
        this.readonly = _lastControlPoints;
        this.SVGRectElement = (_a = [], _a);
        this.readonly = _lastControlPointContainer;
        this.SVGSVGElement = elements_strict_1.SVG.svg({ "pointer-events": "none" });
        this.readonly = _svg;
        this.SVGSVGElement = elements_strict_1.SVG.svg({ style: "background-color: " + ColorConfig_1.ColorConfig.editorBackground + "; touch-action: none; cursor: crosshair;", width: "100%", height: "100%", viewBox: "0 0 " + this._editorWidth + " " + this._editorHeight, preserveAspectRatio: "none" }, this._octaves, this._fifths, this._curve, this._lastControlPointContainer);
        this.readonly = container;
        this.HTMLElement = elements_strict_1.HTML.div({ class: "harmonics", style: "height: 2em;" }, this._svg);
        this._mouseX = 0;
        this._mouseY = 0;
        this._freqPrev = 0;
        this._ampPrev = 0;
        this._mouseDown = false;
        this._change = null = null;
        this._renderedPath = "";
        this._renderedFifths = true;
        this._whenMousePressed = function (event) {
            event.preventDefault();
            _this._mouseDown = true;
            var boundingRect = _this._svg.getBoundingClientRect();
            _this._mouseX = ((event.clientX || event.pageX) - boundingRect.left) * _this._editorWidth / (boundingRect.right - boundingRect.left);
            _this._mouseY = ((event.clientY || event.pageY) - boundingRect.top) * _this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(_this._mouseX))
                _this._mouseX = 0;
            if (isNaN(_this._mouseY))
                _this._mouseY = 0;
            _this._freqPrev = _this._xToFreq(_this._mouseX);
            _this._ampPrev = _this._yToAmp(_this._mouseY);
            _this._whenCursorMoved();
        };
        this._whenTouchPressed = function (event) {
            event.preventDefault();
            _this._mouseDown = true;
            var boundingRect = _this._svg.getBoundingClientRect();
            _this._mouseX = (event.touches[0].clientX - boundingRect.left) * _this._editorWidth / (boundingRect.right - boundingRect.left);
            _this._mouseY = (event.touches[0].clientY - boundingRect.top) * _this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(_this._mouseX))
                _this._mouseX = 0;
            if (isNaN(_this._mouseY))
                _this._mouseY = 0;
            _this._freqPrev = _this._xToFreq(_this._mouseX);
            _this._ampPrev = _this._yToAmp(_this._mouseY);
            _this._whenCursorMoved();
        };
        this._whenMouseMoved = function (event) {
            if (_this.container.offsetParent == null)
                return;
            var boundingRect = _this._svg.getBoundingClientRect();
            _this._mouseX = ((event.clientX || event.pageX) - boundingRect.left) * _this._editorWidth / (boundingRect.right - boundingRect.left);
            _this._mouseY = ((event.clientY || event.pageY) - boundingRect.top) * _this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(_this._mouseX))
                _this._mouseX = 0;
            if (isNaN(_this._mouseY))
                _this._mouseY = 0;
            _this._whenCursorMoved();
        };
        this._whenTouchMoved = function (event) {
            if (_this.container.offsetParent == null)
                return;
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
            if (_this._mouseDown) {
                _this._doc.record(_this._change, !);
                _this._change = null;
            }
            _this._mouseDown = false;
        };
        for (var i = 1; i <= SynthConfig_1.Config.harmonicsControlPoints; i = i * 2) {
            this._octaves.appendChild(elements_strict_1.SVG.rect({ fill: ColorConfig_1.ColorConfig.tonic, x: (i - 0.5) * (this._editorWidth - 8) / (SynthConfig_1.Config.harmonicsControlPoints - 1) - 1, y: 0, width: 2, height: this._editorHeight }));
        }
        for (var i = 3; i <= SynthConfig_1.Config.harmonicsControlPoints; i = i * 2) {
            this._fifths.appendChild(elements_strict_1.SVG.rect({ fill: ColorConfig_1.ColorConfig.fifthNote, x: (i - 0.5) * (this._editorWidth - 8) / (SynthConfig_1.Config.harmonicsControlPoints - 1) - 1, y: 0, width: 2, height: this._editorHeight }));
        }
        for (var i = 0; i < 4; i++) {
            var rect = elements_strict_1.SVG.rect({ fill: "currentColor", x: (this._editorWidth - i * 2 - 1), y: 0, width: 1, height: this._editorHeight });
            this._lastControlPoints.push(rect);
            this._lastControlPointContainer.appendChild(rect);
        }
        this.container.addEventListener("mousedown", this._whenMousePressed);
        document.addEventListener("mousemove", this._whenMouseMoved);
        document.addEventListener("mouseup", this._whenCursorReleased);
        this.container.addEventListener("touchstart", this._whenTouchPressed);
        this.container.addEventListener("touchmove", this._whenTouchMoved);
        this.container.addEventListener("touchend", this._whenCursorReleased);
        this.container.addEventListener("touchcancel", this._whenCursorReleased);
        var _a;
    }
    HarmonicsEditor.prototype._xToFreq = function (x) {
        return (SynthConfig_1.Config.harmonicsControlPoints - 1) * x / (this._editorWidth - 8) - 0.5;
    };
    HarmonicsEditor.prototype._yToAmp = function (y) {
        return SynthConfig_1.Config.harmonicsMax * (1 - y / this._editorHeight);
    };
    HarmonicsEditor.prototype._whenCursorMoved = function () {
        if (this._mouseDown) {
            var freq = this._xToFreq(this._mouseX);
            var amp = this._yToAmp(this._mouseY);
            var instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
            var harmonicsWave = instrument.harmonicsWave; //(this._harmonicsIndex == null) ? instrument.harmonicsWave : instrument.drumsetSpectrumWaves[this._harmonicsIndex];
            if (freq != this._freqPrev) {
                var slope = (amp - this._ampPrev) / (freq - this._freqPrev);
                var offset = this._ampPrev - this._freqPrev * slope;
                var lowerFreq = Math.ceil(Math.min(this._freqPrev, freq));
                var upperFreq = Math.floor(Math.max(this._freqPrev, freq));
                for (var i = lowerFreq; i <= upperFreq; i++) {
                    if (i < 0 || i >= SynthConfig_1.Config.harmonicsControlPoints)
                        continue;
                    harmonicsWave.harmonics[i] = Math.max(0, Math.min(SynthConfig_1.Config.harmonicsMax, Math.round(i * slope + offset)));
                }
            }
            harmonicsWave.harmonics[Math.max(0, Math.min(SynthConfig_1.Config.harmonicsControlPoints - 1, Math.round(freq)))] = Math.max(0, Math.min(SynthConfig_1.Config.harmonicsMax, Math.round(amp)));
            this._freqPrev = freq;
            this._ampPrev = amp;
            this._change = new changes_1.ChangeHarmonics(this._doc, instrument, harmonicsWave);
            this._doc.setProspectiveChange(this._change);
        }
    };
    HarmonicsEditor.prototype.render = function () {
        var _this = this;
        var instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
        var harmonicsWave = instrument.harmonicsWave; //(this._harmonicsIndex == null) ? instrument.harmonicsWave : instrument.drumsetSpectrumWaves[this._harmonicsIndex];
        var controlPointToHeight = function (point) {
            return (1 - (point / SynthConfig_1.Config.harmonicsMax)) * _this._editorHeight;
        };
        var bottom = EditorConfig_1.prettyNumber(this._editorHeight);
        var path = "";
        for (var i = 0; i < SynthConfig_1.Config.harmonicsControlPoints - 1; i++) {
            if (harmonicsWave.harmonics[i] == 0)
                continue;
            var xPos = EditorConfig_1.prettyNumber((i + 0.5) * (this._editorWidth - 8) / (SynthConfig_1.Config.harmonicsControlPoints - 1));
            path += "M " + xPos + " " + bottom + " ";
            path += "L " + xPos + " " + EditorConfig_1.prettyNumber(controlPointToHeight(harmonicsWave.harmonics[i])) + " ";
        }
        var lastHeight = controlPointToHeight(harmonicsWave.harmonics[SynthConfig_1.Config.harmonicsControlPoints - 1]);
        for (var i = 0; i < 4; i++) {
            var rect = this._lastControlPoints[i];
            rect.setAttribute("y", EditorConfig_1.prettyNumber(lastHeight));
            rect.setAttribute("height", EditorConfig_1.prettyNumber(this._editorHeight - lastHeight));
        }
        if (this._renderedPath != path) {
            this._renderedPath = path;
            this._curve.setAttribute("d", path);
        }
        if (this._renderedFifths != this._doc.showFifth) {
            this._renderedFifths = this._doc.showFifth;
            this._fifths.style.display = this._doc.showFifth ? "" : "none";
        }
    };
    return HarmonicsEditor;
})();
exports.HarmonicsEditor = HarmonicsEditor;
//}
