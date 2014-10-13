var idURL 				= 'http://geodata.state.nj.us/arcgis/rest/services/Features/Cadastral/MapServer',
	urlGeometryService 	= 'http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer',
	idxParcel 			= 0,
	idWKID 				= 4326,
	njWKID				= 102711;
	
function identifyParcel(y, x, xMin, yMin, xMax, yMax){
	require([
		'esri/geometry/Point', 'esri/geometry/Extent',
		'esri/SpatialReference',
		'esri/tasks/IdentifyTask', 'esri/tasks/IdentifyParameters',
		'esri/tasks/GeometryService', 'esri/tasks/ProjectParameters'
	], function(
		Point, Extent,
		SpatialReference,
		IdentifyTask, IdentifyParameters,
		GeometryService, ProjectParameters
	){
		var idTask 		= new IdentifyTask(idURL),
			idParams 	= new IdentifyParameters(),
			idSR 		= new SpatialReference({wkid: idWKID}),
			njSR		= new SpatialReference({wkid: njWKID}),
			gs 			= new GeometryService(urlGeometryService),
			pp 			= new ProjectParameters(),
			idPoint 	= new Point(x, y, idSR),
			mapExtent 	= new Extent(xMin, yMin, xMax, yMax, idSR);
			 
		idParams.layerIds= [0];
		idParams.tolerance = 0;
		idParams.mapExtent = mapExtent;
		idParams.geometry = idPoint;
		
		pp.geometries 	= [idPoint];
		pp.outSR		= njSR;
		gs.project(pp, function(response){
			idParams.geometry = response[0];
			idTask.execute(idParams, function(results){
				displayResults(results);
			}, function(e){
				console.log('OOPS: Looks like we had a problem getting a result. It is probably our bad, but please try again.')
			});
		});		
	}
);
}

function displayResults(results){
	require([
		"dojo/dom", "dojo/dom-class", "dojo/dom-construct"
	], function(
		dom, domClass, domConstruct
	){
		if(results.length >= 1){
			if(domClass.contains('idResults', 'hidden')){
				domClass.remove('idResults', 'hidden');
				domClass.add('dataDescription', 'hidden');
			}
			var panel = dom.byId(idResults),
				attributes = results[0].feature.attributes,
				ul1, ul2;
			domConstruct.empty(panel);
			domConstruct.create('h4', {innerHTML: 'PROPERTY DESCRIPTION', 'class': 'text-uppercase'}, panel);
			buildRow('OWNER', String(attributes.owner_name).toUpperCase(), panel, false);
			buildRow('LOCATION', String(attributes.prop_loc).toUpperCase(), panel, false);
			buildRow('BLOCK', String(attributes.pclblock).toUpperCase(), panel, false);
			buildRow('LOT', String(attributes.pcllot).toUpperCase(), panel, false);
			buildRow('COUNTY', String(attributes.county).toUpperCase(), panel, false);
			buildRow('MUNICIPALITY', String(attributes.mun_name).toUpperCase(), panel, false);
			ul1 = domConstruct.create('u', null, panel);
			domConstruct.create('strong', {innerHTML: 'TAXES'}, ul1);
			domConstruct.create('br', null, panel);
			buildRow('2013', numberWithCommas(attributes.last_yr_tx), panel, false);
			ul2 = domConstruct.create('u', null, panel);
			domConstruct.create('strong', {innerHTML: 'VALUES'}, ul2);
			domConstruct.create('br', null, panel);
			buildRow('LAND', numberWithCommas(attributes.land_val), panel, false);
			buildRow('IMPROVEMENT', numberWithCommas(attributes.imprvt_val), panel, false);
			buildRow('TOTAL', numberWithCommas(attributes.net_value), panel, false);
		}
	});
}

function buildRow(label, value, destination, multiline){
	require([
		"dojo/dom-construct"
	], function(
		domConstruct
	){
		var section = domConstruct.create('div', null, destination);
		domConstruct.create('strong', {innerHTML: label + ': &nbsp;'}, section);
		if(multiline){
			domConstruct.create('br', null, section);
		}
		if(value === null || value.trim() === 'NULL' || value.trim() === 'NULL, NULL NULL'){
			domConstruct.create('em', {innerHTML: 'NO DATA'}, section);
			
		} else {
			domConstruct.create('span', {innerHTML: value}, section);
		}
		
	});
	}
function numberWithCommas(x) {
    var val;
    if(x === null || x === 'Null'){
    	val = '<em>NO DATA</em>';
    } else {
    	val = '$ ' + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return val;
};