import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { Session } from 'meteor/session'
import { Mongo } from 'meteor/mongo'

import '../imports/startup/accounts-config.js'

import '../imports/api/database_interact.js'

import '../imports/templates/navbar.js'
import '../imports/templates/sidebar.js'

import '../imports/views/splash_page.js'
import '../imports/views/login.js'
import '../imports/views/user_home.js'
import '../imports/views/story_editor.js'

import '../imports/startup/routes.js'

Session.set("in_editor", false)
Session.set("story_id", '')

Template.body.helpers({

	in_editor(){
		return Session.get("in_editor")
	}

})