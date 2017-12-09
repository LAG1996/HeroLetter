import '../templates/world_editor.html'
import './story_editor.html'

Template.edit_story.events({

	'click #locations'(event){

		$("#editor_header").text("Locations")
		$("#editor_subtitle").text("To where shall we journey?")
		$("#empty_warning").text("This world is a void. Click Add to make a location")

	},

	'click #items'(event){

		$("#editor_header").text("Items")
		$("#editor_subtitle").text("All your enchanted weapons and McGuffins right here")
		$("#empty_warning").text("You mean to tell me there's no Orb of +99 Confusion? Click Add to make an Item")

	},

	'click #factions'(event){
		$('#editor_header').text('Factions')
		$('#editor_subtitle').text('Well, some people just gotta have their differences')
		$("#empty_warning").text("Anarchy! Click Add to make a Faction")
	}


})