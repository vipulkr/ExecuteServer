//Necessary Imports
var http = require("http");
var xmla = require("./Xmla.js");
var url = require("url");

//Necessary functions

//Decode the pathName of the url
function decodeFragments(fragments) {
	var decodedFragments = [], i, n = fragments.length;
	for (i = 0; i < n; i++) {
  		decodedFragments.push(decodeURIComponent(fragments[i]));
	}
	return decodedFragments;
}

//----------------------------------------4. Dimesnions-----------------------------------------------
exports.getDimensions = function(req,res) {
	var X = xmla.Xmla;
	var parameters = req.query;
	var xmlaServer = parameters.xmlaServer;
	var pathName = parameters.pathName;
	var hostAddress = "http://localhost:8080";

	var discoverRequestTypes =[
    null,
    {name: X.DISCOVER_DATASOURCES, key:"DataSourceName", property:X.PROP_DATASOURCEINFO},
    {name: X.DBSCHEMA_CATALOGS, key: "CATALOG_NAME", property: X.PROP_CATALOG},
    {name: X.MDSCHEMA_CUBES, key: "CUBE_NAME", property: X.PROP_CUBE},
    {name: X.MDSCHEMA_DIMENSIONS, key: "DIMENSION_UNIQUE_NAME"},
    {name: X.MDSCHEMA_HIERARCHIES, key: "HIERARCHY_UNIQUE_NAME"},
    {name: X.MDSCHEMA_LEVELS, key: "LEVEL_UNIQUE_NAME"},
    {name: X.MDSCHEMA_MEMBERS, key: "MEMBER_UNIQUE_NAME"}
  ];

	var requestURL = {};
  var query = "?url="+xmlaServer;

	var fragments = pathName.split("/"), //pathName
		decodedFragments = decodeFragments(fragments),
		numFragments = fragments.length,
		properties = {},
		restrictions = {},
		discoverRequestType = discoverRequestTypes[numFragments];

	var xmlaRequest = {
  		async:true,
  		url:decodeURIComponent(xmlaServer),
  		success:function(xmla,xmlaRequest,xmlaResponse) {
    		var temp = JSON.stringify(xmlaResponse.fetchAllAsObject(),null,2);
    		returnObj = JSON.parse(temp);
    		res.send(temp);
    		res.end();
  		},
  		error:function(){
    		res.write("Error finding the Required Data");

  		},
  		callback:function() {
    		res.end();
  		}
  	}

  	requestURL.fragments = fragments;
  	requestURL.decodedFragments = decodedFragments;

  	//Check the number of fragments
  	switch(numFragments) {
  		case 7:
            restrictions[discoverRequestTypes[6].key] = decodedFragments[6];
      case 6:
            restrictions[discoverRequestTypes[5].key] = decodedFragments[5];
      case 5:
          restrictions[discoverRequestTypes[4].key] = decodedFragments[4];
      case 4:
          if (numFragments === 4) {
              //check if we need to output cube metadata or a mdx query result
              if (typeof(query.mdx) !== "undefined") {
                  xmlaRequest.method = X.METHOD_EXECUTE;
                  xmlaRequest.statement = query.mdx;
                  properties[X.PROP_FORMAT] = query.resultformat || (contentType === "text/csv" ? Xmla.PROP_FORMAT_TABULAR : X.PROP_FORMAT_MULTIDIMENSIONAL)
                }
            }
            restrictions[discoverRequestTypes[3].key] = properties[discoverRequestTypes[3].property] = decodedFragments[3];
      case 3 :
        restrictions[discoverRequestTypes[2].key] = properties[discoverRequestTypes[2].property] = decodedFragments[2];
        xmlaRequest.restrictions = restrictions;

      case 2 :
        //check if we need to output datasoures or catalog metadata for a particular datasource
            if (fragments[1] !== "") {
              properties[discoverRequestTypes[1].property] = decodedFragments[1];
              xmlaRequest.properties = properties;

            }
            if (!xmlaRequest.method) {
              xmlaRequest.method = X.METHOD_DISCOVER;
              if (fragments[1] === "") {
                  xmlaRequest.requestType = X.DISCOVER_DATASOURCES;
                }
                else {
                  xmlaRequest.requestType = discoverRequestType.name;
                  xmlaRequest.restrictions = restrictions;
                }
            }
    }

	var x = new xmla.Xmla;
	x.request(xmlaRequest);
}
