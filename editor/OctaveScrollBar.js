// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var SynthConfig_1 = require("../synth/SynthConfig");
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
var changes_1 = require("./changes");
var ColorConfig_1 = require("./ColorConfig");
//namespace beepbox {
var OctaveScrollBar = (function () {
    function OctaveScrollBar(_doc) {
        var _this = this;
        this._doc = _doc;
        this.readonly = _editorWidth;
        this.number = 20;
        this.readonly = _editorHeight;
        this.number = 481;
        this.readonly = _notchHeight;
        this.number = 4.0;
        this.readonly = _octaveCount;
        this.number = SynthConfig_1.Config.pitchOctaves;
        this.readonly = _octaveHeight;
        this.number = (this._editorHeight - this._notchHeight) / this._octaveCount;
        this.readonly = _barHeight;
        this.number = (this._octaveHeight * SynthConfig_1.Config.windowOctaves + this._notchHeight);
        this.readonly = _handle;
        this.SVGRectElement = elements_strict_1.SVG.rect({ fill: ColorConfig_1.ColorConfig.uiWidgetBackground, x: 2, y: 0, width: this._editorWidth - 4, height: this._barHeight });
        this.readonly = _handleHighlight;
        this.SVGRectElement = elements_strict_1.SVG.rect({ fill: "none", stroke: ColorConfig_1.ColorConfig.hoverPreview, "stroke-width": 2, "pointer-events": "none", x: 1, y: 0, width: this._editorWidth - 2, height: this._barHeight });
        this.readonly = _upHighlight;
        this.SVGPathElement = elements_strict_1.SVG.path({ fill: ColorConfig_1.ColorConfig.hoverPreview, "pointer-events": "none" });
        this.readonly = _downHighlight;
        this.SVGPathElement = elements_strict_1.SVG.path({ fill: ColorConfig_1.ColorConfig.hoverPreview, "pointer-events": "none" });
        this.readonly = _svg;
        this.SVGSVGElement = elements_strict_1.SVG.svg({ style: "background-color: " + ColorConfig_1.ColorConfig.editorBackground + "; touch-action: pan-x; position: absolute;", width: this._editorWidth, height: "100%", viewBox: "0 0 20 481", preserveAspectRatio: "none" });
        this.readonly = container;
        this.HTMLDivElement = elements_strict_1.HTML.div({ id: "octaveScrollBarContainer", style: "width: 20px; height: 100%; overflow: hidden; position: relative; flex-shrink: 0;" }, this._svg);
        //private _mouseX: number = 0;
        this._mouseY = 0;
        this._mouseDown = false;
        this._mouseOver = false;
        this._dragging = false;
        this._renderedBarBottom = -1;
        this._change = null = null;
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
            _this._mouseDown = true;
            var boundingRect = _this._svg.getBoundingClientRect();
            //this._mouseX = (event.clientX || event.pageX) - boundingRect.left;
            _this._mouseY = ((event.clientY || event.pageY) - boundingRect.top) * _this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(_this._mouseY))
                _this._mouseY = 0;
            if (_this._doc.song.getChannelIsNoise(_this._doc.channel))
                return;
            _this._updatePreview();
            if (_this._mouseY >= _this._barBottom - _this._barHeight && _this._mouseY <= _this._barBottom) {
                _this._dragging = true;
                _this._change = null;
                _this._dragStart = _this._mouseY;
            }
        };
        this._whenTouchPressed = function (event) {
            event.preventDefault();
            _this._mouseDown = true;
            var boundingRect = _this._svg.getBoundingClientRect();
            //this._mouseX = event.touches[0].clientX - boundingRect.left;
            _this._mouseY = (event.touches[0].clientY - boundingRect.top) * _this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(_this._mouseY))
                _this._mouseY = 0;
            if (_this._doc.song.getChannelIsNoise(_this._doc.channel))
                return;
            _this._updatePreview();
            if (_this._mouseY >= _this._barBottom - _this._barHeight && _this._mouseY <= _this._barBottom) {
                _this._dragging = true;
                _this._change = null;
                _this._dragStart = _this._mouseY;
            }
        };
        this._whenMouseMoved = function (event) {
            var boundingRect = _this._svg.getBoundingClientRect();
            //this._mouseX = (event.clientX || event.pageX) - boundingRect.left;
            _this._mouseY = ((event.clientY || event.pageY) - boundingRect.top) * _this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(_this._mouseY))
                _this._mouseY = 0;
            _this._whenCursorMoved();
        };
        this._whenTouchMoved = function (event) {
            if (!_this._mouseDown)
                return;
            event.preventDefault();
            var boundingRect = _this._svg.getBoundingClientRect();
            //this._mouseX = event.touches[0].clientX - boundingRect.left;
            _this._mouseY = (event.touches[0].clientY - boundingRect.top) * _this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(_this._mouseY))
                _this._mouseY = 0;
            _this._whenCursorMoved();
        };
        this._whenCursorReleased = function (event) {
            if (!_this._doc.song.getChannelIsNoise(_this._doc.channel) && _this._mouseDown) {
                if (_this._dragging) {
                    if (_this._change != null)
                        _this._doc.record(_this._change);
                }
                else {
                    var canReplaceLastChange = _this._doc.lastChangeWas(_this._change);
                    var oldValue = canReplaceLastChange ? _this._change : !.oldValue;
                    _this._doc.song.channels[_this._doc.channel].octave;
                    var currentOctave = _this._doc.song.channels[_this._doc.channel].octave;
                    if (_this._mouseY < _this._barBottom - _this._barHeight * 0.5) {
                        if (currentOctave < SynthConfig_1.Config.scrollableOctaves) {
                            _this._change = new changes_1.ChangeOctave(_this._doc, oldValue, currentOctave + 1);
                            _this._doc.record(_this._change, canReplaceLastChange);
                        }
                    }
                    else {
                        if (currentOctave > 0) {
                            _this._change = new changes_1.ChangeOctave(_this._doc, oldValue, currentOctave - 1);
                            _this._doc.record(_this._change, canReplaceLastChange);
                        }
                    }
                }
            }
            _this._mouseDown = false;
            _this._dragging = false;
            _this._updatePreview();
        };
        this._documentChanged = function () {
            _this._barBottom = _this._editorHeight - (_this._octaveHeight * _this._doc.song.channels[_this._doc.channel].octave);
            _this._render();
        };
        this._doc.notifier.watch(this._documentChanged);
        this._documentChanged();
        this._svg.appendChild(this._handle);
        // notches:
        for (var i = 0; i <= this._octaveCount; i++) {
            this._svg.appendChild(elements_strict_1.SVG.rect({ fill: ColorConfig_1.ColorConfig.tonic, x: 0, y: i * this._octaveHeight, width: this._editorWidth, height: this._notchHeight }));
        }
        this._svg.appendChild(this._handleHighlight);
        this._svg.appendChild(this._upHighlight);
        this._svg.appendChild(this._downHighlight);
        var center = this._editorWidth * 0.5;
        var base = 20;
        var tip = 9;
        var arrowWidth = 6;
        this._upHighlight.setAttribute("d", "M " + center + " " + tip + " L " + (center + arrowWidth) + " " + base + " L " + (center - arrowWidth) + " " + base + " z");
        this._downHighlight.setAttribute("d", "M " + center + " " + (this._editorHeight - tip) + " L " + (center + arrowWidth) + " " + (this._editorHeight - base) + " L " + (center - arrowWidth) + " " + (this._editorHeight - base) + " z");
        this.container.addEventListener("mousedown", this._whenMousePressed);
        document.addEventListener("mousemove", this._whenMouseMoved);
        document.addEventListener("mouseup", this._whenCursorReleased);
        this.container.addEventListener("mouseover", this._whenMouseOver);
        this.container.addEventListener("mouseout", this._whenMouseOut);
        this.container.addEventListener("touchstart", this._whenTouchPressed);
        this.container.addEventListener("touchmove", this._whenTouchMoved);
        this.container.addEventListener("touchend", this._whenCursorReleased);
        this.container.addEventListener("touchcancel", this._whenCursorReleased);
    }
    OctaveScrollBar.prototype._whenCursorMoved = function () {
        if (this._doc.song.getChannelIsNoise(this._doc.channel))
            return;
        if (this._dragging) {
            var currentOctave = this._doc.song.channels[this._doc.channel].octave;
            var continuingProspectiveChange = this._doc.lastChangeWas(this._change);
            var oldValue = continuingProspectiveChange ? this._change : !.oldValue, currentOctave;
            var octave = currentOctave;
            while (this._mouseY - this._dragStart < -this._octaveHeight * 0.5) {
                if (octave < SynthConfig_1.Config.scrollableOctaves) {
                    octave++;
                    this._dragStart -= this._octaveHeight;
                }
                else {
                    break;
                }
            }
            while (this._mouseY - this._dragStart > this._octaveHeight * 0.5) {
                if (octave > 0) {
                    octave--;
                    this._dragStart += this._octaveHeight;
                }
                else {
                    break;
                }
            }
            this._change = new changes_1.ChangeOctave(this._doc, oldValue, octave);
            this._doc.setProspectiveChange(this._change);
        }
        if (this._mouseOver)
            this._updatePreview();
    };
    OctaveScrollBar.prototype._updatePreview = function () {
        var showHighlight = this._mouseOver && !this._mouseDown;
        var showUpHighlight = false;
        var showDownHighlight = false;
        var showHandleHighlight = false;
        if (showHighlight) {
            if (this._mouseY < this._barBottom - this._barHeight) {
                showUpHighlight = true;
            }
            else if (this._mouseY > this._barBottom) {
                showDownHighlight = true;
            }
            else {
                showHandleHighlight = true;
            }
        }
        this._upHighlight.style.visibility = showUpHighlight ? "inherit" : "hidden";
        this._downHighlight.style.visibility = showDownHighlight ? "inherit" : "hidden";
        this._handleHighlight.style.visibility = showHandleHighlight ? "inherit" : "hidden";
    };
    OctaveScrollBar.prototype._render = function () {
        this._svg.style.visibility = (this._doc.song.getChannelIsNoise(this._doc.channel)) ? "hidden" : "visible";
        if (this._renderedBarBottom != this._barBottom) {
            this._renderedBarBottom = this._barBottom;
            this._handle.setAttribute("y", "" + (this._barBottom - this._barHeight));
            this._handleHighlight.setAttribute("y", "" + (this._barBottom - this._barHeight));
        }
        this._updatePreview();
    };
    return OctaveScrollBar;
})();
exports.OctaveScrollBar = OctaveScrollBar;
//}
