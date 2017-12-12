export const Entities = new Mongo.Collection('entities')

Entities.schema = new SimpleSchema({
	name: {type: String},
	contained_by: {type: [Number],},
	contains: {type: [Number]},
	events: {type: [Number]},
	desc: {type: String}
})