import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { Session } from 'meteor/session'
import { Mongo } from 'meteor/mongo'

//Import the databases we're going to be dealing with
import { Entities } from '../imports/api/entities.js'
import { Events } from '../imports/api/events.js'
import { Stories } from '../imports/api/stories.js'

import '../imports/startup/accounts-config.js'

import '../imports/templates/navbar.js'
import '../imports/templates/sidebar.js'

import '../imports/views/splash_page.js'
import '../imports/views/login.js'
import '../imports/views/user_home.js'
import '../imports/views/story_editor.js'

import '../imports/startup/routes.js'

Session.set("in_editor", false)

Template.body.helpers({

	in_editor(){
		return Session.get("in_editor")
	}

})