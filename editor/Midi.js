// Copyright (C) 2020 John Nesky, distributed under the MIT license.
//namespace beepbox {
exports.defaultMidiExpression = 0x7F;
exports.defaultMidiPitchBend = 0x2000;
exports.analogousDrumMap = {
    35: { frequency: 0, duration: 2, volume: 3 },
    36: { frequency: 0, duration: 2, volume: 3 },
    37: { frequency: 5, duration: 1, volume: 3 },
    38: { frequency: 4, duration: 2, volume: 3 },
    39: { frequency: 5, duration: 2, volume: 3 },
    40: { frequency: 4, duration: 2, volume: 3 },
    41: { frequency: 1, duration: 2, volume: 3 },
    42: { frequency: 8, duration: 1, volume: 3 },
    43: { frequency: 1, duration: 2, volume: 3 },
    44: { frequency: 8, duration: 1, volume: 2 },
    45: { frequency: 2, duration: 2, volume: 3 },
    46: { frequency: 8, duration: 4, volume: 3 },
    47: { frequency: 2, duration: 2, volume: 3 },
    48: { frequency: 3, duration: 2, volume: 3 },
    49: { frequency: 7, duration: 4, volume: 3 },
    50: { frequency: 3, duration: 2, volume: 3 },
    51: { frequency: 6, duration: 4, volume: 2 },
    52: { frequency: 7, duration: 4, volume: 3 },
    53: { frequency: 6, duration: 2, volume: 3 },
    54: { frequency: 11, duration: 2, volume: 3 },
    55: { frequency: 9, duration: 4, volume: 3 },
    56: { frequency: 7, duration: 1, volume: 2 },
    57: { frequency: 7, duration: 4, volume: 3 },
    58: { frequency: 10, duration: 2, volume: 2 },
    59: { frequency: 6, duration: 4, volume: 3 },
    //60: { frequency:  7, duration: 1, volume: 3 }, // Hi Bongo
    //61: { frequency:  5, duration: 1, volume: 3 }, // Low Bongo
    //62: { frequency:  6, duration: 1, volume: 3 }, // Mute Hi Conga
    //63: { frequency:  5, duration: 1, volume: 3 }, // Open Hi Conga
    //64: { frequency:  4, duration: 1, volume: 3 }, // Low Conga
    //65: { frequency:  6, duration: 2, volume: 3 }, // High Timbale
    //66: { frequency:  4, duration: 2, volume: 3 }, // Low Timbale
    //67: { frequency: 10, duration: 1, volume: 2 }, // High Agogo
    //68: { frequency:  9, duration: 1, volume: 2 }, // Low Agogo
    69: { frequency: 10, duration: 2, volume: 3 },
    70: { frequency: 10, duration: 2, volume: 3 },
    //71: { frequency: 10, duration: 2, volume: 3 }, // Short Whistle
    //72: { frequency:  9, duration: 2, volume: 3 }, // Long Whistle
    73: { frequency: 10, duration: 1, volume: 2 },
    74: { frequency: 10, duration: 2, volume: 2 }
};
function midiVolumeToVolumeMult(volume) {
    // default midi volume is 100, pow(100/127,4)≈0.384 so I'm considering that the baseline volume.
    return Math.pow(volume / 127, 4.0) / 0.3844015376046128;
}
exports.midiVolumeToVolumeMult = midiVolumeToVolumeMult;
function volumeMultToMidiVolume(volumeMult) {
    return Math.pow(volumeMult * 0.3844015376046128, 0.25) * 127;
}
exports.volumeMultToMidiVolume = volumeMultToMidiVolume;
function midiExpressionToVolumeMult(expression) {
    return Math.pow(expression / 127, 4.0);
}
exports.midiExpressionToVolumeMult = midiExpressionToVolumeMult;
function volumeMultToMidiExpression(volumeMult) {
    return Math.pow(volumeMult, 0.25) * 127;
}
exports.volumeMultToMidiExpression = volumeMultToMidiExpression;
//}
