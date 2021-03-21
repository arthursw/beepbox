// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
var ColorConfig_1 = require("./ColorConfig");
//namespace beepbox {
var Layout = (function () {
    function Layout() {
        this.string = "\n\t\t";
        this.string = "\n\t\t\t/* wide screen */\n\t\t\t@media (min-width: 701px) {\n\t\t\t\t#beepboxEditorContainer {\n\t\t\t\t\tmax-width: initial;\n\t\t\t\t\theight: 100vh;\n\t\t\t\t}\n\t\t\t\t.beepboxEditor {\n\t\t\t\t\twidth: 100%;\n\t\t\t\t\tmin-height: 100vh;\n\t\t\t\t\tgrid-template-columns: minmax(0, 1fr) 30em; /* minmax(0, 1fr) min-content; Chrome 80 grid layout regression. https://bugs.chromium.org/p/chromium/issues/detail?id=1050307 */\n\t\t\t\t\tgrid-template-rows: minmax(481px, 1fr) min-content;\n\t\t\t\t\tgrid-template-areas: \"pattern-area settings-area\" \"track-area track-area\";\n\t\t\t\t}\n\t\t\t\t.beepboxEditor .pattern-area {\n\t\t\t\t\twidth: 100%;\n\t\t\t\t\theight: 100%;\n\t\t\t\t}\n\t\t\t\t.beepboxEditor .track-area {\n\t\t\t\t\twidth: 100%;\n\t\t\t\t\toverflow-y: auto;\n\t\t\t\t}\n\t\t\t\t.beepboxEditor .editor-widget-column {\n\t\t\t\t\tflex: 0;\n\t\t\t\t}\n\t\t\t\t.beepboxEditor .trackAndMuteContainer {\n\t\t\t\t\twidth: 100%;\n\t\t\t\t}\n\t\t\t\t.beepboxEditor .instrument-settings-area {\n\t\t\t\t\toverflow-y: auto;\n\t\t\t\t\tposition: relative;\n\t\t\t\t}\n\t\t\t\t.beepboxEditor .instrument-settings-area > .editor-controls {\n\t\t\t\t\tposition: absolute;\n\t\t\t\t\twidth: 100%;\n\t\t\t\t}\n\t\t\t\t.beepboxEditor .song-settings-area {\n\t\t\t\t\toverflow-y: auto;\n\t\t\t\t}\n\t\t\t\t\n\t\t\t\t.beepboxEditor .settings-area {\n\t\t\t\t\twidth: 30em;\n\t\t\t\t\tgrid-template-columns: minmax(0, 1fr) minmax(0, 1fr);\n\t\t\t\t\tgrid-template-rows: auto auto auto minmax(0, 1fr);\n\t\t\t\t\tgrid-template-areas:\n\t\t\t\t\t\t\"instrument-settings-area version-area\"\n\t\t\t\t\t\t\"instrument-settings-area play-pause-area\"\n\t\t\t\t\t\t\"instrument-settings-area menu-area\"\n\t\t\t\t\t\t\"instrument-settings-area song-settings-area\";\n\t\t\t\t}\n\t\t\t\t\n\t\t\t\t.beepboxEditor .barScrollBar {\n\t\t\t\t\tdisplay: none;\n\t\t\t\t}\n\t\t\t\t.beepboxEditor .trackContainer {\n\t\t\t\t\toverflow-x: auto;\n\t\t\t\t\tscrollbar-width: auto;\n\t\t\t\t\tscrollbar-color: " + ColorConfig_1.ColorConfig.uiWidgetBackground + " " + ColorConfig_1.ColorConfig.editorBackground + ";\n\t\t\t\t}\n\t\t\t\t.beepboxEditor .trackContainer::-webkit-scrollbar {\n\t\t\t\t\twidth: 20px;\n\t\t\t\t\theight: 20px;\n\t\t\t\t}\n\t\t\t\t.beepboxEditor .trackContainer::-webkit-scrollbar-track {\n\t\t\t\t\tbackground: " + ColorConfig_1.ColorConfig.editorBackground + ";\n\t\t\t\t}\n\t\t\t\t.beepboxEditor .trackContainer::-webkit-scrollbar-thumb {\n\t\t\t\t\tbackground-color: " + ColorConfig_1.ColorConfig.uiWidgetBackground + ";\n\t\t\t\t\tborder: 3px solid " + ColorConfig_1.ColorConfig.editorBackground + ";\n\t\t\t\t}\n\t\t\t}\n\t\t";
        this.HTMLStyleElement = document.head.appendChild(elements_strict_1.HTML.style({ type: "text/css" }));
    }
    Layout.setFullScreen = function (enabled) {
        this._styleElement.textContent = enabled ? this._fullScreenLayout : this._normalLayout;
    };
    Layout.readonly = _normalLayout;
    Layout.readonly = _fullScreenLayout;
    Layout.readonly = _styleElement;
    return Layout;
})();
exports.Layout = Layout;
//}
