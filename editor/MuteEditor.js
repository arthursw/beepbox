// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
//namespace beepbox {
var MuteEditor = (function () {
    function MuteEditor(_doc) {
        var _this = this;
        this._doc = _doc;
        this.readonly = container;
        this.HTMLElement = elements_strict_1.HTML.div({ class: "muteEditor" });
        this.readonly = _buttons;
        this.HTMLButtonElement = (_a = [], _a);
        this._editorHeight = 128;
        this._renderedChannelCount = 0;
        this._renderedChannelHeight = -1;
        this._onClick = function (event) {
            var index = _this._buttons.indexOf(event.target);
            if (index == -1)
                return;
            _this._doc.song.channels[index].muted = !_this._doc.song.channels[index].muted;
            _this._doc.notifier.changed();
        };
        this.container.addEventListener("click", this._onClick);
        var _a;
    }
    MuteEditor.prototype.render = function () {
        if (!this._doc.enableChannelMuting)
            return;
        var channelHeight = this._doc.getChannelHeight();
        if (this._renderedChannelCount != this._doc.song.getChannelCount()) {
            for (var y = this._renderedChannelCount; y < this._doc.song.getChannelCount(); y++) {
                var muteButton = elements_strict_1.HTML.button({ class: "mute-button", style: "height: " + (channelHeight - 4) + "px; margin: 2px;" });
                this.container.appendChild(muteButton);
                this._buttons[y] = muteButton;
            }
            for (var y = this._doc.song.getChannelCount(); y < this._renderedChannelCount; y++) {
                this.container.removeChild(this._buttons[y]);
            }
            this._buttons.length = this._doc.song.getChannelCount();
        }
        for (var y = 0; y < this._doc.song.getChannelCount(); y++) {
            if (this._doc.song.channels[y].muted) {
                this._buttons[y].classList.add("muted");
            }
            else {
                this._buttons[y].classList.remove("muted");
            }
        }
        if (this._renderedChannelHeight != channelHeight) {
            for (var y = 0; y < this._doc.song.getChannelCount(); y++) {
                this._buttons[y].style.height = (channelHeight - 4) + "px";
            }
        }
        if (this._renderedChannelHeight != channelHeight || this._renderedChannelCount != this._doc.song.getChannelCount()) {
            this._renderedChannelHeight = channelHeight;
            this._renderedChannelCount = this._doc.song.getChannelCount();
            this._editorHeight = this._doc.song.getChannelCount() * channelHeight;
            this.container.style.height = this._editorHeight + "px";
        }
    };
    return MuteEditor;
})();
exports.MuteEditor = MuteEditor;
//}
