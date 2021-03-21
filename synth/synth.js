// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var _this = this;
var SynthConfig_1 = require("./SynthConfig");
exports.Config = SynthConfig_1.Config;
var FFT_1 = require("./FFT");
var Deque_1 = require("./Deque");
declare;
global;
{
}
var base64IntToCharCode = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 45, 95];
var base64CharCodeToInt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 62, 62, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0, 0, 0, 0, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 0, 0, 0, 0, 63, 0, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 0, 0, 0, 0, 0]; // 62 could be represented by either "-" or "." for historical reasons. New songs should use "-".
var BitFieldReader = (function () {
    function BitFieldReader(source, startIndex, stopIndex) {
        this._bits = [];
        this._readIndex = 0;
        for (var i = startIndex; i < stopIndex; i++) {
            var value = base64CharCodeToInt[source.charCodeAt(i)];
            this._bits.push((value >> 5) & 0x1);
            this._bits.push((value >> 4) & 0x1);
            this._bits.push((value >> 3) & 0x1);
            this._bits.push((value >> 2) & 0x1);
            this._bits.push((value >> 1) & 0x1);
            this._bits.push(value & 0x1);
        }
    }
    BitFieldReader.prototype.read = function (bitCount) {
        var result = 0;
        while (bitCount > 0) {
            result = result << 1;
            result += this._bits[this._readIndex++];
            bitCount--;
        }
        return result;
    };
    BitFieldReader.prototype.readLongTail = function (minValue, minBits) {
        var result = minValue;
        var numBits = minBits;
        while (this._bits[this._readIndex++]) {
            result += 1 << numBits;
            numBits++;
        }
        while (numBits > 0) {
            numBits--;
            if (this._bits[this._readIndex++]) {
                result += 1 << numBits;
            }
        }
        return result;
    };
    BitFieldReader.prototype.readPartDuration = function () {
        return this.readLongTail(1, 3);
    };
    BitFieldReader.prototype.readLegacyPartDuration = function () {
        return this.readLongTail(1, 2);
    };
    BitFieldReader.prototype.readPinCount = function () {
        return this.readLongTail(1, 0);
    };
    BitFieldReader.prototype.readPitchInterval = function () {
        if (this.read(1)) {
            return -this.readLongTail(1, 3);
        }
        else {
            return this.readLongTail(1, 3);
        }
    };
    return BitFieldReader;
})();
var BitFieldWriter = (function () {
    function BitFieldWriter() {
        this._index = 0;
        this._bits = [];
    }
    BitFieldWriter.prototype.clear = function () {
        this._index = 0;
    };
    BitFieldWriter.prototype.write = function (bitCount, value) {
        bitCount--;
        while (bitCount >= 0) {
            this._bits[this._index++] = (value >>> bitCount) & 1;
            bitCount--;
        }
    };
    BitFieldWriter.prototype.writeLongTail = function (minValue, minBits, value) {
        if (value < minValue)
            throw new Error("value out of bounds");
        value -= minValue;
        var numBits = minBits;
        while (value >= (1 << numBits)) {
            this._bits[this._index++] = 1;
            value -= 1 << numBits;
            numBits++;
        }
        this._bits[this._index++] = 0;
        while (numBits > 0) {
            numBits--;
            this._bits[this._index++] = (value >>> numBits) & 1;
        }
    };
    BitFieldWriter.prototype.writePartDuration = function (value) {
        this.writeLongTail(1, 3, value);
    };
    BitFieldWriter.prototype.writePinCount = function (value) {
        this.writeLongTail(1, 0, value);
    };
    BitFieldWriter.prototype.writePitchInterval = function (value) {
        if (value < 0) {
            this.write(1, 1); // sign
            this.writeLongTail(1, 3, -value);
        }
        else {
            this.write(1, 0); // sign
            this.writeLongTail(1, 3, value);
        }
    };
    BitFieldWriter.prototype.concat = function (other) {
        for (var i = 0; i < other._index; i++) {
            this._bits[this._index++] = other._bits[i];
        }
    };
    BitFieldWriter.prototype.encodeBase64 = function (buffer) {
        for (var i = 0; i < this._index; i += 6) {
            var value = (this._bits[i] << 5) | (this._bits[i + 1] << 4) | (this._bits[i + 2] << 3) | (this._bits[i + 3] << 2) | (this._bits[i + 4] << 1) | this._bits[i + 5];
            buffer.push(base64IntToCharCode[value]);
        }
        return buffer;
    };
    BitFieldWriter.prototype.lengthBase64 = function () {
        return Math.ceil(this._index / 6);
    };
    return BitFieldWriter;
})();
function makeNotePin(interval, time, volume) {
    return { interval: interval, time: time, volume: volume };
}
exports.makeNotePin = makeNotePin;
function clamp(min, max, val) {
    max = max - 1;
    if (val <= max) {
        if (val >= min)
            return val;
        else
            return min;
    }
    else {
        return max;
    }
}
function validateRange(min, max, val) {
    if (min <= val && val <= max)
        return val;
    throw new Error("Value " + val + " not in range [" + min + ", " + max + "]");
}
var Note = (function () {
    function Note(pitch, start, end, volume, fadeout) {
        if (fadeout === void 0) { fadeout = false; }
        this.pitches = [pitch];
        this.pins = [makeNotePin(0, 0, volume), makeNotePin(0, end - start, fadeout ? 0 : volume)];
        this.start = start;
        this.end = end;
    }
    Note.prototype.pickMainInterval = function () {
        var longestFlatIntervalDuration = 0;
        var mainInterval = 0;
        for (var pinIndex = 1; pinIndex < this.pins.length; pinIndex++) {
            var pinA = this.pins[pinIndex - 1];
            var pinB = this.pins[pinIndex];
            if (pinA.interval == pinB.interval) {
                var duration = pinB.time - pinA.time;
                if (longestFlatIntervalDuration < duration) {
                    longestFlatIntervalDuration = duration;
                    mainInterval = pinA.interval;
                }
            }
        }
        if (longestFlatIntervalDuration == 0) {
            var loudestVolume = 0;
            for (var pinIndex = 0; pinIndex < this.pins.length; pinIndex++) {
                var pin = this.pins[pinIndex];
                if (loudestVolume < pin.volume) {
                    loudestVolume = pin.volume;
                    mainInterval = pin.interval;
                }
            }
        }
        return mainInterval;
    };
    Note.prototype.clone = function () {
        var newNote = new Note(-1, this.start, this.end, 3);
        newNote.pitches = this.pitches.concat();
        newNote.pins = [];
        for (var _i = 0, _a = this.pins; _i < _a.length; _i++) {
            var pin = _a[_i];
            newNote.pins.push(makeNotePin(pin.interval, pin.time, pin.volume));
        }
        return newNote;
    };
    return Note;
})();
exports.Note = Note;
var Pattern = (function () {
    function Pattern() {
        this.notes = [];
        this.instrument = 0;
    }
    Pattern.prototype.cloneNotes = function () {
        var result = [];
        for (var _i = 0, _a = this.notes; _i < _a.length; _i++) {
            var note = _a[_i];
            result.push(note.clone());
        }
        return result;
    };
    Pattern.prototype.reset = function () {
        this.notes.length = 0;
        this.instrument = 0;
    };
    return Pattern;
})();
exports.Pattern = Pattern;
var Operator = (function () {
    function Operator(index) {
        this.frequency = 0;
        this.amplitude = 0;
        this.envelope = 0;
        this.reset(index);
    }
    Operator.prototype.reset = function (index) {
        this.frequency = 0;
        this.amplitude = (index <= 1) ? SynthConfig_1.Config.operatorAmplitudeMax : 0;
        this.envelope = (index == 0) ? 0 : 1;
    };
    return Operator;
})();
exports.Operator = Operator;
var SpectrumWave = (function () {
    function SpectrumWave(isNoiseChannel) {
        this.spectrum = [];
        this._wave = null = null;
        this._waveIsReady = false;
        this.reset(isNoiseChannel);
    }
    SpectrumWave.prototype.reset = function (isNoiseChannel) {
        for (var i = 0; i < SynthConfig_1.Config.spectrumControlPoints; i++) {
            if (isNoiseChannel) {
                this.spectrum[i] = Math.round(SynthConfig_1.Config.spectrumMax * (1 / Math.sqrt(1 + i / 3)));
            }
            else {
                var isHarmonic = i == 0 || i == 7 || i == 11 || i == 14 || i == 16 || i == 18 || i == 21 || i == 23 || i >= 25;
                this.spectrum[i] = isHarmonic ? Math.max(0, Math.round(SynthConfig_1.Config.spectrumMax * (1 - i / 30))) : 0;
            }
        }
        this._waveIsReady = false;
    };
    SpectrumWave.prototype.markCustomWaveDirty = function () {
        this._waveIsReady = false;
    };
    SpectrumWave.prototype.getCustomWave = function (lowestOctave) {
        if (!this._waveIsReady || this._wave == null) {
            var waveLength = SynthConfig_1.Config.chipNoiseLength;
            if (this._wave == null || this._wave.length != waveLength + 1) {
                this._wave = new Float32Array(waveLength + 1);
            }
            var wave = this._wave;
            for (var i = 0; i < waveLength; i++) {
                wave[i] = 0;
            }
            var highestOctave = 14;
            var falloffRatio = 0.25;
            // Nudge the 2/7 and 4/7 control points so that they form harmonic intervals.
            var pitchTweak = [0, 1 / 7, Math.log(5 / 4) / Math.LN2, 3 / 7, Math.log(3 / 2) / Math.LN2, 5 / 7, 6 / 7];
            function controlPointToOctave(point) {
                return lowestOctave + Math.floor(point / SynthConfig_1.Config.spectrumControlPointsPerOctave) + pitchTweak[(point + SynthConfig_1.Config.spectrumControlPointsPerOctave) % SynthConfig_1.Config.spectrumControlPointsPerOctave];
            }
            var combinedAmplitude = 1;
            for (var i = 0; i < SynthConfig_1.Config.spectrumControlPoints + 1; i++) {
                var value1 = (i <= 0) ? 0 : this.spectrum[i - 1];
                var value2 = (i >= SynthConfig_1.Config.spectrumControlPoints) ? this.spectrum[SynthConfig_1.Config.spectrumControlPoints - 1] : this.spectrum[i];
                var octave1 = controlPointToOctave(i - 1);
                var octave2 = controlPointToOctave(i);
                if (i >= SynthConfig_1.Config.spectrumControlPoints)
                    octave2 = highestOctave + (octave2 - highestOctave) * falloffRatio;
                if (value1 == 0 && value2 == 0)
                    continue;
                combinedAmplitude += 0.02 * SynthConfig_1.drawNoiseSpectrum(wave, octave1, octave2, value1 / SynthConfig_1.Config.spectrumMax, value2 / SynthConfig_1.Config.spectrumMax, -0.5);
            }
            if (this.spectrum[SynthConfig_1.Config.spectrumControlPoints - 1] > 0) {
                combinedAmplitude += 0.02 * SynthConfig_1.drawNoiseSpectrum(wave, highestOctave + (controlPointToOctave(SynthConfig_1.Config.spectrumControlPoints) - highestOctave) * falloffRatio, highestOctave, this.spectrum[SynthConfig_1.Config.spectrumControlPoints - 1] / SynthConfig_1.Config.spectrumMax, 0, -0.5);
            }
            FFT_1.inverseRealFourierTransform(wave, waveLength);
            FFT_1.scaleElementsByFactor(wave, 5.0 / (Math.sqrt(waveLength) * Math.pow(combinedAmplitude, 0.75)));
            // Duplicate the first sample at the end for easier wrap-around interpolation.
            wave[waveLength] = wave[0];
            this._waveIsReady = true;
        }
        return this._wave;
    };
    return SpectrumWave;
})();
exports.SpectrumWave = SpectrumWave;
var HarmonicsWave = (function () {
    function HarmonicsWave() {
        this.harmonics = [];
        this._wave = null = null;
        this._waveIsReady = false;
        this.reset();
    }
    HarmonicsWave.prototype.reset = function () {
        for (var i = 0; i < SynthConfig_1.Config.harmonicsControlPoints; i++) {
            this.harmonics[i] = 0;
        }
        this.harmonics[0] = SynthConfig_1.Config.harmonicsMax;
        this.harmonics[3] = SynthConfig_1.Config.harmonicsMax;
        this.harmonics[6] = SynthConfig_1.Config.harmonicsMax;
        this._waveIsReady = false;
    };
    HarmonicsWave.prototype.markCustomWaveDirty = function () {
        this._waveIsReady = false;
    };
    HarmonicsWave.prototype.getCustomWave = function () {
        if (!this._waveIsReady || this._wave == null) {
            var waveLength = SynthConfig_1.Config.harmonicsWavelength;
            var retroWave = SynthConfig_1.getDrumWave(0);
            if (this._wave == null || this._wave.length != waveLength + 1) {
                this._wave = new Float32Array(waveLength + 1);
            }
            var wave = this._wave;
            for (var i = 0; i < waveLength; i++) {
                wave[i] = 0;
            }
            var overallSlope = -0.25;
            var combinedControlPointAmplitude = 1;
            for (var harmonicIndex = 0; harmonicIndex < SynthConfig_1.Config.harmonicsRendered; harmonicIndex++) {
                var harmonicFreq = harmonicIndex + 1;
                var controlValue = harmonicIndex < SynthConfig_1.Config.harmonicsControlPoints ? this.harmonics[harmonicIndex] : this.harmonics[SynthConfig_1.Config.harmonicsControlPoints - 1];
                if (harmonicIndex >= SynthConfig_1.Config.harmonicsControlPoints) {
                    controlValue *= 1 - (harmonicIndex - SynthConfig_1.Config.harmonicsControlPoints) / (SynthConfig_1.Config.harmonicsRendered - SynthConfig_1.Config.harmonicsControlPoints);
                }
                var normalizedValue = controlValue / SynthConfig_1.Config.harmonicsMax;
                var amplitude = Math.pow(2, controlValue - SynthConfig_1.Config.harmonicsMax + 1) * Math.sqrt(normalizedValue);
                if (harmonicIndex < SynthConfig_1.Config.harmonicsControlPoints) {
                    combinedControlPointAmplitude += amplitude;
                }
                amplitude *= Math.pow(harmonicFreq, overallSlope);
                // Multiple all the sine wave amplitudes by 1 or -1 based on the LFSR
                // retro wave (effectively random) to avoid egregiously tall spikes.
                amplitude *= retroWave[harmonicIndex + 589];
                wave[waveLength - harmonicFreq] = amplitude;
            }
            FFT_1.inverseRealFourierTransform(wave, waveLength);
            // Limit the maximum wave amplitude.
            var mult = 1 / Math.pow(combinedControlPointAmplitude, 0.7);
            // Perform the integral on the wave. The chipSynth will perform the derivative to get the original wave back but with antialiasing.
            var cumulative = 0;
            var wavePrev = 0;
            for (var i = 0; i < wave.length; i++) {
                cumulative += wavePrev;
                wavePrev = wave[i] * mult;
                wave[i] = cumulative;
            }
            // The first sample should be zero, and we'll duplicate it at the end for easier interpolation.
            wave[waveLength] = wave[0];
            this._waveIsReady = true;
        }
        return this._wave;
    };
    return HarmonicsWave;
})();
exports.HarmonicsWave = HarmonicsWave;
var Instrument = (function () {
    function Instrument(isNoiseChannel) {
        this.type = 0 /* chip */;
        this.preset = 0;
        this.chipWave = 2;
        this.chipNoise = 1;
        this.filterCutoff = 6;
        this.filterResonance = 0;
        this.filterEnvelope = 1;
        this.transition = 1;
        this.vibrato = 0;
        this.interval = 0;
        this.effects = 0;
        this.chord = 1;
        this.volume = 0;
        this.pan = SynthConfig_1.Config.panCenter;
        this.pulseWidth = SynthConfig_1.Config.pulseWidthRange - 1;
        this.pulseEnvelope = 1;
        this.algorithm = 0;
        this.feedbackType = 0;
        this.feedbackAmplitude = 0;
        this.feedbackEnvelope = 1;
        this.readonly = operators;
        this.Operator = (_a = [], _a);
        this.readonly = spectrumWave;
        this.readonly = harmonicsWave;
        this.HarmonicsWave = new HarmonicsWave();
        this.readonly = drumsetEnvelopes;
        this.number = (_b = [], _b);
        this.readonly = drumsetSpectrumWaves;
        this.SpectrumWave = (_c = [], _c);
        this.spectrumWave = new SpectrumWave(isNoiseChannel);
        for (var i = 0; i < SynthConfig_1.Config.operatorCount; i++) {
            this.operators[i] = new Operator(i);
        }
        for (var i = 0; i < SynthConfig_1.Config.drumCount; i++) {
            this.drumsetEnvelopes[i] = SynthConfig_1.Config.envelopes.dictionary["twang 2"].index;
            this.drumsetSpectrumWaves[i] = new SpectrumWave(true);
        }
        var _a, _b, _c;
    }
    Instrument.prototype.setTypeAndReset = function (type, isNoiseChannel) {
        this.type = type;
        this.preset = type;
        this.volume = 0;
        this.pan = SynthConfig_1.Config.panCenter;
        switch (type) {
            case 0 /* chip */:
                this.chipWave = 2;
                this.filterCutoff = 6;
                this.filterResonance = 0;
                this.filterEnvelope = SynthConfig_1.Config.envelopes.dictionary["steady"].index;
                this.transition = 1;
                this.vibrato = 0;
                this.interval = 0;
                this.effects = 1;
                this.chord = 2;
                break;
            case 1 /* fm */:
                this.transition = 1;
                this.vibrato = 0;
                this.effects = 1;
                this.chord = 3;
                this.filterCutoff = 10;
                this.filterResonance = 0;
                this.filterEnvelope = 1;
                this.algorithm = 0;
                this.feedbackType = 0;
                this.feedbackAmplitude = 0;
                this.feedbackEnvelope = SynthConfig_1.Config.envelopes.dictionary["steady"].index;
                for (var i = 0; i < this.operators.length; i++) {
                    this.operators[i].reset(i);
                }
                break;
            case 2 /* noise */:
                this.chipNoise = 1;
                this.transition = 1;
                this.effects = 0;
                this.chord = 2;
                this.filterCutoff = 10;
                this.filterResonance = 0;
                this.filterEnvelope = SynthConfig_1.Config.envelopes.dictionary["steady"].index;
                break;
            case 3 /* spectrum */:
                this.transition = 1;
                this.effects = 1;
                this.chord = 0;
                this.filterCutoff = 10;
                this.filterResonance = 0;
                this.filterEnvelope = SynthConfig_1.Config.envelopes.dictionary["steady"].index;
                this.spectrumWave.reset(isNoiseChannel);
                break;
            case 4 /* drumset */:
                this.effects = 0;
                for (var i = 0; i < SynthConfig_1.Config.drumCount; i++) {
                    this.drumsetEnvelopes[i] = SynthConfig_1.Config.envelopes.dictionary["twang 2"].index;
                    this.drumsetSpectrumWaves[i].reset(isNoiseChannel);
                }
                break;
            case 5 /* harmonics */:
                this.filterCutoff = 10;
                this.filterResonance = 0;
                this.filterEnvelope = SynthConfig_1.Config.envelopes.dictionary["steady"].index;
                this.transition = 1;
                this.vibrato = 0;
                this.interval = 0;
                this.effects = 1;
                this.chord = 0;
                this.harmonicsWave.reset();
                break;
            case 6 /* pwm */:
                this.filterCutoff = 10;
                this.filterResonance = 0;
                this.filterEnvelope = SynthConfig_1.Config.envelopes.dictionary["steady"].index;
                this.transition = 1;
                this.vibrato = 0;
                this.interval = 0;
                this.effects = 1;
                this.chord = 2;
                this.pulseWidth = SynthConfig_1.Config.pulseWidthRange - 1;
                this.pulseEnvelope = SynthConfig_1.Config.envelopes.dictionary["twang 2"].index;
                break;
            default:
                throw new Error("Unrecognized instrument type: " + type);
        }
    };
    Instrument.prototype.toJsonObject = function () {
        var instrumentObject = {
            "type": SynthConfig_1.Config.instrumentTypeNames[this.type],
            "volume": (5 - this.volume) * 20,
            "pan": (this.pan - SynthConfig_1.Config.panCenter) * 100 / SynthConfig_1.Config.panCenter,
            "effects": SynthConfig_1.Config.effectsNames[this.effects]
        };
        if (this.preset != this.type) {
            instrumentObject["preset"] = this.preset;
        }
        if (this.type != 4 /* drumset */) {
            instrumentObject["transition"] = SynthConfig_1.Config.transitions[this.transition].name;
            instrumentObject["chord"] = this.getChord().name;
            instrumentObject["filterCutoffHz"] = Math.round(SynthConfig_1.Config.filterCutoffMaxHz * Math.pow(2.0, this.getFilterCutoffOctaves()));
            instrumentObject["filterResonance"] = Math.round(100 * this.filterResonance / (SynthConfig_1.Config.filterResonanceRange - 1));
            instrumentObject["filterEnvelope"] = this.getFilterEnvelope().name;
        }
        if (this.type == 2 /* noise */) {
            instrumentObject["wave"] = SynthConfig_1.Config.chipNoises[this.chipNoise].name;
        }
        else if (this.type == 3 /* spectrum */) {
            instrumentObject["spectrum"] = [];
            for (var i = 0; i < SynthConfig_1.Config.spectrumControlPoints; i++) {
                instrumentObject["spectrum"][i] = Math.round(100 * this.spectrumWave.spectrum[i] / SynthConfig_1.Config.spectrumMax);
            }
        }
        else if (this.type == 4 /* drumset */) {
            instrumentObject["drums"] = [];
            for (var j = 0; j < SynthConfig_1.Config.drumCount; j++) {
                var spectrum = [];
                for (var i = 0; i < SynthConfig_1.Config.spectrumControlPoints; i++) {
                    spectrum[i] = Math.round(100 * this.drumsetSpectrumWaves[j].spectrum[i] / SynthConfig_1.Config.spectrumMax);
                }
                instrumentObject["drums"][j] = {
                    "filterEnvelope": this.getDrumsetEnvelope(j).name,
                    "spectrum": spectrum
                };
            }
        }
        else if (this.type == 0 /* chip */) {
            instrumentObject["wave"] = SynthConfig_1.Config.chipWaves[this.chipWave].name;
            instrumentObject["interval"] = SynthConfig_1.Config.intervals[this.interval].name;
            instrumentObject["vibrato"] = SynthConfig_1.Config.vibratos[this.vibrato].name;
        }
        else if (this.type == 6 /* pwm */) {
            instrumentObject["pulseWidth"] = Math.round(Math.pow(0.5, (SynthConfig_1.Config.pulseWidthRange - this.pulseWidth - 1) * 0.5) * 50 * 32) / 32;
            instrumentObject["pulseEnvelope"] = SynthConfig_1.Config.envelopes[this.pulseEnvelope].name;
            instrumentObject["vibrato"] = SynthConfig_1.Config.vibratos[this.vibrato].name;
        }
        else if (this.type == 5 /* harmonics */) {
            instrumentObject["interval"] = SynthConfig_1.Config.intervals[this.interval].name;
            instrumentObject["vibrato"] = SynthConfig_1.Config.vibratos[this.vibrato].name;
            instrumentObject["harmonics"] = [];
            for (var i = 0; i < SynthConfig_1.Config.harmonicsControlPoints; i++) {
                instrumentObject["harmonics"][i] = Math.round(100 * this.harmonicsWave.harmonics[i] / SynthConfig_1.Config.harmonicsMax);
            }
        }
        else if (this.type == 1 /* fm */) {
            var operatorArray = [];
            for (var _i = 0, _a = this.operators; _i < _a.length; _i++) {
                var operator = _a[_i];
                operatorArray.push({
                    "frequency": SynthConfig_1.Config.operatorFrequencies[operator.frequency].name,
                    "amplitude": operator.amplitude,
                    "envelope": SynthConfig_1.Config.envelopes[operator.envelope].name
                });
            }
            instrumentObject["vibrato"] = SynthConfig_1.Config.vibratos[this.vibrato].name;
            instrumentObject["algorithm"] = SynthConfig_1.Config.algorithms[this.algorithm].name;
            instrumentObject["feedbackType"] = SynthConfig_1.Config.feedbacks[this.feedbackType].name;
            instrumentObject["feedbackAmplitude"] = this.feedbackAmplitude;
            instrumentObject["feedbackEnvelope"] = SynthConfig_1.Config.envelopes[this.feedbackEnvelope].name;
            instrumentObject["operators"] = operatorArray;
        }
        else {
            throw new Error("Unrecognized instrument type");
        }
        return instrumentObject;
    };
    Instrument.prototype.fromJsonObject = function (instrumentObject, isNoiseChannel) {
        if (instrumentObject == undefined)
            instrumentObject = {};
        var type = SynthConfig_1.Config.instrumentTypeNames.indexOf(instrumentObject["type"]);
        if (type == -1)
            type = isNoiseChannel ? 2 /* noise */ : 0 /* chip */;
        this.setTypeAndReset(type, isNoiseChannel);
        if (instrumentObject["preset"] != undefined) {
            this.preset = instrumentObject["preset"] >>> 0;
        }
        if (instrumentObject["volume"] != undefined) {
            this.volume = clamp(0, SynthConfig_1.Config.volumeRange, Math.round(5 - (instrumentObject["volume"] | 0) / 20));
        }
        else {
            this.volume = 0;
        }
        if (instrumentObject["pan"] != undefined) {
            this.pan = clamp(0, SynthConfig_1.Config.panMax + 1, Math.round(SynthConfig_1.Config.panCenter + (instrumentObject["pan"] | 0) * SynthConfig_1.Config.panCenter / 100));
        }
        else {
            this.pan = SynthConfig_1.Config.panCenter;
        }
        var oldTransitionNames = { "binary": 0, "sudden": 1, "smooth": 2 };
        var transitionObject = instrumentObject["transition"] || instrumentObject["envelope"]; // the transition property used to be called envelope, so try that too.
        this.transition = oldTransitionNames[transitionObject] != undefined ? oldTransitionNames[transitionObject] : SynthConfig_1.Config.transitions.findIndex(function (transition) { return transition.name == transitionObject; });
        if (this.transition == -1)
            this.transition = 1;
        this.effects = SynthConfig_1.Config.effectsNames.indexOf(instrumentObject["effects"]);
        if (this.effects == -1)
            this.effects = (this.type == 2 /* noise */) ? 0 : 1;
        if (instrumentObject["filterCutoffHz"] != undefined) {
            this.filterCutoff = clamp(0, SynthConfig_1.Config.filterCutoffRange, Math.round((SynthConfig_1.Config.filterCutoffRange - 1) + 2.0 * Math.log((instrumentObject["filterCutoffHz"] | 0) / SynthConfig_1.Config.filterCutoffMaxHz) / Math.LN2));
        }
        else {
            this.filterCutoff = (this.type == 0 /* chip */) ? 6 : 10;
        }
        if (instrumentObject["filterResonance"] != undefined) {
            this.filterResonance = clamp(0, SynthConfig_1.Config.filterResonanceRange, Math.round((SynthConfig_1.Config.filterResonanceRange - 1) * (instrumentObject["filterResonance"] | 0) / 100));
        }
        else {
            this.filterResonance = 0;
        }
        this.filterEnvelope = SynthConfig_1.Config.envelopes.findIndex(function (envelope) { return envelope.name == instrumentObject["filterEnvelope"]; });
        if (this.filterEnvelope == -1)
            this.filterEnvelope = SynthConfig_1.Config.envelopes.dictionary["steady"].index;
        if (instrumentObject["filter"] != undefined) {
            var legacyToCutoff = [10, 6, 3, 0, 8, 5, 2];
            var legacyToEnvelope = [1, 1, 1, 1, 18, 19, 20];
            var filterNames = ["none", "bright", "medium", "soft", "decay bright", "decay medium", "decay soft"];
            var oldFilterNames = { "sustain sharp": 1, "sustain medium": 2, "sustain soft": 3, "decay sharp": 4 };
            var legacyFilter = oldFilterNames[instrumentObject["filter"]] != undefined ? oldFilterNames[instrumentObject["filter"]] : filterNames.indexOf(instrumentObject["filter"]);
            if (legacyFilter == -1)
                legacyFilter = 0;
            this.filterCutoff = legacyToCutoff[legacyFilter];
            this.filterEnvelope = legacyToEnvelope[legacyFilter];
            this.filterResonance = 0;
        }
        var legacyEffectNames = ["none", "vibrato light", "vibrato delayed", "vibrato heavy"];
        if (this.type == 2 /* noise */) {
            this.chipNoise = SynthConfig_1.Config.chipNoises.findIndex(function (wave) { return wave.name == instrumentObject["wave"]; });
            if (this.chipNoise == -1)
                this.chipNoise = 1;
            this.chord = SynthConfig_1.Config.chords.findIndex(function (chord) { return chord.name == instrumentObject["chord"]; });
            if (this.chord == -1)
                this.chord = 2;
        }
        else if (this.type == 3 /* spectrum */) {
            if (instrumentObject["spectrum"] != undefined) {
                for (var i = 0; i < SynthConfig_1.Config.spectrumControlPoints; i++) {
                    this.spectrumWave.spectrum[i] = Math.max(0, Math.min(SynthConfig_1.Config.spectrumMax, Math.round(SynthConfig_1.Config.spectrumMax * (+instrumentObject["spectrum"][i]) / 100)));
                }
            }
            this.chord = SynthConfig_1.Config.chords.findIndex(function (chord) { return chord.name == instrumentObject["chord"]; });
            if (this.chord == -1)
                this.chord = 0;
        }
        else if (this.type == 4 /* drumset */) {
            if (instrumentObject["drums"] != undefined) {
                for (var j = 0; j < SynthConfig_1.Config.drumCount; j++) {
                    var drum = instrumentObject["drums"][j];
                    if (drum == undefined)
                        continue;
                    if (drum["filterEnvelope"] != undefined) {
                        this.drumsetEnvelopes[j] = SynthConfig_1.Config.envelopes.findIndex(function (envelope) { return envelope.name == drum["filterEnvelope"]; });
                        if (this.drumsetEnvelopes[j] == -1)
                            this.drumsetEnvelopes[j] = SynthConfig_1.Config.envelopes.dictionary["twang 2"].index;
                    }
                    if (drum["spectrum"] != undefined) {
                        for (var i = 0; i < SynthConfig_1.Config.spectrumControlPoints; i++) {
                            this.drumsetSpectrumWaves[j].spectrum[i] = Math.max(0, Math.min(SynthConfig_1.Config.spectrumMax, Math.round(SynthConfig_1.Config.spectrumMax * (+drum["spectrum"][i]) / 100)));
                        }
                    }
                }
            }
        }
        else if (this.type == 5 /* harmonics */) {
            if (instrumentObject["harmonics"] != undefined) {
                for (var i = 0; i < SynthConfig_1.Config.harmonicsControlPoints; i++) {
                    this.harmonicsWave.harmonics[i] = Math.max(0, Math.min(SynthConfig_1.Config.harmonicsMax, Math.round(SynthConfig_1.Config.harmonicsMax * (+instrumentObject["harmonics"][i]) / 100)));
                }
            }
            if (instrumentObject["interval"] != undefined) {
                this.interval = SynthConfig_1.Config.intervals.findIndex(function (interval) { return interval.name == instrumentObject["interval"]; });
                if (this.interval == -1)
                    this.interval = 0;
            }
            if (instrumentObject["vibrato"] != undefined) {
                this.vibrato = SynthConfig_1.Config.vibratos.findIndex(function (vibrato) { return vibrato.name == instrumentObject["vibrato"]; });
                if (this.vibrato == -1)
                    this.vibrato = 0;
            }
            this.chord = SynthConfig_1.Config.chords.findIndex(function (chord) { return chord.name == instrumentObject["chord"]; });
            if (this.chord == -1)
                this.chord = 0;
        }
        else if (this.type == 6 /* pwm */) {
            if (instrumentObject["pulseWidth"] != undefined) {
                this.pulseWidth = clamp(0, SynthConfig_1.Config.pulseWidthRange, Math.round((Math.log((+instrumentObject["pulseWidth"]) / 50) / Math.LN2) / 0.5 - 1 + 8));
            }
            else {
                this.pulseWidth = SynthConfig_1.Config.pulseWidthRange - 1;
            }
            if (instrumentObject["pulseEnvelope"] != undefined) {
                this.pulseEnvelope = SynthConfig_1.Config.envelopes.findIndex(function (envelope) { return envelope.name == instrumentObject["pulseEnvelope"]; });
                if (this.pulseEnvelope == -1)
                    this.pulseEnvelope = SynthConfig_1.Config.envelopes.dictionary["steady"].index;
            }
            if (instrumentObject["vibrato"] != undefined) {
                this.vibrato = SynthConfig_1.Config.vibratos.findIndex(function (vibrato) { return vibrato.name == instrumentObject["vibrato"]; });
                if (this.vibrato == -1)
                    this.vibrato = 0;
            }
            this.chord = SynthConfig_1.Config.chords.findIndex(function (chord) { return chord.name == instrumentObject["chord"]; });
            if (this.chord == -1)
                this.chord = 0;
        }
        else if (this.type == 0 /* chip */) {
            var legacyWaveNames = { "triangle": 1, "square": 2, "pulse wide": 3, "pulse narrow": 4, "sawtooth": 5, "double saw": 6, "double pulse": 7, "spiky": 8, "plateau": 0 };
            this.chipWave = legacyWaveNames[instrumentObject["wave"]] != undefined ? legacyWaveNames[instrumentObject["wave"]] : SynthConfig_1.Config.chipWaves.findIndex(function (wave) { return wave.name == instrumentObject["wave"]; });
            if (this.chipWave == -1)
                this.chipWave = 1;
            if (instrumentObject["interval"] != undefined) {
                this.interval = SynthConfig_1.Config.intervals.findIndex(function (interval) { return interval.name == instrumentObject["interval"]; });
                if (this.interval == -1)
                    this.interval = 0;
            }
            else if (instrumentObject["chorus"] != undefined) {
                var legacyChorusNames = { "fifths": 5, "octaves": 6 };
                this.interval = legacyChorusNames[instrumentObject["chorus"]] != undefined ? legacyChorusNames[instrumentObject["chorus"]] : SynthConfig_1.Config.intervals.findIndex(function (interval) { return interval.name == instrumentObject["chorus"]; });
                if (this.interval == -1)
                    this.interval = 0;
            }
            if (instrumentObject["vibrato"] != undefined) {
                this.vibrato = SynthConfig_1.Config.vibratos.findIndex(function (vibrato) { return vibrato.name == instrumentObject["vibrato"]; });
                if (this.vibrato == -1)
                    this.vibrato = 0;
            }
            else if (instrumentObject["effect"] != undefined) {
                this.vibrato = legacyEffectNames.indexOf(instrumentObject["effect"]);
                if (this.vibrato == -1)
                    this.vibrato = 0;
            }
            this.chord = SynthConfig_1.Config.chords.findIndex(function (chord) { return chord.name == instrumentObject["chord"]; });
            if (this.chord == -1)
                this.chord = 2;
            // The original chorus setting had an option that now maps to two different settings. Override those if necessary.
            if (instrumentObject["chorus"] == "custom harmony") {
                this.interval = 2;
                this.chord = 3;
            }
        }
        else if (this.type == 1 /* fm */) {
            if (instrumentObject["vibrato"] != undefined) {
                this.vibrato = SynthConfig_1.Config.vibratos.findIndex(function (vibrato) { return vibrato.name == instrumentObject["vibrato"]; });
                if (this.vibrato == -1)
                    this.vibrato = 0;
            }
            else if (instrumentObject["effect"] != undefined) {
                this.vibrato = legacyEffectNames.indexOf(instrumentObject["effect"]);
                if (this.vibrato == -1)
                    this.vibrato = 0;
            }
            this.chord = SynthConfig_1.Config.chords.findIndex(function (chord) { return chord.name == instrumentObject["chord"]; });
            if (this.chord == -1)
                this.chord = 3;
            this.algorithm = SynthConfig_1.Config.algorithms.findIndex(function (algorithm) { return algorithm.name == instrumentObject["algorithm"]; });
            if (this.algorithm == -1)
                this.algorithm = 0;
            this.feedbackType = SynthConfig_1.Config.feedbacks.findIndex(function (feedback) { return feedback.name == instrumentObject["feedbackType"]; });
            if (this.feedbackType == -1)
                this.feedbackType = 0;
            if (instrumentObject["feedbackAmplitude"] != undefined) {
                this.feedbackAmplitude = clamp(0, SynthConfig_1.Config.operatorAmplitudeMax + 1, instrumentObject["feedbackAmplitude"] | 0);
            }
            else {
                this.feedbackAmplitude = 0;
            }
            var legacyEnvelopeNames = { "pluck 1": 6, "pluck 2": 7, "pluck 3": 8 };
            this.feedbackEnvelope = legacyEnvelopeNames[instrumentObject["feedbackEnvelope"]] != undefined ? legacyEnvelopeNames[instrumentObject["feedbackEnvelope"]] : SynthConfig_1.Config.envelopes.findIndex(function (envelope) { return envelope.name == instrumentObject["feedbackEnvelope"]; });
            if (this.feedbackEnvelope == -1)
                this.feedbackEnvelope = 0;
            for (var j = 0; j < SynthConfig_1.Config.operatorCount; j++) {
                var operator = this.operators[j];
                var operatorObject = undefined;
                if (instrumentObject["operators"])
                    operatorObject = instrumentObject["operators"][j];
                if (operatorObject == undefined)
                    operatorObject = {};
                operator.frequency = SynthConfig_1.Config.operatorFrequencies.findIndex(function (freq) { return freq.name == operatorObject["frequency"]; });
                if (operator.frequency == -1)
                    operator.frequency = 0;
                if (operatorObject["amplitude"] != undefined) {
                    operator.amplitude = clamp(0, SynthConfig_1.Config.operatorAmplitudeMax + 1, operatorObject["amplitude"] | 0);
                }
                else {
                    operator.amplitude = 0;
                }
                operator.envelope = legacyEnvelopeNames[operatorObject["envelope"]] != undefined ? legacyEnvelopeNames[operatorObject["envelope"]] : SynthConfig_1.Config.envelopes.findIndex(function (envelope) { return envelope.name == operatorObject["envelope"]; });
                if (operator.envelope == -1)
                    operator.envelope = 0;
            }
        }
        else {
            throw new Error("Unrecognized instrument type.");
        }
    };
    Instrument.frequencyFromPitch = function (pitch) {
        return 440.0 * Math.pow(2.0, (pitch - 69.0) / 12.0);
    };
    Instrument.drumsetIndexReferenceDelta = function (index) {
        return Instrument.frequencyFromPitch(SynthConfig_1.Config.spectrumBasePitch + index * 6) / 44100;
    };
    Instrument._drumsetIndexToSpectrumOctave = function (index) {
        return 15 + Math.log(Instrument.drumsetIndexReferenceDelta(index)) / Math.LN2;
    };
    Instrument.prototype.warmUp = function () {
        if (this.type == 2 /* noise */) {
            SynthConfig_1.getDrumWave(this.chipNoise, FFT_1.inverseRealFourierTransform, FFT_1.scaleElementsByFactor);
        }
        else if (this.type == 5 /* harmonics */) {
            this.harmonicsWave.getCustomWave();
        }
        else if (this.type == 3 /* spectrum */) {
            this.spectrumWave.getCustomWave(8);
        }
        else if (this.type == 4 /* drumset */) {
            for (var i = 0; i < SynthConfig_1.Config.drumCount; i++) {
                this.drumsetSpectrumWaves[i].getCustomWave(Instrument._drumsetIndexToSpectrumOctave(i));
            }
        }
    };
    Instrument.prototype.getDrumWave = function () {
        if (this.type == 2 /* noise */) {
            return SynthConfig_1.getDrumWave(this.chipNoise, FFT_1.inverseRealFourierTransform, FFT_1.scaleElementsByFactor);
        }
        else if (this.type == 3 /* spectrum */) {
            return this.spectrumWave.getCustomWave(8);
        }
        else {
            throw new Error("Unhandled instrument type in getDrumWave");
        }
    };
    Instrument.prototype.getDrumsetWave = function (pitch) {
        if (this.type == 4 /* drumset */) {
            return this.drumsetSpectrumWaves[pitch].getCustomWave(Instrument._drumsetIndexToSpectrumOctave(pitch));
        }
        else {
            throw new Error("Unhandled instrument type in getDrumWave");
        }
    };
    Instrument.prototype.getTransition = function () {
        return this.type == 4 /* drumset */ ? SynthConfig_1.Config.transitions.dictionary["hard fade"] : SynthConfig_1.Config.transitions[this.transition];
    };
    Instrument.prototype.getChord = function () {
        return this.type == 4 /* drumset */ ? SynthConfig_1.Config.chords.dictionary["harmony"] : SynthConfig_1.Config.chords[this.chord];
    };
    Instrument.prototype.getFilterCutoffOctaves = function () {
        return this.type == 4 /* drumset */ ? 0 : (this.filterCutoff - (SynthConfig_1.Config.filterCutoffRange - 1)) * 0.5;
    };
    Instrument.prototype.getFilterIsFirstOrder = function () {
        return this.type == 4 /* drumset */ ? false : this.filterResonance == 0;
    };
    Instrument.prototype.getFilterResonance = function () {
        return this.type == 4 /* drumset */ ? 1 : this.filterResonance;
    };
    Instrument.prototype.getFilterEnvelope = function () {
        if (this.type == 4 /* drumset */)
            throw new Error("Can't getFilterEnvelope() for drumset.");
        return SynthConfig_1.Config.envelopes[this.filterEnvelope];
    };
    Instrument.prototype.getDrumsetEnvelope = function (pitch) {
        if (this.type != 4 /* drumset */)
            throw new Error("Can't getDrumsetEnvelope() for non-drumset.");
        return SynthConfig_1.Config.envelopes[this.drumsetEnvelopes[pitch]];
    };
    return Instrument;
})();
exports.Instrument = Instrument;
var Channel = (function () {
    function Channel() {
        this.octave = 0;
        this.readonly = instruments;
        this.Instrument = (_a = [], _a);
        this.readonly = patterns;
        this.Pattern = (_b = [], _b);
        this.readonly = bars;
        this.number = (_c = [], _c);
        this.muted = false;
        var _a, _b, _c;
    }
    return Channel;
})();
exports.Channel = Channel;
var Song = (function () {
    function Song(string) {
        this.string = "BeepBox";
        this.number = 2;
        this.number = 8;
        this.readonly = channels;
        this.Channel = (_a = [], _a);
        if (string != undefined) {
            this.fromBase64String(string);
        }
        else {
            this.initToDefault(true);
        }
        var _a;
    }
    Song.prototype.getChannelCount = function () {
        return this.pitchChannelCount + this.noiseChannelCount;
    };
    Song.prototype.getChannelIsNoise = function (channel) {
        return (channel >= this.pitchChannelCount);
    };
    Song.prototype.initToDefault = function (andResetChannels) {
        if (andResetChannels === void 0) { andResetChannels = true; }
        this.scale = 0;
        this.key = 0;
        this.loopStart = 0;
        this.loopLength = 4;
        this.tempo = 150;
        this.reverb = 0;
        this.beatsPerBar = 8;
        this.barCount = 16;
        this.patternsPerChannel = 8;
        this.rhythm = 1;
        this.instrumentsPerChannel = 1;
        if (andResetChannels) {
            this.pitchChannelCount = 3;
            this.noiseChannelCount = 1;
            for (var channelIndex = 0; channelIndex < this.getChannelCount(); channelIndex++) {
                if (this.channels.length <= channelIndex) {
                    this.channels[channelIndex] = new Channel();
                }
                var channel = this.channels[channelIndex];
                channel.octave = 3 - channelIndex; // [3, 2, 1, 0]; Descending octaves with drums at zero in last channel.
                for (var pattern = 0; pattern < this.patternsPerChannel; pattern++) {
                    if (channel.patterns.length <= pattern) {
                        channel.patterns[pattern] = new Pattern();
                    }
                    else {
                        channel.patterns[pattern].reset();
                    }
                }
                channel.patterns.length = this.patternsPerChannel;
                var isNoiseChannel = channelIndex >= this.pitchChannelCount;
                for (var instrument = 0; instrument < this.instrumentsPerChannel; instrument++) {
                    if (channel.instruments.length <= instrument) {
                        channel.instruments[instrument] = new Instrument(isNoiseChannel);
                    }
                    channel.instruments[instrument].setTypeAndReset(isNoiseChannel ? 2 /* noise */ : 0 /* chip */, isNoiseChannel);
                }
                channel.instruments.length = this.instrumentsPerChannel;
                for (var bar = 0; bar < this.barCount; bar++) {
                    channel.bars[bar] = bar < 4 ? 1 : 0;
                }
                channel.bars.length = this.barCount;
            }
            this.channels.length = this.getChannelCount();
        }
    };
    Song.prototype.toBase64String = function () {
        var bits;
        var buffer = [];
        buffer.push(base64IntToCharCode[Song._latestVersion]);
        buffer.push(110 /* channelCount */, base64IntToCharCode[this.pitchChannelCount], base64IntToCharCode[this.noiseChannelCount]);
        buffer.push(115 /* scale */, base64IntToCharCode[this.scale]);
        buffer.push(107 /* key */, base64IntToCharCode[this.key]);
        buffer.push(108 /* loopStart */, base64IntToCharCode[this.loopStart >> 6], base64IntToCharCode[this.loopStart & 0x3f]);
        buffer.push(101 /* loopEnd */, base64IntToCharCode[(this.loopLength - 1) >> 6], base64IntToCharCode[(this.loopLength - 1) & 0x3f]);
        buffer.push(116 /* tempo */, base64IntToCharCode[this.tempo >> 6], base64IntToCharCode[this.tempo & 63]);
        buffer.push(109 /* reverb */, base64IntToCharCode[this.reverb]);
        buffer.push(97 /* beatCount */, base64IntToCharCode[this.beatsPerBar - 1]);
        buffer.push(103 /* barCount */, base64IntToCharCode[(this.barCount - 1) >> 6], base64IntToCharCode[(this.barCount - 1) & 0x3f]);
        buffer.push(106 /* patternCount */, base64IntToCharCode[(this.patternsPerChannel - 1) >> 6], base64IntToCharCode[(this.patternsPerChannel - 1) & 0x3f]);
        buffer.push(105 /* instrumentCount */, base64IntToCharCode[this.instrumentsPerChannel - 1]);
        buffer.push(114 /* rhythm */, base64IntToCharCode[this.rhythm]);
        buffer.push(111 /* channelOctave */);
        for (var channel = 0; channel < this.getChannelCount(); channel++) {
            buffer.push(base64IntToCharCode[this.channels[channel].octave]);
        }
        for (var channel = 0; channel < this.getChannelCount(); channel++) {
            for (var i = 0; i < this.instrumentsPerChannel; i++) {
                var instrument = this.channels[channel].instruments[i];
                buffer.push(84 /* startInstrument */, base64IntToCharCode[instrument.type]);
                buffer.push(118 /* volume */, base64IntToCharCode[instrument.volume]);
                buffer.push(76 /* pan */, base64IntToCharCode[instrument.pan]);
                buffer.push(117 /* preset */, base64IntToCharCode[instrument.preset >> 6], base64IntToCharCode[instrument.preset & 63]);
                buffer.push(113 /* effects */, base64IntToCharCode[instrument.effects]);
                if (instrument.type != 4 /* drumset */) {
                    buffer.push(100 /* transition */, base64IntToCharCode[instrument.transition]);
                    buffer.push(102 /* filterCutoff */, base64IntToCharCode[instrument.filterCutoff]);
                    buffer.push(121 /* filterResonance */, base64IntToCharCode[instrument.filterResonance]);
                    buffer.push(122 /* filterEnvelope */, base64IntToCharCode[instrument.filterEnvelope]);
                    buffer.push(67 /* chord */, base64IntToCharCode[instrument.chord]);
                }
                if (instrument.type == 0 /* chip */) {
                    buffer.push(119 /* wave */, base64IntToCharCode[instrument.chipWave]);
                    buffer.push(99 /* vibrato */, base64IntToCharCode[instrument.vibrato]);
                    buffer.push(104 /* interval */, base64IntToCharCode[instrument.interval]);
                }
                else if (instrument.type == 1 /* fm */) {
                    buffer.push(99 /* vibrato */, base64IntToCharCode[instrument.vibrato]);
                    buffer.push(65 /* algorithm */, base64IntToCharCode[instrument.algorithm]);
                    buffer.push(70 /* feedbackType */, base64IntToCharCode[instrument.feedbackType]);
                    buffer.push(66 /* feedbackAmplitude */, base64IntToCharCode[instrument.feedbackAmplitude]);
                    buffer.push(86 /* feedbackEnvelope */, base64IntToCharCode[instrument.feedbackEnvelope]);
                    buffer.push(81 /* operatorFrequencies */);
                    for (var o = 0; o < SynthConfig_1.Config.operatorCount; o++) {
                        buffer.push(base64IntToCharCode[instrument.operators[o].frequency]);
                    }
                    buffer.push(80 /* operatorAmplitudes */);
                    for (var o = 0; o < SynthConfig_1.Config.operatorCount; o++) {
                        buffer.push(base64IntToCharCode[instrument.operators[o].amplitude]);
                    }
                    buffer.push(69 /* operatorEnvelopes */);
                    for (var o = 0; o < SynthConfig_1.Config.operatorCount; o++) {
                        buffer.push(base64IntToCharCode[instrument.operators[o].envelope]);
                    }
                }
                else if (instrument.type == 2 /* noise */) {
                    buffer.push(119 /* wave */, base64IntToCharCode[instrument.chipNoise]);
                }
                else if (instrument.type == 3 /* spectrum */) {
                    buffer.push(83 /* spectrum */);
                    var spectrumBits = new BitFieldWriter();
                    for (var i_1 = 0; i_1 < SynthConfig_1.Config.spectrumControlPoints; i_1++) {
                        spectrumBits.write(SynthConfig_1.Config.spectrumControlPointBits, instrument.spectrumWave.spectrum[i_1]);
                    }
                    spectrumBits.encodeBase64(buffer);
                }
                else if (instrument.type == 4 /* drumset */) {
                    buffer.push(122 /* filterEnvelope */);
                    for (var j = 0; j < SynthConfig_1.Config.drumCount; j++) {
                        buffer.push(base64IntToCharCode[instrument.drumsetEnvelopes[j]]);
                    }
                    buffer.push(83 /* spectrum */);
                    var spectrumBits = new BitFieldWriter();
                    for (var j = 0; j < SynthConfig_1.Config.drumCount; j++) {
                        for (var i_2 = 0; i_2 < SynthConfig_1.Config.spectrumControlPoints; i_2++) {
                            spectrumBits.write(SynthConfig_1.Config.spectrumControlPointBits, instrument.drumsetSpectrumWaves[j].spectrum[i_2]);
                        }
                    }
                    spectrumBits.encodeBase64(buffer);
                }
                else if (instrument.type == 5 /* harmonics */) {
                    buffer.push(99 /* vibrato */, base64IntToCharCode[instrument.vibrato]);
                    buffer.push(104 /* interval */, base64IntToCharCode[instrument.interval]);
                    buffer.push(72 /* harmonics */);
                    var harmonicsBits = new BitFieldWriter();
                    for (var i_3 = 0; i_3 < SynthConfig_1.Config.harmonicsControlPoints; i_3++) {
                        harmonicsBits.write(SynthConfig_1.Config.harmonicsControlPointBits, instrument.harmonicsWave.harmonics[i_3]);
                    }
                    harmonicsBits.encodeBase64(buffer);
                }
                else if (instrument.type == 6 /* pwm */) {
                    buffer.push(99 /* vibrato */, base64IntToCharCode[instrument.vibrato]);
                    buffer.push(87 /* pulseWidth */, base64IntToCharCode[instrument.pulseWidth], base64IntToCharCode[instrument.pulseEnvelope]);
                }
                else {
                    throw new Error("Unknown instrument type.");
                }
            }
        }
        buffer.push(98 /* bars */);
        bits = new BitFieldWriter();
        var neededBits = 0;
        while ((1 << neededBits) < this.patternsPerChannel + 1)
            neededBits++;
        for (var channel = 0; channel < this.getChannelCount(); channel++)
            for (var i = 0; i < this.barCount; i++) {
                bits.write(neededBits, this.channels[channel].bars[i]);
            }
        bits.encodeBase64(buffer);
        buffer.push(112 /* patterns */);
        bits = new BitFieldWriter();
        var shapeBits = new BitFieldWriter();
        var neededInstrumentBits = 0;
        while ((1 << neededInstrumentBits) < this.instrumentsPerChannel)
            neededInstrumentBits++;
        for (var channel = 0; channel < this.getChannelCount(); channel++) {
            var isNoiseChannel = this.getChannelIsNoise(channel);
            var octaveOffset = isNoiseChannel ? 0 : this.channels[channel].octave * 12;
            var lastPitch = (isNoiseChannel ? 4 : 12) + octaveOffset;
            var recentPitches = isNoiseChannel ? [4, 6, 7, 2, 3, 8, 0, 10] : [12, 19, 24, 31, 36, 7, 0];
            var recentShapes = [];
            for (var i = 0; i < recentPitches.length; i++) {
                recentPitches[i] += octaveOffset;
            }
            for (var _i = 0, _a = this.channels[channel].patterns; _i < _a.length; _i++) {
                var pattern = _a[_i];
                bits.write(neededInstrumentBits, pattern.instrument);
                if (pattern.notes.length > 0) {
                    bits.write(1, 1);
                    var curPart = 0;
                    for (var _b = 0, _c = pattern.notes; _b < _c.length; _b++) {
                        var note = _c[_b];
                        if (note.start > curPart) {
                            bits.write(2, 0); // rest
                            bits.writePartDuration(note.start - curPart);
                        }
                        shapeBits.clear();
                        // 0: 1 pitch, 10: 2 pitches, 110: 3 pitches, 111: 4 pitches
                        for (var i = 1; i < note.pitches.length; i++)
                            shapeBits.write(1, 1);
                        if (note.pitches.length < SynthConfig_1.Config.maxChordSize)
                            shapeBits.write(1, 0);
                        shapeBits.writePinCount(note.pins.length - 1);
                        shapeBits.write(2, note.pins[0].volume); // volume
                        var shapePart = 0;
                        var startPitch = note.pitches[0];
                        var currentPitch = startPitch;
                        var pitchBends = [];
                        for (var i = 1; i < note.pins.length; i++) {
                            var pin = note.pins[i];
                            var nextPitch = startPitch + pin.interval;
                            if (currentPitch != nextPitch) {
                                shapeBits.write(1, 1);
                                pitchBends.push(nextPitch);
                                currentPitch = nextPitch;
                            }
                            else {
                                shapeBits.write(1, 0);
                            }
                            shapeBits.writePartDuration(pin.time - shapePart);
                            shapePart = pin.time;
                            shapeBits.write(2, pin.volume);
                        }
                        var shapeString = String.fromCharCode.apply(null, shapeBits.encodeBase64([]));
                        var shapeIndex = recentShapes.indexOf(shapeString);
                        if (shapeIndex == -1) {
                            bits.write(2, 1); // new shape
                            bits.concat(shapeBits);
                        }
                        else {
                            bits.write(1, 1); // old shape
                            bits.writeLongTail(0, 0, shapeIndex);
                            recentShapes.splice(shapeIndex, 1);
                        }
                        recentShapes.unshift(shapeString);
                        if (recentShapes.length > 10)
                            recentShapes.pop();
                        var allPitches = note.pitches.concat(pitchBends);
                        for (var i = 0; i < allPitches.length; i++) {
                            var pitch = allPitches[i];
                            var pitchIndex = recentPitches.indexOf(pitch);
                            if (pitchIndex == -1) {
                                var interval = 0;
                                var pitchIter = lastPitch;
                                if (pitchIter < pitch) {
                                    while (pitchIter != pitch) {
                                        pitchIter++;
                                        if (recentPitches.indexOf(pitchIter) == -1)
                                            interval++;
                                    }
                                }
                                else {
                                    while (pitchIter != pitch) {
                                        pitchIter--;
                                        if (recentPitches.indexOf(pitchIter) == -1)
                                            interval--;
                                    }
                                }
                                bits.write(1, 0);
                                bits.writePitchInterval(interval);
                            }
                            else {
                                bits.write(1, 1);
                                bits.write(3, pitchIndex);
                                recentPitches.splice(pitchIndex, 1);
                            }
                            recentPitches.unshift(pitch);
                            if (recentPitches.length > 8)
                                recentPitches.pop();
                            if (i == note.pitches.length - 1) {
                                lastPitch = note.pitches[0];
                            }
                            else {
                                lastPitch = pitch;
                            }
                        }
                        curPart = note.end;
                    }
                    if (curPart < this.beatsPerBar * SynthConfig_1.Config.partsPerBeat) {
                        bits.write(2, 0); // rest
                        bits.writePartDuration(this.beatsPerBar * SynthConfig_1.Config.partsPerBeat - curPart);
                    }
                }
                else {
                    bits.write(1, 0);
                }
            }
        }
        var stringLength = bits.lengthBase64();
        var digits = [];
        while (stringLength > 0) {
            digits.unshift(base64IntToCharCode[stringLength & 0x3f]);
            stringLength = stringLength >> 6;
        }
        buffer.push(base64IntToCharCode[digits.length]);
        Array.prototype.push.apply(buffer, digits); // append digits to buffer.
        bits.encodeBase64(buffer);
        var maxApplyArgs = 64000;
        if (buffer.length < maxApplyArgs) {
            // Note: Function.apply may break for long argument lists. 
            return String.fromCharCode.apply(null, buffer);
        }
        else {
            var result = "";
            for (var i = 0; i < buffer.length; i += maxApplyArgs) {
                result += String.fromCharCode.apply(null, buffer.slice(i, i + maxApplyArgs));
            }
            return result;
        }
    };
    Song.prototype.fromBase64String = function (compressed) {
        if (compressed == null || compressed == "") {
            this.initToDefault(true);
            return;
        }
        var charIndex = 0;
        // skip whitespace.
        while (compressed.charCodeAt(charIndex) <= 32 /* SPACE */)
            charIndex++;
        // skip hash mark.
        if (compressed.charCodeAt(charIndex) == 35 /* HASH */)
            charIndex++;
        // if it starts with curly brace, treat it as JSON.
        if (compressed.charCodeAt(charIndex) == 123 /* LEFT_CURLY_BRACE */) {
            this.fromJsonObject(JSON.parse(charIndex == 0 ? compressed : compressed.substring(charIndex)));
            return;
        }
        var version = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
        if (version == -1 || version > Song._latestVersion || version < Song._oldestVersion)
            return;
        var beforeThree = version < 3;
        var beforeFour = version < 4;
        var beforeFive = version < 5;
        var beforeSix = version < 6;
        var beforeSeven = version < 7;
        var beforeEight = version < 8;
        this.initToDefault(beforeSix);
        if (beforeThree) {
            // Originally, the only instrument transition was "seamless" and the only drum wave was "retro".
            for (var _i = 0, _a = this.channels; _i < _a.length; _i++) {
                var channel = _a[_i];
                channel.instruments[0].transition = 0;
            }
            this.channels[3].instruments[0].chipNoise = 0;
        }
        var instrumentChannelIterator = 0;
        var instrumentIndexIterator = -1;
        var command;
        while (charIndex < compressed.length)
            switch (command = compressed.charCodeAt(charIndex++)) {
                case 110 /* channelCount */:
                    {
                        this.pitchChannelCount = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                        this.noiseChannelCount = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                        this.pitchChannelCount = validateRange(SynthConfig_1.Config.pitchChannelCountMin, SynthConfig_1.Config.pitchChannelCountMax, this.pitchChannelCount);
                        this.noiseChannelCount = validateRange(SynthConfig_1.Config.noiseChannelCountMin, SynthConfig_1.Config.noiseChannelCountMax, this.noiseChannelCount);
                        for (var channelIndex = this.channels.length; channelIndex < this.getChannelCount(); channelIndex++) {
                            this.channels[channelIndex] = new Channel();
                        }
                        this.channels.length = this.getChannelCount();
                    }
                    break;
                case 115 /* scale */:
                    {
                        this.scale = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                        if (beforeThree && this.scale == 10)
                            this.scale = 11;
                    }
                    break;
                case 107 /* key */:
                    {
                        if (beforeSeven) {
                            this.key = clamp(0, SynthConfig_1.Config.keys.length, 11 - base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                        else {
                            this.key = clamp(0, SynthConfig_1.Config.keys.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                    }
                    break;
                case 108 /* loopStart */:
                    {
                        if (beforeFive) {
                            this.loopStart = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                        }
                        else {
                            this.loopStart = (base64CharCodeToInt[compressed.charCodeAt(charIndex++)] << 6) + base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                        }
                    }
                    break;
                case 101 /* loopEnd */:
                    {
                        if (beforeFive) {
                            this.loopLength = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                        }
                        else {
                            this.loopLength = (base64CharCodeToInt[compressed.charCodeAt(charIndex++)] << 6) + base64CharCodeToInt[compressed.charCodeAt(charIndex++)] + 1;
                        }
                    }
                    break;
                case 116 /* tempo */:
                    {
                        if (beforeFour) {
                            this.tempo = [95, 120, 151, 190][base64CharCodeToInt[compressed.charCodeAt(charIndex++)]];
                        }
                        else if (beforeSeven) {
                            this.tempo = [88, 95, 103, 111, 120, 130, 140, 151, 163, 176, 190, 206, 222, 240, 259][base64CharCodeToInt[compressed.charCodeAt(charIndex++)]];
                        }
                        else {
                            this.tempo = (base64CharCodeToInt[compressed.charCodeAt(charIndex++)] << 6) | (base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                        this.tempo = clamp(SynthConfig_1.Config.tempoMin, SynthConfig_1.Config.tempoMax + 1, this.tempo);
                    }
                    break;
                case 109 /* reverb */:
                    {
                        this.reverb = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                        this.reverb = clamp(0, SynthConfig_1.Config.reverbRange, this.reverb);
                    }
                    break;
                case 97 /* beatCount */:
                    {
                        if (beforeThree) {
                            this.beatsPerBar = [6, 7, 8, 9, 10][base64CharCodeToInt[compressed.charCodeAt(charIndex++)]];
                        }
                        else {
                            this.beatsPerBar = base64CharCodeToInt[compressed.charCodeAt(charIndex++)] + 1;
                        }
                        this.beatsPerBar = Math.max(SynthConfig_1.Config.beatsPerBarMin, Math.min(SynthConfig_1.Config.beatsPerBarMax, this.beatsPerBar));
                    }
                    break;
                case 103 /* barCount */:
                    {
                        var barCount = (base64CharCodeToInt[compressed.charCodeAt(charIndex++)] << 6) + base64CharCodeToInt[compressed.charCodeAt(charIndex++)] + 1;
                        this.barCount = validateRange(SynthConfig_1.Config.barCountMin, SynthConfig_1.Config.barCountMax, barCount);
                        for (var channel = 0; channel < this.getChannelCount(); channel++) {
                            for (var bar = this.channels[channel].bars.length; bar < this.barCount; bar++) {
                                this.channels[channel].bars[bar] = 1;
                            }
                            this.channels[channel].bars.length = this.barCount;
                        }
                    }
                    break;
                case 106 /* patternCount */:
                    {
                        var patternsPerChannel = void 0;
                        if (beforeEight) {
                            patternsPerChannel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)] + 1;
                        }
                        else {
                            patternsPerChannel = (base64CharCodeToInt[compressed.charCodeAt(charIndex++)] << 6) + base64CharCodeToInt[compressed.charCodeAt(charIndex++)] + 1;
                        }
                        this.patternsPerChannel = validateRange(1, SynthConfig_1.Config.barCountMax, patternsPerChannel);
                        for (var channel = 0; channel < this.getChannelCount(); channel++) {
                            for (var pattern = this.channels[channel].patterns.length; pattern < this.patternsPerChannel; pattern++) {
                                this.channels[channel].patterns[pattern] = new Pattern();
                            }
                            this.channels[channel].patterns.length = this.patternsPerChannel;
                        }
                    }
                    break;
                case 105 /* instrumentCount */:
                    {
                        var instrumentsPerChannel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)] + 1;
                        this.instrumentsPerChannel = validateRange(SynthConfig_1.Config.instrumentsPerChannelMin, SynthConfig_1.Config.instrumentsPerChannelMax, instrumentsPerChannel);
                        for (var channel = 0; channel < this.getChannelCount(); channel++) {
                            var isNoiseChannel = channel >= this.pitchChannelCount;
                            for (var instrumentIndex = this.channels[channel].instruments.length; instrumentIndex < this.instrumentsPerChannel; instrumentIndex++) {
                                this.channels[channel].instruments[instrumentIndex] = new Instrument(isNoiseChannel);
                            }
                            this.channels[channel].instruments.length = this.instrumentsPerChannel;
                            if (beforeSix) {
                                for (var instrumentIndex = 0; instrumentIndex < this.instrumentsPerChannel; instrumentIndex++) {
                                    this.channels[channel].instruments[instrumentIndex].setTypeAndReset(isNoiseChannel ? 2 /* noise */ : 0 /* chip */, isNoiseChannel);
                                }
                            }
                        }
                    }
                    break;
                case 114 /* rhythm */:
                    {
                        this.rhythm = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                    }
                    break;
                case 111 /* channelOctave */:
                    {
                        if (beforeThree) {
                            var channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                            this.channels[channel].octave = clamp(0, SynthConfig_1.Config.scrollableOctaves + 1, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                        else {
                            for (var channel = 0; channel < this.getChannelCount(); channel++) {
                                this.channels[channel].octave = clamp(0, SynthConfig_1.Config.scrollableOctaves + 1, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                            }
                        }
                    }
                    break;
                case 84 /* startInstrument */:
                    {
                        instrumentIndexIterator++;
                        if (instrumentIndexIterator >= this.instrumentsPerChannel) {
                            instrumentChannelIterator++;
                            instrumentIndexIterator = 0;
                        }
                        validateRange(0, this.channels.length - 1, instrumentChannelIterator);
                        var instrument = this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator];
                        var instrumentType = validateRange(0, 7 /* length */ - 1, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        instrument.setTypeAndReset(instrumentType, instrumentChannelIterator >= this.pitchChannelCount);
                    }
                    break;
                case 117 /* preset */:
                    {
                        var presetValue = (base64CharCodeToInt[compressed.charCodeAt(charIndex++)] << 6) | (base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].preset = presetValue;
                    }
                    break;
                case 119 /* wave */:
                    {
                        if (beforeThree) {
                            var legacyWaves = [1, 2, 3, 4, 5, 6, 7, 8, 0];
                            var channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                            this.channels[channel].instruments[0].chipWave = clamp(0, SynthConfig_1.Config.chipWaves.length, legacyWaves[base64CharCodeToInt[compressed.charCodeAt(charIndex++)]] | 0);
                        }
                        else if (beforeSix) {
                            var legacyWaves = [1, 2, 3, 4, 5, 6, 7, 8, 0];
                            for (var channel = 0; channel < this.getChannelCount(); channel++) {
                                for (var i = 0; i < this.instrumentsPerChannel; i++) {
                                    if (channel >= this.pitchChannelCount) {
                                        this.channels[channel].instruments[i].chipNoise = clamp(0, SynthConfig_1.Config.chipNoises.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                                    }
                                    else {
                                        this.channels[channel].instruments[i].chipWave = clamp(0, SynthConfig_1.Config.chipWaves.length, legacyWaves[base64CharCodeToInt[compressed.charCodeAt(charIndex++)]] | 0);
                                    }
                                }
                            }
                        }
                        else if (beforeSeven) {
                            var legacyWaves = [1, 2, 3, 4, 5, 6, 7, 8, 0];
                            if (instrumentChannelIterator >= this.pitchChannelCount) {
                                this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].chipNoise = clamp(0, SynthConfig_1.Config.chipNoises.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                            }
                            else {
                                this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].chipWave = clamp(0, SynthConfig_1.Config.chipWaves.length, legacyWaves[base64CharCodeToInt[compressed.charCodeAt(charIndex++)]] | 0);
                            }
                        }
                        else {
                            if (instrumentChannelIterator >= this.pitchChannelCount) {
                                this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].chipNoise = clamp(0, SynthConfig_1.Config.chipNoises.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                            }
                            else {
                                this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].chipWave = clamp(0, SynthConfig_1.Config.chipWaves.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                            }
                        }
                    }
                    break;
                case 102 /* filterCutoff */:
                    {
                        if (beforeSeven) {
                            var legacyToCutoff = [10, 6, 3, 0, 8, 5, 2];
                            var legacyToEnvelope = [1, 1, 1, 1, 18, 19, 20];
                            var filterNames = ["none", "bright", "medium", "soft", "decay bright", "decay medium", "decay soft"];
                            if (beforeThree) {
                                var channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                                var instrument = this.channels[channel].instruments[0];
                                var legacyFilter = [1, 3, 4, 5][clamp(0, filterNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)])];
                                instrument.filterCutoff = legacyToCutoff[legacyFilter];
                                instrument.filterEnvelope = legacyToEnvelope[legacyFilter];
                                instrument.filterResonance = 0;
                            }
                            else if (beforeSix) {
                                for (var channel = 0; channel < this.getChannelCount(); channel++) {
                                    for (var i = 0; i < this.instrumentsPerChannel; i++) {
                                        var instrument = this.channels[channel].instruments[i];
                                        var legacyFilter = clamp(0, filterNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)] + 1);
                                        if (channel < this.pitchChannelCount) {
                                            instrument.filterCutoff = legacyToCutoff[legacyFilter];
                                            instrument.filterEnvelope = legacyToEnvelope[legacyFilter];
                                            instrument.filterResonance = 0;
                                        }
                                        else {
                                            instrument.filterCutoff = 10;
                                            instrument.filterEnvelope = 1;
                                            instrument.filterResonance = 0;
                                        }
                                    }
                                }
                            }
                            else {
                                var legacyFilter = clamp(0, filterNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                                var instrument = this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator];
                                instrument.filterCutoff = legacyToCutoff[legacyFilter];
                                instrument.filterEnvelope = legacyToEnvelope[legacyFilter];
                                instrument.filterResonance = 0;
                            }
                        }
                        else {
                            var instrument = this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator];
                            instrument.filterCutoff = clamp(0, SynthConfig_1.Config.filterCutoffRange, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                    }
                    break;
                case 121 /* filterResonance */:
                    {
                        this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].filterResonance = clamp(0, SynthConfig_1.Config.filterResonanceRange, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                    }
                    break;
                case 122 /* filterEnvelope */:
                    {
                        var instrument = this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator];
                        if (instrument.type == 4 /* drumset */) {
                            for (var i = 0; i < SynthConfig_1.Config.drumCount; i++) {
                                instrument.drumsetEnvelopes[i] = clamp(0, SynthConfig_1.Config.envelopes.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                            }
                        }
                        else {
                            instrument.filterEnvelope = clamp(0, SynthConfig_1.Config.envelopes.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                    }
                    break;
                case 87 /* pulseWidth */:
                    {
                        var instrument = this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator];
                        instrument.pulseWidth = clamp(0, SynthConfig_1.Config.pulseWidthRange, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        instrument.pulseEnvelope = clamp(0, SynthConfig_1.Config.envelopes.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                    }
                    break;
                case 100 /* transition */:
                    {
                        if (beforeThree) {
                            var channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                            this.channels[channel].instruments[0].transition = clamp(0, SynthConfig_1.Config.transitions.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                        else if (beforeSix) {
                            for (var channel = 0; channel < this.getChannelCount(); channel++) {
                                for (var i = 0; i < this.instrumentsPerChannel; i++) {
                                    this.channels[channel].instruments[i].transition = clamp(0, SynthConfig_1.Config.transitions.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                                }
                            }
                        }
                        else {
                            this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].transition = clamp(0, SynthConfig_1.Config.transitions.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                    }
                    break;
                case 99 /* vibrato */:
                    {
                        if (beforeThree) {
                            var legacyEffects = [0, 3, 2, 0];
                            var legacyEnvelopes = [1, 1, 1, 13];
                            var channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                            var effect = clamp(0, legacyEffects.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                            var instrument = this.channels[channel].instruments[0];
                            instrument.vibrato = legacyEffects[effect];
                            instrument.filterEnvelope = (instrument.filterEnvelope == 1)
                                ? legacyEnvelopes[effect]
                                : instrument.filterEnvelope;
                        }
                        else if (beforeSix) {
                            var legacyEffects = [0, 1, 2, 3, 0, 0];
                            var legacyEnvelopes = [1, 1, 1, 1, 16, 13];
                            for (var channel = 0; channel < this.getChannelCount(); channel++) {
                                for (var i = 0; i < this.instrumentsPerChannel; i++) {
                                    var effect = clamp(0, legacyEffects.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                                    var instrument = this.channels[channel].instruments[i];
                                    instrument.vibrato = legacyEffects[effect];
                                    instrument.filterEnvelope = (instrument.filterEnvelope == 1)
                                        ? legacyEnvelopes[effect]
                                        : instrument.filterEnvelope;
                                }
                            }
                        }
                        else if (beforeSeven) {
                            var legacyEffects = [0, 1, 2, 3, 0, 0];
                            var legacyEnvelopes = [1, 1, 1, 1, 16, 13];
                            var effect = clamp(0, legacyEffects.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                            var instrument = this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator];
                            instrument.vibrato = legacyEffects[effect];
                            instrument.filterEnvelope = (instrument.filterEnvelope == 1)
                                ? legacyEnvelopes[effect]
                                : instrument.filterEnvelope;
                        }
                        else {
                            var vibrato = clamp(0, SynthConfig_1.Config.vibratos.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                            this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].vibrato = vibrato;
                        }
                    }
                    break;
                case 104 /* interval */:
                    {
                        if (beforeThree) {
                            var channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                            this.channels[channel].instruments[0].interval = clamp(0, SynthConfig_1.Config.intervals.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                        else if (beforeSix) {
                            for (var channel = 0; channel < this.getChannelCount(); channel++) {
                                for (var i = 0; i < this.instrumentsPerChannel; i++) {
                                    var originalValue = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                                    var interval = clamp(0, SynthConfig_1.Config.intervals.length, originalValue);
                                    if (originalValue == 8) {
                                        // original "custom harmony" now maps to "hum" and "custom interval".
                                        interval = 2;
                                        this.channels[channel].instruments[i].chord = 3;
                                    }
                                    this.channels[channel].instruments[i].interval = interval;
                                }
                            }
                        }
                        else if (beforeSeven) {
                            var originalValue = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                            var interval = clamp(0, SynthConfig_1.Config.intervals.length, originalValue);
                            if (originalValue == 8) {
                                // original "custom harmony" now maps to "hum" and "custom interval".
                                interval = 2;
                                this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].chord = 3;
                            }
                            this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].interval = interval;
                        }
                        else {
                            this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].interval = clamp(0, SynthConfig_1.Config.intervals.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                    }
                    break;
                case 67 /* chord */:
                    {
                        this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].chord = clamp(0, SynthConfig_1.Config.chords.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                    }
                    break;
                case 113 /* effects */:
                    {
                        this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].effects = clamp(0, SynthConfig_1.Config.effectsNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                    }
                    break;
                case 118 /* volume */:
                    {
                        if (beforeThree) {
                            var channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                            var instrument = this.channels[channel].instruments[0];
                            instrument.volume = clamp(0, SynthConfig_1.Config.volumeRange, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                            // legacy mute value:
                            if (instrument.volume == 5)
                                instrument.volume = SynthConfig_1.Config.volumeRange - 1;
                        }
                        else if (beforeSix) {
                            for (var channel = 0; channel < this.getChannelCount(); channel++) {
                                for (var i = 0; i < this.instrumentsPerChannel; i++) {
                                    var instrument = this.channels[channel].instruments[i];
                                    instrument.volume = clamp(0, SynthConfig_1.Config.volumeRange, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                                    // legacy mute value:
                                    if (instrument.volume == 5)
                                        instrument.volume = SynthConfig_1.Config.volumeRange - 1;
                                }
                            }
                        }
                        else if (beforeSeven) {
                            var instrument = this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator];
                            instrument.volume = clamp(0, SynthConfig_1.Config.volumeRange, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                            // legacy mute value:
                            if (instrument.volume == 5)
                                instrument.volume = SynthConfig_1.Config.volumeRange - 1;
                        }
                        else {
                            var instrument = this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator];
                            instrument.volume = clamp(0, SynthConfig_1.Config.volumeRange, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                    }
                    break;
                case 76 /* pan */:
                    {
                        var instrument = this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator];
                        instrument.pan = clamp(0, SynthConfig_1.Config.panMax + 1, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                    }
                    break;
                case 65 /* algorithm */:
                    {
                        this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].algorithm = clamp(0, SynthConfig_1.Config.algorithms.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                    }
                    break;
                case 70 /* feedbackType */:
                    {
                        this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].feedbackType = clamp(0, SynthConfig_1.Config.feedbacks.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                    }
                    break;
                case 66 /* feedbackAmplitude */:
                    {
                        this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].feedbackAmplitude = clamp(0, SynthConfig_1.Config.operatorAmplitudeMax + 1, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                    }
                    break;
                case 86 /* feedbackEnvelope */:
                    {
                        this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].feedbackEnvelope = clamp(0, SynthConfig_1.Config.envelopes.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                    }
                    break;
                case 81 /* operatorFrequencies */:
                    {
                        for (var o = 0; o < SynthConfig_1.Config.operatorCount; o++) {
                            this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].operators[o].frequency = clamp(0, SynthConfig_1.Config.operatorFrequencies.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                    }
                    break;
                case 80 /* operatorAmplitudes */:
                    {
                        for (var o = 0; o < SynthConfig_1.Config.operatorCount; o++) {
                            this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].operators[o].amplitude = clamp(0, SynthConfig_1.Config.operatorAmplitudeMax + 1, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                    }
                    break;
                case 69 /* operatorEnvelopes */:
                    {
                        for (var o = 0; o < SynthConfig_1.Config.operatorCount; o++) {
                            this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].operators[o].envelope = clamp(0, SynthConfig_1.Config.envelopes.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                    }
                    break;
                case 83 /* spectrum */:
                    {
                        var instrument = this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator];
                        if (instrument.type == 3 /* spectrum */) {
                            var byteCount = Math.ceil(SynthConfig_1.Config.spectrumControlPoints * SynthConfig_1.Config.spectrumControlPointBits / 6);
                            var bits = new BitFieldReader(compressed, charIndex, charIndex + byteCount);
                            for (var i = 0; i < SynthConfig_1.Config.spectrumControlPoints; i++) {
                                instrument.spectrumWave.spectrum[i] = bits.read(SynthConfig_1.Config.spectrumControlPointBits);
                            }
                            instrument.spectrumWave.markCustomWaveDirty();
                            charIndex += byteCount;
                        }
                        else if (instrument.type == 4 /* drumset */) {
                            var byteCount = Math.ceil(SynthConfig_1.Config.drumCount * SynthConfig_1.Config.spectrumControlPoints * SynthConfig_1.Config.spectrumControlPointBits / 6);
                            var bits = new BitFieldReader(compressed, charIndex, charIndex + byteCount);
                            for (var j = 0; j < SynthConfig_1.Config.drumCount; j++) {
                                for (var i = 0; i < SynthConfig_1.Config.spectrumControlPoints; i++) {
                                    instrument.drumsetSpectrumWaves[j].spectrum[i] = bits.read(SynthConfig_1.Config.spectrumControlPointBits);
                                }
                                instrument.drumsetSpectrumWaves[j].markCustomWaveDirty();
                            }
                            charIndex += byteCount;
                        }
                        else {
                            throw new Error("Unhandled instrument type for spectrum song tag code.");
                        }
                    }
                    break;
                case 72 /* harmonics */:
                    {
                        var instrument = this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator];
                        var byteCount = Math.ceil(SynthConfig_1.Config.harmonicsControlPoints * SynthConfig_1.Config.harmonicsControlPointBits / 6);
                        var bits = new BitFieldReader(compressed, charIndex, charIndex + byteCount);
                        for (var i = 0; i < SynthConfig_1.Config.harmonicsControlPoints; i++) {
                            instrument.harmonicsWave.harmonics[i] = bits.read(SynthConfig_1.Config.harmonicsControlPointBits);
                        }
                        instrument.harmonicsWave.markCustomWaveDirty();
                        charIndex += byteCount;
                    }
                    break;
                case 98 /* bars */:
                    {
                        var subStringLength = void 0;
                        if (beforeThree) {
                            var channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                            var barCount = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                            subStringLength = Math.ceil(barCount * 0.5);
                            var bits = new BitFieldReader(compressed, charIndex, charIndex + subStringLength);
                            for (var i = 0; i < barCount; i++) {
                                this.channels[channel].bars[i] = bits.read(3) + 1;
                            }
                        }
                        else if (beforeFive) {
                            var neededBits = 0;
                            while ((1 << neededBits) < this.patternsPerChannel)
                                neededBits++;
                            subStringLength = Math.ceil(this.getChannelCount() * this.barCount * neededBits / 6);
                            var bits = new BitFieldReader(compressed, charIndex, charIndex + subStringLength);
                            for (var channel = 0; channel < this.getChannelCount(); channel++) {
                                for (var i = 0; i < this.barCount; i++) {
                                    this.channels[channel].bars[i] = bits.read(neededBits) + 1;
                                }
                            }
                        }
                        else {
                            var neededBits = 0;
                            while ((1 << neededBits) < this.patternsPerChannel + 1)
                                neededBits++;
                            subStringLength = Math.ceil(this.getChannelCount() * this.barCount * neededBits / 6);
                            var bits = new BitFieldReader(compressed, charIndex, charIndex + subStringLength);
                            for (var channel = 0; channel < this.getChannelCount(); channel++) {
                                for (var i = 0; i < this.barCount; i++) {
                                    this.channels[channel].bars[i] = bits.read(neededBits);
                                }
                            }
                        }
                        charIndex += subStringLength;
                    }
                    break;
                case 112 /* patterns */:
                    {
                        var bitStringLength = 0;
                        var channel = void 0;
                        if (beforeThree) {
                            channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                            // The old format used the next character to represent the number of patterns in the channel, which is usually eight, the default. 
                            charIndex++; //let patternCount: number = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                            bitStringLength = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                            bitStringLength = bitStringLength << 6;
                            bitStringLength += base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                        }
                        else {
                            channel = 0;
                            var bitStringLengthLength = validateRange(1, 4, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                            while (bitStringLengthLength > 0) {
                                bitStringLength = bitStringLength << 6;
                                bitStringLength += base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                                bitStringLengthLength--;
                            }
                        }
                        var bits = new BitFieldReader(compressed, charIndex, charIndex + bitStringLength);
                        charIndex += bitStringLength;
                        var neededInstrumentBits = 0;
                        while ((1 << neededInstrumentBits) < this.instrumentsPerChannel)
                            neededInstrumentBits++;
                        while (true) {
                            var isNoiseChannel = this.getChannelIsNoise(channel);
                            var octaveOffset = isNoiseChannel ? 0 : this.channels[channel].octave * 12;
                            var note = null = null;
                            var pin = null = null;
                            var lastPitch = (isNoiseChannel ? 4 : 12) + octaveOffset;
                            var recentPitches = isNoiseChannel ? [4, 6, 7, 2, 3, 8, 0, 10] : [12, 19, 24, 31, 36, 7, 0];
                            var recentShapes = [];
                            for (var i = 0; i < recentPitches.length; i++) {
                                recentPitches[i] += octaveOffset;
                            }
                            for (var i = 0; i < this.patternsPerChannel; i++) {
                                var newPattern = this.channels[channel].patterns[i];
                                newPattern.reset();
                                newPattern.instrument = bits.read(neededInstrumentBits);
                                if (!beforeThree && bits.read(1) == 0)
                                    continue;
                                var curPart = 0;
                                var newNotes = newPattern.notes;
                                while (curPart < this.beatsPerBar * SynthConfig_1.Config.partsPerBeat) {
                                    var useOldShape = bits.read(1) == 1;
                                    var newNote = false;
                                    var shapeIndex = 0;
                                    if (useOldShape) {
                                        shapeIndex = validateRange(0, recentShapes.length - 1, bits.readLongTail(0, 0));
                                    }
                                    else {
                                        newNote = bits.read(1) == 1;
                                    }
                                    if (!useOldShape && !newNote) {
                                        var restLength = beforeSeven
                                            ? bits.readLegacyPartDuration() * SynthConfig_1.Config.partsPerBeat / SynthConfig_1.Config.rhythms[this.rhythm].stepsPerBeat
                                            : bits.readPartDuration();
                                        curPart += restLength;
                                    }
                                    else {
                                        var shape = void 0;
                                        var pinObj = void 0;
                                        var pitch = void 0;
                                        if (useOldShape) {
                                            shape = recentShapes[shapeIndex];
                                            recentShapes.splice(shapeIndex, 1);
                                        }
                                        else {
                                            shape = {};
                                            shape.pitchCount = 1;
                                            while (shape.pitchCount < SynthConfig_1.Config.maxChordSize && bits.read(1) == 1)
                                                shape.pitchCount++;
                                            shape.pinCount = bits.readPinCount();
                                            shape.initialVolume = bits.read(2);
                                            shape.pins = [];
                                            shape.length = 0;
                                            shape.bendCount = 0;
                                            for (var j = 0; j < shape.pinCount; j++) {
                                                pinObj = {};
                                                pinObj.pitchBend = bits.read(1) == 1;
                                                if (pinObj.pitchBend)
                                                    shape.bendCount++;
                                                shape.length += beforeSeven
                                                    ? bits.readLegacyPartDuration() * SynthConfig_1.Config.partsPerBeat / SynthConfig_1.Config.rhythms[this.rhythm].stepsPerBeat
                                                    : bits.readPartDuration();
                                                pinObj.time = shape.length;
                                                pinObj.volume = bits.read(2);
                                                shape.pins.push(pinObj);
                                            }
                                        }
                                        recentShapes.unshift(shape);
                                        if (recentShapes.length > 10)
                                            recentShapes.pop();
                                        note = new Note(0, curPart, curPart + shape.length, shape.initialVolume);
                                        note.pitches = [];
                                        note.pins.length = 1;
                                        var pitchBends = [];
                                        for (var j = 0; j < shape.pitchCount + shape.bendCount; j++) {
                                            var useOldPitch = bits.read(1) == 1;
                                            if (!useOldPitch) {
                                                var interval = bits.readPitchInterval();
                                                pitch = lastPitch;
                                                var intervalIter = interval;
                                                while (intervalIter > 0) {
                                                    pitch++;
                                                    while (recentPitches.indexOf(pitch) != -1)
                                                        pitch++;
                                                    intervalIter--;
                                                }
                                                while (intervalIter < 0) {
                                                    pitch--;
                                                    while (recentPitches.indexOf(pitch) != -1)
                                                        pitch--;
                                                    intervalIter++;
                                                }
                                            }
                                            else {
                                                var pitchIndex = validateRange(0, recentPitches.length - 1, bits.read(3));
                                                pitch = recentPitches[pitchIndex];
                                                recentPitches.splice(pitchIndex, 1);
                                            }
                                            recentPitches.unshift(pitch);
                                            if (recentPitches.length > 8)
                                                recentPitches.pop();
                                            if (j < shape.pitchCount) {
                                                note.pitches.push(pitch);
                                            }
                                            else {
                                                pitchBends.push(pitch);
                                            }
                                            if (j == shape.pitchCount - 1) {
                                                lastPitch = note.pitches[0];
                                            }
                                            else {
                                                lastPitch = pitch;
                                            }
                                        }
                                        pitchBends.unshift(note.pitches[0]);
                                        for (var _b = 0, _c = shape.pins; _b < _c.length; _b++) {
                                            var pinObj_1 = _c[_b];
                                            if (pinObj_1.pitchBend)
                                                pitchBends.shift();
                                            pin = makeNotePin(pitchBends[0] - note.pitches[0], pinObj_1.time, pinObj_1.volume);
                                            note.pins.push(pin);
                                        }
                                        curPart = validateRange(0, this.beatsPerBar * SynthConfig_1.Config.partsPerBeat, note.end);
                                        newNotes.push(note);
                                    }
                                }
                            }
                            if (beforeThree) {
                                break;
                            }
                            else {
                                channel++;
                                if (channel >= this.getChannelCount())
                                    break;
                            }
                        } // while (true)
                    }
                    break;
                default:
                    {
                        throw new Error("Unrecognized song tag code " + String.fromCharCode(command) + " at index " + (charIndex - 1));
                    }
                    break;
            }
    };
    Song.prototype.toJsonObject = function (enableIntro, loopCount, enableOutro) {
        if (enableIntro === void 0) { enableIntro = true; }
        if (loopCount === void 0) { loopCount = 1; }
        if (enableOutro === void 0) { enableOutro = true; }
        var channelArray = [];
        for (var channel = 0; channel < this.getChannelCount(); channel++) {
            var instrumentArray = [];
            var isNoiseChannel = this.getChannelIsNoise(channel);
            for (var i = 0; i < this.instrumentsPerChannel; i++) {
                instrumentArray.push(this.channels[channel].instruments[i].toJsonObject());
            }
            var patternArray = [];
            for (var _i = 0, _a = this.channels[channel].patterns; _i < _a.length; _i++) {
                var pattern = _a[_i];
                var noteArray = [];
                for (var _b = 0, _c = pattern.notes; _b < _c.length; _b++) {
                    var note = _c[_b];
                    var pointArray = [];
                    for (var _d = 0, _e = note.pins; _d < _e.length; _d++) {
                        var pin = _e[_d];
                        pointArray.push({
                            "tick": (pin.time + note.start) * SynthConfig_1.Config.rhythms[this.rhythm].stepsPerBeat / SynthConfig_1.Config.partsPerBeat,
                            "pitchBend": pin.interval,
                            "volume": Math.round(pin.volume * 100 / 3)
                        });
                    }
                    noteArray.push({
                        "pitches": note.pitches,
                        "points": pointArray
                    });
                }
                patternArray.push({
                    "instrument": pattern.instrument + 1,
                    "notes": noteArray
                });
            }
            var sequenceArray = [];
            if (enableIntro)
                for (var i = 0; i < this.loopStart; i++) {
                    sequenceArray.push(this.channels[channel].bars[i]);
                }
            for (var l = 0; l < loopCount; l++)
                for (var i = this.loopStart; i < this.loopStart + this.loopLength; i++) {
                    sequenceArray.push(this.channels[channel].bars[i]);
                }
            if (enableOutro)
                for (var i = this.loopStart + this.loopLength; i < this.barCount; i++) {
                    sequenceArray.push(this.channels[channel].bars[i]);
                }
            channelArray.push({
                "type": isNoiseChannel ? "drum" : "pitch",
                "octaveScrollBar": this.channels[channel].octave,
                "instruments": instrumentArray,
                "patterns": patternArray,
                "sequence": sequenceArray
            });
        }
        return {
            "format": Song._format,
            "version": Song._latestVersion,
            "scale": SynthConfig_1.Config.scales[this.scale].name,
            "key": SynthConfig_1.Config.keys[this.key].name,
            "introBars": this.loopStart,
            "loopBars": this.loopLength,
            "beatsPerBar": this.beatsPerBar,
            "ticksPerBeat": SynthConfig_1.Config.rhythms[this.rhythm].stepsPerBeat,
            "beatsPerMinute": this.tempo,
            "reverb": this.reverb,
            //"outroBars": this.barCount - this.loopStart - this.loopLength; // derive this from bar arrays?
            //"patternCount": this.patternsPerChannel, // derive this from pattern arrays?
            //"instrumentsPerChannel": this.instrumentsPerChannel, //derive this from instrument arrays?
            "channels": channelArray
        };
    };
    Song.prototype.fromJsonObject = function (jsonObject) {
        this.initToDefault(true);
        if (!jsonObject)
            return;
        //const version: number = jsonObject["version"] | 0;
        //if (version > Song._latestVersion) return; // Go ahead and try to parse something from the future I guess? JSON is pretty easy-going!
        this.scale = 11; // default to expert.
        if (jsonObject["scale"] != undefined) {
            var oldScaleNames = {
                "romani :)": "dbl harmonic :)",
                "romani :(": "dbl harmonic :(",
                "enigma": "strange"
            };
            var scaleName = (oldScaleNames[jsonObject["scale"]] != undefined) ? oldScaleNames[jsonObject["scale"]] : jsonObject["scale"];
            var scale = SynthConfig_1.Config.scales.findIndex(function (scale) { return scale.name == scaleName; });
            if (scale != -1)
                this.scale = scale;
        }
        if (jsonObject["key"] != undefined) {
            if (typeof (jsonObject["key"]) == "number") {
                this.key = ((jsonObject["key"] + 1200) >>> 0) % SynthConfig_1.Config.keys.length;
            }
            else if (typeof (jsonObject["key"]) == "string") {
                var key = jsonObject["key"];
                var letter = key.charAt(0).toUpperCase();
                var symbol = key.charAt(1).toLowerCase();
                var letterMap = { "C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11 };
                var accidentalMap = { "#": 1, "♯": 1, "b": -1, "♭": -1 };
                var index = letterMap[letter];
                var offset = accidentalMap[symbol];
                if (index != undefined) {
                    if (offset != undefined)
                        index += offset;
                    if (index < 0)
                        index += 12;
                    index = index % 12;
                    this.key = index;
                }
            }
        }
        if (jsonObject["beatsPerMinute"] != undefined) {
            this.tempo = clamp(SynthConfig_1.Config.tempoMin, SynthConfig_1.Config.tempoMax + 1, jsonObject["beatsPerMinute"] | 0);
        }
        if (jsonObject["reverb"] != undefined) {
            this.reverb = clamp(0, SynthConfig_1.Config.reverbRange, jsonObject["reverb"] | 0);
        }
        if (jsonObject["beatsPerBar"] != undefined) {
            this.beatsPerBar = Math.max(SynthConfig_1.Config.beatsPerBarMin, Math.min(SynthConfig_1.Config.beatsPerBarMax, jsonObject["beatsPerBar"] | 0));
        }
        var importedPartsPerBeat = 4;
        if (jsonObject["ticksPerBeat"] != undefined) {
            importedPartsPerBeat = (jsonObject["ticksPerBeat"] | 0) || 4;
            this.rhythm = SynthConfig_1.Config.rhythms.findIndex(function (rhythm) { return rhythm.stepsPerBeat == importedPartsPerBeat; });
            if (this.rhythm == -1) {
                this.rhythm = 1;
            }
        }
        var maxInstruments = 1;
        var maxPatterns = 1;
        var maxBars = 1;
        if (jsonObject["channels"]) {
            for (var _i = 0, _a = jsonObject["channels"]; _i < _a.length; _i++) {
                var channelObject = _a[_i];
                if (channelObject["instruments"])
                    maxInstruments = Math.max(maxInstruments, channelObject["instruments"].length | 0);
                if (channelObject["patterns"])
                    maxPatterns = Math.max(maxPatterns, channelObject["patterns"].length | 0);
                if (channelObject["sequence"])
                    maxBars = Math.max(maxBars, channelObject["sequence"].length | 0);
            }
        }
        this.instrumentsPerChannel = Math.min(maxInstruments, SynthConfig_1.Config.instrumentsPerChannelMax);
        this.patternsPerChannel = Math.min(maxPatterns, SynthConfig_1.Config.barCountMax);
        this.barCount = Math.min(maxBars, SynthConfig_1.Config.barCountMax);
        if (jsonObject["introBars"] != undefined) {
            this.loopStart = clamp(0, this.barCount, jsonObject["introBars"] | 0);
        }
        if (jsonObject["loopBars"] != undefined) {
            this.loopLength = clamp(1, this.barCount - this.loopStart + 1, jsonObject["loopBars"] | 0);
        }
        var newPitchChannels = [];
        var newNoiseChannels = [];
        if (jsonObject["channels"]) {
            for (var channelIndex = 0; channelIndex < jsonObject["channels"].length; channelIndex++) {
                var channelObject = jsonObject["channels"][channelIndex];
                var channel = new Channel();
                var isNoiseChannel = false;
                if (channelObject["type"] != undefined) {
                    isNoiseChannel = (channelObject["type"] == "drum");
                }
                else {
                    // for older files, assume drums are channel 3.
                    isNoiseChannel = (channelIndex >= 3);
                }
                if (isNoiseChannel) {
                    newNoiseChannels.push(channel);
                }
                else {
                    newPitchChannels.push(channel);
                }
                if (channelObject["octaveScrollBar"] != undefined) {
                    channel.octave = clamp(0, SynthConfig_1.Config.scrollableOctaves + 1, channelObject["octaveScrollBar"] | 0);
                }
                for (var i = channel.instruments.length; i < this.instrumentsPerChannel; i++) {
                    channel.instruments[i] = new Instrument(isNoiseChannel);
                }
                channel.instruments.length = this.instrumentsPerChannel;
                for (var i = channel.patterns.length; i < this.patternsPerChannel; i++) {
                    channel.patterns[i] = new Pattern();
                }
                channel.patterns.length = this.patternsPerChannel;
                for (var i = 0; i < this.barCount; i++) {
                    channel.bars[i] = 1;
                }
                channel.bars.length = this.barCount;
                for (var i = 0; i < this.instrumentsPerChannel; i++) {
                    var instrument = channel.instruments[i];
                    instrument.fromJsonObject(channelObject["instruments"][i], isNoiseChannel);
                }
                for (var i = 0; i < this.patternsPerChannel; i++) {
                    var pattern = channel.patterns[i];
                    var patternObject = undefined;
                    if (channelObject["patterns"])
                        patternObject = channelObject["patterns"][i];
                    if (patternObject == undefined)
                        continue;
                    pattern.instrument = clamp(0, this.instrumentsPerChannel, (patternObject["instrument"] | 0) - 1);
                    if (patternObject["notes"] && patternObject["notes"].length > 0) {
                        var maxNoteCount = Math.min(this.beatsPerBar * SynthConfig_1.Config.partsPerBeat, patternObject["notes"].length >>> 0);
                        ///@TODO: Consider supporting notes specified in any timing order, sorting them and truncating as necessary. 
                        var tickClock = 0;
                        for (var j = 0; j < patternObject["notes"].length; j++) {
                            if (j >= maxNoteCount)
                                break;
                            var noteObject = patternObject["notes"][j];
                            if (!noteObject || !noteObject["pitches"] || !(noteObject["pitches"].length >= 1) || !noteObject["points"] || !(noteObject["points"].length >= 2)) {
                                continue;
                            }
                            var note = new Note(0, 0, 0, 0);
                            note.pitches = [];
                            note.pins = [];
                            for (var k = 0; k < noteObject["pitches"].length; k++) {
                                var pitch = noteObject["pitches"][k] | 0;
                                if (note.pitches.indexOf(pitch) != -1)
                                    continue;
                                note.pitches.push(pitch);
                                if (note.pitches.length >= SynthConfig_1.Config.maxChordSize)
                                    break;
                            }
                            if (note.pitches.length < 1)
                                continue;
                            var noteClock = tickClock;
                            var startInterval = 0;
                            for (var k = 0; k < noteObject["points"].length; k++) {
                                var pointObject = noteObject["points"][k];
                                if (pointObject == undefined || pointObject["tick"] == undefined)
                                    continue;
                                var interval = (pointObject["pitchBend"] == undefined) ? 0 : (pointObject["pitchBend"] | 0);
                                var time = Math.round((+pointObject["tick"]) * SynthConfig_1.Config.partsPerBeat / importedPartsPerBeat);
                                var volume_1 = (pointObject["volume"] == undefined) ? 3 : Math.max(0, Math.min(3, Math.round((pointObject["volume"] | 0) * 3 / 100)));
                                if (time > this.beatsPerBar * SynthConfig_1.Config.partsPerBeat)
                                    continue;
                                if (note.pins.length == 0) {
                                    if (time < noteClock)
                                        continue;
                                    note.start = time;
                                    startInterval = interval;
                                }
                                else {
                                    if (time <= noteClock)
                                        continue;
                                }
                                noteClock = time;
                                note.pins.push(makeNotePin(interval - startInterval, time - note.start, volume_1));
                            }
                            if (note.pins.length < 2)
                                continue;
                            note.end = note.pins[note.pins.length - 1].time + note.start;
                            var maxPitch = isNoiseChannel ? SynthConfig_1.Config.drumCount - 1 : SynthConfig_1.Config.maxPitch;
                            var lowestPitch = maxPitch;
                            var highestPitch = 0;
                            for (var k = 0; k < note.pitches.length; k++) {
                                note.pitches[k] += startInterval;
                                if (note.pitches[k] < 0 || note.pitches[k] > maxPitch) {
                                    note.pitches.splice(k, 1);
                                    k--;
                                }
                                if (note.pitches[k] < lowestPitch)
                                    lowestPitch = note.pitches[k];
                                if (note.pitches[k] > highestPitch)
                                    highestPitch = note.pitches[k];
                            }
                            if (note.pitches.length < 1)
                                continue;
                            for (var k = 0; k < note.pins.length; k++) {
                                var pin = note.pins[k];
                                if (pin.interval + lowestPitch < 0)
                                    pin.interval = -lowestPitch;
                                if (pin.interval + highestPitch > maxPitch)
                                    pin.interval = maxPitch - highestPitch;
                                if (k >= 2) {
                                    if (pin.interval == note.pins[k - 1].interval &&
                                        pin.interval == note.pins[k - 2].interval &&
                                        pin.volume == note.pins[k - 1].volume &&
                                        pin.volume == note.pins[k - 2].volume) {
                                        note.pins.splice(k - 1, 1);
                                        k--;
                                    }
                                }
                            }
                            pattern.notes.push(note);
                            tickClock = note.end;
                        }
                    }
                }
                for (var i = 0; i < this.barCount; i++) {
                    channel.bars[i] = channelObject["sequence"] ? Math.min(this.patternsPerChannel, channelObject["sequence"][i] >>> 0) : 0;
                }
            }
        }
        if (newPitchChannels.length > SynthConfig_1.Config.pitchChannelCountMax)
            newPitchChannels.length = SynthConfig_1.Config.pitchChannelCountMax;
        if (newNoiseChannels.length > SynthConfig_1.Config.noiseChannelCountMax)
            newNoiseChannels.length = SynthConfig_1.Config.noiseChannelCountMax;
        this.pitchChannelCount = newPitchChannels.length;
        this.noiseChannelCount = newNoiseChannels.length;
        this.channels.length = 0;
        Array.prototype.push.apply(this.channels, newPitchChannels);
        Array.prototype.push.apply(this.channels, newNoiseChannels);
    };
    Song.prototype.getPattern = ;
    Song.readonly = _format;
    Song.readonly = _oldestVersion;
    Song.readonly = _latestVersion;
    return Song;
})();
exports.Song = Song;
null;
{
    if (bar < 0 || bar >= this.barCount)
        return null;
    var patternIndex = this.channels[channel].bars[bar];
    if (patternIndex == 0)
        return null;
    return this.channels[channel].patterns[patternIndex - 1];
}
getPatternInstrument(channel, number, bar, number);
number;
{
    var pattern = null = this.getPattern(channel, bar);
    return pattern == null ? 0 : pattern.instrument;
}
getBeatsPerMinute();
number;
{
    return this.tempo;
}
var Tone = (function () {
    function Tone() {
        this.readonly = pitches;
        this.number = (_a = [0, 0, 0, 0], _a);
        this.pitchCount = 0;
        this.chordSize = 0;
        this.drumsetPitch = 0;
        this.note = null = null;
        this.prevNote = null = null;
        this.nextNote = null = null;
        this.prevNotePitchIndex = 0;
        this.nextNotePitchIndex = 0;
        this.active = false;
        this.noteStart = 0;
        this.noteEnd = 0;
        this.noteLengthTicks = 0;
        this.ticksSinceReleased = 0;
        this.liveInputSamplesHeld = 0;
        this.lastInterval = 0;
        this.lastVolume = 0;
        this.stereoVolume1 = 0.0;
        this.stereoVolume2 = 0.0;
        this.stereoOffset = 0.0;
        this.stereoDelay = 0.0;
        this.sample = 0.0;
        this.readonly = phases;
        this.number = (_b = [], _b);
        this.readonly = phaseDeltas;
        this.number = (_c = [], _c);
        this.readonly = volumeStarts;
        this.number = (_d = [], _d);
        this.readonly = volumeDeltas;
        this.number = (_e = [], _e);
        this.volumeStart = 0.0;
        this.volumeDelta = 0.0;
        this.phaseDeltaScale = 0.0;
        this.pulseWidth = 0.0;
        this.pulseWidthDelta = 0.0;
        this.filter = 0.0;
        this.filterScale = 0.0;
        this.filterSample0 = 0.0;
        this.filterSample1 = 0.0;
        this.vibratoScale = 0.0;
        this.intervalMult = 0.0;
        this.intervalVolumeMult = 1.0;
        this.feedbackOutputs = [];
        this.feedbackMult = 0.0;
        this.feedbackDelta = 0.0;
        this.reset();
        var _a, _b, _c, _d, _e;
    }
    Tone.prototype.reset = function () {
        for (var i = 0; i < SynthConfig_1.Config.operatorCount; i++) {
            this.phases[i] = 0.0;
            this.feedbackOutputs[i] = 0.0;
        }
        this.sample = 0.0;
        this.filterSample0 = 0.0;
        this.filterSample1 = 0.0;
        this.liveInputSamplesHeld = 0.0;
    };
    return Tone;
})();
var Synth = (function () {
    function Synth() {
        this.samplesPerSecond = 44100;
        this.song = null = null;
        this.liveInputDuration = 0;
        this.liveInputStarted = false;
        this.liveInputPitches = [];
        this.liveInputChannel = 0;
        this.loopRepeatCount = -1;
        this.volume = 1.0;
        this.playheadInternal = 0.0;
        this.bar = 0;
        this.beat = 0;
        this.part = 0;
        this.tick = 0;
        this.tickSampleCountdown = 0;
        this.isPlayingSong = false;
        this.liveInputEndTime = 0.0;
        this.readonly = tonePool;
    }
    Synth.warmUpSynthesizer = function (song) {
        if (song === void 0) { song = null; }
        // Don't bother to generate the drum waves unless the song actually
        // uses them, since they may require a lot of computation.
        if (song != null) {
            for (var j = 0; j < song.getChannelCount(); j++) {
                for (var i = 0; i < song.instrumentsPerChannel; i++) {
                    Synth.getInstrumentSynthFunction(song.channels[j].instruments[i]);
                    song.channels[j].instruments[i].warmUp();
                }
            }
        }
    };
    Synth.operatorAmplitudeCurve = function (amplitude) {
        return (Math.pow(16.0, amplitude / 15.0) - 1.0) / 15.0;
    };
    Synth.prototype.Deque = ;
    return Synth;
})();
exports.Synth = Synth;
new Deque_1.Deque();
readonly;
activeTones: Array < Deque_1.Deque < Tone >> ;
[];
readonly;
releasedTones: Array < Deque_1.Deque < Tone >> ;
[];
readonly;
liveInputTones: Deque_1.Deque < Tone > ;
new Deque_1.Deque();
limit: number = 0.0;
stereoBufferIndex: number = 0;
samplesForNone: Float32Array | null;
null;
samplesForReverb: Float32Array | null;
null;
samplesForChorus: Float32Array | null;
null;
samplesForChorusReverb: Float32Array | null;
null;
chorusDelayLine: Float32Array = new Float32Array(2048);
chorusDelayPos: number = 0;
chorusPhase: number = 0;
reverbDelayLine: Float32Array = new Float32Array(16384);
reverbDelayPos: number = 0;
reverbFeedback0: number = 0.0;
reverbFeedback1: number = 0.0;
reverbFeedback2: number = 0.0;
reverbFeedback3: number = 0.0;
audioCtx: any | null;
null;
scriptNode: any | null;
null;
get;
playing();
boolean;
{
    return this.isPlayingSong;
}
get;
playhead();
number;
{
    return this.playheadInternal;
}
set;
playhead(value, number);
{
    if (this.song != null) {
        this.playheadInternal = Math.max(0, Math.min(this.song.barCount, value));
        var remainder = this.playheadInternal;
        this.bar = Math.floor(remainder);
        remainder = this.song.beatsPerBar * (remainder - this.bar);
        this.beat = Math.floor(remainder);
        remainder = SynthConfig_1.Config.partsPerBeat * (remainder - this.beat);
        this.part = Math.floor(remainder);
        remainder = SynthConfig_1.Config.ticksPerPart * (remainder - this.part);
        this.tick = Math.floor(remainder);
        var samplesPerTick_1 = this.getSamplesPerTick();
        remainder = samplesPerTick_1 * (remainder - this.tick);
        this.tickSampleCountdown = samplesPerTick_1 - remainder;
    }
}
getSamplesPerBar();
number;
{
    if (this.song == null)
        throw new Error();
    return this.getSamplesPerTick() * SynthConfig_1.Config.ticksPerPart * SynthConfig_1.Config.partsPerBeat * this.song.beatsPerBar;
}
getTotalBars(enableIntro, boolean, enableOutro, boolean);
number;
{
    if (this.song == null)
        throw new Error();
    var bars = this.song.loopLength * (this.loopRepeatCount + 1);
    if (enableIntro)
        bars += this.song.loopStart;
    if (enableOutro)
        bars += this.song.barCount - (this.song.loopStart + this.song.loopLength);
    return bars;
}
constructor(song, Song | string | null, null);
{
    if (song != null)
        this.setSong(song);
}
setSong(song, Song | string);
void {
    if: function () { }, typeof: function (song) { } } == "string";
{
    this.song = new Song(song);
}
if (song instanceof Song) {
    this.song = song;
}
activateAudio();
void {
    if: function () { }, this: .audioCtx == null || this.scriptNode == null };
{
    this.audioCtx = this.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    this.samplesPerSecond = this.audioCtx.sampleRate;
    this.scriptNode = this.audioCtx.createScriptProcessor ? this.audioCtx.createScriptProcessor(2048, 0, 2) : this.audioCtx.createJavaScriptNode(2048, 0, 2); // 2048, 0 input channels, 2 output channels
    this.scriptNode.onaudioprocess = this.audioProcessCallback;
    this.scriptNode.channelCountMode = 'explicit';
    this.scriptNode.channelInterpretation = 'speakers';
    this.scriptNode.connect(this.audioCtx.destination);
}
this.audioCtx.resume();
deactivateAudio();
void {
    if: function () { }, this: .audioCtx != null && this.scriptNode != null };
{
    this.scriptNode.disconnect(this.audioCtx.destination);
    this.scriptNode = null;
    if (this.audioCtx.close)
        this.audioCtx.close(); // firefox is missing this function?
    this.audioCtx = null;
}
maintainLiveInput();
void {
    this: .activateAudio(),
    this: .liveInputEndTime = performance.now() + 10000.0
};
play();
void {
    if: function () { }, this: .isPlayingSong, return: ,
    this: .isPlayingSong = true,
    Synth: .warmUpSynthesizer(this.song),
    this: .activateAudio()
};
pause();
void {
    if: function () { } };
!this.isPlayingSong;
return;
this.isPlayingSong = false;
snapToStart();
void {
    this: .bar = 0,
    this: .snapToBar()
};
goToBar(bar, number);
void {
    this: .bar = bar,
    this: .playheadInternal = this.bar
};
snapToBar();
void {
    this: .playheadInternal = this.bar,
    this: .beat = 0,
    this: .part = 0,
    this: .tick = 0,
    this: .tickSampleCountdown = 0
};
resetEffects();
void {
    this: .reverbDelayPos = 0,
    this: .reverbFeedback0 = 0.0,
    this: .reverbFeedback1 = 0.0,
    this: .reverbFeedback2 = 0.0,
    this: .reverbFeedback3 = 0.0,
    //this.highpassInput = 0.0;
    //this.highpassOutput = 0.0;
    this: .freeAllTones(),
    for: function (let, number, i, i) {
        if (let === void 0) { let = i; }
        if (number === void 0) { number = 0; }
        if (i === void 0) { i = this.reverbDelayLine.length; }
        if (i === void 0) { i = ++; }
    }, this: .reverbDelayLine[i] = 0.0,
    for: function (let, number, i, i) {
        if (let === void 0) { let = i; }
        if (number === void 0) { number = 0; }
        if (i === void 0) { i = this.chorusDelayLine.length; }
        if (i === void 0) { i = ++; }
    }, this: .chorusDelayLine[i] = 0.0,
    if: function () { }, this: .samplesForNone != null, for: function (let, number, i, i) {
        if (let === void 0) { let = i; }
        if (number === void 0) { number = 0; }
        if (i === void 0) { i = this.samplesForNone.length; }
        if (i === void 0) { i = ++; }
    }, this: .samplesForNone[i] = 0.0,
    if: function () { }, this: .samplesForReverb != null, for: function (let, number, i, i) {
        if (let === void 0) { let = i; }
        if (number === void 0) { number = 0; }
        if (i === void 0) { i = this.samplesForReverb.length; }
        if (i === void 0) { i = ++; }
    }, this: .samplesForReverb[i] = 0.0,
    if: function () { }, this: .samplesForChorus != null, for: function (let, number, i, i) {
        if (let === void 0) { let = i; }
        if (number === void 0) { number = 0; }
        if (i === void 0) { i = this.samplesForChorus.length; }
        if (i === void 0) { i = ++; }
    }, this: .samplesForChorus[i] = 0.0,
    if: function () { }, this: .samplesForChorusReverb != null, for: function (let, number, i, i) {
        if (let === void 0) { let = i; }
        if (number === void 0) { number = 0; }
        if (i === void 0) { i = this.samplesForChorusReverb.length; }
        if (i === void 0) { i = ++; }
    }, this: .samplesForChorusReverb[i] = 0.0
};
jumpIntoLoop();
void {
    if: function () { } };
!this.song;
return;
if (this.bar < this.song.loopStart || this.bar >= this.song.loopStart + this.song.loopLength) {
    var oldBar_1 = this.bar;
    this.bar = this.song.loopStart;
    this.playheadInternal += this.bar - oldBar_1;
}
nextBar();
void {
    if: function () { } };
!this.song;
return;
var oldBar = this.bar;
this.bar++;
if (this.bar >= this.song.barCount) {
    this.bar = 0;
}
this.playheadInternal += this.bar - oldBar;
prevBar();
void {
    if: function () { } };
!this.song;
return;
var oldBar = this.bar;
this.bar--;
if (this.bar < 0 || this.bar >= this.song.barCount) {
    this.bar = this.song.barCount - 1;
}
this.playheadInternal += this.bar - oldBar;
audioProcessCallback = function (audioProcessingEvent) {
    var outputBuffer = audioProcessingEvent.outputBuffer;
    var outputDataL = outputBuffer.getChannelData(0);
    var outputDataR = outputBuffer.getChannelData(1);
    var isPlayingLiveTones = performance.now() < _this.liveInputEndTime;
    if (!isPlayingLiveTones && !_this.isPlayingSong) {
        for (var i = 0; i < outputBuffer.length; i++) {
            outputDataL[i] = 0.0;
            outputDataR[i] = 0.0;
        }
        _this.deactivateAudio();
    }
    else {
        _this.synthesize(outputDataL, outputDataR, outputBuffer.length, _this.isPlayingSong);
    }
};
synthesize(outputDataL, Float32Array, outputDataR, Float32Array, outputBufferLength, number, playSong, boolean = true);
void {
    if: function () { }, this: .song == null };
{
    for (var i = 0; i < outputBufferLength; i++) {
        outputDataL[i] = 0.0;
        outputDataR[i] = 0.0;
    }
    this.deactivateAudio();
    return;
}
var channelCount = this.song.getChannelCount();
for (var i = this.activeTones.length; i < channelCount; i++) {
    this.activeTones[i] = new Deque_1.Deque();
    this.releasedTones[i] = new Deque_1.Deque();
}
this.activeTones.length = channelCount;
this.releasedTones.length = channelCount;
var samplesPerTick = this.getSamplesPerTick();
var bufferIndex = 0;
var ended = false;
// Check the bounds of the playhead:
while (this.tickSampleCountdown <= 0)
    this.tickSampleCountdown += samplesPerTick;
if (this.tickSampleCountdown > samplesPerTick)
    this.tickSampleCountdown = samplesPerTick;
if (playSong) {
    if (this.beat >= this.song.beatsPerBar) {
        this.bar++;
        this.beat = 0;
        this.part = 0;
        this.tick = 0;
        this.tickSampleCountdown = samplesPerTick;
        if (this.loopRepeatCount != 0 && this.bar == this.song.loopStart + this.song.loopLength) {
            this.bar = this.song.loopStart;
            if (this.loopRepeatCount > 0)
                this.loopRepeatCount--;
        }
    }
    if (this.bar >= this.song.barCount) {
        this.bar = 0;
        if (this.loopRepeatCount != -1) {
            ended = true;
            this.pause();
        }
    }
}
//const synthStartTime: number = performance.now();
var stereoBufferLength = outputBufferLength * 4;
if (this.samplesForNone == null || this.samplesForNone.length != stereoBufferLength ||
    this.samplesForReverb == null || this.samplesForReverb.length != stereoBufferLength ||
    this.samplesForChorus == null || this.samplesForChorus.length != stereoBufferLength ||
    this.samplesForChorusReverb == null || this.samplesForChorusReverb.length != stereoBufferLength) {
    this.samplesForNone = new Float32Array(stereoBufferLength);
    this.samplesForReverb = new Float32Array(stereoBufferLength);
    this.samplesForChorus = new Float32Array(stereoBufferLength);
    this.samplesForChorusReverb = new Float32Array(stereoBufferLength);
    this.stereoBufferIndex = 0;
}
var stereoBufferIndex = this.stereoBufferIndex;
var samplesForNone = this.samplesForNone;
var samplesForReverb = this.samplesForReverb;
var samplesForChorus = this.samplesForChorus;
var samplesForChorusReverb = this.samplesForChorusReverb;
// Post processing parameters:
var volume = +this.volume;
var chorusDelayLine = this.chorusDelayLine;
var reverbDelayLine = this.reverbDelayLine;
var chorusDuration = 2.0;
var chorusAngle = Math.PI * 2.0 / (chorusDuration * this.samplesPerSecond);
var chorusRange = 150 * this.samplesPerSecond / 44100;
var chorusOffset0 = 0x800 - 1.51 * chorusRange;
var chorusOffset1 = 0x800 - 2.10 * chorusRange;
var chorusOffset2 = 0x800 - 3.35 * chorusRange;
var chorusOffset3 = 0x800 - 1.47 * chorusRange;
var chorusOffset4 = 0x800 - 2.15 * chorusRange;
var chorusOffset5 = 0x800 - 3.25 * chorusRange;
var chorusPhase = this.chorusPhase % (Math.PI * 2.0);
var chorusDelayPos = this.chorusDelayPos & 0x7FF;
var reverbDelayPos = this.reverbDelayPos & 0x3FFF;
var reverbFeedback0 = +this.reverbFeedback0;
var reverbFeedback1 = +this.reverbFeedback1;
var reverbFeedback2 = +this.reverbFeedback2;
var reverbFeedback3 = +this.reverbFeedback3;
var reverb = Math.pow(this.song.reverb / SynthConfig_1.Config.reverbRange, 0.667) * 0.425;
//const highpassFilter: number = Math.pow(0.5, 400 / this.samplesPerSecond);
var limitDecay = 1.0 - Math.pow(0.5, 4.0 / this.samplesPerSecond);
var limitRise = 1.0 - Math.pow(0.5, 4000.0 / this.samplesPerSecond);
//let highpassInput: number = +this.highpassInput;
//let highpassOutput: number = +this.highpassOutput;
var limit = +this.limit;
while (bufferIndex < outputBufferLength && !ended) {
    var samplesLeftInBuffer = outputBufferLength - bufferIndex;
    var runLength = Math.min(Math.ceil(this.tickSampleCountdown), samplesLeftInBuffer);
    for (var channel = 0; channel < this.song.getChannelCount(); channel++) {
        if (channel == this.liveInputChannel) {
            this.determineLiveInputTones(this.song);
            for (var i = 0; i < this.liveInputTones.count(); i++) {
                var tone = this.liveInputTones.get(i);
                this.playTone(this.song, stereoBufferIndex, stereoBufferLength, channel, samplesPerTick, runLength, tone, false, false);
            }
        }
        this.determineCurrentActiveTones(this.song, channel, playSong);
        for (var i = 0; i < this.activeTones[channel].count(); i++) {
            var tone = this.activeTones[channel].get(i);
            this.playTone(this.song, stereoBufferIndex, stereoBufferLength, channel, samplesPerTick, runLength, tone, false, false);
        }
        for (var i = 0; i < this.releasedTones[channel].count(); i++) {
            var tone = this.releasedTones[channel].get(i);
            if (tone.ticksSinceReleased >= tone.instrument.getTransition().releaseTicks) {
                this.freeReleasedTone(channel, i);
                i--;
                continue;
            }
            var shouldFadeOutFast = (i + this.activeTones[channel].count() >= SynthConfig_1.Config.maximumTonesPerChannel);
            this.playTone(this.song, stereoBufferIndex, stereoBufferLength, channel, samplesPerTick, runLength, tone, true, shouldFadeOutFast);
        }
    }
    // Post processing:
    var chorusTap0Index = chorusDelayPos + chorusOffset0 - chorusRange * Math.sin(chorusPhase + 0);
    var chorusTap1Index = chorusDelayPos + chorusOffset1 - chorusRange * Math.sin(chorusPhase + 2.1);
    var chorusTap2Index = chorusDelayPos + chorusOffset2 - chorusRange * Math.sin(chorusPhase + 4.2);
    var chorusTap3Index = chorusDelayPos + 0x400 + chorusOffset3 - chorusRange * Math.sin(chorusPhase + 3.2);
    var chorusTap4Index = chorusDelayPos + 0x400 + chorusOffset4 - chorusRange * Math.sin(chorusPhase + 5.3);
    var chorusTap5Index = chorusDelayPos + 0x400 + chorusOffset5 - chorusRange * Math.sin(chorusPhase + 1.0);
    chorusPhase += chorusAngle * runLength;
    var chorusTap0End = chorusDelayPos + runLength + chorusOffset0 - chorusRange * Math.sin(chorusPhase + 0);
    var chorusTap1End = chorusDelayPos + runLength + chorusOffset1 - chorusRange * Math.sin(chorusPhase + 2.1);
    var chorusTap2End = chorusDelayPos + runLength + chorusOffset2 - chorusRange * Math.sin(chorusPhase + 4.2);
    var chorusTap3End = chorusDelayPos + runLength + 0x400 + chorusOffset3 - chorusRange * Math.sin(chorusPhase + 3.2);
    var chorusTap4End = chorusDelayPos + runLength + 0x400 + chorusOffset4 - chorusRange * Math.sin(chorusPhase + 5.3);
    var chorusTap5End = chorusDelayPos + runLength + 0x400 + chorusOffset5 - chorusRange * Math.sin(chorusPhase + 1.0);
    var chorusTap0Delta = (chorusTap0End - chorusTap0Index) / runLength;
    var chorusTap1Delta = (chorusTap1End - chorusTap1Index) / runLength;
    var chorusTap2Delta = (chorusTap2End - chorusTap2Index) / runLength;
    var chorusTap3Delta = (chorusTap3End - chorusTap3Index) / runLength;
    var chorusTap4Delta = (chorusTap4End - chorusTap4Index) / runLength;
    var chorusTap5Delta = (chorusTap5End - chorusTap5Index) / runLength;
    var runEnd = bufferIndex + runLength;
    for (var i = bufferIndex; i < runEnd; i++) {
        var bufferIndexL = stereoBufferIndex;
        var bufferIndexR = stereoBufferIndex + 1;
        var sampleForNoneL = samplesForNone[bufferIndexL];
        samplesForNone[bufferIndexL] = 0.0;
        var sampleForNoneR = samplesForNone[bufferIndexR];
        samplesForNone[bufferIndexR] = 0.0;
        var sampleForReverbL = samplesForReverb[bufferIndexL];
        samplesForReverb[bufferIndexL] = 0.0;
        var sampleForReverbR = samplesForReverb[bufferIndexR];
        samplesForReverb[bufferIndexR] = 0.0;
        var sampleForChorusL = samplesForChorus[bufferIndexL];
        samplesForChorus[bufferIndexL] = 0.0;
        var sampleForChorusR = samplesForChorus[bufferIndexR];
        samplesForChorus[bufferIndexR] = 0.0;
        var sampleForChorusReverbL = samplesForChorusReverb[bufferIndexL];
        samplesForChorusReverb[bufferIndexL] = 0.0;
        var sampleForChorusReverbR = samplesForChorusReverb[bufferIndexR];
        samplesForChorusReverb[bufferIndexR] = 0.0;
        stereoBufferIndex += 2;
        var combinedChorusL = sampleForChorusL + sampleForChorusReverbL;
        var combinedChorusR = sampleForChorusR + sampleForChorusReverbR;
        var chorusTap0Ratio = chorusTap0Index % 1;
        var chorusTap1Ratio = chorusTap1Index % 1;
        var chorusTap2Ratio = chorusTap2Index % 1;
        var chorusTap3Ratio = chorusTap3Index % 1;
        var chorusTap4Ratio = chorusTap4Index % 1;
        var chorusTap5Ratio = chorusTap5Index % 1;
        var chorusTap0A = chorusDelayLine[(chorusTap0Index) & 0x7FF];
        var chorusTap0B = chorusDelayLine[(chorusTap0Index + 1) & 0x7FF];
        var chorusTap1A = chorusDelayLine[(chorusTap1Index) & 0x7FF];
        var chorusTap1B = chorusDelayLine[(chorusTap1Index + 1) & 0x7FF];
        var chorusTap2A = chorusDelayLine[(chorusTap2Index) & 0x7FF];
        var chorusTap2B = chorusDelayLine[(chorusTap2Index + 1) & 0x7FF];
        var chorusTap3A = chorusDelayLine[(chorusTap3Index) & 0x7FF];
        var chorusTap3B = chorusDelayLine[(chorusTap3Index + 1) & 0x7FF];
        var chorusTap4A = chorusDelayLine[(chorusTap4Index) & 0x7FF];
        var chorusTap4B = chorusDelayLine[(chorusTap4Index + 1) & 0x7FF];
        var chorusTap5A = chorusDelayLine[(chorusTap5Index) & 0x7FF];
        var chorusTap5B = chorusDelayLine[(chorusTap5Index + 1) & 0x7FF];
        var chorusTap0 = chorusTap0A + (chorusTap0B - chorusTap0A) * chorusTap0Ratio;
        var chorusTap1 = chorusTap1A + (chorusTap1B - chorusTap1A) * chorusTap1Ratio;
        var chorusTap2 = chorusTap2A + (chorusTap2B - chorusTap2A) * chorusTap2Ratio;
        var chorusTap3 = chorusTap3A + (chorusTap3B - chorusTap3A) * chorusTap3Ratio;
        var chorusTap4 = chorusTap4A + (chorusTap4B - chorusTap4A) * chorusTap4Ratio;
        var chorusTap5 = chorusTap5A + (chorusTap5B - chorusTap5A) * chorusTap5Ratio;
        var chorusSampleL = 0.5 * (combinedChorusL - chorusTap0 + chorusTap1 - chorusTap2);
        var chorusSampleR = 0.5 * (combinedChorusR - chorusTap3 + chorusTap4 - chorusTap5);
        chorusDelayLine[chorusDelayPos] = combinedChorusL;
        chorusDelayLine[(chorusDelayPos + 0x400) & 0x7FF] = combinedChorusR;
        chorusDelayPos = (chorusDelayPos + 1) & 0x7FF;
        chorusTap0Index += chorusTap0Delta;
        chorusTap1Index += chorusTap1Delta;
        chorusTap2Index += chorusTap2Delta;
        chorusTap3Index += chorusTap3Delta;
        chorusTap4Index += chorusTap4Delta;
        chorusTap5Index += chorusTap5Delta;
        // Reverb, implemented using a feedback delay network with a Hadamard matrix and lowpass filters.
        // good ratios:    0.555235 + 0.618033 + 0.818 +   1.0 = 2.991268
        // Delay lengths:  3041     + 3385     + 4481  +  5477 = 16384 = 2^14
        // Buffer offsets: 3041    -> 6426   -> 10907 -> 16384
        var reverbDelayPos1 = (reverbDelayPos + 3041) & 0x3FFF;
        var reverbDelayPos2 = (reverbDelayPos + 6426) & 0x3FFF;
        var reverbDelayPos3 = (reverbDelayPos + 10907) & 0x3FFF;
        var reverbSample0 = (reverbDelayLine[reverbDelayPos]);
        var reverbSample1 = reverbDelayLine[reverbDelayPos1];
        var reverbSample2 = reverbDelayLine[reverbDelayPos2];
        var reverbSample3 = reverbDelayLine[reverbDelayPos3];
        var reverbTemp0 = -(reverbSample0 + sampleForChorusReverbL + sampleForReverbL) + reverbSample1;
        var reverbTemp1 = -(reverbSample0 + sampleForChorusReverbR + sampleForReverbR) - reverbSample1;
        var reverbTemp2 = -reverbSample2 + reverbSample3;
        var reverbTemp3 = -reverbSample2 - reverbSample3;
        reverbFeedback0 += ((reverbTemp0 + reverbTemp2) * reverb - reverbFeedback0) * 0.5;
        reverbFeedback1 += ((reverbTemp1 + reverbTemp3) * reverb - reverbFeedback1) * 0.5;
        reverbFeedback2 += ((reverbTemp0 - reverbTemp2) * reverb - reverbFeedback2) * 0.5;
        reverbFeedback3 += ((reverbTemp1 - reverbTemp3) * reverb - reverbFeedback3) * 0.5;
        reverbDelayLine[reverbDelayPos1] = reverbFeedback0;
        reverbDelayLine[reverbDelayPos2] = reverbFeedback1;
        reverbDelayLine[reverbDelayPos3] = reverbFeedback2;
        reverbDelayLine[reverbDelayPos] = reverbFeedback3;
        reverbDelayPos = (reverbDelayPos + 1) & 0x3FFF;
        var sampleL = sampleForNoneL + chorusSampleL + sampleForReverbL + reverbSample1 + reverbSample2 + reverbSample3;
        var sampleR = sampleForNoneR + chorusSampleR + sampleForReverbR + reverbSample0 + reverbSample2 - reverbSample3;
        /*
        highpassOutput = highpassOutput * highpassFilter + sample - highpassInput;
        highpassInput = sample;
        // use highpassOutput instead of sample below?
        */
        // A compressor/limiter.
        var absL = sampleL < 0.0 ? -sampleL : sampleL;
        var absR = sampleR < 0.0 ? -sampleR : sampleR;
        var abs = absL > absR ? absL : absR;
        limit += (abs - limit) * (limit < abs ? limitRise : limitDecay);
        var limitedVolume = volume / (limit >= 1 ? limit * 1.05 : limit * 0.8 + 0.25);
        outputDataL[i] = sampleL * limitedVolume;
        outputDataR[i] = sampleR * limitedVolume;
    }
    bufferIndex += runLength;
    this.tickSampleCountdown -= runLength;
    if (this.tickSampleCountdown <= 0) {
        // Track how long tones have been released, and free them if there are too many.
        for (var channel = 0; channel < this.song.getChannelCount(); channel++) {
            for (var i = 0; i < this.releasedTones[channel].count(); i++) {
                var tone = this.releasedTones[channel].get(i);
                tone.ticksSinceReleased++;
                var shouldFadeOutFast = (i + this.activeTones[channel].count() >= SynthConfig_1.Config.maximumTonesPerChannel);
                if (shouldFadeOutFast) {
                    this.freeReleasedTone(channel, i);
                    i--;
                }
            }
        }
        this.tick++;
        this.tickSampleCountdown += samplesPerTick;
        if (this.tick == SynthConfig_1.Config.ticksPerPart) {
            this.tick = 0;
            this.part++;
            this.liveInputDuration--;
            // Check if any active tones should be released.
            for (var channel = 0; channel < this.song.getChannelCount(); channel++) {
                for (var i = 0; i < this.activeTones[channel].count(); i++) {
                    var tone = this.activeTones[channel].get(i);
                    var transition = tone.instrument.getTransition();
                    if (!transition.isSeamless && tone.note != null && tone.note.end == this.part + this.beat * SynthConfig_1.Config.partsPerBeat) {
                        if (transition.releases) {
                            this.releaseTone(channel, tone);
                        }
                        else {
                            this.freeTone(tone);
                        }
                        this.activeTones[channel].remove(i);
                        i--;
                    }
                }
            }
            if (this.part == SynthConfig_1.Config.partsPerBeat) {
                this.part = 0;
                if (playSong) {
                    this.beat++;
                    if (this.beat == this.song.beatsPerBar) {
                        // bar changed, reset for next bar:
                        this.beat = 0;
                        this.bar++;
                        if (this.loopRepeatCount != 0 && this.bar == this.song.loopStart + this.song.loopLength) {
                            this.bar = this.song.loopStart;
                            if (this.loopRepeatCount > 0)
                                this.loopRepeatCount--;
                        }
                        if (this.bar >= this.song.barCount) {
                            this.bar = 0;
                            if (this.loopRepeatCount != -1) {
                                ended = true;
                                this.resetEffects();
                                this.pause();
                            }
                        }
                    }
                }
            }
        }
    }
}
// Optimization: Avoid persistent reverb values in the float denormal range.
var epsilon = (1.0e-24);
if (-epsilon < reverbFeedback0 && reverbFeedback0 < epsilon)
    reverbFeedback0 = 0.0;
if (-epsilon < reverbFeedback1 && reverbFeedback1 < epsilon)
    reverbFeedback1 = 0.0;
if (-epsilon < reverbFeedback2 && reverbFeedback2 < epsilon)
    reverbFeedback2 = 0.0;
if (-epsilon < reverbFeedback3 && reverbFeedback3 < epsilon)
    reverbFeedback3 = 0.0;
//if (-epsilon < highpassInput && highpassInput < epsilon) highpassInput = 0.0;
//if (-epsilon < highpassOutput && highpassOutput < epsilon) highpassOutput = 0.0;
if (-epsilon < limit && limit < epsilon)
    limit = 0.0;
this.stereoBufferIndex = (this.stereoBufferIndex + outputBufferLength * 2) % stereoBufferLength;
this.chorusPhase = chorusPhase;
this.chorusDelayPos = chorusDelayPos;
this.reverbDelayPos = reverbDelayPos;
this.reverbFeedback0 = reverbFeedback0;
this.reverbFeedback1 = reverbFeedback1;
this.reverbFeedback2 = reverbFeedback2;
this.reverbFeedback3 = reverbFeedback3;
//this.highpassInput = highpassInput;
//this.highpassOutput = highpassOutput;
this.limit = limit;
if (playSong) {
    this.playheadInternal = (((this.tick + 1.0 - this.tickSampleCountdown / samplesPerTick) / 2.0 + this.part) / SynthConfig_1.Config.partsPerBeat + this.beat) / this.song.beatsPerBar + this.bar;
}
freeTone(tone, Tone);
void {
    this: .tonePool.pushBack(tone)
};
newTone();
Tone;
{
    if (this.tonePool.count() > 0) {
        var tone = this.tonePool.popBack();
        tone.reset();
        tone.active = false;
        return tone;
    }
    return new Tone();
}
releaseTone(channel, number, tone, Tone);
void {
    this: .releasedTones[channel].pushFront(tone)
};
freeReleasedTone(channel, number, toneIndex, number);
void {
    this: .freeTone(this.releasedTones[channel].get(toneIndex)),
    this: .releasedTones[channel].remove(toneIndex)
};
freeAllTones();
void {
    while: function () { }, this: .liveInputTones.count() > 0 };
{
    this.freeTone(this.liveInputTones.popBack());
}
for (var i = 0; i < this.activeTones.length; i++) {
    while (this.activeTones[i].count() > 0) {
        this.freeTone(this.activeTones[i].popBack());
    }
}
for (var i = 0; i < this.releasedTones.length; i++) {
    while (this.releasedTones[i].count() > 0) {
        this.freeTone(this.releasedTones[i].popBack());
    }
}
determineLiveInputTones(song, Song);
void {
    const: toneList, Deque: function () { }, this: .liveInputTones,
    const: pitches, number: (_a = this.liveInputPitches, _a),
    let: toneCount, number:  = 0,
    if: function () { }, this: .liveInputDuration > 0 };
{
    var instrument = song.channels[this.liveInputChannel].instruments[song.getPatternInstrument(this.liveInputChannel, this.bar)];
    if (instrument.getChord().arpeggiates) {
        var tone;
        if (toneList.count() == 0) {
            tone = this.newTone();
            toneList.pushBack(tone);
        }
        else if (!instrument.getTransition().isSeamless && this.liveInputStarted) {
            this.releaseTone(this.liveInputChannel, toneList.popFront());
            tone = this.newTone();
            toneList.pushBack(tone);
        }
        else {
            tone = toneList.get(0);
        }
        toneCount = 1;
        for (var i = 0; i < pitches.length; i++) {
            tone.pitches[i] = pitches[i];
        }
        tone.pitchCount = pitches.length;
        tone.chordSize = 1;
        tone.instrument = instrument;
        tone.note = tone.prevNote = tone.nextNote = null;
    }
    else {
        //const transition: Transition = instrument.getTransition();
        for (var i = 0; i < pitches.length; i++) {
            //const strumOffsetParts: number = i * instrument.getChord().strumParts;
            var tone = void 0;
            if (toneList.count() <= i) {
                tone = this.newTone();
                toneList.pushBack(tone);
            }
            else if (!instrument.getTransition().isSeamless && this.liveInputStarted) {
                this.releaseTone(this.liveInputChannel, toneList.get(i));
                tone = this.newTone();
                toneList.set(i, tone);
            }
            else {
                tone = toneList.get(i);
            }
            toneCount++;
            tone.pitches[0] = pitches[i];
            tone.pitchCount = 1;
            tone.chordSize = pitches.length;
            tone.instrument = instrument;
            tone.note = tone.prevNote = tone.nextNote = null;
        }
    }
}
while (toneList.count() > toneCount) {
    this.releaseTone(this.liveInputChannel, toneList.popBack());
}
this.liveInputStarted = false;
determineCurrentActiveTones(song, Song, channel, number, playSong, boolean);
void {
    const: instrument, Instrument:  = song.channels[channel].instruments[song.getPatternInstrument(channel, this.bar)],
    const: pattern, Pattern:  | null, song: .getPattern(channel, this.bar),
    const: time, number:  = this.part + this.beat * SynthConfig_1.Config.partsPerBeat,
    let: note, Note:  | null, null: ,
    let: prevNote, Note:  | null, null: ,
    let: nextNote, Note:  | null, null: ,
    if: function (playSong) {
        if (playSong === void 0) { playSong =  && pattern != null && !song.channels[channel].muted; }
        for (var i = 0; i < pattern.notes.length; i++) {
            if (pattern.notes[i].end <= time) {
                prevNote = pattern.notes[i];
            }
            else if (pattern.notes[i].start <= time && pattern.notes[i].end > time) {
                note = pattern.notes[i];
            }
            else if (pattern.notes[i].start > time) {
                nextNote = pattern.notes[i];
                break;
            }
        }
    },
    const: toneList, Deque: function () { }, this: .activeTones[channel],
    if: function (note) {
        if (note === void 0) { note =  != null; }
        if (prevNote != null && prevNote.end != note.start)
            prevNote = null;
        if (nextNote != null && nextNote.start != note.end)
            nextNote = null;
        this.syncTones(channel, toneList, instrument, note.pitches, note, prevNote, nextNote, time);
    }, else: {
        while: function (toneList, count) {
            if (count === void 0) { count = () > 0; }
            // Automatically free or release seamless tones if there's no new note to take over.
            if (toneList.peakBack().instrument.getTransition().releases) {
                this.releaseTone(channel, toneList.popBack());
            }
            else {
                this.freeTone(toneList.popBack());
            }
        }
    }
};
syncTones(channel, number, toneList, Deque_1.Deque < Tone > , instrument, Instrument, pitches, number[], note, Note, prevNote, Note | null, nextNote, Note | null, currentPart, number);
void {
    let: toneCount, number:  = 0,
    if: function (instrument, getChord) {
        if (getChord === void 0) { getChord = ().arpeggiates; }
        var tone;
        if (toneList.count() == 0) {
            tone = this.newTone();
            toneList.pushBack(tone);
        }
        else {
            tone = toneList.get(0);
        }
        toneCount = 1;
        for (var i = 0; i < pitches.length; i++) {
            tone.pitches[i] = pitches[i];
        }
        tone.pitchCount = pitches.length;
        tone.chordSize = 1;
        tone.instrument = instrument;
        tone.note = note;
        tone.noteStart = note.start;
        tone.noteEnd = note.end;
        tone.prevNote = prevNote;
        tone.nextNote = nextNote;
        tone.prevNotePitchIndex = 0;
        tone.nextNotePitchIndex = 0;
    }, else: {
        const: transition, Transition:  = instrument.getTransition(),
        for: function (let, number, i, i) {
            if (let === void 0) { let = i; }
            if (number === void 0) { number = 0; }
            if (i === void 0) { i = ; }
            if (i === void 0) { i = ++; }
            var strumOffsetParts = i * instrument.getChord().strumParts;
            var prevNoteForThisTone = null = (prevNote && prevNote.pitches.length > i) ? prevNote : null;
            var noteForThisTone = note;
            var nextNoteForThisTone = null = (nextNote && nextNote.pitches.length > i) ? nextNote : null;
            var noteStart = noteForThisTone.start + strumOffsetParts;
            if (noteStart > currentPart) {
                if (toneList.count() > i && transition.isSeamless && prevNoteForThisTone != null) {
                    nextNoteForThisTone = noteForThisTone;
                    noteForThisTone = prevNoteForThisTone;
                    prevNoteForThisTone = null;
                    noteStart = noteForThisTone.start + strumOffsetParts;
                }
                else {
                    break;
                }
            }
            var noteEnd = noteForThisTone.end;
            if (transition.isSeamless && nextNoteForThisTone != null) {
                noteEnd = Math.min(SynthConfig_1.Config.partsPerBeat * this.song, !.beatsPerBar, noteEnd + strumOffsetParts);
            }
            var tone;
            if (toneList.count() <= i) {
                tone = this.newTone();
                toneList.pushBack(tone);
            }
            else {
                tone = toneList.get(i);
            }
            toneCount++;
            tone.pitches[0] = noteForThisTone.pitches[i];
            tone.pitchCount = 1;
            tone.chordSize = noteForThisTone.pitches.length;
            tone.instrument = instrument;
            tone.note = noteForThisTone;
            tone.noteStart = noteStart;
            tone.noteEnd = noteEnd;
            tone.prevNote = prevNoteForThisTone;
            tone.nextNote = nextNoteForThisTone;
            tone.prevNotePitchIndex = i;
            tone.nextNotePitchIndex = i;
        }
    },
    while: function (toneList, count) {
        if (count === void 0) { count = () > toneCount; }
        // Automatically free or release seamless tones if there's no new note to take over.
        if (toneList.peakBack().instrument.getTransition().releases) {
            this.releaseTone(channel, toneList.popBack());
        }
        else {
            this.freeTone(toneList.popBack());
        }
    }
};
playTone(song, Song, stereoBufferIndex, number, stereoBufferLength, number, channel, number, samplesPerTick, number, runLength, number, tone, Tone, released, boolean, shouldFadeOutFast, boolean);
void {
    Synth: .computeTone(this, song, channel, samplesPerTick, runLength, tone, released, shouldFadeOutFast),
    let: synthBuffer, Float32Array: ,
    switch: function (tone, instrument, effects) { },
    case: 0, synthBuffer:  = this.samplesForNone };
!;
break;
1;
synthBuffer = this.samplesForReverb;
!;
break;
2;
synthBuffer = this.samplesForChorus;
!;
break;
3;
synthBuffer = this.samplesForChorusReverb;
!;
break;
throw new Error();
var synthesizer = Synth.getInstrumentSynthFunction(tone.instrument);
synthesizer(this, synthBuffer, stereoBufferIndex, stereoBufferLength, runLength * 2, tone, tone.instrument);
computeEnvelope(envelope, Envelope, time, number, beats, number, customVolume, number);
number;
{
    switch (envelope.type) {
        case 0 /* custom */: return customVolume;
        case 1 /* steady */: return 1.0;
        case 4 /* twang */:
            return 1.0 / (1.0 + time * envelope.speed);
        case 5 /* swell */:
            return 1.0 - 1.0 / (1.0 + time * envelope.speed);
        case 6 /* tremolo */:
            return 0.5 - Math.cos(beats * 2.0 * Math.PI * envelope.speed) * 0.5;
        case 7 /* tremolo2 */:
            return 0.75 - Math.cos(beats * 2.0 * Math.PI * envelope.speed) * 0.25;
        case 2 /* punch */:
            return Math.max(1.0, 2.0 - time * 10.0);
        case 3 /* flare */:
            var speed = envelope.speed;
            var attack = 0.25 / Math.sqrt(speed);
            return time < attack ? time / attack : 1.0 / (1.0 + (time - attack) * speed);
        case 8 /* decay */:
            return Math.pow(2, -envelope.speed * time);
        default: throw new Error("Unrecognized operator envelope type.");
    }
}
computeChordVolume(chordSize, number);
number;
{
    return 1.0 / ((chordSize - 1) * 0.25 + 1.0);
}
computeTone(synth, Synth, song, Song, channel, number, samplesPerTick, number, runLength, number, tone, Tone, released, boolean, shouldFadeOutFast, boolean);
void {
    const: instrument, Instrument:  = tone.instrument,
    const: transition, Transition:  = instrument.getTransition(),
    const: chord, Chord:  = instrument.getChord(),
    const: chordVolume, number:  = chord.arpeggiates ? 1 : Synth.computeChordVolume(tone.chordSize),
    const: isNoiseChannel, boolean:  = song.getChannelIsNoise(channel),
    const: intervalScale, number:  = isNoiseChannel ? SynthConfig_1.Config.noiseInterval : 1,
    const: secondsPerPart, number:  = SynthConfig_1.Config.ticksPerPart * samplesPerTick / synth.samplesPerSecond,
    const: beatsPerPart, number:  = 1.0 / SynthConfig_1.Config.partsPerBeat,
    const: toneWasActive, boolean:  = tone.active,
    const: tickSampleCountdown, number:  = synth.tickSampleCountdown,
    const: startRatio, number:  = 1.0 - (tickSampleCountdown) / samplesPerTick,
    const: endRatio, number:  = 1.0 - (tickSampleCountdown - runLength) / samplesPerTick,
    const: ticksIntoBar, number:  = (synth.beat * SynthConfig_1.Config.partsPerBeat + synth.part) * SynthConfig_1.Config.ticksPerPart + synth.tick,
    const: partTimeTickStart, number:  = (ticksIntoBar) / SynthConfig_1.Config.ticksPerPart,
    const: partTimeTickEnd, number:  = (ticksIntoBar + 1) / SynthConfig_1.Config.ticksPerPart,
    const: partTimeStart, number:  = partTimeTickStart + (partTimeTickEnd - partTimeTickStart) * startRatio,
    const: partTimeEnd, number:  = partTimeTickStart + (partTimeTickEnd - partTimeTickStart) * endRatio,
    tone: .phaseDeltaScale = 0.0,
    tone: .filter = 1.0,
    tone: .filterScale = 1.0,
    tone: .vibratoScale = 0.0,
    tone: .intervalMult = 1.0,
    tone: .intervalVolumeMult = 1.0,
    tone: .active = false,
    const: pan, number:  = (instrument.pan - SynthConfig_1.Config.panCenter) / SynthConfig_1.Config.panCenter,
    const: maxDelay, number:  = 0.00065 * synth.samplesPerSecond,
    const: delay, number:  = Math.round(-pan * maxDelay) * 2,
    const: volumeL, number:  = Math.cos((1 + pan) * Math.PI * 0.25) * 1.414,
    const: volumeR, number:  = Math.cos((1 - pan) * Math.PI * 0.25) * 1.414,
    const: delayL, number:  = Math.max(0.0, -delay),
    const: delayR, number:  = Math.max(0.0, delay),
    if: function (delay) {
        if (delay === void 0) { delay =  >= 0; }
        tone.stereoVolume1 = volumeL;
        tone.stereoVolume2 = volumeR;
        tone.stereoOffset = 0;
        tone.stereoDelay = delayR + 1;
    }, else: {
        tone: .stereoVolume1 = volumeR,
        tone: .stereoVolume2 = volumeL,
        tone: .stereoOffset = 1,
        tone: .stereoDelay = delayL - 1
    },
    let: resetPhases, boolean:  = true,
    let: partsSinceStart, number:  = 0.0,
    let: intervalStart, number:  = 0.0,
    let: intervalEnd, number:  = 0.0,
    let: transitionVolumeStart, number:  = 1.0,
    let: transitionVolumeEnd, number:  = 1.0,
    let: chordVolumeStart, number:  = chordVolume,
    let: chordVolumeEnd, number:  = chordVolume,
    let: customVolumeStart, number:  = 0.0,
    let: customVolumeEnd, number:  = 0.0,
    let: decayTimeStart, number:  = 0.0,
    let: decayTimeEnd, number:  = 0.0,
    let: volumeReferencePitch, number: ,
    let: basePitch, number: ,
    let: baseVolume, number: ,
    let: pitchDamping, number: ,
    if: function (instrument, type) {
        if (type === void 0) { type =  == 3 /* spectrum */; }
        if (isNoiseChannel) {
            basePitch = SynthConfig_1.Config.spectrumBasePitch;
            baseVolume = 0.6; // Note: spectrum is louder for drum channels than pitch channels!
        }
        else {
            basePitch = SynthConfig_1.Config.keys[song.key].basePitch;
            baseVolume = 0.3;
        }
        volumeReferencePitch = SynthConfig_1.Config.spectrumBasePitch;
        pitchDamping = 28;
    }, else: , if: function (instrument, type) {
        if (type === void 0) { type =  == 4 /* drumset */; }
        basePitch = SynthConfig_1.Config.spectrumBasePitch;
        baseVolume = 0.45;
        volumeReferencePitch = basePitch;
        pitchDamping = 48;
    }, else: , if: function (instrument, type) {
        if (type === void 0) { type =  == 2 /* noise */; }
        basePitch = SynthConfig_1.Config.chipNoises[instrument.chipNoise].basePitch;
        baseVolume = 0.19;
        volumeReferencePitch = basePitch;
        pitchDamping = SynthConfig_1.Config.chipNoises[instrument.chipNoise].isSoft ? 24.0 : 60.0;
    }, else: , if: function (instrument, type) {
        if (type === void 0) { type =  == 1 /* fm */; }
        basePitch = SynthConfig_1.Config.keys[song.key].basePitch;
        baseVolume = 0.03;
        volumeReferencePitch = 16;
        pitchDamping = 48;
    }, else: , if: function (instrument, type) {
        if (type === void 0) { type =  == 0 /* chip */; }
        basePitch = SynthConfig_1.Config.keys[song.key].basePitch;
        baseVolume = 0.03375; // looks low compared to drums, but it's doubled for chorus and drums tend to be loud anyway.
        volumeReferencePitch = 16;
        pitchDamping = 48;
    }, else: , if: function (instrument, type) {
        if (type === void 0) { type =  == 5 /* harmonics */; }
        basePitch = SynthConfig_1.Config.keys[song.key].basePitch;
        baseVolume = 0.025;
        volumeReferencePitch = 16;
        pitchDamping = 48;
    }, else: , if: function (instrument, type) {
        if (type === void 0) { type =  == 6 /* pwm */; }
        basePitch = SynthConfig_1.Config.keys[song.key].basePitch;
        baseVolume = 0.04725;
        volumeReferencePitch = 16;
        pitchDamping = 48;
    }, else: {
        throw: new Error("Unknown instrument type in computeTone.")
    },
    for: function (let, number, i, i) {
        if (let === void 0) { let = i; }
        if (number === void 0) { number = 0; }
        if (i === void 0) { i = ; }
        if (i === void 0) { i = ++; }
        tone.phaseDeltas[i] = 0.0;
        tone.volumeStarts[i] = 0.0;
        tone.volumeDeltas[i] = 0.0;
    },
    if: function (released) {
        var ticksSoFar = tone.noteLengthTicks + tone.ticksSinceReleased;
        var startTicksSinceReleased = tone.ticksSinceReleased + startRatio;
        var endTicksSinceReleased = tone.ticksSinceReleased + endRatio;
        var startTick = tone.noteLengthTicks + startTicksSinceReleased;
        var endTick = tone.noteLengthTicks + endTicksSinceReleased;
        var toneTransition = tone.instrument.getTransition();
        resetPhases = false;
        partsSinceStart = Math.floor(ticksSoFar / SynthConfig_1.Config.ticksPerPart);
        intervalStart = intervalEnd = tone.lastInterval;
        customVolumeStart = customVolumeEnd = Synth.expressionToVolumeMult(tone.lastVolume);
        transitionVolumeStart = Synth.expressionToVolumeMult((1.0 - startTicksSinceReleased / toneTransition.releaseTicks) * 3.0);
        transitionVolumeEnd = Synth.expressionToVolumeMult((1.0 - endTicksSinceReleased / toneTransition.releaseTicks) * 3.0);
        decayTimeStart = startTick / SynthConfig_1.Config.ticksPerPart;
        decayTimeEnd = endTick / SynthConfig_1.Config.ticksPerPart;
        if (shouldFadeOutFast) {
            transitionVolumeStart *= 1.0 - startRatio;
            transitionVolumeEnd *= 1.0 - endRatio;
        }
    }, else: , if: function (tone, note) {
        if (note === void 0) { note =  == null; }
        transitionVolumeStart = transitionVolumeEnd = 1;
        customVolumeStart = customVolumeEnd = 1;
        tone.lastInterval = 0;
        tone.lastVolume = 3;
        tone.ticksSinceReleased = 0;
        resetPhases = false;
        var heldTicksStart = tone.liveInputSamplesHeld / samplesPerTick;
        tone.liveInputSamplesHeld += runLength;
        var heldTicksEnd = tone.liveInputSamplesHeld / samplesPerTick;
        tone.noteLengthTicks = heldTicksEnd;
        var heldPartsStart = heldTicksStart / SynthConfig_1.Config.ticksPerPart;
        var heldPartsEnd = heldTicksEnd / SynthConfig_1.Config.ticksPerPart;
        partsSinceStart = Math.floor(heldPartsStart);
        decayTimeStart = heldPartsStart;
        decayTimeEnd = heldPartsEnd;
    }, else: {
        const: note, Note:  = tone.note,
        const: prevNote, Note:  | null, tone: .prevNote,
        const: nextNote, Note:  | null, tone: .nextNote,
        const: time, number:  = synth.part + synth.beat * SynthConfig_1.Config.partsPerBeat,
        const: partsPerBar, number:  = SynthConfig_1.Config.partsPerBeat * song.beatsPerBar,
        const: noteStart, number:  = tone.noteStart,
        const: noteEnd, number:  = tone.noteEnd,
        partsSinceStart:  = time - noteStart,
        let: endPinIndex, number: ,
        for: function (endPinIndex, endPinIndex, endPinIndex) {
            if (endPinIndex === void 0) { endPinIndex = 1; }
            if (endPinIndex === void 0) { endPinIndex = -1; }
            if (endPinIndex === void 0) { endPinIndex = ++; }
            if (note.pins[endPinIndex].time + note.start > time)
                break;
        },
        const: startPin, NotePin:  = note.pins[endPinIndex - 1],
        const: endPin, NotePin:  = note.pins[endPinIndex],
        const: noteStartTick, number:  = noteStart * SynthConfig_1.Config.ticksPerPart,
        const: noteEndTick, number:  = noteEnd * SynthConfig_1.Config.ticksPerPart,
        const: noteLengthTicks, number:  = noteEndTick - noteStartTick,
        const: pinStart, number:  = (note.start + startPin.time) * SynthConfig_1.Config.ticksPerPart,
        const: pinEnd, number:  = (note.start + endPin.time) * SynthConfig_1.Config.ticksPerPart,
        tone: .lastInterval = note.pins[note.pins.length - 1].interval,
        tone: .lastVolume = note.pins[note.pins.length - 1].volume,
        tone: .ticksSinceReleased = 0,
        tone: .noteLengthTicks = noteLengthTicks,
        const: tickTimeStart, number:  = time * SynthConfig_1.Config.ticksPerPart + synth.tick,
        const: tickTimeEnd, number:  = time * SynthConfig_1.Config.ticksPerPart + synth.tick + 1,
        const: noteTicksPassedTickStart, number:  = tickTimeStart - noteStartTick,
        const: noteTicksPassedTickEnd, number:  = tickTimeEnd - noteStartTick,
        const: pinRatioStart, number:  = Math.min(1.0, (tickTimeStart - pinStart) / (pinEnd - pinStart)),
        const: pinRatioEnd, number:  = Math.min(1.0, (tickTimeEnd - pinStart) / (pinEnd - pinStart)),
        let: customVolumeTickStart, number:  = startPin.volume + (endPin.volume - startPin.volume) * pinRatioStart,
        let: customVolumeTickEnd, number:  = startPin.volume + (endPin.volume - startPin.volume) * pinRatioEnd,
        let: transitionVolumeTickStart, number:  = 1.0,
        let: transitionVolumeTickEnd, number:  = 1.0,
        let: chordVolumeTickStart, number:  = chordVolume,
        let: chordVolumeTickEnd, number:  = chordVolume,
        let: intervalTickStart, number:  = startPin.interval + (endPin.interval - startPin.interval) * pinRatioStart,
        let: intervalTickEnd, number:  = startPin.interval + (endPin.interval - startPin.interval) * pinRatioEnd,
        let: decayTimeTickStart, number:  = partTimeTickStart - noteStart,
        let: decayTimeTickEnd, number:  = partTimeTickEnd - noteStart,
        resetPhases:  = (tickTimeStart + startRatio - noteStartTick == 0.0) || !toneWasActive,
        // if seamless, don't reset phases at start. (it's probably not necessary to constantly reset phases if there are no notes? Just do it once when note starts? But make sure that reset phases doesn't also reset stuff that this function did to set up the tone. Remember when the first run length was lost!
        // if slide, average the interval, decayTime, and custom volume at the endpoints and interpolate between over slide duration.
        // note that currently seamless and slide make different assumptions about whether a note at the end of a bar will connect with the next bar!
        const: maximumSlideTicks, number:  = noteLengthTicks * 0.5,
        if: function (transition, isSeamless) {
            if (isSeamless === void 0) { isSeamless =  && !transition.slides && note.start == 0; }
            // Special case for seamless, no-slide transition: assume the previous bar ends with another seamless note, don't reset tone history.
            resetPhases = !toneWasActive;
        }, else: , if: function (transition, isSeamless) {
            if (isSeamless === void 0) { isSeamless =  && prevNote != null; }
            resetPhases = !toneWasActive;
            if (transition.slides) {
                var slideTicks = Math.min(maximumSlideTicks, transition.slideTicks);
                var slideRatioStartTick = Math.max(0.0, 1.0 - noteTicksPassedTickStart / slideTicks);
                var slideRatioEndTick = Math.max(0.0, 1.0 - noteTicksPassedTickEnd / slideTicks);
                var intervalDiff = ((prevNote.pitches[tone.prevNotePitchIndex] + prevNote.pins[prevNote.pins.length - 1].interval) - tone.pitches[0]) * 0.5;
                var volumeDiff = (prevNote.pins[prevNote.pins.length - 1].volume - note.pins[0].volume) * 0.5;
                var decayTimeDiff = (prevNote.end - prevNote.start) * 0.5;
                intervalTickStart += slideRatioStartTick * intervalDiff;
                intervalTickEnd += slideRatioEndTick * intervalDiff;
                customVolumeTickStart += slideRatioStartTick * volumeDiff;
                customVolumeTickEnd += slideRatioEndTick * volumeDiff;
                decayTimeTickStart += slideRatioStartTick * decayTimeDiff;
                decayTimeTickEnd += slideRatioEndTick * decayTimeDiff;
                if (!chord.arpeggiates) {
                    var chordSizeDiff = (prevNote.pitches.length - tone.chordSize) * 0.5;
                    chordVolumeTickStart = Synth.computeChordVolume(tone.chordSize + slideRatioStartTick * chordSizeDiff);
                    chordVolumeTickEnd = Synth.computeChordVolume(tone.chordSize + slideRatioEndTick * chordSizeDiff);
                }
            }
        },
        if: function (transition, isSeamless) {
            if (isSeamless === void 0) { isSeamless =  && !transition.slides && note.end == partsPerBar; }
            // Special case for seamless, no-slide transition: assume the next bar starts with another seamless note, don't fade out.
        }, else: , if: function (transition, isSeamless) {
            if (isSeamless === void 0) { isSeamless =  && nextNote != null; }
            if (transition.slides) {
                var slideTicks = Math.min(maximumSlideTicks, transition.slideTicks);
                var slideRatioStartTick = Math.max(0.0, 1.0 - (noteLengthTicks - noteTicksPassedTickStart) / slideTicks);
                var slideRatioEndTick = Math.max(0.0, 1.0 - (noteLengthTicks - noteTicksPassedTickEnd) / slideTicks);
                var intervalDiff = (nextNote.pitches[tone.nextNotePitchIndex] - (tone.pitches[0] + note.pins[note.pins.length - 1].interval)) * 0.5;
                var volumeDiff = (nextNote.pins[0].volume - note.pins[note.pins.length - 1].volume) * 0.5;
                var decayTimeDiff = -(noteEnd - noteStart) * 0.5;
                intervalTickStart += slideRatioStartTick * intervalDiff;
                intervalTickEnd += slideRatioEndTick * intervalDiff;
                customVolumeTickStart += slideRatioStartTick * volumeDiff;
                customVolumeTickEnd += slideRatioEndTick * volumeDiff;
                decayTimeTickStart += slideRatioStartTick * decayTimeDiff;
                decayTimeTickEnd += slideRatioEndTick * decayTimeDiff;
                if (!chord.arpeggiates) {
                    var chordSizeDiff = (nextNote.pitches.length - tone.chordSize) * 0.5;
                    chordVolumeTickStart = Synth.computeChordVolume(tone.chordSize + slideRatioStartTick * chordSizeDiff);
                    chordVolumeTickEnd = Synth.computeChordVolume(tone.chordSize + slideRatioEndTick * chordSizeDiff);
                }
            }
        }, else: , if: function () { } } };
!transition.releases;
{
    var releaseTicks = transition.releaseTicks;
    if (releaseTicks > 0.0) {
        transitionVolumeTickStart *= Math.min(1.0, (noteLengthTicks - noteTicksPassedTickStart) / releaseTicks);
        transitionVolumeTickEnd *= Math.min(1.0, (noteLengthTicks - noteTicksPassedTickEnd) / releaseTicks);
    }
}
intervalStart = intervalTickStart + (intervalTickEnd - intervalTickStart) * startRatio;
intervalEnd = intervalTickStart + (intervalTickEnd - intervalTickStart) * endRatio;
customVolumeStart = Synth.expressionToVolumeMult(customVolumeTickStart + (customVolumeTickEnd - customVolumeTickStart) * startRatio);
customVolumeEnd = Synth.expressionToVolumeMult(customVolumeTickStart + (customVolumeTickEnd - customVolumeTickStart) * endRatio);
transitionVolumeStart = transitionVolumeTickStart + (transitionVolumeTickEnd - transitionVolumeTickStart) * startRatio;
transitionVolumeEnd = transitionVolumeTickStart + (transitionVolumeTickEnd - transitionVolumeTickStart) * endRatio;
chordVolumeStart = chordVolumeTickStart + (chordVolumeTickEnd - chordVolumeTickStart) * startRatio;
chordVolumeEnd = chordVolumeTickStart + (chordVolumeTickEnd - chordVolumeTickStart) * endRatio;
decayTimeStart = decayTimeTickStart + (decayTimeTickEnd - decayTimeTickStart) * startRatio;
decayTimeEnd = decayTimeTickStart + (decayTimeTickEnd - decayTimeTickStart) * endRatio;
var sampleTime = 1.0 / synth.samplesPerSecond;
tone.active = true;
if (instrument.type == 0 /* chip */ || instrument.type == 1 /* fm */ || instrument.type == 5 /* harmonics */ || instrument.type == 6 /* pwm */) {
    var lfoEffectStart = Synth.getLFOAmplitude(instrument, secondsPerPart * partTimeStart);
    var lfoEffectEnd = Synth.getLFOAmplitude(instrument, secondsPerPart * partTimeEnd);
    var vibratoScale = (partsSinceStart < SynthConfig_1.Config.vibratos[instrument.vibrato].delayParts) ? 0.0 : SynthConfig_1.Config.vibratos[instrument.vibrato].amplitude;
    var vibratoStart = vibratoScale * lfoEffectStart;
    var vibratoEnd = vibratoScale * lfoEffectEnd;
    intervalStart += vibratoStart;
    intervalEnd += vibratoEnd;
}
if (!transition.isSeamless || (!(!transition.slides && tone.note != null && tone.note.start == 0) && !(tone.prevNote != null))) {
    var attackSeconds = transition.attackSeconds;
    if (attackSeconds > 0.0) {
        transitionVolumeStart *= Math.min(1.0, secondsPerPart * decayTimeStart / attackSeconds);
        transitionVolumeEnd *= Math.min(1.0, secondsPerPart * decayTimeEnd / attackSeconds);
    }
}
var instrumentVolumeMult = Synth.instrumentVolumeToVolumeMult(instrument.volume);
if (instrument.type == 4 /* drumset */) {
    // It's possible that the note will change while the user is editing it,
    // but the tone's pitches don't get updated because the tone has already
    // ended and is fading out. To avoid an array index out of bounds error, clamp the pitch.
    tone.drumsetPitch = tone.pitches[0];
    if (tone.note != null)
        tone.drumsetPitch += tone.note.pickMainInterval();
    tone.drumsetPitch = Math.max(0, Math.min(SynthConfig_1.Config.drumCount - 1, tone.drumsetPitch));
}
var cutoffOctaves = instrument.getFilterCutoffOctaves();
var filterEnvelope = (instrument.type == 4 /* drumset */) ? instrument.getDrumsetEnvelope(tone.drumsetPitch) : instrument.getFilterEnvelope();
var filterCutoffHz = SynthConfig_1.Config.filterCutoffMaxHz * Math.pow(2.0, cutoffOctaves);
var filterBase = 2.0 * Math.sin(Math.PI * filterCutoffHz / synth.samplesPerSecond);
var filterMin = 2.0 * Math.sin(Math.PI * SynthConfig_1.Config.filterCutoffMinHz / synth.samplesPerSecond);
tone.filter = filterBase * Synth.computeEnvelope(filterEnvelope, secondsPerPart * decayTimeStart, beatsPerPart * partTimeStart, customVolumeStart);
var endFilter = filterBase * Synth.computeEnvelope(filterEnvelope, secondsPerPart * decayTimeEnd, beatsPerPart * partTimeEnd, customVolumeEnd);
tone.filter = Math.min(SynthConfig_1.Config.filterMax, Math.max(filterMin, tone.filter));
endFilter = Math.min(SynthConfig_1.Config.filterMax, Math.max(filterMin, endFilter));
tone.filterScale = Math.pow(endFilter / tone.filter, 1.0 / runLength);
var filterVolume = Math.pow(0.5, cutoffOctaves * 0.35);
if (instrument.filterResonance > 0) {
    filterVolume = Math.pow(filterVolume, 1.7) * Math.pow(0.5, 0.125 * (instrument.filterResonance - 1));
}
if (filterEnvelope.type == 8 /* decay */) {
    filterVolume *= (1.25 + .025 * filterEnvelope.speed);
}
else if (filterEnvelope.type == 4 /* twang */) {
    filterVolume *= (1 + .02 * filterEnvelope.speed);
}
if (resetPhases) {
    tone.reset();
}
if (instrument.type == 1 /* fm */) {
    // phase modulation!
    var sineVolumeBoost = 1.0;
    var totalCarrierVolume = 0.0;
    var arpeggioInterval = 0;
    if (tone.pitchCount > 1 && !chord.harmonizes) {
        var arpeggio = Math.floor((synth.tick + synth.part * SynthConfig_1.Config.ticksPerPart) / SynthConfig_1.Config.rhythms[song.rhythm].ticksPerArpeggio);
        arpeggioInterval = tone.pitches[SynthConfig_1.getArpeggioPitchIndex(tone.pitchCount, song.rhythm, arpeggio)] - tone.pitches[0];
    }
    var carrierCount = SynthConfig_1.Config.algorithms[instrument.algorithm].carrierCount;
    for (var i = 0; i < SynthConfig_1.Config.operatorCount; i++) {
        var associatedCarrierIndex = SynthConfig_1.Config.algorithms[instrument.algorithm].associatedCarrier[i] - 1;
        var pitch = tone.pitches[!chord.harmonizes ? 0 : ((i < tone.pitchCount) ? i : ((associatedCarrierIndex < tone.pitchCount) ? associatedCarrierIndex : 0))];
        var freqMult = SynthConfig_1.Config.operatorFrequencies[instrument.operators[i].frequency].mult;
        var interval = SynthConfig_1.Config.operatorCarrierInterval[associatedCarrierIndex] + arpeggioInterval;
        var startPitch = basePitch + (pitch + intervalStart) * intervalScale + interval;
        var startFreq = freqMult * (Instrument.frequencyFromPitch(startPitch)) + SynthConfig_1.Config.operatorFrequencies[instrument.operators[i].frequency].hzOffset;
        tone.phaseDeltas[i] = startFreq * sampleTime * SynthConfig_1.Config.sineWaveLength;
        var amplitudeCurve = Synth.operatorAmplitudeCurve(instrument.operators[i].amplitude);
        var amplitudeMult = amplitudeCurve * SynthConfig_1.Config.operatorFrequencies[instrument.operators[i].frequency].amplitudeSign;
        var volumeStart = amplitudeMult;
        var volumeEnd_1 = amplitudeMult;
        if (i < carrierCount) {
            // carrier
            var endPitch = basePitch + (pitch + intervalEnd) * intervalScale + interval;
            var pitchVolumeStart = Math.pow(2.0, -(startPitch - volumeReferencePitch) / pitchDamping);
            var pitchVolumeEnd = Math.pow(2.0, -(endPitch - volumeReferencePitch) / pitchDamping);
            volumeStart *= pitchVolumeStart;
            volumeEnd_1 *= pitchVolumeEnd;
            totalCarrierVolume += amplitudeCurve;
        }
        else {
            // modulator
            volumeStart *= SynthConfig_1.Config.sineWaveLength * 1.5;
            volumeEnd_1 *= SynthConfig_1.Config.sineWaveLength * 1.5;
            sineVolumeBoost *= 1.0 - Math.min(1.0, instrument.operators[i].amplitude / 15);
        }
        var operatorEnvelope = SynthConfig_1.Config.envelopes[instrument.operators[i].envelope];
        volumeStart *= Synth.computeEnvelope(operatorEnvelope, secondsPerPart * decayTimeStart, beatsPerPart * partTimeStart, customVolumeStart);
        volumeEnd_1 *= Synth.computeEnvelope(operatorEnvelope, secondsPerPart * decayTimeEnd, beatsPerPart * partTimeEnd, customVolumeEnd);
        tone.volumeStarts[i] = volumeStart;
        tone.volumeDeltas[i] = (volumeEnd_1 - volumeStart) / runLength;
    }
    var feedbackAmplitude = SynthConfig_1.Config.sineWaveLength * 0.3 * instrument.feedbackAmplitude / 15.0;
    var feedbackEnvelope = SynthConfig_1.Config.envelopes[instrument.feedbackEnvelope];
    var feedbackStart = feedbackAmplitude * Synth.computeEnvelope(feedbackEnvelope, secondsPerPart * decayTimeStart, beatsPerPart * partTimeStart, customVolumeStart);
    var feedbackEnd = feedbackAmplitude * Synth.computeEnvelope(feedbackEnvelope, secondsPerPart * decayTimeEnd, beatsPerPart * partTimeEnd, customVolumeEnd);
    tone.feedbackMult = feedbackStart;
    tone.feedbackDelta = (feedbackEnd - tone.feedbackMult) / runLength;
    var volumeMult = baseVolume * instrumentVolumeMult;
    tone.volumeStart = filterVolume * volumeMult * transitionVolumeStart * chordVolumeStart;
    var volumeEnd = filterVolume * volumeMult * transitionVolumeEnd * chordVolumeEnd;
    tone.volumeDelta = (volumeEnd - tone.volumeStart) / runLength;
    sineVolumeBoost *= (Math.pow(2.0, (2.0 - 1.4 * instrument.feedbackAmplitude / 15.0)) - 1.0) / 3.0;
    sineVolumeBoost *= 1.0 - Math.min(1.0, Math.max(0.0, totalCarrierVolume - 1) / 2.0);
    tone.volumeStart *= 1.0 + sineVolumeBoost * 3.0;
    tone.volumeDelta *= 1.0 + sineVolumeBoost * 3.0;
}
else {
    var pitch = tone.pitches[0];
    if (tone.pitchCount > 1) {
        var arpeggio = Math.floor((synth.tick + synth.part * SynthConfig_1.Config.ticksPerPart) / SynthConfig_1.Config.rhythms[song.rhythm].ticksPerArpeggio);
        if (chord.harmonizes) {
            var intervalOffset = tone.pitches[1 + SynthConfig_1.getArpeggioPitchIndex(tone.pitchCount - 1, song.rhythm, arpeggio)] - tone.pitches[0];
            tone.intervalMult = Math.pow(2.0, intervalOffset / 12.0);
            tone.intervalVolumeMult = Math.pow(2.0, -intervalOffset / pitchDamping);
        }
        else {
            pitch = tone.pitches[SynthConfig_1.getArpeggioPitchIndex(tone.pitchCount, song.rhythm, arpeggio)];
        }
    }
    var startPitch = basePitch + (pitch + intervalStart) * intervalScale;
    var endPitch = basePitch + (pitch + intervalEnd) * intervalScale;
    var startFreq = Instrument.frequencyFromPitch(startPitch);
    var pitchVolumeStart = Math.pow(2.0, -(startPitch - volumeReferencePitch) / pitchDamping);
    var pitchVolumeEnd = Math.pow(2.0, -(endPitch - volumeReferencePitch) / pitchDamping);
    var settingsVolumeMult = baseVolume * filterVolume;
    if (instrument.type == 2 /* noise */) {
        settingsVolumeMult *= SynthConfig_1.Config.chipNoises[instrument.chipNoise].volume;
    }
    if (instrument.type == 0 /* chip */) {
        settingsVolumeMult *= SynthConfig_1.Config.chipWaves[instrument.chipWave].volume;
    }
    if (instrument.type == 0 /* chip */ || instrument.type == 5 /* harmonics */) {
        settingsVolumeMult *= SynthConfig_1.Config.intervals[instrument.interval].volume;
    }
    if (instrument.type == 6 /* pwm */) {
        var pulseEnvelope = SynthConfig_1.Config.envelopes[instrument.pulseEnvelope];
        var basePulseWidth = Math.pow(0.5, (SynthConfig_1.Config.pulseWidthRange - instrument.pulseWidth - 1) * 0.5) * 0.5;
        var pulseWidthStart = basePulseWidth * Synth.computeEnvelope(pulseEnvelope, secondsPerPart * decayTimeStart, beatsPerPart * partTimeStart, customVolumeStart);
        var pulseWidthEnd = basePulseWidth * Synth.computeEnvelope(pulseEnvelope, secondsPerPart * decayTimeEnd, beatsPerPart * partTimeEnd, customVolumeEnd);
        tone.pulseWidth = pulseWidthStart;
        tone.pulseWidthDelta = (pulseWidthEnd - pulseWidthStart) / runLength;
    }
    tone.phaseDeltas[0] = startFreq * sampleTime;
    tone.volumeStart = transitionVolumeStart * chordVolumeStart * pitchVolumeStart * settingsVolumeMult * instrumentVolumeMult;
    var volumeEnd = transitionVolumeEnd * chordVolumeEnd * pitchVolumeEnd * settingsVolumeMult * instrumentVolumeMult;
    if (filterEnvelope.type != 0 /* custom */ && (instrument.type != 6 /* pwm */ || SynthConfig_1.Config.envelopes[instrument.pulseEnvelope].type != 0 /* custom */)) {
        tone.volumeStart *= customVolumeStart;
        volumeEnd *= customVolumeEnd;
    }
    tone.volumeDelta = (volumeEnd - tone.volumeStart) / runLength;
}
tone.phaseDeltaScale = Math.pow(2.0, ((intervalEnd - intervalStart) * intervalScale / 12.0) / runLength);
getLFOAmplitude(instrument, Instrument, secondsIntoBar, number);
number;
{
    var effect = 0.0;
    for (var _i = 0, _b = SynthConfig_1.Config.vibratos[instrument.vibrato].periodsSeconds; _i < _b.length; _i++) {
        var vibratoPeriodSeconds = _b[_i];
        effect += Math.sin(Math.PI * 2.0 * secondsIntoBar / vibratoPeriodSeconds);
    }
    return effect;
}
readonly;
fmSynthFunctionCache: Dictionary < Function > ;
{ }
;
getInstrumentSynthFunction(instrument, Instrument);
Function;
{
    if (instrument.type == 1 /* fm */) {
        var fingerprint = instrument.algorithm + "_" + instrument.feedbackType;
        if (Synth.fmSynthFunctionCache[fingerprint] == undefined) {
            var synthSource = [];
            for (var _c = 0, _d = Synth.fmSourceTemplate; _c < _d.length; _c++) {
                var line = _d[_c];
                if (line.indexOf("// CARRIER OUTPUTS") != -1) {
                    var outputs = [];
                    for (var j = 0; j < SynthConfig_1.Config.algorithms[instrument.algorithm].carrierCount; j++) {
                        outputs.push("operator" + j + "Scaled");
                    }
                    synthSource.push(line.replace("/*operator#Scaled*/", outputs.join(" + ")));
                }
                else if (line.indexOf("// INSERT OPERATOR COMPUTATION HERE") != -1) {
                    for (var j = SynthConfig_1.Config.operatorCount - 1; j >= 0; j--) {
                        for (var _e = 0, _f = Synth.operatorSourceTemplate; _e < _f.length; _e++) {
                            var operatorLine = _f[_e];
                            if (operatorLine.indexOf("/* + operator@Scaled*/") != -1) {
                                var modulators = "";
                                for (var _g = 0, _h = SynthConfig_1.Config.algorithms[instrument.algorithm].modulatedBy[j]; _g < _h.length; _g++) {
                                    var modulatorNumber = _h[_g];
                                    modulators += " + operator" + (modulatorNumber - 1) + "Scaled";
                                }
                                var feedbackIndices = SynthConfig_1.Config.feedbacks[instrument.feedbackType].indices[j];
                                if (feedbackIndices.length > 0) {
                                    modulators += " + feedbackMult * (";
                                    var feedbacks = [];
                                    for (var _j = 0; _j < feedbackIndices.length; _j++) {
                                        var modulatorNumber = feedbackIndices[_j];
                                        feedbacks.push("operator" + (modulatorNumber - 1) + "Output");
                                    }
                                    modulators += feedbacks.join(" + ") + ")";
                                }
                                synthSource.push(operatorLine.replace(/\#/g, j + "").replace("/* + operator@Scaled*/", modulators));
                            }
                            else {
                                synthSource.push(operatorLine.replace(/\#/g, j + ""));
                            }
                        }
                    }
                }
                else if (line.indexOf("#") != -1) {
                    for (var j = 0; j < SynthConfig_1.Config.operatorCount; j++) {
                        synthSource.push(line.replace(/\#/g, j + ""));
                    }
                }
                else {
                    synthSource.push(line);
                }
            }
            //console.log(synthSource.join("\n"));
            Synth.fmSynthFunctionCache[fingerprint] = new Function("synth", "data", "stereoBufferIndex", "stereoBufferLength", "runLength", "tone", "instrument", synthSource.join("\n"));
        }
        return Synth.fmSynthFunctionCache[fingerprint];
    }
    else if (instrument.type == 0 /* chip */) {
        return Synth.chipSynth;
    }
    else if (instrument.type == 5 /* harmonics */) {
        return Synth.harmonicsSynth;
    }
    else if (instrument.type == 6 /* pwm */) {
        return Synth.pulseWidthSynth;
    }
    else if (instrument.type == 2 /* noise */) {
        return Synth.noiseSynth;
    }
    else if (instrument.type == 3 /* spectrum */) {
        return Synth.spectrumSynth;
    }
    else if (instrument.type == 4 /* drumset */) {
        return Synth.drumsetSynth;
    }
    else {
        throw new Error("Unrecognized instrument type: " + instrument.type);
    }
}
chipSynth(synth, Synth, data, Float32Array, stereoBufferIndex, number, stereoBufferLength, number, runLength, number, tone, Tone, instrument, Instrument);
void {
    const: wave, Float64Array:  = SynthConfig_1.Config.chipWaves[instrument.chipWave].samples,
    const: waveLength, number:  = +wave.length - 1,
    const: intervalA, number:  = +Math.pow(2.0, (SynthConfig_1.Config.intervals[instrument.interval].offset + SynthConfig_1.Config.intervals[instrument.interval].spread) / 12.0),
    const: intervalB, number:  = Math.pow(2.0, (SynthConfig_1.Config.intervals[instrument.interval].offset - SynthConfig_1.Config.intervals[instrument.interval].spread) / 12.0) * tone.intervalMult,
    const: intervalSign, number:  = tone.intervalVolumeMult * SynthConfig_1.Config.intervals[instrument.interval].sign,
    if: function (instrument, interval) {
        if (interval === void 0) { interval =  == 0 && !instrument.getChord().customInterval; }
    }, tone: .phases[1] = tone.phases[0],
    const: deltaRatio, number:  = intervalB / intervalA,
    let: phaseDeltaA, number:  = tone.phaseDeltas[0] * intervalA * waveLength,
    let: phaseDeltaB, number:  = phaseDeltaA * deltaRatio,
    const: phaseDeltaScale, number:  = +tone.phaseDeltaScale,
    let: volume, number:  = +tone.volumeStart,
    const: volumeDelta, number:  = +tone.volumeDelta,
    let: phaseA, number:  = (tone.phases[0] % 1) * waveLength,
    let: phaseB, number:  = (tone.phases[1] % 1) * waveLength,
    let: filter1, number:  = +tone.filter,
    let: filter2, number:  = instrument.getFilterIsFirstOrder() ? 1.0 : filter1,
    const: filterScale1, number:  = +tone.filterScale,
    const: filterScale2, number:  = instrument.getFilterIsFirstOrder() ? 1.0 : filterScale1,
    const: filterResonance = SynthConfig_1.Config.filterMaxResonance * Math.pow(Math.max(0, instrument.getFilterResonance() - 1) / (SynthConfig_1.Config.filterResonanceRange - 2), 0.5),
    let: filterSample0, number:  = +tone.filterSample0,
    let: filterSample1, number:  = +tone.filterSample1,
    const: phaseAInt, number:  = phaseA | 0,
    const: phaseBInt, number:  = phaseB | 0,
    const: indexA, number:  = phaseAInt % waveLength,
    const: indexB, number:  = phaseBInt % waveLength,
    const: phaseRatioA, number:  = phaseA - phaseAInt,
    const: phaseRatioB, number:  = phaseB - phaseBInt,
    let: prevWaveIntegralA, number:  = wave[indexA],
    let: prevWaveIntegralB, number:  = wave[indexB],
    prevWaveIntegralA:  += (wave[indexA + 1] - prevWaveIntegralA) * phaseRatioA,
    prevWaveIntegralB:  += (wave[indexB + 1] - prevWaveIntegralB) * phaseRatioB,
    const: stopIndex, number:  = stereoBufferIndex + runLength,
    stereoBufferIndex:  += tone.stereoOffset,
    const: stereoVolume1, number:  = tone.stereoVolume1,
    const: stereoVolume2, number:  = tone.stereoVolume2,
    const: stereoDelay, number:  = tone.stereoDelay,
    while: function (stereoBufferIndex) {
        if (stereoBufferIndex === void 0) { stereoBufferIndex = ; }
        phaseA += phaseDeltaA;
        phaseB += phaseDeltaB;
        var phaseAInt = phaseA | 0;
        var phaseBInt = phaseB | 0;
        var indexA = phaseAInt % waveLength;
        var indexB = phaseBInt % waveLength;
        var nextWaveIntegralA = wave[indexA];
        var nextWaveIntegralB = wave[indexB];
        var phaseRatioA = phaseA - phaseAInt;
        var phaseRatioB = phaseB - phaseBInt;
        nextWaveIntegralA += (wave[indexA + 1] - nextWaveIntegralA) * phaseRatioA;
        nextWaveIntegralB += (wave[indexB + 1] - nextWaveIntegralB) * phaseRatioB;
        var waveA = (nextWaveIntegralA - prevWaveIntegralA) / phaseDeltaA;
        var waveB = (nextWaveIntegralB - prevWaveIntegralB) / phaseDeltaB;
        prevWaveIntegralA = nextWaveIntegralA;
        prevWaveIntegralB = nextWaveIntegralB;
        var combinedWave = (waveA + waveB * intervalSign);
        var feedback = filterResonance + filterResonance / (1.0 - filter1);
        filterSample0 += filter1 * (combinedWave - filterSample0 + feedback * (filterSample0 - filterSample1));
        filterSample1 += filter2 * (filterSample0 - filterSample1);
        filter1 *= filterScale1;
        filter2 *= filterScale2;
        phaseDeltaA *= phaseDeltaScale;
        phaseDeltaB *= phaseDeltaScale;
        var output = filterSample1 * volume;
        volume += volumeDelta;
        data[stereoBufferIndex] += output * stereoVolume1;
        data[(stereoBufferIndex + stereoDelay) % stereoBufferLength] += output * stereoVolume2;
        stereoBufferIndex += 2;
    },
    tone: .phases[0] = phaseA / waveLength,
    tone: .phases[1] = phaseB / waveLength,
    const: epsilon, number:  = (1.0e-24),
    if: function () { } } - epsilon < filterSample0 && filterSample0 < epsilon;
filterSample0 = 0.0;
if (-epsilon < filterSample1 && filterSample1 < epsilon)
    filterSample1 = 0.0;
tone.filterSample0 = filterSample0;
tone.filterSample1 = filterSample1;
harmonicsSynth(synth, Synth, data, Float32Array, stereoBufferIndex, number, stereoBufferLength, number, runLength, number, tone, Tone, instrument, Instrument);
void {
    const: wave, Float32Array:  = instrument.harmonicsWave.getCustomWave(),
    const: waveLength, number:  = +wave.length - 1,
    const: intervalA, number:  = +Math.pow(2.0, (SynthConfig_1.Config.intervals[instrument.interval].offset + SynthConfig_1.Config.intervals[instrument.interval].spread) / 12.0),
    const: intervalB, number:  = Math.pow(2.0, (SynthConfig_1.Config.intervals[instrument.interval].offset - SynthConfig_1.Config.intervals[instrument.interval].spread) / 12.0) * tone.intervalMult,
    const: intervalSign, number:  = tone.intervalVolumeMult * SynthConfig_1.Config.intervals[instrument.interval].sign,
    if: function (instrument, interval) {
        if (interval === void 0) { interval =  == 0 && !instrument.getChord().customInterval; }
    }, tone: .phases[1] = tone.phases[0],
    const: deltaRatio, number:  = intervalB / intervalA,
    let: phaseDeltaA, number:  = tone.phaseDeltas[0] * intervalA * waveLength,
    let: phaseDeltaB, number:  = phaseDeltaA * deltaRatio,
    const: phaseDeltaScale, number:  = +tone.phaseDeltaScale,
    let: volume, number:  = +tone.volumeStart,
    const: volumeDelta, number:  = +tone.volumeDelta,
    let: phaseA, number:  = (tone.phases[0] % 1) * waveLength,
    let: phaseB, number:  = (tone.phases[1] % 1) * waveLength,
    let: filter1, number:  = +tone.filter,
    let: filter2, number:  = instrument.getFilterIsFirstOrder() ? 1.0 : filter1,
    const: filterScale1, number:  = +tone.filterScale,
    const: filterScale2, number:  = instrument.getFilterIsFirstOrder() ? 1.0 : filterScale1,
    const: filterResonance = SynthConfig_1.Config.filterMaxResonance * Math.pow(Math.max(0, instrument.getFilterResonance() - 1) / (SynthConfig_1.Config.filterResonanceRange - 2), 0.5),
    let: filterSample0, number:  = +tone.filterSample0,
    let: filterSample1, number:  = +tone.filterSample1,
    const: phaseAInt, number:  = phaseA | 0,
    const: phaseBInt, number:  = phaseB | 0,
    const: indexA, number:  = phaseAInt % waveLength,
    const: indexB, number:  = phaseBInt % waveLength,
    const: phaseRatioA, number:  = phaseA - phaseAInt,
    const: phaseRatioB, number:  = phaseB - phaseBInt,
    let: prevWaveIntegralA, number:  = wave[indexA],
    let: prevWaveIntegralB, number:  = wave[indexB],
    prevWaveIntegralA:  += (wave[indexA + 1] - prevWaveIntegralA) * phaseRatioA,
    prevWaveIntegralB:  += (wave[indexB + 1] - prevWaveIntegralB) * phaseRatioB,
    const: stopIndex, number:  = stereoBufferIndex + runLength,
    stereoBufferIndex:  += tone.stereoOffset,
    const: stereoVolume1, number:  = tone.stereoVolume1,
    const: stereoVolume2, number:  = tone.stereoVolume2,
    const: stereoDelay, number:  = tone.stereoDelay,
    while: function (stereoBufferIndex) {
        if (stereoBufferIndex === void 0) { stereoBufferIndex = ; }
        phaseA += phaseDeltaA;
        phaseB += phaseDeltaB;
        var phaseAInt = phaseA | 0;
        var phaseBInt = phaseB | 0;
        var indexA = phaseAInt % waveLength;
        var indexB = phaseBInt % waveLength;
        var nextWaveIntegralA = wave[indexA];
        var nextWaveIntegralB = wave[indexB];
        var phaseRatioA = phaseA - phaseAInt;
        var phaseRatioB = phaseB - phaseBInt;
        nextWaveIntegralA += (wave[indexA + 1] - nextWaveIntegralA) * phaseRatioA;
        nextWaveIntegralB += (wave[indexB + 1] - nextWaveIntegralB) * phaseRatioB;
        var waveA = (nextWaveIntegralA - prevWaveIntegralA) / phaseDeltaA;
        var waveB = (nextWaveIntegralB - prevWaveIntegralB) / phaseDeltaB;
        prevWaveIntegralA = nextWaveIntegralA;
        prevWaveIntegralB = nextWaveIntegralB;
        var combinedWave = (waveA + waveB * intervalSign);
        var feedback = filterResonance + filterResonance / (1.0 - filter1);
        filterSample0 += filter1 * (combinedWave - filterSample0 + feedback * (filterSample0 - filterSample1));
        filterSample1 += filter2 * (filterSample0 - filterSample1);
        filter1 *= filterScale1;
        filter2 *= filterScale2;
        phaseDeltaA *= phaseDeltaScale;
        phaseDeltaB *= phaseDeltaScale;
        var output = filterSample1 * volume;
        volume += volumeDelta;
        data[stereoBufferIndex] += output * stereoVolume1;
        data[(stereoBufferIndex + stereoDelay) % stereoBufferLength] += output * stereoVolume2;
        stereoBufferIndex += 2;
    },
    tone: .phases[0] = phaseA / waveLength,
    tone: .phases[1] = phaseB / waveLength,
    const: epsilon, number:  = (1.0e-24),
    if: function () { } } - epsilon < filterSample0 && filterSample0 < epsilon;
filterSample0 = 0.0;
if (-epsilon < filterSample1 && filterSample1 < epsilon)
    filterSample1 = 0.0;
tone.filterSample0 = filterSample0;
tone.filterSample1 = filterSample1;
pulseWidthSynth(synth, Synth, data, Float32Array, stereoBufferIndex, number, stereoBufferLength, number, runLength, number, tone, Tone, instrument, Instrument);
void {
    let: phaseDelta, number:  = tone.phaseDeltas[0],
    const: phaseDeltaScale, number:  = +tone.phaseDeltaScale,
    let: volume, number:  = +tone.volumeStart,
    const: volumeDelta, number:  = +tone.volumeDelta,
    let: phase, number:  = (tone.phases[0] % 1),
    let: pulseWidth, number:  = tone.pulseWidth,
    const: pulseWidthDelta, number:  = tone.pulseWidthDelta,
    let: filter1, number:  = +tone.filter,
    let: filter2, number:  = instrument.getFilterIsFirstOrder() ? 1.0 : filter1,
    const: filterScale1, number:  = +tone.filterScale,
    const: filterScale2, number:  = instrument.getFilterIsFirstOrder() ? 1.0 : filterScale1,
    const: filterResonance = SynthConfig_1.Config.filterMaxResonance * Math.pow(Math.max(0, instrument.getFilterResonance() - 1) / (SynthConfig_1.Config.filterResonanceRange - 2), 0.5),
    let: filterSample0, number:  = +tone.filterSample0,
    let: filterSample1, number:  = +tone.filterSample1,
    const: stopIndex, number:  = stereoBufferIndex + runLength,
    stereoBufferIndex:  += tone.stereoOffset,
    const: stereoVolume1, number:  = tone.stereoVolume1,
    const: stereoVolume2, number:  = tone.stereoVolume2,
    const: stereoDelay, number:  = tone.stereoDelay,
    while: function (stereoBufferIndex) {
        if (stereoBufferIndex === void 0) { stereoBufferIndex = ; }
        var sawPhaseA = phase % 1;
        var sawPhaseB = (phase + pulseWidth) % 1;
        var pulseWave = sawPhaseB - sawPhaseA;
        // This a PolyBLEP, which smooths out discontinuities at any frequency to reduce aliasing. 
        if (sawPhaseA < phaseDelta) {
            var t = sawPhaseA / phaseDelta;
            pulseWave += (t + t - t * t - 1) * 0.5;
        }
        else if (sawPhaseA > 1.0 - phaseDelta) {
            var t = (sawPhaseA - 1.0) / phaseDelta;
            pulseWave += (t + t + t * t + 1) * 0.5;
        }
        if (sawPhaseB < phaseDelta) {
            var t = sawPhaseB / phaseDelta;
            pulseWave -= (t + t - t * t - 1) * 0.5;
        }
        else if (sawPhaseB > 1.0 - phaseDelta) {
            var t = (sawPhaseB - 1.0) / phaseDelta;
            pulseWave -= (t + t + t * t + 1) * 0.5;
        }
        var feedback = filterResonance + filterResonance / (1.0 - filter1);
        filterSample0 += filter1 * (pulseWave - filterSample0 + feedback * (filterSample0 - filterSample1));
        filterSample1 += filter2 * (filterSample0 - filterSample1);
        filter1 *= filterScale1;
        filter2 *= filterScale2;
        phase += phaseDelta;
        phaseDelta *= phaseDeltaScale;
        pulseWidth += pulseWidthDelta;
        var output = filterSample1 * volume;
        volume += volumeDelta;
        data[stereoBufferIndex] += output * stereoVolume1;
        data[(stereoBufferIndex + stereoDelay) % stereoBufferLength] += output * stereoVolume2;
        stereoBufferIndex += 2;
    },
    tone: .phases[0] = phase,
    const: epsilon, number:  = (1.0e-24),
    if: function () { } } - epsilon < filterSample0 && filterSample0 < epsilon;
filterSample0 = 0.0;
if (-epsilon < filterSample1 && filterSample1 < epsilon)
    filterSample1 = 0.0;
tone.filterSample0 = filterSample0;
tone.filterSample1 = filterSample1;
fmSourceTemplate: string[] = ("\n\t\t\tconst sineWave = beepbox.Config.sineWave;\n\t\t\t\n\t\t\tlet phaseDeltaScale = +tone.phaseDeltaScale;\n\t\t\t// I'm adding 1000 to the phase to ensure that it's never negative even when modulated by other waves because negative numbers don't work with the modulus operator very well.\n\t\t\tlet operator#Phase       = +((tone.phases[#] % 1) + 1000) * beepbox.Config.sineWaveLength;\n\t\t\tlet operator#PhaseDelta  = +tone.phaseDeltas[#];\n\t\t\tlet operator#OutputMult  = +tone.volumeStarts[#];\n\t\t\tconst operator#OutputDelta = +tone.volumeDeltas[#];\n\t\t\tlet operator#Output      = +tone.feedbackOutputs[#];\n\t\t\tlet feedbackMult         = +tone.feedbackMult;\n\t\t\tconst feedbackDelta        = +tone.feedbackDelta;\n\t\t\tlet volume = +tone.volumeStart;\n\t\t\tconst volumeDelta = +tone.volumeDelta;\n\t\t\t\n\t\t\tlet filter1 = +tone.filter;\n\t\t\tlet filter2 = instrument.getFilterIsFirstOrder() ? 1.0 : filter1;\n\t\t\tconst filterScale1 = +tone.filterScale;\n\t\t\tconst filterScale2 = instrument.getFilterIsFirstOrder() ? 1.0 : filterScale1;\n\t\t\tconst filterResonance = beepbox.Config.filterMaxResonance * Math.pow(Math.max(0, instrument.getFilterResonance() - 1) / (beepbox.Config.filterResonanceRange - 2), 0.5);\n\t\t\tlet filterSample0 = +tone.filterSample0;\n\t\t\tlet filterSample1 = +tone.filterSample1;\n\t\t\t\n\t\t\tconst stopIndex = stereoBufferIndex + runLength;\n\t\t\tstereoBufferIndex += tone.stereoOffset;\n\t\t\tconst stereoVolume1 = tone.stereoVolume1;\n\t\t\tconst stereoVolume2 = tone.stereoVolume2;\n\t\t\tconst stereoDelay = tone.stereoDelay;\n\t\t\twhile (stereoBufferIndex < stopIndex) {\n\t\t\t\t// INSERT OPERATOR COMPUTATION HERE\n\t\t\t\tconst fmOutput = (/*operator#Scaled*/); // CARRIER OUTPUTS\n\t\t\t\t\n\t\t\t\tconst feedback = filterResonance + filterResonance / (1.0 - filter1);\n\t\t\t\tfilterSample0 += filter1 * (fmOutput - filterSample0 + feedback * (filterSample0 - filterSample1));\n\t\t\t\tfilterSample1 += filter2 * (filterSample0 - filterSample1);\n\t\t\t\t\n\t\t\t\tfeedbackMult += feedbackDelta;\n\t\t\t\toperator#OutputMult += operator#OutputDelta;\n\t\t\t\toperator#Phase += operator#PhaseDelta;\n\t\t\t\toperator#PhaseDelta *= phaseDeltaScale;\n\t\t\t\tfilter1 *= filterScale1;\n\t\t\t\tfilter2 *= filterScale2;\n\t\t\t\t\n\t\t\t\tconst output = filterSample1 * volume;\n\t\t\t\tvolume += volumeDelta;\n\t\t\t\t\n\t\t\t\tdata[stereoBufferIndex] += output * stereoVolume1;\n\t\t\t\tdata[(stereoBufferIndex + stereoDelay) % stereoBufferLength] += output * stereoVolume2;\n\t\t\t\tstereoBufferIndex += 2;\n\t\t\t}\n\t\t\t\n\t\t\ttone.phases[#] = operator#Phase / " + SynthConfig_1.Config.sineWaveLength + ";\n\t\t\ttone.feedbackOutputs[#] = operator#Output;\n\t\t\t\n\t\t\tconst epsilon = (1.0e-24);\n\t\t\tif (-epsilon < filterSample0 && filterSample0 < epsilon) filterSample0 = 0.0;\n\t\t\tif (-epsilon < filterSample1 && filterSample1 < epsilon) filterSample1 = 0.0;\n\t\t\ttone.filterSample0 = filterSample0;\n\t\t\ttone.filterSample1 = filterSample1;\n\t\t").split("\n");
operatorSourceTemplate: string[] = ("\n\t\t\t\tconst operator#PhaseMix = operator#Phase/* + operator@Scaled*/;\n\t\t\t\tconst operator#PhaseInt = operator#PhaseMix|0;\n\t\t\t\tconst operator#Index    = operator#PhaseInt & " + SynthConfig_1.Config.sineWaveMask + ";\n\t\t\t\tconst operator#Sample   = sineWave[operator#Index];\n\t\t\t\toperator#Output       = operator#Sample + (sineWave[operator#Index + 1] - operator#Sample) * (operator#PhaseMix - operator#PhaseInt);\n\t\t\t\tconst operator#Scaled   = operator#OutputMult * operator#Output;\n\t\t").split("\n");
noiseSynth(synth, Synth, data, Float32Array, stereoBufferIndex, number, stereoBufferLength, number, runLength, number, tone, Tone, instrument, Instrument);
void {
    let: wave, Float32Array:  = instrument.getDrumWave(),
    let: phaseDelta, number:  = +tone.phaseDeltas[0],
    const: phaseDeltaScale, number:  = +tone.phaseDeltaScale,
    let: volume, number:  = +tone.volumeStart,
    const: volumeDelta, number:  = +tone.volumeDelta,
    let: phase, number:  = (tone.phases[0] % 1) * SynthConfig_1.Config.chipNoiseLength,
    if: function (tone, phases) {
        if (phases === void 0) { phases = [0] == 0; }
        // Zero phase means the tone was reset, just give noise a random start phase instead.
        phase = Math.random() * SynthConfig_1.Config.chipNoiseLength;
    },
    let: sample, number:  = +tone.sample,
    let: filter1, number:  = +tone.filter,
    let: filter2, number:  = instrument.getFilterIsFirstOrder() ? 1.0 : filter1,
    const: filterScale1, number:  = +tone.filterScale,
    const: filterScale2, number:  = instrument.getFilterIsFirstOrder() ? 1.0 : filterScale1,
    const: filterResonance = SynthConfig_1.Config.filterMaxResonance * Math.pow(Math.max(0, instrument.getFilterResonance() - 1) / (SynthConfig_1.Config.filterResonanceRange - 2), 0.5),
    let: filterSample0, number:  = +tone.filterSample0,
    let: filterSample1, number:  = +tone.filterSample1,
    const: pitchRelativefilter, number:  = Math.min(1.0, tone.phaseDeltas[0] * SynthConfig_1.Config.chipNoises[instrument.chipNoise].pitchFilterMult),
    const: stopIndex, number:  = stereoBufferIndex + runLength,
    stereoBufferIndex:  += tone.stereoOffset,
    const: stereoVolume1, number:  = tone.stereoVolume1,
    const: stereoVolume2, number:  = tone.stereoVolume2,
    const: stereoDelay, number:  = tone.stereoDelay,
    while: function (stereoBufferIndex) {
        if (stereoBufferIndex === void 0) { stereoBufferIndex = ; }
        var waveSample = wave[phase & 0x7fff];
        sample += (waveSample - sample) * pitchRelativefilter;
        var feedback = filterResonance + filterResonance / (1.0 - filter1);
        filterSample0 += filter1 * (sample - filterSample0 + feedback * (filterSample0 - filterSample1));
        filterSample1 += filter2 * (filterSample0 - filterSample1);
        phase += phaseDelta;
        filter1 *= filterScale1;
        filter2 *= filterScale2;
        phaseDelta *= phaseDeltaScale;
        var output = filterSample1 * volume;
        volume += volumeDelta;
        data[stereoBufferIndex] += output * stereoVolume1;
        data[(stereoBufferIndex + stereoDelay) % stereoBufferLength] += output * stereoVolume2;
        stereoBufferIndex += 2;
    },
    tone: .phases[0] = phase / SynthConfig_1.Config.chipNoiseLength,
    tone: .sample = sample,
    const: epsilon, number:  = (1.0e-24),
    if: function () { } } - epsilon < filterSample0 && filterSample0 < epsilon;
filterSample0 = 0.0;
if (-epsilon < filterSample1 && filterSample1 < epsilon)
    filterSample1 = 0.0;
tone.filterSample0 = filterSample0;
tone.filterSample1 = filterSample1;
spectrumSynth(synth, Synth, data, Float32Array, stereoBufferIndex, number, stereoBufferLength, number, runLength, number, tone, Tone, instrument, Instrument);
void {
    let: wave, Float32Array:  = instrument.getDrumWave(),
    let: phaseDelta, number:  = tone.phaseDeltas[0] * (1 << 7),
    const: phaseDeltaScale, number:  = +tone.phaseDeltaScale,
    let: volume, number:  = +tone.volumeStart,
    const: volumeDelta, number:  = +tone.volumeDelta,
    let: sample, number:  = +tone.sample,
    let: filter1, number:  = +tone.filter,
    let: filter2, number:  = instrument.getFilterIsFirstOrder() ? 1.0 : filter1,
    const: filterScale1, number:  = +tone.filterScale,
    const: filterScale2, number:  = instrument.getFilterIsFirstOrder() ? 1.0 : filterScale1,
    const: filterResonance = SynthConfig_1.Config.filterMaxResonance * Math.pow(Math.max(0, instrument.getFilterResonance() - 1) / (SynthConfig_1.Config.filterResonanceRange - 2), 0.5),
    let: filterSample0, number:  = +tone.filterSample0,
    let: filterSample1, number:  = +tone.filterSample1,
    let: phase, number:  = (tone.phases[0] % 1) * SynthConfig_1.Config.chipNoiseLength,
    // Zero phase means the tone was reset, just give noise a random start phase instead.
    if: function (tone, phases) {
        if (phases === void 0) { phases = [0] == 0; }
    }, phase:  = Synth.findRandomZeroCrossing(wave) + phaseDelta,
    const: pitchRelativefilter, number:  = Math.min(1.0, phaseDelta),
    const: stopIndex, number:  = stereoBufferIndex + runLength,
    stereoBufferIndex:  += tone.stereoOffset,
    const: stereoVolume1, number:  = tone.stereoVolume1,
    const: stereoVolume2, number:  = tone.stereoVolume2,
    const: stereoDelay, number:  = tone.stereoDelay,
    while: function (stereoBufferIndex) {
        if (stereoBufferIndex === void 0) { stereoBufferIndex = ; }
        var phaseInt = phase | 0;
        var index = phaseInt & 0x7fff;
        var waveSample = wave[index];
        var phaseRatio = phase - phaseInt;
        waveSample += (wave[index + 1] - waveSample) * phaseRatio;
        sample += (waveSample - sample) * pitchRelativefilter;
        var feedback = filterResonance + filterResonance / (1.0 - filter1);
        filterSample0 += filter1 * (sample - filterSample0 + feedback * (filterSample0 - filterSample1));
        filterSample1 += filter2 * (filterSample0 - filterSample1);
        phase += phaseDelta;
        filter1 *= filterScale1;
        filter2 *= filterScale2;
        phaseDelta *= phaseDeltaScale;
        var output = filterSample1 * volume;
        volume += volumeDelta;
        data[stereoBufferIndex] += output * stereoVolume1;
        data[(stereoBufferIndex + stereoDelay) % stereoBufferLength] += output * stereoVolume2;
        stereoBufferIndex += 2;
    },
    tone: .phases[0] = phase / SynthConfig_1.Config.chipNoiseLength,
    tone: .sample = sample,
    const: epsilon, number:  = (1.0e-24),
    if: function () { } } - epsilon < filterSample0 && filterSample0 < epsilon;
filterSample0 = 0.0;
if (-epsilon < filterSample1 && filterSample1 < epsilon)
    filterSample1 = 0.0;
tone.filterSample0 = filterSample0;
tone.filterSample1 = filterSample1;
drumsetSynth(synth, Synth, data, Float32Array, stereoBufferIndex, number, stereoBufferLength, number, runLength, number, tone, Tone, instrument, Instrument);
void {
    let: wave, Float32Array:  = instrument.getDrumsetWave(tone.drumsetPitch),
    let: phaseDelta, number:  = tone.phaseDeltas[0] / Instrument.drumsetIndexReferenceDelta(tone.drumsetPitch),
    const: phaseDeltaScale, number:  = +tone.phaseDeltaScale,
    let: volume, number:  = +tone.volumeStart,
    const: volumeDelta, number:  = +tone.volumeDelta,
    let: sample, number:  = +tone.sample,
    let: filter1, number:  = +tone.filter,
    let: filter2, number:  = instrument.getFilterIsFirstOrder() ? 1.0 : filter1,
    const: filterScale1, number:  = +tone.filterScale,
    const: filterScale2, number:  = instrument.getFilterIsFirstOrder() ? 1.0 : filterScale1,
    const: filterResonance = SynthConfig_1.Config.filterMaxResonance * Math.pow(Math.max(0, instrument.getFilterResonance() - 1) / (SynthConfig_1.Config.filterResonanceRange - 2), 0.5),
    let: filterSample0, number:  = +tone.filterSample0,
    let: filterSample1, number:  = +tone.filterSample1,
    let: phase, number:  = (tone.phases[0] % 1) * SynthConfig_1.Config.chipNoiseLength,
    // Zero phase means the tone was reset, just give noise a random start phase instead.
    if: function (tone, phases) {
        if (phases === void 0) { phases = [0] == 0; }
    }, phase:  = Synth.findRandomZeroCrossing(wave) + phaseDelta,
    const: stopIndex, number:  = stereoBufferIndex + runLength,
    stereoBufferIndex:  += tone.stereoOffset,
    const: stereoVolume1, number:  = tone.stereoVolume1,
    const: stereoVolume2, number:  = tone.stereoVolume2,
    const: stereoDelay, number:  = tone.stereoDelay,
    while: function (stereoBufferIndex) {
        if (stereoBufferIndex === void 0) { stereoBufferIndex = ; }
        var phaseInt = phase | 0;
        var index = phaseInt & 0x7fff;
        sample = wave[index];
        var phaseRatio = phase - phaseInt;
        sample += (wave[index + 1] - sample) * phaseRatio;
        var feedback = filterResonance + filterResonance / (1.0 - filter1);
        filterSample0 += filter1 * (sample - filterSample0 + feedback * (filterSample0 - filterSample1));
        filterSample1 += filter2 * (filterSample0 - filterSample1);
        phase += phaseDelta;
        filter1 *= filterScale1;
        filter2 *= filterScale2;
        phaseDelta *= phaseDeltaScale;
        var output = filterSample1 * volume;
        volume += volumeDelta;
        data[stereoBufferIndex] += output * stereoVolume1;
        data[(stereoBufferIndex + stereoDelay) % stereoBufferLength] += output * stereoVolume2;
        stereoBufferIndex += 2;
    },
    tone: .phases[0] = phase / SynthConfig_1.Config.chipNoiseLength,
    tone: .sample = sample,
    const: epsilon, number:  = (1.0e-24),
    if: function () { } } - epsilon < filterSample0 && filterSample0 < epsilon;
filterSample0 = 0.0;
if (-epsilon < filterSample1 && filterSample1 < epsilon)
    filterSample1 = 0.0;
tone.filterSample0 = filterSample0;
tone.filterSample1 = filterSample1;
findRandomZeroCrossing(wave, Float32Array);
number;
{
    var phase = Math.random() * SynthConfig_1.Config.chipNoiseLength;
    // Spectrum and drumset waves sounds best when they start at a zero crossing,
    // otherwise they pop. Try to find a zero crossing.
    var indexPrev = phase & 0x7fff;
    var wavePrev = wave[indexPrev];
    var stride = 16;
    for (var attemptsRemaining = 128; attemptsRemaining > 0; attemptsRemaining--) {
        var indexNext = (indexPrev + stride) & 0x7fff;
        var waveNext = wave[indexNext];
        if (wavePrev * waveNext <= 0.0) {
            // Found a zero crossing! Now let's narrow it down to two adjacent sample indices.
            for (var i = 0; i < 16; i++) {
                var innerIndexNext = (indexPrev + 1) & 0x7fff;
                var innerWaveNext = wave[innerIndexNext];
                if (wavePrev * innerWaveNext <= 0.0) {
                    // Found the zero crossing again! Now let's find the exact intersection.
                    var slope = innerWaveNext - wavePrev;
                    phase = indexPrev;
                    if (Math.abs(slope) > 0.00000001) {
                        phase += -wavePrev / slope;
                    }
                    phase = Math.max(0, phase) % SynthConfig_1.Config.chipNoiseLength;
                    break;
                }
                else {
                    indexPrev = innerIndexNext;
                    wavePrev = innerWaveNext;
                }
            }
            break;
        }
        else {
            indexPrev = indexNext;
            wavePrev = waveNext;
        }
    }
    return phase;
}
instrumentVolumeToVolumeMult(instrumentVolume, number);
number;
{
    return (instrumentVolume == SynthConfig_1.Config.volumeRange - 1) ? 0.0 : Math.pow(2, SynthConfig_1.Config.volumeLogScale * instrumentVolume);
}
volumeMultToInstrumentVolume(volumeMult, number);
number;
{
    return (volumeMult <= 0.0) ? SynthConfig_1.Config.volumeRange - 1 : Math.min(SynthConfig_1.Config.volumeRange - 2, (Math.log(volumeMult) / Math.LN2) / SynthConfig_1.Config.volumeLogScale);
}
expressionToVolumeMult(expression, number);
number;
{
    return Math.pow(Math.max(0.0, expression) / 3.0, 1.5);
}
volumeMultToExpression(volumeMult, number);
number;
{
    return Math.pow(Math.max(0.0, volumeMult), 1 / 1.5) * 3.0;
}
getSamplesPerTick();
number;
{
    if (this.song == null)
        return 0;
    var beatsPerMinute = this.song.getBeatsPerMinute();
    var beatsPerSecond = beatsPerMinute / 60.0;
    var partsPerSecond = SynthConfig_1.Config.partsPerBeat * beatsPerSecond;
    var tickPerSecond = SynthConfig_1.Config.ticksPerPart * partsPerSecond;
    return this.samplesPerSecond / tickPerSecond;
}
// When compiling synth.ts as a standalone module named "beepbox", expose these classes as members to JavaScript:
var _a;
//}
