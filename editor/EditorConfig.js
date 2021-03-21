// Copyright (C) 2020 John Nesky, distributed under the MIT license.
readonly;
presets: DictionaryArray();
readonly;
isNoise ?  : boolean;
readonly;
generalMidi ?  : boolean;
readonly;
midiProgram ?  : number;
readonly;
midiSubharmonicOctaves ?  : number;
readonly;
customType ?  : SynthConfig_1.InstrumentType;
readonly;
settings ?  : any;
exports.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|android|ipad|playbook|silk/i.test(navigator.userAgent);
function prettyNumber(value) {
    return value.toFixed(2).replace(/\.?0*$/, "");
}
exports.prettyNumber = prettyNumber;
var EditorConfig = (function () {
    function EditorConfig() {
        this.string = "3.0.13";
        this.string = "BeepBox " + EditorConfig.version;
    }
    EditorConfig.prototype.DictionaryArray = ;
    EditorConfig.valueToPreset = ;
    EditorConfig.readonly = version;
    EditorConfig.readonly = versionDisplayName;
    EditorConfig.readonly = presetCategories;
    return EditorConfig;
})();
exports.EditorConfig = EditorConfig;
null;
{
    var categoryIndex = presetValue >> 6;
    var presetIndex = presetValue & 0x3F;
    return EditorConfig.presetCategories[categoryIndex].presets[presetIndex];
}
midiProgramToPresetValue(program, number);
number | null;
{
    for (var categoryIndex = 0; categoryIndex < EditorConfig.presetCategories.length; categoryIndex++) {
        var category = EditorConfig.presetCategories[categoryIndex];
        for (var presetIndex = 0; presetIndex < category.presets.length; presetIndex++) {
            var preset = category.presets[presetIndex];
            if (preset.generalMidi && preset.midiProgram == program)
                return (categoryIndex << 6) + presetIndex;
        }
    }
    return null;
}
nameToPresetValue(presetName, string);
number | null;
{
    for (var categoryIndex = 0; categoryIndex < EditorConfig.presetCategories.length; categoryIndex++) {
        var category = EditorConfig.presetCategories[categoryIndex];
        for (var presetIndex = 0; presetIndex < category.presets.length; presetIndex++) {
            var preset = category.presets[presetIndex];
            if (preset.name == presetName)
                return (categoryIndex << 6) + presetIndex;
        }
    }
    return null;
}
//}
