const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const User = require('./models/user')
const Exercise = require('./models/exercise')

const cors = require('cors')

require('dotenv').config();

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track', {useMongoClient: true} )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/index.html')
});


//=================================================================

app.post('/api/exercise/new-user', (req, res) => {
	if( !req.body.username ) return res.status(400).send("No username found");
	const { username } = req.body;
	const user = new User({username: username});
	user.save( (err) => {
		if(err) return res.status(400).send("username already taken");
		return res.json({ username: user.username, _id: user._id });
	})
	
})

/**
 * {"username":"qqqqqqqqqqqqqqq","description":"asd","duration":2,"_id":"rk64vGPZz","date":"Sat Nov 11 1111"}
 */
app.post('/api/exercise/add', (req, res) => {
	const { userId, description, duration, date } = req.body;
	if ( !userId || !description || !duration || !date ) return res.status(400).send("Not enough parameters");
	User.findById(userId, (err, user) => {
		if(err) return res.status(400).send("User not found");
		try {
			var exercise = new Exercise({
				username: user.username,
				description: description,
				duration: Number(duration),
				date: Date(date),
			});
		} catch(err) {
			return res.status(400).send(err.message);
		}
		exercise.save( (err) => {
			if(err) return res.status(400).send(err.message);
			return res.json({
				username: exercise.username,
				description: exercise.description,
				duration: exercise.duration,
				_id: exercise._id,
				date: exercise.date
			})
		})
	})
})

app.get('/api/exercise/log/:userId/:from?/:to?/:limit?', (req, res) => {
	res.sendStatus(200);
})

//=================================================================

// Not found middleware
app.use((req, res, next) => {
	return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
	let errCode, errMessage
	
	if (err.errors) {
		// mongoose validation error
		errCode = 400 // bad request
		const keys = Object.keys(err.errors)
		// report the first validation error
		errMessage = err.errors[keys[0]].message
	} else {
		// generic or custom error
		errCode = err.status || 500
		errMessage = err.message || 'Internal Server Error'
	}
	res.status(errCode).type('txt')
	.send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log('Your app is listening on port ' + listener.address().port)
})
