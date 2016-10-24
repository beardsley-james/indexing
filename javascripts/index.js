var factions = [];
var types = [];
var packs = [];
var cards = [];
var loadStatus = {
	factions: false,
	types: false,
	packs: false,
	cards: false
}
var query = {
	factions: [],
	types: [],
	packs: [],
	cards: []
}

var type_codes = [];
var faction_codes = [];
var pack_codes = [];

var cardPool = [];
var cardPoolIndex = 0;

var packResults = [];

$.ajax({
	type: "GET",
	url: "https://netrunnerdb.com/api/2.0/public/factions",
	dataType: "json",
	success: function(data){
		factions = data.data;
		loadStatus.factions = true;
		for (i = 0; i < factions.length; i++){
			faction_codes.push(factions[i].code)
		}
		checkStatus()
	},
	error: function(xhr, type){
		alert("Factions Error! " + type.toUpperCase())
	}
})

$.ajax({
	type: "GET",
	url: "https://netrunnerdb.com/api/2.0/public/types",
	dataType: "json",
	success: function(data){
		types = data.data;
		loadStatus.types = true;
		for (i = 0; i < types.length; i++){
			if (!types[i].is_subtype){
				type_codes.push(types[i].code)
			}
		}
		checkStatus()
	},
	error: function(xhr, type){
		alert("Types Error! " + type.toUpperCase())
	}
})

$.ajax({
	type: "GET",
	url: "https://netrunnerdb.com/api/2.0/public/packs",
	dataType: "json",
	success: function(data){
		data.data.forEach(function(pack){
			if (pack.date_release) {
				packs.push(pack)
			}
		})
		loadStatus.packs = true;
		for (i = 0; i < packs.length; i++){
			pack_codes.push(packs[i].code)
		}
		checkStatus()
	},
	error: function(xhr, type){
		alert("Packs Error! " + type.toUpperCase())
	}
})

$.ajax({
	type: "GET",
	url: "https://netrunnerdb.com/api/2.0/public/cards",
	dataType: "json",
	context: $("body"),
	success: function(data){
		cards = data.data;
		loadStatus.cards = true;
		checkStatus()
	},
	error: function(xhr, type){
		alert("Cards Error! " + type)
	}
})

function checkStatus(){
	for (var key in loadStatus) {
		if (!loadStatus[key]) {
			return false
		}
	}
	cards = cards.filter(filterCards);
	renderList()
}

var filterCards = function(card){
	return (pack_codes.indexOf(card.pack_code) != -1)
}

var sampleCriteria = ["alphabet", "faction", "type"]

var renderList = function(){
	cards.sort(sortAlphabeticByTitle);
	cards = groupByFaction(cards);
	cards = groupByType(cards);
	cards = steamrollArray(cards);
	cards.forEach(function(card){
		document.write(card.title + "</br>")
	})
}

var groupByFaction = function(set){
	var returnArray = []
	if (Array.isArray(set[0])){
		set.forEach(function(subset){
			returnArray.push(groupByFaction(subset))
		})
	} else {
		faction_codes.forEach(function(){
			returnArray.push([])
		})
		set.forEach(function(item){
			returnArray[faction_codes.indexOf(item.faction_code)].push(item)
		})
	}
	return returnArray
}

var groupByType = function(set){
	var returnArray = []
	if (Array.isArray(set[0])){
		set.forEach(function(subset){
			returnArray.push(groupByType(subset))
		})
	} else {
		type_codes.forEach(function(){
			returnArray.push([])
		})
		set.forEach(function(item){
			returnArray[type_codes.indexOf(item.type_code)].push(item)
		})
	}
	return returnArray
}


var sortAlphabeticByTitle = function(a, b){
	var nameA = a.title.toUpperCase();
	var nameB = b.title.toUpperCase();	
	if (nameA < nameB) {
		return -1;
	}
	if (nameA > nameB) {
		return 1;
	}
	return 0;
}

var sortByFaction = function(a, b){
	var factionA = a.faction_code;
	var factionB = b.faction_code;

	if (faction_codes.indexOf(factionA) < faction_codes.indexOf(factionB)){
		return -1
	}
	
	if (faction_codes.indexOf(factionA) > faction_codes.indexOf(factionB)){
		return 1
	}
	return 0
}

var sortByType = function(a, b){
	var typeA = a.type_code;
	var typeB = b.type_code;

	if (type_codes.indexOf(typeA) < type_codes.indexOf(typeB)){
		return -1
	}
	
	if (type_codes.indexOf(typeA) > type_codes.indexOf(typeB)){
		return 1
	}
	return 0
}

function steamrollArray(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? steamrollArray(toFlatten) : toFlatten);
  }, []);
}