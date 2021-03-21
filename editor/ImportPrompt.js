// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SynthConfig_1 = require("../synth/SynthConfig");
var synth_1 = require("../synth/synth");
var EditorConfig_1 = require("./EditorConfig");
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
var Change_1 = require("./Change");
var changes_1 = require("./changes");
var Midi_1 = require("./Midi");
var ArrayBufferReader_1 = require("./ArrayBufferReader");
//namespace beepbox {
var button = elements_strict_1.HTML.button, p = elements_strict_1.HTML.p, div = elements_strict_1.HTML.div, h2 = elements_strict_1.HTML.h2, input = elements_strict_1.HTML.input;
var ImportPrompt = (function () {
    function ImportPrompt(_doc) {
        var _this = this;
        this._doc = _doc;
        this.readonly = _fileInput;
        this.HTMLInputElement = input({ type: "file", accept: ".json,application/json,.mid,.midi,audio/midi,audio/x-midi" });
        this.readonly = _cancelButton;
        this.HTMLButtonElement = button({ class: "cancelButton" });
        this.readonly = container;
        this.HTMLDivElement = div({ class: "prompt noSelection", style: "width: 300px;" }, h2("Import"), p({ style: "text-align: left; margin: 0.5em 0;" }, "BeepBox songs can be exported and re-imported as .json files. You could also use other means to make .json files for BeepBox as long as they follow the same structure."), p({ style: "text-align: left; margin: 0.5em 0;" }, "BeepBox can also (crudely) import .mid files. There are many tools available for creating .mid files. Shorter and simpler songs are more likely to work well."), this._fileInput, this._cancelButton);
        this._close = function () {
            _this._doc.undo();
        };
        this.cleanUp = function () {
            _this._fileInput.removeEventListener("change", _this._whenFileSelected);
            _this._cancelButton.removeEventListener("click", _this._close);
        };
        this._whenFileSelected = function () {
            var file = _this._fileInput.files;
            ![0];
            if (!file)
                return;
            var extension = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2);
            if (extension == "json") {
                var reader = new FileReader();
                reader.addEventListener("load", function (event) {
                    _this._doc.prompt = null;
                    _this._doc.goBackToStart();
                    _this._doc.record(new changes_1.ChangeSong(_this._doc, reader.result), true, true);
                });
                reader.readAsText(file);
            }
            else if (extension == "midi" || extension == "mid") {
                var reader = new FileReader();
                reader.addEventListener("load", function (event) {
                    _this._doc.prompt = null;
                    _this._doc.goBackToStart();
                    _this._parseMidiFile(reader.result);
                });
                reader.readAsArrayBuffer(file);
            }
            else {
                console.error("Unrecognized file extension.");
                _this._close();
            }
        };
        this._fileInput.select();
        setTimeout(function () { return _this._fileInput.focus(); });
        this._fileInput.addEventListener("change", this._whenFileSelected);
        this._cancelButton.addEventListener("click", this._close);
    }
    ImportPrompt.prototype._parseMidiFile = function (buffer) {
        // First, split the file into separate buffer readers for each chunk. There should be one header chunk and one or more track chunks.
        var reader = new ArrayBufferReader_1.ArrayBufferReader(new DataView(buffer));
        var headerReader = null = null;
        var tracks = [];
        while (reader.hasMore()) {
            var chunkType = reader.readUint32();
            var chunkLength = reader.readUint32();
            if (chunkType == 1297377380 /* header */) {
                if (headerReader == null) {
                    headerReader = reader.getReaderForNextBytes(chunkLength);
                }
                else {
                    console.error("This MIDI file has more than one header chunk.");
                }
            }
            else if (chunkType == 1297379947 /* track */) {
                var trackReader = reader.getReaderForNextBytes(chunkLength);
                if (trackReader.hasMore()) {
                    tracks.push({
                        reader: trackReader,
                        nextEventMidiTick: trackReader.readMidiVariableLength(),
                        ended: false,
                        runningStatus: -1
                    });
                }
            }
            else {
                // Unknown chunk type. Skip it.
                reader.skipBytes(chunkLength);
            }
        }
        if (headerReader == null) {
            console.error("No header chunk found in this MIDI file.");
            this._close();
            return;
        }
        var fileFormat = headerReader.readUint16();
        /*const trackCount: number =*/ headerReader.readUint16();
        var midiTicksPerBeat = headerReader.readUint16();
        // Midi tracks are generally intended to be played in parallel, but in the format
        // MidiFileFormat.independentTracks, they are played in sequence. Make a list of all
        // of the track indices that should be played in parallel (one or all of the tracks).
        var currentIndependentTrackIndex = 0;
        var currentTrackIndices = [];
        var independentTracks = (fileFormat == 2 /* independentTracks */);
        if (independentTracks) {
            currentTrackIndices.push(currentIndependentTrackIndex);
        }
        else {
            for (var trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
                currentTrackIndices.push(trackIndex);
            }
        }
        // To read a MIDI file we have to simulate state changing over time.
        // Keep a record of various parameters for each channel that may
        // change over time, initialized to default values.
        // Consider making a MidiChannel class and single array of midiChannels.
        var channelRPNMSB = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff];
        var channelRPNLSB = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff];
        var pitchBendRangeMSB = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]; // pitch bend range defaults to 2 semitones.
        var pitchBendRangeLSB = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // and 0 cents.
        var currentInstrumentProgram = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var currentInstrumentVolumes = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
        var currentInstrumentPans = [64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64];
        var noteEvents = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
        var pitchBendEvents = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
        var expressionEvents = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
        var microsecondsPerBeat = 500000; // Tempo in microseconds per "quarter" note, commonly known as a "beat", default is equivalent to 120 beats per minute.
        var beatsPerBar = 8;
        var numSharps = 0;
        var isMinor = false;
        // Progress in time through all tracks (in parallel or in sequence) recording state changes and events until all tracks have ended.
        var currentMidiTick = 0;
        while (true) {
            var nextEventMidiTick = Number.MAX_VALUE;
            var anyTrackHasMore = false;
            for (var _i = 0; _i < currentTrackIndices.length; _i++) {
                var trackIndex = currentTrackIndices[_i];
                // Parse any events in this track that occur at the currentMidiTick.
                var track = tracks[trackIndex];
                while (!track.ended && track.nextEventMidiTick == currentMidiTick) {
                    // If the most significant bit is set in the first byte
                    // of the event, it's a new event status, otherwise
                    // reuse the running status and save the next byte for
                    // the content of the event. I'm assuming running status
                    // is separate for each track.
                    var peakStatus = track.reader.peakUint8();
                    var eventStatus = (peakStatus & 0x80) ? track.reader.readUint8() : track.runningStatus;
                    var eventType = eventStatus & 0xF0;
                    var eventChannel = eventStatus & 0x0F;
                    if (eventType != 240 /* metaAndSysex */) {
                        track.runningStatus = eventStatus;
                    }
                    var foundTrackEndEvent = false;
                    switch (eventType) {
                        case 128 /* noteOff */:
                            {
                                var pitch = track.reader.readMidi7Bits();
                                /*const velocity: number =*/ track.reader.readMidi7Bits();
                                noteEvents[eventChannel].push({ midiTick: currentMidiTick, pitch: pitch, velocity: 0.0, program: -1, instrumentVolume: -1, instrumentPan: -1, on: false });
                            }
                            break;
                        case 144 /* noteOn */:
                            {
                                var pitch = track.reader.readMidi7Bits();
                                var velocity = track.reader.readMidi7Bits();
                                if (velocity == 0) {
                                    noteEvents[eventChannel].push({ midiTick: currentMidiTick, pitch: pitch, velocity: 0.0, program: -1, instrumentVolume: -1, instrumentPan: -1, on: false });
                                }
                                else {
                                    var volume = Math.max(0, Math.min(SynthConfig_1.Config.volumeRange - 1, Math.round(synth_1.Synth.volumeMultToInstrumentVolume(Midi_1.midiVolumeToVolumeMult(currentInstrumentVolumes[eventChannel])))));
                                    var pan = Math.max(0, Math.min(SynthConfig_1.Config.panMax, Math.round(((currentInstrumentPans[eventChannel] - 64) / 63 + 1) * SynthConfig_1.Config.panCenter)));
                                    noteEvents[eventChannel].push({
                                        midiTick: currentMidiTick,
                                        pitch: pitch,
                                        velocity: Math.max(0.0, Math.min(1.0, (velocity + 14) / 90.0)),
                                        program: currentInstrumentProgram[eventChannel],
                                        instrumentVolume: volume,
                                        instrumentPan: pan,
                                        on: true
                                    });
                                }
                            }
                            break;
                        case 160 /* keyPressure */:
                            {
                                /*const pitch: number =*/ track.reader.readMidi7Bits();
                                /*const pressure: number =*/ track.reader.readMidi7Bits();
                            }
                            break;
                        case 176 /* controlChange */:
                            {
                                var message = track.reader.readMidi7Bits();
                                var value = track.reader.readMidi7Bits();
                                //console.log("Control change, message:", message, "value:", value);
                                switch (message) {
                                    case 6 /* setParameterMSB */:
                                        {
                                            if (channelRPNMSB[eventChannel] == 0 /* pitchBendRange */ && channelRPNLSB[eventChannel] == 0 /* pitchBendRange */) {
                                                pitchBendRangeMSB[eventChannel] = value;
                                            }
                                        }
                                        break;
                                    case 7 /* volumeMSB */:
                                        {
                                            currentInstrumentVolumes[eventChannel] = value;
                                        }
                                        break;
                                    case 10 /* panMSB */:
                                        {
                                            currentInstrumentPans[eventChannel] = value;
                                        }
                                        break;
                                    case 11 /* expressionMSB */:
                                        {
                                            expressionEvents[eventChannel].push({ midiTick: currentMidiTick, volume: synth_1.Synth.volumeMultToExpression(Midi_1.midiExpressionToVolumeMult(value)) });
                                        }
                                        break;
                                    case 38 /* setParameterLSB */:
                                        {
                                            if (channelRPNMSB[eventChannel] == 0 /* pitchBendRange */ && channelRPNLSB[eventChannel] == 0 /* pitchBendRange */) {
                                                pitchBendRangeLSB[eventChannel] = value;
                                            }
                                        }
                                        break;
                                    case 100 /* registeredParameterNumberLSB */:
                                        {
                                            channelRPNLSB[eventChannel] = value;
                                        }
                                        break;
                                    case 101 /* registeredParameterNumberMSB */:
                                        {
                                            channelRPNMSB[eventChannel] = value;
                                        }
                                        break;
                                }
                            }
                            break;
                        case 192 /* programChange */:
                            {
                                var program = track.reader.readMidi7Bits();
                                currentInstrumentProgram[eventChannel] = program;
                            }
                            break;
                        case 208 /* channelPressure */:
                            {
                                /*const pressure: number =*/ track.reader.readMidi7Bits();
                            }
                            break;
                        case 224 /* pitchBend */:
                            {
                                var lsb = track.reader.readMidi7Bits();
                                var msb = track.reader.readMidi7Bits();
                                var pitchBend = (((msb << 7) | lsb) / 0x2000) - 1.0;
                                var pitchBendRange = pitchBendRangeMSB[eventChannel] + pitchBendRangeLSB[eventChannel] * 0.01;
                                var interval = pitchBend * pitchBendRange;
                                pitchBendEvents[eventChannel].push({ midiTick: currentMidiTick, interval: interval });
                            }
                            break;
                        case 240 /* metaAndSysex */:
                            {
                                if (eventStatus == 255 /* meta */) {
                                    var message = track.reader.readMidi7Bits();
                                    var length_1 = track.reader.readMidiVariableLength();
                                    //console.log("Meta, message:", message, "length:", length);
                                    if (message == 47 /* endOfTrack */) {
                                        foundTrackEndEvent = true;
                                        track.reader.skipBytes(length_1);
                                    }
                                    else if (message == 81 /* tempo */) {
                                        microsecondsPerBeat = track.reader.readUint24();
                                        track.reader.skipBytes(length_1 - 3);
                                    }
                                    else if (message == 88 /* timeSignature */) {
                                        var numerator = track.reader.readUint8();
                                        var denominatorExponent = track.reader.readUint8();
                                        /*const midiClocksPerMetronome: number =*/ track.reader.readUint8();
                                        /*const thirtySecondNotesPer24MidiClocks: number =*/ track.reader.readUint8();
                                        track.reader.skipBytes(length_1 - 4);
                                        // A beat is a quarter note. 
                                        // A ratio of 4/4, or 1/1, corresponds to 4 beats per bar.
                                        // Apply the numerator first.
                                        beatsPerBar = numerator * 4;
                                        // Then apply the denominator, dividing by two until either
                                        // the denominator is satisfied or there's an odd number of
                                        // beats. BeepBox doesn't support fractional beats in a bar.
                                        while ((beatsPerBar & 1) == 0 && (denominatorExponent > 0 || beatsPerBar > SynthConfig_1.Config.beatsPerBarMax) && beatsPerBar >= SynthConfig_1.Config.beatsPerBarMin * 2) {
                                            beatsPerBar = beatsPerBar >> 1;
                                            denominatorExponent = denominatorExponent - 1;
                                        }
                                        beatsPerBar = Math.max(SynthConfig_1.Config.beatsPerBarMin, Math.min(SynthConfig_1.Config.beatsPerBarMax, beatsPerBar));
                                    }
                                    else if (message == 89 /* keySignature */) {
                                        numSharps = track.reader.readInt8(); // Note: can be negative for flats.
                                        isMinor = track.reader.readUint8() == 1; // 0: major, 1: minor
                                        track.reader.skipBytes(length_1 - 2);
                                    }
                                    else {
                                        // Ignore other meta event message types.
                                        track.reader.skipBytes(length_1);
                                    }
                                }
                                else if (eventStatus == 0xF0 || eventStatus == 0xF7) {
                                    // Sysex events, just skip the data.
                                    var length_2 = track.reader.readMidiVariableLength();
                                    track.reader.skipBytes(length_2);
                                }
                                else {
                                    console.error("Unrecognized event status: " + eventStatus);
                                    this._close();
                                    return;
                                }
                            }
                            break;
                        default: {
                            console.error("Unrecognized event type: " + eventType);
                            this._close();
                            return;
                        }
                    }
                    if (!foundTrackEndEvent && track.reader.hasMore()) {
                        track.nextEventMidiTick = currentMidiTick + track.reader.readMidiVariableLength();
                    }
                    else {
                        track.ended = true;
                        // If the tracks are sequential, start the next track when this one ends.
                        if (independentTracks) {
                            currentIndependentTrackIndex++;
                            if (currentIndependentTrackIndex < tracks.length) {
                                currentTrackIndices[0] = currentIndependentTrackIndex;
                                tracks[currentIndependentTrackIndex].nextEventMidiTick += currentMidiTick;
                                nextEventMidiTick = Math.min(nextEventMidiTick, tracks[currentIndependentTrackIndex].nextEventMidiTick);
                                anyTrackHasMore = true;
                            }
                        }
                    }
                }
                if (!track.ended) {
                    anyTrackHasMore = true;
                    nextEventMidiTick = Math.min(nextEventMidiTick, track.nextEventMidiTick);
                }
            }
            if (anyTrackHasMore) {
                currentMidiTick = nextEventMidiTick;
            }
            else {
                break;
            }
        }
        // Now the MIDI file is fully parsed. Next, constuct BeepBox channels out of the data.
        var microsecondsPerMinute = 60 * 1000 * 1000;
        var beatsPerMinute = Math.max(SynthConfig_1.Config.tempoMin, Math.min(SynthConfig_1.Config.tempoMax, Math.round(microsecondsPerMinute / microsecondsPerBeat)));
        var midiTicksPerPart = midiTicksPerBeat / SynthConfig_1.Config.partsPerBeat;
        var partsPerBar = SynthConfig_1.Config.partsPerBeat * beatsPerBar;
        var songTotalBars = Math.ceil(currentMidiTick / midiTicksPerPart / partsPerBar);
        function quantizeMidiTickToPart(midiTick) {
            return Math.round(midiTick / midiTicksPerPart);
        }
        var key = numSharps;
        if (isMinor)
            key += 3; // Diatonic C Major has the same sharps/flats as A Minor, and these keys are 3 semitones apart.
        if ((key & 1) == 1)
            key += 6; // If the number of sharps/flats is odd, rotate it halfway around the circle of fifths. The key of C# has little in common with the key of C.
        while (key < 0)
            key += 12; // Wrap around to a range from 0 to 11.
        key = key % 12; // Wrap around to a range from 0 to 11.
        // Convert each midi channel into a BeepBox channel.
        var pitchChannels = [];
        var noiseChannels = [];
        for (var midiChannel = 0; midiChannel < 16; midiChannel++) {
            if (noteEvents[midiChannel].length == 0)
                continue;
            var channel = new synth_1.Channel();
            var channelPresetValue = null = EditorConfig_1.EditorConfig.midiProgramToPresetValue(noteEvents[midiChannel][0].program);
            var channelPreset = null = (channelPresetValue == null) ? null : EditorConfig_1.EditorConfig.valueToPreset(channelPresetValue);
            var isDrumsetChannel = (midiChannel == 9);
            var isNoiseChannel = isDrumsetChannel || (channelPreset != null && channelPreset.isNoise == true);
            var channelBasePitch = isNoiseChannel ? SynthConfig_1.Config.spectrumBasePitch : SynthConfig_1.Config.keys[key].basePitch;
            var intervalScale = isNoiseChannel ? SynthConfig_1.Config.noiseInterval : 1;
            var midiIntervalScale = isNoiseChannel ? 0.5 : 1;
            var channelMaxPitch = isNoiseChannel ? SynthConfig_1.Config.drumCount - 1 : SynthConfig_1.Config.maxPitch;
            if (isNoiseChannel) {
                if (isDrumsetChannel) {
                    noiseChannels.unshift(channel);
                }
                else {
                    noiseChannels.push(channel);
                }
            }
            else {
                pitchChannels.push(channel);
            }
            var currentVelocity = 1.0;
            var currentProgram = 0;
            var currentInstrumentVolume = 0;
            var currentInstrumentPan = SynthConfig_1.Config.panCenter;
            if (isDrumsetChannel) {
                var heldPitches = [];
                var currentBar = -1;
                var pattern = null = null;
                var prevEventPart = 0;
                var setInstrumentVolume = false;
                var presetValue = EditorConfig_1.EditorConfig.nameToPresetValue("standard drumset");
                !;
                var preset = EditorConfig_1.EditorConfig.valueToPreset(presetValue);
                !;
                var instrument = new synth_1.Instrument(false);
                instrument.fromJsonObject(preset.settings, false);
                instrument.preset = presetValue;
                channel.instruments.push(instrument);
                for (var noteEventIndex = 0; noteEventIndex <= noteEvents[midiChannel].length; noteEventIndex++) {
                    var noMoreNotes = noteEventIndex == noteEvents[midiChannel].length;
                    var noteEvent = null = noMoreNotes ? null : noteEvents[midiChannel][noteEventIndex];
                    var nextEventPart = noteEvent == null ? Number.MAX_SAFE_INTEGER : quantizeMidiTickToPart(noteEvent.midiTick);
                    if (heldPitches.length > 0 && nextEventPart > prevEventPart && (noteEvent == null || noteEvent.on)) {
                        var bar = Math.floor(prevEventPart / partsPerBar);
                        var barStartPart = bar * partsPerBar;
                        // Ensure a pattern exists for the current bar before inserting notes into it.
                        if (currentBar != bar || pattern == null) {
                            currentBar++;
                            while (currentBar < bar) {
                                channel.bars[currentBar] = 0;
                                currentBar++;
                            }
                            pattern = new synth_1.Pattern();
                            channel.patterns.push(pattern);
                            channel.bars[currentBar] = channel.patterns.length;
                            pattern.instrument = 0;
                        }
                        // Use the loudest volume setting for the instrument, since 
                        // many midis unfortunately use the instrument volume control to fade
                        // in at the beginning and we don't want to get stuck with the initial
                        // zero volume.
                        if (!setInstrumentVolume || instrument.volume > currentInstrumentVolume) {
                            instrument.volume = currentInstrumentVolume;
                            instrument.pan = currentInstrumentPan;
                            setInstrumentVolume = true;
                        }
                        var drumFreqs = [];
                        var minDuration = channelMaxPitch;
                        var maxDuration = 0;
                        var expression = 1;
                        for (var _a = 0; _a < heldPitches.length; _a++) {
                            var pitch = heldPitches[_a];
                            var drum = Midi_1.analogousDrumMap[pitch];
                            if (drumFreqs.indexOf(drum.frequency) == -1) {
                                drumFreqs.push(drum.frequency);
                            }
                            expression = Math.max(expression, Math.round(drum.volume * currentVelocity));
                            minDuration = Math.min(minDuration, drum.duration);
                            maxDuration = Math.max(maxDuration, drum.duration);
                        }
                        var duration = Math.min(maxDuration, Math.max(minDuration, 2));
                        var noteStartPart = prevEventPart - barStartPart;
                        var noteEndPart = Math.min(partsPerBar, Math.min(nextEventPart - barStartPart, noteStartPart + duration * 6));
                        var note = new synth_1.Note(-1, noteStartPart, noteEndPart, expression, true);
                        note.pitches.length = 0;
                        for (var pitchIndex = 0; pitchIndex < Math.min(SynthConfig_1.Config.maxChordSize, drumFreqs.length); pitchIndex++) {
                            var heldPitch = drumFreqs[pitchIndex + Math.max(0, drumFreqs.length - SynthConfig_1.Config.maxChordSize)];
                            if (note.pitches.indexOf(heldPitch) == -1) {
                                note.pitches.push(heldPitch);
                            }
                        }
                        pattern.notes.push(note);
                        heldPitches.length = 0;
                    }
                    // Process the next midi note event before continuing, updating the list of currently held pitches.
                    if (noteEvent != null && noteEvent.on && Midi_1.analogousDrumMap[noteEvent.pitch] != undefined) {
                        heldPitches.push(noteEvent.pitch);
                        prevEventPart = nextEventPart;
                        currentVelocity = noteEvent.velocity;
                        currentInstrumentVolume = noteEvent.instrumentVolume;
                        currentInstrumentPan = noteEvent.instrumentPan;
                    }
                }
            }
            else {
                // If not a drumset, handle as a tonal instrument.
                // Advance the pitch bend and expression timelines to the given midiTick, 
                // changing the value of currentMidiInterval or currentMidiExpression.
                // IMPORTANT: These functions can't rewind!
                var currentMidiInterval = 0.0;
                var currentMidiExpression = 3.0;
                var pitchBendEventIndex = 0;
                var expressionEventIndex = 0;
                function updateCurrentMidiInterval(midiTick) {
                    while (pitchBendEventIndex < pitchBendEvents[midiChannel].length && pitchBendEvents[midiChannel][pitchBendEventIndex].midiTick <= midiTick) {
                        currentMidiInterval = pitchBendEvents[midiChannel][pitchBendEventIndex].interval;
                        pitchBendEventIndex++;
                    }
                }
                function updateCurrentMidiExpression(midiTick) {
                    while (expressionEventIndex < expressionEvents[midiChannel].length && expressionEvents[midiChannel][expressionEventIndex].midiTick <= midiTick) {
                        currentMidiExpression = expressionEvents[midiChannel][expressionEventIndex].volume;
                        expressionEventIndex++;
                    }
                }
                var instrumentByProgram = [];
                var heldPitches = [];
                var currentBar = -1;
                var pattern = null = null;
                var prevEventMidiTick = 0;
                var prevEventPart = 0;
                var pitchSum = 0;
                var pitchCount = 0;
                for (var _b = 0, _c = noteEvents[midiChannel]; _b < _c.length; _b++) {
                    var noteEvent = _c[_b];
                    var nextEventMidiTick = noteEvent.midiTick;
                    var nextEventPart = quantizeMidiTickToPart(nextEventMidiTick);
                    if (heldPitches.length > 0 && nextEventPart > prevEventPart) {
                        // If there are any pitches held between the previous event and the next
                        // event, iterate over all bars covered by this time period, ensure they
                        // have a pattern instantiated, and insert notes for these pitches.
                        var startBar = Math.floor(prevEventPart / partsPerBar);
                        var endBar = Math.ceil(nextEventPart / partsPerBar);
                        for (var bar = startBar; bar < endBar; bar++) {
                            var barStartPart = bar * partsPerBar;
                            var barStartMidiTick = bar * beatsPerBar * midiTicksPerBeat;
                            var barEndMidiTick = (bar + 1) * beatsPerBar * midiTicksPerBeat;
                            var noteStartPart = Math.max(0, prevEventPart - barStartPart);
                            var noteEndPart = Math.min(partsPerBar, nextEventPart - barStartPart);
                            var noteStartMidiTick = Math.max(barStartMidiTick, prevEventMidiTick);
                            var noteEndMidiTick = Math.min(barEndMidiTick, nextEventMidiTick);
                            if (noteStartPart < noteEndPart) {
                                var presetValue = null = EditorConfig_1.EditorConfig.midiProgramToPresetValue(currentProgram);
                                var preset = null = (presetValue == null) ? null : EditorConfig_1.EditorConfig.valueToPreset(presetValue);
                                // Ensure a pattern exists for the current bar before inserting notes into it.
                                if (currentBar != bar || pattern == null) {
                                    currentBar++;
                                    while (currentBar < bar) {
                                        channel.bars[currentBar] = 0;
                                        currentBar++;
                                    }
                                    pattern = new synth_1.Pattern();
                                    channel.patterns.push(pattern);
                                    channel.bars[currentBar] = channel.patterns.length;
                                    // If this is the first time a note is trying to use a specific instrument
                                    // program in this channel, create a new BeepBox instrument for it.
                                    if (instrumentByProgram[currentProgram] == undefined) {
                                        var instrument = new synth_1.Instrument(isNoiseChannel);
                                        instrumentByProgram[currentProgram] = instrument;
                                        if (presetValue != null && preset != null && (preset.isNoise == true) == isNoiseChannel) {
                                            instrument.fromJsonObject(preset.settings, isNoiseChannel);
                                            instrument.preset = presetValue;
                                        }
                                        else {
                                            instrument.setTypeAndReset(isNoiseChannel ? 2 /* noise */ : 0 /* chip */, isNoiseChannel);
                                            instrument.chord = 0; // Midi instruments use polyphonic harmony by default.
                                        }
                                        instrument.volume = currentInstrumentVolume;
                                        instrument.pan = currentInstrumentPan;
                                        channel.instruments.push(instrument);
                                    }
                                    pattern.instrument = channel.instruments.indexOf(instrumentByProgram[currentProgram]);
                                }
                                // Use the loudest volume setting for the instrument, since 
                                // many midis unfortunately use the instrument volume control to fade
                                // in at the beginning and we don't want to get stuck with the initial
                                // zero volume.
                                if (instrumentByProgram[currentProgram] != undefined) {
                                    instrumentByProgram[currentProgram].volume = Math.min(instrumentByProgram[currentProgram].volume, currentInstrumentVolume);
                                    instrumentByProgram[currentProgram].pan = Math.min(instrumentByProgram[currentProgram].pan, currentInstrumentPan);
                                }
                                // Create a new note, and interpret the pitch bend and expression events
                                // to determine where we need to insert pins to control interval and expression.
                                var note = new synth_1.Note(-1, noteStartPart, noteEndPart, 3, false);
                                note.pins.length = 0;
                                updateCurrentMidiInterval(noteStartMidiTick);
                                updateCurrentMidiExpression(noteStartMidiTick);
                                var shiftedHeldPitch = heldPitches[0] * midiIntervalScale - channelBasePitch;
                                var initialBeepBoxPitch = Math.round((shiftedHeldPitch + currentMidiInterval) / intervalScale);
                                var heldPitchOffset = Math.round(currentMidiInterval - channelBasePitch);
                                var firstPin = synth_1.makeNotePin(0, 0, Math.round(currentVelocity * currentMidiExpression));
                                note.pins.push(firstPin);
                                var potentialPins = [
                                    { part: 0, pitch: initialBeepBoxPitch, volume: firstPin.volume, keyPitch: false, keyVolume: false }
                                ];
                                var prevPinIndex = 0;
                                var prevPartPitch = (shiftedHeldPitch + currentMidiInterval) / intervalScale;
                                var prevPartExpression = currentVelocity * currentMidiExpression;
                                for (var part = noteStartPart + 1; part <= noteEndPart; part++) {
                                    var midiTick = Math.max(noteStartMidiTick, Math.min(noteEndMidiTick - 1, Math.round(midiTicksPerPart * (part + barStartPart))));
                                    var noteRelativePart = part - noteStartPart;
                                    var lastPart = (part == noteEndPart);
                                    // BeepBox can only add pins at whole number intervals and expressions. Detect places where
                                    // the interval or expression are at or cross whole numbers, and add these to the list of
                                    // potential places to insert pins.
                                    updateCurrentMidiInterval(midiTick);
                                    updateCurrentMidiExpression(midiTick);
                                    var partPitch = (currentMidiInterval + shiftedHeldPitch) / intervalScale;
                                    var partExpression = currentVelocity * currentMidiExpression;
                                    var nearestPitch = Math.round(partPitch);
                                    var pitchIsNearInteger = Math.abs(partPitch - nearestPitch) < 0.01;
                                    var pitchCrossedInteger = (Math.abs(prevPartPitch - Math.round(prevPartPitch)) < 0.01)
                                        ? Math.abs(partPitch - prevPartPitch) >= 1.0
                                        : Math.floor(partPitch) != Math.floor(prevPartPitch);
                                    var keyPitch = pitchIsNearInteger || pitchCrossedInteger;
                                    var nearestExpression = Math.round(partExpression);
                                    var expressionIsNearInteger = Math.abs(partExpression - nearestExpression) < 0.01;
                                    var expressionCrossedInteger = (Math.abs(prevPartExpression - Math.round(prevPartExpression)))
                                        ? Math.abs(partExpression - prevPartExpression) >= 1.0
                                        : Math.floor(partExpression) != Math.floor(prevPartExpression);
                                    var keyExpression = expressionIsNearInteger || expressionCrossedInteger;
                                    prevPartPitch = partPitch;
                                    prevPartExpression = partExpression;
                                    if (keyPitch || keyExpression || lastPart) {
                                        var currentPin = { part: noteRelativePart, pitch: nearestPitch, volume: nearestExpression, keyPitch: keyPitch || lastPart, keyVolume: keyExpression || lastPart };
                                        var prevPin = potentialPins[prevPinIndex];
                                        // At all key points in the list of potential pins, check to see if they
                                        // continue the recent slope. If not, insert a pin at the corner, where
                                        // the recent recorded values deviate the furthest from the slope.
                                        var addPin = false;
                                        var addPinAtIndex = Number.MAX_VALUE;
                                        if (currentPin.keyPitch) {
                                            var slope = (currentPin.pitch - prevPin.pitch) / (currentPin.part - prevPin.part);
                                            var furthestIntervalDistance = Math.abs(slope); // minimum distance to make a new pin.
                                            var addIntervalPin = false;
                                            var addIntervalPinAtIndex = Number.MAX_VALUE;
                                            for (var potentialIndex = prevPinIndex + 1; potentialIndex < potentialPins.length; potentialIndex++) {
                                                var potentialPin = potentialPins[potentialIndex];
                                                if (potentialPin.keyPitch) {
                                                    var interpolatedInterval = prevPin.pitch + slope * (potentialPin.part - prevPin.part);
                                                    var distance = Math.abs(interpolatedInterval - potentialPin.pitch);
                                                    if (furthestIntervalDistance < distance) {
                                                        furthestIntervalDistance = distance;
                                                        addIntervalPin = true;
                                                        addIntervalPinAtIndex = potentialIndex;
                                                    }
                                                }
                                            }
                                            if (addIntervalPin) {
                                                addPin = true;
                                                addPinAtIndex = Math.min(addPinAtIndex, addIntervalPinAtIndex);
                                            }
                                        }
                                        if (currentPin.keyVolume) {
                                            var slope = (currentPin.volume - prevPin.volume) / (currentPin.part - prevPin.part);
                                            var furthestVolumeDistance = Math.abs(slope); // minimum distance to make a new pin.
                                            var addVolumePin = false;
                                            var addVolumePinAtIndex = Number.MAX_VALUE;
                                            for (var potentialIndex = prevPinIndex + 1; potentialIndex < potentialPins.length; potentialIndex++) {
                                                var potentialPin = potentialPins[potentialIndex];
                                                if (potentialPin.keyVolume) {
                                                    var interpolatedVolume = prevPin.volume + slope * (potentialPin.part - prevPin.part);
                                                    var distance = Math.abs(interpolatedVolume - potentialPin.volume);
                                                    if (furthestVolumeDistance < distance) {
                                                        furthestVolumeDistance = distance;
                                                        addVolumePin = true;
                                                        addVolumePinAtIndex = potentialIndex;
                                                    }
                                                }
                                            }
                                            if (addVolumePin) {
                                                addPin = true;
                                                addPinAtIndex = Math.min(addPinAtIndex, addVolumePinAtIndex);
                                            }
                                        }
                                        if (addPin) {
                                            var toBePinned = potentialPins[addPinAtIndex];
                                            note.pins.push(synth_1.makeNotePin(toBePinned.pitch - initialBeepBoxPitch, toBePinned.part, toBePinned.volume));
                                            prevPinIndex = addPinAtIndex;
                                        }
                                        potentialPins.push(currentPin);
                                    }
                                }
                                // And always add a pin at the end of the note.
                                var lastToBePinned = potentialPins[potentialPins.length - 1];
                                note.pins.push(synth_1.makeNotePin(lastToBePinned.pitch - initialBeepBoxPitch, lastToBePinned.part, lastToBePinned.volume));
                                // Use interval range to constrain min/max pitches so no pin is out of bounds.
                                var maxPitch = channelMaxPitch;
                                var minPitch = 0;
                                for (var _d = 0, _e = note.pins; _d < _e.length; _d++) {
                                    var notePin = _e[_d];
                                    maxPitch = Math.min(maxPitch, channelMaxPitch - notePin.interval);
                                    minPitch = Math.min(minPitch, -notePin.interval);
                                }
                                // Build the note chord out of the current pitches, shifted into BeepBox channelBasePitch relative values.
                                note.pitches.length = 0;
                                for (var pitchIndex = 0; pitchIndex < Math.min(SynthConfig_1.Config.maxChordSize, heldPitches.length); pitchIndex++) {
                                    var heldPitch = heldPitches[pitchIndex + Math.max(0, heldPitches.length - SynthConfig_1.Config.maxChordSize)] * midiIntervalScale;
                                    if (preset != null && preset.midiSubharmonicOctaves != undefined) {
                                        heldPitch -= 12 * preset.midiSubharmonicOctaves;
                                    }
                                    var shiftedPitch = Math.max(minPitch, Math.min(maxPitch, Math.round((heldPitch + heldPitchOffset) / intervalScale)));
                                    if (note.pitches.indexOf(shiftedPitch) == -1) {
                                        note.pitches.push(shiftedPitch);
                                        var weight = note.end - note.start;
                                        pitchSum += shiftedPitch * weight;
                                        pitchCount += weight;
                                    }
                                }
                                pattern.notes.push(note);
                            }
                        }
                    }
                    // Process the next midi note event before continuing, updating the list of currently held pitches.
                    if (heldPitches.indexOf(noteEvent.pitch) != -1) {
                        heldPitches.splice(heldPitches.indexOf(noteEvent.pitch), 1);
                    }
                    if (noteEvent.on) {
                        heldPitches.push(noteEvent.pitch);
                        currentVelocity = noteEvent.velocity;
                        currentProgram = noteEvent.program;
                        currentInstrumentVolume = noteEvent.instrumentVolume;
                        currentInstrumentPan = noteEvent.instrumentPan;
                    }
                    prevEventMidiTick = nextEventMidiTick;
                    prevEventPart = nextEventPart;
                }
                var averagePitch = pitchSum / pitchCount;
                channel.octave = isNoiseChannel ? 0 : Math.max(0, Math.min(SynthConfig_1.Config.scrollableOctaves, Math.round((averagePitch / 12) - 1.5)));
            }
            while (channel.bars.length < songTotalBars) {
                channel.bars.push(0);
            }
        }
        // For better or for worse, BeepBox has a more limited number of channels than Midi.
        // To compensate, try to merge non-overlapping channels.
        function compactChannels(channels, maxLength) {
            while (channels.length > maxLength) {
                var bestChannelIndexA = channels.length - 2;
                var bestChannelIndexB = channels.length - 1;
                var fewestConflicts = Number.MAX_VALUE;
                var fewestGaps = Number.MAX_VALUE;
                for (var channelIndexA = 0; channelIndexA < channels.length - 1; channelIndexA++) {
                    for (var channelIndexB = channelIndexA + 1; channelIndexB < channels.length; channelIndexB++) {
                        var channelA_1 = channels[channelIndexA];
                        var channelB_1 = channels[channelIndexB];
                        var conflicts = 0;
                        var gaps = 0;
                        for (var barIndex = 0; barIndex < channelA_1.bars.length && barIndex < channelB_1.bars.length; barIndex++) {
                            if (channelA_1.bars[barIndex] != 0 && channelB_1.bars[barIndex] != 0)
                                conflicts++;
                            if (channelA_1.bars[barIndex] == 0 && channelB_1.bars[barIndex] == 0)
                                gaps++;
                        }
                        if (conflicts <= fewestConflicts) {
                            if (conflicts < fewestConflicts || gaps < fewestGaps) {
                                bestChannelIndexA = channelIndexA;
                                bestChannelIndexB = channelIndexB;
                                fewestConflicts = conflicts;
                                fewestGaps = gaps;
                            }
                        }
                    }
                }
                // Merge channelB's patterns, instruments, and bars into channelA.
                var channelA = channels[bestChannelIndexA];
                var channelB = channels[bestChannelIndexB];
                var channelAInstrumentCount = channelA.instruments.length;
                var channelAPatternCount = channelA.patterns.length;
                for (var _i = 0, _a = channelB.instruments; _i < _a.length; _i++) {
                    var instrument = _a[_i];
                    channelA.instruments.push(instrument);
                }
                for (var _b = 0, _c = channelB.patterns; _b < _c.length; _b++) {
                    var pattern = _c[_b];
                    pattern.instrument += channelAInstrumentCount;
                    channelA.patterns.push(pattern);
                }
                for (var barIndex = 0; barIndex < channelA.bars.length && barIndex < channelB.bars.length; barIndex++) {
                    if (channelA.bars[barIndex] == 0 && channelB.bars[barIndex] != 0) {
                        channelA.bars[barIndex] = channelB.bars[barIndex] + channelAPatternCount;
                    }
                }
                // Remove channelB.
                channels.splice(bestChannelIndexB, 1);
            }
        }
        compactChannels(pitchChannels, SynthConfig_1.Config.pitchChannelCountMax);
        compactChannels(noiseChannels, SynthConfig_1.Config.noiseChannelCountMax);
        var ChangeImportMidi = (function (_super) {
            __extends(ChangeImportMidi, _super);
            function ChangeImportMidi(doc) {
                _super.call(this);
                var song = doc.song;
                song.tempo = beatsPerMinute;
                song.beatsPerBar = beatsPerBar;
                song.key = key;
                song.scale = 11;
                song.reverb = 1;
                song.rhythm = 1;
                changes_1.removeDuplicatePatterns(pitchChannels);
                changes_1.removeDuplicatePatterns(noiseChannels);
                this.append(new changes_1.ChangeReplacePatterns(doc, pitchChannels, noiseChannels));
                song.loopStart = 0;
                song.loopLength = song.barCount;
                this._didSomething();
                doc.notifier.changed();
            }
            return ChangeImportMidi;
        })(Change_1.ChangeGroup);
        this._doc.goBackToStart();
        for (var _f = 0, _g = this._doc.song.channels; _f < _g.length; _f++) {
            var channel = _g[_f];
            channel.muted = false;
        }
        this._doc.prompt = null;
        this._doc.record(new ChangeImportMidi(this._doc), true, true);
    };
    return ImportPrompt;
})();
exports.ImportPrompt = ImportPrompt;
//}
