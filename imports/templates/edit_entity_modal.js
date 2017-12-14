import './edit_entity_modal.html'

import { HandleSave } from '../views/story_editor.js'


var state_to_modal_message = {

	'locations' : 'Location',
	'factions': 'Faction or Race',
	'characters': "Character",
	'concepts': "Rule or Concept",
	'events': "Event",
	'items': "Item"
}


Template.edit_entity_modal.onRendered(function(){

	if(Session.get("create_or_edit") == "create")
	{
		$("#edit_modal").on('show.bs.modal', function(){
			ClearModal()
		})
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
			return "Create " + state_to_modal_message[Session.get('current_state')]
		}
		else if(action == 'edit')
		{
			return 'Edit ' + Session.get('current_entity_name')
		}
	},
	is_event_state(){
		return Session.get('current_state') == 'events'
	}
})

Template.edit_entity_modal.events({
	'click #modal_save'(event){

		HandleSave()

	}
})

function ClearModal(){

	$("#entity_name").val("")

	if(Session.get("current_state") == "events")
	{
		$("#event_time").val("")
	}

	let save_new = $("#new-template").clone()

	$("#modal_entity_previewer").empty()

	$("#modal_entity_previewer").append(save_new)

	Session.set('entity_or_misc', 'none')
	Session.set('selected_tab', '')

}