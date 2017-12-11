import '../templates/world_editor.html'
import '../templates/cards.html'
import '../templates/create_entity_modal.html'
import '../templates/edit_entity_modal.html'
import './story_editor.html'


Session.set('entity_selected', false)
Session.set('not_the_story_so_far', false)
Session.set('current_state', '')

var states_to_card_type = {
	'locations': 'location_card',
	'items': 'item_card',
	'characters': 'character_card',
	'factions': 'faction_card',
	'rules': 'rule_card',
	'events': 'event_card'
}

var states_to_edit_type = {
	'locations': 'location_edit',
	'items': 'item_edit',
	'characters': 'character_edit',
	'factions': 'faction_edit',
	'rules': 'rule_edit',
	'events': 'event_edit'
}

Template.playground.onRendered(function(){
	$("#generic_card").hide()
	$(".card_edit").hide()
})

Template.edit_story.events({

	'click #locations'(event){
		ChangeHeaderText('Locations', 'Where did we come from? Where will we go?', "This world is a void. Click Add to make a location")

		Session.set('current_state', 'locations')
	},

	'click #items'(event){

		ChangeHeaderText('Items and Technologies', "All your weapons and McGuffins right here", 
			"You mean to tell me there's no Orb of +99 Confusion? Click Add to make an Item or Technology")

		Session.set('current_state', 'items')

	},

	'click #factions'(event){
		ChangeHeaderText('Factions and Races', 'Well, some people just gotta have their differences', 
			"Anarchy! Click Add to make a Faction or a Race")

		Session.set('current_state', 'factions')
	},

	'click #concepts'(event){
		ChangeHeaderText('Rules and Concepts', "Pigs can't fly! Or can they?", 
			"Watch out if your totally gritty and realistic war movie suddenly turned into Harry Potter by clicking Add to add some Rules and Concepts")

		Session.set('current_state', 'rules')
	},

	'click #heroes'(event){
		ChangeHeaderText('Protagonists', 'The brave hero! Or maybe not so brave...and unheroic...',
			"A world with no characters. Truly peaceful. Too bad we need a plot. Click Add to make a Protagonist")

		Session.set('current_state', 'characters')
	},

	'click #villains'(event){
		ChangeHeaderText('Antagonists', 'The evil one! Or maybe not so evil?',
			"A world with no characters. Truly peaceful. Too bad we need a plot. Click Add to make an Antagonist")

		Session.set('current_state', 'characters')
	},

	'click #npc'(event){
		ChangeHeaderText('Side Characters', 'They may not be the main stars, but we need them.',
			'Sure is lonely. Click Add to make a Side Character')

		Session.set('current_state', 'characters')
	},

	'click #plot_b'(event){
		ChangeHeaderText('Beginning', '',
			'Your plot never started. Click Add to add events to your Begnning')
		Session.set('current_state', 'events')
	},

	'click #plot_r'(event){
		ChangeHeaderText('Rising Action', '',
			'Click Add to add events to the Rising Action of the Plot')
		Session.set('current_state', 'events')
	},

	'click #plot_m'(event){
		ChangeHeaderText('Middle', "",
			'Click Add to add events to the Middle of the Plot')
		Session.set('current_state', 'events')
	},

	'click #plot_f'(event){
		ChangeHeaderText('Falling Action', "",
			'Click Add to add events to the Falling Action of the Plot')
		Session.set('current_state', 'events')
	},

	'click #plot_e'(events){
		ChangeHeaderText('Ending', "",
			'Click Add to add events to the Ending of the Plot')
		Session.set('current_state', 'events')
	},

	'click #story_so_far'(event){
		ChangeHeaderText('The Story So Far', 'Where are we going with this?', 
			'No locations, no characters, no story. Check out the World, Location, and Plot panels to Get Started!')

		Session.set('not_the_story_so_far', false)
		$("#generic_card").hide()
	},

	'click .entity_type_switch'(event){
		Session.set('entity_selected', false)
		Session.set('not_the_story_so_far', true)

		$("#generic_card").hide()


		$(".card_edit").hide()
		

		let type = Session.get('current_state')
		if(states_to_edit_type[type])
		{
			$("#"+states_to_edit_type[type]).show()
		}

	},
})

Template.playground.events({

	'click .playground_entity_prev'(event){

		Session.set('entity_selected', true)

		let type = Session.get('current_state')

		console.log(type)

		$(".card").hide()

		if(states_to_card_type[type])
		{
			$("#generic_card").show()
			$("#"+states_to_card_type[type]).show()

		}
		else
			console.log("This component has no card type!")

	}

})

Template.playground.helpers({

})

Template.card.helpers({

	name_of_entity: "I am an Entity",

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