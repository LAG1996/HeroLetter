import './navbar.html'

Template.navbar.events({

	'click .logout'(event){
		Meteor.logout()
	},
})