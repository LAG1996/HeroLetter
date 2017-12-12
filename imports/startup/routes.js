FlowRouter.route('/', {
	name: 'index',
	action() {
		Session.set("in_editor", false)
		BlazeLayout.render('applicationLayout', {main: 'splash_page'})
	}
})

FlowRouter.route('/views/login.html', {
	name: 'user_login',
	action() {

		if(Meteor.user())
		{
			Session.set("in_editor", false)
			FlowRouter.go('/')
		}
		else
			BlazeLayout.render('applicationLayout', {main: 'login_body'})
	}
})

FlowRouter.route('/views/user_home.html', {
	name: 'user_home',
	action(){
		Session.set("in_editor", false)
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
			Session.set("in_editor", true)
			BlazeLayout.render('applicationLayout', {main: ''})
		}
		else
			FlowRouter.go('/')
	}
})