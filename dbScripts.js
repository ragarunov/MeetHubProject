// Coded by Ronen Agarunov
// Database relations

// Connection to database (MySQL)
var mysql      = require('mysql')
var sha1       = require('sha1')
var con = mysql.createConnection({
    host     : 'localhost',
    user     : 'admin',
    password : 'passwordDemo',
    database : 'meethub'
});
var onlineUsers = []

class DB{
	
	// Login function
    login(u, p, callback){
		var sql = 'SELECT * FROM User WHERE Email=? AND Password=?';
		var params = [u, p];

		con.query(sql, params, (err, result, fields) => {
			if (err) throw err;
	    
			if(result.length > 0) {
				let s = sha1(u+p) // create login session 
				// check if user already online 
				for(let i = 0; i < onlineUsers.length; i++) {
					if (onlineUsers[i].session == s) {
						//console.log("WARNING logged in user trying to login")
						return callback(s)
					}
				}
			
				// push user to onlineUsers list
				onlineUsers.push({session:s,username:u,password:p})
				// console.log("->: Added user to list u=" + u + " p=" + p)
				// console.log("->: Total onlineUsers.length " + onlineUsers.length)
		
				// finally send result
				// res.send(JSON.stringify({session:s}));
				return callback(s)
			} else {
				// console.log("->: Did not find User and Pass pair");
				// res.send(JSON.stringify({session:"error"}));
				return callback("error")
			}
		})
    }

    register(Username, Password, First_Name, Last_Name, Email, DoB, callback) {
		let hash = sha1(Password);
		var check = "SELECT * FROM User WHERE Email=?";
		var pCheck = [Email];
		
		con.query(check, pCheck, function(err, results, fields) {
		
			if (results.length > 0) {
				// console.log("Registration failed, account with email exists");
				return callback(0);
			} else {
				var sql = "INSERT INTO User (Username, Password, First_Name, Last_Name, Email, Picture, Bio, dateOfBirth) VALUES(?, ?, ?, ?, ?, \"default.jpg\", \"Hi! I am a new member of MeetHub\", ?)";
	    		var params = [Username, hash, First_Name, Last_Name, Email, DoB];
	    		con.query(sql, params, function (err, results, fields) {
					if (err) {
						// console.log("Registration failed in DB: " + err);
		    			return callback(0);
                	} else {
		    			// console.log("registration successfully completed for: " + Username);
						var sessionArray = [Email, Password];
		    			return callback(sessionArray);
					}
	    		});
			}
		});
    }

    recovery(Email, tempPassword, callback) {
	    var sql = "UPDATE User SET Password=? WHERE Email=?";
	    var params = [tempPassword, Email];
		
	    con.query(sql, params, function(err, results, fields) { 
			if(err){
				// console.log("->: Password reset failed in DB " + err);
				return callback(1);
			} else {
	    		// console.log("->: Password updated")
				return callback(0);
		    }
	    });
    }

    /* 
    // Profile update sections
    */
    updatePassword(Email, oldPass, newPass, callback) {
		var sql = "SELECT * FROM User WHERE Email=? AND Password=?";
		var params = [Email, oldPass];
	
		con.query(sql, params, function(err, result, fields) {
			if (err)
				throw err;

			if (result.length > 0) {
			
				var sqlChange = "UPDATE User SET Password=? WHERE Email=?";
				var paramsAnother = [newPass, Email];
				con.query(sqlChange, paramsAnother, function(err, result, fields) {
					if (err) {
						// console.log("Password change failed in update to new password stage" + err);
						return callback(1);
					} else {
						// console.log("Password successfully changed");
						let sess = sha1(Email + newPass)
						onlineUsers.push({session:sess,username:Email,password:newPass})
						return callback(sess);
					}
				});
			} else {
				// console.log("Old password is incorrect for: " + Email);
				return callback(2);			
			}
		});
	}

	updatePicture(Email, picUrl, callback) {
		var sql = "UPDATE User SET Picture=? WHERE Email=?";
		var params = [picUrl, Email];

		con.query(sql, params, function(err, results, fields) {
			if(err){
				// console.log("Picture update failed in DB " + err);
				return callback(1);
			} else{
				// console.log("Picture update succeeded");
				return callback(0);
			}
        });
   }

	updateBio(Email, Bio, callback) {
		var sql = "UPDATE User SET Bio=? WHERE Email=?";
		var params = [Bio, Email];

		con.query(sql, params, function(err, results, fields) {
			if(err){
				// console.log("Bio update failed in DB " + err);
				return callback(1);
			} else {
				// console.log("Bio update succeeded");
				return callback(0);
			}
        });
   }

	viewProfile(Email, callback) {
		var sql = "SELECT First_Name, Last_Name, Picture, Bio, dateOfBirth FROM User WHERE Email=?";
		var params = [Email];

		con.query(sql, params, function(err, results, fields) {
			if(err){
				// console.log("View profile failed in DB " + err);
				return callback(1);
			} else {
				// console.log("View profile succeeded");
				return callback(results);
			}
        });	
   }

};

module.exports = DB;
