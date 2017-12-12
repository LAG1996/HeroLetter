import './navbar.html'

Template.navbar.events({

	'click .logout-btn'(event){
		Meteor.logout()
	},
})