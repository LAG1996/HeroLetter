import '../templates/entity_nav_tabs.html'
import '../templates/edit_entity_modal.html'
import '../templates/entity_forms.html'
import './story_editor.html'

//Import the databases we're going to be dealing with
import { Entities } from '../api/entities.js'
import { Events } from '../api/events.js'
import { Stories } from '../api/stories.js'


Session.set('entity_selected', false)
Session.set('not_the_story_so_far', false)
Session.set('current_state', '')
Session.set('entity_component_list', null)
Session.set('entity_or_misc', 'none')
Session.set('create_or_edit', 'create')
Session.set('added_existing_entity', false)
Session.set('selected_tab', '')
Session.get('current_entity_id', '')


var save_info_cache = {

	type: '',
	name: '',
	entities: [],
	events: [],
	desc: ''
}

var save_event_cache = {

	name: '',
	time: '',
	entities: [],
	desc: ''

}

var new_events = []

var new_entities = []

var new_desc = ''


var states_to_entity_components = {

	'locations': [
	{
		type: 'locations',
		relation: 'smaller',
		tab_name: 'Place I am a Part of'
	},
	{
		type: 'locations',
		relation: 'bigger',
		tab_name: "Places that are a part of me"
	},
	{
		type: 'characters',
		relation: 'bigger',
		tab_name: 'People who came from me'
	},
	{
		type: 'events',
		tab_name: "Events I was involved in"
	},
	{
		type: 'desc',
		tab_name: 'A little more about me'
	}],
	'items': [
	{
		type: 'locations',
		relation: 'smaller',
		tab_name: 'Place I came from'
	},
	{
		type: 'characters',
		relation: 'smaller',
		tab_name: "People who want me"
	},
	{
		type: 'events',
		tab_name: "Events I was involved in"
	},
	{
		type: 'desc',
		tab_name: 'A little more about me'
	}],
	'factions': [
	{
		type: 'locations',
		relation: 'smaller',
		tab_name: 'Place I can be found'
	},
	{
		type: 'characters',
		relation: 'bigger',
		tab_name: "People affiliated with me"
	},
	{
		type: 'events',
		tab_name: "Events I was involved in"
	},
	{
		type: 'desc',
		tab_name: 'A little more about me'
	}],
	'concepts': [
	{
		type: 'desc',
		tab_name: 'A description'
	}],
	'characters':[
	{
		type: 'locations',
		relation: 'smaller',
		tab_name: 'The place I came from'
	},
	{
		type: 'factions',
		relation: 'smaller',
		tab_name: "Affiliations"
	},
	{
		type: 'events',
		tab_name: 'Events that I was involved in'

	},
	{
		type: 'desc',
		tab_name: "A little more about me"
	}
	],
	'events':[
	{
		type: "locations",
		tab_name: "Where did I happen?"
	},
	{
		type: "characters",
		tab_name: "Who was involved in me?"
	},
	{
		type: "factions",
		tab_name: "Any specific factions or races involved?"
	},
	{
		type: "desc",
		tab_name: "A little more about me"
	}
	]
}

var states_to_header_changes = {

	'locations': function(){ChangeHeaderText('Locations', 'Where did we come from? Where will we go?', "This world is a void. Click Add to make a location")},
	'items': function(){ChangeHeaderText('Items and Technologies', "All your weapons and McGuffins right here", "You mean to tell me there's no Orb of +99 Confusion? Click Add to make an Item or Technology")},
	'factions': function(){ChangeHeaderText('Factions and Races', 'Well, some people just gotta have their differences', "Anarchy! Click Add to make a Faction or a Race")},
	'concepts': function(){ChangeHeaderText('Rules and Concepts', "Pigs can't fly! Or can they?", "Watch out if your totally gritty and realistic war movie suddenly turned into Harry Potter by clicking Add to add some Rules and Concepts")},
	'characters': function(){ChangeHeaderText('Characters', 'The people we meet along the way.', "A world with no characters. Truly peaceful. Too bad we need a plot. Click Add to make a Protagonist")},
	'events': function(){ChangeHeaderText('Events', '', "Well, you want to tell a story, don't you? Press Add to create some events!")},
	'story_so_far': function(){ChangeHeaderText('The Story So Far', 'Where are we going with this?', 'No locations, no characters, no story. Check out the World, Location, and Plot panels to Get Started!')}
}

Template.edit_story.onRendered(function(){
	console.log("Editing story: " + Session.get("story_id"))
})

Template.playground.onRendered(function(){
	//$("#entity_card").hide()
})

Template.new_entity_name.onRendered(function(){
	$("#new-template").hide()
})

Template.new_description_form.onRendered(function(){
	$("#entity_desc_field").val(save_info_cache.desc)
})

Template.sidebar.events({

	'click #story_so_far'(event){
		Session.set('not_the_story_so_far', false)
		SwitchStates(event.target.id)
	},

	'click .entity_type_switch'(event){

		Session.set('not_the_story_so_far', true)
		Session.set('entity_or_misc', 'none')
		Session.set('selected_tab', '')
		Session.set('entity_selected', false)

		SwitchStates(event.target.id)

	},
})

Template.playground.events({

	'click .playground_entity_prev'(event){

		Session.set('entity_selected', true)
		Session.set('current_entity_id', event.target.id)

		let entity = Entities.findOne({_id: event.target.id})

		if(entity)
			SwitchStates(entity.type)
		else
		{
			let eve = Events.findOne({_id: event.target.id})

			if(eve)
				SwitchStates("events")
		}

	},
})

Template.new_description_form.events({
	'change #entity_desc_field'(event){
		let obj = event.target

		save_info_cache.desc = $(obj).val()
	}
})

Template.entity_components_nav.events({
	'click .entity_tab'(event){
		Session.set('entity_or_misc', event.target.id)
	},
	'click .entity_tab_link'(event){

		let obj = event.target

		Session.set('selected_tab', $(obj).text())

		let o = $("#new-template").clone()

		$("#modal_entity_previewer").empty()
		$("#new_other_name_field").val("")

		$("#modal_entity_previewer").append(o)

		let tab = DetermineTab()

		console.log("Moving into " + tab.type)
		if(tab.type != "desc")
		{
			if(tab.type == "event")
			{
				for(var e in save_info_cache.events)
				{
					let obj = $("#new-template").clone()
					obj.text(save_info_cache.events[e].name)
					$("#modal_entity_previewer").append(obj)
					$(obj).show()
				}
			}
			else
			{
				if(tab.relation == "smaller")
				{
					for(var e in save_info_cache.entities)
					{
						if(save_info_cache.entities[e].contained_by && save_info_cache.entities[e].type == tab.type)
						{
							let obj = $("#new-template").clone()
							obj.text(save_info_cache.entities[e].name)
							$("#modal_entity_previewer").append(obj)
							$(obj).show()
						}
					}
				}
				else
				{
					for(var e in save_info_cache.entities)
					{
						if(!save_info_cache.entities[e].contained_by && save_info_cache.entities[e].type == tab.type)
						{
							let obj = $("#new-template").clone()
							obj.text(save_info_cache.entities[e].name)
							$("#modal_entity_previewer").append(obj)
							$(obj).show()
						}
					}
				}
			}
		}
 	}
})

Template.edit_entity_modal.events({
	'click #modal_save'(event){

		HandleSave()

		CloseModal()

	},

	'click #modal_close'(event){

		CloseModal()

	}
})

Template.edit_story.events({
	'click #add_entity_btn'(event){
		Session.set('create_or_edit', 'create')
		ClearModal()
	},

})

Template.entity_card.events({
	'click #edit_entity_btn'(event){
		Session.set('create_or_edit', 'edit')
		ClearModal()
	}
})

Template.new_entity_form.events({
	'focusin .new_other_name_field'(event){
		let obj = event.target

		$(event.target).popover('show')
	},
	'focusout .new_other_name_field'(event){
		let obj = event.target

		$(event.target).popover('hide')
	},
	'submit .new_other_entity'(event){
		event.preventDefault()
	},
	'keypress .new_other_name_field'(event){
		
		if(event.key == "Enter")
		{
			console.log("submit")

			if($("#new_other_name_field").val() == "")
			{
				console.log("Empty field!")
				return
			}

			if(Session.get("current_state") == "events")
			{
				let action = Session.get('create_or_edit')

				if(action == 'create')
					SavePreviewToEventsCache(true)
				console.log('adding a new item to an existing event')
			}
			else
			{
				let action = Session.get('create_or_edit')

				if(action == 'create')
					SavePreviewToEntityCache(true)
				console.log('adding a new item to an existing entity')
			}
		}
	},
	'click .existing_entity_dropdown_btn'(event){

		if(Session.get("current_state") == "events")
		{
			let action = Session.get("create_or_edit")
			if(action == 'create')
				SavePreviewToEventsCache(false)
			else
				console.log('adding an existing item to an existing event')
		}
		else
		{
			let action = Session.get("create_or_edit")
			if(action == 'create')
				SavePreviewToEntityCache(false)
			console.log('adding an existing item to an existing entity')
		}
	},
})

Template.playground.helpers({

	entity(){
		if(Session.get("current_state") == "events")
		{
			let story = Stories.findOne({_id: Session.get("story_id")})

			let list_of_stuff = []

			for(var i in story.events)
			{
				list_of_stuff.push(Events.findOne({_id: story.events[i]}))
			}

			return list_of_stuff
		}
		else
		{
			let story = Stories.findOne({_id: Session.get("story_id")})

			let list_of_stuff = []

			for(var i in story.entities)
			{
				let entity = Entities.findOne({_id: story.entities[i]})
				if(entity.type == Session.get("current_state"))
					list_of_stuff.push(entity)
			}

			return list_of_stuff
		}
	},
	entity_selected(){
		return Session.get("entity_selected")
	},
	is_event_state(){
		return Session.get("current_state") == "events"
	},
	show_warning(){

		if(Session.get("not_the_story_so_far"))
		{
			let story = Stories.findOne({_id: Session.get("story_id")})

			let list_of_stuff = []

			if(Session.get("current_state") == "events")
			{
				return story.events.length == 0
			}
			else
			{
				for(var e in story.entities)
				{
					if(Session.get("current_state") == Entities.findOne({_id: story.entities[e]}).type)
						return false
				}
				return true
			}


			return list_of_stuff
		}
		else
		{
			return false
		}

	}

})

Template.sidebar.helpers({
	story_title(){
		return Stories.findOne({_id: Session.get("story_id")}).name
	}
})

Template.new_entity_form.helpers({
	entity(){

		return GetEntityListLoose()
	}
})

Template.entity_card.helpers({
	is_entity(){
		return Session.get('entity_or_misc') != 'desc' && Session.get('entity_or_misc') != 'none'
	},
	is_misc(){
		return Session.get('entity_or_misc') != 'none'
	},
	name(){

		if(Session.get('current_state') == "events")
		{
			return Events.findOne({_id: Session.get('current_entity_id')}).name
		}
		return Entities.findOne({_id: Session.get('current_entity_id')}).name
	},
	entity(){

		return GetEntityListStrict()
	}
})

Template.description.helpers({
	description(){

		return Entities.findOne({_id: Session.get("current_entity_id")}).desc

	}
})

Template.edit_entity_modal.helpers({
	is_entity(){
		return Session.get('entity_or_misc') != 'desc' && Session.get('entity_or_misc') != 'none'
	},
	is_misc(){
		return Session.get('entity_or_misc') != 'none'
	},
	create_or_edit(){
		let action = Session.get('create_or_edit')

		if(action == 'create')
		{
			return "Create a new entity"
		}
		else if(action == 'edit')
		{
			return 'Edit Entity Name'
		}
	},
	is_event_state(){
		return Session.get('current_state') == 'events'
	}
})

Template.entity_components_nav.helpers({
	entity_components(){
		return Session.get('entity_component_list')
	},
	nav_title(){
		return Session.get('selected_tab')
	}
})

Template.edit_story.helpers({

	not_the_story_so_far(){
		return Session.get('not_the_story_so_far')
	},
})

function CloseModal(){

	$("#edit_modal").modal("hide")
}

function ClearModal(){

	$("#entity_name").val("")

	let save_new = $("#new-template").clone()

	$("#modal_entity_previewer").empty()

	$("#modal_entity_previewer").append(save_new)

	Session.set('entity_or_misc', 'none')
	Session.set('selected_tab', '')
	Session.set('entity_or_misc', 'none')
	Session.set('selected_tab', '')

}

function ChangeHeaderText(header = "", subtitle = "", empty_warning = "")
{
	$('#editor_header').text(header)
	$('#editor_subtitle').text(subtitle)
	$('#empty_warning').text(empty_warning)
}

function SwitchStates(state)
{
	console.log("Switching state to " + state)

	Session.set('current_state', state)

	states_to_header_changes[state]()

	let type = Session.get('current_state')
	let entity_list = states_to_entity_components[type]
	if(entity_list)
	{
		Session.set('entity_component_list', entity_list)
	}
}

function HandleSave()
{
	SaveCache()

	if(!Validate())
	{
		console.log("Check input")
		return
	}

	let action = Session.get('create_or_edit')

	if(action == 'create')
	{
		CreateEntry()
	}
	else if(action == 'edit')
	{
		EditEntry()
	}

	CloseModal()
}

function Validate(){
	if(Session.get('current_state') == 'events')
	{
		return save_event_cache.name != "" && save_event_cache.time != ""
	}
	else
	{
		return save_info_cache.name != ""
	}
}

function SavePreviewToEventsCache(new_entry)
{
	let obj = $("#new-template").clone()

	if(new_entry)
	{
		$(obj).text($("#new_other_name_field").val())
	}
	else
	{
		let entity = Entities.findOne({_id: event.target.id})

		$(obj).text(entity.name)
	}

	let tab = DetermineTab()
	if(new_entry)
		save_event_cache.entities.push({new: new_entry, name: $(obj).text(), type: tab.type})
	else
		save_event_cache.entities.push({new: new_entry, name: $(obj).attr("id"), type: tab.type})

	$("#modal_entity_previewer").append($(obj))
	$(obj).show()
}

function SavePreviewToEntityCache(new_entry)
{
	let obj = $("#new-template").clone()

	if(new_entry)
	{
		$(obj).text($("#new_other_name_field").val())
		$(obj).attr("id", "new")
	}
	else
	{
		let entity = Entities.findOne({_id: event.target.id})

		$(obj).text(entity.name)

		$(obj).attr("id", event.target.id)
	}

	let tab = DetermineTab()

	console.log(tab.type)
	if(tab.type != "desc" && tab.type != "event")
	{
		if(tab.relation == "smaller")
		{
			if(new_entry)
			{
				save_info_cache.entities.push({new: new_entry, name: $(obj).text(), contained_by: true, type: tab.type})
			}
			else
			{
				save_info_cache.entities.push({new: new_entry, id: $(obj).attr("id"), contained_by: true, type: tab.type})
			}

		}
		else
		{
			if(new_entry)
			{
				save_info_cache.entities.push({new: new_entry, contained_by: true, type: tab.type})
			}
			else
			{
				save_info_cache.entities.push({new: new_entry, id: $(obj).attr("id"), contained_by: true, type: tab.type})
			}
		}

	}

	$("#modal_entity_previewer").append($(obj))

	$(obj).show()
}

function SaveCache()
{
	if(Session.get('current_state') == 'events')
	{
		save_event_cache.name = $("#entity_name").val()
		save_event_cache.time = $("#event_time").val()
	}
	else
	{
		save_info_cache.name = $("#entity_name").val()
		save_info_cache.type = Session.get('current_state')	
	}
}


//Make a new entry to the database
function CreateEntry()
{

	if(Session.get('current_state') == 'events')
	{
		console.log("Saving from events cache")
		console.log(save_event_cache)



		//Go through all entities and create new ones that haven't been created already

		var entity_id_list = []

		for(var e in save_event_cache.entities)
		{

			let entity = save_event_cache.entities[e]

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
			name: save_event_cache.name,
			time: save_event_cache.time,
			entities: entity_id_list,
			desc: save_event_cache.desc
		})

		Stories.update({_id: Session.get("story_id")}, {$addToSet: {events: new_id}})

		for(var i in entity_id_list)
		{
			var id = entity_id_list[i]

			Entities.update({_id: id}, {$addToSet: {events: new_id}})
		}
	}
	else
	{
		console.log("Saving from entity cache")
		console.log(save_info_cache)

		//Go through all entities and divide them by ones that this new object is smaller than

		var inside_array_collection = []
		var contains_array_collection = []
		var new_id = -1

		for(var e in save_info_cache.entities)
		{
			let entity = save_info_cache.entities[e]
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
	}

	//Create a new entity for this new object
	new_id = Entities.insert({
		type: save_info_cache.type,
		name: save_info_cache.name,
		contained_by: inside_array_collection,
		contains: contains_array_collection,
		events: save_info_cache.events,
		desc: save_info_cache.desc
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


function EditEntry()
{
	console.log("Editing entity...")

}


function GetEntityListStrict(){
		let current_entity = {}

		if(Session.get('current_state') == 'events')
		{
			current_entity = Events.findOne({_id: Session.get('current_entity_id')})
		}
		else
		{
			current_entity = Entities.findOne({_id: Session.get('current_entity_id')})
		}

		console.log(current_entity)

		var tab = DetermineTab()

		if(tab.type != "desc")
		{
			if(tab.type == "events")
			{
				let id_list = current_entity.events
				let list_of_stuff = []
				for(var id in id_list)
				{
					let e = Events.findOne({_id: id_list[id]})
					list_of_stuff.push(e)
				}

				console.log("Events: ")
				console.log(current_entity.events)

				console.log("List of stuff: ")
				console.log(list_of_stuff)
				return list_of_stuff
			}
			else
			{
				let list_of_stuff = []
				let id_list = []
				if(Session.get('current_state') == 'events')
				{
					id_list = current_entity.entities
				}
				else
				{
					if(tab.relation == "smaller")
					{
						id_list = current_entity.contained_by
					}
					else
					{

						id_list = current_entity.contains
					}
				}

				for(var id in id_list)
				{
					let e = Entities.findOne({_id: id_list[id]})
					if(e.type == tab.type)
					{
						list_of_stuff.push(e)
					}
				}

				console.log("List of stuff: ")
				console.log(list_of_stuff)
				return list_of_stuff
			}
		}
}

function GetEntityListLoose(){

	let current_entity = null

	if(Session.get('current_state') == 'events')
	{
		current_entity = Events.findOne({_id: Session.get('current_entity_id')})
	}
	else
	{
		current_entity = Entities.findOne({_id: Session.get('current_entity_id')})
	}

	console.log(current_entity)

	var tab = DetermineTab()

	var id_list = []
	if(tab.type == "event")
	{
		id_list = current_entity.events
	}
	else if(tab.type != "desc")
	{
		return Entities.find({type: tab.type}, {_id: 1, name: 1})
	}
}

function DetermineTab()
{
	let state = Session.get("current_state")

	let entity_comps = states_to_entity_components[state]

	for(var e in entity_comps)
	{
		if(entity_comps[e].tab_name == Session.get("selected_tab"))
		{
			return entity_comps[e]
		}
	}
}