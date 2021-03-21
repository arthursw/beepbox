// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SynthConfig_1 = require("../synth/SynthConfig");
var synth_1 = require("../synth/synth");
var EditorConfig_1 = require("./EditorConfig");
var Change_1 = require("./Change");
//namespace beepbox {
function unionOfUsedNotes(pattern, flags) {
    for (var _i = 0, _a = pattern.notes; _i < _a.length; _i++) {
        var note = _a[_i];
        for (var _b = 0, _c = note.pitches; _b < _c.length; _b++) {
            var pitch = _c[_b];
            for (var _d = 0, _e = note.pins; _d < _e.length; _d++) {
                var pin = _e[_d];
                var key = (pitch + pin.interval) % 12;
                if (!flags[key]) {
                    flags[key] = true;
                }
            }
        }
    }
}
exports.unionOfUsedNotes = unionOfUsedNotes;
function generateScaleMap(oldScaleFlags, newScaleValue) {
    var newScaleFlags = SynthConfig_1.Config.scales[newScaleValue].flags;
    var oldScale = [];
    var newScale = [];
    for (var i = 0; i < 12; i++) {
        if (oldScaleFlags[i])
            oldScale.push(i);
        if (newScaleFlags[i])
            newScale.push(i);
    }
    var largerToSmaller = oldScale.length > newScale.length;
    var smallerScale = largerToSmaller ? newScale : oldScale;
    var largerScale = largerToSmaller ? oldScale : newScale;
    var roles = ["root", "second", "second", "third", "third", "fourth", "tritone", "fifth", "sixth", "sixth", "seventh", "seventh", "root"];
    var bestScore = Number.MAX_SAFE_INTEGER;
    var bestIndexMap = [];
    var stack = [[0]]; // Root always maps to root.
    while (stack.length > 0) {
        var indexMap = stack.pop();
        !;
        if (indexMap.length == smallerScale.length) {
            // Score this mapping.
            var score = 0;
            for (var i = 0; i < indexMap.length; i++) {
                score += Math.abs(smallerScale[i] - largerScale[indexMap[i]]);
                if (roles[smallerScale[i]] != roles[largerScale[indexMap[i]]]) {
                    // Penalize changing roles.
                    score += 0.75;
                }
            }
            if (bestScore > score) {
                bestScore = score;
                bestIndexMap = indexMap;
            }
        }
        else {
            // Recursively choose next indices for mapping.
            var lowIndex = indexMap[indexMap.length - 1] + 1;
            var highIndex = largerScale.length - smallerScale.length + indexMap.length;
            for (var i = lowIndex; i <= highIndex; i++) {
                stack.push(indexMap.concat(i));
            }
        }
    }
    var sparsePitchMap = [];
    for (var i = 0; i < bestIndexMap.length; i++) {
        var smallerScalePitch = smallerScale[i];
        var largerScalePitch = largerScale[bestIndexMap[i]];
        sparsePitchMap[i] = largerToSmaller
            ? [largerScalePitch, smallerScalePitch]
            : [smallerScalePitch, largerScalePitch];
    }
    // To make it easier to wrap around.
    sparsePitchMap.push([12, 12]);
    newScale.push(12);
    var sparseIndex = 0;
    var fullPitchMap = [];
    for (var i = 0; i < 12; i++) {
        var oldLow = sparsePitchMap[sparseIndex][0];
        var newLow = sparsePitchMap[sparseIndex][1];
        var oldHigh = sparsePitchMap[sparseIndex + 1][0];
        var newHigh = sparsePitchMap[sparseIndex + 1][1];
        if (i == oldHigh - 1)
            sparseIndex++;
        var transformedPitch = (i - oldLow) * (newHigh - newLow) / (oldHigh - oldLow) + newLow;
        var nearestPitch = 0;
        var nearestPitchDistance = Number.MAX_SAFE_INTEGER;
        for (var _i = 0; _i < newScale.length; _i++) {
            var newPitch = newScale[_i];
            var distance = Math.abs(newPitch - transformedPitch);
            if (roles[newPitch] != roles[i]) {
                // Again, penalize changing roles.
                distance += 0.1;
            }
            if (nearestPitchDistance > distance) {
                nearestPitchDistance = distance;
                nearestPitch = newPitch;
            }
        }
        fullPitchMap[i] = nearestPitch;
    }
    return fullPitchMap;
}
exports.generateScaleMap = generateScaleMap;
function projectNoteIntoBar(oldNote, timeOffset, noteStartPart, noteEndPart, newNotes) {
    // Create a new note, and interpret the pitch bend and expression events
    // to determine where we need to insert pins to control interval and volume.
    var newNote = new synth_1.Note(-1, noteStartPart, noteEndPart, 3, false);
    newNotes.push(newNote);
    newNote.pins.length = 0;
    newNote.pitches.length = 0;
    var newNoteLength = noteEndPart - noteStartPart;
    for (var _i = 0, _a = oldNote.pitches; _i < _a.length; _i++) {
        var pitch = _a[_i];
        newNote.pitches.push(pitch);
    }
    for (var pinIndex = 0; pinIndex < oldNote.pins.length; pinIndex++) {
        var pin = oldNote.pins[pinIndex];
        var newPinTime = pin.time + timeOffset;
        if (newPinTime < 0) {
            if (pinIndex + 1 >= oldNote.pins.length)
                throw new Error("Error converting pins in note overflow.");
            var nextPin = oldNote.pins[pinIndex + 1];
            var nextPinTime = nextPin.time + timeOffset;
            if (nextPinTime > 0) {
                // Insert an interpolated pin at the start of the new note.
                var ratio = (-newPinTime) / (nextPinTime - newPinTime);
                newNote.pins.push(synth_1.makeNotePin(Math.round(pin.interval + ratio * (nextPin.interval - pin.interval)), 0, Math.round(pin.volume + ratio * (nextPin.volume - pin.volume))));
            }
        }
        else if (newPinTime <= newNoteLength) {
            newNote.pins.push(synth_1.makeNotePin(pin.interval, newPinTime, pin.volume));
        }
        else {
            if (pinIndex < 1)
                throw new Error("Error converting pins in note overflow.");
            var prevPin = oldNote.pins[pinIndex - 1];
            var prevPinTime = prevPin.time + timeOffset;
            if (prevPinTime < newNoteLength) {
                // Insert an interpolated pin at the end of the new note.
                var ratio = (newNoteLength - prevPinTime) / (newPinTime - prevPinTime);
                newNote.pins.push(synth_1.makeNotePin(Math.round(prevPin.interval + ratio * (pin.interval - prevPin.interval)), newNoteLength, Math.round(prevPin.volume + ratio * (pin.volume - prevPin.volume))));
            }
        }
    }
    // Fix from Jummbus: Ensure the first pin's interval is zero, adjust pitches and pins to compensate.
    var offsetInterval = newNote.pins[0].interval;
    for (var pitchIdx = 0; pitchIdx < newNote.pitches.length; pitchIdx++) {
        newNote.pitches[pitchIdx] += offsetInterval;
    }
    for (var pinIdx = 0; pinIdx < newNote.pins.length; pinIdx++) {
        newNote.pins[pinIdx].interval -= offsetInterval;
    }
}
var ChangeMoveAndOverflowNotes = (function (_super) {
    __extends(ChangeMoveAndOverflowNotes, _super);
    function ChangeMoveAndOverflowNotes(doc, newBeatsPerBar, partsToMove) {
        _super.call(this);
        var pitchChannels = [];
        var noiseChannels = [];
        for (var channelIndex = 0; channelIndex < doc.song.getChannelCount(); channelIndex++) {
            var oldChannel = doc.song.channels[channelIndex];
            var newChannel = new synth_1.Channel();
            if (channelIndex < doc.song.pitchChannelCount) {
                pitchChannels.push(newChannel);
            }
            else {
                noiseChannels.push(newChannel);
            }
            newChannel.muted = oldChannel.muted;
            newChannel.octave = oldChannel.octave;
            for (var _i = 0, _a = oldChannel.instruments; _i < _a.length; _i++) {
                var instrument_1 = _a[_i];
                newChannel.instruments.push(instrument_1);
            }
            var oldPartsPerBar = SynthConfig_1.Config.partsPerBeat * doc.song.beatsPerBar;
            var newPartsPerBar = SynthConfig_1.Config.partsPerBeat * newBeatsPerBar;
            var currentBar = -1;
            var pattern = null = null;
            for (var oldBar = 0; oldBar < doc.song.barCount; oldBar++) {
                var oldPattern = null = doc.song.getPattern(channelIndex, oldBar);
                if (oldPattern != null) {
                    var oldBarStart = oldBar * oldPartsPerBar;
                    for (var _b = 0, _c = oldPattern.notes; _b < _c.length; _b++) {
                        var oldNote = _c[_b];
                        var absoluteNoteStart = oldNote.start + oldBarStart + partsToMove;
                        var absoluteNoteEnd = oldNote.end + oldBarStart + partsToMove;
                        var startBar = Math.floor(absoluteNoteStart / newPartsPerBar);
                        var endBar = Math.ceil(absoluteNoteEnd / newPartsPerBar);
                        for (var bar = startBar; bar < endBar; bar++) {
                            var barStartPart = bar * newPartsPerBar;
                            var noteStartPart = Math.max(0, absoluteNoteStart - barStartPart);
                            var noteEndPart = Math.min(newPartsPerBar, absoluteNoteEnd - barStartPart);
                            if (noteStartPart < noteEndPart) {
                                // Ensure a pattern exists for the current bar before inserting notes into it.
                                if (currentBar != bar || pattern == null) {
                                    currentBar++;
                                    while (currentBar < bar) {
                                        newChannel.bars[currentBar] = 0;
                                        currentBar++;
                                    }
                                    pattern = new synth_1.Pattern();
                                    newChannel.patterns.push(pattern);
                                    newChannel.bars[currentBar] = newChannel.patterns.length;
                                    pattern.instrument = oldPattern.instrument;
                                }
                                projectNoteIntoBar(oldNote, absoluteNoteStart - barStartPart - noteStartPart, noteStartPart, noteEndPart, pattern.notes);
                            }
                        }
                    }
                }
            }
        }
        removeDuplicatePatterns(pitchChannels);
        removeDuplicatePatterns(noiseChannels);
        this.append(new ChangeReplacePatterns(doc, pitchChannels, noiseChannels));
    }
    return ChangeMoveAndOverflowNotes;
})(Change_1.ChangeGroup);
exports.ChangeMoveAndOverflowNotes = ChangeMoveAndOverflowNotes;
var ChangePins = (function (_super) {
    __extends(ChangePins, _super);
    function ChangePins(_doc, _note) {
        if (_doc === void 0) { _doc = null; }
        _super.call(this, false);
        this._doc = _doc;
        this._note = _note;
        this._oldStart = this._note.start;
        this._oldEnd = this._note.end;
        this._newStart = this._note.start;
        this._newEnd = this._note.end;
        this._oldPins = this._note.pins;
        this._newPins = [];
        this._oldPitches = this._note.pitches;
        this._newPitches = [];
    }
    ChangePins.prototype._finishSetup = function () {
        for (var i = 0; i < this._newPins.length - 1;) {
            if (this._newPins[i].time >= this._newPins[i + 1].time) {
                this._newPins.splice(i, 1);
            }
            else {
                i++;
            }
        }
        for (var i = 1; i < this._newPins.length - 1;) {
            if (this._newPins[i - 1].interval == this._newPins[i].interval &&
                this._newPins[i].interval == this._newPins[i + 1].interval &&
                this._newPins[i - 1].volume == this._newPins[i].volume &&
                this._newPins[i].volume == this._newPins[i + 1].volume) {
                this._newPins.splice(i, 1);
            }
            else {
                i++;
            }
        }
        var firstInterval = this._newPins[0].interval;
        var firstTime = this._newPins[0].time;
        for (var i = 0; i < this._oldPitches.length; i++) {
            this._newPitches[i] = this._oldPitches[i] + firstInterval;
        }
        for (var i = 0; i < this._newPins.length; i++) {
            this._newPins[i].interval -= firstInterval;
            this._newPins[i].time -= firstTime;
        }
        this._newStart = this._oldStart + firstTime;
        this._newEnd = this._newStart + this._newPins[this._newPins.length - 1].time;
        this._doForwards();
        this._didSomething();
    };
    ChangePins.prototype._doForwards = function () {
        this._note.pins = this._newPins;
        this._note.pitches = this._newPitches;
        this._note.start = this._newStart;
        this._note.end = this._newEnd;
        if (this._doc != null)
            this._doc.notifier.changed();
    };
    ChangePins.prototype._doBackwards = function () {
        this._note.pins = this._oldPins;
        this._note.pitches = this._oldPitches;
        this._note.start = this._oldStart;
        this._note.end = this._oldEnd;
        if (this._doc != null)
            this._doc.notifier.changed();
    };
    return ChangePins;
})(Change_1.UndoableChange);
exports.ChangePins = ChangePins;
var ChangeCustomizeInstrument = (function (_super) {
    __extends(ChangeCustomizeInstrument, _super);
    function ChangeCustomizeInstrument(doc) {
        _super.call(this);
        var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        if (instrument.preset != instrument.type) {
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeCustomizeInstrument;
})(Change_1.Change);
exports.ChangeCustomizeInstrument = ChangeCustomizeInstrument;
var ChangePreset = (function (_super) {
    __extends(ChangePreset, _super);
    function ChangePreset(doc, newValue) {
        _super.call(this);
        var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        var oldValue = instrument.preset;
        if (oldValue != newValue) {
            var preset = null = EditorConfig_1.EditorConfig.valueToPreset(newValue);
            if (preset != null) {
                if (preset.customType != undefined) {
                    instrument.type = preset.customType;
                    if (!SynthConfig_1.Config.instrumentTypeHasSpecialInterval[instrument.type] && SynthConfig_1.Config.chords[instrument.chord].isCustomInterval) {
                        instrument.chord = 0;
                    }
                }
                else if (preset.settings != undefined) {
                    var tempVolume = instrument.volume;
                    var tempPan = instrument.pan;
                    instrument.fromJsonObject(preset.settings, doc.song.getChannelIsNoise(doc.channel));
                    instrument.volume = tempVolume;
                    instrument.pan = tempPan;
                }
            }
            instrument.preset = newValue;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangePreset;
})(Change_1.Change);
exports.ChangePreset = ChangePreset;
var ChangeRandomGeneratedInstrument = (function (_super) {
    __extends(ChangeRandomGeneratedInstrument, _super);
    function ChangeRandomGeneratedInstrument(doc) {
        _super.call(this);
        readonly;
        item: T;
        readonly;
        weight: number;
    }
    return ChangeRandomGeneratedInstrument;
})(Change_1.Change);
exports.ChangeRandomGeneratedInstrument = ChangeRandomGeneratedInstrument;
function selectWeightedRandom(entries) {
    var total = 0;
    for (var _i = 0; _i < entries.length; _i++) {
        var entry = entries[_i];
        total += entry.weight;
    }
    var random = Math.random() * total;
    for (var _a = 0; _a < entries.length; _a++) {
        var entry = entries[_a];
        random -= entry.weight;
        if (random <= 0.0)
            return entry.item;
    }
    return entries[(Math.random() * entries.length) | 0].item;
}
function selectCurvedDistribution(min, max, peak, width) {
    var entries = [];
    for (var i = min; i <= max; i++) {
        entries.push({ item: i, weight: 1.0 / (Math.pow((i - peak) / width, 2.0) + 1.0) });
    }
    return selectWeightedRandom(entries);
}
var isNoise = doc.song.getChannelIsNoise(doc.channel);
var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
if (isNoise) {
    var type = selectWeightedRandom([
        { item: 2 /* noise */, weight: 1 },
        { item: 3 /* spectrum */, weight: 3 },
    ]);
    instrument.preset = instrument.type = type;
    instrument.filterCutoff = selectCurvedDistribution(4, SynthConfig_1.Config.filterCutoffRange - 1, SynthConfig_1.Config.filterCutoffRange - 2, 2);
    instrument.filterResonance = selectCurvedDistribution(0, SynthConfig_1.Config.filterResonanceRange - 1, 1, 2);
    instrument.filterEnvelope = SynthConfig_1.Config.envelopes.dictionary[selectWeightedRandom([
        { item: "steady", weight: 2 },
        { item: "punch", weight: 4 },
        { item: "flare 1", weight: 2 },
        { item: "flare 2", weight: 2 },
        { item: "flare 3", weight: 2 },
        { item: "twang 1", weight: 8 },
        { item: "twang 2", weight: 8 },
        { item: "twang 3", weight: 8 },
        { item: "swell 1", weight: 2 },
        { item: "swell 2", weight: 2 },
        { item: "swell 3", weight: 1 },
        { item: "tremolo1", weight: 1 },
        { item: "tremolo2", weight: 1 },
        { item: "tremolo3", weight: 1 },
        { item: "tremolo4", weight: 1 },
        { item: "tremolo5", weight: 1 },
        { item: "tremolo6", weight: 1 },
        { item: "decay 1", weight: 4 },
        { item: "decay 2", weight: 4 },
        { item: "decay 3", weight: 4 },
    ])].index;
    instrument.transition = SynthConfig_1.Config.transitions.dictionary[selectWeightedRandom([
        { item: "seamless", weight: 1 },
        { item: "hard", weight: 4 },
        { item: "soft", weight: 2 },
        { item: "slide", weight: 1 },
        { item: "cross fade", weight: 2 },
        { item: "hard fade", weight: 8 },
        { item: "medium fade", weight: 2 },
        { item: "soft fade", weight: 1 },
    ])].index;
    instrument.effects = SynthConfig_1.Config.effectsNames.indexOf(selectWeightedRandom([
        { item: "none", weight: 1 },
        { item: "reverb", weight: 3 },
    ]));
    instrument.chord = SynthConfig_1.Config.chords.dictionary[selectWeightedRandom([
        { item: "harmony", weight: 4 },
        { item: "strum", weight: 2 },
        { item: "arpeggio", weight: 1 },
    ])].index;
    function normalize(harmonics) {
        var max = 0;
        for (var _i = 0; _i < harmonics.length; _i++) {
            var value = harmonics[_i];
            if (value > max)
                max = value;
        }
        for (var i = 0; i < harmonics.length; i++) {
            harmonics[i] = SynthConfig_1.Config.harmonicsMax * harmonics[i] / max;
        }
    }
    switch (type) {
        case 2 /* noise */:
            {
                instrument.chipNoise = (Math.random() * SynthConfig_1.Config.chipNoises.length) | 0;
            }
            break;
        case 3 /* spectrum */:
            {
                var spectrumGenerators = [
                    function () {
                        var spectrum = [];
                        for (var i = 0; i < SynthConfig_1.Config.spectrumControlPoints; i++) {
                            spectrum[i] = (Math.random() < 0.5) ? Math.random() : 0.0;
                        }
                        return spectrum;
                    },
                    function () {
                        var current = 1.0;
                        var spectrum = [current];
                        for (var i = 1; i < SynthConfig_1.Config.spectrumControlPoints; i++) {
                            current *= Math.pow(2, Math.random() - 0.52);
                            spectrum[i] = current;
                        }
                        return spectrum;
                    },
                    function () {
                        var current = 1.0;
                        var spectrum = [current];
                        for (var i = 1; i < SynthConfig_1.Config.spectrumControlPoints; i++) {
                            current *= Math.pow(2, Math.random() - 0.52);
                            spectrum[i] = current * Math.random();
                        }
                        return spectrum;
                    },
                ];
                var generator = spectrumGenerators[(Math.random() * spectrumGenerators.length) | 0];
                var spectrum = generator();
                normalize(spectrum);
                for (var i = 0; i < SynthConfig_1.Config.spectrumControlPoints; i++) {
                    instrument.spectrumWave.spectrum[i] = Math.round(spectrum[i]);
                }
                instrument.spectrumWave.markCustomWaveDirty();
            }
            break;
        default: throw new Error("Unhandled noise instrument type in random generator.");
    }
}
else {
    var type = selectWeightedRandom([
        { item: 0 /* chip */, weight: 4 },
        { item: 6 /* pwm */, weight: 4 },
        { item: 5 /* harmonics */, weight: 6 },
        { item: 3 /* spectrum */, weight: 1 },
        { item: 1 /* fm */, weight: 4 },
    ]);
    instrument.preset = instrument.type = type;
    instrument.filterCutoff = selectCurvedDistribution(2, SynthConfig_1.Config.filterCutoffRange - 1, 7, 1.5);
    instrument.filterResonance = selectCurvedDistribution(0, SynthConfig_1.Config.filterResonanceRange - 1, 1, 2);
    instrument.filterEnvelope = SynthConfig_1.Config.envelopes.dictionary[selectWeightedRandom([
        { item: "steady", weight: 10 },
        { item: "punch", weight: 6 },
        { item: "flare 1", weight: 2 },
        { item: "flare 2", weight: 4 },
        { item: "flare 3", weight: 2 },
        { item: "twang 1", weight: 2 },
        { item: "twang 2", weight: 4 },
        { item: "twang 3", weight: 4 },
        { item: "swell 1", weight: 4 },
        { item: "swell 2", weight: 2 },
        { item: "swell 3", weight: 1 },
        { item: "tremolo1", weight: 1 },
        { item: "tremolo2", weight: 1 },
        { item: "tremolo3", weight: 1 },
        { item: "tremolo4", weight: 1 },
        { item: "tremolo5", weight: 1 },
        { item: "tremolo6", weight: 1 },
        { item: "decay 1", weight: 1 },
        { item: "decay 2", weight: 2 },
        { item: "decay 3", weight: 2 },
    ])].index;
    instrument.transition = SynthConfig_1.Config.transitions.dictionary[selectWeightedRandom([
        { item: "seamless", weight: 1 },
        { item: "hard", weight: 4 },
        { item: "soft", weight: 4 },
        { item: "slide", weight: 2 },
        { item: "cross fade", weight: 4 },
        { item: "hard fade", weight: 4 },
        { item: "medium fade", weight: 2 },
        { item: "soft fade", weight: 2 },
    ])].index;
    instrument.effects = SynthConfig_1.Config.effectsNames.indexOf(selectWeightedRandom([
        { item: "none", weight: 1 },
        { item: "reverb", weight: 10 },
        { item: "chorus", weight: 2 },
        { item: "chorus & reverb", weight: 2 },
    ]));
    instrument.chord = SynthConfig_1.Config.chords.dictionary[selectWeightedRandom([
        { item: "harmony", weight: 7 },
        { item: "strum", weight: 2 },
        { item: "arpeggio", weight: 1 },
    ])].index;
    if (type != 3 /* spectrum */) {
        instrument.vibrato = SynthConfig_1.Config.vibratos.dictionary[selectWeightedRandom([
            { item: "none", weight: 6 },
            { item: "light", weight: 2 },
            { item: "delayed", weight: 2 },
            { item: "heavy", weight: 1 },
            { item: "shaky", weight: 2 },
        ])].index;
    }
    if (type == 0 /* chip */ || type == 5 /* harmonics */) {
        instrument.interval = SynthConfig_1.Config.intervals.dictionary[selectWeightedRandom([
            { item: "union", weight: 10 },
            { item: "shimmer", weight: 5 },
            { item: "hum", weight: 4 },
            { item: "honky tonk", weight: 3 },
            { item: "dissonant", weight: 1 },
            { item: "fifth", weight: 1 },
            { item: "octave", weight: 2 },
            { item: "bowed", weight: 2 },
            { item: "piano", weight: 5 },
        ])].index;
    }
    function normalize(harmonics) {
        var max = 0;
        for (var _i = 0; _i < harmonics.length; _i++) {
            var value = harmonics[_i];
            if (value > max)
                max = value;
        }
        for (var i = 0; i < harmonics.length; i++) {
            harmonics[i] = SynthConfig_1.Config.harmonicsMax * harmonics[i] / max;
        }
    }
    switch (type) {
        case 0 /* chip */:
            {
                instrument.chipWave = (Math.random() * SynthConfig_1.Config.chipWaves.length) | 0;
            }
            break;
        case 6 /* pwm */:
            {
                instrument.pulseEnvelope = SynthConfig_1.Config.envelopes.dictionary[selectWeightedRandom([
                    { item: "steady", weight: 10 },
                    { item: "punch", weight: 6 },
                    { item: "flare 1", weight: 2 },
                    { item: "flare 2", weight: 4 },
                    { item: "flare 3", weight: 2 },
                    { item: "twang 1", weight: 4 },
                    { item: "twang 2", weight: 4 },
                    { item: "twang 3", weight: 4 },
                    { item: "swell 1", weight: 4 },
                    { item: "swell 2", weight: 4 },
                    { item: "swell 3", weight: 4 },
                    { item: "tremolo1", weight: 1 },
                    { item: "tremolo2", weight: 1 },
                    { item: "tremolo3", weight: 1 },
                    { item: "tremolo4", weight: 2 },
                    { item: "tremolo5", weight: 2 },
                    { item: "tremolo6", weight: 2 },
                    { item: "decay 1", weight: 2 },
                    { item: "decay 2", weight: 2 },
                    { item: "decay 3", weight: 2 },
                ])].index;
                instrument.pulseWidth = selectCurvedDistribution(0, SynthConfig_1.Config.pulseWidthRange - 1, SynthConfig_1.Config.pulseWidthRange - 1, 2);
            }
            break;
        case 5 /* harmonics */:
            {
                var harmonicGenerators = [
                    function () {
                        var harmonics = [];
                        for (var i = 0; i < SynthConfig_1.Config.harmonicsControlPoints; i++) {
                            harmonics[i] = (Math.random() < 0.4) ? Math.random() : 0.0;
                        }
                        harmonics[(Math.random() * 8) | 0] = Math.pow(Math.random(), 0.25);
                        return harmonics;
                    },
                    function () {
                        var current = 1.0;
                        var harmonics = [current];
                        for (var i = 1; i < SynthConfig_1.Config.harmonicsControlPoints; i++) {
                            current *= Math.pow(2, Math.random() - 0.55);
                            harmonics[i] = current;
                        }
                        return harmonics;
                    },
                    function () {
                        var current = 1.0;
                        var harmonics = [current];
                        for (var i = 1; i < SynthConfig_1.Config.harmonicsControlPoints; i++) {
                            current *= Math.pow(2, Math.random() - 0.55);
                            harmonics[i] = current * Math.random();
                        }
                        return harmonics;
                    },
                ];
                var generator = harmonicGenerators[(Math.random() * harmonicGenerators.length) | 0];
                var harmonics = generator();
                normalize(harmonics);
                for (var i = 0; i < SynthConfig_1.Config.harmonicsControlPoints; i++) {
                    instrument.harmonicsWave.harmonics[i] = Math.round(harmonics[i]);
                }
                instrument.harmonicsWave.markCustomWaveDirty();
            }
            break;
        case 3 /* spectrum */:
            {
                var spectrum = [];
                for (var i = 0; i < SynthConfig_1.Config.spectrumControlPoints; i++) {
                    var isHarmonic = i == 0 || i == 7 || i == 11 || i == 14 || i == 16 || i == 18 || i == 21;
                    if (isHarmonic) {
                        spectrum[i] = Math.pow(Math.random(), 0.25);
                    }
                    else {
                        spectrum[i] = Math.pow(Math.random(), 3) * 0.5;
                    }
                }
                normalize(spectrum);
                for (var i = 0; i < SynthConfig_1.Config.spectrumControlPoints; i++) {
                    instrument.spectrumWave.spectrum[i] = Math.round(spectrum[i]);
                }
                instrument.spectrumWave.markCustomWaveDirty();
            }
            break;
        case 1 /* fm */:
            {
                instrument.algorithm = (Math.random() * SynthConfig_1.Config.algorithms.length) | 0;
                instrument.feedbackType = (Math.random() * SynthConfig_1.Config.feedbacks.length) | 0;
                var algorithm = SynthConfig_1.Config.algorithms[instrument.algorithm];
                for (var i = 0; i < algorithm.carrierCount; i++) {
                    instrument.operators[i].frequency = selectCurvedDistribution(0, SynthConfig_1.Config.operatorFrequencies.length - 1, 0, 3);
                    instrument.operators[i].amplitude = selectCurvedDistribution(0, SynthConfig_1.Config.operatorAmplitudeMax, SynthConfig_1.Config.operatorAmplitudeMax - 1, 2);
                    instrument.operators[i].envelope = SynthConfig_1.Config.envelopes.dictionary["custom"].index;
                }
                for (var i = algorithm.carrierCount; i < SynthConfig_1.Config.operatorCount; i++) {
                    instrument.operators[i].frequency = selectCurvedDistribution(3, SynthConfig_1.Config.operatorFrequencies.length - 1, 0, 3);
                    instrument.operators[i].amplitude = (Math.pow(Math.random(), 2) * SynthConfig_1.Config.operatorAmplitudeMax) | 0;
                    instrument.operators[i].envelope = SynthConfig_1.Config.envelopes.dictionary[selectWeightedRandom([
                        { item: "steady", weight: 6 },
                        { item: "punch", weight: 2 },
                        { item: "flare 1", weight: 2 },
                        { item: "flare 2", weight: 2 },
                        { item: "flare 3", weight: 2 },
                        { item: "twang 1", weight: 2 },
                        { item: "twang 2", weight: 2 },
                        { item: "twang 3", weight: 2 },
                        { item: "swell 1", weight: 2 },
                        { item: "swell 2", weight: 2 },
                        { item: "swell 3", weight: 2 },
                        { item: "tremolo1", weight: 1 },
                        { item: "tremolo2", weight: 1 },
                        { item: "tremolo3", weight: 1 },
                        { item: "tremolo4", weight: 1 },
                        { item: "tremolo5", weight: 1 },
                        { item: "tremolo6", weight: 1 },
                        { item: "decay 1", weight: 1 },
                        { item: "decay 2", weight: 1 },
                        { item: "decay 3", weight: 1 },
                    ])].index;
                }
                instrument.feedbackAmplitude = (Math.pow(Math.random(), 3) * SynthConfig_1.Config.operatorAmplitudeMax) | 0;
                instrument.feedbackEnvelope = SynthConfig_1.Config.envelopes.dictionary[selectWeightedRandom([
                    { item: "steady", weight: 4 },
                    { item: "punch", weight: 2 },
                    { item: "flare 1", weight: 2 },
                    { item: "flare 2", weight: 2 },
                    { item: "flare 3", weight: 2 },
                    { item: "twang 1", weight: 2 },
                    { item: "twang 2", weight: 2 },
                    { item: "twang 3", weight: 2 },
                    { item: "swell 1", weight: 2 },
                    { item: "swell 2", weight: 2 },
                    { item: "swell 3", weight: 2 },
                    { item: "tremolo1", weight: 1 },
                    { item: "tremolo2", weight: 1 },
                    { item: "tremolo3", weight: 1 },
                    { item: "tremolo4", weight: 1 },
                    { item: "tremolo5", weight: 1 },
                    { item: "tremolo6", weight: 1 },
                    { item: "decay 1", weight: 1 },
                    { item: "decay 2", weight: 1 },
                    { item: "decay 3", weight: 1 },
                ])].index;
            }
            break;
        default: throw new Error("Unhandled pitched instrument type in random generator.");
    }
}
doc.notifier.changed();
this._didSomething();
var ChangeTransition = (function (_super) {
    __extends(ChangeTransition, _super);
    function ChangeTransition(doc, newValue) {
        _super.call(this);
        var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        var oldValue = instrument.transition;
        if (oldValue != newValue) {
            this._didSomething();
            instrument.transition = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
        }
    }
    return ChangeTransition;
})(Change_1.Change);
exports.ChangeTransition = ChangeTransition;
var ChangeEffects = (function (_super) {
    __extends(ChangeEffects, _super);
    function ChangeEffects(doc, newValue) {
        _super.call(this);
        var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        var oldValue = instrument.effects;
        if (oldValue != newValue) {
            this._didSomething();
            instrument.effects = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
        }
    }
    return ChangeEffects;
})(Change_1.Change);
exports.ChangeEffects = ChangeEffects;
var ChangePatternNumbers = (function (_super) {
    __extends(ChangePatternNumbers, _super);
    function ChangePatternNumbers(doc, value, startBar, startChannel, width, height) {
        _super.call(this);
        if (value > doc.song.patternsPerChannel)
            throw new Error("invalid pattern");
        for (var bar = startBar; bar < startBar + width; bar++) {
            for (var channel = startChannel; channel < startChannel + height; channel++) {
                if (doc.song.channels[channel].bars[bar] != value) {
                    doc.song.channels[channel].bars[bar] = value;
                    this._didSomething();
                }
            }
        }
        doc.notifier.changed();
    }
    return ChangePatternNumbers;
})(Change_1.Change);
exports.ChangePatternNumbers = ChangePatternNumbers;
var ChangeBarCount = (function (_super) {
    __extends(ChangeBarCount, _super);
    function ChangeBarCount(doc, newValue, atBeginning) {
        _super.call(this);
        if (doc.song.barCount != newValue) {
            for (var _i = 0, _a = doc.song.channels; _i < _a.length; _i++) {
                var channel = _a[_i];
                if (atBeginning) {
                    while (channel.bars.length < newValue) {
                        channel.bars.unshift(0);
                    }
                    if (doc.song.barCount > newValue) {
                        channel.bars.splice(0, doc.song.barCount - newValue);
                    }
                }
                else {
                    while (channel.bars.length < newValue) {
                        channel.bars.push(0);
                    }
                    channel.bars.length = newValue;
                }
            }
            if (atBeginning) {
                var diff = newValue - doc.song.barCount;
                doc.bar = Math.max(0, doc.bar + diff);
                if (diff < 0 || doc.barScrollPos > 0) {
                    doc.barScrollPos = Math.max(0, doc.barScrollPos + diff);
                }
                doc.song.loopStart = Math.max(0, doc.song.loopStart + diff);
            }
            doc.bar = Math.min(doc.bar, newValue - 1);
            doc.barScrollPos = Math.max(0, Math.min(newValue - doc.trackVisibleBars, doc.barScrollPos));
            doc.song.loopLength = Math.min(newValue, doc.song.loopLength);
            doc.song.loopStart = Math.min(newValue - doc.song.loopLength, doc.song.loopStart);
            doc.song.barCount = newValue;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeBarCount;
})(Change_1.Change);
exports.ChangeBarCount = ChangeBarCount;
var ChangeInsertBars = (function (_super) {
    __extends(ChangeInsertBars, _super);
    function ChangeInsertBars(doc, start, count) {
        _super.call(this);
        var newLength = Math.min(SynthConfig_1.Config.barCountMax, doc.song.barCount + count);
        count = newLength - doc.song.barCount;
        if (count == 0)
            return;
        for (var _i = 0, _a = doc.song.channels; _i < _a.length; _i++) {
            var channel = _a[_i];
            while (channel.bars.length < newLength) {
                channel.bars.splice(start, 0, 0);
            }
        }
        doc.song.barCount = newLength;
        doc.bar += count;
        doc.barScrollPos = Math.min(newLength - doc.trackVisibleBars, doc.barScrollPos + count);
        if (doc.song.loopStart >= start) {
            doc.song.loopStart += count;
        }
        else if (doc.song.loopStart + doc.song.loopLength >= start) {
            doc.song.loopLength += count;
        }
        doc.notifier.changed();
        this._didSomething();
    }
    return ChangeInsertBars;
})(Change_1.Change);
exports.ChangeInsertBars = ChangeInsertBars;
var ChangeDeleteBars = (function (_super) {
    __extends(ChangeDeleteBars, _super);
    function ChangeDeleteBars(doc, start, count) {
        _super.call(this);
        for (var _i = 0, _a = doc.song.channels; _i < _a.length; _i++) {
            var channel = _a[_i];
            channel.bars.splice(start, count);
            if (channel.bars.length == 0)
                channel.bars.push(0);
        }
        doc.song.barCount = Math.max(1, doc.song.barCount - count);
        doc.bar = Math.max(0, doc.bar - count);
        doc.barScrollPos = Math.max(0, doc.barScrollPos - count);
        if (doc.song.loopStart >= start) {
            doc.song.loopStart = Math.max(0, doc.song.loopStart - count);
        }
        else if (doc.song.loopStart + doc.song.loopLength > start) {
            doc.song.loopLength -= count;
        }
        doc.song.loopLength = Math.max(1, Math.min(doc.song.barCount - doc.song.loopStart, doc.song.loopLength));
        doc.notifier.changed();
        this._didSomething();
    }
    return ChangeDeleteBars;
})(Change_1.Change);
exports.ChangeDeleteBars = ChangeDeleteBars;
var ChangeChannelCount = (function (_super) {
    __extends(ChangeChannelCount, _super);
    function ChangeChannelCount(doc, newPitchChannelCount, newNoiseChannelCount) {
        _super.call(this);
        if (doc.song.pitchChannelCount != newPitchChannelCount || doc.song.noiseChannelCount != newNoiseChannelCount) {
            var newChannels = [];
            function changeGroup(newCount, oldCount, newStart, oldStart, octave, isNoise) {
                for (var i = 0; i < newCount; i++) {
                    var channel = i + newStart;
                    var oldChannel = i + oldStart;
                    if (i < oldCount) {
                        newChannels[channel] = doc.song.channels[oldChannel];
                    }
                    else {
                        newChannels[channel] = new synth_1.Channel();
                        newChannels[channel].octave = octave;
                        for (var j = 0; j < doc.song.instrumentsPerChannel; j++) {
                            var instrument_2 = new synth_1.Instrument(isNoise);
                            var presetValue = pickRandomPresetValue(isNoise);
                            var preset = EditorConfig_1.EditorConfig.valueToPreset(presetValue);
                            !;
                            instrument_2.fromJsonObject(preset.settings, isNoise);
                            instrument_2.preset = presetValue;
                            instrument_2.volume = 1;
                            newChannels[channel].instruments[j] = instrument_2;
                        }
                        for (var j = 0; j < doc.song.patternsPerChannel; j++) {
                            newChannels[channel].patterns[j] = new synth_1.Pattern();
                        }
                        for (var j = 0; j < doc.song.barCount; j++) {
                            newChannels[channel].bars[j] = 0;
                        }
                    }
                }
            }
            changeGroup(newPitchChannelCount, doc.song.pitchChannelCount, 0, 0, 2, false);
            changeGroup(newNoiseChannelCount, doc.song.noiseChannelCount, newPitchChannelCount, doc.song.pitchChannelCount, 0, true);
            doc.song.pitchChannelCount = newPitchChannelCount;
            doc.song.noiseChannelCount = newNoiseChannelCount;
            for (var channel = 0; channel < doc.song.getChannelCount(); channel++) {
                doc.song.channels[channel] = newChannels[channel];
            }
            doc.song.channels.length = doc.song.getChannelCount();
            doc.channel = Math.min(doc.channel, newPitchChannelCount + newNoiseChannelCount - 1);
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeChannelCount;
})(Change_1.Change);
exports.ChangeChannelCount = ChangeChannelCount;
var ChangeChannelBar = (function (_super) {
    __extends(ChangeChannelBar, _super);
    function ChangeChannelBar(doc, newChannel, newBar, silently) {
        if (silently === void 0) { silently = false; }
        _super.call(this);
        var oldChannel = doc.channel;
        var oldBar = doc.bar;
        doc.channel = newChannel;
        doc.bar = newBar;
        if (!silently) {
            doc.barScrollPos = Math.min(doc.bar, Math.max(doc.bar - (doc.trackVisibleBars - 1), doc.barScrollPos));
        }
        doc.notifier.changed();
        if (oldChannel != newChannel || oldBar != newBar) {
            this._didSomething();
        }
    }
    return ChangeChannelBar;
})(Change_1.Change);
exports.ChangeChannelBar = ChangeChannelBar;
var ChangeInterval = (function (_super) {
    __extends(ChangeInterval, _super);
    function ChangeInterval(doc, newValue) {
        _super.call(this);
        var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        var oldValue = instrument.interval;
        if (oldValue != newValue) {
            this._didSomething();
            instrument.interval = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
        }
    }
    return ChangeInterval;
})(Change_1.Change);
exports.ChangeInterval = ChangeInterval;
var ChangeChord = (function (_super) {
    __extends(ChangeChord, _super);
    function ChangeChord(doc, newValue) {
        _super.call(this);
        var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        var oldValue = instrument.chord;
        if (oldValue != newValue) {
            this._didSomething();
            instrument.chord = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
        }
    }
    return ChangeChord;
})(Change_1.Change);
exports.ChangeChord = ChangeChord;
var ChangeVibrato = (function (_super) {
    __extends(ChangeVibrato, _super);
    function ChangeVibrato(doc, newValue) {
        _super.call(this);
        var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        var oldValue = instrument.vibrato;
        if (oldValue != newValue) {
            instrument.vibrato = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeVibrato;
})(Change_1.Change);
exports.ChangeVibrato = ChangeVibrato;
var ChangeSpectrum = (function (_super) {
    __extends(ChangeSpectrum, _super);
    function ChangeSpectrum(doc, instrument, spectrumWave) {
        _super.call(this);
        spectrumWave.markCustomWaveDirty();
        instrument.preset = instrument.type;
        doc.notifier.changed();
        this._didSomething();
    }
    return ChangeSpectrum;
})(Change_1.Change);
exports.ChangeSpectrum = ChangeSpectrum;
var ChangeHarmonics = (function (_super) {
    __extends(ChangeHarmonics, _super);
    function ChangeHarmonics(doc, instrument, harmonicsWave) {
        _super.call(this);
        harmonicsWave.markCustomWaveDirty();
        instrument.preset = instrument.type;
        doc.notifier.changed();
        this._didSomething();
    }
    return ChangeHarmonics;
})(Change_1.Change);
exports.ChangeHarmonics = ChangeHarmonics;
var ChangeDrumsetEnvelope = (function (_super) {
    __extends(ChangeDrumsetEnvelope, _super);
    function ChangeDrumsetEnvelope(doc, drumIndex, newValue) {
        _super.call(this);
        var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        var oldValue = instrument.drumsetEnvelopes[drumIndex];
        if (oldValue != newValue) {
            instrument.drumsetEnvelopes[drumIndex] = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeDrumsetEnvelope;
})(Change_1.Change);
exports.ChangeDrumsetEnvelope = ChangeDrumsetEnvelope;
var ChangeInstrumentSlider = (function (_super) {
    __extends(ChangeInstrumentSlider, _super);
    function ChangeInstrumentSlider(_doc) {
        _super.call(this);
        this._doc = _doc;
        this._instrument = this._doc.song.channels[this._doc.channel].instruments[this._doc.getCurrentInstrument()];
    }
    ChangeInstrumentSlider.prototype.commit = function () {
        if (!this.isNoop()) {
            this._instrument.preset = this._instrument.type;
            this._doc.notifier.changed();
        }
    };
    return ChangeInstrumentSlider;
})(Change_1.Change);
var ChangePulseWidth = (function (_super) {
    __extends(ChangePulseWidth, _super);
    function ChangePulseWidth(doc, oldValue, newValue) {
        _super.call(this, doc);
        this._instrument.pulseWidth = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
    return ChangePulseWidth;
})(ChangeInstrumentSlider);
exports.ChangePulseWidth = ChangePulseWidth;
var ChangePulseEnvelope = (function (_super) {
    __extends(ChangePulseEnvelope, _super);
    function ChangePulseEnvelope(doc, newValue) {
        _super.call(this);
        var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        var oldValue = instrument.pulseEnvelope;
        if (oldValue != newValue) {
            instrument.pulseEnvelope = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangePulseEnvelope;
})(Change_1.Change);
exports.ChangePulseEnvelope = ChangePulseEnvelope;
var ChangeFilterCutoff = (function (_super) {
    __extends(ChangeFilterCutoff, _super);
    function ChangeFilterCutoff(doc, oldValue, newValue) {
        _super.call(this, doc);
        this._instrument.filterCutoff = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
    return ChangeFilterCutoff;
})(ChangeInstrumentSlider);
exports.ChangeFilterCutoff = ChangeFilterCutoff;
var ChangeFilterResonance = (function (_super) {
    __extends(ChangeFilterResonance, _super);
    function ChangeFilterResonance(doc, oldValue, newValue) {
        _super.call(this, doc);
        this._instrument.filterResonance = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
    return ChangeFilterResonance;
})(ChangeInstrumentSlider);
exports.ChangeFilterResonance = ChangeFilterResonance;
var ChangeFilterEnvelope = (function (_super) {
    __extends(ChangeFilterEnvelope, _super);
    function ChangeFilterEnvelope(doc, newValue) {
        _super.call(this);
        var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        var oldValue = instrument.filterEnvelope;
        if (oldValue != newValue) {
            instrument.filterEnvelope = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeFilterEnvelope;
})(Change_1.Change);
exports.ChangeFilterEnvelope = ChangeFilterEnvelope;
var ChangeAlgorithm = (function (_super) {
    __extends(ChangeAlgorithm, _super);
    function ChangeAlgorithm(doc, newValue) {
        _super.call(this);
        var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        var oldValue = instrument.algorithm;
        if (oldValue != newValue) {
            instrument.algorithm = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeAlgorithm;
})(Change_1.Change);
exports.ChangeAlgorithm = ChangeAlgorithm;
var ChangeFeedbackType = (function (_super) {
    __extends(ChangeFeedbackType, _super);
    function ChangeFeedbackType(doc, newValue) {
        _super.call(this);
        var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        var oldValue = instrument.feedbackType;
        if (oldValue != newValue) {
            instrument.feedbackType = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeFeedbackType;
})(Change_1.Change);
exports.ChangeFeedbackType = ChangeFeedbackType;
var ChangeFeedbackEnvelope = (function (_super) {
    __extends(ChangeFeedbackEnvelope, _super);
    function ChangeFeedbackEnvelope(doc, newValue) {
        _super.call(this);
        var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        var oldValue = instrument.feedbackEnvelope;
        if (oldValue != newValue) {
            instrument.feedbackEnvelope = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeFeedbackEnvelope;
})(Change_1.Change);
exports.ChangeFeedbackEnvelope = ChangeFeedbackEnvelope;
var ChangeOperatorEnvelope = (function (_super) {
    __extends(ChangeOperatorEnvelope, _super);
    function ChangeOperatorEnvelope(doc, operatorIndex, newValue) {
        _super.call(this);
        var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        var oldValue = instrument.operators[operatorIndex].envelope;
        if (oldValue != newValue) {
            instrument.operators[operatorIndex].envelope = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeOperatorEnvelope;
})(Change_1.Change);
exports.ChangeOperatorEnvelope = ChangeOperatorEnvelope;
var ChangeOperatorFrequency = (function (_super) {
    __extends(ChangeOperatorFrequency, _super);
    function ChangeOperatorFrequency(doc, operatorIndex, newValue) {
        _super.call(this);
        var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        var oldValue = instrument.operators[operatorIndex].frequency;
        if (oldValue != newValue) {
            instrument.operators[operatorIndex].frequency = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeOperatorFrequency;
})(Change_1.Change);
exports.ChangeOperatorFrequency = ChangeOperatorFrequency;
var ChangeOperatorAmplitude = (function (_super) {
    __extends(ChangeOperatorAmplitude, _super);
    function ChangeOperatorAmplitude(doc, operatorIndex, oldValue, newValue) {
        _super.call(this, doc);
        this._instrument.operators[operatorIndex].amplitude = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
    return ChangeOperatorAmplitude;
})(ChangeInstrumentSlider);
exports.ChangeOperatorAmplitude = ChangeOperatorAmplitude;
var ChangeFeedbackAmplitude = (function (_super) {
    __extends(ChangeFeedbackAmplitude, _super);
    function ChangeFeedbackAmplitude(doc, oldValue, newValue) {
        _super.call(this, doc);
        this._instrument.feedbackAmplitude = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
    return ChangeFeedbackAmplitude;
})(ChangeInstrumentSlider);
exports.ChangeFeedbackAmplitude = ChangeFeedbackAmplitude;
var ChangeInstrumentsPerChannel = (function (_super) {
    __extends(ChangeInstrumentsPerChannel, _super);
    function ChangeInstrumentsPerChannel(doc, newInstrumentsPerChannel) {
        _super.call(this);
        if (doc.song.instrumentsPerChannel != newInstrumentsPerChannel) {
            for (var channel = 0; channel < doc.song.getChannelCount(); channel++) {
                var sampleInstrument = doc.song.channels[channel].instruments[doc.song.instrumentsPerChannel - 1];
                var sampleInstrumentJson = sampleInstrument.toJsonObject();
                for (var j = doc.song.instrumentsPerChannel; j < newInstrumentsPerChannel; j++) {
                    var newInstrument = new synth_1.Instrument(doc.song.getChannelIsNoise(channel));
                    if (sampleInstrument.type == 4 /* drumset */) {
                        // Drumsets are kinda expensive in terms of url length, so don't just copy them willy-nilly.
                        newInstrument.setTypeAndReset(3 /* spectrum */, true);
                    }
                    else {
                        newInstrument.fromJsonObject(sampleInstrumentJson, doc.song.getChannelIsNoise(channel));
                    }
                    doc.song.channels[channel].instruments[j] = newInstrument;
                }
                doc.song.channels[channel].instruments.length = newInstrumentsPerChannel;
                for (var j = 0; j < doc.song.patternsPerChannel; j++) {
                    if (doc.song.channels[channel].patterns[j].instrument >= newInstrumentsPerChannel) {
                        doc.song.channels[channel].patterns[j].instrument = 0;
                    }
                }
            }
            doc.song.instrumentsPerChannel = newInstrumentsPerChannel;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeInstrumentsPerChannel;
})(Change_1.Change);
exports.ChangeInstrumentsPerChannel = ChangeInstrumentsPerChannel;
var ChangeKey = (function (_super) {
    __extends(ChangeKey, _super);
    function ChangeKey(doc, newValue) {
        _super.call(this);
        if (doc.song.key != newValue) {
            doc.song.key = newValue;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeKey;
})(Change_1.Change);
exports.ChangeKey = ChangeKey;
var ChangeLoop = (function (_super) {
    __extends(ChangeLoop, _super);
    function ChangeLoop(_doc, oldStart, oldLength, newStart, newLength) {
        _super.call(this);
        this._doc = _doc;
        this.oldStart = oldStart;
        this.oldLength = oldLength;
        this.newStart = newStart;
        this.newLength = newLength;
        this._doc.song.loopStart = this.newStart;
        this._doc.song.loopLength = this.newLength;
        this._doc.notifier.changed();
        if (this.oldStart != this.newStart || this.oldLength != this.newLength) {
            this._didSomething();
        }
    }
    return ChangeLoop;
})(Change_1.Change);
exports.ChangeLoop = ChangeLoop;
var ChangePitchAdded = (function (_super) {
    __extends(ChangePitchAdded, _super);
    function ChangePitchAdded(doc, note, pitch, index, deletion) {
        if (deletion === void 0) { deletion = false; }
        _super.call(this, deletion);
        this._doc = doc;
        this._note = note;
        this._pitch = pitch;
        this._index = index;
        this._didSomething();
        this.redo();
    }
    ChangePitchAdded.prototype._doForwards = function () {
        this._note.pitches.splice(this._index, 0, this._pitch);
        this._doc.notifier.changed();
    };
    ChangePitchAdded.prototype._doBackwards = function () {
        this._note.pitches.splice(this._index, 1);
        this._doc.notifier.changed();
    };
    return ChangePitchAdded;
})(Change_1.UndoableChange);
exports.ChangePitchAdded = ChangePitchAdded;
var ChangeOctave = (function (_super) {
    __extends(ChangeOctave, _super);
    function ChangeOctave(doc, oldValue, newValue) {
        _super.call(this);
        this.oldValue = oldValue;
        doc.song.channels[doc.channel].octave = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
    return ChangeOctave;
})(Change_1.Change);
exports.ChangeOctave = ChangeOctave;
var ChangeRhythm = (function (_super) {
    __extends(ChangeRhythm, _super);
    function ChangeRhythm(doc, newValue) {
        _super.call(this);
        if (doc.song.rhythm != newValue) {
            doc.song.rhythm = newValue;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeRhythm;
})(Change_1.ChangeGroup);
exports.ChangeRhythm = ChangeRhythm;
var ChangePaste = (function (_super) {
    __extends(ChangePaste, _super);
    function ChangePaste(doc, pattern, notes, selectionStart, selectionEnd, oldPartDuration) {
        _super.call(this);
        // Erase the current contents of the selection:
        this.append(new ChangeNoteTruncate(doc, pattern, selectionStart, selectionEnd));
        var noteInsertionIndex = 0;
        for (var i = 0; i < pattern.notes.length; i++) {
            if (pattern.notes[i].start < selectionStart) {
                if (pattern.notes[i].end > selectionStart)
                    throw new Error();
                noteInsertionIndex = i + 1;
            }
            else if (pattern.notes[i].start < selectionEnd) {
                throw new Error();
            }
        }
        while (selectionStart < selectionEnd) {
            for (var _i = 0; _i < notes.length; _i++) {
                var noteObject = notes[_i];
                var noteStart = noteObject["start"] + selectionStart;
                var noteEnd = noteObject["end"] + selectionStart;
                if (noteStart >= selectionEnd)
                    break;
                var note = new synth_1.Note(noteObject["pitches"][0], noteStart, noteEnd, noteObject["pins"][0]["volume"], false);
                note.pitches.length = 0;
                for (var _a = 0, _b = noteObject["pitches"]; _a < _b.length; _a++) {
                    var pitch = _b[_a];
                    note.pitches.push(pitch);
                }
                note.pins.length = 0;
                for (var _c = 0, _d = noteObject["pins"]; _c < _d.length; _c++) {
                    var pin = _d[_c];
                    note.pins.push(synth_1.makeNotePin(pin.interval, pin.time, pin.volume));
                }
                pattern.notes.splice(noteInsertionIndex++, 0, note);
                if (note.end > selectionEnd) {
                    this.append(new ChangeNoteLength(doc, note, note.start, selectionEnd));
                }
            }
            selectionStart += oldPartDuration;
        }
        doc.notifier.changed();
        this._didSomething();
    }
    return ChangePaste;
})(Change_1.ChangeGroup);
exports.ChangePaste = ChangePaste;
var ChangePasteInstrument = (function (_super) {
    __extends(ChangePasteInstrument, _super);
    function ChangePasteInstrument(doc, instrument, instrumentCopy) {
        _super.call(this);
        instrument.fromJsonObject(instrumentCopy, instrumentCopy["isDrum"]);
        doc.notifier.changed();
        this._didSomething();
    }
    return ChangePasteInstrument;
})(Change_1.ChangeGroup);
exports.ChangePasteInstrument = ChangePasteInstrument;
var ChangePatternInstrument = (function (_super) {
    __extends(ChangePatternInstrument, _super);
    function ChangePatternInstrument(doc, newValue, pattern) {
        _super.call(this);
        if (pattern.instrument != newValue) {
            pattern.instrument = newValue;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangePatternInstrument;
})(Change_1.Change);
exports.ChangePatternInstrument = ChangePatternInstrument;
var ChangePatternsPerChannel = (function (_super) {
    __extends(ChangePatternsPerChannel, _super);
    function ChangePatternsPerChannel(doc, newValue) {
        _super.call(this);
        if (doc.song.patternsPerChannel != newValue) {
            for (var i = 0; i < doc.song.getChannelCount(); i++) {
                var channelBars = doc.song.channels[i].bars;
                var channelPatterns = doc.song.channels[i].patterns;
                for (var j = 0; j < channelBars.length; j++) {
                    if (channelBars[j] > newValue)
                        channelBars[j] = 0;
                }
                for (var j = channelPatterns.length; j < newValue; j++) {
                    channelPatterns[j] = new synth_1.Pattern();
                }
                channelPatterns.length = newValue;
            }
            doc.song.patternsPerChannel = newValue;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangePatternsPerChannel;
})(Change_1.Change);
exports.ChangePatternsPerChannel = ChangePatternsPerChannel;
var ChangeEnsurePatternExists = (function (_super) {
    __extends(ChangeEnsurePatternExists, _super);
    function ChangeEnsurePatternExists(doc, channel, bar) {
        _super.call(this, false);
        this._patternOldNotes = null = null;
        var song = doc.song;
        if (song.channels[channel].bars[bar] != 0)
            return;
        this._doc = doc;
        this._bar = bar;
        this._channel = channel;
        this._oldPatternCount = song.patternsPerChannel;
        this._newPatternCount = song.patternsPerChannel;
        var firstEmptyUnusedIndex = null = null;
        var firstUnusedIndex = null = null;
        for (var patternIndex = 1; patternIndex <= song.patternsPerChannel; patternIndex++) {
            var used = false;
            for (var barIndex = 0; barIndex < song.barCount; barIndex++) {
                if (song.channels[channel].bars[barIndex] == patternIndex) {
                    used = true;
                    break;
                }
            }
            if (used)
                continue;
            if (firstUnusedIndex == null) {
                firstUnusedIndex = patternIndex;
            }
            var pattern = song.channels[channel].patterns[patternIndex - 1];
            if (pattern.notes.length == 0) {
                firstEmptyUnusedIndex = patternIndex;
                break;
            }
        }
        if (firstEmptyUnusedIndex != null) {
            this._patternIndex = firstEmptyUnusedIndex;
        }
        else if (song.patternsPerChannel < song.barCount) {
            this._newPatternCount = song.patternsPerChannel + 1;
            this._patternIndex = song.patternsPerChannel + 1;
        }
        else if (firstUnusedIndex != null) {
            this._patternIndex = firstUnusedIndex;
            this._patternOldNotes = song.channels[channel].patterns[firstUnusedIndex - 1].notes;
        }
        else {
            throw new Error();
        }
        this._didSomething();
        this._doForwards();
    }
    ChangeEnsurePatternExists.prototype._doForwards = function () {
        var song = this._doc.song;
        for (var j = song.patternsPerChannel; j < this._newPatternCount; j++) {
            for (var i = 0; i < song.getChannelCount(); i++) {
                song.channels[i].patterns[j] = new synth_1.Pattern();
            }
        }
        song.patternsPerChannel = this._newPatternCount;
        var pattern = song.channels[this._channel].patterns[this._patternIndex - 1];
        pattern.notes = [];
        song.channels[this._channel].bars[this._bar] = this._patternIndex;
        this._doc.notifier.changed();
    };
    ChangeEnsurePatternExists.prototype._doBackwards = function () {
        var song = this._doc.song;
        var pattern = song.channels[this._channel].patterns[this._patternIndex - 1];
        if (this._patternOldNotes != null)
            pattern.notes = this._patternOldNotes;
        song.channels[this._channel].bars[this._bar] = 0;
        for (var i = 0; i < song.getChannelCount(); i++) {
            song.channels[i].patterns.length = this._oldPatternCount;
        }
        song.patternsPerChannel = this._oldPatternCount;
        this._doc.notifier.changed();
    };
    return ChangeEnsurePatternExists;
})(Change_1.UndoableChange);
exports.ChangeEnsurePatternExists = ChangeEnsurePatternExists;
var ChangePinTime = (function (_super) {
    __extends(ChangePinTime, _super);
    function ChangePinTime(doc, note, pinIndex, shiftedTime) {
        if (doc === void 0) { doc = null; }
        _super.call(this, doc, note);
        shiftedTime -= this._oldStart;
        var originalTime = this._oldPins[pinIndex].time;
        var skipStart = Math.min(originalTime, shiftedTime);
        var skipEnd = Math.max(originalTime, shiftedTime);
        var setPin = false;
        for (var i = 0; i < this._oldPins.length; i++) {
            var oldPin = note.pins[i];
            var time = oldPin.time;
            if (time < skipStart) {
                this._newPins.push(synth_1.makeNotePin(oldPin.interval, time, oldPin.volume));
            }
            else if (time > skipEnd) {
                if (!setPin) {
                    this._newPins.push(synth_1.makeNotePin(this._oldPins[pinIndex].interval, shiftedTime, this._oldPins[pinIndex].volume));
                    setPin = true;
                }
                this._newPins.push(synth_1.makeNotePin(oldPin.interval, time, oldPin.volume));
            }
        }
        if (!setPin) {
            this._newPins.push(synth_1.makeNotePin(this._oldPins[pinIndex].interval, shiftedTime, this._oldPins[pinIndex].volume));
        }
        this._finishSetup();
    }
    return ChangePinTime;
})(ChangePins);
exports.ChangePinTime = ChangePinTime;
var ChangePitchBend = (function (_super) {
    __extends(ChangePitchBend, _super);
    function ChangePitchBend(doc, note, bendStart, bendEnd, bendTo, pitchIndex) {
        var _this = this;
        if (doc === void 0) { doc = null; }
        _super.call(this, doc, note);
        bendStart -= this._oldStart;
        bendEnd -= this._oldStart;
        bendTo -= note.pitches[pitchIndex];
        var setStart = false;
        var setEnd = false;
        var prevInterval = 0;
        var prevVolume = 3;
        var persist = true;
        var i;
        var direction;
        var stop;
        var push;
        if (bendEnd > bendStart) {
            i = 0;
            direction = 1;
            stop = note.pins.length;
            push = function (item) { _this._newPins.push(item); };
        }
        else {
            i = note.pins.length - 1;
            direction = -1;
            stop = -1;
            push = function (item) { _this._newPins.unshift(item); };
        }
        for (; i != stop; i += direction) {
            var oldPin = note.pins[i];
            var time = oldPin.time;
            for (;;) {
                if (!setStart) {
                    if (time * direction <= bendStart * direction) {
                        prevInterval = oldPin.interval;
                        prevVolume = oldPin.volume;
                    }
                    if (time * direction < bendStart * direction) {
                        push(synth_1.makeNotePin(oldPin.interval, time, oldPin.volume));
                        break;
                    }
                    else {
                        push(synth_1.makeNotePin(prevInterval, bendStart, prevVolume));
                        setStart = true;
                    }
                }
                else if (!setEnd) {
                    if (time * direction <= bendEnd * direction) {
                        prevInterval = oldPin.interval;
                        prevVolume = oldPin.volume;
                    }
                    if (time * direction < bendEnd * direction) {
                        break;
                    }
                    else {
                        push(synth_1.makeNotePin(bendTo, bendEnd, prevVolume));
                        setEnd = true;
                    }
                }
                else {
                    if (time * direction == bendEnd * direction) {
                        break;
                    }
                    else {
                        if (oldPin.interval != prevInterval)
                            persist = false;
                        push(synth_1.makeNotePin(persist ? bendTo : oldPin.interval, time, oldPin.volume));
                        break;
                    }
                }
            }
        }
        if (!setEnd) {
            push(synth_1.makeNotePin(bendTo, bendEnd, prevVolume));
        }
        this._finishSetup();
    }
    return ChangePitchBend;
})(ChangePins);
exports.ChangePitchBend = ChangePitchBend;
var ChangePatternRhythm = (function (_super) {
    __extends(ChangePatternRhythm, _super);
    function ChangePatternRhythm(doc, pattern) {
        _super.call(this);
        var minDivision = SynthConfig_1.Config.partsPerBeat / SynthConfig_1.Config.rhythms[doc.song.rhythm].stepsPerBeat;
        var changeRhythm = function (oldTime) {
            var thresholds = null = SynthConfig_1.Config.rhythms[doc.song.rhythm].roundUpThresholds;
            if (thresholds != null) {
                var beatStart = Math.floor(oldTime / SynthConfig_1.Config.partsPerBeat) * SynthConfig_1.Config.partsPerBeat;
                var remainder = oldTime - beatStart;
                var newTime = beatStart;
                for (var _i = 0; _i < thresholds.length; _i++) {
                    var threshold = thresholds[_i];
                    if (remainder >= threshold) {
                        newTime += minDivision;
                    }
                    else {
                        break;
                    }
                }
                return newTime;
            }
            else {
                return Math.round(oldTime / minDivision) * minDivision;
            }
        };
        var i = 0;
        while (i < pattern.notes.length) {
            var note = pattern.notes[i];
            if (changeRhythm(note.start) >= changeRhythm(note.end)) {
                this.append(new ChangeNoteAdded(doc, pattern, note, i, true));
            }
            else {
                this.append(new ChangeRhythmNote(doc, note, changeRhythm));
                i++;
            }
        }
    }
    return ChangePatternRhythm;
})(Change_1.ChangeSequence);
exports.ChangePatternRhythm = ChangePatternRhythm;
var ChangeRhythmNote = (function (_super) {
    __extends(ChangeRhythmNote, _super);
    function ChangeRhythmNote(doc, note, changeRhythm) {
        if (doc === void 0) { doc = null; }
        _super.call(this, doc, note);
        for (var _i = 0, _a = this._oldPins; _i < _a.length; _i++) {
            var oldPin = _a[_i];
            this._newPins.push(synth_1.makeNotePin(oldPin.interval, changeRhythm(oldPin.time + this._oldStart) - this._oldStart, oldPin.volume));
        }
        this._finishSetup();
    }
    return ChangeRhythmNote;
})(ChangePins);
var ChangeMoveNotesSideways = (function (_super) {
    __extends(ChangeMoveNotesSideways, _super);
    function ChangeMoveNotesSideways(doc, beatsToMove, strategy) {
        _super.call(this);
        var partsToMove = Math.round((beatsToMove % doc.song.beatsPerBar) * SynthConfig_1.Config.partsPerBeat);
        if (partsToMove < 0)
            partsToMove += doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat;
        if (partsToMove == 0.0)
            return;
        switch (strategy) {
            case "wrapAround":
                {
                    var partsPerBar = SynthConfig_1.Config.partsPerBeat * doc.song.beatsPerBar;
                    for (var _i = 0, _a = doc.song.channels; _i < _a.length; _i++) {
                        var channel = _a[_i];
                        for (var _b = 0, _c = channel.patterns; _b < _c.length; _b++) {
                            var pattern = _c[_b];
                            var newNotes = [];
                            for (var bar = 1; bar >= 0; bar--) {
                                var barStartPart = bar * partsPerBar;
                                for (var _d = 0, _e = pattern.notes; _d < _e.length; _d++) {
                                    var oldNote = _e[_d];
                                    var absoluteNoteStart = oldNote.start + partsToMove;
                                    var absoluteNoteEnd = oldNote.end + partsToMove;
                                    var noteStartPart = Math.max(0, absoluteNoteStart - barStartPart);
                                    var noteEndPart = Math.min(partsPerBar, absoluteNoteEnd - barStartPart);
                                    if (noteStartPart < noteEndPart) {
                                        projectNoteIntoBar(oldNote, absoluteNoteStart - barStartPart - noteStartPart, noteStartPart, noteEndPart, newNotes);
                                    }
                                }
                            }
                            pattern.notes = newNotes;
                        }
                    }
                }
                break;
            case "overflow":
                {
                    var originalBarCount = doc.song.barCount;
                    var originalLoopStart = doc.song.loopStart;
                    var originalLoopLength = doc.song.loopLength;
                    this.append(new ChangeMoveAndOverflowNotes(doc, doc.song.beatsPerBar, partsToMove));
                    if (beatsToMove < 0) {
                        var firstBarIsEmpty = true;
                        for (var _f = 0, _g = doc.song.channels; _f < _g.length; _f++) {
                            var channel = _g[_f];
                            if (channel.bars[0] != 0)
                                firstBarIsEmpty = false;
                        }
                        if (firstBarIsEmpty) {
                            for (var _h = 0, _j = doc.song.channels; _h < _j.length; _h++) {
                                var channel = _j[_h];
                                channel.bars.shift();
                            }
                            doc.song.barCount--;
                        }
                        else {
                            originalBarCount++;
                            originalLoopStart++;
                            doc.bar++;
                        }
                    }
                    while (doc.song.barCount < originalBarCount) {
                        for (var _k = 0, _l = doc.song.channels; _k < _l.length; _k++) {
                            var channel = _l[_k];
                            channel.bars.push(0);
                        }
                        doc.song.barCount++;
                    }
                    doc.song.loopStart = originalLoopStart;
                    doc.song.loopLength = originalLoopLength;
                }
                break;
            default: throw new Error("Unrecognized beats-per-bar conversion strategy.");
        }
        doc.notifier.changed();
        this._didSomething();
    }
    return ChangeMoveNotesSideways;
})(Change_1.ChangeGroup);
exports.ChangeMoveNotesSideways = ChangeMoveNotesSideways;
var ChangeBeatsPerBar = (function (_super) {
    __extends(ChangeBeatsPerBar, _super);
    function ChangeBeatsPerBar(doc, newValue, strategy) {
        _super.call(this);
        if (doc.song.beatsPerBar != newValue) {
            switch (strategy) {
                case "splice":
                    {
                        if (doc.song.beatsPerBar > newValue) {
                            var sequence = new Change_1.ChangeSequence();
                            for (var i = 0; i < doc.song.getChannelCount(); i++) {
                                for (var j = 0; j < doc.song.channels[i].patterns.length; j++) {
                                    sequence.append(new ChangeNoteTruncate(doc, doc.song.channels[i].patterns[j], newValue * SynthConfig_1.Config.partsPerBeat, doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat));
                                }
                            }
                        }
                    }
                    break;
                case "stretch":
                    {
                        var changeRhythm = function (oldTime) {
                            return Math.round(oldTime * newValue / doc.song.beatsPerBar);
                        };
                        for (var channelIndex = 0; channelIndex < doc.song.getChannelCount(); channelIndex++) {
                            for (var patternIndex = 0; patternIndex < doc.song.channels[channelIndex].patterns.length; patternIndex++) {
                                var pattern = doc.song.channels[channelIndex].patterns[patternIndex];
                                var noteIndex = 0;
                                while (noteIndex < pattern.notes.length) {
                                    var note = pattern.notes[noteIndex];
                                    if (changeRhythm(note.start) >= changeRhythm(note.end)) {
                                        this.append(new ChangeNoteAdded(doc, pattern, note, noteIndex, true));
                                    }
                                    else {
                                        this.append(new ChangeRhythmNote(doc, note, changeRhythm));
                                        noteIndex++;
                                    }
                                }
                            }
                        }
                        this.append(new ChangeTempo(doc, doc.song.tempo, doc.song.tempo * newValue / doc.song.beatsPerBar));
                    }
                    break;
                case "overflow":
                    {
                        this.append(new ChangeMoveAndOverflowNotes(doc, newValue, 0));
                        doc.song.loopStart = 0;
                        doc.song.loopLength = doc.song.barCount;
                    }
                    break;
                default: throw new Error("Unrecognized beats-per-bar conversion strategy.");
            }
            doc.song.beatsPerBar = newValue;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeBeatsPerBar;
})(Change_1.ChangeGroup);
exports.ChangeBeatsPerBar = ChangeBeatsPerBar;
var ChangeScale = (function (_super) {
    __extends(ChangeScale, _super);
    function ChangeScale(doc, newValue) {
        _super.call(this);
        if (doc.song.scale != newValue) {
            doc.song.scale = newValue;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeScale;
})(Change_1.ChangeGroup);
exports.ChangeScale = ChangeScale;
var ChangeDetectKey = (function (_super) {
    __extends(ChangeDetectKey, _super);
    function ChangeDetectKey(doc) {
        _super.call(this);
        var song = doc.song;
        var basePitch = SynthConfig_1.Config.keys[song.key].basePitch;
        var keyWeights = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (var channelIndex = 0; channelIndex < song.pitchChannelCount; channelIndex++) {
            for (var barIndex = 0; barIndex < song.barCount; barIndex++) {
                var pattern = null = song.getPattern(channelIndex, barIndex);
                if (pattern != null) {
                    for (var _i = 0, _a = pattern.notes; _i < _a.length; _i++) {
                        var note = _a[_i];
                        var prevPin = note.pins[0];
                        for (var pinIndex = 1; pinIndex < note.pins.length; pinIndex++) {
                            var nextPin = note.pins[pinIndex];
                            if (prevPin.interval == nextPin.interval) {
                                var weight = nextPin.time - prevPin.time;
                                weight += Math.max(0, Math.min(SynthConfig_1.Config.partsPerBeat, nextPin.time + note.start) - (prevPin.time + note.start));
                                weight *= nextPin.volume + prevPin.volume;
                                for (var _b = 0, _c = note.pitches; _b < _c.length; _b++) {
                                    var pitch = _c[_b];
                                    var key = (basePitch + prevPin.interval + pitch) % 12;
                                    keyWeights[key] += weight;
                                }
                            }
                        }
                    }
                }
            }
        }
        var bestKey = 0;
        var bestKeyWeight = 0;
        for (var key = 0; key < 12; key++) {
            // Look for the root of the most prominent major or minor chord.
            var keyWeight = keyWeights[key] * (3 * keyWeights[(key + 7) % 12] + keyWeights[(key + 4) % 12] + keyWeights[(key + 3) % 12]);
            if (bestKeyWeight < keyWeight) {
                bestKeyWeight = keyWeight;
                bestKey = key;
            }
        }
        if (bestKey != song.key) {
            var diff = song.key - bestKey;
            var absoluteDiff = Math.abs(diff);
            for (var channelIndex = 0; channelIndex < song.pitchChannelCount; channelIndex++) {
                for (var _d = 0, _e = song.channels[channelIndex].patterns; _d < _e.length; _d++) {
                    var pattern = _e[_d];
                    for (var i = 0; i < absoluteDiff; i++) {
                        this.append(new ChangeTranspose(doc, channelIndex, pattern, diff > 0, true));
                    }
                }
            }
            song.key = bestKey;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeDetectKey;
})(Change_1.ChangeGroup);
exports.ChangeDetectKey = ChangeDetectKey;
function pickRandomPresetValue(isNoise) {
    var eligiblePresetValues = [];
    for (var categoryIndex = 0; categoryIndex < EditorConfig_1.EditorConfig.presetCategories.length; categoryIndex++) {
        var category = EditorConfig_1.EditorConfig.presetCategories[categoryIndex];
        if (category.name == "Novelty Presets")
            continue;
        for (var presetIndex = 0; presetIndex < category.presets.length; presetIndex++) {
            var preset = category.presets[presetIndex];
            if (preset.settings != undefined && (preset.isNoise == true) == isNoise) {
                eligiblePresetValues.push((categoryIndex << 6) + presetIndex);
            }
        }
    }
    return eligiblePresetValues[(Math.random() * eligiblePresetValues.length) | 0];
}
exports.pickRandomPresetValue = pickRandomPresetValue;
function setDefaultInstruments(song) {
    for (var channelIndex = 0; channelIndex < song.channels.length; channelIndex++) {
        for (var _i = 0, _a = song.channels[channelIndex].instruments; _i < _a.length; _i++) {
            var instrument_3 = _a[_i];
            var isNoise_1 = song.getChannelIsNoise(channelIndex);
            var presetValue = (channelIndex == song.pitchChannelCount) ? EditorConfig_1.EditorConfig.nameToPresetValue(Math.random() > 0.5 ? "chip noise" : "standard drumset") : !, pickRandomPresetValue_1 = (isNoise_1);
            var preset = EditorConfig_1.EditorConfig.valueToPreset(presetValue);
            !;
            instrument_3.fromJsonObject(preset.settings, isNoise_1);
            instrument_3.preset = presetValue;
            instrument_3.volume = 1;
        }
    }
}
exports.setDefaultInstruments = setDefaultInstruments;
var ChangeSong = (function (_super) {
    __extends(ChangeSong, _super);
    function ChangeSong(doc, newHash) {
        _super.call(this);
        doc.song.fromBase64String(newHash);
        if (newHash == "") {
            this.append(new ChangePatternSelection(doc, 0, 0));
            doc.selection.resetBoxSelection();
            setDefaultInstruments(doc.song);
        }
        else {
            this.append(new ChangeValidateTrackSelection(doc));
        }
        doc.notifier.changed();
        this._didSomething();
    }
    return ChangeSong;
})(Change_1.ChangeGroup);
exports.ChangeSong = ChangeSong;
var ChangeValidateTrackSelection = (function (_super) {
    __extends(ChangeValidateTrackSelection, _super);
    function ChangeValidateTrackSelection(doc) {
        _super.call(this);
        var channel = Math.min(doc.channel, doc.song.getChannelCount() - 1);
        var bar = Math.max(0, Math.min(doc.song.barCount - 1, doc.bar));
        var barScrollPos = Math.min(doc.bar, Math.max(doc.bar - (doc.trackVisibleBars - 1), Math.max(0, Math.min(doc.song.barCount - doc.trackVisibleBars, doc.barScrollPos))));
        if (doc.channel != channel || doc.bar != bar || doc.barScrollPos != barScrollPos) {
            doc.channel = channel;
            doc.bar = bar;
            doc.barScrollPos = barScrollPos;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeValidateTrackSelection;
})(Change_1.Change);
exports.ChangeValidateTrackSelection = ChangeValidateTrackSelection;
var ChangeReplacePatterns = (function (_super) {
    __extends(ChangeReplacePatterns, _super);
    function ChangeReplacePatterns(doc, pitchChannels, noiseChannels) {
        _super.call(this);
        var song = doc.song;
        function removeExtraSparseChannels(channels, maxLength) {
            while (channels.length > maxLength) {
                var sparsestIndex = channels.length - 1;
                var mostZeroes = 0;
                for (var channelIndex = 0; channelIndex < channels.length - 1; channelIndex++) {
                    var zeroes = 0;
                    for (var _i = 0, _a = channels[channelIndex].bars; _i < _a.length; _i++) {
                        var bar = _a[_i];
                        if (bar == 0)
                            zeroes++;
                    }
                    if (zeroes >= mostZeroes) {
                        sparsestIndex = channelIndex;
                        mostZeroes = zeroes;
                    }
                }
                channels.splice(sparsestIndex, 1);
            }
        }
        removeExtraSparseChannels(pitchChannels, SynthConfig_1.Config.pitchChannelCountMax);
        removeExtraSparseChannels(noiseChannels, SynthConfig_1.Config.noiseChannelCountMax);
        while (pitchChannels.length < SynthConfig_1.Config.pitchChannelCountMin)
            pitchChannels.push(new synth_1.Channel());
        while (noiseChannels.length < SynthConfig_1.Config.noiseChannelCountMin)
            noiseChannels.push(new synth_1.Channel());
        // Set minimum counts.
        song.barCount = 1;
        song.instrumentsPerChannel = 1;
        song.patternsPerChannel = 8;
        var combinedChannels = pitchChannels.concat(noiseChannels);
        for (var channelIndex = 0; channelIndex < combinedChannels.length; channelIndex++) {
            var channel = combinedChannels[channelIndex];
            song.barCount = Math.max(song.barCount, channel.bars.length);
            song.patternsPerChannel = Math.max(song.patternsPerChannel, channel.patterns.length);
            song.instrumentsPerChannel = Math.max(song.instrumentsPerChannel, channel.instruments.length);
            song.channels[channelIndex] = channel;
        }
        song.channels.length = combinedChannels.length;
        song.pitchChannelCount = pitchChannels.length;
        song.noiseChannelCount = noiseChannels.length;
        song.barCount = Math.min(SynthConfig_1.Config.barCountMax, song.barCount);
        song.patternsPerChannel = Math.min(SynthConfig_1.Config.barCountMax, song.patternsPerChannel);
        song.instrumentsPerChannel = Math.min(SynthConfig_1.Config.instrumentsPerChannelMax, song.instrumentsPerChannel);
        for (var channelIndex = 0; channelIndex < song.channels.length; channelIndex++) {
            var channel = song.channels[channelIndex];
            for (var barIndex = 0; barIndex < channel.bars.length; barIndex++) {
                if (channel.bars[barIndex] > song.patternsPerChannel || channel.bars[barIndex] < 0) {
                    channel.bars[barIndex] = 0;
                }
            }
            for (var _i = 0, _a = channel.patterns; _i < _a.length; _i++) {
                var pattern = _a[_i];
                if (pattern.instrument >= song.instrumentsPerChannel || pattern.instrument < 0) {
                    pattern.instrument = 0;
                }
            }
            while (channel.bars.length < song.barCount) {
                channel.bars.push(0);
            }
            while (channel.patterns.length < song.patternsPerChannel) {
                channel.patterns.push(new synth_1.Pattern());
            }
            while (channel.instruments.length < song.instrumentsPerChannel) {
                var instrument_4 = new synth_1.Instrument(doc.song.getChannelIsNoise(channelIndex));
                if (song.getChannelIsNoise(channelIndex)) {
                    instrument_4.setTypeAndReset(2 /* noise */, true);
                }
                else {
                    instrument_4.setTypeAndReset(0 /* chip */, false);
                }
                channel.instruments.push(instrument_4);
            }
            channel.bars.length = song.barCount;
            channel.patterns.length = song.patternsPerChannel;
            channel.instruments.length = song.instrumentsPerChannel;
        }
        song.loopStart = Math.max(0, Math.min(song.barCount - 1, song.loopStart));
        song.loopLength = Math.min(song.barCount - song.loopStart, song.loopLength);
        this.append(new ChangeValidateTrackSelection(doc));
        doc.notifier.changed();
        this._didSomething();
    }
    return ChangeReplacePatterns;
})(Change_1.ChangeGroup);
exports.ChangeReplacePatterns = ChangeReplacePatterns;
function comparePatternNotes(a, b) {
    if (a.length != b.length)
        return false;
    for (var noteIndex = 0; noteIndex < a.length; noteIndex++) {
        var oldNote = a[noteIndex];
        var newNote = b[noteIndex];
        if (newNote.start != oldNote.start || newNote.end != oldNote.end || newNote.pitches.length != oldNote.pitches.length || newNote.pins.length != oldNote.pins.length) {
            return false;
        }
        for (var pitchIndex = 0; pitchIndex < oldNote.pitches.length; pitchIndex++) {
            if (newNote.pitches[pitchIndex] != oldNote.pitches[pitchIndex]) {
                return false;
            }
        }
        for (var pinIndex = 0; pinIndex < oldNote.pins.length; pinIndex++) {
            if (newNote.pins[pinIndex].interval != oldNote.pins[pinIndex].interval || newNote.pins[pinIndex].time != oldNote.pins[pinIndex].time || newNote.pins[pinIndex].volume != oldNote.pins[pinIndex].volume) {
                return false;
            }
        }
    }
    return true;
}
exports.comparePatternNotes = comparePatternNotes;
function removeDuplicatePatterns(channels) {
    for (var _i = 0; _i < channels.length; _i++) {
        var channel = channels[_i];
        var newPatterns = [];
        for (var bar = 0; bar < channel.bars.length; bar++) {
            if (channel.bars[bar] == 0)
                continue;
            var oldPattern = channel.patterns[channel.bars[bar] - 1];
            var foundMatchingPattern = false;
            for (var newPatternIndex = 0; newPatternIndex < newPatterns.length; newPatternIndex++) {
                var newPattern = newPatterns[newPatternIndex];
                if (newPattern.instrument != oldPattern.instrument || newPattern.notes.length != oldPattern.notes.length) {
                    continue;
                }
                if (comparePatternNotes(oldPattern.notes, newPattern.notes)) {
                    foundMatchingPattern = true;
                    channel.bars[bar] = newPatternIndex + 1;
                    break;
                }
            }
            if (!foundMatchingPattern) {
                newPatterns.push(oldPattern);
                channel.bars[bar] = newPatterns.length;
            }
        }
        for (var patternIndex = 0; patternIndex < newPatterns.length; patternIndex++) {
            channel.patterns[patternIndex] = newPatterns[patternIndex];
        }
        channel.patterns.length = newPatterns.length;
    }
}
exports.removeDuplicatePatterns = removeDuplicatePatterns;
var ChangeTempo = (function (_super) {
    __extends(ChangeTempo, _super);
    function ChangeTempo(doc, oldValue, newValue) {
        _super.call(this);
        doc.song.tempo = Math.max(SynthConfig_1.Config.tempoMin, Math.min(SynthConfig_1.Config.tempoMax, Math.round(newValue)));
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
    return ChangeTempo;
})(Change_1.Change);
exports.ChangeTempo = ChangeTempo;
var ChangeReverb = (function (_super) {
    __extends(ChangeReverb, _super);
    function ChangeReverb(doc, oldValue, newValue) {
        _super.call(this);
        doc.song.reverb = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
    return ChangeReverb;
})(Change_1.Change);
exports.ChangeReverb = ChangeReverb;
var ChangeNoteAdded = (function (_super) {
    __extends(ChangeNoteAdded, _super);
    function ChangeNoteAdded(doc, pattern, note, index, deletion) {
        if (deletion === void 0) { deletion = false; }
        _super.call(this, deletion);
        this._doc = doc;
        this._pattern = pattern;
        this._note = note;
        this._index = index;
        this._didSomething();
        this.redo();
    }
    ChangeNoteAdded.prototype._doForwards = function () {
        this._pattern.notes.splice(this._index, 0, this._note);
        this._doc.notifier.changed();
    };
    ChangeNoteAdded.prototype._doBackwards = function () {
        this._pattern.notes.splice(this._index, 1);
        this._doc.notifier.changed();
    };
    return ChangeNoteAdded;
})(Change_1.UndoableChange);
exports.ChangeNoteAdded = ChangeNoteAdded;
var ChangeNoteLength = (function (_super) {
    __extends(ChangeNoteLength, _super);
    function ChangeNoteLength(doc, note, truncStart, truncEnd) {
        if (doc === void 0) { doc = null; }
        _super.call(this, doc, note);
        truncStart -= this._oldStart;
        truncEnd -= this._oldStart;
        var setStart = false;
        var prevVolume = this._oldPins[0].volume;
        var prevInterval = this._oldPins[0].interval;
        var pushLastPin = true;
        var i;
        for (i = 0; i < this._oldPins.length; i++) {
            var oldPin = this._oldPins[i];
            if (oldPin.time < truncStart) {
                prevVolume = oldPin.volume;
                prevInterval = oldPin.interval;
            }
            else if (oldPin.time <= truncEnd) {
                if (oldPin.time > truncStart && !setStart) {
                    this._newPins.push(synth_1.makeNotePin(prevInterval, truncStart, prevVolume));
                }
                this._newPins.push(synth_1.makeNotePin(oldPin.interval, oldPin.time, oldPin.volume));
                setStart = true;
                if (oldPin.time == truncEnd) {
                    pushLastPin = false;
                    break;
                }
            }
            else {
                break;
            }
        }
        if (pushLastPin)
            this._newPins.push(synth_1.makeNotePin(this._oldPins[i].interval, truncEnd, this._oldPins[i].volume));
        this._finishSetup();
    }
    return ChangeNoteLength;
})(ChangePins);
exports.ChangeNoteLength = ChangeNoteLength;
var ChangeNoteTruncate = (function (_super) {
    __extends(ChangeNoteTruncate, _super);
    function ChangeNoteTruncate(doc, pattern, start, end, skipNote) {
        _super.call(this);
        var i = 0;
        while (i < pattern.notes.length) {
            var note = pattern.notes[i];
            if (note == skipNote && skipNote != undefined) {
                i++;
            }
            else if (note.end <= start) {
                i++;
            }
            else if (note.start >= end) {
                break;
            }
            else if (note.start < start && note.end > end) {
                var copy = note.clone();
                this.append(new ChangeNoteLength(doc, note, note.start, start));
                i++;
                this.append(new ChangeNoteAdded(doc, pattern, copy, i, false));
                this.append(new ChangeNoteLength(doc, copy, end, copy.end));
                i++;
            }
            else if (note.start < start) {
                this.append(new ChangeNoteLength(doc, note, note.start, start));
                i++;
            }
            else if (note.end > end) {
                this.append(new ChangeNoteLength(doc, note, end, note.end));
                i++;
            }
            else {
                this.append(new ChangeNoteAdded(doc, pattern, note, i, true));
            }
        }
    }
    return ChangeNoteTruncate;
})(Change_1.ChangeSequence);
exports.ChangeNoteTruncate = ChangeNoteTruncate;
var ChangeSplitNotesAtSelection = (function (_super) {
    __extends(ChangeSplitNotesAtSelection, _super);
    function ChangeSplitNotesAtSelection(doc, pattern) {
        _super.call(this);
        var i = 0;
        while (i < pattern.notes.length) {
            var note = pattern.notes[i];
            if (note.start < doc.selection.patternSelectionStart && doc.selection.patternSelectionStart < note.end) {
                var copy = note.clone();
                this.append(new ChangeNoteLength(doc, note, note.start, doc.selection.patternSelectionStart));
                i++;
                this.append(new ChangeNoteAdded(doc, pattern, copy, i, false));
                this.append(new ChangeNoteLength(doc, copy, doc.selection.patternSelectionStart, copy.end));
            }
            else if (note.start < doc.selection.patternSelectionEnd && doc.selection.patternSelectionEnd < note.end) {
                var copy = note.clone();
                this.append(new ChangeNoteLength(doc, note, note.start, doc.selection.patternSelectionEnd));
                i++;
                this.append(new ChangeNoteAdded(doc, pattern, copy, i, false));
                this.append(new ChangeNoteLength(doc, copy, doc.selection.patternSelectionEnd, copy.end));
                i++;
            }
            else {
                i++;
            }
        }
    }
    return ChangeSplitNotesAtSelection;
})(Change_1.ChangeSequence);
var ChangeTransposeNote = (function (_super) {
    __extends(ChangeTransposeNote, _super);
    function ChangeTransposeNote(doc, channel, note, upward, ignoreScale, octave) {
        if (ignoreScale === void 0) { ignoreScale = false; }
        if (octave === void 0) { octave = false; }
        _super.call(this, false);
        this._doc = doc;
        this._note = note;
        this._oldPins = note.pins;
        this._newPins = [];
        this._oldPitches = note.pitches;
        this._newPitches = [];
        // I'm disabling pitch transposing for noise channels to avoid
        // accidentally messing up noise channels when pitch shifting all
        // channels at once.
        var isNoise = doc.song.getChannelIsNoise(channel);
        if (isNoise != doc.song.getChannelIsNoise(doc.channel))
            return;
        var maxPitch = (isNoise ? SynthConfig_1.Config.drumCount - 1 : SynthConfig_1.Config.maxPitch);
        for (var i = 0; i < this._oldPitches.length; i++) {
            var pitch = this._oldPitches[i];
            if (octave && !isNoise) {
                if (upward) {
                    pitch = Math.min(maxPitch, pitch + 12);
                }
                else {
                    pitch = Math.max(0, pitch - 12);
                }
            }
            else {
                if (upward) {
                    for (var j = pitch + 1; j <= maxPitch; j++) {
                        if (isNoise || ignoreScale || SynthConfig_1.Config.scales[doc.song.scale].flags[j % 12]) {
                            pitch = j;
                            break;
                        }
                    }
                }
                else {
                    for (var j = pitch - 1; j >= 0; j--) {
                        if (isNoise || ignoreScale || SynthConfig_1.Config.scales[doc.song.scale].flags[j % 12]) {
                            pitch = j;
                            break;
                        }
                    }
                }
            }
            var foundMatch = false;
            for (var j = 0; j < this._newPitches.length; j++) {
                if (this._newPitches[j] == pitch) {
                    foundMatch = true;
                    break;
                }
            }
            if (!foundMatch)
                this._newPitches.push(pitch);
        }
        var min = 0;
        var max = maxPitch;
        for (var i = 1; i < this._newPitches.length; i++) {
            var diff = this._newPitches[0] - this._newPitches[i];
            if (min < diff)
                min = diff;
            if (max > diff + maxPitch)
                max = diff + maxPitch;
        }
        for (var _i = 0, _a = this._oldPins; _i < _a.length; _i++) {
            var oldPin = _a[_i];
            var interval = oldPin.interval + this._oldPitches[0];
            if (interval < min)
                interval = min;
            if (interval > max)
                interval = max;
            if (octave && !isNoise) {
                if (upward) {
                    interval = Math.min(max, interval + 12);
                }
                else {
                    interval = Math.max(min, interval - 12);
                }
            }
            else {
                if (upward) {
                    for (var i = interval + 1; i <= max; i++) {
                        if (isNoise || ignoreScale || SynthConfig_1.Config.scales[doc.song.scale].flags[i % 12]) {
                            interval = i;
                            break;
                        }
                    }
                }
                else {
                    for (var i = interval - 1; i >= min; i--) {
                        if (isNoise || ignoreScale || SynthConfig_1.Config.scales[doc.song.scale].flags[i % 12]) {
                            interval = i;
                            break;
                        }
                    }
                }
            }
            interval -= this._newPitches[0];
            this._newPins.push(synth_1.makeNotePin(interval, oldPin.time, oldPin.volume));
        }
        if (this._newPins[0].interval != 0)
            throw new Error("wrong pin start interval");
        for (var i = 1; i < this._newPins.length - 1;) {
            if (this._newPins[i - 1].interval == this._newPins[i].interval &&
                this._newPins[i].interval == this._newPins[i + 1].interval &&
                this._newPins[i - 1].volume == this._newPins[i].volume &&
                this._newPins[i].volume == this._newPins[i + 1].volume) {
                this._newPins.splice(i, 1);
            }
            else {
                i++;
            }
        }
        this._doForwards();
        this._didSomething();
    }
    ChangeTransposeNote.prototype._doForwards = function () {
        this._note.pins = this._newPins;
        this._note.pitches = this._newPitches;
        this._doc.notifier.changed();
    };
    ChangeTransposeNote.prototype._doBackwards = function () {
        this._note.pins = this._oldPins;
        this._note.pitches = this._oldPitches;
        this._doc.notifier.changed();
    };
    return ChangeTransposeNote;
})(Change_1.UndoableChange);
var ChangeTranspose = (function (_super) {
    __extends(ChangeTranspose, _super);
    function ChangeTranspose(doc, channel, pattern, upward, ignoreScale, octave) {
        if (ignoreScale === void 0) { ignoreScale = false; }
        if (octave === void 0) { octave = false; }
        _super.call(this);
        if (doc.selection.patternSelectionActive) {
            this.append(new ChangeSplitNotesAtSelection(doc, pattern));
        }
        for (var _i = 0, _a = pattern.notes; _i < _a.length; _i++) {
            var note = _a[_i];
            if (doc.selection.patternSelectionActive && (note.end <= doc.selection.patternSelectionStart || note.start >= doc.selection.patternSelectionEnd)) {
                continue;
            }
            this.append(new ChangeTransposeNote(doc, channel, note, upward, ignoreScale, octave));
        }
    }
    return ChangeTranspose;
})(Change_1.ChangeSequence);
exports.ChangeTranspose = ChangeTranspose;
var ChangeTrackSelection = (function (_super) {
    __extends(ChangeTrackSelection, _super);
    function ChangeTrackSelection(doc, newX0, newX1, newY0, newY1) {
        _super.call(this);
        doc.selection.boxSelectionX0 = newX0;
        doc.selection.boxSelectionX1 = newX1;
        doc.selection.boxSelectionY0 = newY0;
        doc.selection.boxSelectionY1 = newY1;
        doc.notifier.changed();
        this._didSomething();
    }
    return ChangeTrackSelection;
})(Change_1.Change);
exports.ChangeTrackSelection = ChangeTrackSelection;
var ChangePatternSelection = (function (_super) {
    __extends(ChangePatternSelection, _super);
    function ChangePatternSelection(doc, newStart, newEnd) {
        _super.call(this, false);
        this._doc = doc;
        this._oldStart = doc.selection.patternSelectionStart;
        this._oldEnd = doc.selection.patternSelectionEnd;
        this._oldActive = doc.selection.patternSelectionActive;
        this._newStart = newStart;
        this._newEnd = newEnd;
        this._newActive = newStart < newEnd;
        this._doForwards();
        this._didSomething();
    }
    ChangePatternSelection.prototype._doForwards = function () {
        this._doc.selection.patternSelectionStart = this._newStart;
        this._doc.selection.patternSelectionEnd = this._newEnd;
        this._doc.selection.patternSelectionActive = this._newActive;
        this._doc.notifier.changed();
    };
    ChangePatternSelection.prototype._doBackwards = function () {
        this._doc.selection.patternSelectionStart = this._oldStart;
        this._doc.selection.patternSelectionEnd = this._oldEnd;
        this._doc.selection.patternSelectionActive = this._oldActive;
        this._doc.notifier.changed();
    };
    return ChangePatternSelection;
})(Change_1.UndoableChange);
exports.ChangePatternSelection = ChangePatternSelection;
var ChangeDragSelectedNotes = (function (_super) {
    __extends(ChangeDragSelectedNotes, _super);
    function ChangeDragSelectedNotes(doc, channel, pattern, parts, transpose) {
        _super.call(this);
        if (parts == 0 && transpose == 0)
            return;
        if (doc.selection.patternSelectionActive) {
            this.append(new ChangeSplitNotesAtSelection(doc, pattern));
        }
        var oldStart = doc.selection.patternSelectionStart;
        var oldEnd = doc.selection.patternSelectionEnd;
        var newStart = Math.max(0, Math.min(doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat, oldStart + parts));
        var newEnd = Math.max(0, Math.min(doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat, oldEnd + parts));
        if (newStart == newEnd) {
            // Just erase the current contents of the selection:
            this.append(new ChangeNoteTruncate(doc, pattern, oldStart, oldEnd));
        }
        else if (parts < 0) {
            // Clear space for the dragged notes:
            this.append(new ChangeNoteTruncate(doc, pattern, newStart, Math.min(oldStart, newEnd)));
            if (oldStart < -parts) {
                // If the dragged notes hit against the edge, truncate them too before dragging:
                this.append(new ChangeNoteTruncate(doc, pattern, oldStart, -parts));
            }
        }
        else {
            // Clear space for the dragged notes:
            this.append(new ChangeNoteTruncate(doc, pattern, Math.max(oldEnd, newStart), newEnd));
            if (oldEnd > doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat - parts) {
                // If the dragged notes hit against the edge, truncate them too before dragging:
                this.append(new ChangeNoteTruncate(doc, pattern, doc.song.beatsPerBar * SynthConfig_1.Config.partsPerBeat - parts, oldEnd));
            }
        }
        this.append(new ChangePatternSelection(doc, newStart, newEnd));
        var draggedNotes = [];
        var noteInsertionIndex = 0;
        var i = 0;
        while (i < pattern.notes.length) {
            var note = pattern.notes[i];
            if (note.end <= oldStart || note.start >= oldEnd) {
                i++;
                if (note.end <= newStart)
                    noteInsertionIndex = i;
            }
            else {
                draggedNotes.push(note.clone());
                this.append(new ChangeNoteAdded(doc, pattern, note, i, true));
            }
        }
        for (var _i = 0; _i < draggedNotes.length; _i++) {
            var note = draggedNotes[_i];
            note.start += parts;
            note.end += parts;
            for (var i_1 = 0; i_1 < Math.abs(transpose); i_1++) {
                this.append(new ChangeTransposeNote(doc, channel, note, transpose > 0));
            }
            this.append(new ChangeNoteAdded(doc, pattern, note, noteInsertionIndex++, false));
        }
    }
    return ChangeDragSelectedNotes;
})(Change_1.ChangeSequence);
exports.ChangeDragSelectedNotes = ChangeDragSelectedNotes;
var ChangeDuplicateSelectedReusedPatterns = (function (_super) {
    __extends(ChangeDuplicateSelectedReusedPatterns, _super);
    function ChangeDuplicateSelectedReusedPatterns(doc, barStart, barWidth, channelStart, channelHeight) {
        _super.call(this);
        for (var channel = channelStart; channel < channelStart + channelHeight; channel++) {
            var reusablePatterns = {};
            for (var bar = barStart; bar < barStart + barWidth; bar++) {
                var currentPatternIndex = doc.song.channels[channel].bars[bar];
                if (currentPatternIndex == 0)
                    continue;
                if (reusablePatterns[String(currentPatternIndex)] == undefined) {
                    var isUsedElsewhere = false;
                    for (var bar2 = 0; bar2 < doc.song.barCount; bar2++) {
                        if (bar2 < barStart || bar2 >= barStart + barWidth) {
                            if (doc.song.channels[channel].bars[bar2] == currentPatternIndex) {
                                isUsedElsewhere = true;
                                break;
                            }
                        }
                    }
                    if (isUsedElsewhere) {
                        // Need to duplicate the pattern.
                        var copiedPattern = doc.song.getPattern(channel, bar);
                        !;
                        this.append(new ChangePatternNumbers(doc, 0, bar, channel, 1, 1));
                        this.append(new ChangeEnsurePatternExists(doc, channel, bar));
                        var newPattern = null = doc.song.getPattern(channel, bar);
                        if (newPattern == null)
                            throw new Error();
                        this.append(new ChangePaste(doc, newPattern, copiedPattern.notes, 0, SynthConfig_1.Config.partsPerBeat * doc.song.beatsPerBar, SynthConfig_1.Config.partsPerBeat * doc.song.beatsPerBar));
                        this.append(new ChangePatternInstrument(doc, copiedPattern.instrument, newPattern));
                        reusablePatterns[String(currentPatternIndex)] = doc.song.channels[channel].bars[bar];
                    }
                    else {
                        reusablePatterns[String(currentPatternIndex)] = currentPatternIndex;
                    }
                }
                this.append(new ChangePatternNumbers(doc, reusablePatterns[String(currentPatternIndex)], bar, channel, 1, 1));
            }
        }
    }
    return ChangeDuplicateSelectedReusedPatterns;
})(Change_1.ChangeGroup);
exports.ChangeDuplicateSelectedReusedPatterns = ChangeDuplicateSelectedReusedPatterns;
var ChangePatternScale = (function (_super) {
    __extends(ChangePatternScale, _super);
    function ChangePatternScale(doc, pattern, scaleMap) {
        _super.call(this);
        if (doc.selection.patternSelectionActive) {
            new ChangeSplitNotesAtSelection(doc, pattern);
        }
        var maxPitch = SynthConfig_1.Config.maxPitch;
        for (var _i = 0, _a = pattern.notes; _i < _a.length; _i++) {
            var note = _a[_i];
            if (doc.selection.patternSelectionActive && (note.end <= doc.selection.patternSelectionStart || note.start >= doc.selection.patternSelectionEnd)) {
                continue;
            }
            var newPitches = [];
            var newPins = [];
            for (var i = 0; i < note.pitches.length; i++) {
                var pitch = note.pitches[i];
                var transformedPitch = scaleMap[pitch % 12] + (pitch - (pitch % 12));
                if (newPitches.indexOf(transformedPitch) == -1) {
                    newPitches.push(transformedPitch);
                }
            }
            var min = 0;
            var max = maxPitch;
            for (var i = 1; i < newPitches.length; i++) {
                var diff = newPitches[0] - newPitches[i];
                if (min < diff)
                    min = diff;
                if (max > diff + maxPitch)
                    max = diff + maxPitch;
            }
            for (var _b = 0, _c = note.pins; _b < _c.length; _b++) {
                var oldPin = _c[_b];
                var interval = oldPin.interval + note.pitches[0];
                if (interval < min)
                    interval = min;
                if (interval > max)
                    interval = max;
                var transformedInterval = scaleMap[interval % 12] + (interval - (interval % 12));
                newPins.push(synth_1.makeNotePin(transformedInterval - newPitches[0], oldPin.time, oldPin.volume));
            }
            if (newPins[0].interval != 0)
                throw new Error("wrong pin start interval");
            for (var i = 1; i < newPins.length - 1;) {
                if (newPins[i - 1].interval == newPins[i].interval &&
                    newPins[i].interval == newPins[i + 1].interval &&
                    newPins[i - 1].volume == newPins[i].volume &&
                    newPins[i].volume == newPins[i + 1].volume) {
                    newPins.splice(i, 1);
                }
                else {
                    i++;
                }
            }
            note.pitches = newPitches;
            note.pins = newPins;
        }
        this._didSomething();
        doc.notifier.changed();
    }
    return ChangePatternScale;
})(Change_1.Change);
exports.ChangePatternScale = ChangePatternScale;
var ChangeVolume = (function (_super) {
    __extends(ChangeVolume, _super);
    function ChangeVolume(doc, oldValue, newValue) {
        _super.call(this);
        doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].volume = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
    return ChangeVolume;
})(Change_1.Change);
exports.ChangeVolume = ChangeVolume;
var ChangePan = (function (_super) {
    __extends(ChangePan, _super);
    function ChangePan(doc, oldValue, newValue) {
        _super.call(this);
        doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].pan = newValue;
        doc.notifier.changed();
        if (oldValue != newValue)
            this._didSomething();
    }
    return ChangePan;
})(Change_1.Change);
exports.ChangePan = ChangePan;
var ChangeVolumeBend = (function (_super) {
    __extends(ChangeVolumeBend, _super);
    function ChangeVolumeBend(doc, note, bendPart, bendVolume, bendInterval) {
        _super.call(this, false);
        this._doc = doc;
        this._note = note;
        this._oldPins = note.pins;
        this._newPins = [];
        var inserted = false;
        for (var _i = 0, _a = note.pins; _i < _a.length; _i++) {
            var pin = _a[_i];
            if (pin.time < bendPart) {
                this._newPins.push(pin);
            }
            else if (pin.time == bendPart) {
                this._newPins.push(synth_1.makeNotePin(bendInterval, bendPart, bendVolume));
                inserted = true;
            }
            else {
                if (!inserted) {
                    this._newPins.push(synth_1.makeNotePin(bendInterval, bendPart, bendVolume));
                    inserted = true;
                }
                this._newPins.push(pin);
            }
        }
        for (var i = 1; i < this._newPins.length - 1;) {
            if (this._newPins[i - 1].interval == this._newPins[i].interval &&
                this._newPins[i].interval == this._newPins[i + 1].interval &&
                this._newPins[i - 1].volume == this._newPins[i].volume &&
                this._newPins[i].volume == this._newPins[i + 1].volume) {
                this._newPins.splice(i, 1);
            }
            else {
                i++;
            }
        }
        this._doForwards();
        this._didSomething();
    }
    ChangeVolumeBend.prototype._doForwards = function () {
        this._note.pins = this._newPins;
        this._doc.notifier.changed();
    };
    ChangeVolumeBend.prototype._doBackwards = function () {
        this._note.pins = this._oldPins;
        this._doc.notifier.changed();
    };
    return ChangeVolumeBend;
})(Change_1.UndoableChange);
exports.ChangeVolumeBend = ChangeVolumeBend;
var ChangeChipWave = (function (_super) {
    __extends(ChangeChipWave, _super);
    function ChangeChipWave(doc, newValue) {
        _super.call(this);
        var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        if (instrument.chipWave != newValue) {
            instrument.chipWave = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeChipWave;
})(Change_1.Change);
exports.ChangeChipWave = ChangeChipWave;
var ChangeNoiseWave = (function (_super) {
    __extends(ChangeNoiseWave, _super);
    function ChangeNoiseWave(doc, newValue) {
        _super.call(this);
        var instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
        if (instrument.chipNoise != newValue) {
            instrument.chipNoise = newValue;
            instrument.preset = instrument.type;
            doc.notifier.changed();
            this._didSomething();
        }
    }
    return ChangeNoiseWave;
})(Change_1.Change);
exports.ChangeNoiseWave = ChangeNoiseWave;
//}
