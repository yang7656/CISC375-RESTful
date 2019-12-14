# CISC375-RESTful

GET /codes
- ?code (Number comma separated)
- ?format (XML or JSON)

GET /neighborhoods
- ?id (Number comma separated)
- ?format (XML or JSON)

# How to build the query
GET /incidents
Data Query:
- ?start_date=2019-09-01
- ?end_date=2019-10-31
- ?code=110,700
- ?grid=38,65
- ?id=11,14
- ?limit=50
- ?format=xml

# Put new Incidents

PUT /new-incident
Data fields:
- case_number
- date
- time
- code
- incident
- police_grid
- neighborhood_number
- block
