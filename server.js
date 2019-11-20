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

function filterIncident(StartDate_index, EndDate_index, Limit, Format, rows) {
   
    var count = 0;
    var crime = {};
    var crimeXML = {'INCIDENTS' : {}};
    console.log(EndDate_index);
    console.log(StartDate_index);
    if (Format === 'json') {
        for (let j = EndDate_index; j > StartDate_index-1; j--) {
            var crime_case = {};
            crime_case['date'] = rows[j].date_time.split('T')[0];
            crime_case['time'] = rows[j].date_time.split('T')[1];
            crime_case['code'] = rows[j].code;
            crime_case['incident'] = rows[j].incident;
            crime_case['police_grid'] = rows[j].police_grid;
            crime_case['neighborhood_number'] = rows[j].neighborhood_number;
            crime_case['block'] = rows[j].block;
            crime_case['count'] = count;
            crime['I'+rows[j].case_number] = crime_case;
            count++;
            if (count === Limit) {
                return crime;
            }
        }
        return crime;
    }
    
    if (Format === 'xml') {
        for (let j = EndDate_index; j > StartDate_index-1; j--) {
            var crime_case = {};
            crime_case['date'] = rows[j].date_time.split('T')[0];
            crime_case['time'] = rows[j].date_time.split('T')[1];
            crime_case['code'] = rows[j].code;
            crime_case['incident'] = rows[j].incident;
            crime_case['police_grid'] = rows[j].police_grid;
            crime_case['neighborhood_number'] = rows[j].neighborhood_number;
            crime_case['block'] = rows[j].block;
            crime_case['count'] = count;
            crimeXML.INCIDENTS['I'+rows[j].case_number] = crime_case;
            count++;
            if (count === Limit) {
                return crimeXML;
            }
        }
        return crimeXML;
    }
    
    return null;
}


app.get('/incidents', (req, res) => {
    
    var SQliteComment = "SELECT * FROM Incidents "; // + ORDER BY date_time
    
    if (req.query.hasOwnProperty('code') || req.query.hasOwnProperty('grid') || req.query.hasOwnProperty('id')) {
        
        SQliteComment = SQliteComment + "WHERE ";
        
        if (req.query.hasOwnProperty('code')) {
            
            var inputCODE = req.query.code.split(',');
            
            SQliteComment = SQliteComment + "(";
            for (let i = 0; i < inputCODE.length; i++) {
                SQliteComment = SQliteComment + "code = " + inputCODE[i] + " OR ";
            
            }
            SQliteComment = SQliteComment.substring(0, SQliteComment.length-4) + ") ";
            
            if (req.query.hasOwnProperty('grid') || req.query.hasOwnProperty('id')) {
                SQliteComment = SQliteComment + " AND ";
            }
        }
        
        if (req.query.hasOwnProperty('grid')) {
            
            var inputGRID = req.query.grid.split(',');
            SQliteComment = SQliteComment + "(";
            
            for (let i = 0; i < inputGRID.length; i++) {
                SQliteComment = SQliteComment + "police_grid = " + inputGRID[i] + " OR ";
            
            }
            SQliteComment = SQliteComment.substring(0, SQliteComment.length-4) + ") ";
            
            if (req.query.hasOwnProperty('id')) {
                SQliteComment = SQliteComment + " AND ";
            }
        }
        
        if (req.query.hasOwnProperty('id')) {
            
            var inputID = req.query.id.split(',');
            
            SQliteComment = SQliteComment + "(";
            for (let i = 0; i < inputID.length; i++) {
                SQliteComment = SQliteComment + "neighborhood_number = " + inputID[i] + " OR ";
            
            }
            SQliteComment = SQliteComment.substring(0, SQliteComment.length-4) + ") ";
        }
    }
    SQliteComment = SQliteComment + "ORDER BY date_time";
    console.log(SQliteComment);
    
    db.all(SQliteComment, (err,rows) => {
        if (rows.length === 0) {
            var response = {};
            var responseXML = {'INCIDENTS' : {}};
            if (!req.query.hasOwnProperty('format')) {
                res.type('json').send(JSON.stringify(response, null, 4));
            }
            else {
                if (req.query.format === 'xml') {
                    var options = {compact: true, spaces: 4};
                    var result = convert.js2xml(responseXML, options);
                    res.type('xml').send(result);
                }
                else if (req.query.format === 'json') {
                    res.type('json').send(JSON.stringify(response, null, 4));
                }
                else {
                    res.status(500).send('Error: No such format');
                }
            }
        }
        else {
            var startIndex = []; // array contain all index of cases in the start_date

            var result_end_index = rows.length-1;
            var result_start_index = result_end_index - 9999;
            var database_start_date = rows[0].date_time.split('T')[0].split('-')[0] + 
                                      rows[0].date_time.split('T')[0].split('-')[1] + 
                                      rows[0].date_time.split('T')[0].split('-')[2];
            var database_end_date = rows[rows.length-1].date_time.split('T')[0].split('-')[0] + 
                                    rows[rows.length-1].date_time.split('T')[0].split('-')[1] + 
                                    rows[rows.length-1].date_time.split('T')[0].split('-')[2];
            
            // ?start_date
            if (req.query.hasOwnProperty('start_date')) {
                
                var inputSD = req.query.start_date.split('-'); // array of year, month, day
                
                if (parseInt(inputSD[0]+inputSD[1]+inputSD[2], 10) < parseInt(database_start_date, 10)) {
                    result_start_index = 0;
                }
                
                for (let i = 0; i < rows.length; i++) { // an array of index of start date 
                    var eachDate = rows[i].date_time.split('T')[0].split('-'); // array of year, month, day
                    if (parseInt(inputSD[0], 10) < parseInt(eachDate[0], 10)) {
                        startIndex.push(i);
                    }
                    else if (parseInt(inputSD[0], 10) === parseInt(eachDate[0], 10)) {
                        if (parseInt(inputSD[1], 10) < parseInt(eachDate[1], 10)) {
                            startIndex.push(i);
                        }
                        else if (parseInt(inputSD[1], 10) === parseInt(eachDate[1], 10)) {
                            if (parseInt(inputSD[2], 10) <= parseInt(eachDate[2], 10)) {
                                startIndex.push(i);
                            }
                        }
                    }
                }
                if (startIndex.length !== 0) { // start date between or before the dates in database
                    result_start_index = startIndex[0]; // the index of first case in the start date
                }
            }
            else {
                if (result_start_index < 0) {
                    result_start_index = 0;
                }
            }
            // error no start date
            
            // ?end_date
            var endIndex = [];
            if (req.query.hasOwnProperty('end_date')) {
                
                var inputED = req.query.end_date.split('-'); // array of year, month, day
                
                if (parseInt(inputED[0]+inputED[1]+inputED[2], 10) > parseInt(database_end_date, 10)) {
                    result_end_index = rows.length-1;
                }
                
                for (let i = 0; i < rows.length; i++) { 
                    var eachDate = rows[i].date_time.split('T')[0].split('-'); // array of year, month, day
                    if (parseInt(inputED[0], 10) > parseInt(eachDate[0], 10)) {
                        endIndex.push(i);
                    }
                    else if (parseInt(inputED[0], 10) === parseInt(eachDate[0], 10)) {
                        if (parseInt(inputED[1], 10) > parseInt(eachDate[1], 10)) {
                            endIndex.push(i);
                        }
                        else if (parseInt(inputED[1], 10) === parseInt(eachDate[1], 10)) {
                            if (parseInt(inputED[2], 10) >= parseInt(eachDate[2], 10)) {
                                endIndex.push(i);
                            }
                        }
                    }
                }
                if (endIndex.length !== 0) { // start date between or after the dates in database
                    result_end_index = endIndex[endIndex.length-1]; // the index of first case in the start date
                }
                if (!req.query.hasOwnProperty('start_date')) {
                    result_start_index = result_end_index - 9999;
                    if (result_start_index < 0) {
                        result_start_index = 0;
                    }
                }
            }
            else {
                result_end_index = result_start_index + 999;
            }
            
            // ?limit
            var limitVar;
            if (req.query.hasOwnProperty('limit')) {
                limitVar = parseInt(req.query.limit, 10);
            }
            else {
                limitVar = 10000;
            }
            
            // ?format
            var formatVar;
            if (req.query.hasOwnProperty('format')) {
                formatVar = req.query.format;
            }
            else {
                formatVar = 'json';
            }
            
            var afterFilter = filterIncident(result_start_index, result_end_index, limitVar, formatVar, rows);
            
            if (afterFilter === null) {
                res.status(500).send('Error: No such format');
            }
            else if (formatVar === 'json') {
                res.type('json').send(JSON.stringify(afterFilter, null, 4));
            }
            else if (formatVar === 'xml') {
                var options = {compact: true, spaces: 4};
                var result = convert.js2xml(afterFilter, options);
                res.type('xml').send(result);
            }
        }
    });
    
});   
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    /*
    db.all("SELECT * FROM Incidents ORDER BY date_time", (err,rows) => {
        
        var startIndex = []; // array contain all index of cases in the start_date
        var endIndex = [];
        var result_end_index = rows.length-1;
        var result_start_index = result_end_index - 9999;
        var database_start_date = rows[0].date_time.split('T')[0].split('-')[0] + 
                                  rows[0].date_time.split('T')[0].split('-')[1] + 
                                  rows[0].date_time.split('T')[0].split('-')[2];
        var database_end_date = rows[rows.length-1].date_time.split('T')[0].split('-')[0] + 
                                rows[rows.length-1].date_time.split('T')[0].split('-')[1] + 
                                rows[rows.length-1].date_time.split('T')[0].split('-')[2];
        
        // ?start_date
        if (req.query.hasOwnProperty('start_date')) {
            
            var inputSD = req.query.start_date.split('-'); // array of year, month, day
            
            if (parseInt(inputSD[0]+inputSD[1]+inputSD[2], 10) < parseInt(database_start_date, 10)) {
                result_start_index = 0;
            }
            
            for (let i = 0; i < rows.length; i++) { // an array of index of start date 
                var eachDate = rows[i].date_time.split('T')[0].split('-'); // array of year, month, day
                if (parseInt(inputSD[0], 10) < parseInt(eachDate[0], 10)) {
                    startIndex.push(i);
                }
                else if (parseInt(inputSD[0], 10) === parseInt(eachDate[0], 10)) {
                    if (parseInt(inputSD[1], 10) < parseInt(eachDate[1], 10)) {
                        startIndex.push(i);
                    }
                    else if (parseInt(inputSD[1], 10) === parseInt(eachDate[1], 10)) {
                        if (parseInt(inputSD[2], 10) <= parseInt(eachDate[2], 10)) {
                            startIndex.push(i);
                        }
                    }
                }
            }
            if (startIndex.length !== 0) { // start date between or before the dates in database
                result_start_index = startIndex[0]; // the index of first case in the start date
            }
        }
        // error no start date
        
        // ?end_date
        if (req.query.hasOwnProperty('end_date')) {
            
            var inputED = req.query.end_date.split('-'); // array of year, month, day
            
            if (parseInt(inputED[0]+inputED[1]+inputED[2], 10) > parseInt(database_end_date, 10)) {
                result_end_index = rows.length-1;
            }
            
            for (let i = 0; i < rows.length; i++) { 
                var eachDate = rows[i].date_time.split('T')[0].split('-'); // array of year, month, day
                if (parseInt(inputED[0], 10) > parseInt(eachDate[0], 10)) {
                    endIndex.push(i);
                }
                else if (parseInt(inputED[0], 10) === parseInt(eachDate[0], 10)) {
                    if (parseInt(inputED[1], 10) > parseInt(eachDate[1], 10)) {
                        endIndex.push(i);
                    }
                    else if (parseInt(inputED[1], 10) === parseInt(eachDate[1], 10)) {
                        if (parseInt(inputED[2], 10) >= parseInt(eachDate[2], 10)) {
                            endIndex.push(i);
                        }
                    }
                }
            }
            if (endIndex.length !== 0) { // start date between or after the dates in database
                result_end_index = endIndex[endIndex.length-1]; // the index of first case in the start date
            }
        }
        
        // ?code
        var codeVar;
        if (req.query.hasOwnProperty('code')) {
            var inputCODE = req.query.code.split(',');
            codeVar = [];
            for (let i = 0; i < inputCODE.length; i++) {
                codeVar.push(parseInt(inputCODE[i], 10));
            }
        }
        else {
            codeVar = -1;
        }
        
        // ?grid
        var gridVar;
        var countGrid = 0;
        if (req.query.hasOwnProperty('grid')) {
            var inputGRID = req.query.grid.split(',');
            gridVar = [];
            for (let i = 0; i < inputGRID.length; i++) {
                gridVar.push(parseInt(inputGRID[i], 10));
            }
        }
        else {
            gridVar = -1;
        }
        
        // ?id
        var IDVar;
        var countID = 0;
        if (req.query.hasOwnProperty('id')) {
            var inputID = req.query.id.split(',');
            IDVar = [];
            for (let i = 0; i < inputID.length; i++) {
                IDVar.push(parseInt(inputID[i], 10));
            }
        }
        else {
            IDVar = -1;
        }
        
        // ?limit
        var limitVar;
        if (req.query.hasOwnProperty('limit')) {
            limitVar = parseInt(req.query.limit, 10);
        }
        else {
            limitVar = 10000;
        }
        
        // ?format
        var formatVar;
        if (req.query.hasOwnProperty('format')) {
            formatVar = req.query.format;
        }
        else {
            formatVar = 'json';
        }
        
        var afterFilter = filterIncident(result_start_index, result_end_index, codeVar, gridVar, IDVar, limitVar, formatVar, rows);
        
        if (afterFilter === null) {
            res.status(500).send('Error: Failed filtering');
        }
        else if (formatVar === 'json') {
            res.type('json').send(JSON.stringify(afterFilter, null, 4));
        }
        else if (formatVar === 'xml') {
            var options = {compact: true, spaces: 4};
            var result = convert.js2xml(afterFilter, options);
            res.type('xml').send(result);
        }
        
    });
});*/

app.put('/new-incident', (req, res) => {
    var has_id = false;
    db.all("SELECT * FROM Incidents ORDER BY date_time", (err,rows) => {
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].case_number === req.body.case_number) {
                has_id = true;
            }
        }
        if (has_id) {
            res.status(500).send('Error: Case number already exists');
        }
        else {
            // Adding the item
            /* curl -X PUT -d "case_number=000000&date=10-10-2020&time=00:00:01&code=12934&incident=cacacac&police_grid=10&neighborhood_number=10&block=0000000" http://localhost:8000/new-incident

            (case_number,date_time,code,incident,police_grid,neighborhood_number,block)
            */
            db.run('INSERT INTO Incidents (case_number, date_time, code, incident, police_grid, neighborhood_number, block) VALUES ( ?, ?, ?, ?, ?, ?, ?)',
                  [req.body.case_number,
                   req.body.date + 'T' +req.body.time,
                   req.body.code,
                   req.body.incident,
                   req.body.police_grid,
                   req.body.neighborhood_number,
                   req.body.block], (err) => {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).send('Success!');
                }
            });
        }
    });
});

 

var server = app.listen(port);