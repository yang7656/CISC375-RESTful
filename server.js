// Built-in Node.js modules
var fs = require('fs');
var path = require('path');

// NPM modules
var express = require('express')
var sqlite3 = require('sqlite3')
var bodyParser = require('body-parser');
var convert = require('xml-js');

var db_filename = path.join(__dirname, 'stpaul_crime.sqlite3');

var app = express();
var port = 8000;

app.use(bodyParser.urlencoded({extended: true}));


// open stpaul_crime.sqlite3 database
var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
    }
});


// IN cmd 'curl -X PUT -d "id=1&name=hellow%20world&email=hu%40code.org" http://localhost:8000/add-users'
// IN cmd 'curl http://localhost:8000/list-users'

app.get('/codes', (req, res) => {
    db.all("SELECT * FROM Codes ORDER BY code", (err,rows) => {
        
        var crime = {};
        
        if (req.query.hasOwnProperty('code')) {
            var range = req.query.code.split(',');
            var min = parseInt(range[0],10);
            var max = parseInt(range[1],10);
            var count = -1;
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].code >= min && rows[i].code <= max) {
                    crime['C'+rows[i].code] = rows[i].incident_type;
                    count++;
                }
            }
            if (count < 0) {
                res.status(500).send('Error: No such code range');
            }
            else {
                res.type('json').send(JSON.stringify(crime, null, 4));
            }
        }
        else if (req.query.hasOwnProperty('format')) {
            var crimeXML = {'CODES' : {}}
            for (let i = 0; i < rows.length; i++) {
                crimeXML.CODES['C'+rows[i].code] = rows[i].incident_type;
                crime['C'+rows[i].code] = rows[i].incident_type;
            }
            if (req.query.format === 'xml') {
                var options = {compact: true, spaces: 4};
                var result = convert.js2xml(crimeXML,options);
                res.type('xml').send(result);
            } else {
                res.type('json').send(JSON.stringify(crime, null, 4));
            }
        }
        else {
            for (let i = 0; i < rows.length; i++) {
                crime['C'+rows[i].code] = rows[i].incident_type;
            }
            res.type('json').send(JSON.stringify(crime, null, 4));
        }
    });
});

app.get('/neighborhoods', (req, res) => {
    db.all("SELECT * FROM Neighborhoods ORDER BY neighborhood_number", (err,rows) => {
        
        var crime = {};
        
        if (req.query.hasOwnProperty('id')) {
            var range = req.query.id.split(',');
            var min = parseInt(range[0],10);
            var max = parseInt(range[1],10);
            var count = -1;
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].neighborhood_number >= min && rows[i].neighborhood_number <= max) {
                    crime['N'+rows[i].neighborhood_number] = rows[i].neighborhood_name;
                    count++;
                }
            }
            if (count < 0) {
                res.status(500).send('Error: No such id range');
            }
            else {
                res.type('json').send(JSON.stringify(crime, null, 4));
            }
        }
        else if (req.query.hasOwnProperty('format')) {
            var nXML = {'NEIGHBORHOODS' : {}}
            for (let i = 0; i < rows.length; i++) {
                nXML.NEIGHBORHOODS['N'+rows[i].neighborhood_number] = rows[i].neighborhood_name;
                crime['N'+rows[i].neighborhood_number] = rows[i].neighborhood_name;
            }
            if (req.query.format === 'xml') {
                var options = {compact: true, spaces: 4};
                var result = convert.js2xml(nXML,options);
                res.type('xml').send(result);
            } else {
                res.type('json').send(JSON.stringify(crime, null, 4));
            }
        }
        else {
            for (let i = 0; i < rows.length; i++) {
                crime['N'+rows[i].neighborhood_number] = rows[i].neighborhood_name;
            }
            res.type('json').send(JSON.stringify(crime, null, 4));
        }
    });
});

app.get('/incidents', (req, res) => {
    
    var outputString = '{\n';
    
    db.all("SELECT * FROM Incidents ORDER BY date_time", (err,rows) => {
        
        var crime = {};
        
        if (req.query.hasOwnProperty('start_date')) {
            var input = req.query.start_date.split('-'); // array of month, day, year
            var start_date = rows[0].date_time.split('T')[0].split('-')[0] + 
                             rows[0].date_time.split('T')[0].split('-')[1] + 
                             rows[0].date_time.split('T')[0].split('-')[2];
            var end_date = rows[rows.length-1].date_time.split('T')[0].split('-')[0] + 
                           rows[rows.length-1].date_time.split('T')[0].split('-')[1] + 
                           rows[rows.length-1].date_time.split('T')[0].split('-')[2];
            if (parseInt(input[2]+input[0]+input[1]) < parseInt(start_date) || parseInt(input[2]+input[0]+input[1]) > parseInt(end_date)) {
                res.status(500).send('Error: No such start date');
            }
            else {
                var start_index;
                var startIndex = [];
                var lastIndex;

                for (let i = 0; i < rows.length; i++) {
                    var eachDate = rows[i].date_time.split('T')[0].split('-'); // array of year, month, day
                    if (input[0] === eachDate[1] && input[1] === eachDate[2] && input[2] === eachDate[0]) {
                        startIndex.push(i);
                    }
                }
                start_index = startIndex[0];
                if (start_index + 9999 >= rows.length) {
                    lastIndex = rows.length-1;
                }
                else {
                    lastIndex = start_index + 9999;
                }
                
            }
        }
        else if (req.query.hasOwnProperty('end_date')) {
            
        }
        else if (req.query.hasOwnProperty('code')) {
            
        }
        else if (req.query.hasOwnProperty('grid')) {
            
        }
        else if (req.query.hasOwnProperty('neighborhood')) {
            
        }
        else if (req.query.hasOwnProperty('limit')) {
            
        }
        else if (req.query.hasOwnProperty('format')) {
            
        }
        else {
            var start_index = 0;
            if (rows.length - 10000 > 0) {
                start_index = rows.length - 10001;
            }
            for (let i = rows.length-1; i > start_index; i--) {
                var crime_case = {};
                crime_case['date'] = rows[i].date_time.split('T')[0];
                crime_case['time'] = rows[i].date_time.split('T')[1].substring(0,rows[i].date_time.split('T')[1].length-4);
                crime_case['code'] = rows[i].code;
                crime_case['incident'] = rows[i].incident;
                crime_case['police_grid'] = rows[i].police_grid;
                crime_case['neighborhood_number'] = rows[i].neighborhood_number;
                crime_case['block'] = rows[i].block;
                crime['I'+rows[i].case_number] = crime_case;
            }
            res.type('json').send(JSON.stringify(crime, null, 4));
        }
    });
});

var server = app.listen(port);