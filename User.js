// Coded by Ronen Agarunov
// Backend database relations using Callback

var sha1 = require('sha1') // to hash passwords: hashed = sha1(data)
const sanitizer = require('sanitizer');

// Use location features from database
const DB = require("./dbScripts.js")
let db = new DB();

const generator = require('generate-password');
const nodemailer = require('nodemailer');

class User {

	verify(username, password, callback) {
		if(username == 'undefined' || password == 'undefined') {
			console.log("ERROR user or password undefined ")
			return callback(1);
    	}
		
		password = sanitizer.sanitize(password);
		let p = sha1(password) // hashed password

		return db.login(username, p, (result)=>{
			return callback(result)
    	})
	}
	
	reset(email, callback) {
		// console.log("->: Received email is: " + email);
	    var tempPassword = generator.generate({
			length: 8,
			strict: true
		});
	    
		let hash = sha1(tempPassword);
	    
	    db.recovery(email, hash, (result)=>{
			if(result != 1) {
				let transporter = nodemailer.createTransport({
					host: 'smtp.live.com',
					port: 587,
					secure: false, 
					auth: {
						user: "meethub@hotmail.com",
						pass: "passwordDemo"  // MeetHub email
						}
					});

				let mailOptions = {
					from: 'meethub@hotmail.com', // sender address
					to: email, // receiver
					subject: 'Password Reset', // Subject line
					html: 'Hello! <br /><br /> We believe you sent a password reset request. Your new temporary password is <b>' + tempPassword + '</b>. You may change this in your profile after you have logged in. <br /><br /> Thank you, <br /> MeetHub Team' //subject 
				};
		    
				transporter.sendMail(mailOptions, (error, info) => {
					if (error) {
						console.log('->: Transport creation error ' + error);
					} else {
						console.log('->: Mail transporter ready.');
						return res.send(JSON.stringify({sent:"true"}));
					}
				});
			
				callback(result);
			} else {
				callback(result);
			}		
	    })
	}
	
	registration(username, password, fname, lname, email, birth, callback) {
		fname = sanitizer.sanitize(fname);
		lname = sanitizer.sanitize(lname);
		username = sanitizer.sanitize(username);
		password = sanitizer.sanitize(password);
		let hash = sha1(password);

		var splitBirth = birth;
		var parts = splitBirth.split("/");
		var day = parseInt(parts[0]);
		var month = parseInt(parts[1]);
		var year = parseInt(parts[2]);

		birth = year + "-" + month + "-" + day;

		db.register(username, password, fname, lname, email, birth, (result)=> {
			if(!(result === 0)) {
				// console.log("->: Register OK");
				return callback(result);
			} else {	
				// console.log("->: BAD Register");
				return callback(result);
			}
		})
	}
	
	passwordReset(oldPassword, newPassword, profile, callback) {
		if(oldPassword == newPassword) {
			console.log("->: Password duplicate detected.")
			return callback(1);
		} else if (oldPassword == "unidentified" || newPassword == "unidentified") {
			console.log("->: Empty password data detected.")
			return callback(2);
		}
		
		newPassword = sanitizer.sanitize(newPassword);
		oldPassword = sanitizer.sanitize(oldPassword);
		newPassword = sha1(newPassword);
		oldPassword = sha1(oldPassword);
		
    	db.updatePassword(profile[0], oldPassword, newPassword,(result)=> {
			if(result == 1)
				return callback(3);
			
			if(result == 2)
				return callback(4);
			
			return callback(result);

		})
	}
	
	pictureChange(profile, picture, callback) {
		console.log(session);
		db.updatePicture(profile[0], picture, (result) => {
			return callback(result);
		})
	}
	
	bioChange(profile, bio, callback) {
		//session break down
		bio = sanitizer.sanitize(bio);
		db.updateBio(profile[0], bio, (result)=> {
			return callback(result);
		})
	}
	
	viewProfile(profile, callback){
		//session break down
		db.viewProfile(profile[0], (result) => {
			var parse = String(result[0].dateOfBirth);
			parse = parse.substring(4,15);
			result[0].dateOfBirth = parse;
			return callback(result);
		})
	}
}

module.exports = User