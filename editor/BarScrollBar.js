// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
var ColorConfig_1 = require("./ColorConfig");
//namespace beepbox {
var BarScrollBar = (function () {
    function BarScrollBar(_doc, _trackContainer) {
        var _this = this;
        this._doc = _doc;
        this._trackContainer = _trackContainer;
        this.readonly = _editorWidth;
        this.number = 512;
        this.readonly = _editorHeight;
        this.number = 20;
        this.readonly = _notches;
        this.SVGSVGElement = elements_strict_1.SVG.svg({ "pointer-events": "none" });
        this.readonly = _handle;
        this.SVGRectElement = elements_strict_1.SVG.rect({ fill: ColorConfig_1.ColorConfig.uiWidgetBackground, x: 0, y: 2, width: 10, height: this._editorHeight - 4 });
        this.readonly = _handleHighlight;
        this.SVGRectElement = elements_strict_1.SVG.rect({ fill: "none", stroke: ColorConfig_1.ColorConfig.hoverPreview, "stroke-width": 2, "pointer-events": "none", x: 0, y: 1, width: 10, height: this._editorHeight - 2 });
        this.readonly = _leftHighlight;
        this.SVGPathElement = elements_strict_1.SVG.path({ fill: ColorConfig_1.ColorConfig.hoverPreview, "pointer-events": "none" });
        this.readonly = _rightHighlight;
        this.SVGPathElement = elements_strict_1.SVG.path({ fill: ColorConfig_1.ColorConfig.hoverPreview, "pointer-events": "none" });
        this.readonly = _svg;
        this.SVGSVGElement = elements_strict_1.SVG.svg({ style: "background-color: " + ColorConfig_1.ColorConfig.editorBackground + "; touch-action: pan-y; position: absolute;", width: this._editorWidth, height: this._editorHeight }, this._notches, this._handle, this._handleHighlight, this._leftHighlight, this._rightHighlight);
        this.readonly = container;
        this.HTMLElement = elements_strict_1.HTML.div({ class: "barScrollBar", style: "width: 512px; height: 20px; overflow: hidden; position: relative;" }, this._svg);
        this._mouseX = 0;
        //private _mouseY: number = 0;
        this._mouseDown = false;
        this._mouseOver = false;
        this._dragging = false;
        this._renderedNotchCount = -1;
        this._renderedBarPos = -1;
        this._onScroll = function (event) {
            _this._doc.barScrollPos = (_this._trackContainer.scrollLeft / _this._doc.getBarWidth());
        };
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
            _this._updatePreview();
            if (_this._mouseX >= _this._doc.barScrollPos * _this._notchSpace && _this._mouseX <= (_this._doc.barScrollPos + _this._doc.trackVisibleBars) * _this._notchSpace) {
                _this._dragging = true;
                _this._dragStart = _this._mouseX;
            }
        };
        this._whenTouchPressed = function (event) {
            event.preventDefault();
            _this._mouseDown = true;
            var boundingRect = _this._svg.getBoundingClientRect();
            _this._mouseX = event.touches[0].clientX - boundingRect.left;
            //this._mouseY = event.touches[0].clientY - boundingRect.top;
            _this._updatePreview();
            if (_this._mouseX >= _this._doc.barScrollPos * _this._notchSpace && _this._mouseX <= (_this._doc.barScrollPos + _this._doc.trackVisibleBars) * _this._notchSpace) {
                _this._dragging = true;
                _this._dragStart = _this._mouseX;
            }
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
            event.preventDefault();
            var boundingRect = _this._svg.getBoundingClientRect();
            _this._mouseX = event.touches[0].clientX - boundingRect.left;
            //this._mouseY = event.touches[0].clientY - boundingRect.top;
            _this._whenCursorMoved();
        };
        this._whenCursorReleased = function (event) {
            if (!_this._dragging && _this._mouseDown) {
                if (_this._mouseX < (_this._doc.barScrollPos + 8) * _this._notchSpace) {
                    if (_this._doc.barScrollPos > 0)
                        _this._doc.barScrollPos--;
                    _this._doc.notifier.changed();
                }
                else {
                    if (_this._doc.barScrollPos < _this._doc.song.barCount - _this._doc.trackVisibleBars)
                        _this._doc.barScrollPos++;
                    _this._doc.notifier.changed();
                }
            }
            _this._mouseDown = false;
            _this._dragging = false;
            _this._updatePreview();
        };
        var center = this._editorHeight * 0.5;
        var base = 20;
        var tip = 9;
        var arrowHeight = 6;
        this._leftHighlight.setAttribute("d", "M " + tip + " " + center + " L " + base + " " + (center + arrowHeight) + " L " + base + " " + (center - arrowHeight) + " z");
        this._rightHighlight.setAttribute("d", "M " + (this._editorWidth - tip) + " " + center + " L " + (this._editorWidth - base) + " " + (center + arrowHeight) + " L " + (this._editorWidth - base) + " " + (center - arrowHeight) + " z");
        this.container.addEventListener("mousedown", this._whenMousePressed);
        document.addEventListener("mousemove", this._whenMouseMoved);
        document.addEventListener("mouseup", this._whenCursorReleased);
        this.container.addEventListener("mouseover", this._whenMouseOver);
        this.container.addEventListener("mouseout", this._whenMouseOut);
        this.container.addEventListener("touchstart", this._whenTouchPressed);
        this.container.addEventListener("touchmove", this._whenTouchMoved);
        this.container.addEventListener("touchend", this._whenCursorReleased);
        this.container.addEventListener("touchcancel", this._whenCursorReleased);
        // Sorry, bypassing typescript type safety on this function because I want to use the new "passive" option.
        //this._trackContainer.addEventListener("scroll", this._onScroll, {capture: false, passive: true});
        this._trackContainer.addEventListener("scroll", this._onScroll, { capture: false, passive: true });
    }
    BarScrollBar.prototype._whenCursorMoved = function () {
        if (this._dragging) {
            while (this._mouseX - this._dragStart < -this._notchSpace * 0.5) {
                if (this._doc.barScrollPos > 0) {
                    this._doc.barScrollPos--;
                    this._dragStart -= this._notchSpace;
                    this._doc.notifier.changed();
                }
                else {
                    break;
                }
            }
            while (this._mouseX - this._dragStart > this._notchSpace * 0.5) {
                if (this._doc.barScrollPos < this._doc.song.barCount - this._doc.trackVisibleBars) {
                    this._doc.barScrollPos++;
                    this._dragStart += this._notchSpace;
                    this._doc.notifier.changed();
                }
                else {
                    break;
                }
            }
        }
        if (this._mouseOver)
            this._updatePreview();
    };
    BarScrollBar.prototype._updatePreview = function () {
        var showHighlight = this._mouseOver && !this._mouseDown;
        var showleftHighlight = false;
        var showRightHighlight = false;
        var showHandleHighlight = false;
        if (showHighlight) {
            if (this._mouseX < this._doc.barScrollPos * this._notchSpace) {
                showleftHighlight = true;
            }
            else if (this._mouseX > (this._doc.barScrollPos + this._doc.trackVisibleBars) * this._notchSpace) {
                showRightHighlight = true;
            }
            else {
                showHandleHighlight = true;
            }
        }
        this._leftHighlight.style.visibility = showleftHighlight ? "visible" : "hidden";
        this._rightHighlight.style.visibility = showRightHighlight ? "visible" : "hidden";
        this._handleHighlight.style.visibility = showHandleHighlight ? "visible" : "hidden";
    };
    BarScrollBar.prototype.render = function () {
        this._notchSpace = (this._editorWidth - 1) / Math.max(this._doc.trackVisibleBars, this._doc.song.barCount);
        var resized = this._renderedNotchCount != this._doc.song.barCount;
        if (resized) {
            this._renderedNotchCount = this._doc.song.barCount;
            while (this._notches.firstChild)
                this._notches.removeChild(this._notches.firstChild);
            for (var i = 0; i <= this._doc.song.barCount; i++) {
                var lineHeight = (i % 16 == 0) ? 0 : ((i % 4 == 0) ? this._editorHeight / 8 : this._editorHeight / 3);
                this._notches.appendChild(elements_strict_1.SVG.rect({ fill: ColorConfig_1.ColorConfig.uiWidgetBackground, x: i * this._notchSpace - 1, y: lineHeight, width: 2, height: this._editorHeight - lineHeight * 2 }));
            }
        }
        if (resized || this._renderedBarPos != this._doc.barScrollPos) {
            this._renderedBarPos = this._doc.barScrollPos;
            this._handle.setAttribute("x", "" + (this._notchSpace * this._doc.barScrollPos));
            this._handle.setAttribute("width", "" + (this._notchSpace * this._doc.trackVisibleBars));
            this._handleHighlight.setAttribute("x", "" + (this._notchSpace * this._doc.barScrollPos));
            this._handleHighlight.setAttribute("width", "" + (this._notchSpace * this._doc.trackVisibleBars));
        }
        this._updatePreview();
        this._trackContainer.scrollLeft = this._doc.barScrollPos * this._doc.getBarWidth();
    };
    return BarScrollBar;
})();
exports.BarScrollBar = BarScrollBar;
//}
