// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var SongRecovery_1 = require("./SongRecovery");
var elements_strict_1 = require("imperative-html/dist/esm/elements-strict");
//namespace beepbox {
var button = elements_strict_1.HTML.button, div = elements_strict_1.HTML.div, h2 = elements_strict_1.HTML.h2, p = elements_strict_1.HTML.p, select = elements_strict_1.HTML.select, option = elements_strict_1.HTML.option, iframe = elements_strict_1.HTML.iframe;
var SongRecoveryPrompt = (function () {
    function SongRecoveryPrompt(_doc) {
        var _this = this;
        this._doc = _doc;
        this.readonly = _songContainer;
        this.HTMLDivElement = div();
        this.readonly = _cancelButton;
        this.HTMLButtonElement = button({ class: "cancelButton" });
        this.readonly = container;
        this.HTMLDivElement = div({ class: "prompt", style: "width: 300px;" }, h2("Song Recovery"), div({ style: "max-height: 385px; overflow-y: auto;" }, p("This is a TEMPORARY list of songs you have recently modified. Please keep your own backups of songs you care about!"), this._songContainer, p("(If \"Display Song Data in URL\" is enabled in your preferences, then you may also be able to find song versions in your browser history. However, song recovery won't work if you were browsing in private/incognito mode.)")), this._cancelButton);
        this._close = function () {
            _this._doc.undo();
        };
        this.cleanUp = function () {
            _this._cancelButton.removeEventListener("click", _this._close);
        };
        this._cancelButton.addEventListener("click", this._close);
        var songs = SongRecovery_1.SongRecovery.getAllRecoveredSongs();
        if (songs.length == 0) {
            this._songContainer.appendChild(p("There are no recovered songs available yet. Try making a song!"));
        }
        for (var _i = 0; _i < songs.length; _i++) {
            var song = songs[_i];
            var versionMenu = select({ style: "width: 100%;" });
            for (var _a = 0, _b = song.versions; _a < _b.length; _a++) {
                var version = _b[_a];
                versionMenu.appendChild(option({ value: version.time }, new Date(version.time).toLocaleString()));
            }
            var player = iframe({ style: "width: 100%; height: 60px; border: none; display: block;" });
            player.src = "player/#song=" + window.localStorage.getItem(SongRecovery_1.versionToKey(song.versions[0]));
            var container = div({ style: "margin: 4px 0;" }, div({ class: "selectContainer", style: "width: 100%; margin: 2px 0;" }, versionMenu), player);
            this._songContainer.appendChild(container);
            versionMenu.addEventListener("change", function () {
                var version = song.versions[versionMenu.selectedIndex];
                player.contentWindow;
                !.location.replace("player/#song=" + window.localStorage.getItem(SongRecovery_1.versionToKey(version)));
                player.contentWindow;
                !.dispatchEvent(new Event("hashchange"));
            });
        }
    }
    return SongRecoveryPrompt;
})();
exports.SongRecoveryPrompt = SongRecoveryPrompt;
//}
