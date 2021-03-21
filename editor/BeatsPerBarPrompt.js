// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var SynthConfig_1 = require("../synth/SynthConfig");
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
var changes_1 = require("./changes");
var ColorConfig_1 = require("./ColorConfig");
//namespace beepbox {
var button = elements_strict_1.HTML.button, div = elements_strict_1.HTML.div, span = elements_strict_1.HTML.span, h2 = elements_strict_1.HTML.h2, input = elements_strict_1.HTML.input, br = elements_strict_1.HTML.br, select = elements_strict_1.HTML.select, option = elements_strict_1.HTML.option;
var BeatsPerBarPrompt = (function () {
    function BeatsPerBarPrompt(_doc) {
        var _this = this;
        this._doc = _doc;
        this.readonly = _beatsStepper;
        this.HTMLInputElement = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "1" });
        this.readonly = _conversionStrategySelect;
        this.HTMLSelectElement = select({ style: "width: 100%;" }, option({ value: "splice" }, "Splice beats at end of bars."), option({ value: "stretch" }, "Stretch notes to fit in bars."), option({ value: "overflow" }, "Overflow notes across bars."));
        this.readonly = _cancelButton;
        this.HTMLButtonElement = button({ class: "cancelButton" });
        this.readonly = _okayButton;
        this.HTMLButtonElement = button({ class: "okayButton", style: "width:45%;" }, "Okay");
        this.readonly = container;
        this.HTMLDivElement = div({ class: "prompt noSelection", style: "width: 250px;" }, h2("Beats Per Bar"), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, div({ style: "text-align: right;" }, "Beats per bar:", br(), span({ style: "font-size: smaller; color: " + ColorConfig_1.ColorConfig.secondaryText + ";" }, "(Multiples of 3 or 4 are recommended)")), this._beatsStepper), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, div({ class: "selectContainer", style: "width: 100%;" }, this._conversionStrategySelect)), div({ style: "display: flex; flex-direction: row-reverse; justify-content: space-between;" }, this._okayButton), this._cancelButton);
        this._close = function () {
            _this._doc.undo();
        };
        this.cleanUp = function () {
            _this._okayButton.removeEventListener("click", _this._saveChanges);
            _this._cancelButton.removeEventListener("click", _this._close);
            _this._beatsStepper.removeEventListener("keypress", BeatsPerBarPrompt._validateKey);
            _this._beatsStepper.removeEventListener("blur", BeatsPerBarPrompt._validateNumber);
            _this.container.removeEventListener("keydown", _this._whenKeyPressed);
        };
        this._whenKeyPressed = function (event) {
            if (event.target.tagName != "BUTTON" && event.keyCode == 13) {
                _this._saveChanges();
            }
        };
        this._saveChanges = function () {
            window.localStorage.setItem("beatCountStrategy", _this._conversionStrategySelect.value);
            _this._doc.prompt = null;
            _this._doc.record(new changes_1.ChangeBeatsPerBar(_this._doc, BeatsPerBarPrompt._validate(_this._beatsStepper), _this._conversionStrategySelect.value), true);
        };
        this._beatsStepper.value = this._doc.song.beatsPerBar + "";
        this._beatsStepper.min = SynthConfig_1.Config.beatsPerBarMin + "";
        this._beatsStepper.max = SynthConfig_1.Config.beatsPerBarMax + "";
        var lastStrategy = null = window.localStorage.getItem("beatCountStrategy");
        if (lastStrategy != null) {
            this._conversionStrategySelect.value = lastStrategy;
        }
        this._beatsStepper.select();
        setTimeout(function () { return _this._beatsStepper.focus(); });
        this._okayButton.addEventListener("click", this._saveChanges);
        this._cancelButton.addEventListener("click", this._close);
        this._beatsStepper.addEventListener("keypress", BeatsPerBarPrompt._validateKey);
        this._beatsStepper.addEventListener("blur", BeatsPerBarPrompt._validateNumber);
        this.container.addEventListener("keydown", this._whenKeyPressed);
    }
    BeatsPerBarPrompt._validateKey = function (event) {
        var charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
            event.preventDefault();
            return true;
        }
        return false;
    };
    BeatsPerBarPrompt._validateNumber = function (event) {
        var input = event.target;
        input.value = String(BeatsPerBarPrompt._validate(input));
    };
    BeatsPerBarPrompt._validate = function (input) {
        return Math.floor(Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value))));
    };
    return BeatsPerBarPrompt;
})();
exports.BeatsPerBarPrompt = BeatsPerBarPrompt;
//}
