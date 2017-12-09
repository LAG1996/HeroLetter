import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'

import '../imports/startup/accounts-config.js'

import '../imports/templates/navbar.js'
import '../imports/templates/sidebar.js'

import '../imports/views/splash_page.js'
import '../imports/views/login.js'
import '../imports/views/user_home.js'
import '../imports/views/story_editor.js'

import '../imports/startup/routes.js'