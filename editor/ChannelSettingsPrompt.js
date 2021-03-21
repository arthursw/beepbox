// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var SynthConfig_1 = require("../synth/SynthConfig");
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
var Change_1 = require("./Change");
var changes_1 = require("./changes");
//namespace beepbox {
var button = elements_strict_1.HTML.button, div = elements_strict_1.HTML.div, h2 = elements_strict_1.HTML.h2, input = elements_strict_1.HTML.input;
var ChannelSettingsPrompt = (function () {
    function ChannelSettingsPrompt(_doc) {
        var _this = this;
        this._doc = _doc;
        this.readonly = _patternsStepper;
        this.HTMLInputElement = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "1" });
        this.readonly = _instrumentsStepper;
        this.HTMLInputElement = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "1" });
        this.readonly = _pitchChannelStepper;
        this.HTMLInputElement = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "1" });
        this.readonly = _drumChannelStepper;
        this.HTMLInputElement = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "1" });
        this.readonly = _cancelButton;
        this.HTMLButtonElement = button({ class: "cancelButton" });
        this.readonly = _okayButton;
        this.HTMLButtonElement = button({ class: "okayButton", style: "width:45%;" }, "Okay");
        this.readonly = container;
        this.HTMLDivElement = div({ class: "prompt noSelection", style: "width: 250px;" }, h2("Channel Settings"), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, "Pitch channels:", this._pitchChannelStepper), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, "Drum channels:", this._drumChannelStepper), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, "Patterns per channel:", this._patternsStepper), div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, "Instruments per channel:", this._instrumentsStepper), div({ style: "display: flex; flex-direction: row-reverse; justify-content: space-between;" }, this._okayButton), this._cancelButton);
        this._close = function () {
            _this._doc.undo();
        };
        this.cleanUp = function () {
            _this._okayButton.removeEventListener("click", _this._saveChanges);
            _this._cancelButton.removeEventListener("click", _this._close);
            _this._patternsStepper.removeEventListener("keypress", ChannelSettingsPrompt._validateKey);
            _this._instrumentsStepper.removeEventListener("keypress", ChannelSettingsPrompt._validateKey);
            _this._pitchChannelStepper.removeEventListener("keypress", ChannelSettingsPrompt._validateKey);
            _this._drumChannelStepper.removeEventListener("keypress", ChannelSettingsPrompt._validateKey);
            _this._patternsStepper.removeEventListener("blur", ChannelSettingsPrompt._validateNumber);
            _this._instrumentsStepper.removeEventListener("blur", ChannelSettingsPrompt._validateNumber);
            _this._pitchChannelStepper.removeEventListener("blur", ChannelSettingsPrompt._validateNumber);
            _this._drumChannelStepper.removeEventListener("blur", ChannelSettingsPrompt._validateNumber);
            _this.container.removeEventListener("keydown", _this._whenKeyPressed);
        };
        this._whenKeyPressed = function (event) {
            if (event.target.tagName != "BUTTON" && event.keyCode == 13) {
                _this._saveChanges();
            }
        };
        this._saveChanges = function () {
            var group = new Change_1.ChangeGroup();
            group.append(new changes_1.ChangePatternsPerChannel(_this._doc, ChannelSettingsPrompt._validate(_this._patternsStepper)));
            group.append(new changes_1.ChangeInstrumentsPerChannel(_this._doc, ChannelSettingsPrompt._validate(_this._instrumentsStepper)));
            group.append(new changes_1.ChangeChannelCount(_this._doc, ChannelSettingsPrompt._validate(_this._pitchChannelStepper), ChannelSettingsPrompt._validate(_this._drumChannelStepper)));
            _this._doc.prompt = null;
            _this._doc.record(group, true);
        };
        this._patternsStepper.value = this._doc.song.patternsPerChannel + "";
        this._patternsStepper.min = "1";
        this._patternsStepper.max = SynthConfig_1.Config.barCountMax + "";
        this._instrumentsStepper.value = this._doc.song.instrumentsPerChannel + "";
        this._instrumentsStepper.min = SynthConfig_1.Config.instrumentsPerChannelMin + "";
        this._instrumentsStepper.max = SynthConfig_1.Config.instrumentsPerChannelMax + "";
        this._pitchChannelStepper.value = this._doc.song.pitchChannelCount + "";
        this._pitchChannelStepper.min = SynthConfig_1.Config.pitchChannelCountMin + "";
        this._pitchChannelStepper.max = SynthConfig_1.Config.pitchChannelCountMax + "";
        this._drumChannelStepper.value = this._doc.song.noiseChannelCount + "";
        this._drumChannelStepper.min = SynthConfig_1.Config.noiseChannelCountMin + "";
        this._drumChannelStepper.max = SynthConfig_1.Config.noiseChannelCountMax + "";
        this._pitchChannelStepper.select();
        setTimeout(function () { return _this._pitchChannelStepper.focus(); });
        this._okayButton.addEventListener("click", this._saveChanges);
        this._cancelButton.addEventListener("click", this._close);
        this._patternsStepper.addEventListener("keypress", ChannelSettingsPrompt._validateKey);
        this._instrumentsStepper.addEventListener("keypress", ChannelSettingsPrompt._validateKey);
        this._pitchChannelStepper.addEventListener("keypress", ChannelSettingsPrompt._validateKey);
        this._drumChannelStepper.addEventListener("keypress", ChannelSettingsPrompt._validateKey);
        this._patternsStepper.addEventListener("blur", ChannelSettingsPrompt._validateNumber);
        this._instrumentsStepper.addEventListener("blur", ChannelSettingsPrompt._validateNumber);
        this._pitchChannelStepper.addEventListener("blur", ChannelSettingsPrompt._validateNumber);
        this._drumChannelStepper.addEventListener("blur", ChannelSettingsPrompt._validateNumber);
        this.container.addEventListener("keydown", this._whenKeyPressed);
    }
    ChannelSettingsPrompt._validateKey = function (event) {
        var charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
            event.preventDefault();
            return true;
        }
        return false;
    };
    ChannelSettingsPrompt._validateNumber = function (event) {
        var input = event.target;
        input.value = String(ChannelSettingsPrompt._validate(input));
    };
    ChannelSettingsPrompt._validate = function (input) {
        return Math.floor(Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value))));
    };
    return ChannelSettingsPrompt;
})();
exports.ChannelSettingsPrompt = ChannelSettingsPrompt;
//}
