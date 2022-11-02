// import {ChangeSong} from "./changes";
// import {DeepDiff} from "deep-diff";
// import {Diff} from "diff";
import { SongDocument } from "./SongDocument";

declare var DeepDiff: any;

//namespace beepbox {

const animals = ['Ant', 'Bear', 'Bee', 'Bird', 'Butterfly', 'Camel', 'Cat', 'Caterpillar', 'Chicken', 'Cow', 'Crab', 'Crocodile', 'Deer', 'Dog', 'Dolphin', 'Donkey', 'Duck', 'Elephant', 'Fish', 'Frog', 'Giraffe', 'Goat', 'Hamster', 'Hedgehog', 'Horse', 'Jellyfish', 'Ladybird', 'Sheep', 'Lion', 'Mole', 'Monkey', 'Mouse', 'Octopus', 'Owl', 'Panda', 'Penguin', 'Pig', 'Pony', 'Rabbit', 'Seahorse', 'Snake', 'Spider', 'Starfish', 'Stingray', 'Tiger', 'Turkey', 'Turtle', 'Unicorn', 'Whale', 'Worm', 'Zebra', 'Pigeon', 'Dinosaur', 'Dragon', 'Kangaroo', 'Clownfish', 'Rhinoceros', 'Toad', 'Puppy', 'Hippo', 'Rat', 'Ostrich', 'Peacock'];
const adjectives = ['adorable', 'adventurous', 'aggressive', 'agreeable', 'alert', 'alive', 'amused', 'angry', 'annoyed', 'annoying', 'anxious', 'arrogant', 'ashamed', 'attractive', 'average', 'awful', 'bad', 'beautiful', 'better', 'bewildered', 'black', 'bloody', 'blue', 'blue-eyed', 'blushing', 'bored', 'brainy', 'brave', 'breakable', 'bright', 'busy', 'calm', 'careful', 'cautious', 'charming', 'cheerful', 'clean', 'clear', 'clever', 'cloudy', 'clumsy', 'colorful', 'combative', 'comfortable', 'concerned', 'condemned', 'confused', 'cooperative', 'courageous', 'crazy', 'creepy', 'crowded', 'cruel', 'curious', 'cute', 'dangerous', 'dark', 'dead', 'defeated', 'defiant', 'delightful', 'depressed', 'determined', 'different', 'difficult', 'disgusted', 'distinct', 'disturbed', 'dizzy', 'doubtful', 'drab', 'dull', 'eager', 'easy', 'elated', 'elegant', 'embarrassed', 'enchanting', 'encouraging', 'energetic', 'enthusiastic', 'envious', 'evil', 'excited', 'expensive', 'exuberant', 'fair', 'faithful', 'famous', 'fancy', 'fantastic', 'fierce', 'filthy', 'fine', 'foolish', 'fragile', 'frail', 'frantic', 'friendly', 'frightened', 'funny', 'gentle', 'gifted', 'glamorous', 'gleaming', 'glorious', 'good', 'gorgeous', 'graceful', 'grieving', 'grotesque', 'grumpy', 'handsome', 'happy', 'healthy', 'helpful', 'helpless', 'hilarious', 'homeless', 'homely', 'horrible', 'hungry', 'hurt', 'ill', 'important', 'impossible', 'inexpensive', 'innocent', 'inquisitive', 'itchy', 'jealous', 'jittery', 'jolly', 'joyous', 'kind', 'lazy', 'light', 'lively', 'lonely', 'long', 'lovely', 'lucky', 'magnificent', 'misty', 'modern', 'motionless', 'muddy', 'mushy', 'mysterious', 'nasty', 'naughty', 'nervous', 'nice', 'nutty', 'obedient', 'obnoxious', 'odd', 'old-fashioned', 'open', 'outrageous', 'outstanding', 'panicky', 'perfect', 'plain', 'pleasant', 'poised', 'poor', 'powerful', 'precious', 'prickly', 'proud', 'putrid', 'puzzled', 'quaint', 'real', 'relieved', 'repulsive', 'rich', 'scary', 'selfish', 'shiny', 'shy', 'silly', 'sleepy', 'smiling', 'smoggy', 'sore', 'sparkling', 'splendid', 'spotless', 'stormy', 'strange', 'stupid', 'successful', 'super', 'talented', 'tame', 'tasty', 'tender', 'tense', 'terrible', 'thankful', 'thoughtful', 'thoughtless', 'tired', 'tough', 'troubled', 'ugliest', 'ugly', 'uninterested', 'unsightly', 'unusual', 'upset', 'uptight', 'vast', 'victorious', 'vivacious', 'wandering', 'weary', 'wicked', 'wide-eyed', 'wild', 'witty', 'worried', 'worrisome', 'wrong', 'zany', 'zealous'];

let capitalize = (str: string) => {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export class Communication {
	username: string
	socket: WebSocket
	lastSentSong: Object
	songIsSet = false
	pingTimeout = 35000
	updateTimeout = null
	recievedChanges = []
	
	// ignoreWhenUpdated = false;

	constructor(private _doc: SongDocument) {
		let w: any = window
		w._doc = _doc
		w.communication = this
		let svg = document.querySelector('svg')
		svg?.addEventListener('keydown', (event)=> {
			console.log(event)
			if(event.key == ' '){
				w.stopCommunicationTest()
			}
		})

		this.username = capitalize(adjectives[Math.floor(Math.random() * adjectives.length)]) + ' ' + animals[Math.floor(Math.random() * animals.length)];
		this._doc.notifier.watch(this.whenUpdated);
		let host = location.hostname == 'localhost' ? 'localhost:5000' : location.hostname + '/ws/';
		this.socket = new WebSocket('ws://' + host);

		let heartbeat = ()=> {
			if (!this.socket) return;
			if (this.socket.readyState !== 1) return;
			this.socket.send("heartbeat");
			setTimeout(heartbeat, this.pingTimeout);
		}

		this.socket.onopen = (event) => {
			let data = JSON.stringify({ user: this.username, type: 'get-song', date: Date.now() });
			console.log('send: ', data)
			this.socket.send(data);
			heartbeat()
		};

		this.socket.onmessage = (event) => {
			// console.log('receive: ', event.data)

			try {
				let message = JSON.parse(event.data);
				if (message.type == 'change') {
					// console.log('--- receive update:')
					// w.detectHole()
					let jsonObject: Object = this.getJsonSong();
					// w.printNotes(jsonObject)
					jsonObject = this.convertNotesToObject(jsonObject);
					message.changes.forEach(function (change: any) {
						DeepDiff.applyChange(jsonObject, true, change);
					});
					this.recievedChanges = this.recievedChanges.concat(message.changes)

					// console.log('change song from user ' + message.user, message.changes, jsonObject);

					// let jsonString = JSON.stringify(jsonObject);
					// this.ignoreWhenUpdated = true;
					// this._doc.record(new ChangeSong(this._doc, jsonString), true, true);
					jsonObject = this.convertNotesToArray(jsonObject)
					this.fixNotes(jsonObject)
					this._doc.song.fromJsonObject(jsonObject);
					this._doc.notifier.changed();
					// this.lastSentSong = jsonObject;
					// console.log('last song:')
					// w.printNotes(this.lastSentSong)
					// w.detectHole()
					// console.log('--- end recieve update.')
				} else if (message.type == 'get-song') {
					
					let jsonObject: Object = this.getJsonSong()
					let data = JSON.stringify({ user: this.username, type: 'set-song', song: jsonObject, date: Date.now() });
					// console.log('--- send song:')
					// w.printNotes(jsonObject)
					this.socket.send(data);
					// console.log('--- end send song.')
				} else if (message.type == 'set-song' && !this.songIsSet) {
					// console.log('--- receive song:')
					// w.printNotes(message.song)
					this._doc.song.fromJsonObject(message.song);
					this._doc.notifier.changed();
					this.lastSentSong = this.convertNotesToObject(message.song);
					this.songIsSet = true;
					// console.log('--- end receive song.')
				}
			} catch (e) {

			}
		};
	}

	public getJsonSong(): Object {
		return structuredClone(this._doc.song.toJsonObject(true, 1, true));
	}

	public convertNotesToObject(song: any): Object {
		let jsonObject = structuredClone(song)
		for(let channel of jsonObject.channels) {
			for(let pattern of channel.patterns) {
				let notesObject:any = {}
				for(let i=0 ; i<pattern.notes.length ; i++) {
					let note = pattern.notes[i]
					notesObject[JSON.stringify(note)] = note;
				}
				pattern.notes = notesObject;
			}
		}
		return jsonObject
	}

	public convertNotesToArray(song: any): Object {
		let jsonObject = structuredClone(song)
		for(let channel of jsonObject.channels) {
			for(let pattern of channel.patterns) {
				pattern.notes = Object.values(pattern.notes).sort((a:any, b:any)=> a.points[0].tick - b.points[0].tick);
			}
		}
		return jsonObject
	}

	public fixNotes(jsonObject:any): void {
		for(let channel of jsonObject.channels) {
			for(let pattern of channel.patterns) {
				pattern.notes = pattern.notes.sort((a:any, b:any)=> a.points[0].tick - b.points[0].tick);
				let timesToNote = new Map()
				let notes = []
				for(let note of pattern.notes) {
					let name = ''+note.points[0].tick+'-'+note.points[1].tick
					let existingNote = timesToNote.get(name)
					if(existingNote != null) {
						existingNote.pitches = existingNote.pitches.concat(note.pitches)
					} else {
						notes.push(note)
						timesToNote.set(name, note)
					}
				}
				pattern.notes = notes
			}
		}
	}

	public whenUpdated = (): void => {
		// if(this.ignoreWhenUpdated) {
		// 	console.log('ignore when updated')
		// 	this.ignoreWhenUpdated = false;
		// 	return;
		// }
		// let w: any = window
		// console.log('--- when update: ');
		// w.detectHole()
		let jsonObject: Object = this.getJsonSong();
		// console.log('song:')
		// w.printNotes(jsonObject)
		// console.log('last song:')
		// w.printNotes(this.lastSentSong)
		jsonObject = this.convertNotesToObject(jsonObject);
		if (this.lastSentSong == null) {
			this.lastSentSong = jsonObject;
			return;
		}

		let changes = DeepDiff.diff(this.lastSentSong, jsonObject);
		if(changes == null) {
			return
		}
		let changesToKeep = [];
		for(let change of changes) {
			if(this.recievedChanges.findIndex((c)=>DeepDiff.diff(change, c) == null)<0) {
				changesToKeep.push(change)
			}
		}
		if (changesToKeep.length == 0) {
			return;
		}
		if(this.updateTimeout != null) {
			return
		}

		// console.log('send update: ', changesToKeep, jsonObject);
		let data = JSON.stringify({ user: this.username, type: 'change', changes: changesToKeep, date: Date.now() });
		this.socket.send(data);

		clearTimeout(this.updateTimeout as any)
		this.updateTimeout = setTimeout(()=> {
			this.updateTimeout = null
			this.whenUpdated()
		}, 1000) as any
		
		this.lastSentSong = jsonObject;
		// w.detectHole()
		// console.log('--- end send update.');
	}
}
//}

let w: any = window
let addNote = (notes: any, channel: number)=> {
	let note = 40+Math.round(Math.random()*20)
	let duration = 2; // Math.round(Math.random()*4)
	let startTime = notes.length == 0 ? 0 : notes[notes.length-1].points[0].tick + duration; // Math.round(Math.random()*8)
	console.log('add', channel, note, startTime, duration)
	notes.push({pitches: [note], points: [{pitchBend: 0, tick: startTime, volume: 100}, {pitchBend: 0, tick: startTime+duration, volume:100}]})
}

w.detectHole = ()=> {
	let jsonObject: any = structuredClone(w._doc.song.toJsonObject(true, 1, true));
	let timebar = 0;
	let duration = 2;
	for(let channel of [0, 1]) {
		let notes = jsonObject.channels[channel].patterns[0].notes
		for(let note of notes) {
			if(note.points[0].tick > timebar) {
				w.stopCommunicationTest()
				console.log('hole:')
				w.printNotes(jsonObject)
				console.log('hole!!!')
			}
			timebar += duration
		}
	}
	
}

w.printNotes = (jsonObject: any)=> {
	for(let channel of [0, 1]) {
		let notes = jsonObject.channels[channel].patterns[0].notes;
		let notesString = '';
		if(notes instanceof Array) {
			for(let i=0 ; i<notes.length ; i++) {
				// notesString += notes[i].pitches.join(',') + '|' + notes[i].points[0].tick + '-' + notes[i].points[1].tick + '  ';
				notesString += JSON.stringify(notes[i]) + '  '
			}
		} else {
			for(let noteKey in notes) {
				let note = notes[noteKey]
				// notesString += note.pitches.join(',') + '|' + note.points[0].tick + '-' + note.points[1].tick + '  ';
				notesString += JSON.stringify(note) + '  '
			}
		}
		console.log('c' + channel + ': ' + notesString);
	}
}

w.testCommunication = (channel: number)=> {
	console.log('--- add note')
	// w.detectHole()
	let jsonObject: any = structuredClone(w._doc.song.toJsonObject(true, 1, true));
	w.printNotes(jsonObject)
	let oldJsonObject: any = structuredClone(jsonObject);
	let notes = jsonObject.channels[channel].patterns[0].notes
	addNote(notes, channel)
	if(notes[notes.length-1].points[0].tick>=30) {
		console.log('filled.')
		w.stopCommunicationTest()
		return
	}
	// if(notes.length==0) {
	// 	addNote(notes, channel)
	// } else {
	// 	if(Math.random()>0.25) {
	// 		addNote(notes, channel)
	// 	} else {
	// 		let noteIndex = Math.floor(notes.length*Math.random())
	// 		let note = notes[noteIndex]
	// 		console.log('remove', channel, note.pitches[0], note.points[0].tick, note.points[1].tick)
	// 		notes.splice(noteIndex, 1)
	// 	}
	// }
	w.communication.fixNotes(jsonObject)

	w._doc.song.fromJsonObject(jsonObject);
	w._doc.notifier.changed();
	w.communication.whenUpdated();

	let newJsonObject: any = structuredClone(w._doc.song.toJsonObject(true, 1, true));
	console.log('added notes, song is now:')
	w.printNotes(newJsonObject)
	let changes = DeepDiff.diff(oldJsonObject, newJsonObject);
	if (changes == null) {
		console.log('!!!no changes!!!')
		w.stopCommunicationTest()
		return
	}

	w.testTimeout = setTimeout(()=>w.testCommunication(channel), Math.random()*500)
	// w.detectHole()
	console.log('--- end add note')
}

w.stopCommunicationTest = ()=> {
	clearTimeout(w.testTimeout)
}