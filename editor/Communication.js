// import {ChangeSong} from "./changes";
var deep_diff_1 = require("deep-diff");
// declare var DeepDiff: any;
//namespace beepbox {
var animals = ['Ant', 'Bear', 'Bee', 'Bird', 'Butterfly', 'Camel', 'Cat', 'Caterpillar', 'Chicken', 'Cow', 'Crab', 'Crocodile', 'Deer', 'Dog', 'Dolphin', 'Donkey', 'Duck', 'Elephant', 'Fish', 'Frog', 'Giraffe', 'Goat', 'Hamster', 'Hedgehog', 'Horse', 'Jellyfish', 'Ladybird', 'Sheep', 'Lion', 'Mole', 'Monkey', 'Mouse', 'Octopus', 'Owl', 'Panda', 'Penguin', 'Pig', 'Pony', 'Rabbit', 'Seahorse', 'Snake', 'Spider', 'Starfish', 'Stingray', 'Tiger', 'Turkey', 'Turtle', 'Unicorn', 'Whale', 'Worm', 'Zebra', 'Pigeon', 'Dinosaur', 'Dragon', 'Kangaroo', 'Clownfish', 'Rhinoceros', 'Toad', 'Puppy', 'Hippo', 'Rat', 'Ostrich', 'Peacock'];
var adjectives = ['adorable', 'adventurous', 'aggressive', 'agreeable', 'alert', 'alive', 'amused', 'angry', 'annoyed', 'annoying', 'anxious', 'arrogant', 'ashamed', 'attractive', 'average', 'awful', 'bad', 'beautiful', 'better', 'bewildered', 'black', 'bloody', 'blue', 'blue-eyed', 'blushing', 'bored', 'brainy', 'brave', 'breakable', 'bright', 'busy', 'calm', 'careful', 'cautious', 'charming', 'cheerful', 'clean', 'clear', 'clever', 'cloudy', 'clumsy', 'colorful', 'combative', 'comfortable', 'concerned', 'condemned', 'confused', 'cooperative', 'courageous', 'crazy', 'creepy', 'crowded', 'cruel', 'curious', 'cute', 'dangerous', 'dark', 'dead', 'defeated', 'defiant', 'delightful', 'depressed', 'determined', 'different', 'difficult', 'disgusted', 'distinct', 'disturbed', 'dizzy', 'doubtful', 'drab', 'dull', 'eager', 'easy', 'elated', 'elegant', 'embarrassed', 'enchanting', 'encouraging', 'energetic', 'enthusiastic', 'envious', 'evil', 'excited', 'expensive', 'exuberant', 'fair', 'faithful', 'famous', 'fancy', 'fantastic', 'fierce', 'filthy', 'fine', 'foolish', 'fragile', 'frail', 'frantic', 'friendly', 'frightened', 'funny', 'gentle', 'gifted', 'glamorous', 'gleaming', 'glorious', 'good', 'gorgeous', 'graceful', 'grieving', 'grotesque', 'grumpy', 'handsome', 'happy', 'healthy', 'helpful', 'helpless', 'hilarious', 'homeless', 'homely', 'horrible', 'hungry', 'hurt', 'ill', 'important', 'impossible', 'inexpensive', 'innocent', 'inquisitive', 'itchy', 'jealous', 'jittery', 'jolly', 'joyous', 'kind', 'lazy', 'light', 'lively', 'lonely', 'long', 'lovely', 'lucky', 'magnificent', 'misty', 'modern', 'motionless', 'muddy', 'mushy', 'mysterious', 'nasty', 'naughty', 'nervous', 'nice', 'nutty', 'obedient', 'obnoxious', 'odd', 'old-fashioned', 'open', 'outrageous', 'outstanding', 'panicky', 'perfect', 'plain', 'pleasant', 'poised', 'poor', 'powerful', 'precious', 'prickly', 'proud', 'putrid', 'puzzled', 'quaint', 'real', 'relieved', 'repulsive', 'rich', 'scary', 'selfish', 'shiny', 'shy', 'silly', 'sleepy', 'smiling', 'smoggy', 'sore', 'sparkling', 'splendid', 'spotless', 'stormy', 'strange', 'stupid', 'successful', 'super', 'talented', 'tame', 'tasty', 'tender', 'tense', 'terrible', 'thankful', 'thoughtful', 'thoughtless', 'tired', 'tough', 'troubled', 'ugliest', 'ugly', 'uninterested', 'unsightly', 'unusual', 'upset', 'uptight', 'vast', 'victorious', 'vivacious', 'wandering', 'weary', 'wicked', 'wide-eyed', 'wild', 'witty', 'worried', 'worrisome', 'wrong', 'zany', 'zealous'];
var capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
var Communication = (function () {
    function Communication(_doc) {
        var _this = this;
        this._doc = _doc;
        this.whenUpdated = function () {
            // if(this.ignoreWhenUpdated) {
            // 	console.log('ignore when updated')
            // 	this.ignoreWhenUpdated = false;
            // 	return;
            // }
            var jsonObject = _this._doc.song.toJsonObject(true, 1, true);
            if (_this.currentSong == null) {
                _this.currentSong = jsonObject;
                return;
            }
            var changes = deep_diff_1.DeepDiff.diff(_this.currentSong, jsonObject);
            var data = JSON.stringify({ user: _this.username, changes: changes, date: Date.now() });
            _this.socket.send(data);
            _this.currentSong = jsonObject;
        };
        this.username = capitalize(adjectives[Math.floor(Math.random() * adjectives.length)]) + ' ' + animals[Math.floor(Math.random() * animals.length)];
        this._doc.notifier.watch(this.whenUpdated);
        this.socket = new WebSocket('ws://localhost:8080');
        this.socket.onopen = function (event) {
            _this.socket.send("Hi server, I'm " + _this.username);
        };
        this.socket.onmessage = function (event) {
            console.log(event.data);
            try {
                var jsonObject = _this._doc.song.toJsonObject(true, 1, true);
                var message = JSON.parse(event.data);
                message.changes.forEach(function (change) {
                    deep_diff_1.DeepDiff.applyChange(jsonObject, true, change);
                });
                console.log('change song from user ' + message.user);
                // this.ignoreWhenUpdated = true;
                // let jsonString = JSON.stringify(jsonObject);
                // this._doc.record(new ChangeSong(this._doc, jsonString), true, true);
                _this._doc.song.fromJsonObject(jsonObject);
            }
            catch (e) {
            }
        };
    }
    return Communication;
})();
exports.Communication = Communication;
//}
