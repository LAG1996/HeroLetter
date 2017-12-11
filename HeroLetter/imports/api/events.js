//Event Class
/*
Description: A class for abstracting an event in a plot in a story. An event has several important properties: the time in which it transpired,
who was involed, where it happened, and its outcomes.
*/

class Event{
	constructor(time, type, characters, place, outcomes){

		this.time = time 
		this.event_type = type
		this.characters = characters
		this.place = place
		this.outcome = outcomes

	}
}