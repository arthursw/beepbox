// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var SynthConfig_1 = require("../synth/SynthConfig");
var synth_1 = require("../synth/synth");
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
readonly;
secondaryChannel: string;
readonly;
primaryChannel: string;
readonly;
secondaryNote: string;
readonly;
primaryNote: string;
var ColorConfig = (function () {
    function ColorConfig() {
    }
    ColorConfig.readonly = themes;
    return ColorConfig;
})();
exports.ColorConfig = ColorConfig;
{
    [name, string];
    string;
}
{
    "dark classic";
    "\n\t\t\t\t:root {\n\t\t\t\t\t--page-margin: black;\n\t\t\t\t\t--editor-background: black;\n\t\t\t\t\t--hover-preview: white;\n\t\t\t\t\t--playhead: white;\n\t\t\t\t\t--primary-text: white;\n\t\t\t\t\t--secondary-text: #999;\n\t\t\t\t\t--inverted-text: black;\n\t\t\t\t\t--text-selection: rgba(119,68,255,0.99);\n\t\t\t\t\t--box-selection-fill: rgba(255,255,255,0.2);\n\t\t\t\t\t--loop-accent: #74f;\n\t\t\t\t\t--link-accent: #98f;\n\t\t\t\t\t--ui-widget-background: #444;\n\t\t\t\t\t--ui-widget-focus: #777;\n\t\t\t\t\t--pitch-background: #444;\n\t\t\t\t\t--tonic: #864;\n\t\t\t\t\t--fifth-note: #468;\n\t\t\t\t\t--white-piano-key: #bbb;\n\t\t\t\t\t--black-piano-key: #444;\n\t\t\t\t\t--pitch1-secondary-channel: #0099a1;\n\t\t\t\t\t--pitch1-primary-channel:   #25f3ff;\n\t\t\t\t\t--pitch1-secondary-note:    #00bdc7;\n\t\t\t\t\t--pitch1-primary-note:      #92f9ff;\n\t\t\t\t\t--pitch2-secondary-channel: #a1a100;\n\t\t\t\t\t--pitch2-primary-channel:   #ffff25;\n\t\t\t\t\t--pitch2-secondary-note:    #c7c700;\n\t\t\t\t\t--pitch2-primary-note:      #ffff92;\n\t\t\t\t\t--pitch3-secondary-channel: #c75000;\n\t\t\t\t\t--pitch3-primary-channel:   #ff9752;\n\t\t\t\t\t--pitch3-secondary-note:    #ff771c;\n\t\t\t\t\t--pitch3-primary-note:      #ffcdab;\n\t\t\t\t\t--pitch4-secondary-channel: #00a100;\n\t\t\t\t\t--pitch4-primary-channel:   #50ff50;\n\t\t\t\t\t--pitch4-secondary-note:    #00c700;\n\t\t\t\t\t--pitch4-primary-note:      #a0ffa0;\n\t\t\t\t\t--pitch5-secondary-channel: #d020d0;\n\t\t\t\t\t--pitch5-primary-channel:   #ff90ff;\n\t\t\t\t\t--pitch5-secondary-note:    #e040e0;\n\t\t\t\t\t--pitch5-primary-note:      #ffc0ff;\n\t\t\t\t\t--pitch6-secondary-channel: #7777b0;\n\t\t\t\t\t--pitch6-primary-channel:   #a0a0ff;\n\t\t\t\t\t--pitch6-secondary-note:    #8888d0;\n\t\t\t\t\t--pitch6-primary-note:      #d0d0ff;\n\t\t\t\t\t--noise1-secondary-channel: #6f6f6f;\n\t\t\t\t\t--noise1-primary-channel:   #aaaaaa;\n\t\t\t\t\t--noise1-secondary-note:    #a7a7a7;\n\t\t\t\t\t--noise1-primary-note:      #e0e0e0;\n\t\t\t\t\t--noise2-secondary-channel: #996633;\n\t\t\t\t\t--noise2-primary-channel:   #ddaa77;\n\t\t\t\t\t--noise2-secondary-note:    #cc9966;\n\t\t\t\t\t--noise2-primary-note:      #f0d0bb;\n\t\t\t\t\t--noise3-secondary-channel: #4a6d8f;\n\t\t\t\t\t--noise3-primary-channel:   #77aadd;\n\t\t\t\t\t--noise3-secondary-note:    #6f9fcf;\n\t\t\t\t\t--noise3-primary-note:      #bbd7ff;\n\t\t\t\t}\n\t\t\t",
        "light classic";
    "\n\t\t\t\t:root {\n\t\t\t\t\t-webkit-text-stroke-width: 0.5px;\n\t\t\t\t\t--page-margin: #685d88;\n\t\t\t\t\t--editor-background: white;\n\t\t\t\t\t--hover-preview: black;\n\t\t\t\t\t--playhead: rgba(0,0,0,0.5);\n\t\t\t\t\t--primary-text: black;\n\t\t\t\t\t--secondary-text: #777;\n\t\t\t\t\t--inverted-text: white;\n\t\t\t\t\t--text-selection: rgba(200,170,255,0.99);\n\t\t\t\t\t--box-selection-fill: rgba(0,0,0,0.1);\n\t\t\t\t\t--loop-accent: #98f;\n\t\t\t\t\t--link-accent: #74f;\n\t\t\t\t\t--ui-widget-background: #ececec;\n\t\t\t\t\t--ui-widget-focus: #eee;\n\t\t\t\t\t--pitch-background: #ececec;\n\t\t\t\t\t--tonic: #f0d6b6;\n\t\t\t\t\t--fifth-note: #bbddf0;\n\t\t\t\t\t--white-piano-key: #eee;\n\t\t\t\t\t--black-piano-key: #666;\n\t\t\t\t\t--pitch1-secondary-channel: #6CD9ED;\n\t\t\t\t\t--pitch1-primary-channel:   #00A0BD;\n\t\t\t\t\t--pitch1-secondary-note:    #34C2DC;\n\t\t\t\t\t--pitch1-primary-note:      #00758A;\n\t\t\t\t\t--pitch2-secondary-channel: #E3C941;\n\t\t\t\t\t--pitch2-primary-channel:   #B49700;\n\t\t\t\t\t--pitch2-secondary-note:    #D1B628;\n\t\t\t\t\t--pitch2-primary-note:      #836E00;\n\t\t\t\t\t--pitch3-secondary-channel: #FF9D61;\n\t\t\t\t\t--pitch3-primary-channel:   #E14E00;\n\t\t\t\t\t--pitch3-secondary-note:    #F67D3C;\n\t\t\t\t\t--pitch3-primary-note:      #B64000;\n\t\t\t\t\t--pitch4-secondary-channel: #4BE24B;\n\t\t\t\t\t--pitch4-primary-channel:   #00A800;\n\t\t\t\t\t--pitch4-secondary-note:    #2DC82D;\n\t\t\t\t\t--pitch4-primary-note:      #008000;\n\t\t\t\t\t--pitch5-secondary-channel: #FF90FF;\n\t\t\t\t\t--pitch5-primary-channel:   #E12EDF;\n\t\t\t\t\t--pitch5-secondary-note:    #EC6EEC;\n\t\t\t\t\t--pitch5-primary-note:      #A600A5;\n\t\t\t\t\t--pitch6-secondary-channel: #B5B5FE;\n\t\t\t\t\t--pitch6-primary-channel:   #6969FD;\n\t\t\t\t\t--pitch6-secondary-note:    #9393FE;\n\t\t\t\t\t--pitch6-primary-note:      #4A4AD7;\n\t\t\t\t\t--noise1-secondary-channel: #C1C1C1;\n\t\t\t\t\t--noise1-primary-channel:   #898989;\n\t\t\t\t\t--noise1-secondary-note:    #ADADAD;\n\t\t\t\t\t--noise1-primary-note:      #6C6C6C;\n\t\t\t\t\t--noise2-secondary-channel: #E8BB8C;\n\t\t\t\t\t--noise2-primary-channel:   #BD7D3A;\n\t\t\t\t\t--noise2-secondary-note:    #D1A374;\n\t\t\t\t\t--noise2-primary-note:      #836342;\n\t\t\t\t\t--noise3-secondary-channel: #9BC4EB;\n\t\t\t\t\t--noise3-primary-channel:   #4481BE;\n\t\t\t\t\t--noise3-secondary-note:    #7CA7D3;\n\t\t\t\t\t--noise3-primary-note:      #476685;\n\t\t\t\t}\n\t\t\t\t\n\t\t\t\t.beepboxEditor button, .beepboxEditor select {\n\t\t\t\t\tbox-shadow: inset 0 0 0 1px var(--secondary-text);\n\t\t\t\t}\n\t\t\t",
    ;
}
;
readonly;
pageMargin: string = "var(--page-margin)";
readonly;
editorBackground: string = "var(--editor-background)";
readonly;
hoverPreview: string = "var(--hover-preview)";
readonly;
playhead: string = "var(--playhead)";
readonly;
primaryText: string = "var(--primary-text)";
readonly;
secondaryText: string = "var(--secondary-text)";
readonly;
invertedText: string = "var(--inverted-text)";
readonly;
textSelection: string = "var(--text-selection)";
readonly;
boxSelectionFill: string = "var(--box-selection-fill)";
readonly;
loopAccent: string = "var(--loop-accent)";
readonly;
linkAccent: string = "var(--link-accent)";
readonly;
uiWidgetBackground: string = "var(--ui-widget-background)";
readonly;
uiWidgetFocus: string = "var(--ui-widget-focus)";
readonly;
pitchBackground: string = "var(--pitch-background)";
readonly;
tonic: string = "var(--tonic)";
readonly;
fifthNote: string = "var(--fifth-note)";
readonly;
whitePianoKey: string = "var(--white-piano-key)";
readonly;
blackPianoKey: string = "var(--black-piano-key)";
readonly;
pitchChannels: DictionaryArray < ChannelColors > ;
SynthConfig_1.toNameMap([
    {
        name: "pitch1",
        secondaryChannel: "var(--pitch1-secondary-channel)",
        primaryChannel: "var(--pitch1-primary-channel)",
        secondaryNote: "var(--pitch1-secondary-note)",
        primaryNote: "var(--pitch1-primary-note)"
    }, {
        name: "pitch2",
        secondaryChannel: "var(--pitch2-secondary-channel)",
        primaryChannel: "var(--pitch2-primary-channel)",
        secondaryNote: "var(--pitch2-secondary-note)",
        primaryNote: "var(--pitch2-primary-note)"
    }, {
        name: "pitch3",
        secondaryChannel: "var(--pitch3-secondary-channel)",
        primaryChannel: "var(--pitch3-primary-channel)",
        secondaryNote: "var(--pitch3-secondary-note)",
        primaryNote: "var(--pitch3-primary-note)"
    }, {
        name: "pitch4",
        secondaryChannel: "var(--pitch4-secondary-channel)",
        primaryChannel: "var(--pitch4-primary-channel)",
        secondaryNote: "var(--pitch4-secondary-note)",
        primaryNote: "var(--pitch4-primary-note)"
    }, {
        name: "pitch5",
        secondaryChannel: "var(--pitch5-secondary-channel)",
        primaryChannel: "var(--pitch5-primary-channel)",
        secondaryNote: "var(--pitch5-secondary-note)",
        primaryNote: "var(--pitch5-primary-note)"
    }, {
        name: "pitch6",
        secondaryChannel: "var(--pitch6-secondary-channel)",
        primaryChannel: "var(--pitch6-primary-channel)",
        secondaryNote: "var(--pitch6-secondary-note)",
        primaryNote: "var(--pitch6-primary-note)"
    },
]);
readonly;
noiseChannels: DictionaryArray < ChannelColors > ;
SynthConfig_1.toNameMap([
    {
        name: "noise1",
        secondaryChannel: "var(--noise1-secondary-channel)",
        primaryChannel: "var(--noise1-primary-channel)",
        secondaryNote: "var(--noise1-secondary-note)",
        primaryNote: "var(--noise1-primary-note)"
    }, {
        name: "noise2",
        secondaryChannel: "var(--noise2-secondary-channel)",
        primaryChannel: "var(--noise2-primary-channel)",
        secondaryNote: "var(--noise2-secondary-note)",
        primaryNote: "var(--noise2-primary-note)"
    }, {
        name: "noise3",
        secondaryChannel: "var(--noise3-secondary-channel)",
        primaryChannel: "var(--noise3-primary-channel)",
        secondaryNote: "var(--noise3-secondary-note)",
        primaryNote: "var(--noise3-primary-note)"
    },
]);
getChannelColor(song, synth_1.Song, channel, number);
ChannelColors;
{
    return channel < song.pitchChannelCount
        ? ColorConfig.pitchChannels[channel % ColorConfig.pitchChannels.length]
        : ColorConfig.noiseChannels[(channel - song.pitchChannelCount) % ColorConfig.noiseChannels.length];
}
readonly;
_styleElement: HTMLStyleElement = document.head.appendChild(elements_strict_1.HTML.style({ type: "text/css" }));
setTheme(name, string);
void {
    this: ._styleElement.textContent = this.themes[name],
    const: themeColor = document.querySelector("meta[name='theme-color']"),
    if: function (themeColor) {
        if (themeColor === void 0) { themeColor =  != null; }
        themeColor.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue('--ui-widget-background'));
    }
};
//}
