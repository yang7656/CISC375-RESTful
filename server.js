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

function filterIncident(StartDate_index, EndDate_index, Code, Grid, ID, Limit, Format, rows) {
   
    var count = 0;
    var crime = {};
    var crimeXML = {'INCIDENTS' : {}};
    
    var temCode = Code;
    var temGrid = Grid;
    var temID = ID;
    
    if (Format === 'json') {
        for (let j = EndDate_index; j > StartDate_index-1; j--) {
            if (Code === -1) {
                temCode = rows[j].code;
            }
            if (Grid === -1) {
                temGrid = rows[j].police_grid;
            }
            if (ID === -1) {
                temID = rows[j].neighborhood_number;
            }
            if (rows[j].code === temCode && rows[j].police_grid === temGrid && rows[j].neighborhood_number == temID) {
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
        }
        return crime;
    }
    
    if (Format === 'xml') {
        for (let j = EndDate_index; j > StartDate_index-1; j--) {
            if (Code === -1) {
                temCode = rows[j].code;
            }
            if (Grid === -1) {
                temGrid = rows[j].police_grid;
            }
            if (ID === -1) {
                temID = rows[j].neighborhood_number;
            }
            if (rows[j].code === temCode && rows[j].police_grid === temGrid && rows[j].neighborhood_number == temID) {
                var crime_case = {};
                crime_case['date'] = rows[j].date_time.split('T')[0];
                crime_case['time'] = rows[j].date_time.split('T')[1];
                crime_case['code'] = rows[j].code;
                crime_case['incident'] = rows[j].incident;
                crime_case['police_grid'] = rows[j].police_grid;
                crime_case['neighborhood_number'] = rows[j].neighborhood_number;
                crime_case['block'] = rows[j].block;
                crimeXML.INCIDENTS['I'+rows[j].case_number] = crime_case;
                count++;
                if (count === Limit) {
                    return crimeXML;
                }
            }
        }
        return crimeXML;
    }
    
    return null;
}


app.get('/incidents', (req, res) => {
    
    db.all("SELECT * FROM Incidents ORDER BY date_time", (err,rows) => {
        /*
        for (const prop in req.query) {
            console.log(req.query[prop]);
        }*/
        var crime = {};
        var crimeXML = {'INCIDENTS' : {}};
        
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
            if (startIndex.length !== 0 && !req.query.hasOwnProperty('end_date')) { // start date between or before the dates in database
                result_start_index = startIndex[0]; // the index of first case in the start date
                if (result_start_index + 9999 >= rows.length) {
                result_end_index = rows.length - 1;
                }
                else {
                    result_end_index = result_start_index + 9999;
                }
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
            if (endIndex.length !== 0 && !req.query.hasOwnProperty('start_date')) { // start date between or after the dates in database
                result_end_index = startIndex[0]; // the index of first case in the start date
                if (result_end_index - 9999 <= rows.length) {
                    result_start_index_index = 0;
                }
                else {
                    result_start_index_index = result_end_index - 9999;
                }
            }
        }
        
        // ?code
        var codeVar;
        var countCode = 0;
        if (req.query.hasOwnProperty('code')) {
            var inputCODE = req.query.code.split(',');
            codeVar = [];
            for (let i = inputCODE.length; i > -1; i--) {
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
            for (let i = rows.length-1; i > -1; i--) {
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
            for (let i = rows.length-1; i > -1; i--) {
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