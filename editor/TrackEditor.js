// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var ColorConfig_1 = require("./ColorConfig");
var EditorConfig_1 = require("./EditorConfig");
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
//namespace beepbox {
var Box = (function () {
    function Box(channel, readonly, number, readonly, number, color) {
        if (readonly === void 0) { readonly = _x; }
        if (readonly === void 0) { readonly = _y; }
        this.readonly = readonly;
        this.readonly = readonly;
        this.readonly = _text;
        this.Text = document.createTextNode("1");
        this.readonly = _label;
        this.SVGTextElement = elements_strict_1.SVG.text({ "font-family": "sans-serif", "font-size": 20, "text-anchor": "middle", "font-weight": "bold", fill: "red" }, this._text);
        this.readonly = _rect;
        this.SVGRectElement = elements_strict_1.SVG.rect({ x: 1, y: 1 });
        this.readonly = container;
        this.SVGSVGElement = elements_strict_1.SVG.svg(this._rect, this._label);
        this._renderedIndex = 1;
        this._renderedDim = true;
        this._renderedSelected = false;
        this._renderedColor = "";
        this._rect.setAttribute("fill", ColorConfig_1.ColorConfig.uiWidgetBackground);
        this._label.setAttribute("fill", color);
    }
    Box.prototype.setSize = function (width, height) {
        this.container.setAttribute("x", "" + (this._x * width));
        this.container.setAttribute("y", "" + (this._y * height));
        this._rect.setAttribute("width", "" + (width - 2));
        this._rect.setAttribute("height", "" + (height - 2));
        this._label.setAttribute("x", "" + (width / 2));
        this._label.setAttribute("y", "" + Math.round(height / 2 + 7));
    };
    Box.prototype.setIndex = function (index, dim, selected, color) {
        if (this._renderedIndex != index) {
            if (!this._renderedSelected && ((index == 0) != (this._renderedIndex == 0))) {
                this._rect.setAttribute("fill", (index == 0) ? "none" : ColorConfig_1.ColorConfig.uiWidgetBackground);
            }
            this._renderedIndex = index;
            this._text.data = "" + index;
        }
        if (this._renderedDim != dim || this._renderedColor != color) {
            this._renderedDim = dim;
            if (selected) {
                this._label.setAttribute("fill", ColorConfig_1.ColorConfig.invertedText);
            }
            else {
                this._label.setAttribute("fill", color);
            }
        }
        if (this._renderedSelected != selected || this._renderedColor != color) {
            this._renderedSelected = selected;
            if (selected) {
                this._rect.setAttribute("fill", color);
                this._label.setAttribute("fill", ColorConfig_1.ColorConfig.invertedText);
            }
            else {
                this._rect.setAttribute("fill", (this._renderedIndex == 0) ? ColorConfig_1.ColorConfig.editorBackground : ColorConfig_1.ColorConfig.uiWidgetBackground);
                this._label.setAttribute("fill", color);
            }
        }
        this._renderedColor = color;
    };
    return Box;
})();
var TrackEditor = (function () {
    function TrackEditor(_doc) {
        var _this = this;
        this._doc = _doc;
        this.readonly = _boxContainer;
        this.SVGGElement = elements_strict_1.SVG.g();
        this.readonly = _playhead;
        this.SVGRectElement = elements_strict_1.SVG.rect({ fill: ColorConfig_1.ColorConfig.playhead, x: 0, y: 0, width: 4, height: 128 });
        this.readonly = _boxHighlight;
        this.SVGRectElement = elements_strict_1.SVG.rect({ fill: "none", stroke: ColorConfig_1.ColorConfig.hoverPreview, "stroke-width": 2, "pointer-events": "none", x: 1, y: 1, width: 30, height: 30 });
        this.readonly = _upHighlight;
        this.SVGPathElement = elements_strict_1.SVG.path({ fill: ColorConfig_1.ColorConfig.invertedText, stroke: ColorConfig_1.ColorConfig.invertedText, "stroke-width": 1, "pointer-events": "none" });
        this.readonly = _downHighlight;
        this.SVGPathElement = elements_strict_1.SVG.path({ fill: ColorConfig_1.ColorConfig.invertedText, stroke: ColorConfig_1.ColorConfig.invertedText, "stroke-width": 1, "pointer-events": "none" });
        this.readonly = _selectionRect;
        this.SVGRectElement = elements_strict_1.SVG.rect({ fill: ColorConfig_1.ColorConfig.boxSelectionFill, stroke: ColorConfig_1.ColorConfig.hoverPreview, "stroke-width": 2, "stroke-dasharray": "5, 3", "pointer-events": "none", visibility: "hidden", x: 1, y: 1, width: 62, height: 62 });
        this.readonly = _svg;
        this.SVGSVGElement = elements_strict_1.SVG.svg({ style: "background-color: " + ColorConfig_1.ColorConfig.editorBackground + "; position: absolute;", height: 128 }, this._boxContainer, this._selectionRect, this._boxHighlight, this._upHighlight, this._downHighlight, this._playhead);
        this.readonly = _select;
        this.HTMLSelectElement = elements_strict_1.HTML.select({ class: "trackSelectBox", style: "background: none; border: none; appearance: none; border-radius: initial; box-shadow: none; color: transparent; position: absolute; touch-action: none;" });
        this.readonly = container;
        this.HTMLElement = elements_strict_1.HTML.div({ class: "noSelection", style: "height: 128px; position: relative; overflow:hidden;" }, this._svg, this._select);
        this.readonly = _grid;
        this.Box = [][] = [];
        this._mouseX = 0;
        this._mouseY = 0;
        this._mouseStartBar = 0;
        this._mouseStartChannel = 0;
        this._mouseBar = 0;
        this._mouseChannel = 0;
        this._mouseOver = false;
        this._mousePressed = false;
        this._mouseDragging = false;
        this._barWidth = 32;
        this._channelHeight = 32;
        this._renderedChannelCount = 0;
        this._renderedBarCount = 0;
        this._renderedPatternCount = 0;
        this._renderedPlayhead = -1;
        this._renderedBarWidth = -1;
        this._renderedChannelHeight = -1;
        this._touchMode = EditorConfig_1.isMobile;
        this._whenSelectChanged = function () {
            _this._doc.selection.setPattern(_this._select.selectedIndex);
        };
        this._animatePlayhead = function (timestamp) {
            var playhead = (_this._barWidth * _this._doc.synth.playhead - 2);
            if (_this._renderedPlayhead != playhead) {
                _this._renderedPlayhead = playhead;
                _this._playhead.setAttribute("x", "" + playhead);
            }
            window.requestAnimationFrame(_this._animatePlayhead);
        };
        this._whenSelectPressed = function (event) {
            _this._mousePressed = true;
            _this._mouseDragging = true;
            _this._updateSelectPos(event);
            _this._mouseStartBar = _this._mouseBar;
            _this._mouseStartChannel = _this._mouseChannel;
        };
        this._whenSelectMoved = function (event) {
            _this._updateSelectPos(event);
            if (_this._mouseStartBar != _this._mouseBar || _this._mouseStartChannel != _this._mouseChannel) {
                // if the touch has started dragging, cancel opening the select menu.
                event.preventDefault();
            }
            if (_this._mousePressed)
                _this._dragBoxSelection();
            _this._updatePreview();
        };
        this._whenSelectReleased = function (event) {
            _this._mousePressed = false;
            _this._mouseDragging = false;
            _this._updatePreview();
        };
        this._whenMouseOver = function (event) {
            if (_this._mouseOver)
                return;
            _this._mouseOver = true;
        };
        this._whenMouseOut = function (event) {
            if (!_this._mouseOver)
                return;
            _this._mouseOver = false;
        };
        this._whenMousePressed = function (event) {
            event.preventDefault();
            _this._mousePressed = true;
            _this._updateMousePos(event);
            _this._mouseStartBar = _this._mouseBar;
            _this._mouseStartChannel = _this._mouseChannel;
            if (event.shiftKey) {
                _this._mouseDragging = true;
                _this._doc.selection.setTrackSelection(_this._doc.selection.boxSelectionX0, _this._mouseBar, _this._doc.selection.boxSelectionY0, _this._mouseChannel);
                _this._doc.selection.selectionUpdated();
            }
            else {
                _this._mouseDragging = false;
                if (_this._doc.channel != _this._mouseChannel || _this._doc.bar != _this._mouseBar) {
                    _this._doc.selection.setChannelBar(_this._mouseChannel, _this._mouseBar);
                    _this._mouseDragging = true;
                }
                _this._doc.selection.resetBoxSelection();
            }
        };
        this._whenMouseMoved = function (event) {
            _this._updateMousePos(event);
            if (_this._mousePressed) {
                if (_this._mouseStartBar != _this._mouseBar || _this._mouseStartChannel != _this._mouseChannel) {
                    _this._mouseDragging = true;
                }
                _this._dragBoxSelection();
            }
            _this._updatePreview();
        };
        this._whenMouseReleased = function (event) {
            if (_this._mousePressed && !_this._mouseDragging) {
                if (_this._doc.channel == _this._mouseChannel && _this._doc.bar == _this._mouseBar) {
                    var up = (_this._mouseY % _this._channelHeight) < _this._channelHeight / 2;
                    var patternCount = _this._doc.song.patternsPerChannel;
                    _this._doc.selection.setPattern((_this._doc.song.channels[_this._mouseChannel].bars[_this._mouseBar] + (up ? 1 : patternCount)) % (patternCount + 1));
                }
            }
            _this._mousePressed = false;
            _this._mouseDragging = false;
            _this._updatePreview();
        };
        window.requestAnimationFrame(this._animatePlayhead);
        this._svg.addEventListener("mousedown", this._whenMousePressed);
        document.addEventListener("mousemove", this._whenMouseMoved);
        document.addEventListener("mouseup", this._whenMouseReleased);
        this._svg.addEventListener("mouseover", this._whenMouseOver);
        this._svg.addEventListener("mouseout", this._whenMouseOut);
        this._select.addEventListener("change", this._whenSelectChanged);
        this._select.addEventListener("touchstart", this._whenSelectPressed);
        this._select.addEventListener("touchmove", this._whenSelectMoved);
        this._select.addEventListener("touchend", this._whenSelectReleased);
        this._select.addEventListener("touchcancel", this._whenSelectReleased);
        var determinedCursorType = false;
        document.addEventListener("mousedown", function () {
            if (!determinedCursorType) {
                _this._touchMode = false;
                _this._updatePreview();
            }
            determinedCursorType = true;
        }, true);
        document.addEventListener("touchstart", function () {
            if (!determinedCursorType) {
                _this._touchMode = true;
                _this._updatePreview();
            }
            determinedCursorType = true;
        }, true);
    }
    TrackEditor.prototype._dragBoxSelection = function () {
        this._doc.selection.setTrackSelection(this._doc.selection.boxSelectionX0, this._mouseBar, this._doc.selection.boxSelectionY0, this._mouseChannel);
        this._doc.selection.selectionUpdated();
    };
    TrackEditor.prototype._updateSelectPos = function (event) {
        var boundingRect = this._svg.getBoundingClientRect();
        this._mouseX = event.touches[0].clientX - boundingRect.left;
        this._mouseY = event.touches[0].clientY - boundingRect.top;
        if (isNaN(this._mouseX))
            this._mouseX = 0;
        if (isNaN(this._mouseY))
            this._mouseY = 0;
        this._mouseBar = Math.floor(Math.min(this._doc.song.barCount - 1, Math.max(0, this._mouseX / this._barWidth)));
        this._mouseChannel = Math.floor(Math.min(this._doc.song.getChannelCount() - 1, Math.max(0, this._mouseY / this._channelHeight)));
    };
    TrackEditor.prototype._updateMousePos = function (event) {
        var boundingRect = this._svg.getBoundingClientRect();
        this._mouseX = (event.clientX || event.pageX) - boundingRect.left;
        this._mouseY = (event.clientY || event.pageY) - boundingRect.top;
        this._mouseBar = Math.floor(Math.min(this._doc.song.barCount - 1, Math.max(0, this._mouseX / this._barWidth)));
        this._mouseChannel = Math.floor(Math.min(this._doc.song.getChannelCount() - 1, Math.max(0, this._mouseY / this._channelHeight)));
    };
    TrackEditor.prototype._updatePreview = function () {
        var channel = this._mouseChannel;
        var bar = this._mouseBar;
        if (this._touchMode) {
            bar = this._doc.bar;
            channel = this._doc.channel;
        }
        var selected = (bar == this._doc.bar && channel == this._doc.channel);
        if (this._mouseOver && !this._mousePressed && !selected) {
            this._boxHighlight.setAttribute("x", "" + (1 + this._barWidth * bar));
            this._boxHighlight.setAttribute("y", "" + (1 + (this._channelHeight * channel)));
            this._boxHighlight.setAttribute("height", "" + (this._channelHeight - 2));
            this._boxHighlight.setAttribute("width", "" + (this._barWidth - 2));
            this._boxHighlight.style.visibility = "visible";
        }
        else {
            this._boxHighlight.style.visibility = "hidden";
        }
        if ((this._mouseOver || this._touchMode) && selected) {
            var up = (this._mouseY % this._channelHeight) < this._channelHeight / 2;
            var center = this._barWidth * (bar + 0.8);
            var middle = this._channelHeight * (channel + 0.5);
            var base = this._channelHeight * 0.1;
            var tip = this._channelHeight * 0.4;
            var width = this._channelHeight * 0.175;
            this._upHighlight.setAttribute("fill", up && !this._touchMode ? ColorConfig_1.ColorConfig.hoverPreview : ColorConfig_1.ColorConfig.invertedText);
            this._downHighlight.setAttribute("fill", !up && !this._touchMode ? ColorConfig_1.ColorConfig.hoverPreview : ColorConfig_1.ColorConfig.invertedText);
            this._upHighlight.setAttribute("d", "M " + center + " " + (middle - tip) + " L " + (center + width) + " " + (middle - base) + " L " + (center - width) + " " + (middle - base) + " z");
            this._downHighlight.setAttribute("d", "M " + center + " " + (middle + tip) + " L " + (center + width) + " " + (middle + base) + " L " + (center - width) + " " + (middle + base) + " z");
            this._upHighlight.style.visibility = "visible";
            this._downHighlight.style.visibility = "visible";
        }
        else {
            this._upHighlight.style.visibility = "hidden";
            this._downHighlight.style.visibility = "hidden";
        }
        this._select.style.left = (this._barWidth * this._doc.bar) + "px";
        this._select.style.width = this._barWidth + "px";
        this._select.style.top = (this._channelHeight * this._doc.channel) + "px";
        this._select.style.height = this._channelHeight + "px";
        var patternCount = this._doc.song.patternsPerChannel + 1;
        for (var i = this._renderedPatternCount; i < patternCount; i++) {
            this._select.appendChild(elements_strict_1.HTML.option({ value: i }, i));
        }
        for (var i = patternCount; i < this._renderedPatternCount; i++) {
            this._select.removeChild(this._select.lastChild);
        }
        this._renderedPatternCount = patternCount;
        var selectedPattern = this._doc.song.channels[this._doc.channel].bars[this._doc.bar];
        if (this._select.selectedIndex != selectedPattern)
            this._select.selectedIndex = selectedPattern;
    };
    TrackEditor.prototype.render = function () {
        this._barWidth = this._doc.getBarWidth();
        this._channelHeight = this._doc.getChannelHeight();
        if (this._renderedChannelCount != this._doc.song.getChannelCount()) {
            for (var y = this._renderedChannelCount; y < this._doc.song.getChannelCount(); y++) {
                this._grid[y] = [];
                for (var x = 0; x < this._renderedBarCount; x++) {
                    var box = new Box(y, x, y, ColorConfig_1.ColorConfig.getChannelColor(this._doc.song, y).secondaryChannel);
                    box.setSize(this._barWidth, this._channelHeight);
                    this._boxContainer.appendChild(box.container);
                    this._grid[y][x] = box;
                }
            }
            for (var y = this._doc.song.getChannelCount(); y < this._renderedChannelCount; y++) {
                for (var x = 0; x < this._renderedBarCount; x++) {
                    this._boxContainer.removeChild(this._grid[y][x].container);
                }
            }
            this._grid.length = this._doc.song.getChannelCount();
            this._mousePressed = false;
        }
        if (this._renderedBarCount != this._doc.song.barCount) {
            for (var y = 0; y < this._doc.song.getChannelCount(); y++) {
                for (var x = this._renderedBarCount; x < this._doc.song.barCount; x++) {
                    var box = new Box(y, x, y, ColorConfig_1.ColorConfig.getChannelColor(this._doc.song, y).secondaryChannel);
                    box.setSize(this._barWidth, this._channelHeight);
                    this._boxContainer.appendChild(box.container);
                    this._grid[y][x] = box;
                }
                for (var x = this._doc.song.barCount; x < this._renderedBarCount; x++) {
                    this._boxContainer.removeChild(this._grid[y][x].container);
                }
                this._grid[y].length = this._doc.song.barCount;
            }
        }
        if (this._renderedBarCount != this._doc.song.barCount || this._renderedBarWidth != this._barWidth) {
            this._renderedBarCount = this._doc.song.barCount;
            var editorWidth = this._barWidth * this._doc.song.barCount;
            this.container.style.width = editorWidth + "px";
            this._svg.setAttribute("width", editorWidth + "");
            this._mousePressed = false;
        }
        if (this._renderedChannelHeight != this._channelHeight || this._renderedBarWidth != this._barWidth) {
            this._renderedBarWidth = this._barWidth;
            for (var y = 0; y < this._doc.song.getChannelCount(); y++) {
                for (var x = 0; x < this._renderedBarCount; x++) {
                    this._grid[y][x].setSize(this._barWidth, this._channelHeight);
                }
            }
            this._mousePressed = false;
        }
        if (this._renderedChannelHeight != this._channelHeight || this._renderedChannelCount != this._doc.song.getChannelCount()) {
            this._renderedChannelHeight = this._channelHeight;
            this._renderedChannelCount = this._doc.song.getChannelCount();
            var editorHeight = this._doc.song.getChannelCount() * this._channelHeight;
            this._svg.setAttribute("height", "" + editorHeight);
            this._playhead.setAttribute("height", "" + editorHeight);
            this.container.style.height = editorHeight + "px";
        }
        for (var j = 0; j < this._doc.song.getChannelCount(); j++) {
            for (var i = 0; i < this._renderedBarCount; i++) {
                var pattern = null = this._doc.song.getPattern(j, i);
                var selected = (i == this._doc.bar && j == this._doc.channel);
                var dim = (pattern == null || pattern.notes.length == 0);
                var box = this._grid[j][i];
                if (i < this._doc.song.barCount) {
                    var colors = ColorConfig_1.ColorConfig.getChannelColor(this._doc.song, j);
                    box.setIndex(this._doc.song.channels[j].bars[i], dim, selected, dim && !selected ? colors.secondaryChannel : colors.primaryChannel);
                    box.container.style.visibility = "visible";
                }
                else {
                    box.container.style.visibility = "hidden";
                }
            }
        }
        this._select.style.display = this._touchMode ? "" : "none";
        if (this._doc.selection.boxSelectionWidth > 1 || this._doc.selection.boxSelectionHeight > 1) {
            // TODO: This causes the selection rectangle to repaint every time the
            // editor renders and the selection is visible. Check if anything changed
            // before overwriting the attributes?
            this._selectionRect.setAttribute("x", String(this._barWidth * this._doc.selection.boxSelectionBar + 1));
            this._selectionRect.setAttribute("y", String(this._channelHeight * this._doc.selection.boxSelectionChannel + 1));
            this._selectionRect.setAttribute("width", String(this._barWidth * this._doc.selection.boxSelectionWidth - 2));
            this._selectionRect.setAttribute("height", String(this._channelHeight * this._doc.selection.boxSelectionHeight - 2));
            this._selectionRect.setAttribute("visibility", "visible");
        }
        else {
            this._selectionRect.setAttribute("visibility", "hidden");
        }
        this._updatePreview();
    };
    return TrackEditor;
})();
exports.TrackEditor = TrackEditor;
//}
