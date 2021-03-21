// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
var changes_1 = require("./changes");
var ColorConfig_1 = require("./ColorConfig");
var LoopEditor = (function () {
    function LoopEditor(_doc) {
        var _this = this;
        this._doc = _doc;
        this.readonly = _editorHeight;
        this.number = 20;
        this.readonly = _startMode;
        this.number = 0;
        this.readonly = _endMode;
        this.number = 1;
        this.readonly = _bothMode;
        this.number = 2;
        this.readonly = _loop;
        this.SVGPathElement = elements_strict_1.SVG.path({ fill: "none", stroke: ColorConfig_1.ColorConfig.loopAccent, "stroke-width": 4 });
        this.readonly = _highlight;
        this.SVGPathElement = elements_strict_1.SVG.path({ fill: ColorConfig_1.ColorConfig.hoverPreview, "pointer-events": "none" });
        this.readonly = _svg;
        this.SVGSVGElement = elements_strict_1.SVG.svg({ style: "background-color: " + ColorConfig_1.ColorConfig.editorBackground + "; touch-action: pan-y; position: absolute;", height: this._editorHeight }, this._loop, this._highlight);
        this.readonly = container;
        this.HTMLElement = elements_strict_1.HTML.div({ style: "height: 20px; position: relative; margin: 5px 0;" }, this._svg);
        this._barWidth = 32;
        this._change = null = null;
        this._cursor = { startBar: -1, mode: -1 };
        this._mouseX = 0;
        //private _mouseY: number = 0;
        this._clientStartX = 0;
        this._clientStartY = 0;
        this._startedScrolling = false;
        this._draggingHorizontally = false;
        this._mouseDown = false;
        this._mouseOver = false;
        this._renderedLoopStart = -1;
        this._renderedLoopStop = -1;
        this._renderedBarCount = 0;
        this._renderedBarWidth = -1;
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
            _this._mouseX = (event.clientX || event.pageX) - boundingRect.left;
            //this._mouseY = (event.clientY || event.pageY) - boundingRect.top;
            _this._updateCursorStatus();
            _this._updatePreview();
            _this._whenMouseMoved(event);
        };
        this._whenTouchPressed = function (event) {
            //event.preventDefault();
            _this._mouseDown = true;
            var boundingRect = _this._svg.getBoundingClientRect();
            _this._mouseX = event.touches[0].clientX - boundingRect.left;
            //this._mouseY = event.touches[0].clientY - boundingRect.top;
            _this._updateCursorStatus();
            _this._updatePreview();
            //this._whenTouchMoved(event);
            _this._clientStartX = event.touches[0].clientX;
            _this._clientStartY = event.touches[0].clientY;
            _this._draggingHorizontally = false;
            _this._startedScrolling = false;
        };
        this._whenMouseMoved = function (event) {
            var boundingRect = _this._svg.getBoundingClientRect();
            _this._mouseX = (event.clientX || event.pageX) - boundingRect.left;
            //this._mouseY = (event.clientY || event.pageY) - boundingRect.top;
            _this._whenCursorMoved();
        };
        this._whenTouchMoved = function (event) {
            if (!_this._mouseDown)
                return;
            var boundingRect = _this._svg.getBoundingClientRect();
            _this._mouseX = event.touches[0].clientX - boundingRect.left;
            //this._mouseY = event.touches[0].clientY - boundingRect.top;
            if (!_this._draggingHorizontally && !_this._startedScrolling) {
                if (Math.abs(event.touches[0].clientY - _this._clientStartY) > 10) {
                    _this._startedScrolling = true;
                }
                else if (Math.abs(event.touches[0].clientX - _this._clientStartX) > 10) {
                    _this._draggingHorizontally = true;
                }
            }
            if (_this._draggingHorizontally) {
                _this._whenCursorMoved();
                event.preventDefault();
            }
        };
        this._whenTouchReleased = function (event) {
            event.preventDefault();
            if (!_this._startedScrolling) {
                _this._whenCursorMoved();
                _this._mouseOver = false;
                _this._whenCursorReleased(event);
                _this._updatePreview();
            }
            _this._mouseDown = false;
        };
        this._whenCursorReleased = function (event) {
            if (_this._change != null)
                _this._doc.record(_this._change);
            _this._change = null;
            _this._mouseDown = false;
            _this._updateCursorStatus();
            _this._render();
        };
        this._documentChanged = function () {
            _this._render();
        };
        this._updateCursorStatus();
        this._render();
        this._doc.notifier.watch(this._documentChanged);
        this.container.addEventListener("mousedown", this._whenMousePressed);
        document.addEventListener("mousemove", this._whenMouseMoved);
        document.addEventListener("mouseup", this._whenCursorReleased);
        this.container.addEventListener("mouseover", this._whenMouseOver);
        this.container.addEventListener("mouseout", this._whenMouseOut);
        this.container.addEventListener("touchstart", this._whenTouchPressed);
        this.container.addEventListener("touchmove", this._whenTouchMoved);
        this.container.addEventListener("touchend", this._whenTouchReleased);
        this.container.addEventListener("touchcancel", this._whenTouchReleased);
    }
    LoopEditor.prototype._updateCursorStatus = function () {
        var bar = this._mouseX / this._barWidth;
        this._cursor.startBar = bar;
        if (bar > this._doc.song.loopStart - 0.25 && bar < this._doc.song.loopStart + this._doc.song.loopLength + 0.25) {
            if (bar - this._doc.song.loopStart < this._doc.song.loopLength * 0.5) {
                this._cursor.mode = this._startMode;
            }
            else {
                this._cursor.mode = this._endMode;
            }
        }
        else {
            this._cursor.mode = this._bothMode;
        }
    };
    LoopEditor.prototype._findEndPoints = function (middle) {
        var start = Math.round(middle - this._doc.song.loopLength / 2);
        var end = start + this._doc.song.loopLength;
        if (start < 0) {
            end -= start;
            start = 0;
        }
        if (end > this._doc.song.barCount) {
            start -= end - this._doc.song.barCount;
            end = this._doc.song.barCount;
        }
        return { start: start, length: end - start };
    };
    LoopEditor.prototype._whenCursorMoved = function () {
        if (this._mouseDown) {
            var oldStart = this._doc.song.loopStart;
            var oldEnd = this._doc.song.loopStart + this._doc.song.loopLength;
            if (this._change != null && this._doc.lastChangeWas(this._change)) {
                oldStart = this._change.oldStart;
                oldEnd = oldStart + this._change.oldLength;
            }
            var bar = this._mouseX / this._barWidth;
            var start;
            var end;
            var temp;
            if (this._cursor.mode == this._startMode) {
                start = oldStart + Math.round(bar - this._cursor.startBar);
                end = oldEnd;
                if (start < 0)
                    start = 0;
                if (start >= this._doc.song.barCount)
                    start = this._doc.song.barCount;
                if (start == end) {
                    start = end - 1;
                }
                else if (start > end) {
                    temp = start;
                    start = end;
                    end = temp;
                }
                this._change = new changes_1.ChangeLoop(this._doc, oldStart, oldEnd - oldStart, start, end - start);
            }
            else if (this._cursor.mode == this._endMode) {
                start = oldStart;
                end = oldEnd + Math.round(bar - this._cursor.startBar);
                if (end < 0)
                    end = 0;
                if (end >= this._doc.song.barCount)
                    end = this._doc.song.barCount;
                if (end == start) {
                    end = start + 1;
                }
                else if (end < start) {
                    temp = start;
                    start = end;
                    end = temp;
                }
                this._change = new changes_1.ChangeLoop(this._doc, oldStart, oldEnd - oldStart, start, end - start);
            }
            else if (this._cursor.mode == this._bothMode) {
                var endPoints = this._findEndPoints(bar);
                this._change = new changes_1.ChangeLoop(this._doc, oldStart, oldEnd - oldStart, endPoints.start, endPoints.length);
            }
            this._doc.synth.jumpIntoLoop();
            if (this._doc.autoFollow) {
                new changes_1.ChangeChannelBar(this._doc, this._doc.channel, Math.floor(this._doc.synth.playhead), true);
            }
            this._doc.setProspectiveChange(this._change);
        }
        else {
            this._updateCursorStatus();
            this._updatePreview();
        }
    };
    LoopEditor.prototype._updatePreview = function () {
        var showHighlight = this._mouseOver && !this._mouseDown;
        this._highlight.style.visibility = showHighlight ? "visible" : "hidden";
        if (showHighlight) {
            var radius = this._editorHeight / 2;
            var highlightStart = (this._doc.song.loopStart) * this._barWidth;
            var highlightStop = (this._doc.song.loopStart + this._doc.song.loopLength) * this._barWidth;
            if (this._cursor.mode == this._startMode) {
                highlightStop = (this._doc.song.loopStart) * this._barWidth + radius * 2;
            }
            else if (this._cursor.mode == this._endMode) {
                highlightStart = (this._doc.song.loopStart + this._doc.song.loopLength) * this._barWidth - radius * 2;
            }
            else {
                var endPoints = this._findEndPoints(this._cursor.startBar);
                highlightStart = (endPoints.start) * this._barWidth;
                highlightStop = (endPoints.start + endPoints.length) * this._barWidth;
            }
            this._highlight.setAttribute("d", ("M " + (highlightStart + radius) + " " + 4 + " ") +
                ("L " + (highlightStop - radius) + " " + 4 + " ") +
                ("A " + (radius - 4) + " " + (radius - 4) + " " + 0 + " " + 0 + " " + 1 + " " + (highlightStop - radius) + " " + (this._editorHeight - 4) + " ") +
                ("L " + (highlightStart + radius) + " " + (this._editorHeight - 4) + " ") +
                ("A " + (radius - 4) + " " + (radius - 4) + " " + 0 + " " + 0 + " " + 1 + " " + (highlightStart + radius) + " " + 4 + " ") +
                "z");
        }
    };
    LoopEditor.prototype._render = function () {
        this._barWidth = this._doc.getBarWidth();
        var radius = this._editorHeight / 2;
        var loopStart = (this._doc.song.loopStart) * this._barWidth;
        var loopStop = (this._doc.song.loopStart + this._doc.song.loopLength) * this._barWidth;
        if (this._renderedBarCount != this._doc.song.barCount || this._renderedBarWidth != this._barWidth) {
            this._renderedBarCount = this._doc.song.barCount;
            this._renderedBarWidth = this._barWidth;
            var editorWidth = this._barWidth * this._doc.song.barCount;
            this.container.style.width = editorWidth + "px";
            this._svg.setAttribute("width", editorWidth + "");
        }
        if (this._renderedLoopStart != loopStart || this._renderedLoopStop != loopStop) {
            this._renderedLoopStart = loopStart;
            this._renderedLoopStop = loopStop;
            this._loop.setAttribute("d", ("M " + (loopStart + radius) + " " + 2 + " ") +
                ("L " + (loopStop - radius) + " " + 2 + " ") +
                ("A " + (radius - 2) + " " + (radius - 2) + " " + 0 + " " + 0 + " " + 1 + " " + (loopStop - radius) + " " + (this._editorHeight - 2) + " ") +
                ("L " + (loopStart + radius) + " " + (this._editorHeight - 2) + " ") +
                ("A " + (radius - 2) + " " + (radius - 2) + " " + 0 + " " + 0 + " " + 1 + " " + (loopStart + radius) + " " + 2 + " ") +
                "z");
        }
        this._updatePreview();
    };
    return LoopEditor;
})();
exports.LoopEditor = LoopEditor;
//}
