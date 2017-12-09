FlowRouter.route('/', {
	name: 'index',
	action() {
		BlazeLayout.render('applicationLayout', {main: 'splash_page'})
	}
})

FlowRouter.route('/views/login.html', {
	name: 'user_login',
	action() {

		if(Meteor.user())
			FlowRouter.go('/')
		else
			BlazeLayout.render('applicationLayout', {main: 'login_body'})
	}
})

FlowRouter.route('/views/user_home.html', {
	name: 'user_home',
	action(){
		
		if(Meteor.user())
			BlazeLayout.render('applicationLayout', {main: 'user_dashboard'})
		else
			FlowRouter.go('/')
	}
})

FlowRouter.route('/views/story_editor.html',{
	name: 'story_edit',

	action(){
	
		if(Meteor.user())
		{
			BlazeLayout.render('applicationLayout', {main: 'edit_story'})
		}
		else
			FlowRouter.go('/')
	}
})