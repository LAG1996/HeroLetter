import './user_home.html'

Template.username.onRendered(
	
	Template.username.helpers({
		user_name: "User"

}))

Template.user_dashboard.helpers({

	//Should pull this from a database and store in triplets so that they look nice and neat
	//The story preview template could then just loop over each story and put the correct text in the correct spots
	story_triples: [
		{title_1: "Title 1", title_2: "Title 2", title_3: "Title 3"},
		{title_1: "Title 1", title_2: "Title 2", title_3: "Title 3"},
	]

})

Template.user_dashboard.events({

	'click .story'(event){
		FlowRouter.go('/views/story_editor.html')
	}

})