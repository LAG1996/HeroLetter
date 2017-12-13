import './user_home.html'
import '../templates/new_story_modal.html'

import { Entities } from '../api/entities.js'
import { Events } from '../api/events.js'
import { Stories } from '../api/stories.js'

Template.username.onRendered(
	
	Template.username.helpers({
		user_name: "User"

}))

Template.user_dashboard.helpers({

	//Should pull this from a database and store in triplets so that they look nice and neat
	//The story preview template could then just loop over each story and put the correct text in the correct spots
	stories(){
		return Stories.find({})
	}

})

Template.new_story_modal.events({

	'click #create_story_btn'(){
		if($("#story_title").val() != '' && $("#story_desc").val() != '')
		{
			Stories.insert({
				name: $("#story_title").val(),
				entities: [],
				events: [],
				desc: $("#story_desc").val()
			})
		}
	}


})

Template.user_dashboard.events({

	'click .edit_story_btn'(event){

		Session.set("story_id", $(event.target).parent().attr("id"))

		console.log($(event.target).parent())

		FlowRouter.go('/views/story_editor.html')
	},
	'click .delete_story_btn'(event){

		ClearEntities(($(event.target).parent().attr("id")))
		ClearEvents(($(event.target).parent().attr("id")))
		Stories.remove($(event.target).parent().attr("id"))

	}
})

function ClearEntities(id)
{
	let story = Stories.findOne({_id: id})
	for(var e in story.entities)
	{
		Entities.remove(story.entities[e])
	}
}

function ClearEvents(id)
{
	let story = Stories.findOne({_id: id})
	for(var e in story.events)
	{
		Events.remove(story.events[e])
	}
}