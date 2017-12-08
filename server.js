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
		if(err) return res.status(400).send(err.message);
		try {
			var exercise = new Exercise({
				username: user.username,
				userId: user._id,
				description: description,
				duration: Number(duration),
				date: new Date(date),
			});
		} catch(err) {
			return res.status(400).send("Error de try."+ err.message);
		}
		exercise.save( (error) => {
			if(error) return res.status(400).send("Could not save."+ error.message);
			return res.json({
				username: exercise.username,
				description: exercise.description,
				duration: exercise.duration,
				_id: exercise._id,
				date: exercise.date
			})
		})
	})
});

/*
{"_id":"B1IeWZdWM","username":"qweqweqwe","count":2,"log":[{"description":"asdasd","duration":1,"date":"Wed May 05 1999"},{"description":"qqqqqqqqqqqqqq","duration":1,"date":"Wed May 05 1999"}]}
*/

app.get('/api/exercise/log?:userId/:from?/:to?/:limit?', (req, res) => {
	var { userId, from, to, limit } = req.query;
	if( !userId ) return res.status(400).send("userId required");
	User.findOne( { _id: userId } , (err, user) => {
		if(err) return res.status(400).send("Invalid userId");
		if (!user) return res.status(400).send("User not found");
		Exercise.find( {userId: userId})
		.where('date').gte( from ? new Date(from) : new Date(0))
		.where('date').lte( to ? new Date(to) : new Date())
		.limit( limit ? Number(limit) : 1E10)
		.exec( (err, results) => {
			if(err) return res.status(400).send(err.message);
			return res.json({
				_id: userId,
				username: user.username,
				count: results.length,
				log: results
			});
		})
	});
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
