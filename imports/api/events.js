export const Events = new Mongo.Collection('events')

Events.schema = new SimpleSchema({
	time: {type: Number},
	name: {type: String},
	entities: {type: [Number]},
	desc: {type: String}
})