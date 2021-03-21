// import {ChangeSong} from "./changes";
// import {DeepDiff} from "deep-diff";
// import {Diff} from "diff";
import {SongDocument} from "./SongDocument";

declare var DeepDiff: any;

//namespace beepbox {

	const animals = ['Ant', 'Bear', 'Bee', 'Bird', 'Butterfly', 'Camel', 'Cat', 'Caterpillar', 'Chicken', 'Cow', 'Crab', 'Crocodile', 'Deer', 'Dog', 'Dolphin', 'Donkey', 'Duck', 'Elephant', 'Fish', 'Frog', 'Giraffe', 'Goat', 'Hamster', 'Hedgehog', 'Horse', 'Jellyfish', 'Ladybird', 'Sheep', 'Lion', 'Mole', 'Monkey', 'Mouse', 'Octopus', 'Owl', 'Panda', 'Penguin', 'Pig', 'Pony', 'Rabbit', 'Seahorse', 'Snake', 'Spider', 'Starfish', 'Stingray', 'Tiger', 'Turkey', 'Turtle', 'Unicorn', 'Whale', 'Worm', 'Zebra', 'Pigeon', 'Dinosaur', 'Dragon', 'Kangaroo', 'Clownfish', 'Rhinoceros', 'Toad', 'Puppy', 'Hippo', 'Rat', 'Ostrich', 'Peacock'];
	const adjectives = ['adorable', 'adventurous', 'aggressive', 'agreeable', 'alert', 'alive', 'amused', 'angry', 'annoyed', 'annoying', 'anxious', 'arrogant', 'ashamed', 'attractive', 'average', 'awful', 'bad', 'beautiful', 'better', 'bewildered', 'black', 'bloody', 'blue', 'blue-eyed', 'blushing', 'bored', 'brainy', 'brave', 'breakable', 'bright', 'busy', 'calm', 'careful', 'cautious', 'charming', 'cheerful', 'clean', 'clear', 'clever', 'cloudy', 'clumsy', 'colorful', 'combative', 'comfortable', 'concerned', 'condemned', 'confused', 'cooperative', 'courageous', 'crazy', 'creepy', 'crowded', 'cruel', 'curious', 'cute', 'dangerous', 'dark', 'dead', 'defeated', 'defiant', 'delightful', 'depressed', 'determined', 'different', 'difficult', 'disgusted', 'distinct', 'disturbed', 'dizzy', 'doubtful', 'drab', 'dull', 'eager', 'easy', 'elated', 'elegant', 'embarrassed', 'enchanting', 'encouraging', 'energetic', 'enthusiastic', 'envious', 'evil', 'excited', 'expensive', 'exuberant', 'fair', 'faithful', 'famous', 'fancy', 'fantastic', 'fierce', 'filthy', 'fine', 'foolish', 'fragile', 'frail', 'frantic', 'friendly', 'frightened', 'funny', 'gentle', 'gifted', 'glamorous', 'gleaming', 'glorious', 'good', 'gorgeous', 'graceful', 'grieving', 'grotesque', 'grumpy', 'handsome', 'happy', 'healthy', 'helpful', 'helpless', 'hilarious', 'homeless', 'homely', 'horrible', 'hungry', 'hurt', 'ill', 'important', 'impossible', 'inexpensive', 'innocent', 'inquisitive', 'itchy', 'jealous', 'jittery', 'jolly', 'joyous', 'kind', 'lazy', 'light', 'lively', 'lonely', 'long', 'lovely', 'lucky', 'magnificent', 'misty', 'modern', 'motionless', 'muddy', 'mushy', 'mysterious', 'nasty', 'naughty', 'nervous', 'nice', 'nutty', 'obedient', 'obnoxious', 'odd', 'old-fashioned', 'open', 'outrageous', 'outstanding', 'panicky', 'perfect', 'plain', 'pleasant', 'poised', 'poor', 'powerful', 'precious', 'prickly', 'proud', 'putrid', 'puzzled', 'quaint', 'real', 'relieved', 'repulsive', 'rich', 'scary', 'selfish', 'shiny', 'shy', 'silly', 'sleepy', 'smiling', 'smoggy', 'sore', 'sparkling', 'splendid', 'spotless', 'stormy', 'strange', 'stupid', 'successful', 'super', 'talented', 'tame', 'tasty', 'tender', 'tense', 'terrible', 'thankful', 'thoughtful', 'thoughtless', 'tired', 'tough', 'troubled', 'ugliest', 'ugly', 'uninterested', 'unsightly', 'unusual', 'upset', 'uptight', 'vast', 'victorious', 'vivacious', 'wandering', 'weary', 'wicked', 'wide-eyed', 'wild', 'witty', 'worried', 'worrisome', 'wrong', 'zany', 'zealous'];

	let capitalize = (str: string)=> {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	export class Communication {
		username: string
		socket: WebSocket
		currentSong: Object
		songIsSet = false
		// ignoreWhenUpdated = false;

		constructor(private _doc: SongDocument) {
			this.username = capitalize(adjectives[Math.floor(Math.random()*adjectives.length)]) + ' ' + animals[Math.floor(Math.random()*animals.length)];
			this._doc.notifier.watch(this.whenUpdated);
			let host = location.hostname == 'localhost' ? 'localhost:5000' : location.hostname + '/ws/';
			this.socket = new WebSocket('ws://' + host);
			this.socket.onopen = (event) => {
				let data = JSON.stringify({ user: this.username, type: 'get-song', date: Date.now() });
				console.log('send: ', data)
				this.socket.send(data);
			};
			this.socket.onmessage = (event)=> {
				console.log('receive: ', event.data)

				try {
					let message = JSON.parse(event.data);
					if (message.type == 'change') {
						let jsonObject: Object = this._doc.song.toJsonObject(true, 1, true);
						message.changes.forEach(function (change: any) {
							DeepDiff.applyChange(jsonObject, true, change);
						});
						
						console.log('change song from user ' + message.user, message.changes, jsonObject);

						// let jsonString = JSON.stringify(jsonObject);
						// this.ignoreWhenUpdated = true;
						// this._doc.record(new ChangeSong(this._doc, jsonString), true, true);
						this._doc.song.fromJsonObject(jsonObject);
						this._doc.notifier.changed();
						this.currentSong = jsonObject;
					} else if (message.type == 'get-song') {
						let jsonObject: Object = this._doc.song.toJsonObject(true, 1, true);
						let data = JSON.stringify({ user: this.username, type: 'set-song', song: jsonObject, date: Date.now() });
						this.socket.send(data);
					} else if (message.type == 'set-song' && !this.songIsSet) {
						// let jsonString = JSON.stringify(message.song);
						// this.ignoreWhenUpdated = true;
						// this._doc.record(new ChangeSong(this._doc, jsonString), true, true);
						this._doc.song.fromJsonObject(message.song);
						this._doc.notifier.changed();
						this.currentSong = message.song;
						this.songIsSet = true;
					}
				} catch (e) {
					
				}
			};
		}

		public whenUpdated = (): void => {
			// if(this.ignoreWhenUpdated) {
			// 	console.log('ignore when updated')
			// 	this.ignoreWhenUpdated = false;
			// 	return;
			// }
			const jsonObject: Object = this._doc.song.toJsonObject(true, 1, true);
			
			if(this.currentSong == null) {
				this.currentSong = jsonObject;
				return;
			}

			let changes = DeepDiff.diff(this.currentSong, jsonObject);
			if(changes == null) {
				return;
			}
			console.log('when updated: ', changes, jsonObject);
			let data = JSON.stringify({ user: this.username, type: 'change', changes: changes, date: Date.now() });
			this.socket.send(data);

			this.currentSong = jsonObject;
		}
	}
//}
