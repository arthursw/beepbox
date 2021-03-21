// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var SynthConfig_1 = require("../synth/SynthConfig");
exports.Config = SynthConfig_1.Config;
var EditorConfig_1 = require("./EditorConfig");
exports.EditorConfig = EditorConfig_1.EditorConfig;
var ColorConfig_1 = require("./ColorConfig");
exports.ColorConfig = ColorConfig_1.ColorConfig;
require("./style"); // Import for the side effects, there's no exports.
var SongEditor_1 = require("./SongEditor");
exports.SongEditor = SongEditor_1.SongEditor;
var synth_1 = require("../synth/synth");
exports.Note = synth_1.Note;
exports.Pattern = synth_1.Pattern;
exports.Instrument = synth_1.Instrument;
exports.Channel = synth_1.Channel;
exports.Synth = synth_1.Synth;
var SongDocument_1 = require("./SongDocument");
exports.SongDocument = SongDocument_1.SongDocument;
var ExportPrompt_1 = require("./ExportPrompt");
exports.ExportPrompt = ExportPrompt_1.ExportPrompt;
var changes_1 = require("./changes");
exports.ChangePreset = changes_1.ChangePreset;
var Communication_1 = require("./Communication");
//namespace beepbox {
var doc = new SongDocument_1.SongDocument();
new Communication_1.Communication(doc);
var editor = new SongEditor_1.SongEditor(doc);
var beepboxEditorContainer = document.getElementById("beepboxEditorContainer");
!;
beepboxEditorContainer.appendChild(editor.mainLayer);
editor.whenUpdated();
editor.mainLayer.focus();
// don't autoplay on mobile devices, wait for input.
if (!EditorConfig_1.isMobile && doc.autoPlay) {
    function autoplay() {
        if (!document.hidden) {
            doc.synth.play();
            editor.updatePlayButton();
            window.removeEventListener("visibilitychange", autoplay);
        }
    }
    if (document.hidden) {
        // Wait until the tab is visible to autoplay:
        window.addEventListener("visibilitychange", autoplay);
    }
    else {
        autoplay();
    }
}
// BeepBox uses browser history state as its own undo history. Browsers typically
// remember scroll position for each history state, but BeepBox users would prefer not 
// auto scrolling when undoing. Sadly this tweak doesn't work on Edge or IE.
if ("scrollRestoration" in history)
    history.scrollRestoration = "manual";
editor.updatePlayButton();
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service_worker.js", { updateViaCache: "all", scope: "/" }).catch(function () { });
}
// When compiling synth.ts as a standalone module named "beepbox", expose these classes as members to JavaScript:
//}
