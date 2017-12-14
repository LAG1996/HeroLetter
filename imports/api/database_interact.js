import { Entities } from '../api/entities.js'
import { Events } from '../api/events.js'
import { Stories } from '../api/stories.js'

function EntityManager(){

	this.NewEntry = function(type_name, object){

		if(type_name == "entity")
		{
			CreateEntity(object)
		}
		else if(type_name == "event")
		{
			CreateEvent(object)
		}
		else
		{
			throw "NEW_ENTRY::NOT A VALID OBJECT TYPE::TYPE_NAME: "+type_name
		}

	}

	this.DeleteEntry = function(id, type_name){

		if(type_name == 'entity')
		{
			DeleteEntity(id)
		}
		else if(type_name == 'event')
		{
			DeleteEvent(id)
		}
		else
			throw "DELETE_ENTRY::NOT A VALID OBJECT TYPE::TYPE_NAME: "+type_name

	}

	this.UpdateEntry = function(id, type_name, object_to_save_from, objects_to_delete){

		if(type_name == 'entity')
		{
			UpdateEntity(id, object_to_save_from, objects_to_delete)
		}
		else if(type_name == 'event')
		{
			UpdateEvent(id, object_to_save_from, objects_to_delete)
		}
		else
			throw "EDIT_ENTRY::NOT A VALID OBJECT TYPE::TYPE_NAME: "+type_name

	}

	this.GetAllEntitiesInEntity = function(id, this_type, want_type, relation_to){
		
		let this_entity = null

		if(this_type == "events")
		{
			this_entity = Events.findOne({_id: id})
			let list_of_entities = []
			for(var e in this_entity.entities)
			{
				let entity = Entities.findOne({_id: this_entity.entities[e]})

				if(entity.type == want_type)
					list_of_entities.push(entity)
			}

			return list_of_entities
		}
		else
		{
			this_entity = Entities.findOne({_id: id})

			if(want_type == "events")
			{
				let id_list = this_entity.events
				let list_of_events = []

				for(var id in id_list)
				{
					list_of_events.push(Events.findOne()({_id: id_list[id]}))
				}

				return list_of_events
			}
			else
			{	
				let id_list = []
				let list_of_entities = []
				if(relation_to == "smaller")
				{
					id_list = this_entity.contained_by
				}
				else if(relation_to == "bigger")
				{
					id_list = this_entity.contains
				}
				else
					throw "GET_ALL_ENTITY_FROM_ENTITY::Incorrect relation type: " + relation_to

				for(var id in id_list)
				{
					let entity = Entities.findOne({_id: id_list[id]})

					if(entity.type == want_type)
					{
						list_of_entities.push(entity)
					}
				}
				return list_of_entities
			}
		}

	}

	this.GetAllEntitiesInStory = function(story_id, type){
		let story = Stories.findOne({_id: story_id})

		let entities = []

		let database_entity_list = []

		if(type == "events")
		{
			database_entity_list = story.events
		}
		else
		{
			database_entity_list = story.entities
		}

		for(var e in database_entity_list)
		{
			if(type == "events")
			{
				let event = Events.findOne({_id: database_entity_list[e]})

				if(event)
				{
					entities.push(event)
				}
			}
			else
			{
				let entity = Entities.findOne({_id: database_entity_list[e]})

				if(entity && entity.type == type)
				{
					entities.push(entity)
				}
			}
		}

		return entities
	}

	this.GetStory = function(story_id)
	{
		return Stories.findOne({_id: story_id})
	}

	this.GetEntity = function(entity_id)
	{
		return Entities.findOne({_id: entity_id})
	}

	this.GetEvent = function(event_id)
	{
		return Events.findOne({_id: event_id})
	}

	function CreateEvent(obj)
	{
		console.log("Creating an event from this: ")
		console.log(obj)
		var entity_id_list = []

		for(var e in obj.entities)
		{

			let entity = obj.entities[e]

			let id = -1

			if(entity.new)
			{
				id = Entities.insert({
					type: entity.type,
					name: entity.name,
					contained_by: [],
					contains: [],
					events: [],
					desc: ""
				})

				Stories.update({_id: Session.get("story_id")}, {$addToSet: {entities: id}})
			}
			else
				id = entity.id

			entity_id_list.push(id)
		}

		let new_id = Events.insert({
			name: obj.name,
			time: obj.time,
			entities: entity_id_list,
			desc: obj.desc
		})

		Stories.update({_id: Session.get("story_id")}, {$addToSet: {events: new_id}})

		for(var i in entity_id_list)
		{
			var id = entity_id_list[i]

			Entities.update({_id: id}, {$addToSet: {events: new_id}})
		}
	}

	function CreateEntity(obj)
	{
		var inside_array_collection = []
		var contains_array_collection = []
		var new_id = -1

		for(var e in obj.entities)
		{
			let entity = obj.entities[e]
			let id = -1

			//Check if this entity has not been created already
			if(entity.new)
			{
				//Create a new entity with this name
				id = Entities.insert({
					type: entity.type,
					name: entity.name,
					contained_by: [],
					contains: [],
					events: [],
					desc: ""
				})

				Stories.update({_id: Session.get("story_id")}, {$addToSet: {entities: id}})
			}
			else
			{
				id = entity.id
			}
			if(entity.contained_by)
			{
				inside_array_collection.push(id)
			}
			else
			{
				contains_array_collection.push(id)
			}
		}

		//Create a new entity for this new object
		new_id = Entities.insert({
			type: obj.type,
			name: obj.name,
			contained_by: inside_array_collection,
			contains: contains_array_collection,
			events: obj.events,
			desc: obj.desc
		})

		Stories.update({_id: Session.get("story_id")}, {$addToSet: {entities: new_id}})

		//Now, for all entities that contain this entity, add them to their contains array

		for(var i in inside_array_collection)
		{
			var id = inside_array_collection[i]	

			Entities.update({_id: id}, {$addToSet: {contains: new_id}})
		}

		//Now, for all entities that this entity contains, add them to their contained_by array
		for(var i in contains_array_collection)
		{
			var id = contains_array_collection[i]	

			Entities.update({_id: id}, {$addToSet: {contained_by: new_id}})
		}
	}

	function DeleteEvent(id)
	{
		let entities = Events.findOne({_id: id}).entities

		for(var e in entities)
		{
			Entities.update({_id: entities[e]}, { $pull: { events: id } })
		}

		Events.remove({_id: id})
	}

	function DeleteEntity(id)
	{
		let this_entity = Entities.findOne({_id: id})

		let smaller_entities = this_entity.contains

		let larger_entities = this_entity.contained_by

		let events = this_entity.events

		for(var e in smaller_entities)
		{
			Entities.update({_id: smaller_entities[e]}, {$pull: { contained_by: id }})
		}

		for(var e in larger_entities)
		{
			Entities.update({_id: larger_entities[e]}, {$pull: { contains: id }})
		}

		for(var e in events)
		{
			Events.update({_id: events[e]}, {$pull: { entities: id }})
		}

		Entities.remove({_id: id})

	}

	function UpdateEntity(id, object_to_save_from, object_to_delete_from)
	{
		for(var e in object_to_delete_from.entities)
		{
			let relation = ""
			if(object_to_delete_from.entities[e].contained_by)
			{
				relation = "smaller"
			}
			else
			{
				relation = "bigger"
			}

			RemoveEntityFromEntity(id, "entity", object_to_delete_from.entities[e].id, "entity", relation)
		}

		for(var e in object_to_delete_from.events)
		{
			RemoveEntityFromEntity(id, "entity", object_to_delete_from.events[e].id, "events", "doesn't matter")
		}

		//Get a list of id's from entity list, also create any new entities
		let bigger_entities = []
		let smaller_entities = []
		for(var e in object_to_save_from.entities)
		{
			if(object_to_save_from.entities[e].contained_by)
			{
				let that_id = null

				if(object_to_save_from.entities[e].new)
				{
					that_id = Entities.insert({
						type: object_to_save_from.entities[e].type,
						name: object_to_save_from.entities[e].name,
						contains: [id],
						contained_by: [],
						events: [],
						desc: ''
					})

					Stories.update({_id: Session.get("story_id")}, {$addToSet: {entities: that_id}})
				}
				else
				{
					that_id = object_to_save_from.entities[e].id
				}

				bigger_entities.push(that_id)
			}
			else
			{
				let that_id = null

				if(object_to_save_from.entities[e].new)
				{
					that_id = Entities.insert({
						type: object_to_save_from.entities[e].type,
						name: object_to_save_from.entities[e].name,
						contains: [],
						contained_by: [id],
						events: [],
						desc: ''
					})

					Stories.update({_id: Session.get("story_id")}, {$addToSet: {entities: that_id}})
				}
				else
				{
					that_id = object_to_save_from.entities[e].id
				}

				smaller_entities.push(that_id)
			}
		}

		//Get a list of id's from events list
		let list_of_events = []
		for(var e in object_to_save_from.events)
		{
			list_of_events.push(object_to_save_from.events[e].id)
		}

		Entities.update({_id: id}, 
			{$set: {
				name: object_to_save_from.name,
				contained_by: bigger_entities,
				contains: smaller_entities,
				events: list_of_events,
				desc: object_to_save_from.desc
			}
		})
	}

	function UpdateEvent(id, object_to_save_from, object_to_delete_from)
	{
		for(var e in object_to_delete_from.entities)
		{
			RemoveEntityFromEntity(id, "events", object_to_delete_from.entities[e].id, "doesn't matter", "doesn't matter")
		}

		//Get a list of id's from the entities list
		let list_of_entities = []
		for(var e in object_to_save_from.entities)
		{
			let that_id = null

			if(object_to_save_from.entities[e].new)
			{
				that_id = Entities.insert({
					type: object_to_save_from.entities[e].type,
					name: object_to_save_from.entities[e].name,
					contains: [],
					contained_by: [],
					events: [id],
					desc: ''
				})

				Stories.update({_id: Session.get("story_id")}, {$addToSet: {entities: that_id}})
			}
			else
				that_id = object_to_save_from.entities[e].id
			
			list_of_entities.push(that_id)
		}

		Events.update({_id: id}, {
			$set: {
				name: object_to_save_from.name,
				time: object_to_save_from.time,
				entities: list_of_entities,
				desc: object_to_save_from.desc
			}
		})
	}

	function RemoveEntityFromEntity(this_id, this_type, that_id, remove_type, relation_to){

		if(this_type == "events")
		{
			Events.update({_id: this_id}, {$pull: {entities: that_id}})
			Entities.update({_id: that_id}, {$pull: {events: this_id}})
		}
		else
		{
			if(remove_type == "events")
			{
				Entities.update({_id: this_id }, {$pull: {events: that_id }})
				Events.update({_id: that_id }, {$pull: {entities: this_id }})
			}
			else
			{
				if(relation_to == "smaller")
				{
					Entities.update({_id: this_id }, {$pull: {contained_by: that_id}})
					Entities.update({_id: that_id }, {$pull: {contains: this_id}})
				}
				else if(relation_to == "bigger")
				{
					Entities.update({_id: this_id }, {$pull: {contains: that_id}})
					Entities.update({_id: that_id }, {$pull: {contained_by: this_id}})
				}
				else
					throw "REMOVE_ENTITY_FROM_ENTITY::Incorrect relation type: " + relation_to
			}
		}


	}
}

export const entity_manager = new EntityManager()