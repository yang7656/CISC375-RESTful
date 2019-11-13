var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');

var port = 8000;
var public_dir = path.join(__dirname, 'public');

var users;
var users_filename = path.join(__dirname, 'users.json');

fs.readFile(users_filename, (err, data) => {
    if (err) {
        console.log('Error reading users.json');
        users = {};
    }
    else {
        users = JSON.parse(data);
    }
});

var app = express();
app.use(bodyParser.urlencoded({extended: true}));

// IN cmd 'curl -X PUT -d "id=1&name=hellow%20world&email=hu%40code.org" http://localhost:8000/add-users'
// IN cmd 'curl http://localhost:8000/list-users'

app.get('/list-users', (req, res) => {
	if (req.query === 'limit' && req.query.limit <= users.users.length) {
		let limitUser = [];
		for (var i = 0; i < req.query.limit; i++) {
			limitUser.push(users.users[i]);
		}
		res.type('json').send(limitUser);
	}
	else if (req.query === 'format') {
		
	}
	else {
		res.type('json').send(users);
	}
});

app.put('/add-user', (req, res) => {
	var new_user = {
		id: parseInt(req.body.id, 10),
		name: req.body.name,
		email: req.body.email
	};
	var has_id = false;
	for (let i = 0; i < users.users.length; i++) {
		if (users.users[i].id === new_user.id) {
			has_id = true;
		}
	}
	if (has_id) {
		res.status(500).send("Error: User already exists");
	}
	else {
		users.users.push(new_user);
		fs.writeFile(users_filename, JSON.stringify(users, null, 4), (err) => {
			res.status(200).send('Success!');
		});
	}
	
});

app.delete('/remove-user', (req, res) => {
	
	var target_user = {
		id: parseInt(req.body.id, 10),
		name: req.body.name,
		email: req.body.email
	};
	var noSuchID = true;
	for (let i = 0; i < users.users.length; i++) {
		if (users.users[i].id === target_user.id) {
			var targetIndex;
			noSuchID = false;
			targetIndex = i;
		}
	}
	
	if (noSuchID) {
		res.status(500).send("Error: Target user does not exist");
	}
	else {
		users.users.splice(targetIndex,1);
		fs.writeFile(users_filename, JSON.stringify(users, null, 4), (err) => {
			res.status(200).send('Success delete!');
		});
	}
});

app.post('/update-user', (req, res) => {
	var target_user = {
		id: parseInt(req.body.id, 10),
		name: req.body.name,
		email: req.body.email
	};
	var noSuchID = true;
	for (let i = 0; i < users.users.length; i++) {
		if (users.users[i].id === target_user.id) {
			var targetIndex;
			noSuchID = false;
			targetIndex = i;
		}
	}
	
	if (noSuchID) {
		res.status(500).send("Error: Target user does not exist");
	}
	else {
		users.users[targetIndex].name = req.body.name;
		users.users[targetIndex].email = req.body.email;
		fs.writeFile(users_filename, JSON.stringify(users, null, 4), (err) => {
			res.status(200).send('Success update!');
		});
	}
});


console.log('Now listening on port ' + port);
var server = app.listen(port);