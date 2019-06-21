// Coded by Ronen Agarunov
// Backend relations with Hubs and Locations using Callback

// Use location features from database
const DB = require("./dbHub.js")
let db = new DB();

const generator = require('generate-password');
const nodemailer = require('nodemailer');

class Location{

	// Get location from DB using callback
	getLoc(email, callback) {
		db.outLocation(email[0], (arr) => {
		
			if(arr == 1) // check for errors
				return callback(arr)
			
			var userLoc = [arr[0].latitude, arr[0].longitude]
			return callback(userLoc)
		})
	}

	// Set location to DB
	setLoc(email, lat, lon, callback) {
		db.inLocation(email[0], lat, lon, (arr) => {
			var message = false;
			if(arr == 1 || arr == 2) // check for errors
				return callback(message)
			
			message = true;
			return callback(message)
		});
	}

}
module.exports = Location
