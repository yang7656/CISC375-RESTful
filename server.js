// Built-in Node.js modules
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
var db = new sqlite3.Database(db_filename, sqlite3, (err) => {
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
        var crimeXML = {'CODES' : {}};
        var count = -1;
        
        // code
        if (req.query.hasOwnProperty('code')) {
            var code = req.query.code.split(',');
            var codeInt = [];
            for (let j = 0; j < code.length; j++) {
                codeInt.push(parseInt(code[j],10));
            }
            for (let i = 0; i < rows.length; i++) {
                for (let k = 0; k < codeInt.length; k++) {
                    if (rows[i].code === codeInt[k]) {
                        crimeXML.CODES['C'+rows[i].code] = rows[i].incident_type;
                        crime['C'+rows[i].code] = rows[i].incident_type;
                        count++;
                    }
                }
            }
            if (!req.query.hasOwnProperty('format')) {
                res.type('json').send(JSON.stringify(crime, null, 4));
            }
        }   
        else { // no code
            for (let i = 0; i < rows.length; i++) {
                crimeXML.CODES['C'+rows[i].code] = rows[i].incident_type;
                crime['C'+rows[i].code] = rows[i].incident_type;
            }
            if (!req.query.hasOwnProperty('format')) {
                res.type('json').send(JSON.stringify(crime, null, 4));
            }
        }
        
        // format
        if (count < 0 && req.query.hasOwnProperty('code')) {
            res.status(500).send('Error: Cannot find any of code(s)');
        }
        else {
            if (req.query.hasOwnProperty('format')){
                if (req.query.format === 'xml' || req.query.format === 'json') {
                    if (req.query.format === 'xml') {
                        var options = {compact: true, spaces: 4};
                        var result = convert.js2xml(crimeXML, options);
                        res.type('xml').send(result);
                    }
                    if (req.query.format === 'json') {
                        res.type('json').send(JSON.stringify(crime, null, 4));
                    }
                }
                else {
                    res.status(500).send('Error: No such format');
                }
            }
        }
        
    });
});

app.get('/neighborhoods', (req, res) => {
    
    db.all("SELECT * FROM Neighborhoods ORDER BY neighborhood_number", (err,rows) => {
        
        var crime = {};
        var crimeXML = {'NEIGHBORHOOD' : {}};
        var count = -1;
        
        // id
        if (req.query.hasOwnProperty('id')) {
            var id = req.query.id.split(',');
            var idInt = [];
            for (let j = 0; j < id.length; j++) {
                idInt.push(parseInt(id[j],10));
            }
            for (let i = 0; i < rows.length; i++) {
                for (let k = 0; k < idInt.length; k++) {
                    if (rows[i].neighborhood_number === idInt[k]) {
                        crimeXML.NEIGHBORHOOD['N'+rows[i].neighborhood_number] = rows[i].neighborhood_name;
                        crime['N'+rows[i].neighborhood_number] = rows[i].neighborhood_name;
                        count++;
                    }
                }
            }
            if (!req.query.hasOwnProperty('format')) {
                res.type('json').send(JSON.stringify(crime, null, 4));
            }
        }   
        else { // no id
            for (let i = 0; i < rows.length; i++) {
                crimeXML.NEIGHBORHOOD['N'+rows[i].neighborhood_number] = rows[i].neighborhood_name;
                crime['N'+rows[i].neighborhood_number] = rows[i].neighborhood_name;
            }
            if (!req.query.hasOwnProperty('format')) {
                res.type('json').send(JSON.stringify(crime, null, 4));
            }
        }
        
        // format
        if (count < 0 && req.query.hasOwnProperty('id')) {
            res.status(500).send('Error: Cannot find any of code(s)');
        }
        else {
            if (req.query.hasOwnProperty('format')){
                if (req.query.format === 'xml' || req.query.format === 'json') {
                    if (req.query.format === 'xml') {
                        var options = {compact: true, spaces: 4};
                        var result = convert.js2xml(crimeXML, options);
                        res.type('xml').send(result);
                    }
                    if (req.query.format === 'json') {
                        res.type('json').send(JSON.stringify(crime, null, 4));
                    }
                }
                else {
                    res.status(500).send('Error: No such format');
                }
            }
        }
        
    });
});

app.get('/incidents', (req, res) => {
    
    db.all("SELECT * FROM Incidents ORDER BY date_time", (err,rows) => {
        
        for (const prop in req.query) {
            console.log(req.query[prop]);
        }
        var crime = {};
        
        var result_start_date = rows[0].date_time.split('T')[0].split('-')[0] + 
                                       rows[0].date_time.split('T')[0].split('-')[1] + 
                                       rows[0].date_time.split('T')[0].split('-')[2];
        var result_end_date = rows[rows.length-1].date_time.split('T')[0].split('-')[0] + 
                             rows[rows.length-1].date_time.split('T')[0].split('-')[1] + 
                             rows[rows.length-1].date_time.split('T')[0].split('-')[2];
        
        
        if (Object.getOwnPropertyNames(req.query).length > 0) {
            if (req.query.hasOwnProperty('start_date')) {
                
                var inputSD = req.query.start_date.split('-'); // array of year, month, day
                var result_start_index;
                var result_end_index;
                var startIndex = []; // array contain all index of cases in the start_date
                
                if (parseInt(inputSD[2]+inputSD[0]+inputSD[1]) < parseInt(result_start_date)) {
                    result_start_index = 0;
                }
                
                for (let i = 0; i < rows.length; i++) { // an array of index of start date 
                    var eachDate = rows[i].date_time.split('T')[0].split('-'); // array of year, month, day
                    if (parseInt(inputSD[0]) < parseInt(eachDate[0])) {
                        startIndex.push(i);
                    }
                    else if (parseInt(inputSD[0]) === parseInt(eachDate[0])) {
                        if (parseInt(inputSD[1]) < parseInt(eachDate[1])) {
                            startIndex.push(i);
                        }
                        else if (parseInt(inputSD[1]) === parseInt(eachDate[1])) {
                            if (parseInt(inputSD[2]) <= parseInt(eachDate[2])) {
                                startIndex.push(i);
                            }
                        }
                    }
                     
                }
                result_start_index = startIndex[0];
                /////////////////////////////////////////////////////////s
                if (result_start_index + 9999 >= rows.length) {
                    result_end_index = rows.length - 1;
                }
                else {
                    result_end_index = result_start_index + 9999;
                }
                //var count = 0;
                for (let j = result_end_index; j > result_start_index-1; j--) {
                    var crime_case = {};
                    crime_case['date'] = rows[j].date_time.split('T')[0];
                    crime_case['time'] = rows[j].date_time.split('T')[1];
                    crime_case['code'] = rows[j].code;
                    crime_case['incident'] = rows[j].incident;
                    crime_case['police_grid'] = rows[j].police_grid;
                    crime_case['neighborhood_number'] = rows[j].neighborhood_number;
                    crime_case['block'] = rows[j].block;
                    crime['I'+rows[j].case_number] = crime_case;
                }
                res.type('json').send(JSON.stringify(crime, null, 4));
                //}  
            }
            
            
            
            
            
            else if (req.query.hasOwnProperty('end_date')) {
                var input = req.query.end_date.split('-'); // array of month, day, year
                
                if (parseInt(input[2]+input[0]+input[1]) < parseInt(crime_start_date) || parseInt(input[2]+input[0]+input[1]) > parseInt(crime_end_date)) {
                    res.status(500).send('Error: No such end date');
                }
                else {
                    var end_index;  // the index of last case in the end_date
                    var firstIndex; // the first index of case in results
                    for (let i = 0; i < rows.length; i++) {
                        var eachDate = rows[i].date_time.split('T')[0].split('-'); // array of year, month, day
                        if (input[0] === eachDate[1] && input[1] === eachDate[2] && input[2] === eachDate[0]) {
                            end_index = i;
                        }
                    }
                    if (end_index - 9999 < 0) {
                        firstIndex = 0;
                    }
                    else {
                        firstIndex = end_index - 9999;
                    }
                    for (let j = end_index; j > firstIndex-1; j--) {
                        var crime_case = {};
                        crime_case['date'] = rows[j].date_time.split('T')[0];
                        crime_case['time'] = rows[j].date_time.split('T')[1];
                        crime_case['code'] = rows[j].code;
                        crime_case['incident'] = rows[j].incident;
                        crime_case['police_grid'] = rows[j].police_grid;
                        crime_case['neighborhood_number'] = rows[j].neighborhood_number;
                        crime_case['block'] = rows[j].block;
                        //crime_case['count'] = count;
                        crime['I'+rows[j].case_number] = crime_case;
                    }
                    res.type('json').send(JSON.stringify(crime, null, 4));
                }
            }
            else if (req.query.hasOwnProperty('code')) {
                var input = req.query.code.split(',');
                var min = parseInt(input[0], 10);
                var max = parseInt(input[1], 10);
                var count = 0;
                for (let i = rows.length-1; i > -1; i--) {
                    var crime_case = {};
                    if (count < 10000) {
                        if (rows[i].code >= min && rows[i].code <= max) {
                            crime_case['date'] = rows[i].date_time.split('T')[0];
                            crime_case['time'] = rows[i].date_time.split('T')[1];
                            crime_case['code'] = rows[i].code;
                            crime_case['incident'] = rows[i].incident;
                            crime_case['police_grid'] = rows[i].police_grid;
                            crime_case['neighborhood_number'] = rows[i].neighborhood_number;
                            crime_case['block'] = rows[i].block;
                            //crime_case['count'] = count;
                            count++;
                            crime['I'+rows[i].case_number] = crime_case;
                        }
                    }
                }
                res.type('json').send(JSON.stringify(crime, null, 4));
            }
            else if (req.query.hasOwnProperty('grid')) {
                var input = req.query.grid.split(',');
                var min = parseInt(input[0], 10);
                var max = parseInt(input[1], 10);
                var count = 0;
                for (let i = rows.length-1; i > -1; i--) {
                    var crime_case = {};
                    if (count < 10000) {
                        if (rows[i].police_grid  >= min && rows[i].police_grid  <= max) {
                            crime_case['date'] = rows[i].date_time.split('T')[0];
                            crime_case['time'] = rows[i].date_time.split('T')[1].substring(0,rows[i].date_time.split('T')[1].length-4);
                            crime_case['code'] = rows[i].code;
                            crime_case['incident'] = rows[i].incident;
                            crime_case['police_grid'] = rows[i].police_grid;
                            crime_case['neighborhood_number'] = rows[i].neighborhood_number;
                            crime_case['block'] = rows[i].block;
                            //crime_case['count'] = count;
                            count++;
                            crime['I'+rows[i].case_number] = crime_case;
                        }
                    }
                }
                res.type('json').send(JSON.stringify(crime, null, 4));
            }
            else if (req.query.hasOwnProperty('id')) {
                var input = req.query.id.split(',');
                var min = parseInt(input[0], 10);
                var max = parseInt(input[1], 10);
                var count = 0;  
                for (let i = rows.length-1; i > -1; i--) {
                    var crime_case = {};
                    if (count < 10000) {
                        if (rows[i].neighborhood_number  >= min && rows[i].neighborhood_number  <= max) {
                            crime_case['date'] = rows[i].date_time.split('T')[0];
                            crime_case['time'] = rows[i].date_time.split('T')[1].substring(0,rows[i].date_time.split('T')[1].length-4);
                            crime_case['code'] = rows[i].code;
                            crime_case['incident'] = rows[i].incident;
                            crime_case['police_grid'] = rows[i].police_grid;
                            crime_case['neighborhood_number'] = rows[i].neighborhood_number;
                            crime_case['block'] = rows[i].block;
                            //crime_case['count'] = count;
                            count++;
                            crime['I'+rows[i].case_number] = crime_case;
                        }
                    }
                }
                res.type('json').send(JSON.stringify(crime, null, 4));
            }
            else if (req.query.hasOwnProperty('limit')) {
                var input = parseInt(req.query.limit, 10);
                var start_index = 0;  
                if (rows.length - input > 0) {
                    start_index = rows.length - input;
                }
                for (let i = rows.length-1; i > start_index-1; i--) {
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
            else if (req.query.hasOwnProperty('format')) {
                var iXML = {'INCIDENTS' : {}}
                var start_index = 0;
                if (rows.length - 10000 >= 0) {
                    start_index = rows.length - 10000;
                }
                for (let i = rows.length-1; i > start_index-1; i--) {
                    var crime_case = {};
                    crime_case['date'] = rows[i].date_time.split('T')[0];
                    crime_case['time'] = rows[i].date_time.split('T')[1].substring(0,rows[i].date_time.split('T')[1].length-4);
                    crime_case['code'] = rows[i].code;
                    crime_case['incident'] = rows[i].incident;
                    crime_case['police_grid'] = rows[i].police_grid;
                    crime_case['neighborhood_number'] = rows[i].neighborhood_number;
                    crime_case['block'] = rows[i].block;
                    iXML.INCIDENTS['I'+rows[i].case_number] = crime_case;
                }
                if (req.query.format === 'xml') {
                    var options = {compact: true, spaces: 4};
                    var result = convert.js2xml(iXML,options);
                    res.type('xml').send(result);
                }
            }
        }
        else {
            var start_index = 0;  
            if (rows.length - 10000 > 0) {
                start_index = rows.length - 10000;
            }
            for (let i = rows.length-1; i > start_index-1; i--) {
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

app.put('/new-incident', (req, res) => {
    
    var crime_case = {};
    crime_case['date'] = req.body.date;
    crime_case['time'] = req.body.time;
    crime_case['code'] = req.body.code;
    crime_case['incident'] = req.body.incident;
    crime_case['police_grid'] = req.body.police_grid;
    crime_case['neighborhood_number'] = req.body.neighborhood_number;
    crime_case['block'] = req.body.block;
    db.all('INSERT INTO Incidents VALUES(1, "2010-12-23T02:25:45", 2, "diaorendilaomu", 89, 2, "5th Ave S")', (err) => {
        res.status(500).send(err);
    });
});

var server = app.listen(port);