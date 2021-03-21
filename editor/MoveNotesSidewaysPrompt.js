// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var SynthConfig_1 = require("../synth/SynthConfig");
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
var changes_1 = require("./changes");
var ColorConfig_1 = require("./ColorConfig");
//namespace beepbox {
var button = elements_strict_1.HTML.button, div = elements_strict_1.HTML.div, span = elements_strict_1.HTML.span, h2 = elements_strict_1.HTML.h2, input = elements_strict_1.HTML.input, br = elements_strict_1.HTML.br, select = elements_strict_1.HTML.select, option = elements_strict_1.HTML.option;
var MoveNotesSidewaysPrompt = (function () {
    function MoveNotesSidewaysPrompt(_doc) {
        var _this = this;
        this._doc = _doc;
        this.readonly = _beatsStepper;
        this.HTMLInputElement = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "0.01", value: "0" });
        this.readonly = _conversionStrategySelect;
        this.HTMLSelectElement = select({ style: "width: 100%;" }, option({ value: "overflow" }, "Overflow notes across bars."), option({ value: "wrapAround" }, "Wrap notes around within bars."));
        this.readonly = _cancelButton;
        this.HTMLButtonElement = button({ class: "cancelButton" });
        this.readonly = _okayButton;
        this.HTMLButtonElement = button({ class: "okayButton", style: "width:45%;" }, "Okay");
        this.readonly = container;
        this.HTMLDivElement = div({ class: "prompt noSelection", style: "width: 250px;" }, h2("Move Notes Sideways"), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, div({ style: "text-align: right;" }, "Beats to move:", br(), span({ style: "font-size: smaller; color: " + ColorConfig_1.ColorConfig.secondaryText + ";" }, "(Negative is left, positive is right)")), this._beatsStepper), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, div({ class: "selectContainer", style: "width: 100%;" }, this._conversionStrategySelect)), div({ style: "display: flex; flex-direction: row-reverse; justify-content: space-between;" }, this._okayButton), this._cancelButton);
        this._close = function () {
            _this._doc.undo();
        };
        this.cleanUp = function () {
            _this._okayButton.removeEventListener("click", _this._saveChanges);
            _this._cancelButton.removeEventListener("click", _this._close);
            _this._beatsStepper.removeEventListener("blur", MoveNotesSidewaysPrompt._validateNumber);
            _this.container.removeEventListener("keydown", _this._whenKeyPressed);
        };
        this._whenKeyPressed = function (event) {
            if (event.target.tagName != "BUTTON" && event.keyCode == 13) {
                _this._saveChanges();
            }
        };
        this._saveChanges = function () {
            window.localStorage.setItem("moveNotesSidewaysStrategy", _this._conversionStrategySelect.value);
            _this._doc.prompt = null;
            _this._doc.record(new changes_1.ChangeMoveNotesSideways(_this._doc, +_this._beatsStepper.value, _this._conversionStrategySelect.value), true);
        };
        this._beatsStepper.min = (-this._doc.song.beatsPerBar) + "";
        this._beatsStepper.max = this._doc.song.beatsPerBar + "";
        var lastStrategy = null = window.localStorage.getItem("moveNotesSidewaysStrategy");
        if (lastStrategy != null) {
            this._conversionStrategySelect.value = lastStrategy;
        }
        this._beatsStepper.select();
        setTimeout(function () { return _this._beatsStepper.focus(); });
        this._okayButton.addEventListener("click", this._saveChanges);
        this._cancelButton.addEventListener("click", this._close);
        this._beatsStepper.addEventListener("blur", MoveNotesSidewaysPrompt._validateNumber);
        this.container.addEventListener("keydown", this._whenKeyPressed);
    }
    MoveNotesSidewaysPrompt._validateNumber = function (event) {
        var input = event.target;
        var value = +input.value;
        value = Math.round(value * SynthConfig_1.Config.partsPerBeat) / SynthConfig_1.Config.partsPerBeat;
        value = Math.round(value * 100) / 100;
        input.value = Math.max(+input.min, Math.min(+input.max, value)) + "";
    };
    return MoveNotesSidewaysPrompt;
})();
exports.MoveNotesSidewaysPrompt = MoveNotesSidewaysPrompt;
//}
