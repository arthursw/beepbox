/*!
Copyright (C) 2020 John Nesky

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
readonly;
index: number;
readonly;
name: string;
readonly;
flags: ReadonlyArray();
readonly;
realName: string;
readonly;
isWhiteKey: boolean;
readonly;
basePitch: number;
readonly;
stepsPerBeat: number;
readonly;
ticksPerArpeggio: number;
readonly;
arpeggioPatterns: ReadonlyArray();
readonly;
roundUpThresholds: number[] | null;
readonly;
volume: number;
readonly;
samples: Float64Array;
readonly;
volume: number;
readonly;
basePitch: number;
readonly;
pitchFilterMult: number;
readonly;
isSoft: boolean;
samples: Float32Array | null;
readonly;
isSeamless: boolean;
readonly;
attackSeconds: number;
readonly;
releases: boolean;
readonly;
releaseTicks: number;
readonly;
slides: boolean;
readonly;
slideTicks: number;
readonly;
amplitude: number;
readonly;
periodsSeconds: ReadonlyArray();
readonly;
delayParts: number;
readonly;
spread: number;
readonly;
offset: number;
readonly;
volume: number;
readonly;
sign: number;
readonly;
harmonizes: boolean;
readonly;
customInterval: boolean;
readonly;
arpeggiates: boolean;
readonly;
isCustomInterval: boolean;
readonly;
strumParts: number;
readonly;
carrierCount: number;
readonly;
associatedCarrier: ReadonlyArray();
readonly;
modulatedBy: ReadonlyArray();
readonly;
mult: number;
readonly;
hzOffset: number;
readonly;
amplitudeSign: number;
readonly;
type: EnvelopeType;
readonly;
speed: number;
readonly;
indices: ReadonlyArray();
var Config = (function () {
    function Config() {
    }
    Config.prototype.DictionaryArray = ;
    Config.readonly = scales;
    return Config;
})();
exports.Config = Config;
{
    name: "easy :(", realName;
    "pentatonic minor", flags;
    [true, false, false, true, false, true, false, true, false, false, true, false];
}
{
    name: "island :)", realName;
    "ryukyu", flags;
    [true, false, false, false, true, true, false, true, false, false, false, true];
}
{
    name: "island :(", realName;
    "pelog selisir", flags;
    [true, true, false, true, false, false, false, true, true, false, false, false];
}
{
    name: "blues :)", realName;
    "blues major", flags;
    [true, false, true, true, true, false, false, true, false, true, false, false];
}
{
    name: "blues :(", realName;
    "blues", flags;
    [true, false, false, true, false, true, true, true, false, false, true, false];
}
{
    name: "normal :)", realName;
    "ionian", flags;
    [true, false, true, false, true, true, false, true, false, true, false, true];
}
{
    name: "normal :(", realName;
    "aeolian", flags;
    [true, false, true, true, false, true, false, true, true, false, true, false];
}
{
    name: "dbl harmonic :)", realName;
    "double harmonic major", flags;
    [true, true, false, false, true, true, false, true, true, false, false, true];
}
{
    name: "dbl harmonic :(", realName;
    "double harmonic minor", flags;
    [true, false, true, true, false, false, true, true, true, false, false, true];
}
{
    name: "strange", realName;
    "whole tone", flags;
    [true, false, true, false, true, false, true, false, true, false, true, false];
}
{
    name: "expert", realName;
    "chromatic", flags;
    [true, true, true, true, true, true, true, true, true, true, true, true];
}
;
readonly;
keys: DictionaryArray < Key > ;
toNameMap([
    { name: "C", isWhiteKey: true, basePitch: 12 },
    { name: "C♯", isWhiteKey: false, basePitch: 13 },
    { name: "D", isWhiteKey: true, basePitch: 14 },
    { name: "D♯", isWhiteKey: false, basePitch: 15 },
    { name: "E", isWhiteKey: true, basePitch: 16 },
    { name: "F", isWhiteKey: true, basePitch: 17 },
    { name: "F♯", isWhiteKey: false, basePitch: 18 },
    { name: "G", isWhiteKey: true, basePitch: 19 },
    { name: "G♯", isWhiteKey: false, basePitch: 20 },
    { name: "A", isWhiteKey: true, basePitch: 21 },
    { name: "A♯", isWhiteKey: false, basePitch: 22 },
    { name: "B", isWhiteKey: true, basePitch: 23 },
]);
readonly;
blackKeyNameParents: ReadonlyArray < number > ;
[-1, 1, -1, 1, -1, 1, -1, -1, 1, -1, 1, -1];
readonly;
tempoMin: number = 30;
readonly;
tempoMax: number = 300;
readonly;
reverbRange: number = 4;
readonly;
beatsPerBarMin: number = 3;
readonly;
beatsPerBarMax: number = 16;
readonly;
barCountMin: number = 1;
readonly;
barCountMax: number = 128;
readonly;
instrumentsPerChannelMin: number = 1;
readonly;
instrumentsPerChannelMax: number = 10;
readonly;
partsPerBeat: number = 24;
readonly;
ticksPerPart: number = 2;
readonly;
rhythms: DictionaryArray < Rhythm > ;
toNameMap([
    { name: "÷3 (triplets)", stepsPerBeat: 3, ticksPerArpeggio: 4, arpeggioPatterns: [[0], [0, 0, 1, 1], [0, 1, 2, 1]], roundUpThresholds: [5, 12, 18 /*24*/] },
    { name: "÷4 (standard)", stepsPerBeat: 4, ticksPerArpeggio: 3, arpeggioPatterns: [[0], [0, 0, 1, 1], [0, 1, 2, 1]], roundUpThresholds: [3, 9, 17, 21 /*24*/] },
    { name: "÷6", stepsPerBeat: 6, ticksPerArpeggio: 4, arpeggioPatterns: [[0], [0, 1], [0, 1, 2, 1]], roundUpThresholds: null },
    { name: "÷8", stepsPerBeat: 8, ticksPerArpeggio: 3, arpeggioPatterns: [[0], [0, 1], [0, 1, 2, 1]], roundUpThresholds: null },
    { name: "freehand", stepsPerBeat: 24, ticksPerArpeggio: 3, arpeggioPatterns: [[0], [0, 1], [0, 1, 2, 1]], roundUpThresholds: null },
]);
readonly;
instrumentTypeNames: ReadonlyArray < string > ;
["chip", "FM", "noise", "spectrum", "drumset", "harmonics", "PWM"];
readonly;
instrumentTypeHasSpecialInterval: ReadonlyArray < boolean > ;
[true, true, false, false, false, true, false];
readonly;
chipWaves: DictionaryArray < ChipWave > ;
toNameMap([
    { name: "rounded", volume: 0.94, samples: centerWave([0.0, 0.2, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.95, 0.9, 0.85, 0.8, 0.7, 0.6, 0.5, 0.4, 0.2, 0.0, -0.2, -0.4, -0.5, -0.6, -0.7, -0.8, -0.85, -0.9, -0.95, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -0.95, -0.9, -0.85, -0.8, -0.7, -0.6, -0.5, -0.4, -0.2]) },
    { name: "triangle", volume: 1.0, samples: centerWave([1.0 / 15.0, 3.0 / 15.0, 5.0 / 15.0, 7.0 / 15.0, 9.0 / 15.0, 11.0 / 15.0, 13.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 13.0 / 15.0, 11.0 / 15.0, 9.0 / 15.0, 7.0 / 15.0, 5.0 / 15.0, 3.0 / 15.0, 1.0 / 15.0, -1.0 / 15.0, -3.0 / 15.0, -5.0 / 15.0, -7.0 / 15.0, -9.0 / 15.0, -11.0 / 15.0, -13.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -13.0 / 15.0, -11.0 / 15.0, -9.0 / 15.0, -7.0 / 15.0, -5.0 / 15.0, -3.0 / 15.0, -1.0 / 15.0]) },
    { name: "square", volume: 0.5, samples: centerWave([1.0, -1.0]) },
    { name: "1/4 pulse", volume: 0.5, samples: centerWave([1.0, -1.0, -1.0, -1.0]) },
    { name: "1/8 pulse", volume: 0.5, samples: centerWave([1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]) },
    { name: "sawtooth", volume: 0.65, samples: centerWave([1.0 / 31.0, 3.0 / 31.0, 5.0 / 31.0, 7.0 / 31.0, 9.0 / 31.0, 11.0 / 31.0, 13.0 / 31.0, 15.0 / 31.0, 17.0 / 31.0, 19.0 / 31.0, 21.0 / 31.0, 23.0 / 31.0, 25.0 / 31.0, 27.0 / 31.0, 29.0 / 31.0, 31.0 / 31.0, -31.0 / 31.0, -29.0 / 31.0, -27.0 / 31.0, -25.0 / 31.0, -23.0 / 31.0, -21.0 / 31.0, -19.0 / 31.0, -17.0 / 31.0, -15.0 / 31.0, -13.0 / 31.0, -11.0 / 31.0, -9.0 / 31.0, -7.0 / 31.0, -5.0 / 31.0, -3.0 / 31.0, -1.0 / 31.0]) },
    { name: "double saw", volume: 0.5, samples: centerWave([0.0, -0.2, -0.4, -0.6, -0.8, -1.0, 1.0, -0.8, -0.6, -0.4, -0.2, 1.0, 0.8, 0.6, 0.4, 0.2]) },
    { name: "double pulse", volume: 0.4, samples: centerWave([1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0]) },
    { name: "spiky", volume: 0.4, samples: centerWave([1.0, -1.0, 1.0, -1.0, 1.0, 0.0]) },
]);
readonly;
chipNoises: DictionaryArray < ChipNoise > ;
toNameMap([
    { name: "retro", volume: 0.25, basePitch: 69, pitchFilterMult: 1024.0, isSoft: false, samples: null },
    { name: "white", volume: 1.0, basePitch: 69, pitchFilterMult: 8.0, isSoft: true, samples: null },
    // The "clang" and "buzz" noises are based on similar noises in the modded beepbox! :D
    { name: "clang", volume: 0.4, basePitch: 69, pitchFilterMult: 1024.0, isSoft: false, samples: null },
    { name: "buzz", volume: 0.3, basePitch: 69, pitchFilterMult: 1024.0, isSoft: false, samples: null },
    { name: "hollow", volume: 1.5, basePitch: 96, pitchFilterMult: 1.0, isSoft: true, samples: null },
]);
readonly;
filterCutoffMaxHz: number = 8000; // This is carefully calculated to correspond to no change when filtering at 48000 samples per second.
readonly;
filterCutoffMinHz: number = 1;
readonly;
filterMax: number = 0.95;
readonly;
filterMaxResonance: number = 0.95;
readonly;
filterCutoffRange: number = 11;
readonly;
filterResonanceRange: number = 8;
readonly;
transitions: DictionaryArray < Transition > ;
toNameMap([
    { name: "seamless", isSeamless: true, attackSeconds: 0.0, releases: false, releaseTicks: 1, slides: false, slideTicks: 3 },
    { name: "hard", isSeamless: false, attackSeconds: 0.0, releases: false, releaseTicks: 3, slides: false, slideTicks: 3 },
    { name: "soft", isSeamless: false, attackSeconds: 0.025, releases: false, releaseTicks: 3, slides: false, slideTicks: 3 },
    { name: "slide", isSeamless: true, attackSeconds: 0.025, releases: false, releaseTicks: 3, slides: true, slideTicks: 3 },
    { name: "cross fade", isSeamless: false, attackSeconds: 0.04, releases: true, releaseTicks: 6, slides: false, slideTicks: 3 },
    { name: "hard fade", isSeamless: false, attackSeconds: 0.0, releases: true, releaseTicks: 48, slides: false, slideTicks: 3 },
    { name: "medium fade", isSeamless: false, attackSeconds: 0.0125, releases: true, releaseTicks: 72, slides: false, slideTicks: 3 },
    { name: "soft fade", isSeamless: false, attackSeconds: 0.06, releases: true, releaseTicks: 96, slides: false, slideTicks: 6 },
]);
readonly;
vibratos: DictionaryArray < Vibrato > ;
toNameMap([
    { name: "none", amplitude: 0.0, periodsSeconds: [0.14], delayParts: 0 },
    { name: "light", amplitude: 0.15, periodsSeconds: [0.14], delayParts: 0 },
    { name: "delayed", amplitude: 0.3, periodsSeconds: [0.14], delayParts: 18 },
    { name: "heavy", amplitude: 0.45, periodsSeconds: [0.14], delayParts: 0 },
    { name: "shaky", amplitude: 0.1, periodsSeconds: [0.11, 1.618 * 0.11, 3 * 0.11], delayParts: 0 },
]);
readonly;
intervals: DictionaryArray < Interval > ;
toNameMap([
    { name: "union", spread: 0.0, offset: 0.0, volume: 0.7, sign: 1.0 },
    { name: "shimmer", spread: 0.018, offset: 0.0, volume: 0.8, sign: 1.0 },
    { name: "hum", spread: 0.045, offset: 0.0, volume: 1.0, sign: 1.0 },
    { name: "honky tonk", spread: 0.09, offset: 0.0, volume: 1.0, sign: 1.0 },
    { name: "dissonant", spread: 0.25, offset: 0.0, volume: 0.9, sign: 1.0 },
    { name: "fifth", spread: 3.5, offset: 3.5, volume: 0.9, sign: 1.0 },
    { name: "octave", spread: 6.0, offset: 6.0, volume: 0.8, sign: 1.0 },
    { name: "bowed", spread: 0.02, offset: 0.0, volume: 1.0, sign: -1.0 },
    { name: "piano", spread: 0.01, offset: 0.0, volume: 1.0, sign: 0.7 },
]);
readonly;
effectsNames: ReadonlyArray < string > ;
["none", "reverb", "chorus", "chorus & reverb"];
readonly;
volumeRange: number = 8;
readonly;
volumeLogScale: number = -0.5;
readonly;
panCenter: number = 4;
readonly;
panMax: number = Config.panCenter * 2;
readonly;
chords: DictionaryArray < Chord > ;
toNameMap([
    { name: "harmony", harmonizes: true, customInterval: false, arpeggiates: false, isCustomInterval: false, strumParts: 0 },
    { name: "strum", harmonizes: true, customInterval: false, arpeggiates: false, isCustomInterval: false, strumParts: 1 },
    { name: "arpeggio", harmonizes: false, customInterval: false, arpeggiates: true, isCustomInterval: false, strumParts: 0 },
    { name: "custom interval", harmonizes: true, customInterval: true, arpeggiates: true, isCustomInterval: true, strumParts: 0 },
]);
readonly;
maxChordSize: number = 4;
readonly;
operatorCount: number = 4;
readonly;
algorithms: DictionaryArray < Algorithm > ;
toNameMap([
    { name: "1←(2 3 4)", carrierCount: 1, associatedCarrier: [1, 1, 1, 1], modulatedBy: [[2, 3, 4], [], [], []] },
    { name: "1←(2 3←4)", carrierCount: 1, associatedCarrier: [1, 1, 1, 1], modulatedBy: [[2, 3], [], [4], []] },
    { name: "1←2←(3 4)", carrierCount: 1, associatedCarrier: [1, 1, 1, 1], modulatedBy: [[2], [3, 4], [], []] },
    { name: "1←(2 3)←4", carrierCount: 1, associatedCarrier: [1, 1, 1, 1], modulatedBy: [[2, 3], [4], [4], []] },
    { name: "1←2←3←4", carrierCount: 1, associatedCarrier: [1, 1, 1, 1], modulatedBy: [[2], [3], [4], []] },
    { name: "1←3 2←4", carrierCount: 2, associatedCarrier: [1, 2, 1, 2], modulatedBy: [[3], [4], [], []] },
    { name: "1 2←(3 4)", carrierCount: 2, associatedCarrier: [1, 2, 2, 2], modulatedBy: [[], [3, 4], [], []] },
    { name: "1 2←3←4", carrierCount: 2, associatedCarrier: [1, 2, 2, 2], modulatedBy: [[], [3], [4], []] },
    { name: "(1 2)←3←4", carrierCount: 2, associatedCarrier: [1, 2, 2, 2], modulatedBy: [[3], [3], [4], []] },
    { name: "(1 2)←(3 4)", carrierCount: 2, associatedCarrier: [1, 2, 2, 2], modulatedBy: [[3, 4], [3, 4], [], []] },
    { name: "1 2 3←4", carrierCount: 3, associatedCarrier: [1, 2, 3, 3], modulatedBy: [[], [], [4], []] },
    { name: "(1 2 3)←4", carrierCount: 3, associatedCarrier: [1, 2, 3, 3], modulatedBy: [[4], [4], [4], []] },
    { name: "1 2 3 4", carrierCount: 4, associatedCarrier: [1, 2, 3, 4], modulatedBy: [[], [], [], []] },
]);
readonly;
operatorCarrierInterval: ReadonlyArray < number > ;
[0.0, 0.04, -0.073, 0.091];
readonly;
operatorAmplitudeMax: number = 15;
readonly;
operatorFrequencies: DictionaryArray < OperatorFrequency > ;
toNameMap([
    { name: "1×", mult: 1.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "~1×", mult: 1.0, hzOffset: 1.5, amplitudeSign: -1.0 },
    { name: "2×", mult: 2.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "~2×", mult: 2.0, hzOffset: -1.3, amplitudeSign: -1.0 },
    { name: "3×", mult: 3.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "4×", mult: 4.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "5×", mult: 5.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "6×", mult: 6.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "7×", mult: 7.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "8×", mult: 8.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "9×", mult: 9.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "11×", mult: 11.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "13×", mult: 13.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "16×", mult: 16.0, hzOffset: 0.0, amplitudeSign: 1.0 },
    { name: "20×", mult: 20.0, hzOffset: 0.0, amplitudeSign: 1.0 },
]);
readonly;
envelopes: DictionaryArray < Envelope > ;
toNameMap([
    { name: "custom", type: 0 /* custom */, speed: 0.0 },
    { name: "steady", type: 1 /* steady */, speed: 0.0 },
    { name: "punch", type: 2 /* punch */, speed: 0.0 },
    { name: "flare 1", type: 3 /* flare */, speed: 32.0 },
    { name: "flare 2", type: 3 /* flare */, speed: 8.0 },
    { name: "flare 3", type: 3 /* flare */, speed: 2.0 },
    { name: "twang 1", type: 4 /* twang */, speed: 32.0 },
    { name: "twang 2", type: 4 /* twang */, speed: 8.0 },
    { name: "twang 3", type: 4 /* twang */, speed: 2.0 },
    { name: "swell 1", type: 5 /* swell */, speed: 32.0 },
    { name: "swell 2", type: 5 /* swell */, speed: 8.0 },
    { name: "swell 3", type: 5 /* swell */, speed: 2.0 },
    { name: "tremolo1", type: 6 /* tremolo */, speed: 4.0 },
    { name: "tremolo2", type: 6 /* tremolo */, speed: 2.0 },
    { name: "tremolo3", type: 6 /* tremolo */, speed: 1.0 },
    { name: "tremolo4", type: 7 /* tremolo2 */, speed: 4.0 },
    { name: "tremolo5", type: 7 /* tremolo2 */, speed: 2.0 },
    { name: "tremolo6", type: 7 /* tremolo2 */, speed: 1.0 },
    { name: "decay 1", type: 8 /* decay */, speed: 10.0 },
    { name: "decay 2", type: 8 /* decay */, speed: 7.0 },
    { name: "decay 3", type: 8 /* decay */, speed: 4.0 },
]);
readonly;
feedbacks: DictionaryArray < Feedback > ;
toNameMap([
    { name: "1⟲", indices: [[1], [], [], []] },
    { name: "2⟲", indices: [[], [2], [], []] },
    { name: "3⟲", indices: [[], [], [3], []] },
    { name: "4⟲", indices: [[], [], [], [4]] },
    { name: "1⟲ 2⟲", indices: [[1], [2], [], []] },
    { name: "3⟲ 4⟲", indices: [[], [], [3], [4]] },
    { name: "1⟲ 2⟲ 3⟲", indices: [[1], [2], [3], []] },
    { name: "2⟲ 3⟲ 4⟲", indices: [[], [2], [3], [4]] },
    { name: "1⟲ 2⟲ 3⟲ 4⟲", indices: [[1], [2], [3], [4]] },
    { name: "1→2", indices: [[], [1], [], []] },
    { name: "1→3", indices: [[], [], [1], []] },
    { name: "1→4", indices: [[], [], [], [1]] },
    { name: "2→3", indices: [[], [], [2], []] },
    { name: "2→4", indices: [[], [], [], [2]] },
    { name: "3→4", indices: [[], [], [], [3]] },
    { name: "1→3 2→4", indices: [[], [], [1], [2]] },
    { name: "1→4 2→3", indices: [[], [], [2], [1]] },
    { name: "1→2→3→4", indices: [[], [1], [2], [3]] },
]);
readonly;
chipNoiseLength: number = 1 << 15; // 32768
readonly;
spectrumBasePitch: number = 24;
readonly;
spectrumControlPoints: number = 30;
readonly;
spectrumControlPointsPerOctave: number = 7;
readonly;
spectrumControlPointBits: number = 3;
readonly;
spectrumMax: number = (1 << Config.spectrumControlPointBits) - 1;
readonly;
harmonicsControlPoints: number = 28;
readonly;
harmonicsRendered: number = 64;
readonly;
harmonicsControlPointBits: number = 3;
readonly;
harmonicsMax: number = (1 << Config.harmonicsControlPointBits) - 1;
readonly;
harmonicsWavelength: number = 1 << 11; // 2048
readonly;
pulseWidthRange: number = 8;
readonly;
pitchChannelCountMin: number = 1;
readonly;
pitchChannelCountMax: number = 6;
readonly;
noiseChannelCountMin: number = 0;
readonly;
noiseChannelCountMax: number = 3;
readonly;
noiseInterval: number = 6;
readonly;
pitchesPerOctave: number = 12; // TODO: Use this for converting pitch to frequency.
readonly;
drumCount: number = 12;
readonly;
pitchOctaves: number = 7;
readonly;
windowOctaves: number = 3;
readonly;
scrollableOctaves: number = Config.pitchOctaves - Config.windowOctaves;
readonly;
windowPitchCount: number = Config.windowOctaves * Config.pitchesPerOctave + 1;
readonly;
maxPitch: number = Config.pitchOctaves * Config.pitchesPerOctave;
readonly;
maximumTonesPerChannel: number = Config.maxChordSize * 2;
readonly;
sineWaveLength: number = 1 << 8; // 256
readonly;
sineWaveMask: number = Config.sineWaveLength - 1;
readonly;
sineWave: Float64Array = generateSineWave();
function centerWave(wave) {
    var sum = 0.0;
    for (var i = 0; i < wave.length; i++) {
        sum += wave[i];
    }
    var average = sum / wave.length;
    // Perform the integral on the wave. The chipSynth will perform the derivative to get the original wave back but with antialiasing.
    var cumulative = 0;
    var wavePrev = 0;
    for (var i = 0; i < wave.length; i++) {
        cumulative += wavePrev;
        wavePrev = wave[i] - average;
        wave[i] = cumulative;
    }
    // The first sample should be zero, and we'll duplicate it at the end for easier interpolation.
    wave.push(0);
    return new Float64Array(wave);
}
// The function arguments will be defined in FFT.ts, but I want
// SynthConfig.ts to be at the top of the compiled JS so I won't directly
// depend on FFT here. synth.ts will take care of importing FFT.ts.
//function inverseRealFourierTransform(array: {length: number, [index: number]: number}, fullArrayLength: number): void;
//function scaleElementsByFactor(array: {length: number, [index: number]: number}, factor: number): void;
function getDrumWave(index, inverseRealFourierTransform, scaleElementsByFactor) {
    if (inverseRealFourierTransform === void 0) { inverseRealFourierTransform = null = null; }
    if (scaleElementsByFactor === void 0) { scaleElementsByFactor = null = null; }
    var wave = null = Config.chipNoises[index].samples;
    if (wave == null) {
        wave = new Float32Array(Config.chipNoiseLength + 1);
        Config.chipNoises[index].samples = wave;
        if (index == 0) {
            // The "retro" drum uses a "Linear Feedback Shift Register" similar to the NES noise channel.
            var drumBuffer = 1;
            for (var i = 0; i < Config.chipNoiseLength; i++) {
                wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
                var newBuffer = drumBuffer >> 1;
                if (((drumBuffer + newBuffer) & 1) == 1) {
                    newBuffer += 1 << 14;
                }
                drumBuffer = newBuffer;
            }
        }
        else if (index == 1) {
            // White noise is just random values for each sample.
            for (var i = 0; i < Config.chipNoiseLength; i++) {
                wave[i] = Math.random() * 2.0 - 1.0;
            }
        }
        else if (index == 2) {
            // The "clang" noise wave is based on a similar noise wave in the modded beepbox made by DAzombieRE.
            var drumBuffer = 1;
            for (var i = 0; i < Config.chipNoiseLength; i++) {
                wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
                var newBuffer = drumBuffer >> 1;
                if (((drumBuffer + newBuffer) & 1) == 1) {
                    newBuffer += 2 << 14;
                }
                drumBuffer = newBuffer;
            }
        }
        else if (index == 3) {
            // The "buzz" noise wave is based on a similar noise wave in the modded beepbox made by DAzombieRE.
            var drumBuffer = 1;
            for (var i = 0; i < Config.chipNoiseLength; i++) {
                wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
                var newBuffer = drumBuffer >> 1;
                if (((drumBuffer + newBuffer) & 1) == 1) {
                    newBuffer += 10 << 2;
                }
                drumBuffer = newBuffer;
            }
        }
        else if (index == 4) {
            // "hollow" drums, designed in frequency space and then converted via FFT:
            drawNoiseSpectrum(wave, 10, 11, 1, 1, 0);
            drawNoiseSpectrum(wave, 11, 14, .6578, .6578, 0);
            inverseRealFourierTransform;
            !(wave, Config.chipNoiseLength);
            scaleElementsByFactor;
            !(wave, 1.0 / Math.sqrt(Config.chipNoiseLength));
        }
        else {
            throw new Error("Unrecognized drum index: " + index);
        }
        wave[Config.chipNoiseLength] = wave[0];
    }
    return wave;
}
exports.getDrumWave = getDrumWave;
function drawNoiseSpectrum(wave, lowOctave, highOctave, lowPower, highPower, overallSlope) {
    var referenceOctave = 11;
    var referenceIndex = 1 << referenceOctave;
    var lowIndex = Math.pow(2, lowOctave) | 0;
    var highIndex = Math.min(Config.chipNoiseLength >> 1, Math.pow(2, highOctave) | 0);
    var retroWave = getDrumWave(0);
    var combinedAmplitude = 0.0;
    for (var i = lowIndex; i < highIndex; i++) {
        var lerped = lowPower + (highPower - lowPower) * (Math.log(i) / Math.LN2 - lowOctave) / (highOctave - lowOctave);
        //let amplitude: number = Math.pow(2, lerped);
        //let amplitude: number = Math.pow((lerped + 5) / 7, 4);
        var amplitude = Math.pow(2, (lerped - 1) * Config.spectrumMax + 1) * lerped;
        amplitude *= Math.pow(i / referenceIndex, overallSlope);
        combinedAmplitude += amplitude;
        // Add two different sources of psuedo-randomness to the noise
        // (individually they aren't random enough) but in a deterministic
        // way so that live spectrum editing doesn't result in audible pops.
        // Multiple all the sine wave amplitudes by 1 or -1 based on the 
        // LFSR retro wave (effectively random), and also rotate the phase
        // of each sine wave based on the golden angle to disrupt the symmetry.
        amplitude *= retroWave[i];
        var radians = 0.61803398875 * i * i * Math.PI * 2.0;
        wave[i] = Math.cos(radians) * amplitude;
        wave[Config.chipNoiseLength - i] = Math.sin(radians) * amplitude;
    }
    return combinedAmplitude;
}
exports.drawNoiseSpectrum = drawNoiseSpectrum;
function generateSineWave() {
    var wave = new Float64Array(Config.sineWaveLength + 1);
    for (var i = 0; i < Config.sineWaveLength + 1; i++) {
        wave[i] = Math.sin(i * Math.PI * 2.0 / Config.sineWaveLength);
    }
    return wave;
}
function getArpeggioPitchIndex(pitchCount, rhythm, arpeggio) {
    var arpeggioPattern = Config.rhythms[rhythm].arpeggioPatterns[pitchCount - 1];
    if (arpeggioPattern != null) {
        return arpeggioPattern[arpeggio % arpeggioPattern.length];
    }
    else {
        return arpeggio % pitchCount;
    }
}
exports.getArpeggioPitchIndex = getArpeggioPitchIndex;
// Pardon the messy type casting. This allows accessing array members by numerical index or string name.
function toNameMap(array) {
    if (array === void 0) { array = "index" >>> ; }
    var dictionary = {};
    for (var i = 0; i < array.length; i++) {
        var value = array[i];
        value.index = i;
        dictionary[value.name] = value;
    }
    var result = array;
    result.dictionary = dictionary;
    return result;
}
exports.toNameMap = toNameMap;
//}
