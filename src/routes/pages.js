const { Router } = require('express');
const models = require('../api/models');
const router = Router();
const middlewares = require('../middlewares');
const path = require('path');
const uuid = require('uuid');

router.get('/sign-in', middlewares.validations.existUser, (req, res) => {
	// Primera forma: [sendFile]
	// res.sendFile()
	// res.sendFile('C:/Users/kensh/Projects/clases/ejercicio_3/src/views/sign_in.html');

	// Segunda forma: [render]

	let errorMessage;
	if (req.session.errorMessage) {
		errorMessage = req.session.errorMessage;
		delete req.session['errorMessage'];
	}

	res.render('sign_in.pug', { title: 'Sign in', errorMessage });
});

router.get('/sign-up', middlewares.validations.existUser, (req, res) => {
	let errorMessage;
	if (req.session.errorMessage) {
		errorMessage = req.session.errorMessage;
		delete req.session['errorMessage'];
	}
	res.render('sign_up.pug', { title: 'Sign Up', errorMessage });
});

router.get('/books', async (req, res) => {
	// if (req.session.counter) {
	// 	req.session.counter++;
	// } else {
	// 	req.session.counter = 1;
	// }

	// req.session.counter = req.session.counter ? req.session.counter + 1 : 1;
	// const counter = req.session.counter;

	let userType = 0; // 0: Anonymous, 1: User, 2: Admin.
	if (req.session.user) {
		const user = req.session.user;
		userType = user.admin ? 2 : 1;
	}

	const books = await models.book.find();

	res.render('books.pug', { title: 'Books', userType, books });
});

router.get('/book-details/:id', async (req, res) => {
	const { id } = req.params;

	console.log({ session: req.session });

	let userType = 0;
	if (req.session.user) {
		const user = req.session.user;
		userType = user.admin ? 2 : 1;
	}

	const book = await models.book.findById(id);

	res.render('book_details.pug', { title: 'Book details', book, userType });
});

router.get('/book-create', middlewares.validations.onlyAdmin, (req, res) => {
	let errorMessage;
	if (req.session.errorMessage) {
		errorMessage = req.session.errorMessage;
		delete req.session['errorMessage'];
	}

	res.render('book_create.pug', { title: 'Book create', errorMessage });
});

// Middlewares
router.post('/create', async (req, res) => {
	const { email, password } = req.body;

	const existUser = await models.user.findOne({ email });
	if (existUser !== null) {
		req.session.errorMessage = 'User ya registrado';
		return res.redirect('/pages/sign-up');
	}

	const hash = await models.user.encrypt(password);

	const user = models.user({ email, password: hash });
	await user.save();

	res.redirect('/pages/sign-in');
});

module.exports = router;

router.post('/login', async (req, res) => {
	const { email, password } = req.body;
	const user = await models.user.findOne({ email });
	if (!user) {
		req.session.errorMessage = 'El email no existe';
		return res.redirect('/pages/sign-in');
	}

	const isValid = await models.user.compare(password, user.password);
	if (!isValid) {
		req.session.errorMessage = 'Password incorrecto';
		return res.redirect('/pages/sign-in');
	}

	req.session.user = user;
	res.redirect('/pages/books');
});

router.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.log(err);
		}
		res.redirect('/pages/books');
	});
});

router.post('/new-book', async (req, res) => {
	const { author, description } = req.body;
	const { photo } = req.files;

	const pathStr = __dirname;
	const aPath = pathStr.split('\\');
	aPath.pop();

	const phothoName = photo.name;
	const finalPhotoName = uuid.v4() + '.' + phothoName.split('.')[1];

	const finalPath = path.join(
		aPath.join('/'),
		'public',
		'uploads',
		finalPhotoName
	);

	const book = models.book({
		author,
		description,
		photo: 'uploads' + '/' + finalPhotoName,
	});

	photo.mv(finalPath, async (err) => {
		if (err) {
			console.log(err);
			req.session.errorMessage = 'Hubo un erro salvando la imagen';
			return res.redirect('/pages/book-create');
		}

		await book.save();
		res.redirect('/pages/book-create');
	});
});

router.post('/likes/:id', async (req, res) => {
	const { id } = req.params;

	const book = await models.book.findById(id);
	book.puntuation += 1;
	await book.save();

	res.redirect('/pages/books');
});
