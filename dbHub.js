// Coded by Ronen Agarunov
// Database relations with Hubs and Locations
 
// Connection to database (MySQL)
var mysql      = require('mysql')
var con = mysql.createConnection({
    host     : 'localhost',
    user     : 'admin',
    password : 'passwordDemo',
    database : 'meethub'
});

class dbLocation{

	inLocation(Email, lat_, lon_, callback) {
		var check = "SELECT * FROM User WHERE Email=?";
		var pCheck = [Email];
		con.query(check, pCheck, function(err, results, fields) {
			if (results.length > 0) {
				// console.log("Email exists in location");
				return callback(2);
			} else {
				var sql = "INSERT INTO Location (latitude, longitude, UserId) VALUE(?, ?, ?);";
				var params = [lat_, lon_, Email];
				con.query(sql, params, function(err, results, fields) {
					if(err) {
						// console.log("Location in DB failed: " + err);
						return callback(1);
                    } else {
						// console.log("Location insert succeeded");
						return callback(0);
					}
				});
			}
		});
	}

	outLocation(Email, callback) {
		var sql = "SELECT * FROM Location WHERE UserId=?";
		var params = [Email];
		con.query(sql, params, function(err, results, fields) {
			if(err) {
				// console.log("Location in DB failed: " + err);
				return callback(1);
			} else {
				// console.log("View location succeeded");
				return callback(results);
			}
		});
	}
};

module.exports = dbLocation;
