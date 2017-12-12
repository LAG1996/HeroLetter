export const Stories = new Mongo.Collection('stories')

Stories.schema = new SimpleSchema({
	name: {type: String},
	entities:{type: [Number]},
	plot: {type: [Number]},
	desc: {type: String}
})