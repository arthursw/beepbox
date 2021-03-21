// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var _this = this;
var SynthConfig_1 = require("../synth/SynthConfig");
var EditorConfig_1 = require("./EditorConfig");
var ColorConfig_1 = require("./ColorConfig");
var Layout_1 = require("./Layout");
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
var TipPrompt_1 = require("./TipPrompt");
var PatternEditor_1 = require("./PatternEditor");
var MuteEditor_1 = require("./MuteEditor");
var TrackEditor_1 = require("./TrackEditor");
var LoopEditor_1 = require("./LoopEditor");
var SpectrumEditor_1 = require("./SpectrumEditor");
var HarmonicsEditor_1 = require("./HarmonicsEditor");
var BarScrollBar_1 = require("./BarScrollBar");
var OctaveScrollBar_1 = require("./OctaveScrollBar");
var Piano_1 = require("./Piano");
var BeatsPerBarPrompt_1 = require("./BeatsPerBarPrompt");
var MoveNotesSidewaysPrompt_1 = require("./MoveNotesSidewaysPrompt");
var SongDurationPrompt_1 = require("./SongDurationPrompt");
var ChannelSettingsPrompt_1 = require("./ChannelSettingsPrompt");
var ExportPrompt_1 = require("./ExportPrompt");
var ImportPrompt_1 = require("./ImportPrompt");
var SongRecoveryPrompt_1 = require("./SongRecoveryPrompt");
var Change_1 = require("./Change");
var changes_1 = require("./changes");
//namespace beepbox {
var button = elements_strict_1.HTML.button, div = elements_strict_1.HTML.div, input = elements_strict_1.HTML.input, select = elements_strict_1.HTML.select, span = elements_strict_1.HTML.span, optgroup = elements_strict_1.HTML.optgroup, option = elements_strict_1.HTML.option;
function buildOptions(menu, items) {
    for (var index = 0; index < items.length; index++) {
        menu.appendChild(option({ value: index }, items[index]));
    }
    return menu;
}
function buildPresetOptions(isNoise) {
    var menu = select();
    menu.appendChild(optgroup({ label: "Edit" }, option({ value: "copyInstrument" }, "Copy Instrument"), option({ value: "pasteInstrument" }, "Paste Instrument"), option({ value: "randomPreset" }, "Random Preset"), option({ value: "randomGenerated" }, "Random Generated")));
    // Show the "spectrum" custom type in both pitched and noise channels.
    var customTypeGroup = optgroup({ label: EditorConfig_1.EditorConfig.presetCategories[0].name });
    if (isNoise) {
        customTypeGroup.appendChild(option({ value: 2 /* noise */ }, EditorConfig_1.EditorConfig.valueToPreset(2 /* noise */), !.name));
        customTypeGroup.appendChild(option({ value: 3 /* spectrum */ }, EditorConfig_1.EditorConfig.valueToPreset(3 /* spectrum */), !.name));
        customTypeGroup.appendChild(option({ value: 4 /* drumset */ }, EditorConfig_1.EditorConfig.valueToPreset(4 /* drumset */), !.name));
    }
    else {
        customTypeGroup.appendChild(option({ value: 0 /* chip */ }, EditorConfig_1.EditorConfig.valueToPreset(0 /* chip */), !.name));
        customTypeGroup.appendChild(option({ value: 6 /* pwm */ }, EditorConfig_1.EditorConfig.valueToPreset(6 /* pwm */), !.name));
        customTypeGroup.appendChild(option({ value: 5 /* harmonics */ }, EditorConfig_1.EditorConfig.valueToPreset(5 /* harmonics */), !.name));
        customTypeGroup.appendChild(option({ value: 3 /* spectrum */ }, EditorConfig_1.EditorConfig.valueToPreset(3 /* spectrum */), !.name));
        customTypeGroup.appendChild(option({ value: 1 /* fm */ }, EditorConfig_1.EditorConfig.valueToPreset(1 /* fm */), !.name));
    }
    menu.appendChild(customTypeGroup);
    for (var categoryIndex = 1; categoryIndex < EditorConfig_1.EditorConfig.presetCategories.length; categoryIndex++) {
        var category = EditorConfig_1.EditorConfig.presetCategories[categoryIndex];
        var group = optgroup({ label: category.name });
        var foundAny = false;
        for (var presetIndex = 0; presetIndex < category.presets.length; presetIndex++) {
            var preset = category.presets[presetIndex];
            if ((preset.isNoise == true) == isNoise) {
                group.appendChild(option({ value: (categoryIndex << 6) + presetIndex }, preset.name));
                foundAny = true;
            }
        }
        if (foundAny)
            menu.appendChild(group);
    }
    return menu;
}
function setSelectedValue(menu, value) {
    var stringValue = value.toString();
    if (menu.value != stringValue)
        menu.value = stringValue;
}
var Slider = (function () {
    function Slider() {
        this._change = null = null;
        this._value = 0;
        this._oldValue = 0;
    }
    return Slider;
})();
(function (oldValue, newValue) { return Change_1.Change; });
{
    input.addEventListener("input", this._whenInput);
    input.addEventListener("change", this._whenChange);
}
updateValue(value, number);
void {
    this: ._value = value,
    this: .input.value = String(value)
};
_whenInput = function () {
    var continuingProspectiveChange = _this._doc.lastChangeWas(_this._change);
    if (!continuingProspectiveChange)
        _this._oldValue = _this._value;
    _this._change = _this._getChange(_this._oldValue, parseInt(_this.input.value));
    _this._doc.setProspectiveChange(_this._change);
};
_whenChange = function () {
    _this._doc.record(_this._change, !);
    _this._change = null;
};
var SongEditor = (function () {
    function SongEditor(_doc) {
        var _this = this;
        this._doc = _doc;
        this.prompt = null = null;
        this.readonly = _patternEditorPrev;
        this.PatternEditor = new PatternEditor_1.PatternEditor(this._doc, false, -1);
        this.readonly = _patternEditor;
        this.PatternEditor = new PatternEditor_1.PatternEditor(this._doc, true, 0);
        this.readonly = _patternEditorNext;
        this.PatternEditor = new PatternEditor_1.PatternEditor(this._doc, false, 1);
        this.readonly = _muteEditor;
        this.MuteEditor = new MuteEditor_1.MuteEditor(this._doc);
        this.readonly = _trackEditor;
        this.TrackEditor = new TrackEditor_1.TrackEditor(this._doc);
        this.readonly = _loopEditor;
        this.LoopEditor = new LoopEditor_1.LoopEditor(this._doc);
        this.readonly = _octaveScrollBar;
        this.OctaveScrollBar = new OctaveScrollBar_1.OctaveScrollBar(this._doc);
        this.readonly = _piano;
        this.Piano = new Piano_1.Piano(this._doc);
        this.readonly = _playButton;
        this.HTMLButtonElement = button({ style: "width: 80px;", type: "button" });
        this.readonly = _prevBarButton;
        this.HTMLButtonElement = button({ class: "prevBarButton", style: "width: 40px;", type: "button", title: "Previous Bar (left bracket)" });
        this.readonly = _nextBarButton;
        this.HTMLButtonElement = button({ class: "nextBarButton", style: "width: 40px;", type: "button", title: "Next Bar (right bracket)" });
        this.readonly = _volumeSlider;
        this.HTMLInputElement = input({ title: "main volume", style: "width: 5em; flex-grow: 1; margin: 0;", type: "range", min: "0", max: "75", value: "50", step: "1" });
        this.readonly = _fileMenu;
        this.HTMLSelectElement = select({ style: "width: 100%;" }, option({ selected: true, disabled: true, hidden: false }, "File"), option({ value: "new" }, "+ New Blank Song"), option({ value: "import" }, "↑ Import Song..."), option({ value: "export" }, "↓ Export Song..."), option({ value: "copyUrl" }, "⎘ Copy Song URL"), option({ value: "shareUrl" }, "⤳ Share Song URL"), option({ value: "shortenUrl" }, "… Shorten Song URL"), option({ value: "viewPlayer" }, "▶ View in Song Player"), option({ value: "copyEmbed" }, "⎘ Copy HTML Embed Code"), option({ value: "songRecovery" }, "⚠ Recover Recent Song..."));
        this.readonly = _editMenu;
        this.HTMLSelectElement = select({ style: "width: 100%;" }, option({ selected: true, disabled: true, hidden: false }, "Edit"), option({ value: "undo" }, "Undo (Z)"), option({ value: "redo" }, "Redo (Y)"), option({ value: "copy" }, "Copy Pattern (C)"), option({ value: "pasteNotes" }, "Paste Pattern Notes (V)"), option({ value: "pasteNumbers" }, "Paste Pattern Numbers (⇧V)"), option({ value: "insertBars" }, "Insert Bar After Selection (⏎)"), option({ value: "deleteBars" }, "Delete Selected Bar (⌫)"), option({ value: "selectAll" }, "Select All (A)"), option({ value: "selectChannel" }, "Select Channel (⇧A)"), option({ value: "duplicatePatterns" }, "Duplicate Reused Patterns (D)"), option({ value: "transposeUp" }, "Move Notes Up (+)"), option({ value: "transposeDown" }, "Move Notes Down (-)"), option({ value: "moveNotesSideways" }, "Move All Notes Sideways..."), option({ value: "beatsPerBar" }, "Change Beats Per Bar..."), option({ value: "barCount" }, "Change Song Length..."), option({ value: "channelSettings" }, "Channel Settings..."));
        this.readonly = _optionsMenu;
        this.HTMLSelectElement = select({ style: "width: 100%;" }, option({ selected: true, disabled: true, hidden: false }, "Preferences"), option({ value: "autoPlay" }, "Auto Play On Load"), option({ value: "autoFollow" }, "Auto Follow Track"), option({ value: "enableNotePreview" }, "Preview Added Notes"), option({ value: "showLetters" }, "Show Piano Keys"), option({ value: "showFifth" }, 'Highlight "Fifth" Notes'), option({ value: "showChannels" }, "Show All Channels"), option({ value: "showScrollBar" }, "Octave Scroll Bar"), option({ value: "alwaysShowSettings" }, "Customize All Instruments"), option({ value: "enableChannelMuting" }, "Enable Channel Muting"), option({ value: "displayBrowserUrl" }, "Display Song Data in URL"), option({ value: "fullScreen" }, "Full-Screen Layout"), option({ value: "colorTheme" }, "Light Theme"));
        this.readonly = _scaleSelect;
        this.HTMLSelectElement = buildOptions(select(), SynthConfig_1.Config.scales.map(function (scale) { return scale.name; }));
        this.readonly = _keySelect;
        this.HTMLSelectElement = buildOptions(select(), SynthConfig_1.Config.keys.map(function (key) { return key.name; }).reverse());
        this.readonly = _tempoSlider;
        this.Slider = new Slider(input({ style: "margin: 0; width: 4em; flex-grow: 1; vertical-align: middle;", type: "range", min: "0", max: "14", value: "7", step: "1" }), this._doc, function (oldValue, newValue) { return new changes_1.ChangeTempo(_this._doc, oldValue, Math.round(120.0 * Math.pow(2.0, (-4.0 + newValue) / 9.0))); });
        this.readonly = _tempoStepper;
        this.HTMLInputElement = input({ style: "width: 3em; margin-left: 0.4em; vertical-align: middle;", type: "number", step: "1" });
        this.readonly = _reverbSlider;
        this.Slider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: SynthConfig_1.Config.reverbRange - 1, value: "0", step: "1" }), this._doc, function (oldValue, newValue) { return new changes_1.ChangeReverb(_this._doc, oldValue, newValue); });
        this.readonly = _rhythmSelect;
        this.HTMLSelectElement = buildOptions(select(), SynthConfig_1.Config.rhythms.map(function (rhythm) { return rhythm.name; }));
        this.readonly = _pitchedPresetSelect;
        this.HTMLSelectElement = buildPresetOptions(false);
        this.readonly = _drumPresetSelect;
        this.HTMLSelectElement = buildPresetOptions(true);
        this.readonly = _algorithmSelect;
        this.HTMLSelectElement = buildOptions(select(), SynthConfig_1.Config.algorithms.map(function (algorithm) { return algorithm.name; }));
        this.readonly = _algorithmSelectRow;
        this.HTMLDivElement = div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("algorithm"); } }, "Algorithm: "), div({ class: "selectContainer" }, this._algorithmSelect));
        this.readonly = _instrumentSelect;
        this.HTMLSelectElement = select();
        this.readonly = _instrumentSelectRow;
        this.HTMLDivElement = div({ class: "selectRow", style: "display: none;" }, span({ class: "tip", onclick: function () { return _this._openPrompt("instrumentIndex"); } }, "Instrument: "), div({ class: "selectContainer" }, this._instrumentSelect));
        this.readonly = _instrumentVolumeSlider;
        this.Slider = new Slider(input({ style: "margin: 0;", type: "range", min: -(SynthConfig_1.Config.volumeRange - 1), max: "0", value: "0", step: "1" }), this._doc, function (oldValue, newValue) { return new changes_1.ChangeVolume(_this._doc, oldValue, -newValue); });
        this.readonly = _instrumentVolumeSliderRow;
        this.HTMLDivElement = div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("instrumentVolume"); } }, "Volume: "), this._instrumentVolumeSlider.input);
        this.readonly = _panSlider;
        this.Slider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: SynthConfig_1.Config.panMax, value: SynthConfig_1.Config.panCenter, step: "1" }), this._doc, function (oldValue, newValue) { return new changes_1.ChangePan(_this._doc, oldValue, newValue); });
        this.readonly = _panSliderRow;
        this.HTMLDivElement = div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("pan"); } }, "Panning: "), this._panSlider.input);
        this.readonly = _chipWaveSelect;
        this.HTMLSelectElement = buildOptions(select(), SynthConfig_1.Config.chipWaves.map(function (wave) { return wave.name; }));
        this.readonly = _chipNoiseSelect;
        this.HTMLSelectElement = buildOptions(select(), SynthConfig_1.Config.chipNoises.map(function (wave) { return wave.name; }));
        this.readonly = _chipWaveSelectRow;
        this.HTMLDivElement = div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("chipWave"); } }, "Wave: "), div({ class: "selectContainer" }, this._chipWaveSelect));
        this.readonly = _chipNoiseSelectRow;
        this.HTMLDivElement = div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("chipNoise"); } }, "Noise: "), div({ class: "selectContainer" }, this._chipNoiseSelect));
        this.readonly = _transitionSelect;
        this.HTMLSelectElement = buildOptions(select(), SynthConfig_1.Config.transitions.map(function (transition) { return transition.name; }));
        this.readonly = _transitionRow;
        this.HTMLDivElement = div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("transition"); } }, "Transition:"), div({ class: "selectContainer" }, this._transitionSelect));
        this.readonly = _effectsSelect;
        this.HTMLSelectElement = buildOptions(select(), SynthConfig_1.Config.effectsNames);
        this.readonly = _filterCutoffSlider;
        this.Slider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: SynthConfig_1.Config.filterCutoffRange - 1, value: "6", step: "1" }), this._doc, function (oldValue, newValue) { return new changes_1.ChangeFilterCutoff(_this._doc, oldValue, newValue); });
        this._filterCutoffRow = div({ class: "selectRow", title: "Low-pass Filter Cutoff Frequency" }, span({ class: "tip", onclick: function () { return _this._openPrompt("filterCutoff"); } }, "Filter Cut:"), this._filterCutoffSlider.input);
        this.readonly = _filterResonanceSlider;
        this.Slider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: SynthConfig_1.Config.filterResonanceRange - 1, value: "6", step: "1" }), this._doc, function (oldValue, newValue) { return new changes_1.ChangeFilterResonance(_this._doc, oldValue, newValue); });
        this._filterResonanceRow = div({ class: "selectRow", title: "Low-pass Filter Peak Resonance" }, span({ class: "tip", onclick: function () { return _this._openPrompt("filterResonance"); } }, "Filter Peak:"), this._filterResonanceSlider.input);
        this.readonly = _filterEnvelopeSelect;
        this.HTMLSelectElement = buildOptions(select(), SynthConfig_1.Config.envelopes.map(function (envelope) { return envelope.name; }));
        this._filterEnvelopeRow = div({ class: "selectRow", title: "Low-pass Filter Envelope" }, span({ class: "tip", onclick: function () { return _this._openPrompt("filterEnvelope"); } }, "Filter Env:"), div({ class: "selectContainer" }, this._filterEnvelopeSelect));
        this.readonly = _pulseEnvelopeSelect;
        this.HTMLSelectElement = buildOptions(select(), SynthConfig_1.Config.envelopes.map(function (envelope) { return envelope.name; }));
        this._pulseEnvelopeRow = div({ class: "selectRow", title: "Pulse Width Modulator Envelope" }, span({ class: "tip", onclick: function () { return _this._openPrompt("pulseEnvelope"); } }, "Pulse Env:"), div({ class: "selectContainer" }, this._pulseEnvelopeSelect));
        this.readonly = _pulseWidthSlider;
        this.Slider = new Slider(input({ style: "margin: 0;", type: "range", min: "0", max: SynthConfig_1.Config.pulseWidthRange - 1, value: "0", step: "1" }), this._doc, function (oldValue, newValue) { return new changes_1.ChangePulseWidth(_this._doc, oldValue, newValue); });
        this._pulseWidthRow = div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("pulseWidth"); } }, "Pulse Width:"), this._pulseWidthSlider.input);
        this.readonly = _intervalSelect;
        this.HTMLSelectElement = buildOptions(select(), SynthConfig_1.Config.intervals.map(function (interval) { return interval.name; }));
        this.readonly = _intervalSelectRow;
        this.HTMLElement = div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("interval"); } }, "Interval:"), div({ class: "selectContainer" }, this._intervalSelect));
        this.readonly = _chordSelect;
        this.HTMLSelectElement = buildOptions(select(), SynthConfig_1.Config.chords.map(function (chord) { return chord.name; }));
        this.readonly = _chordSelectRow;
        this.HTMLElement = div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("chords"); } }, "Chords:"), div({ class: "selectContainer" }, this._chordSelect));
        this.readonly = _vibratoSelect;
        this.HTMLSelectElement = buildOptions(select(), SynthConfig_1.Config.vibratos.map(function (vibrato) { return vibrato.name; }));
        this.readonly = _vibratoSelectRow;
        this.HTMLElement = div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("vibrato"); } }, "Vibrato:"), div({ class: "selectContainer" }, this._vibratoSelect));
        this.readonly = _phaseModGroup;
        this.HTMLElement = div({ class: "editor-controls" });
        this.readonly = _feedbackTypeSelect;
        this.HTMLSelectElement = buildOptions(select(), SynthConfig_1.Config.feedbacks.map(function (feedback) { return feedback.name; }));
        this.readonly = _feedbackRow1;
        this.HTMLDivElement = div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("feedbackType"); } }, "Feedback:"), div({ class: "selectContainer" }, this._feedbackTypeSelect));
        this.readonly = _spectrumEditor;
        this.SpectrumEditor = new SpectrumEditor_1.SpectrumEditor(this._doc, null);
        this.readonly = _spectrumRow;
        this.HTMLElement = div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("spectrum"); } }, "Spectrum:"), this._spectrumEditor.container);
        this.readonly = _harmonicsEditor;
        this.HarmonicsEditor = new HarmonicsEditor_1.HarmonicsEditor(this._doc);
        this.readonly = _harmonicsRow;
        this.HTMLElement = div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("harmonics"); } }, "Harmonics:"), this._harmonicsEditor.container);
        this.readonly = _drumsetGroup;
        this.HTMLElement = div({ class: "editor-controls" });
        this.readonly = _feedbackAmplitudeSlider;
        this.Slider = new Slider(input({ style: "margin: 0; width: 4em;", type: "range", min: "0", max: SynthConfig_1.Config.operatorAmplitudeMax, value: "0", step: "1", title: "Feedback Amplitude" }), this._doc, function (oldValue, newValue) { return new changes_1.ChangeFeedbackAmplitude(_this._doc, oldValue, newValue); });
        this.readonly = _feedbackEnvelopeSelect;
        this.HTMLSelectElement = buildOptions(select({ style: "width: 100%;", title: "Feedback Envelope" }), SynthConfig_1.Config.envelopes.map(function (envelope) { return envelope.name; }));
        this.readonly = _feedbackRow2;
        this.HTMLDivElement = div({ class: "operatorRow" }, div({ style: "margin-right: .1em; visibility: hidden;" }, 1 + "."), div({ style: "width: 3em; margin-right: .3em;" }), this._feedbackAmplitudeSlider.input, div({ class: "selectContainer", style: "width: 5em; margin-left: .3em;" }, this._feedbackEnvelopeSelect));
        this.readonly = _customizeInstrumentButton;
        this.HTMLButtonElement = button({ type: "button", class: "customize-instrument" }, "Customize Instrument");
        this.readonly = _customInstrumentSettingsGroup;
        this.HTMLDivElement = div({ class: "editor-controls" }, this._filterCutoffRow, this._filterResonanceRow, this._filterEnvelopeRow, this._transitionRow, div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("effects"); } }, "Effects:"), div({ class: "selectContainer" }, this._effectsSelect)), this._chordSelectRow, this._vibratoSelectRow, this._intervalSelectRow, this._chipWaveSelectRow, this._chipNoiseSelectRow, this._algorithmSelectRow, this._phaseModGroup, this._feedbackRow1, this._feedbackRow2, this._spectrumRow, this._harmonicsRow, this._drumsetGroup, this._pulseEnvelopeRow, this._pulseWidthRow);
        this.readonly = _instrumentSettingsGroup;
        this.HTMLDivElement = div({ class: "editor-controls" }, div({ style: "margin: 3px 0; text-align: center; color: " + ColorConfig_1.ColorConfig.secondaryText + ";" }, "Instrument Settings"), this._instrumentSelectRow, this._instrumentVolumeSliderRow, this._panSliderRow, div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("instrumentType"); } }, "Type: "), div({ class: "selectContainer" }, this._pitchedPresetSelect, this._drumPresetSelect)), this._customizeInstrumentButton, this._customInstrumentSettingsGroup);
        this.readonly = _promptContainer;
        this.HTMLDivElement = div({ class: "promptContainer", style: "display: none;" });
        this.readonly = _patternEditorRow;
        this.HTMLDivElement = div({ style: "flex: 1; height: 100%; display: flex; overflow: hidden; justify-content: center;" }, this._patternEditorPrev.container, this._patternEditor.container, this._patternEditorNext.container);
        this.readonly = _patternArea;
        this.HTMLDivElement = div({ class: "pattern-area" }, this._piano.container, this._patternEditorRow, this._octaveScrollBar.container);
        this.readonly = _trackContainer;
        this.HTMLDivElement = div({ class: "trackContainer" }, this._trackEditor.container, this._loopEditor.container);
        this.readonly = _trackAndMuteContainer;
        this.HTMLDivElement = div({ class: "trackAndMuteContainer" }, this._muteEditor.container, this._trackContainer);
        this.readonly = _barScrollBar;
        this.BarScrollBar = new BarScrollBar_1.BarScrollBar(this._doc, this._trackContainer);
        this.readonly = _trackArea;
        this.HTMLDivElement = div({ class: "track-area" }, this._trackAndMuteContainer, this._barScrollBar.container);
        this.readonly = _settingsArea;
        this.HTMLDivElement = div({ class: "settings-area noSelection" }, div({ class: "version-area" }, div({ style: "text-align: center; margin: 3px 0; color: " + ColorConfig_1.ColorConfig.secondaryText + ";" }, EditorConfig_1.EditorConfig.versionDisplayName)), div({ class: "play-pause-area" }, div({ class: "playback-bar-controls" }, this._playButton, this._prevBarButton, this._nextBarButton), div({ class: "playback-volume-controls" }, span({ class: "volume-speaker" }), this._volumeSlider)), div({ class: "menu-area" }, div({ class: "selectContainer menu file" }, this._fileMenu), div({ class: "selectContainer menu edit" }, this._editMenu), div({ class: "selectContainer menu preferences" }, this._optionsMenu)), div({ class: "song-settings-area" }, div({ class: "editor-controls" }, div({ style: "margin: 3px 0; text-align: center; color: " + ColorConfig_1.ColorConfig.secondaryText + ";" }, "Song Settings"), div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("scale"); } }, "Scale: "), div({ class: "selectContainer" }, this._scaleSelect)), div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("key"); } }, "Key: "), div({ class: "selectContainer" }, this._keySelect)), div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("tempo"); } }, "Tempo: "), span({ style: "display: flex;" }, this._tempoSlider.input, this._tempoStepper)), div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("reverb"); } }, "Reverb: "), this._reverbSlider.input), div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("rhythm"); } }, "Rhythm: "), div({ class: "selectContainer" }, this._rhythmSelect)))), div({ class: "instrument-settings-area" }, this._instrumentSettingsGroup));
        this.readonly = mainLayer;
        this.HTMLDivElement = div({ class: "beepboxEditor", tabIndex: "0" }, this._patternArea, this._trackArea, this._settingsArea, this._promptContainer);
        this._wasPlaying = false;
        this._currentPromptName = null = null;
        this.readonly = _operatorRows;
        this.HTMLDivElement = (_a = [], _a);
        this.readonly = _operatorAmplitudeSliders;
        this.Slider = (_b = [], _b);
        this.readonly = _operatorEnvelopeSelects;
        this.HTMLSelectElement = (_c = [], _c);
        this.readonly = _operatorFrequencySelects;
        this.HTMLSelectElement = (_d = [], _d);
        this.readonly = _drumsetSpectrumEditors;
        this.SpectrumEditor = (_e = [], _e);
        this.readonly = _drumsetEnvelopeSelects;
        this.HTMLSelectElement = (_f = [], _f);
        this._refocusStage = function () {
            _this.mainLayer.focus({ preventScroll: true });
        };
        this.whenUpdated = function () {
            _this._muteEditor.container.style.display = _this._doc.enableChannelMuting ? "" : "none";
            var trackBounds = _this._trackContainer.getBoundingClientRect();
            _this._doc.trackVisibleBars = Math.floor((trackBounds.right - trackBounds.left) / _this._doc.getBarWidth());
            _this._barScrollBar.render();
            _this._muteEditor.render();
            _this._trackEditor.render();
            _this._piano.container.style.display = _this._doc.showLetters ? "" : "none";
            _this._octaveScrollBar.container.style.display = _this._doc.showScrollBar ? "" : "none";
            _this._barScrollBar.container.style.display = _this._doc.song.barCount > _this._doc.trackVisibleBars ? "" : "none";
            if (_this._doc.getFullScreen()) {
                var semitoneHeight = _this._patternEditorRow.clientHeight / SynthConfig_1.Config.windowPitchCount;
                var targetBeatWidth = semitoneHeight * 5;
                var minBeatWidth = _this._patternEditorRow.clientWidth / (_this._doc.song.beatsPerBar * 3);
                var maxBeatWidth = _this._patternEditorRow.clientWidth / (_this._doc.song.beatsPerBar + 2);
                var beatWidth = Math.max(minBeatWidth, Math.min(maxBeatWidth, targetBeatWidth));
                var patternEditorWidth = beatWidth * _this._doc.song.beatsPerBar;
                _this._patternEditorPrev.container.style.width = patternEditorWidth + "px";
                _this._patternEditor.container.style.width = patternEditorWidth + "px";
                _this._patternEditorNext.container.style.width = patternEditorWidth + "px";
                _this._patternEditorPrev.container.style.flexShrink = "0";
                _this._patternEditor.container.style.flexShrink = "0";
                _this._patternEditorNext.container.style.flexShrink = "0";
                _this._patternEditorPrev.container.style.display = "";
                _this._patternEditorNext.container.style.display = "";
                _this._patternEditorPrev.render();
                _this._patternEditorNext.render();
            }
            else {
                _this._patternEditor.container.style.width = "";
                _this._patternEditor.container.style.flexShrink = "";
                _this._patternEditorPrev.container.style.display = "none";
                _this._patternEditorNext.container.style.display = "none";
            }
            _this._patternEditor.render();
            var optionCommands = [
                (_this._doc.autoPlay ? "✓ " : "") + "Auto Play On Load",
                (_this._doc.autoFollow ? "✓ " : "") + "Auto Follow Track",
                (_this._doc.enableNotePreview ? "✓ " : "") + "Preview Added Notes",
                (_this._doc.showLetters ? "✓ " : "") + "Show Piano Keys",
                (_this._doc.showFifth ? "✓ " : "") + 'Highlight "Fifth" Notes',
                (_this._doc.showChannels ? "✓ " : "") + "Show All Channels",
                (_this._doc.showScrollBar ? "✓ " : "") + "Octave Scroll Bar",
                (_this._doc.alwaysShowSettings ? "✓ " : "") + "Customize All Instruments",
                (_this._doc.enableChannelMuting ? "✓ " : "") + "Enable Channel Muting",
                (_this._doc.displayBrowserUrl ? "✓ " : "") + "Display Song Data in URL",
                (_this._doc.fullScreen ? "✓ " : "") + "Full-Screen Layout",
                (_this._doc.colorTheme == "light classic" ? "✓ " : "") + "Light Theme",
            ];
            for (var i = 0; i < optionCommands.length; i++) {
                var option_1 = _this._optionsMenu.children[i + 1];
                if (option_1.innerText != optionCommands[i])
                    option_1.innerText = optionCommands[i];
            }
            var channel = _this._doc.song.channels[_this._doc.channel];
            var pattern = null = _this._doc.getCurrentPattern();
            var instrumentIndex = _this._doc.getCurrentInstrument();
            var instrument = channel.instruments[instrumentIndex];
            var wasActive = _this.mainLayer.contains(document.activeElement);
            var activeElement = null = document.activeElement;
            setSelectedValue(_this._scaleSelect, _this._doc.song.scale);
            _this._scaleSelect.title = SynthConfig_1.Config.scales[_this._doc.song.scale].realName;
            setSelectedValue(_this._keySelect, SynthConfig_1.Config.keys.length - 1 - _this._doc.song.key);
            _this._tempoSlider.updateValue(Math.max(0, Math.min(28, Math.round(4.0 + 9.0 * Math.log(_this._doc.song.tempo / 120.0) / Math.LN2))));
            _this._tempoStepper.value = _this._doc.song.tempo.toString();
            _this._reverbSlider.updateValue(_this._doc.song.reverb);
            setSelectedValue(_this._rhythmSelect, _this._doc.song.rhythm);
            if (_this._doc.song.getChannelIsNoise(_this._doc.channel)) {
                _this._pitchedPresetSelect.style.display = "none";
                _this._drumPresetSelect.style.display = "";
                setSelectedValue(_this._drumPresetSelect, instrument.preset);
            }
            else {
                _this._pitchedPresetSelect.style.display = "";
                _this._drumPresetSelect.style.display = "none";
                setSelectedValue(_this._pitchedPresetSelect, instrument.preset);
            }
            if (!_this._doc.alwaysShowSettings && instrument.preset != instrument.type) {
                _this._customizeInstrumentButton.style.display = "";
                _this._customInstrumentSettingsGroup.style.display = "none";
            }
            else {
                _this._customizeInstrumentButton.style.display = "none";
                _this._customInstrumentSettingsGroup.style.display = "";
                if (instrument.type == 2 /* noise */) {
                    _this._chipNoiseSelectRow.style.display = "";
                    setSelectedValue(_this._chipNoiseSelect, instrument.chipNoise);
                }
                else {
                    _this._chipNoiseSelectRow.style.display = "none";
                }
                if (instrument.type == 3 /* spectrum */) {
                    _this._spectrumRow.style.display = "";
                    _this._spectrumEditor.render();
                }
                else {
                    _this._spectrumRow.style.display = "none";
                }
                if (instrument.type == 5 /* harmonics */) {
                    _this._harmonicsRow.style.display = "";
                    _this._harmonicsEditor.render();
                }
                else {
                    _this._harmonicsRow.style.display = "none";
                }
                if (instrument.type == 4 /* drumset */) {
                    _this._drumsetGroup.style.display = "";
                    _this._transitionRow.style.display = "none";
                    _this._chordSelectRow.style.display = "none";
                    _this._filterCutoffRow.style.display = "none";
                    _this._filterResonanceRow.style.display = "none";
                    _this._filterEnvelopeRow.style.display = "none";
                    for (var i = 0; i < SynthConfig_1.Config.drumCount; i++) {
                        setSelectedValue(_this._drumsetEnvelopeSelects[i], instrument.drumsetEnvelopes[i]);
                        _this._drumsetSpectrumEditors[i].render();
                    }
                }
                else {
                    _this._drumsetGroup.style.display = "none";
                    _this._transitionRow.style.display = "";
                    _this._chordSelectRow.style.display = "";
                    _this._filterCutoffRow.style.display = "";
                    _this._filterResonanceRow.style.display = "";
                    _this._filterEnvelopeRow.style.display = "";
                }
                if (instrument.type == 0 /* chip */) {
                    _this._chipWaveSelectRow.style.display = "";
                    setSelectedValue(_this._chipWaveSelect, instrument.chipWave);
                }
                else {
                    _this._chipWaveSelectRow.style.display = "none";
                }
                if (instrument.type == 1 /* fm */) {
                    _this._algorithmSelectRow.style.display = "";
                    _this._phaseModGroup.style.display = "";
                    _this._feedbackRow1.style.display = "";
                    _this._feedbackRow2.style.display = "";
                    setSelectedValue(_this._algorithmSelect, instrument.algorithm);
                    setSelectedValue(_this._feedbackTypeSelect, instrument.feedbackType);
                    _this._feedbackAmplitudeSlider.updateValue(instrument.feedbackAmplitude);
                    setSelectedValue(_this._feedbackEnvelopeSelect, instrument.feedbackEnvelope);
                    _this._feedbackEnvelopeSelect.parentElement;
                    !.style.color;
                    (instrument.feedbackAmplitude > 0) ? "" : ColorConfig_1.ColorConfig.secondaryText;
                    for (var i = 0; i < SynthConfig_1.Config.operatorCount; i++) {
                        var isCarrier = (i < SynthConfig_1.Config.algorithms[instrument.algorithm].carrierCount);
                        _this._operatorRows[i].style.color = isCarrier ? ColorConfig_1.ColorConfig.primaryText : "";
                        setSelectedValue(_this._operatorFrequencySelects[i], instrument.operators[i].frequency);
                        _this._operatorAmplitudeSliders[i].updateValue(instrument.operators[i].amplitude);
                        setSelectedValue(_this._operatorEnvelopeSelects[i], instrument.operators[i].envelope);
                        var operatorName = (isCarrier ? "Voice " : "Modulator ") + (i + 1);
                        _this._operatorFrequencySelects[i].title = operatorName + " Frequency";
                        _this._operatorAmplitudeSliders[i].input.title = operatorName + (isCarrier ? " Volume" : " Amplitude");
                        _this._operatorEnvelopeSelects[i].title = operatorName + " Envelope";
                        _this._operatorEnvelopeSelects[i].parentElement;
                        !.style.color;
                        (instrument.operators[i].amplitude > 0) ? "" : ColorConfig_1.ColorConfig.secondaryText;
                    }
                }
                else {
                    _this._algorithmSelectRow.style.display = "none";
                    _this._phaseModGroup.style.display = "none";
                    _this._feedbackRow1.style.display = "none";
                    _this._feedbackRow2.style.display = "none";
                }
                if (instrument.type == 6 /* pwm */) {
                    _this._pulseEnvelopeRow.style.display = "";
                    _this._pulseWidthRow.style.display = "";
                    _this._pulseWidthSlider.input.title = EditorConfig_1.prettyNumber(Math.pow(0.5, (SynthConfig_1.Config.pulseWidthRange - instrument.pulseWidth - 1) * 0.5) * 50) + "%";
                    setSelectedValue(_this._pulseEnvelopeSelect, instrument.pulseEnvelope);
                    _this._pulseWidthSlider.updateValue(instrument.pulseWidth);
                }
                else {
                    _this._pulseEnvelopeRow.style.display = "none";
                    _this._pulseWidthRow.style.display = "none";
                }
                if (instrument.type == 2 /* noise */) {
                    _this._vibratoSelectRow.style.display = "none";
                    _this._intervalSelectRow.style.display = "none";
                }
                else if (instrument.type == 3 /* spectrum */) {
                    _this._vibratoSelectRow.style.display = "none";
                    _this._intervalSelectRow.style.display = "none";
                }
                else if (instrument.type == 4 /* drumset */) {
                    _this._vibratoSelectRow.style.display = "none";
                    _this._intervalSelectRow.style.display = "none";
                }
                else if (instrument.type == 0 /* chip */) {
                    _this._vibratoSelectRow.style.display = "";
                    _this._intervalSelectRow.style.display = "";
                }
                else if (instrument.type == 1 /* fm */) {
                    _this._vibratoSelectRow.style.display = "";
                    _this._intervalSelectRow.style.display = "none";
                }
                else if (instrument.type == 5 /* harmonics */) {
                    _this._vibratoSelectRow.style.display = "";
                    _this._intervalSelectRow.style.display = "";
                }
                else if (instrument.type == 6 /* pwm */) {
                    _this._vibratoSelectRow.style.display = "";
                    _this._intervalSelectRow.style.display = "none";
                }
                else {
                    throw new Error("Unrecognized instrument type: " + instrument.type);
                }
            }
            for (var chordIndex = 0; chordIndex < SynthConfig_1.Config.chords.length; chordIndex++) {
                var hidden = !SynthConfig_1.Config.instrumentTypeHasSpecialInterval[instrument.type] ? SynthConfig_1.Config.chords[chordIndex].isCustomInterval : false;
                var option_2 = _this._chordSelect.children[chordIndex];
                if (hidden) {
                    if (!option_2.hasAttribute("hidden")) {
                        option_2.setAttribute("hidden", "");
                    }
                }
                else {
                    option_2.removeAttribute("hidden");
                }
            }
            _this._instrumentSelectRow.style.display = (_this._doc.song.instrumentsPerChannel > 1) ? "" : "none";
            _this._instrumentSelectRow.style.visibility = (pattern == null) ? "hidden" : "";
            if (_this._instrumentSelect.children.length != _this._doc.song.instrumentsPerChannel) {
                while (_this._instrumentSelect.firstChild)
                    _this._instrumentSelect.removeChild(_this._instrumentSelect.firstChild);
                var instrumentList = [];
                for (var i = 0; i < _this._doc.song.instrumentsPerChannel; i++) {
                    instrumentList.push(i + 1);
                }
                buildOptions(_this._instrumentSelect, instrumentList);
            }
            _this._instrumentSettingsGroup.style.color = ColorConfig_1.ColorConfig.getChannelColor(_this._doc.song, _this._doc.channel).primaryNote;
            _this._filterCutoffSlider.updateValue(instrument.filterCutoff);
            _this._filterResonanceSlider.updateValue(instrument.filterResonance);
            setSelectedValue(_this._filterEnvelopeSelect, instrument.filterEnvelope);
            setSelectedValue(_this._transitionSelect, instrument.transition);
            setSelectedValue(_this._effectsSelect, instrument.effects);
            setSelectedValue(_this._vibratoSelect, instrument.vibrato);
            setSelectedValue(_this._intervalSelect, instrument.interval);
            setSelectedValue(_this._chordSelect, instrument.chord);
            _this._instrumentVolumeSlider.updateValue(-instrument.volume);
            _this._panSlider.updateValue(instrument.pan);
            setSelectedValue(_this._instrumentSelect, instrumentIndex);
            _this._volumeSlider.value = String(_this._doc.volume);
            // If an interface element was selected, but becomes invisible (e.g. an instrument
            // select menu) just select the editor container so keyboard commands still work.
            if (wasActive && activeElement != null && activeElement.clientWidth == 0) {
                _this._refocusStage();
            }
            _this._setPrompt(_this._doc.prompt);
            if (_this._doc.autoFollow && !_this._doc.synth.playing) {
                _this._doc.synth.goToBar(_this._doc.bar);
            }
        };
        this._tempoStepperCaptureNumberKeys = function (event) {
            // When the number input is in focus, allow some keyboard events to
            // edit the input without accidentally editing the song otherwise.
            switch (event.keyCode) {
                case 8: // backspace/delete
                case 13: // enter/return
                case 38: // up
                case 40: // down
                case 37: // left
                case 39: // right
                case 48: // 0
                case 49: // 1
                case 50: // 2
                case 51: // 3
                case 52: // 4
                case 53: // 5
                case 54: // 6
                case 55: // 7
                case 56: // 8
                case 57:
                    event.stopPropagation();
                    break;
            }
        };
        this._whenKeyPressed = function (event) {
            if (_this.prompt) {
                if (event.keyCode == 27) {
                    // close prompt.
                    _this._doc.undo();
                }
                return;
            }
            switch (event.keyCode) {
                case 27:
                    new changes_1.ChangePatternSelection(_this._doc, 0, 0);
                    _this._doc.selection.resetBoxSelection();
                    break;
                case 32:
                    _this._togglePlay();
                    event.preventDefault();
                    break;
                case 90:
                    if (event.shiftKey) {
                        _this._doc.redo();
                    }
                    else {
                        _this._doc.undo();
                    }
                    event.preventDefault();
                    break;
                case 89:
                    _this._doc.redo();
                    event.preventDefault();
                    break;
                case 67:
                    _this._doc.selection.copy();
                    event.preventDefault();
                    break;
                case 13:
                    _this._doc.selection.insertBars();
                    event.preventDefault();
                    break;
                case 8:
                    _this._doc.selection.deleteBars();
                    event.preventDefault();
                    break;
                case 65:
                    if (event.shiftKey) {
                        _this._doc.selection.selectChannel();
                    }
                    else {
                        _this._doc.selection.selectAll();
                    }
                    event.preventDefault();
                    break;
                case 68:
                    _this._doc.selection.duplicatePatterns();
                    event.preventDefault();
                    break;
                case 77:
                    if (_this._doc.enableChannelMuting) {
                        _this._doc.selection.muteChannels(event.shiftKey);
                        event.preventDefault();
                    }
                    break;
                case 83:
                    if (_this._doc.enableChannelMuting) {
                        if (event.shiftKey) {
                            _this._doc.selection.muteChannels(false);
                        }
                        else {
                            _this._doc.selection.soloChannels();
                        }
                        event.preventDefault();
                    }
                    break;
                case 86:
                    if (event.shiftKey) {
                        _this._doc.selection.pasteNumbers();
                    }
                    else {
                        _this._doc.selection.pasteNotes();
                    }
                    event.preventDefault();
                    break;
                case 73:
                    if (event.shiftKey) {
                        var instrument = _this._doc.song.channels[_this._doc.channel].instruments[_this._doc.getCurrentInstrument()];
                        var instrumentObject = instrument.toJsonObject();
                        delete instrumentObject["volume"];
                        delete instrumentObject["pan"];
                        delete instrumentObject["preset"];
                        _this._copyTextToClipboard(JSON.stringify(instrumentObject));
                    }
                    event.preventDefault();
                    break;
                case 219:
                    _this._doc.synth.prevBar();
                    if (_this._doc.autoFollow) {
                        new changes_1.ChangeChannelBar(_this._doc, _this._doc.channel, Math.floor(_this._doc.synth.playhead));
                    }
                    event.preventDefault();
                    break;
                case 221:
                    _this._doc.synth.nextBar();
                    if (_this._doc.autoFollow) {
                        new changes_1.ChangeChannelBar(_this._doc, _this._doc.channel, Math.floor(_this._doc.synth.playhead));
                    }
                    event.preventDefault();
                    break;
                case 189: // -
                case 173:
                    _this._doc.selection.transpose(false, event.shiftKey);
                    event.preventDefault();
                    break;
                case 187: // +
                case 61:
                    _this._doc.selection.transpose(true, event.shiftKey);
                    event.preventDefault();
                    break;
                case 38:
                    if (event.shiftKey) {
                        _this._doc.selection.boxSelectionY1 = Math.max(0, _this._doc.selection.boxSelectionY1 - 1);
                        _this._doc.selection.selectionUpdated();
                    }
                    else {
                        _this._doc.selection.setChannelBar((_this._doc.channel - 1 + _this._doc.song.getChannelCount()) % _this._doc.song.getChannelCount(), _this._doc.bar);
                        _this._doc.selection.resetBoxSelection();
                    }
                    event.preventDefault();
                    break;
                case 40:
                    if (event.shiftKey) {
                        _this._doc.selection.boxSelectionY1 = Math.min(_this._doc.song.getChannelCount() - 1, _this._doc.selection.boxSelectionY1 + 1);
                        _this._doc.selection.selectionUpdated();
                    }
                    else {
                        _this._doc.selection.setChannelBar((_this._doc.channel + 1) % _this._doc.song.getChannelCount(), _this._doc.bar);
                        _this._doc.selection.resetBoxSelection();
                    }
                    event.preventDefault();
                    break;
                case 37:
                    if (event.shiftKey) {
                        _this._doc.selection.boxSelectionX1 = Math.max(0, _this._doc.selection.boxSelectionX1 - 1);
                        _this._doc.selection.scrollToSelection();
                        _this._doc.selection.selectionUpdated();
                    }
                    else {
                        _this._doc.selection.setChannelBar(_this._doc.channel, (_this._doc.bar + _this._doc.song.barCount - 1) % _this._doc.song.barCount);
                        _this._doc.selection.resetBoxSelection();
                    }
                    event.preventDefault();
                    break;
                case 39:
                    if (event.shiftKey) {
                        _this._doc.selection.boxSelectionX1 = Math.min(_this._doc.song.barCount - 1, _this._doc.selection.boxSelectionX1 + 1);
                        _this._doc.selection.scrollToSelection();
                        _this._doc.selection.selectionUpdated();
                    }
                    else {
                        _this._doc.selection.setChannelBar(_this._doc.channel, (_this._doc.bar + 1) % _this._doc.song.barCount);
                        _this._doc.selection.resetBoxSelection();
                    }
                    event.preventDefault();
                    break;
                case 48:
                    _this._doc.selection.nextDigit("0");
                    event.preventDefault();
                    break;
                case 49:
                    _this._doc.selection.nextDigit("1");
                    event.preventDefault();
                    break;
                case 50:
                    _this._doc.selection.nextDigit("2");
                    event.preventDefault();
                    break;
                case 51:
                    _this._doc.selection.nextDigit("3");
                    event.preventDefault();
                    break;
                case 52:
                    _this._doc.selection.nextDigit("4");
                    event.preventDefault();
                    break;
                case 53:
                    _this._doc.selection.nextDigit("5");
                    event.preventDefault();
                    break;
                case 54:
                    _this._doc.selection.nextDigit("6");
                    event.preventDefault();
                    break;
                case 55:
                    _this._doc.selection.nextDigit("7");
                    event.preventDefault();
                    break;
                case 56:
                    _this._doc.selection.nextDigit("8");
                    event.preventDefault();
                    break;
                case 57:
                    _this._doc.selection.nextDigit("9");
                    event.preventDefault();
                    break;
                default:
                    _this._doc.selection.digits = "";
                    break;
            }
        };
        this._whenPrevBarPressed = function () {
            _this._doc.synth.prevBar();
        };
        this._whenNextBarPressed = function () {
            _this._doc.synth.nextBar();
        };
        this._togglePlay = function () {
            if (_this._doc.synth.playing) {
                _this._pause();
            }
            else {
                _this._doc.synth.snapToBar();
                _this._play();
            }
        };
        this._setVolumeSlider = function () {
            _this._doc.setVolume(Number(_this._volumeSlider.value));
        };
        this._whenSetTempo = function () {
            _this._doc.record(new changes_1.ChangeTempo(_this._doc, -1, parseInt(_this._tempoStepper.value) | 0));
        };
        this._whenSetScale = function () {
            if (isNaN(_this._scaleSelect.value)) {
                switch (_this._scaleSelect.value) {
                    case "forceScale":
                        _this._doc.selection.forceScale();
                        break;
                }
                _this._doc.notifier.changed();
            }
            else {
                _this._doc.record(new changes_1.ChangeScale(_this._doc, _this._scaleSelect.selectedIndex));
            }
        };
        this._whenSetKey = function () {
            if (isNaN(_this._keySelect.value)) {
                switch (_this._keySelect.value) {
                    case "detectKey":
                        _this._doc.record(new changes_1.ChangeDetectKey(_this._doc));
                        break;
                }
                _this._doc.notifier.changed();
            }
            else {
                _this._doc.record(new changes_1.ChangeKey(_this._doc, SynthConfig_1.Config.keys.length - 1 - _this._keySelect.selectedIndex));
            }
        };
        this._whenSetRhythm = function () {
            if (isNaN(_this._rhythmSelect.value)) {
                switch (_this._rhythmSelect.value) {
                    case "forceRhythm":
                        _this._doc.selection.forceRhythm();
                        break;
                }
                _this._doc.notifier.changed();
            }
            else {
                _this._doc.record(new changes_1.ChangeRhythm(_this._doc, _this._rhythmSelect.selectedIndex));
            }
        };
        this._whenSetPitchedPreset = function () {
            _this._setPreset(_this._pitchedPresetSelect.value);
        };
        this._whenSetDrumPreset = function () {
            _this._setPreset(_this._drumPresetSelect.value);
        };
        this._whenSetFeedbackType = function () {
            _this._doc.record(new changes_1.ChangeFeedbackType(_this._doc, _this._feedbackTypeSelect.selectedIndex));
        };
        this._whenSetFeedbackEnvelope = function () {
            _this._doc.record(new changes_1.ChangeFeedbackEnvelope(_this._doc, _this._feedbackEnvelopeSelect.selectedIndex));
        };
        this._whenSetAlgorithm = function () {
            _this._doc.record(new changes_1.ChangeAlgorithm(_this._doc, _this._algorithmSelect.selectedIndex));
        };
        this._whenSetInstrument = function () {
            _this._doc.selection.setInstrument(_this._instrumentSelect.selectedIndex);
        };
        this._whenCustomizePressed = function () {
            _this._doc.record(new changes_1.ChangeCustomizeInstrument(_this._doc));
        };
        this._whenSetChipWave = function () {
            _this._doc.record(new changes_1.ChangeChipWave(_this._doc, _this._chipWaveSelect.selectedIndex));
        };
        this._whenSetNoiseWave = function () {
            _this._doc.record(new changes_1.ChangeNoiseWave(_this._doc, _this._chipNoiseSelect.selectedIndex));
        };
        this._whenSetFilterEnvelope = function () {
            _this._doc.record(new changes_1.ChangeFilterEnvelope(_this._doc, _this._filterEnvelopeSelect.selectedIndex));
        };
        this._whenSetPulseEnvelope = function () {
            _this._doc.record(new changes_1.ChangePulseEnvelope(_this._doc, _this._pulseEnvelopeSelect.selectedIndex));
        };
        this._whenSetTransition = function () {
            _this._doc.record(new changes_1.ChangeTransition(_this._doc, _this._transitionSelect.selectedIndex));
        };
        this._whenSetEffects = function () {
            _this._doc.record(new changes_1.ChangeEffects(_this._doc, _this._effectsSelect.selectedIndex));
        };
        this._whenSetVibrato = function () {
            _this._doc.record(new changes_1.ChangeVibrato(_this._doc, _this._vibratoSelect.selectedIndex));
        };
        this._whenSetInterval = function () {
            _this._doc.record(new changes_1.ChangeInterval(_this._doc, _this._intervalSelect.selectedIndex));
        };
        this._whenSetChord = function () {
            _this._doc.record(new changes_1.ChangeChord(_this._doc, _this._chordSelect.selectedIndex));
        };
        this._fileMenuHandler = function (event) {
            switch (_this._fileMenu.value) {
                case "new":
                    _this._doc.goBackToStart();
                    for (var _i = 0, _a = _this._doc.song.channels; _i < _a.length; _i++) {
                        var channel = _a[_i];
                        channel.muted = false;
                    }
                    _this._doc.record(new changes_1.ChangeSong(_this._doc, ""), false, true);
                    break;
                case "export":
                    _this._openPrompt("export");
                    break;
                case "import":
                    _this._openPrompt("import");
                    break;
                case "copyUrl":
                    _this._copyTextToClipboard(new URL("#" + _this._doc.song.toBase64String(), location.href).href);
                    break;
                case "shareUrl":
                    navigator.share({ url: new URL("#" + _this._doc.song.toBase64String(), location.href).href });
                    break;
                case "shortenUrl":
                    window.open("https://tinyurl.com/api-create.php?url=" + encodeURIComponent(new URL("#" + _this._doc.song.toBase64String(), location.href).href));
                    break;
                case "viewPlayer":
                    location.href = "player/#song=" + _this._doc.song.toBase64String();
                    break;
                case "copyEmbed":
                    _this._copyTextToClipboard("<iframe width=\"384\" height=\"60\" style=\"border: none;\" src=\"" + new URL("player/#song=" + _this._doc.song.toBase64String(), location.href).href + "\"></iframe>");
                    break;
                case "songRecovery":
                    _this._openPrompt("songRecovery");
                    break;
            }
            _this._fileMenu.selectedIndex = 0;
        };
        this._editMenuHandler = function (event) {
            switch (_this._editMenu.value) {
                case "undo":
                    _this._doc.undo();
                    break;
                case "redo":
                    _this._doc.redo();
                    break;
                case "copy":
                    _this._doc.selection.copy();
                    break;
                case "insertBars":
                    _this._doc.selection.insertBars();
                    break;
                case "deleteBars":
                    _this._doc.selection.deleteBars();
                    break;
                case "pasteNotes":
                    _this._doc.selection.pasteNotes();
                    break;
                case "pasteNumbers":
                    _this._doc.selection.pasteNumbers();
                    break;
                case "transposeUp":
                    _this._doc.selection.transpose(true, false);
                    break;
                case "transposeDown":
                    _this._doc.selection.transpose(false, false);
                    break;
                case "selectAll":
                    _this._doc.selection.selectAll();
                    break;
                case "selectChannel":
                    _this._doc.selection.selectChannel();
                    break;
                case "duplicatePatterns":
                    _this._doc.selection.duplicatePatterns();
                    break;
                case "barCount":
                    _this._openPrompt("barCount");
                    break;
                case "beatsPerBar":
                    _this._openPrompt("beatsPerBar");
                    break;
                case "moveNotesSideways":
                    _this._openPrompt("moveNotesSideways");
                    break;
                case "channelSettings":
                    _this._openPrompt("channelSettings");
                    break;
            }
            _this._editMenu.selectedIndex = 0;
        };
        this._optionsMenuHandler = function (event) {
            switch (_this._optionsMenu.value) {
                case "autoPlay":
                    _this._doc.autoPlay = !_this._doc.autoPlay;
                    break;
                case "autoFollow":
                    _this._doc.autoFollow = !_this._doc.autoFollow;
                    break;
                case "enableNotePreview":
                    _this._doc.enableNotePreview = !_this._doc.enableNotePreview;
                    break;
                case "showLetters":
                    _this._doc.showLetters = !_this._doc.showLetters;
                    break;
                case "showFifth":
                    _this._doc.showFifth = !_this._doc.showFifth;
                    break;
                case "showChannels":
                    _this._doc.showChannels = !_this._doc.showChannels;
                    break;
                case "showScrollBar":
                    _this._doc.showScrollBar = !_this._doc.showScrollBar;
                    break;
                case "alwaysShowSettings":
                    _this._doc.alwaysShowSettings = !_this._doc.alwaysShowSettings;
                    break;
                case "enableChannelMuting":
                    _this._doc.enableChannelMuting = !_this._doc.enableChannelMuting;
                    for (var _i = 0, _a = _this._doc.song.channels; _i < _a.length; _i++) {
                        var channel = _a[_i];
                        channel.muted = false;
                    }
                    break;
                case "displayBrowserUrl":
                    _this._doc.toggleDisplayBrowserUrl();
                    break;
                case "fullScreen":
                    _this._doc.fullScreen = !_this._doc.fullScreen;
                    Layout_1.Layout.setFullScreen(_this._doc.fullScreen);
                    break;
                case "colorTheme":
                    _this._doc.colorTheme = _this._doc.colorTheme == "light classic" ? "dark classic" : "light classic";
                    ColorConfig_1.ColorConfig.setTheme(_this._doc.colorTheme);
                    break;
            }
            _this._optionsMenu.selectedIndex = 0;
            _this._doc.notifier.changed();
            _this._doc.savePreferences();
        };
        this._doc.notifier.watch(this.whenUpdated);
        window.addEventListener("resize", this.whenUpdated);
        if (!("share" in navigator)) {
            this._fileMenu.removeChild(this._fileMenu.querySelector("[value='shareUrl']"), !);
        }
        this._scaleSelect.appendChild(optgroup({ label: "Edit" }, option({ value: "forceScale" }, "Snap Notes To Scale")));
        this._keySelect.appendChild(optgroup({ label: "Edit" }, option({ value: "detectKey" }, "Detect Key")));
        this._rhythmSelect.appendChild(optgroup({ label: "Edit" }, option({ value: "forceRhythm" }, "Snap Notes To Rhythm")));
        this._phaseModGroup.appendChild(div({ class: "operatorRow", style: "color: " + ColorConfig_1.ColorConfig.secondaryText + "; height: 1em; margin-top: 0.5em;" }, div({ style: "margin-right: .1em; visibility: hidden;" }, 1 + "."), div({ style: "width: 3em; margin-right: .3em;", class: "tip", onclick: function () { return _this._openPrompt("operatorFrequency"); } }, "Freq:"), div({ style: "width: 4em; margin: 0;", class: "tip", onclick: function () { return _this._openPrompt("operatorVolume"); } }, "Volume:"), div({ style: "width: 5em; margin-left: .3em;", class: "tip", onclick: function () { return _this._openPrompt("operatorEnvelope"); } }, "Envelope:")));
        for (var i = 0; i < SynthConfig_1.Config.operatorCount; i++) {
            var operatorIndex = i;
            var operatorNumber = div({ style: "margin-right: .1em; color: " + ColorConfig_1.ColorConfig.secondaryText + ";" }, i + 1 + ".");
            var frequencySelect = buildOptions(select({ style: "width: 100%;", title: "Frequency" }), SynthConfig_1.Config.operatorFrequencies.map(function (freq) { return freq.name; }));
            var amplitudeSlider = new Slider(input({ style: "margin: 0; width: 4em;", type: "range", min: "0", max: SynthConfig_1.Config.operatorAmplitudeMax, value: "0", step: "1", title: "Volume" }), this._doc, function (oldValue, newValue) { return new changes_1.ChangeOperatorAmplitude(_this._doc, operatorIndex, oldValue, newValue); });
            var envelopeSelect = buildOptions(select({ style: "width: 100%;", title: "Envelope" }), SynthConfig_1.Config.envelopes.map(function (envelope) { return envelope.name; }));
            var row = div({ class: "operatorRow" }, operatorNumber, div({ class: "selectContainer", style: "width: 3em; margin-right: .3em;" }, frequencySelect), amplitudeSlider.input, div({ class: "selectContainer", style: "width: 5em; margin-left: .3em;" }, envelopeSelect));
            this._phaseModGroup.appendChild(row);
            this._operatorRows[i] = row;
            this._operatorAmplitudeSliders[i] = amplitudeSlider;
            this._operatorEnvelopeSelects[i] = envelopeSelect;
            this._operatorFrequencySelects[i] = frequencySelect;
            envelopeSelect.addEventListener("change", function () {
                _this._doc.record(new changes_1.ChangeOperatorEnvelope(_this._doc, operatorIndex, envelopeSelect.selectedIndex));
            });
            frequencySelect.addEventListener("change", function () {
                _this._doc.record(new changes_1.ChangeOperatorFrequency(_this._doc, operatorIndex, frequencySelect.selectedIndex));
            });
        }
        this._drumsetGroup.appendChild(div({ class: "selectRow" }, span({ class: "tip", onclick: function () { return _this._openPrompt("drumsetEnvelope"); } }, "Envelope:"), span({ class: "tip", onclick: function () { return _this._openPrompt("drumsetSpectrum"); } }, "Spectrum:")));
        for (var i = SynthConfig_1.Config.drumCount - 1; i >= 0; i--) {
            var drumIndex = i;
            var spectrumEditor = new SpectrumEditor_1.SpectrumEditor(this._doc, drumIndex);
            spectrumEditor.container.addEventListener("mousedown", this._refocusStage);
            this._drumsetSpectrumEditors[i] = spectrumEditor;
            var envelopeSelect = buildOptions(select({ style: "width: 100%;", title: "Filter Envelope" }), SynthConfig_1.Config.envelopes.map(function (envelope) { return envelope.name; }));
            this._drumsetEnvelopeSelects[i] = envelopeSelect;
            envelopeSelect.addEventListener("change", function () {
                _this._doc.record(new changes_1.ChangeDrumsetEnvelope(_this._doc, drumIndex, envelopeSelect.selectedIndex));
            });
            var row = div({ class: "selectRow" }, div({ class: "selectContainer", style: "width: 5em; margin-right: .3em;" }, envelopeSelect), this._drumsetSpectrumEditors[i].container);
            this._drumsetGroup.appendChild(row);
        }
        this._fileMenu.addEventListener("change", this._fileMenuHandler);
        this._editMenu.addEventListener("change", this._editMenuHandler);
        this._optionsMenu.addEventListener("change", this._optionsMenuHandler);
        this._tempoStepper.addEventListener("change", this._whenSetTempo);
        this._scaleSelect.addEventListener("change", this._whenSetScale);
        this._keySelect.addEventListener("change", this._whenSetKey);
        this._rhythmSelect.addEventListener("change", this._whenSetRhythm);
        this._pitchedPresetSelect.addEventListener("change", this._whenSetPitchedPreset);
        this._drumPresetSelect.addEventListener("change", this._whenSetDrumPreset);
        this._algorithmSelect.addEventListener("change", this._whenSetAlgorithm);
        this._instrumentSelect.addEventListener("change", this._whenSetInstrument);
        this._customizeInstrumentButton.addEventListener("click", this._whenCustomizePressed);
        this._feedbackTypeSelect.addEventListener("change", this._whenSetFeedbackType);
        this._feedbackEnvelopeSelect.addEventListener("change", this._whenSetFeedbackEnvelope);
        this._chipWaveSelect.addEventListener("change", this._whenSetChipWave);
        this._chipNoiseSelect.addEventListener("change", this._whenSetNoiseWave);
        this._transitionSelect.addEventListener("change", this._whenSetTransition);
        this._effectsSelect.addEventListener("change", this._whenSetEffects);
        this._filterEnvelopeSelect.addEventListener("change", this._whenSetFilterEnvelope);
        this._pulseEnvelopeSelect.addEventListener("change", this._whenSetPulseEnvelope);
        this._intervalSelect.addEventListener("change", this._whenSetInterval);
        this._chordSelect.addEventListener("change", this._whenSetChord);
        this._vibratoSelect.addEventListener("change", this._whenSetVibrato);
        this._playButton.addEventListener("click", this._togglePlay);
        this._prevBarButton.addEventListener("click", this._whenPrevBarPressed);
        this._nextBarButton.addEventListener("click", this._whenNextBarPressed);
        this._volumeSlider.addEventListener("input", this._setVolumeSlider);
        this._patternArea.addEventListener("mousedown", this._refocusStage);
        this._trackArea.addEventListener("mousedown", this._refocusStage);
        this._spectrumEditor.container.addEventListener("mousedown", this._refocusStage);
        this._harmonicsEditor.container.addEventListener("mousedown", this._refocusStage);
        this._tempoStepper.addEventListener("keydown", this._tempoStepperCaptureNumberKeys, false);
        this.mainLayer.addEventListener("keydown", this._whenKeyPressed);
        this._promptContainer.addEventListener("click", function (event) {
            if (event.target == _this._promptContainer) {
                _this._doc.undo();
            }
        });
        if (EditorConfig_1.isMobile) {
            var autoPlayOption = this._optionsMenu.querySelector("[value=autoPlay]");
            autoPlayOption.disabled = true;
            autoPlayOption.setAttribute("hidden", "");
        }
        if (window.screen.availWidth < 700 || window.screen.availHeight < 700) {
            var fullScreenOption = this._optionsMenu.querySelector("[value=fullScreen]");
            fullScreenOption.disabled = true;
            fullScreenOption.setAttribute("hidden", "");
        }
        var _a, _b, _c, _d, _e, _f;
    }
    SongEditor.prototype._openPrompt = function (promptName) {
        this._doc.openPrompt(promptName);
        this._setPrompt(promptName);
    };
    SongEditor.prototype._setPrompt = function (promptName) {
        if (promptName === void 0) { promptName = null; }
        if (this._currentPromptName == promptName)
            return;
        this._currentPromptName = promptName;
        if (this.prompt) {
            if (this._wasPlaying && !(this.prompt instanceof TipPrompt_1.TipPrompt)) {
                this._play();
            }
            this._wasPlaying = false;
            this._promptContainer.style.display = "none";
            this._promptContainer.removeChild(this.prompt.container);
            this.prompt.cleanUp();
            this.prompt = null;
            this._refocusStage();
        }
        if (promptName) {
            switch (promptName) {
                case "export":
                    this.prompt = new ExportPrompt_1.ExportPrompt(this._doc);
                    break;
                case "import":
                    this.prompt = new ImportPrompt_1.ImportPrompt(this._doc);
                    break;
                case "songRecovery":
                    this.prompt = new SongRecoveryPrompt_1.SongRecoveryPrompt(this._doc);
                    break;
                case "barCount":
                    this.prompt = new SongDurationPrompt_1.SongDurationPrompt(this._doc);
                    break;
                case "beatsPerBar":
                    this.prompt = new BeatsPerBarPrompt_1.BeatsPerBarPrompt(this._doc);
                    break;
                case "moveNotesSideways":
                    this.prompt = new MoveNotesSidewaysPrompt_1.MoveNotesSidewaysPrompt(this._doc);
                    break;
                case "channelSettings":
                    this.prompt = new ChannelSettingsPrompt_1.ChannelSettingsPrompt(this._doc);
                    break;
                default:
                    this.prompt = new TipPrompt_1.TipPrompt(this._doc, promptName);
                    break;
            }
            if (this.prompt) {
                if (!(this.prompt instanceof TipPrompt_1.TipPrompt)) {
                    this._wasPlaying = this._doc.synth.playing;
                    this._pause();
                }
                this._promptContainer.style.display = "";
                this._promptContainer.appendChild(this.prompt.container);
            }
        }
    };
    SongEditor.prototype.updatePlayButton = function () {
        if (this._doc.synth.playing) {
            this._playButton.classList.remove("playButton");
            this._playButton.classList.add("pauseButton");
            this._playButton.title = "Pause (Space)";
            this._playButton.innerText = "Pause";
        }
        else {
            this._playButton.classList.remove("pauseButton");
            this._playButton.classList.add("playButton");
            this._playButton.title = "Play (Space)";
            this._playButton.innerText = "Play";
        }
    };
    SongEditor.prototype._copyTextToClipboard = function (text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(function () {
                window.prompt("Copy to clipboard:", text);
            });
            return;
        }
        var textField = document.createElement("textarea");
        textField.innerText = text;
        document.body.appendChild(textField);
        textField.select();
        var succeeded = document.execCommand("copy");
        textField.remove();
        this._refocusStage();
        if (!succeeded)
            window.prompt("Copy this:", text);
    };
    SongEditor.prototype._play = function () {
        this._doc.synth.play();
        this.updatePlayButton();
    };
    SongEditor.prototype._pause = function () {
        this._doc.synth.pause();
        this._doc.synth.resetEffects();
        if (this._doc.autoFollow) {
            this._doc.synth.goToBar(this._doc.bar);
        }
        this._doc.synth.snapToBar();
        this.updatePlayButton();
    };
    SongEditor.prototype._copyInstrument = function () {
        var channel = this._doc.song.channels[this._doc.channel];
        var instrument = channel.instruments[this._doc.getCurrentInstrument()];
        var instrumentCopy = instrument.toJsonObject();
        instrumentCopy["isDrum"] = this._doc.song.getChannelIsNoise(this._doc.channel);
        window.localStorage.setItem("instrumentCopy", JSON.stringify(instrumentCopy));
    };
    SongEditor.prototype._pasteInstrument = function () {
        var channel = this._doc.song.channels[this._doc.channel];
        var instrument = channel.instruments[this._doc.getCurrentInstrument()];
        var instrumentCopy = JSON.parse(String(window.localStorage.getItem("instrumentCopy")));
        if (instrumentCopy != null && instrumentCopy["isDrum"] == this._doc.song.getChannelIsNoise(this._doc.channel)) {
            this._doc.record(new changes_1.ChangePasteInstrument(this._doc, instrument, instrumentCopy));
        }
    };
    SongEditor.prototype._randomPreset = function () {
        var isNoise = this._doc.song.getChannelIsNoise(this._doc.channel);
        this._doc.record(new changes_1.ChangePreset(this._doc, changes_1.pickRandomPresetValue(isNoise)));
    };
    SongEditor.prototype._randomGenerated = function () {
        this._doc.record(new changes_1.ChangeRandomGeneratedInstrument(this._doc));
    };
    SongEditor.prototype._setPreset = function (preset) {
        if (isNaN(preset)) {
            switch (preset) {
                case "copyInstrument":
                    this._copyInstrument();
                    break;
                case "pasteInstrument":
                    this._pasteInstrument();
                    break;
                case "randomPreset":
                    this._randomPreset();
                    break;
                case "randomGenerated":
                    this._randomGenerated();
                    break;
            }
            this._doc.notifier.changed();
        }
        else {
            this._doc.record(new changes_1.ChangePreset(this._doc, parseInt(preset)));
        }
    };
    return SongEditor;
})();
exports.SongEditor = SongEditor;
//}
