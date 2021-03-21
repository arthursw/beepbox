// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var SynthConfig_1 = require("../synth/SynthConfig");
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
var ColorConfig_1 = require("./ColorConfig");
var changes_1 = require("./changes");
var EditorConfig_1 = require("./EditorConfig");
//namespace beepbox {
var SpectrumEditor = (function () {
    function SpectrumEditor(_doc, _spectrumIndex) {
        var _this = this;
        if (_spectrumIndex === void 0) { _spectrumIndex = null; }
        this._doc = _doc;
        this._spectrumIndex = _spectrumIndex;
        this.readonly = _editorWidth;
        this.number = 112;
        this.readonly = _editorHeight;
        this.number = 26;
        this.readonly = _fill;
        this.SVGPathElement = elements_strict_1.SVG.path({ fill: ColorConfig_1.ColorConfig.uiWidgetBackground, "pointer-events": "none" });
        this.readonly = _octaves;
        this.SVGSVGElement = elements_strict_1.SVG.svg({ "pointer-events": "none" });
        this.readonly = _fifths;
        this.SVGSVGElement = elements_strict_1.SVG.svg({ "pointer-events": "none" });
        this.readonly = _curve;
        this.SVGPathElement = elements_strict_1.SVG.path({ fill: "none", stroke: "currentColor", "stroke-width": 2, "pointer-events": "none" });
        this.readonly = _arrow;
        this.SVGPathElement = elements_strict_1.SVG.path({ fill: "currentColor", "pointer-events": "none" });
        this.readonly = _svg;
        this.SVGSVGElement = elements_strict_1.SVG.svg({ style: "background-color: " + ColorConfig_1.ColorConfig.editorBackground + "; touch-action: none; cursor: crosshair;", width: "100%", height: "100%", viewBox: "0 0 " + this._editorWidth + " " + this._editorHeight, preserveAspectRatio: "none" }, this._fill, this._octaves, this._fifths, this._curve, this._arrow);
        this.readonly = container;
        this.HTMLElement = elements_strict_1.HTML.div({ class: "spectrum", style: "height: 2em;" }, this._svg);
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
        for (var i = 0; i < SynthConfig_1.Config.spectrumControlPoints; i += SynthConfig_1.Config.spectrumControlPointsPerOctave) {
            this._octaves.appendChild(elements_strict_1.SVG.rect({ fill: ColorConfig_1.ColorConfig.tonic, x: (i + 1) * this._editorWidth / (SynthConfig_1.Config.spectrumControlPoints + 2) - 1, y: 0, width: 2, height: this._editorHeight }));
        }
        for (var i = 4; i <= SynthConfig_1.Config.spectrumControlPoints; i += SynthConfig_1.Config.spectrumControlPointsPerOctave) {
            this._fifths.appendChild(elements_strict_1.SVG.rect({ fill: ColorConfig_1.ColorConfig.fifthNote, x: (i + 1) * this._editorWidth / (SynthConfig_1.Config.spectrumControlPoints + 2) - 1, y: 0, width: 2, height: this._editorHeight }));
        }
        this.container.addEventListener("mousedown", this._whenMousePressed);
        document.addEventListener("mousemove", this._whenMouseMoved);
        document.addEventListener("mouseup", this._whenCursorReleased);
        this.container.addEventListener("touchstart", this._whenTouchPressed);
        this.container.addEventListener("touchmove", this._whenTouchMoved);
        this.container.addEventListener("touchend", this._whenCursorReleased);
        this.container.addEventListener("touchcancel", this._whenCursorReleased);
    }
    SpectrumEditor.prototype._xToFreq = function (x) {
        return (SynthConfig_1.Config.spectrumControlPoints + 2) * x / this._editorWidth - 1;
    };
    SpectrumEditor.prototype._yToAmp = function (y) {
        return SynthConfig_1.Config.spectrumMax * (1 - (y - 1) / (this._editorHeight - 2));
    };
    SpectrumEditor.prototype._whenCursorMoved = function () {
        if (this._mouseDown) {
            var freq = this._xToFreq(this._mouseX);
            var amp = this._yToAmp(this._mouseY);
            var instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
            var spectrumWave = (this._spectrumIndex == null) ? instrument.spectrumWave : instrument.drumsetSpectrumWaves[this._spectrumIndex];
            if (freq != this._freqPrev) {
                var slope = (amp - this._ampPrev) / (freq - this._freqPrev);
                var offset = this._ampPrev - this._freqPrev * slope;
                var lowerFreq = Math.ceil(Math.min(this._freqPrev, freq));
                var upperFreq = Math.floor(Math.max(this._freqPrev, freq));
                for (var i = lowerFreq; i <= upperFreq; i++) {
                    if (i < 0 || i >= SynthConfig_1.Config.spectrumControlPoints)
                        continue;
                    spectrumWave.spectrum[i] = Math.max(0, Math.min(SynthConfig_1.Config.spectrumMax, Math.round(i * slope + offset)));
                }
            }
            spectrumWave.spectrum[Math.max(0, Math.min(SynthConfig_1.Config.spectrumControlPoints - 1, Math.round(freq)))] = Math.max(0, Math.min(SynthConfig_1.Config.spectrumMax, Math.round(amp)));
            this._freqPrev = freq;
            this._ampPrev = amp;
            this._change = new changes_1.ChangeSpectrum(this._doc, instrument, spectrumWave);
            this._doc.setProspectiveChange(this._change);
        }
    };
    SpectrumEditor.prototype.render = function () {
        var _this = this;
        var instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
        var spectrumWave = (this._spectrumIndex == null) ? instrument.spectrumWave : instrument.drumsetSpectrumWaves[this._spectrumIndex];
        var controlPointToHeight = function (point) {
            return (1 - (point / SynthConfig_1.Config.spectrumMax)) * (_this._editorHeight - 1) + 1;
        };
        var lastValue = 0;
        var path = "M 0 " + EditorConfig_1.prettyNumber(this._editorHeight) + " ";
        for (var i = 0; i < SynthConfig_1.Config.spectrumControlPoints; i++) {
            var nextValue = spectrumWave.spectrum[i];
            if (lastValue != 0 || nextValue != 0) {
                path += "L ";
            }
            else {
                path += "M ";
            }
            path += EditorConfig_1.prettyNumber((i + 1) * this._editorWidth / (SynthConfig_1.Config.spectrumControlPoints + 2)) + " " + EditorConfig_1.prettyNumber(controlPointToHeight(nextValue)) + " ";
            lastValue = nextValue;
        }
        var lastHeight = controlPointToHeight(lastValue);
        if (lastValue > 0) {
            path += "L " + (this._editorWidth - 1) + " " + EditorConfig_1.prettyNumber(lastHeight) + " ";
        }
        if (this._renderedPath != path) {
            this._renderedPath = path;
            this._curve.setAttribute("d", path);
            this._fill.setAttribute("d", path + "L " + this._editorWidth + " " + EditorConfig_1.prettyNumber(lastHeight) + " L " + this._editorWidth + " " + EditorConfig_1.prettyNumber(this._editorHeight) + " L 0 " + EditorConfig_1.prettyNumber(this._editorHeight) + " z ");
            this._arrow.setAttribute("d", "M " + this._editorWidth + " " + EditorConfig_1.prettyNumber(lastHeight) + " L " + (this._editorWidth - 4) + " " + EditorConfig_1.prettyNumber(lastHeight - 4) + " L " + (this._editorWidth - 4) + " " + EditorConfig_1.prettyNumber(lastHeight + 4) + " z");
            this._arrow.style.display = (lastValue > 0) ? "" : "none";
        }
        if (this._renderedFifths != this._doc.showFifth) {
            this._renderedFifths = this._doc.showFifth;
            this._fifths.style.display = this._doc.showFifth ? "" : "none";
        }
    };
    return SpectrumEditor;
})();
exports.SpectrumEditor = SpectrumEditor;
//}
