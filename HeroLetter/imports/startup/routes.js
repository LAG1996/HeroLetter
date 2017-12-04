FlowRouter.route('/', {
	name: 'index',
	action() {
		BlazeLayout.render('applicationLayout', {main: 'splash_page'})
	}
})

FlowRouter.route('/views/login.html', {
	name: 'user_login',
	action() {
		BlazeLayout.render('applicationLayout', {main: 'login_body'})
	}
})