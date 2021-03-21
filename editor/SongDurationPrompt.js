// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var SynthConfig_1 = require("../synth/SynthConfig");
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
var Change_1 = require("./Change");
var changes_1 = require("./changes");
var ColorConfig_1 = require("./ColorConfig");
//namespace beepbox {
var button = elements_strict_1.HTML.button, div = elements_strict_1.HTML.div, span = elements_strict_1.HTML.span, h2 = elements_strict_1.HTML.h2, input = elements_strict_1.HTML.input, br = elements_strict_1.HTML.br, select = elements_strict_1.HTML.select, option = elements_strict_1.HTML.option;
var SongDurationPrompt = (function () {
    function SongDurationPrompt(_doc) {
        var _this = this;
        this._doc = _doc;
        this.readonly = _barsStepper;
        this.HTMLInputElement = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "1" });
        this.readonly = _positionSelect;
        this.HTMLSelectElement = select({ style: "width: 100%;" }, option({ value: "end" }, "Apply change at end of song."), option({ value: "beginning" }, "Apply change at beginning of song."));
        this.readonly = _cancelButton;
        this.HTMLButtonElement = button({ class: "cancelButton" });
        this.readonly = _okayButton;
        this.HTMLButtonElement = button({ class: "okayButton", style: "width:45%;" }, "Okay");
        this.readonly = container;
        this.HTMLDivElement = div({ class: "prompt noSelection", style: "width: 250px;" }, h2("Song Length"), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, div({ style: "display: inline-block; text-align: right;" }, "Bars per song:", br(), span({ style: "font-size: smaller; color: " + ColorConfig_1.ColorConfig.secondaryText + ";" }, "(Multiples of 4 are recommended)")), this._barsStepper), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, div({ class: "selectContainer", style: "width: 100%;" }, this._positionSelect)), div({ style: "display: flex; flex-direction: row-reverse; justify-content: space-between;" }, this._okayButton), this._cancelButton);
        this._close = function () {
            _this._doc.undo();
        };
        this.cleanUp = function () {
            _this._okayButton.removeEventListener("click", _this._saveChanges);
            _this._cancelButton.removeEventListener("click", _this._close);
            _this._barsStepper.removeEventListener("keypress", SongDurationPrompt._validateKey);
            _this._barsStepper.removeEventListener("blur", SongDurationPrompt._validateNumber);
            _this.container.removeEventListener("keydown", _this._whenKeyPressed);
        };
        this._whenKeyPressed = function (event) {
            if (event.target.tagName != "BUTTON" && event.keyCode == 13) {
                _this._saveChanges();
            }
        };
        this._saveChanges = function () {
            window.localStorage.setItem("barCountPosition", _this._positionSelect.value);
            var group = new Change_1.ChangeGroup();
            group.append(new changes_1.ChangeBarCount(_this._doc, SongDurationPrompt._validate(_this._barsStepper), _this._positionSelect.value == "beginning"));
            _this._doc.prompt = null;
            _this._doc.record(group, true);
        };
        this._barsStepper.value = this._doc.song.barCount + "";
        this._barsStepper.min = SynthConfig_1.Config.barCountMin + "";
        this._barsStepper.max = SynthConfig_1.Config.barCountMax + "";
        var lastPosition = null = window.localStorage.getItem("barCountPosition");
        if (lastPosition != null) {
            this._positionSelect.value = lastPosition;
        }
        this._barsStepper.select();
        setTimeout(function () { return _this._barsStepper.focus(); });
        this._okayButton.addEventListener("click", this._saveChanges);
        this._cancelButton.addEventListener("click", this._close);
        this._barsStepper.addEventListener("keypress", SongDurationPrompt._validateKey);
        this._barsStepper.addEventListener("blur", SongDurationPrompt._validateNumber);
        this.container.addEventListener("keydown", this._whenKeyPressed);
    }
    SongDurationPrompt._validateKey = function (event) {
        var charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
            event.preventDefault();
            return true;
        }
        return false;
    };
    SongDurationPrompt._validateNumber = function (event) {
        var input = event.target;
        input.value = String(SongDurationPrompt._validate(input));
    };
    SongDurationPrompt._validate = function (input) {
        return Math.floor(Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value))));
    };
    return SongDurationPrompt;
})();
exports.SongDurationPrompt = SongDurationPrompt;
//}
