const express = require('express');
const pageRoutes = require('./routes');
const apiRoutes = require('./api/routes');
const path = require('path');
const session = require('express-session');
const fileUpload = require('express-fileupload');

const server = express();

// Settings.
server.set('port', 4500);
server.set('views', path.join(__dirname, 'views'));
server.set('View engine', 'pug');

// Middlewares.
server.use(express.json()); // activando JSON.
server.use(express.urlencoded({ extended: false })); // Recibir datos desde un formulario.
server.use(
	session({
		name: 'books-app',
		secret: 'casafhbdsakjfhsdjkfhdsfhsddhfjksdfhsdjkhfjksd',
		resave: false,
		saveUninitialized: false,
	})
);
server.use(fileUpload());

// Routes.
server.use('/pages', pageRoutes.pages);
server.use('/api/user', apiRoutes.user);
server.use('/api/book', apiRoutes.book);

// Static folder.
server.use(express.static(path.join(__dirname, 'public')));

module.exports = server;
