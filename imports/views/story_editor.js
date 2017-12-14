import '../templates/entity_nav_tabs.html'
import '../templates/edit_entity_modal.js'
import '../templates/entity_forms.html'

import './story_editor.html'

//Import the databases we're going to be dealing with
import { entity_manager } from '../api/database_interact.js'


Session.set('show_card', false)
Session.set('not_the_story_so_far', false)
Session.set('current_state', '')
Session.set('entity_component_list', null)
Session.set('entity_or_misc', 'none')
Session.set('create_or_edit', 'create')
Session.set('added_existing_entity', false)
Session.set('selected_tab', '')
Session.set('amt_entities', 0)
Session.set('current_entity_id', '')
Session.set('current_entity_name', '')


var save_entity_cache = {}

var save_event_cache = {}

var remove_entity_cache = {}

var remove_event_cache = {}

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
		type: 'factions',
		relation: 'bigger',
		tab_name: 'Races or Factions that came from me'
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
	$("#entity_desc_field").val(save_entity_cache.desc)
})

//////////////////////////
//	EVENTS
//////////////////////////
Template.sidebar.events({

	'click #story_so_far'(event){
		Session.set('not_the_story_so_far', false)
		SwitchStates(event.target.id)
	},

	'click .entity_type_switch'(event){

		Session.set('not_the_story_so_far', true)
		Session.set('entity_or_misc', 'none')

		HideCard()

		SwitchStates(event.target.id)

	},
})

Template.playground.events({

	'click .playground_entity_prev'(event){

		ShowCard()
		Session.set('current_entity_id', event.target.id)

		let entity = entity_manager.GetEntity(event.target.id)

		if(entity)
		{
			Session.set('current_entity_name', entity.name)
			SwitchStates(entity.type)
		}
		else
		{
			let eve = entity_manager.GetEvent(event.target.id)
			Session.set('current_entity_name', eve.name)
			if(eve)
				SwitchStates("events")
		}

	},
})

Template.new_description_form.events({
	'change #entity_desc_field'(event){
		let obj = event.target

		save_entity_cache.desc = $(obj).val()
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

		if(Session.get("current_state") == "events")
		{
			PostItemsFromEventCacheToForm(tab.type)
		}
		else
		{
			PostItemsFromEntityCacheToForm(tab.type)
		}
	}
})

Template.edit_story.events({
	'click #add_entity_btn'(event){		
		ClearEntityCache()
		ClearEventCache()
		Session.set('create_or_edit', 'create')
	},

})

Template.entity_card.events({
	'click #edit_entity_btn'(event){
		Session.set('create_or_edit', 'edit')

		ClearEntityCache()
		ClearEventCache()

		PrepareCacheForEdit()

		console.log(save_entity_cache)
	},
	'click #delete_entity_btn'(event){
		console.log("Deleting Entity")

		HideCard()
		HandleDelete()
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
				SaveItemToEventsCache(true, $("#new_other_name_field").val())
			}
			else
			{
				SaveItemToEntityCache(true, $("#new_other_name_field").val())
			}

			PostItemNameInForm(true, "new", $("#new_other_name_field").val())

			$("#new_other_name_field").val("")
		}
	},
	'click .existing_entity_dropdown_btn'(event){

		if(Session.get("current_state") == "events")
		{
			SaveItemToEventsCache(false, event.target.id)
		}
		else
		{
			SaveItemToEntityCache(false, event.target.id)
		}

		PostItemNameInForm(false, event.target.id, entity_manager.GetEntity(event.target.id).name)
	},
})

/////////////////////////////
//	HELPERS
/////////////////////////////
Template.playground.helpers({

	entity(){
		let list_of_entities = entity_manager.GetAllEntitiesInStory(Session.get("story_id"), Session.get("current_state"))

		Session.set('amt_entities', list_of_entities.length)

		return list_of_entities
	},
	show_card(){
		return Session.get("show_card")
	},
	is_event_state(){
		return Session.get("current_state") == "events"
	},
	show_warning(){

		if(Session.get("not_the_story_so_far"))
		{
			return Session.get('amt_entities') == 0
		}
		else
		{
			return false
		}

	}

})

Template.sidebar.helpers({
	story_title(){
		return entity_manager.GetStory(Session.get('story_id')).name
	}
})

Template.new_entity_form.helpers({
	entity(){

		//Get all the entities in the story of the type specified by the active tab

		//Find the type of entities that we want that the active tab specifies
		let tab = DetermineTab()

		return entity_manager.GetAllEntitiesInStory(Session.get("story_id"), tab.type)
		
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
			return entity_manager.GetEvent(Session.get('current_entity_id')).name
		}
		return entity_manager.GetEntity(Session.get('current_entity_id')).name
	},
	entity(){

		//Pull all the entities contained by this entity, including any events
		let context = DetermineTab()

		if(context.type != "desc")
		{
			return entity_manager.GetAllEntitiesInEntity(Session.get('current_entity_id'), Session.get('current_state'), context.type, context.relation)
		}
	}
})

Template.description.helpers({
	description(){

		if(Session.get("current_state") == "events")
		{
			return entity_manager.GetEvent(Session.get('current_entity_id')).desc
		}
		else
		{
			return entity_manager.GetEntity(Session.get('current_entity_id')).desc
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


//////////////////////
//	OTHER FUNCTIONS
//////////////////////
function ClearEntityCache()
{
	save_entity_cache = { type: '', name: '', entities: [], events: [], desc: ''}
	remove_entity_cache = { entities: [], events: [] }
}

function ClearEventCache()
{
	save_event_cache = { name: '', time: '', entities: [], desc: ''}
	remove_event_cache = { entities: [] }
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

function PutNameInCache(state)
{
	if(state == 'events')
	{
		save_event_cache.name = $("#entity_name").val()
		save_event_cache.time = $("#event_time").val()
	}
	else
	{
		save_entity_cache.name = $("#entity_name").val()
		save_entity_cache.type = Session.get('current_state')	
	}
}

function PrepareCacheForEdit(){

	if(Session.get("current_state") == "events")
	{
		let event_to_edit = entity_manager.GetEvent(Session.get("current_entity_id"))

		let entities = event_to_edit.entities

		for(var e in entities)
		{
			var entity = entity_manager.GetEntity(entities[e])

			save_event_cache.entities.push({new: false, id: entity._id, type: entity.type})
		}

		save_event_cache.time = event_to_edit.time
		save_event_cache.name = event_to_edit.name
		save_event_cache.desc = event_to_edit.desc
	}
	else
	{
		let entity_to_edit = entity_manager.GetEntity(Session.get("current_entity_id"))

		console.log("Copying data from ")
		console.log(entity_to_edit)

		let smaller_entities = entity_to_edit.contains
		let larger_entities = entity_to_edit.contained_by
		let events = entity_to_edit.events

		for(var e in smaller_entities)
		{
			var entity = entity_manager.GetEntity(smaller_entities[e])

			save_entity_cache.entities.push({new: false, id: entity._id, contained_by: false, type: entity.type})
		}

		for(var e in larger_entities)
		{
			var entity = entity_manager.GetEntity(larger_entities[e])

			save_entity_cache.entities.push({new: false, id: entity._id, contained_by: true, type: entity.type})
		}

		for(var e in events)
		{
			var event = entity_manager.GetEvents(events[e])

			save_entity_cache.events.push({new: false, id: event._id})
		}

		save_entity_cache.name = entity_to_edit.name
		save_entity_cache.type = entity_to_edit.type
		save_entity_cache.desc = entity_to_edit.desc
	}

	console.log(save_entity_cache)
	console.log(save_event_cache)
}

function ShowCard()
{
	Session.set('show_card', true)
}

function HideCard()
{
	Session.set('selected_tab', '')
	Session.set('show_card', false)
}


export function HandleSave()
{
	let state = Session.get('current_state')
	let cache_to_save = null
	let cache_to_delete = null

	if(Session.get('create_or_edit') == "create")
		PutNameInCache(state)

	if(state != 'events')
	{
		state = 'entity'
		cache_to_save = save_entity_cache
		cache_to_delete = remove_entity_cache
	}
	else
	{
		state = "event"
		cache_to_save = save_event_cache
		cache_to_delete = remove_event_cache
	}

	if(!Validate(state))
	{
		console.log("Invalid input for creating a new entity")
		console.log(cache_to_save)

		return
	}

	console.log("Saving")
	console.log(cache_to_save)

	if(Session.get('create_or_edit') == 'create')
	{
		entity_manager.NewEntry(state, cache_to_save)
	}
	else
	{
		entity_manager.UpdateEntry(Session.get("current_entity_id"), state, cache_to_save, cache_to_delete)
	}



	function Validate(state){
		if(state == 'event')
		{
			if(!/\S/.test(save_event_cache.name))
			{
				console.log("need a name")
			}
			else if(!/\S/.test(save_event_cache.time))
			{
				console.log("no time")
			} 
			else
				return true

			return false
		}
		else
		{
			return /\S/.test(save_entity_cache.name)
		}
	}
}

function HandleDelete(){

	let state = Session.get("current_state")

	if(state != "events")
	{
		state = "entity"
	}
	else
		state = "event"

	entity_manager.DeleteEntry(Session.get("current_entity_id"), state)
}


function SaveItemToEventsCache(is_new_item, dom_id){

	let context = DetermineTab()

	if(is_new_item)
	{
		save_event_cache.entities.push({new: true, name: dom_id, type: context.type})
	}
	else
	{
		save_event_cache.entities.push({new: false, id: dom_id, type: context.type})
	}
}

function SaveItemToEntityCache(is_new_item, dom_id)
{
	let context = DetermineTab()

	if(is_new_item)
	{
		if(context.relation == "smaller")
		{
			save_entity_cache.entities.push({new: true, name: dom_id, contained_by: true, type: context.type})
		}
		else
		{
			save_entity_cache.entities.push({new: true, name: dom_id, contained_by: false, type: context.type})
		}
	}
	else
	{
		if(context.relation == "smaller")
		{
			save_entity_cache.entities.push({new: false, id: dom_id, contained_by: true, type: context.type})
		}
		else
		{
			save_entity_cache.entities.push({new: false, id: dom_id, contained_by: false, type: context.type})
		}

	}
}

function RemoveItemFromEventCache(id)
{
	if(id == "new")
	{
		for(var e in save_event_cache.entities)
		{
			if(save_event_cache.entities[e].name == name)
			{
				save_event_cache.entities.splice(e, 1)
			}
		}
	}
	else
	{
		for(var e in save_event_cache.entities)
		{
			if(save_event_cache.entities[e].id == id)
			{
				save_event_cache.entities.splice(e, 1)
				remove_event_cache.entities.push(save_event_cache.entities[e])
			}
		}
	}

	console.log("After deletion: ")
	console.log(save_event_cache)
	console.log(remove_event_cache)
}

function RemoveItemFromEntityCache(id, name)
{
	let context = DetermineTab()

	if(context.type == "events")
	{
		if(id == "new")
		{
			for(var e in save_entity_cache.events)
			{
				if(save_entity_cache.events[e].name == name)
				{
					save_entity_cache.events.splice(e, 1)
				}
			}
		}
		else
		{
			for(var e in save_entity_cache.events)
			{
				if(save_entity_cache.events[e].id == id)
				{
					remove_entity_cache.events.push(save_event_cache.events[e])
					save_entity_cache.events.splice(e, 1)
				}
			}
		}
	}
	else
	{
		if(id == "new")
		{
			for(var e in save_entity_cache.entities)
			{
				if(save_entity_cache.entities[e].name == name)
				{
					save_entity_cache.entities.splice(e, 1)
				}
			}
		}
		else
		{
			for(var e in save_entity_cache.entities)
			{
				if(save_entity_cache.entities[e].id == id)
				{
					remove_entity_cache.entities.push({id: save_entity_cache.entities[e].id, 
						contained_by: save_entity_cache.entities[e].contained_by})

					save_entity_cache.entities.splice(e, 1)
				}
			}
		}
	}

	console.log("After deletion")
	console.log(save_entity_cache)
	console.log(remove_entity_cache)
}

function PostItemNameInForm(is_new_item, dom_id, name){

	let obj = $("#new-template").clone()

	$(obj).text(name + $(obj).text())

	$(obj).attr("id", dom_id)

	if(!is_new_item)
	{
		$(obj).attr("class", $(obj).attr("class") + " list-group-item-primary")
	}
	else
	{
		$(obj).attr("class", $(obj).attr("class") + " list-group-item-secondary")

	}

	$(obj).on("click", function(){

			console.log("Setting up for removing " + $(this).attr("id") + " " + $(this).text())

			if(Session.get("current_state") == "events")
			{

				RemoveItemFromEventCache($(this).attr("id"), $(this).text())
			}
			else
			{
				RemoveItemFromEntityCache($(this).attr("id"), $(this).text())
			}


		$(this).remove()
	})

	$("#modal_entity_previewer").append($(obj))

	$(obj).show()
}

function PostItemsFromEventCacheToForm(context)
{
	if(context.type != "desc")
	{
		for(var e in save_event_cache.entities)
		{
			if(save_event_cache.entities[e].type == context.type)
			{
				if(save_event_cache.entities[e].new)
				{
					PostItemNameInForm(true, "new", save_event_cache.entities[e].name)
				}
				else
				{
					PostItemNameInForm(false, save_event_cache.entities[e].id, entity_manager.GetEntity(save_event_cache.entities[e].id).name)
				}

			}
		}
	}
}

function PostItemsFromEntityCacheToForm(context)
{
	if(context.type != "desc")
	{
		if(context.type == "event")
		{
			for(var e in save_entity_cache.events)
			{
				if(save_entity_cache.events[e].new)
				{
					PostItemNameInForm(true, "new", save_entity_cache.events[e].name)
				}
				else
				{
					PostItemNameInForm(false, save_entity_cache.events[e].id, entity_manager.GetEvent(save_entity_cache.events[e].id).name)
				}
			}
		}
		else
		{
			if(context.relation == "smaller")
			{
				for(var e in save_entity_cache.entities)
				{
					if(save_entity_cache.entities[e].contained_by && save_entity_cache.entities[e].type == context.type)
					{
						if(save_entity_cache.entities[e].new)
						{
							PostItemNameInForm(true, "new", save_entity_cache.entities[e].name)
						}
						else
						{
							PostItemNameInForm(false, save_entity_cache.entities[e].id, entity_manager.GetEntity(save_entity_cache.entities[e].id).name)
						}
					}
				}
			}
			else
			{
				for(var e in save_entity_cache.entities)
				{
					if(!save_entity_cache.entities[e].contained_by && save_entity_cache.entities[e].type == context.type)
					{
						if(save_entity_cache.entities[e].new)
						{
							PostItemNameInForm(true, "new", save_entity_cache.entities[e].name)
						}
						else
						{
							PostItemNameInForm(false, save_entity_cache.entities[e].id, entity_manager.GetEntity(save_entity_cache.entities[e].id).name)
						}
					}
				}
			}
		}
	}
}