// Copyright (C) 2020 John Nesky, distributed under the MIT license.
var synth_1 = require("../synth/synth");
var versionPrefix = "songVersion: ";
var maximumSongCount = 8;
var maximumWorkPerVersion = 3 * 60 * 1000; // 3 minutes
var minimumWorkPerSpan = 1 * 60 * 1000; // 1 minute
function keyIsVersion(key) {
    return key.indexOf(versionPrefix) == 0;
}
function keyToVersion(key) {
    return JSON.parse(key.substring(versionPrefix.length));
}
function versionToKey(version) {
    return versionPrefix + JSON.stringify(version);
}
exports.versionToKey = versionToKey;
function generateUid() {
    // Not especially robust, but simple and effective!
    return ((Math.random() * (-1 >>> 0)) >>> 0).toString(32);
}
exports.generateUid = generateUid;
function compareSongs(a, b) {
    return b.versions[0].time - a.versions[0].time;
}
function compareVersions(a, b) {
    return b.time - a.time;
}
var SongRecovery = (function () {
    function SongRecovery() {
        this._song = new synth_1.Song();
    }
    SongRecovery.getAllRecoveredSongs = function () {
        var songs = [];
        var songsByUid = {};
        for (var i = 0; i < localStorage.length; i++) {
            var itemKey = localStorage.key(i);
            !;
            if (keyIsVersion(itemKey)) {
                var version = keyToVersion(itemKey);
                var song = songsByUid[version.uid];
                if (song == undefined) {
                    song = { versions: [] };
                    songsByUid[version.uid] = song;
                    songs.push(song);
                }
                song.versions.push(version);
            }
        }
        for (var _i = 0; _i < songs.length; _i++) {
            var song = songs[_i];
            song.versions.sort(compareVersions);
        }
        songs.sort(compareSongs);
        return songs;
    };
    SongRecovery.prototype.saveVersion = function (uid, songData) {
        var _this = this;
        var newTime = Math.round(Date.now());
        clearTimeout(this._saveVersionTimeoutHandle);
        this._saveVersionTimeoutHandle = setTimeout(function () {
            try {
                // Ensure that the song is not corrupted before saving it.
                _this._song.fromBase64String(songData);
            }
            catch (error) {
                window.alert("Whoops, the song data appears to have been corrupted! Please try to recover the last working version of the song from the \"Recover Recent Song...\" option in BeepBox's \"File\" menu.");
                return;
            }
            var songs = SongRecovery.getAllRecoveredSongs();
            var currentSong = null = null;
            for (var _i = 0; _i < songs.length; _i++) {
                var song = songs[_i];
                if (song.versions[0].uid == uid) {
                    currentSong = song;
                }
            }
            if (currentSong == null) {
                currentSong = { versions: [] };
                songs.unshift(currentSong);
            }
            var versions = currentSong.versions;
            var newWork = 1000; // default to 1 second of work for the first change.
            if (versions.length > 0) {
                var mostRecentTime = versions[0].time;
                var mostRecentWork = versions[0].work;
                newWork = mostRecentWork + Math.min(maximumWorkPerVersion, newTime - mostRecentTime);
            }
            var newVersion = { uid: uid, time: newTime, work: newWork };
            var newKey = versionToKey(newVersion);
            versions.unshift(newVersion);
            localStorage.setItem(newKey, songData);
            // Consider deleting an old version to free up space.
            var minSpan = minimumWorkPerSpan; // start out with a gap between versions.
            var spanMult = Math.pow(2, 1 / 2); // Double the span every 2 versions back.
            for (var i = 1; i < versions.length; i++) {
                var currentWork = versions[i].work;
                var olderWork = (i == versions.length - 1) ? 0.0 : versions[i + 1].work;
                // If not enough work happened between two versions, discard one of them.
                if (currentWork - olderWork < minSpan) {
                    var indexToDiscard = i;
                    if (i < versions.length - 1) {
                        var currentTime = versions[i].time;
                        var newerTime = versions[i - 1].time;
                        var olderTime = versions[i + 1].time;
                        // Weird heuristic: Between the three adjacent versions, prefer to keep
                        // the newest and the oldest, discarding the middle one (i), unless
                        // there is a large gap of time between the newest and middle one, in
                        // which case the middle one represents the end of a span of work and is
                        // thus more memorable.
                        if ((currentTime - olderTime) < 0.5 * (newerTime - currentTime)) {
                            indexToDiscard = i + 1;
                        }
                    }
                    localStorage.removeItem(versionToKey(versions[indexToDiscard]));
                    break;
                }
                minSpan *= spanMult;
            }
            // If there are too many songs, discard the least important ones.
            // Songs that are older, or have less work, are less important.
            while (songs.length > maximumSongCount) {
                var leastImportantSong = null = null;
                var leastImportance = Number.POSITIVE_INFINITY;
                for (var i_1 = Math.round(maximumSongCount / 2); i_1 < songs.length; i_1++) {
                    var song = songs[i_1];
                    var timePassed = newTime - song.versions[0].time;
                    // Convert the time into a factor of 12 hours, add one, then divide by the result.
                    // This creates a curve that starts at 1, and then gradually drops off.
                    var timeScale = 1.0 / ((timePassed / (12 * 60 * 60 * 1000)) + 1.0);
                    // Add 5 minutes of work, to balance out simple songs a little bit.
                    var adjustedWork = song.versions[0].work + 5 * 60 * 1000;
                    var weight = adjustedWork * timeScale;
                    if (leastImportance > weight) {
                        leastImportance = weight;
                        leastImportantSong = song;
                    }
                }
                for (var _a = 0; _a < leastImportantSong.length; _a++) {
                    var version = leastImportantSong[_a];
                    !.versions;
                }
            }
        });
        {
            localStorage.removeItem(versionToKey(version));
        }
        songs.splice(songs.indexOf(leastImportantSong, !), 1);
    };
    return SongRecovery;
})();
exports.SongRecovery = SongRecovery;
750;
; // Wait 3/4 of a second before saving a version.
//}
