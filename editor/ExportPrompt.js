// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var SynthConfig_1 = require("../synth/SynthConfig");
var synth_1 = require("../synth/synth");
var ColorConfig_1 = require("./ColorConfig");
var EditorConfig_1 = require("./EditorConfig");
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
var ArrayBufferWriter_1 = require("./ArrayBufferWriter");
var Midi_1 = require("./Midi");
//namespace beepbox {
var button = elements_strict_1.HTML.button, div = elements_strict_1.HTML.div, h2 = elements_strict_1.HTML.h2, input = elements_strict_1.HTML.input, select = elements_strict_1.HTML.select, option = elements_strict_1.HTML.option;
function lerp(low, high, t) {
    return low + t * (high - low);
}
function save(blob, name) {
    if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, name);
        return;
    }
    var anchor = document.createElement("a");
    if (anchor.download != undefined) {
        var url = URL.createObjectURL(blob);
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
        anchor.href = url;
        anchor.download = name;
        // Chrome bug regression: We need to delay dispatching the click
        // event. Seems to be related to going back in the browser history.
        // https://bugs.chromium.org/p/chromium/issues/detail?id=825100
        setTimeout(function () { anchor.dispatchEvent(new MouseEvent("click")); }, 0);
    }
    else {
        var url = URL.createObjectURL(blob);
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
        if (!window.open(url, "_blank"))
            window.location.href = url;
    }
}
var ExportPrompt = (function () {
    function ExportPrompt(_doc) {
        var _this = this;
        this._doc = _doc;
        this.readonly = _fileName;
        this.HTMLInputElement = input({ type: "text", style: "width: 10em;", value: "BeepBox-Song", maxlength: 250, "autofocus": "autofocus" });
        this.readonly = _enableIntro;
        this.HTMLInputElement = input({ type: "checkbox" });
        this.readonly = _loopDropDown;
        this.HTMLInputElement = input({ style: "width: 2em;", type: "number", min: "1", max: "4", step: "1" });
        this.readonly = _enableOutro;
        this.HTMLInputElement = input({ type: "checkbox" });
        this.readonly = _formatSelect;
        this.HTMLSelectElement = select({ style: "width: 100%;" }, option({ value: "wav" }, "Export to .wav file."), option({ value: "mp3" }, "Export to .mp3 file."), option({ value: "midi" }, "Export to .mid file."), option({ value: "json" }, "Export to .json file."));
        this.readonly = _cancelButton;
        this.HTMLButtonElement = button({ class: "cancelButton" });
        this.readonly = _exportButton;
        this.HTMLButtonElement = button({ class: "exportButton", style: "width:45%;" }, "Export");
        this.number = (_a = [
            0x4A,
            0x47,
            0x50,
            0x46,
            0x46,
            0x44,
            0x44,
            0x51,
            0x51,
            0x51,
            0x51,
            0x51,
            0x51,
        ], _a);
        this.number = (_b = [
            0x21,
            0x2E,
            0x2E,
            0x06,
            0x06,
            0x18,
            0x18,
            0x19,
            0x19,
            0x19,
            0x19,
            0x6A,
            0x6A,
        ], _b);
        this.readonly = container;
        this.HTMLDivElement = div({ class: "prompt noSelection", style: "width: 200px;" }, h2("Export Options"), div({ style: "display: flex; flex-direction: row; align-items: center; justify-content: space-between;" }, "File name:", this._fileName), div({ style: "display: table; width: 100%;" }, div({ style: "display: table-row;" }, div({ style: "display: table-cell;" }, "Intro:"), div({ style: "display: table-cell;" }, "Loop Count:"), div({ style: "display: table-cell;" }, "Outro:")), div({ style: "display: table-row;" }, div({ style: "display: table-cell; vertical-align: middle;" }, this._enableIntro), div({ style: "display: table-cell; vertical-align: middle;" }, this._loopDropDown), div({ style: "display: table-cell; vertical-align: middle;" }, this._enableOutro))), div({ class: "selectContainer", style: "width: 100%;" }, this._formatSelect), div({ style: "text-align: left;" }, "(Be patient, exporting may take some time...)"), div({ style: "display: flex; flex-direction: row-reverse; justify-content: space-between;" }, this._exportButton), this._cancelButton);
        this._close = function () {
            _this._doc.undo();
        };
        this.cleanUp = function () {
            _this._fileName.removeEventListener("input", ExportPrompt._validateFileName);
            _this._loopDropDown.removeEventListener("blur", ExportPrompt._validateNumber);
            _this._exportButton.removeEventListener("click", _this._export);
            _this._cancelButton.removeEventListener("click", _this._close);
            _this.container.removeEventListener("keydown", _this._whenKeyPressed);
        };
        this._whenKeyPressed = function (event) {
            if (event.target.tagName != "BUTTON" && event.keyCode == 13) {
                _this._export();
            }
        };
        this._export = function () {
            window.localStorage.setItem("exportFormat", _this._formatSelect.value);
            switch (_this._formatSelect.value) {
                case "wav":
                    _this._exportToWav();
                    break;
                case "mp3":
                    _this._exportToMp3();
                    break;
                case "midi":
                    _this._exportToMidi();
                    break;
                case "json":
                    _this._exportToJson();
                    break;
                default:
                    throw new Error("Unhandled file export type.");
            }
        };
        this._loopDropDown.value = "1";
        if (this._doc.song.loopStart == 0) {
            this._enableIntro.checked = false;
            this._enableIntro.disabled = true;
        }
        else {
            this._enableIntro.checked = true;
            this._enableIntro.disabled = false;
        }
        if (this._doc.song.loopStart + this._doc.song.loopLength == this._doc.song.barCount) {
            this._enableOutro.checked = false;
            this._enableOutro.disabled = true;
        }
        else {
            this._enableOutro.checked = true;
            this._enableOutro.disabled = false;
        }
        var lastExportFormat = null = window.localStorage.getItem("exportFormat");
        if (lastExportFormat != null) {
            this._formatSelect.value = lastExportFormat;
        }
        this._fileName.select();
        setTimeout(function () { return _this._fileName.focus(); });
        this._fileName.addEventListener("input", ExportPrompt._validateFileName);
        this._loopDropDown.addEventListener("blur", ExportPrompt._validateNumber);
        this._exportButton.addEventListener("click", this._export);
        this._cancelButton.addEventListener("click", this._close);
        this.container.addEventListener("keydown", this._whenKeyPressed);
        var _a, _b;
    }
    ExportPrompt._validateFileName = function (event) {
        var input = event.target;
        var deleteChars = /[\+\*\$\?\|\{\}\\\/<>#%!`&'"=:@]/gi;
        if (deleteChars.test(input.value)) {
            var cursorPos = input.selectionStart;
            input.value = input.value.replace(deleteChars, "");
            cursorPos--;
            input.setSelectionRange(cursorPos, cursorPos);
        }
    };
    ExportPrompt._validateNumber = function (event) {
        var input = event.target;
        input.value = Math.floor(Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value)))) + "";
    };
    ExportPrompt.prototype._synthesize = function (sampleRate) {
        var synth = new synth_1.Synth(this._doc.song);
        synth.samplesPerSecond = sampleRate;
        synth.loopRepeatCount = Number(this._loopDropDown.value) - 1;
        if (!this._enableIntro.checked) {
            for (var introIter = 0; introIter < this._doc.song.loopStart; introIter++) {
                synth.nextBar();
            }
        }
        var sampleFrames = Math.ceil(synth.getSamplesPerBar() * synth.getTotalBars(this._enableIntro.checked, this._enableOutro.checked));
        var recordedSamplesL = new Float32Array(sampleFrames);
        var recordedSamplesR = new Float32Array(sampleFrames);
        //const timer: number = performance.now();
        synth.synthesize(recordedSamplesL, recordedSamplesR, sampleFrames);
        //console.log("export timer", (performance.now() - timer) / 1000.0);
        return { recordedSamplesL: recordedSamplesL, recordedSamplesR: recordedSamplesR };
    };
    ExportPrompt.prototype._exportToWav = function () {
        var sampleRate = 48000; // Use professional video editing standard sample rate for .wav file export.
        var _a = this._synthesize(sampleRate), recordedSamplesL = _a.recordedSamplesL, recordedSamplesR = _a.recordedSamplesR;
        var sampleFrames = recordedSamplesL.length;
        var wavChannelCount = 2;
        var bytesPerSample = 2;
        var bitsPerSample = 8 * bytesPerSample;
        var sampleCount = wavChannelCount * sampleFrames;
        var totalFileSize = 44 + sampleCount * bytesPerSample;
        var index = 0;
        var arrayBuffer = new ArrayBuffer(totalFileSize);
        var data = new DataView(arrayBuffer);
        data.setUint32(index, 0x52494646, false);
        index += 4;
        data.setUint32(index, 36 + sampleCount * bytesPerSample, true);
        index += 4; // size of remaining file
        data.setUint32(index, 0x57415645, false);
        index += 4;
        data.setUint32(index, 0x666D7420, false);
        index += 4;
        data.setUint32(index, 0x00000010, true);
        index += 4; // size of following header
        data.setUint16(index, 0x0001, true);
        index += 2; // not compressed
        data.setUint16(index, wavChannelCount, true);
        index += 2; // channel count
        data.setUint32(index, sampleRate, true);
        index += 4; // sample rate
        data.setUint32(index, sampleRate * bytesPerSample * wavChannelCount, true);
        index += 4; // bytes per second
        data.setUint16(index, bytesPerSample * wavChannelCount, true);
        index += 2; // block align
        data.setUint16(index, bitsPerSample, true);
        index += 2; // bits per sample
        data.setUint32(index, 0x64617461, false);
        index += 4;
        data.setUint32(index, sampleCount * bytesPerSample, true);
        index += 4;
        if (bytesPerSample > 1) {
            // usually samples are signed. 
            var range = (1 << (bitsPerSample - 1)) - 1;
            for (var i = 0; i < sampleFrames; i++) {
                var valL = Math.floor(Math.max(-1, Math.min(1, recordedSamplesL[i])) * range);
                var valR = Math.floor(Math.max(-1, Math.min(1, recordedSamplesR[i])) * range);
                if (bytesPerSample == 2) {
                    data.setInt16(index, valL, true);
                    index += 2;
                    data.setInt16(index, valR, true);
                    index += 2;
                }
                else if (bytesPerSample == 4) {
                    data.setInt32(index, valL, true);
                    index += 4;
                    data.setInt32(index, valR, true);
                    index += 4;
                }
                else {
                    throw new Error("unsupported sample size");
                }
            }
        }
        else {
            // 8 bit samples are a special case: they are unsigned.
            for (var i = 0; i < sampleFrames; i++) {
                var valL = Math.floor(Math.max(-1, Math.min(1, recordedSamplesL[i])) * 127 + 128);
                var valR = Math.floor(Math.max(-1, Math.min(1, recordedSamplesR[i])) * 127 + 128);
                data.setUint8(index, valL > 255 ? 255 : (valL < 0 ? 0 : valL));
                index++;
                data.setUint8(index, valR > 255 ? 255 : (valR < 0 ? 0 : valR));
                index++;
            }
        }
        var blob = new Blob([arrayBuffer], { type: "audio/wav" });
        save(blob, this._fileName.value.trim() + ".wav");
        this._close();
    };
    ExportPrompt.prototype._exportToMp3 = function () {
        var _this = this;
        var whenEncoderIsAvailable = function () {
            var sampleRate = 44100; // Use consumer CD standard sample rate for .mp3 export.
            var _a = _this._synthesize(sampleRate), recordedSamplesL = _a.recordedSamplesL, recordedSamplesR = _a.recordedSamplesR;
            var lamejs = window["lamejs"];
            var channelCount = 2;
            var kbps = 192;
            var sampleBlockSize = 1152;
            var mp3encoder = new lamejs.Mp3Encoder(channelCount, sampleRate, kbps);
            var mp3Data = [];
            var left = new Int16Array(recordedSamplesL.length);
            var right = new Int16Array(recordedSamplesR.length);
            var range = (1 << 15) - 1;
            for (var i = 0; i < recordedSamplesL.length; i++) {
                left[i] = Math.floor(Math.max(-1, Math.min(1, recordedSamplesL[i])) * range);
                right[i] = Math.floor(Math.max(-1, Math.min(1, recordedSamplesR[i])) * range);
            }
            for (var i = 0; i < left.length; i += sampleBlockSize) {
                var leftChunk = left.subarray(i, i + sampleBlockSize);
                var rightChunk = right.subarray(i, i + sampleBlockSize);
                var mp3buf_1 = mp3encoder.encodeBuffer(leftChunk, rightChunk);
                if (mp3buf_1.length > 0)
                    mp3Data.push(mp3buf_1);
            }
            var mp3buf = mp3encoder.flush();
            if (mp3buf.length > 0)
                mp3Data.push(mp3buf);
            var blob = new Blob(mp3Data, { type: "audio/mp3" });
            save(blob, _this._fileName.value.trim() + ".mp3");
            _this._close();
        };
        if ("lamejs" in window) {
            whenEncoderIsAvailable();
        }
        else {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/lamejs@1.2.0/lame.min.js";
            script.onload = whenEncoderIsAvailable;
            document.head.appendChild(script);
        }
    };
    ExportPrompt.prototype._exportToMidi = function () {
        var song = this._doc.song;
        var midiTicksPerBeepBoxTick = 2;
        var midiTicksPerBeat = midiTicksPerBeepBoxTick * SynthConfig_1.Config.ticksPerPart * SynthConfig_1.Config.partsPerBeat;
        var midiTicksPerPart = midiTicksPerBeepBoxTick * SynthConfig_1.Config.ticksPerPart;
        var secondsPerMinute = 60;
        var microsecondsPerMinute = secondsPerMinute * 1000000;
        var beatsPerMinute = song.getBeatsPerMinute();
        var microsecondsPerBeat = Math.round(microsecondsPerMinute / beatsPerMinute);
        //const secondsPerMidiTick: number = secondsPerMinute / (midiTicksPerBeat * beatsPerMinute);
        var midiTicksPerBar = midiTicksPerBeat * song.beatsPerBar;
        var pitchBendRange = 24;
        var defaultNoteVelocity = 90;
        var unrolledBars = [];
        if (this._enableIntro.checked) {
            for (var bar = 0; bar < song.loopStart; bar++) {
                unrolledBars.push(bar);
            }
        }
        for (var loopIndex = 0; loopIndex < Number(this._loopDropDown.value); loopIndex++) {
            for (var bar = song.loopStart; bar < song.loopStart + song.loopLength; bar++) {
                unrolledBars.push(bar);
            }
        }
        if (this._enableOutro.checked) {
            for (var bar = song.loopStart + song.loopLength; bar < song.barCount; bar++) {
                unrolledBars.push(bar);
            }
        }
        var tracks = [{ isMeta: true, channel: -1, midiChannel: -1, isNoise: false, isDrumset: false }];
        var midiChannelCounter = 0;
        var foundADrumset = false;
        for (var channel = 0; channel < this._doc.song.getChannelCount(); channel++) {
            if (!foundADrumset && this._doc.song.channels[channel].instruments[0].type == 4 /* drumset */) {
                tracks.push({ isMeta: false, channel: channel, midiChannel: 9, isNoise: true, isDrumset: true });
                foundADrumset = true; // There can only be one drumset channel, and it's always channel 9 (seen as 10 in most UIs). :/
            }
            else {
                if (midiChannelCounter >= 16)
                    continue; // The MIDI standard only supports 16 channels.
                tracks.push({ isMeta: false, channel: channel, midiChannel: midiChannelCounter++, isNoise: this._doc.song.getChannelIsNoise(channel), isDrumset: false });
                if (midiChannelCounter == 9)
                    midiChannelCounter++; // skip midi drum channel.
            }
        }
        var writer = new ArrayBufferWriter_1.ArrayBufferWriter(1024);
        writer.writeUint32(1297377380 /* header */);
        writer.writeUint32(6); // length of headers is 6 bytes
        writer.writeUint16(1 /* simultaneousTracks */);
        writer.writeUint16(tracks.length);
        writer.writeUint16(midiTicksPerBeat); // number of "ticks" per beat, independent of tempo
        for (var _i = 0; _i < tracks.length; _i++) {
            var track = tracks[_i];
            writer.writeUint32(1297379947 /* track */);
            var isMeta = track.isMeta, channel = track.channel, midiChannel = track.midiChannel, isNoise = track.isNoise, isDrumset = track.isDrumset;
            // We're gonna come back here and overwrite this placeholder once we know how many bytes this track is.
            var trackStartIndex = writer.getWriteIndex();
            writer.writeUint32(0); // placeholder for track size
            var prevTime = 0;
            var barStartTime = 0;
            var writeEventTime = function (time) {
                if (time < prevTime)
                    throw new Error("Midi event time cannot go backwards.");
                writer.writeMidiVariableLength(time - prevTime);
                prevTime = time;
            };
            var writeControlEvent = function (message, value) {
                if (!(value >= 0 && value <= 0x7F))
                    throw new Error("Midi control event value out of range: " + value);
                writer.writeUint8(176 /* controlChange */ | midiChannel);
                writer.writeMidi7Bits(message);
                writer.writeMidi7Bits(value | 0);
            };
            if (isMeta) {
                // for first midi track, include tempo, time signature, and key signature information.
                writeEventTime(0);
                writer.writeUint8(255 /* meta */);
                writer.writeMidi7Bits(1 /* text */);
                writer.writeMidiAscii("Composed with https://www.beepbox.co");
                writeEventTime(0);
                writer.writeUint8(255 /* meta */);
                writer.writeMidi7Bits(81 /* tempo */);
                writer.writeMidiVariableLength(3); // Tempo message length is 3 bytes.
                writer.writeUint24(microsecondsPerBeat); // Tempo in microseconds per "quarter" note, commonly known as a "beat"
                writeEventTime(0);
                writer.writeUint8(255 /* meta */);
                writer.writeMidi7Bits(88 /* timeSignature */);
                writer.writeMidiVariableLength(4); // Time signature message length is 4 bytes.
                writer.writeUint8(song.beatsPerBar); // numerator.
                writer.writeUint8(2); // denominator exponent in 2^E. 2^2 = 4, and we will always use "quarter" notes.
                writer.writeUint8(24); // MIDI Clocks per metronome tick (should match beats), standard is 24
                writer.writeUint8(8); // number of 1/32 notes per 24 MIDI Clocks, standard is 8, meaning 24 clocks per "quarter" note.
                var isMinor = SynthConfig_1.Config.scales[song.scale].flags[3] && !SynthConfig_1.Config.scales[song.scale].flags[4];
                var key = song.key; // C=0, C#=1, counting up to B=11
                var numSharps = key; // For even key values in major scale, number of sharps/flats is same...
                if ((key & 1) == 1)
                    numSharps += 6; // For odd key values (consider circle of fifths) rotate around the circle... kinda... Look conventional key signatures are just weird, okay?
                if (isMinor)
                    numSharps += 9; // A minor A scale has zero sharps, shift it appropriately
                while (numSharps > 6)
                    numSharps -= 12; // Range is (modulo 12) - 5. Midi supports -7 to +7, but I only have 12 options.
                writeEventTime(0);
                writer.writeUint8(255 /* meta */);
                writer.writeMidi7Bits(89 /* keySignature */);
                writer.writeMidiVariableLength(2); // Key signature message length is 2 bytes.
                writer.writeInt8(numSharps); // See above calculation. Assumes scale is diatonic. :/
                writer.writeUint8(isMinor ? 1 : 0); // 0: major, 1: minor
                if (this._enableIntro.checked)
                    barStartTime += midiTicksPerBar * song.loopStart;
                writeEventTime(barStartTime);
                writer.writeUint8(255 /* meta */);
                writer.writeMidi7Bits(6 /* marker */);
                writer.writeMidiAscii("Loop Start");
                for (var loopIndex = 0; loopIndex < parseInt(this._loopDropDown.value); loopIndex++) {
                    barStartTime += midiTicksPerBar * song.loopLength;
                    writeEventTime(barStartTime);
                    writer.writeUint8(255 /* meta */);
                    writer.writeMidi7Bits(6 /* marker */);
                    writer.writeMidiAscii(loopIndex < Number(this._loopDropDown.value) - 1 ? "Loop Repeat" : "Loop End");
                }
                if (this._enableOutro.checked)
                    barStartTime += midiTicksPerBar * (song.barCount - song.loopStart - song.loopLength);
                if (barStartTime != midiTicksPerBar * unrolledBars.length)
                    throw new Error("Miscalculated number of bars.");
            }
            else {
                // For remaining tracks, set up the instruments and write the notes:
                var channelName = ColorConfig_1.ColorConfig.getChannelColor(song, channel).name + " channel";
                writeEventTime(0);
                writer.writeUint8(255 /* meta */);
                writer.writeMidi7Bits(3 /* trackName */);
                writer.writeMidiAscii(channelName);
                // This sets up pitch bend range. First we choose the pitch bend RPN (which has MSB and LSB components), then we set the value for that RPN (which also has MSB and LSB components) and finally reset the current RPN to null, which is considered best practice.
                writeEventTime(0);
                writeControlEvent(101 /* registeredParameterNumberMSB */, 0 /* pitchBendRange */);
                writeEventTime(0);
                writeControlEvent(100 /* registeredParameterNumberLSB */, 0 /* pitchBendRange */);
                writeEventTime(0);
                writeControlEvent(6 /* setParameterMSB */, pitchBendRange); // pitch bend semitone range
                writeEventTime(0);
                writeControlEvent(38 /* setParameterLSB */, 0); // pitch bend cent range
                writeEventTime(0);
                writeControlEvent(101 /* registeredParameterNumberMSB */, 127 /* reset */);
                writeEventTime(0);
                writeControlEvent(100 /* registeredParameterNumberLSB */, 127 /* reset */);
                var prevInstrumentIndex = -1;
                function writeInstrumentSettings(instrumentIndex) {
                    var instrument = song.channels[channel].instruments[instrumentIndex];
                    var preset = null = EditorConfig_1.EditorConfig.valueToPreset(instrument.preset);
                    if (prevInstrumentIndex != instrumentIndex) {
                        prevInstrumentIndex = instrumentIndex;
                        writeEventTime(barStartTime);
                        writer.writeUint8(255 /* meta */);
                        writer.writeMidi7Bits(4 /* instrumentName */);
                        writer.writeMidiAscii("Instrument " + (instrumentIndex + 1));
                        if (!isDrumset) {
                            var instrumentProgram = 81; // default to sawtooth wave. 
                            if (preset != null && preset.midiProgram != undefined) {
                                instrumentProgram = preset.midiProgram;
                            }
                            else if (instrument.type == 4 /* drumset */) {
                                // The first BeepBox drumset channel is handled as a Midi drumset channel and doesn't need a program, but any subsequent drumsets will just be set to taiko.
                                instrumentProgram = 116; // taiko
                            }
                            else {
                                var envelopeType = instrument.getFilterEnvelope().type;
                                var instrumentDecays = envelopeType == 8 /* decay */ || envelopeType == 4 /* twang */;
                                if (instrument.type == 2 /* noise */ || instrument.type == 3 /* spectrum */) {
                                    if (isNoise) {
                                        instrumentProgram = 116; // taiko
                                    }
                                    else {
                                        instrumentProgram = instrumentDecays ? 47 : 75; // timpani : pan flute
                                    }
                                }
                                else if (instrument.type == 0 /* chip */) {
                                    var filterInstruments = instrumentDecays
                                        ? ExportPrompt.midiDecayInstruments
                                        : ExportPrompt.midiSustainInstruments;
                                    if (filterInstruments.length > instrument.chipWave) {
                                        instrumentProgram = filterInstruments[instrument.chipWave];
                                    }
                                }
                                else if (instrument.type == 6 /* pwm */) {
                                    instrumentProgram = instrumentDecays ? 0x19 : 81; // steel guitar : sawtooth
                                }
                                else if (instrument.type == 1 /* fm */ || instrument.type == 5 /* harmonics */) {
                                    instrumentProgram = instrumentDecays ? 2 : 81; // electric grand : sawtooth
                                }
                                else {
                                    throw new Error("Unrecognized instrument type.");
                                }
                            }
                            // Program (instrument) change event:
                            writeEventTime(barStartTime);
                            writer.writeUint8(192 /* programChange */ | midiChannel);
                            writer.writeMidi7Bits(instrumentProgram);
                        }
                        // Instrument volume:
                        writeEventTime(barStartTime);
                        var instrumentVolume = Midi_1.volumeMultToMidiVolume(synth_1.Synth.instrumentVolumeToVolumeMult(instrument.volume));
                        writeControlEvent(7 /* volumeMSB */, Math.min(0x7f, Math.round(instrumentVolume)));
                        // Instrument pan:
                        writeEventTime(barStartTime);
                        var instrumentPan = (instrument.pan / SynthConfig_1.Config.panCenter - 1) * 0x3f + 0x40;
                        writeControlEvent(10 /* panMSB */, Math.min(0x7f, Math.round(instrumentPan)));
                    }
                }
                if (song.getPattern(channel, 0) == null) {
                    // Go ahead and apply the instrument settings at the beginning of the channel
                    // even if a bar doesn't kick in until later.
                    writeInstrumentSettings(0);
                }
                var prevPitchBend = Midi_1.defaultMidiPitchBend;
                var prevExpression = Midi_1.defaultMidiExpression;
                var shouldResetExpressionAndPitchBend = false;
                //let prevTremolo: number = -1;
                var channelRoot = isNoise ? SynthConfig_1.Config.spectrumBasePitch : SynthConfig_1.Config.keys[song.key].basePitch;
                var intervalScale = isNoise ? SynthConfig_1.Config.noiseInterval : 1;
                for (var _a = 0; _a < unrolledBars.length; _a++) {
                    var bar = unrolledBars[_a];
                    var pattern = null = song.getPattern(channel, bar);
                    if (pattern != null) {
                        var instrumentIndex = pattern.instrument;
                        var instrument = song.channels[channel].instruments[instrumentIndex];
                        var preset = null = EditorConfig_1.EditorConfig.valueToPreset(instrument.preset);
                        writeInstrumentSettings(instrumentIndex);
                        var chordHarmonizes = false;
                        var usesArpeggio = true;
                        var polyphony = 1;
                        chordHarmonizes = instrument.getChord().harmonizes;
                        usesArpeggio = instrument.getChord().arpeggiates;
                        if (usesArpeggio) {
                            if (chordHarmonizes) {
                                if (instrument.type == 0 /* chip */) {
                                    polyphony = 2;
                                }
                                else if (instrument.type == 1 /* fm */) {
                                    polyphony = SynthConfig_1.Config.operatorCount;
                                }
                                else {
                                    console.error("Unrecognized instrument type for harmonizing arpeggio: " + instrument.type);
                                }
                            }
                        }
                        else {
                            polyphony = SynthConfig_1.Config.maxChordSize;
                        }
                        for (var noteIndex = 0; noteIndex < pattern.notes.length; noteIndex++) {
                            var note = pattern.notes[noteIndex];
                            var noteStartTime = barStartTime + note.start * midiTicksPerPart;
                            var pinTime = noteStartTime;
                            var pinVolume = note.pins[0].volume;
                            var pinInterval = note.pins[0].interval;
                            var prevPitches = [-1, -1, -1, -1];
                            var nextPitches = [-1, -1, -1, -1];
                            var toneCount = Math.min(polyphony, note.pitches.length);
                            var velocity = isDrumset ? Math.max(1, Math.round(defaultNoteVelocity * note.pins[0].volume / 3)) : defaultNoteVelocity;
                            // The maximum midi pitch bend range is +/- 24 semitones from the base pitch. 
                            // To make the most of this, choose a base pitch that is within 24 semitones from as much of the note as possible.
                            // This may involve offsetting this base pitch from BeepBox's note pitch.
                            var mainInterval = note.pickMainInterval();
                            var pitchOffset = mainInterval * intervalScale;
                            if (!isDrumset) {
                                var maxPitchOffset = pitchBendRange;
                                var minPitchOffset = -pitchBendRange;
                                for (var pinIndex = 1; pinIndex < note.pins.length; pinIndex++) {
                                    var interval = note.pins[pinIndex].interval * intervalScale;
                                    maxPitchOffset = Math.min(maxPitchOffset, interval + pitchBendRange);
                                    minPitchOffset = Math.max(minPitchOffset, interval - pitchBendRange);
                                }
                                /*
                                // I'd like to be able to use pitch bend to implement arpeggio, but the "custom inverval" setting in chip instruments combines arpeggio in one tone with another flat tone, and midi can't selectively apply arpeggio to one out of two simultaneous tones. Also it would be hard to reimport. :/
                                if (usesArpeggio && note.pitches.length > polyphony) {
                                    let lowestArpeggioOffset: number = 0;
                                    let highestArpeggioOffset: number = 0;
                                    const basePitch: number = note.pitches[toneCount - 1];
                                    for (let pitchIndex: number = toneCount; pitchIndex < note.pitches.length; pitchIndex++) {
                                        lowestArpeggioOffset = Math.min(note.pitches[pitchIndex] - basePitch);
                                        highestArpeggioOffset = Math.max(note.pitches[pitchIndex] - basePitch);
                                    }
                                    maxPitchOffset -= lowestArpeggioOffset;
                                    minPitchOffset += lowestArpeggioOffset;
                                }
                                */
                                pitchOffset = Math.min(maxPitchOffset, Math.max(minPitchOffset, pitchOffset));
                            }
                            for (var pinIndex = 1; pinIndex < note.pins.length; pinIndex++) {
                                var nextPinTime = noteStartTime + note.pins[pinIndex].time * midiTicksPerPart;
                                var nextPinVolume = note.pins[pinIndex].volume;
                                var nextPinInterval = note.pins[pinIndex].interval;
                                var length_1 = nextPinTime - pinTime;
                                for (var midiTick = 0; midiTick < length_1; midiTick++) {
                                    var midiTickTime = pinTime + midiTick;
                                    var linearVolume = lerp(pinVolume, nextPinVolume, midiTick / length_1);
                                    var linearInterval = lerp(pinInterval, nextPinInterval, midiTick / length_1);
                                    var interval = linearInterval * intervalScale - pitchOffset;
                                    var pitchBend = Math.max(0, Math.min(0x3fff, Math.round(0x2000 * (1.0 + interval / pitchBendRange))));
                                    var expression = Math.min(0x7f, Math.round(Midi_1.volumeMultToMidiExpression(synth_1.Synth.expressionToVolumeMult(linearVolume))));
                                    if (pitchBend != prevPitchBend) {
                                        writeEventTime(midiTickTime);
                                        writer.writeUint8(224 /* pitchBend */ | midiChannel);
                                        writer.writeMidi7Bits(pitchBend & 0x7f); // least significant bits
                                        writer.writeMidi7Bits((pitchBend >> 7) & 0x7f); // most significant bits
                                        prevPitchBend = pitchBend;
                                    }
                                    if (expression != prevExpression && !isDrumset) {
                                        writeEventTime(midiTickTime);
                                        writeControlEvent(11 /* expressionMSB */, expression);
                                        prevExpression = expression;
                                    }
                                    var noteStarting = midiTickTime == noteStartTime;
                                    for (var toneIndex = 0; toneIndex < toneCount; toneIndex++) {
                                        var nextPitch = note.pitches[toneIndex];
                                        if (isDrumset) {
                                            nextPitch += mainInterval;
                                            var drumsetMap = [
                                                36,
                                                41,
                                                45,
                                                48,
                                                40,
                                                39,
                                                59,
                                                49,
                                                46,
                                                55,
                                                69,
                                                54,
                                            ];
                                            if (nextPitch < 0 || nextPitch >= drumsetMap.length)
                                                throw new Error("Could not find corresponding drumset pitch. " + nextPitch);
                                            nextPitch = drumsetMap[nextPitch];
                                        }
                                        else {
                                            if (usesArpeggio && note.pitches.length > toneIndex + 1 && toneIndex == toneCount - 1) {
                                                var midiTicksSinceBeat = (midiTickTime - barStartTime) % midiTicksPerBeat;
                                                var midiTicksPerArpeggio = SynthConfig_1.Config.rhythms[song.rhythm].ticksPerArpeggio * midiTicksPerPart / SynthConfig_1.Config.ticksPerPart;
                                                var arpeggio = Math.floor(midiTicksSinceBeat / midiTicksPerArpeggio);
                                                nextPitch = note.pitches[toneIndex + SynthConfig_1.getArpeggioPitchIndex(note.pitches.length - toneIndex, song.rhythm, arpeggio)];
                                            }
                                            nextPitch = channelRoot + nextPitch * intervalScale + pitchOffset;
                                            if (preset != null && preset.midiSubharmonicOctaves != undefined) {
                                                nextPitch += 12 * preset.midiSubharmonicOctaves;
                                            }
                                            else if (isNoise) {
                                                nextPitch += 12 * (+EditorConfig_1.EditorConfig.presetCategories.dictionary["Drum Presets"].presets.dictionary["taiko drum"].midiSubharmonicOctaves);
                                                !;
                                                ;
                                            }
                                            if (isNoise)
                                                nextPitch *= 2;
                                        }
                                        nextPitch = Math.max(0, Math.min(127, nextPitch));
                                        nextPitches[toneIndex] = nextPitch;
                                        if (!noteStarting && prevPitches[toneIndex] != nextPitches[toneIndex]) {
                                            writeEventTime(midiTickTime);
                                            writer.writeUint8(128 /* noteOff */ | midiChannel);
                                            writer.writeMidi7Bits(prevPitches[toneIndex]); // old pitch
                                            writer.writeMidi7Bits(velocity); // velocity
                                        }
                                    }
                                    for (var toneIndex = 0; toneIndex < toneCount; toneIndex++) {
                                        if (noteStarting || prevPitches[toneIndex] != nextPitches[toneIndex]) {
                                            writeEventTime(midiTickTime);
                                            writer.writeUint8(144 /* noteOn */ | midiChannel);
                                            writer.writeMidi7Bits(nextPitches[toneIndex]); // new pitch
                                            writer.writeMidi7Bits(velocity); // velocity
                                            prevPitches[toneIndex] = nextPitches[toneIndex];
                                        }
                                    }
                                }
                                pinTime = nextPinTime;
                                pinVolume = nextPinVolume;
                                pinInterval = nextPinInterval;
                            }
                            var noteEndTime = barStartTime + note.end * midiTicksPerPart;
                            // End all tones.
                            for (var toneIndex = 0; toneIndex < toneCount; toneIndex++) {
                                writeEventTime(noteEndTime);
                                writer.writeUint8(128 /* noteOff */ | midiChannel);
                                writer.writeMidi7Bits(prevPitches[toneIndex]); // pitch
                                writer.writeMidi7Bits(velocity); // velocity
                            }
                            shouldResetExpressionAndPitchBend = true;
                        }
                    }
                    else {
                        if (shouldResetExpressionAndPitchBend) {
                            shouldResetExpressionAndPitchBend = false;
                            if (prevExpression != Midi_1.defaultMidiExpression) {
                                prevExpression = Midi_1.defaultMidiExpression;
                                // Reset expression
                                writeEventTime(barStartTime);
                                writeControlEvent(11 /* expressionMSB */, prevExpression);
                            }
                            if (prevPitchBend != Midi_1.defaultMidiPitchBend) {
                                // Reset pitch bend
                                prevPitchBend = Midi_1.defaultMidiPitchBend;
                                writeEventTime(barStartTime);
                                writer.writeUint8(224 /* pitchBend */ | midiChannel);
                                writer.writeMidi7Bits(prevPitchBend & 0x7f); // least significant bits
                                writer.writeMidi7Bits((prevPitchBend >> 7) & 0x7f); // most significant bits
                            }
                        }
                    }
                    barStartTime += midiTicksPerBar;
                }
            }
            writeEventTime(barStartTime);
            writer.writeUint8(255 /* meta */);
            writer.writeMidi7Bits(47 /* endOfTrack */);
            writer.writeMidiVariableLength(0x00);
            // Finally, write the length of the track in bytes at the front of the track.
            writer.rewriteUint32(trackStartIndex, writer.getWriteIndex() - trackStartIndex - 4);
        }
        var blob = new Blob([writer.toCompactArrayBuffer()], { type: "audio/midi" });
        save(blob, this._fileName.value.trim() + ".mid");
        this._close();
    };
    ExportPrompt.prototype._exportToJson = function () {
        var jsonObject = this._doc.song.toJsonObject(this._enableIntro.checked, Number(this._loopDropDown.value), this._enableOutro.checked);
        var jsonString = JSON.stringify(jsonObject, null, '\t');
        var blob = new Blob([jsonString], { type: "application/json" });
        save(blob, this._fileName.value.trim() + ".json");
        this._close();
    };
    ExportPrompt.readonly = midiSustainInstruments;
    ExportPrompt.readonly = midiDecayInstruments;
    return ExportPrompt;
})();
exports.ExportPrompt = ExportPrompt;
//}
