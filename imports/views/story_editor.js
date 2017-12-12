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
	'rules': [
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
		type: "desc",
		tab_name: "When did I happen?"
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
	'plot_b': function(){ChangeHeaderText('Beginning', '', 'Your plot never started. Click Add to add events to your Begnning')},
	'plot_r': function(){ChangeHeaderText('Rising Action', '', 'Click Add to add events to the Rising Action of the Plot')},
	'plot_m': function(){ChangeHeaderText('Middle', "", 'Click Add to add events to the Middle of the Plot')},
	'plot_f': function(){ChangeHeaderText('Falling Action', "", 'Click Add to add events to the Falling Action of the Plot')},
	'plot_e': function(){ChangeHeaderText('Ending', "", 'Click Add to add events to the Ending of the Plot')},
	'story_so_far': function(){ChangeHeaderText('The Story So Far', 'Where are we going with this?', 'No locations, no characters, no story. Check out the World, Location, and Plot panels to Get Started!')}
}

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

		SwitchStates(entity.type)

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

		if($("#edit_modal").is(':visible'))
		{
			SaveToCache()
		}

		console.log(save_info_cache)

		let o = $("#new-template").clone()

		$("#previewer").empty()
		$("#new_other_name_field").val("")

		$("#previewer").append(o)

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
					$("#previewer").append(obj)
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
							$("#previewer").append(obj)
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
							$("#previewer").append(obj)
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
	}
})

Template.edit_story.events({
	'click #add_entity_btn'(event){
		Session.set('create_or_edit', 'create')
	},

})

Template.entity_card.events({
	'click #edit_entity_btn'(event){
		Session.set('create_or_edit', 'edit')
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

			let obj = $("#new-template").clone()

			$(obj).attr("id", "new")
			$(obj).text($("#new_other_name_field").val())

			let tab = DetermineTab()

			console.log(tab.type)
			if(tab.type != "desc")
			{
				if(tab.type == "event")
				{
					$(obj).attr("class", "events")
					new_events.push({new: true, name: $(obj).text(), type: "event"})
				}
				else
				{
					if(tab.relation == "smaller")
					{
						$(obj).attr("class", "contained_by")
						new_entities.push({new: true, name: $(obj).text(), contained_by: true, type: tab.type})
					}
					else
					{
						$(obj).attr("class", "contains")
						new_entities.push({new: true, name: $(obj).text(), contained_by: false, type: tab.type})
					}
				}

				$("#new_other_name_field").val("")
				$("#previewer").append($(obj))

				$(obj).show()
			}
		}
	}
})

Template.playground.helpers({

	entity(){
		return Entities.find({type: Session.get("current_state")})
	},
	entity_selected(){
		return Session.get("entity_selected")
	}

})

Template.new_entity_form.helpers({
	entity(){

		return GetEntityListLoose()
	}
})

Template.entity_card.helpers({
	is_entity(){
		return Session.get('entity_or_misc') != 'desc' && Session.get('entity_or_misc') != ''
	},
	is_misc(){
		return Session.get('entity_or_misc') != ''
	},
	name(){
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
		return Session.get('entity_or_misc') != 'desc' && Session.get('entity_or_misc') != ''
	},
	is_misc(){
		return Session.get('entity_or_misc') != ''
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

function ChangeHeaderText(header = "", subtitle = "", empty_warning = "")
{
	$('#editor_header').text(header)
	$('#editor_subtitle').text(subtitle)
	$('#empty_warning').text(empty_warning)
}

function SwitchStates(state)
{
	console.log("Switching state")

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
	SaveToCache()

	if(save_info_cache.name == "")
	{
		console.log("Need a name to save, at least")
		return
	}

	let action = Session.get('create_or_edit')

	if(action == 'create')
	{
		CreateEntry()
	}
	else if(action == 'edit')
	{
		//EditEntry()
	}
}


function SaveToCache()
{
	save_info_cache.name = $("#entity_name").val()

	save_info_cache.type = Session.get('current_state')

	save_info_cache.entities = new_entities

	save_info_cache.events = new_events
}

//Make a new entry to the database
function CreateEntry()
{

	if(Session.get('current_state') == 'events')
	{}
	else
	{
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

				if(entity.contained_by)
				{
					inside_array_collection.push(id)
				}
				else
				{
					contains_array_collection.push(id)
				}
			}
			else
			{
				//Get the id of this object and add it to the appropriate array
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
	}

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

/*
function EditEntry()
{
	let entity_id = 
}
*/

function GetEntityListStrict(){
		let current_entity = Entities.findOne({_id: Session.get('current_entity_id')})

		console.log(current_entity)

		var tab = DetermineTab()

		if(tab.type != "desc")
		{
			if(tab.type == "event")
			{
				return current_entity.events
			}
			else
			{
				let list_of_stuff = []
				let id_list = []
				if(tab.relation == "smaller")
				{
					id_list = current_entity.contained_by
				}
				else
				{

					id_list = current_entity.contains
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

	let current_entity = Entities.findOne({_id: Session.get('current_entity_id')})

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
	else
	{

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