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

var maxCardCost = 0;

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
		types.sort(function(a,b){
			return a.position - b.position
		})
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
	cards.forEach(function(card){
		if (card.cost > maxCardCost){
			maxCardCost = card.cost
		}
	})
	renderList()
}

var filterCards = function(card){
	return (pack_codes.indexOf(card.pack_code) != -1)
}

var sampleCriteria = ["faction", "alphabet"]

var renderList = function(){
	sampleCriteria.forEach(sortSwitch);
	cards = steamrollArray(cards);
	numberCards(cards, 9, "faction_code");
	/* cards.forEach(function(card){
		document.write(card.title + ", " + card.faction_code + " " + card.type_code + ": Page " + card.pageNumber + ", slot " + card.pageLocation + "</br>")
	}) */
}

var sortSwitch = function(criteria){
	switch (criteria) {
		case "alphabet":
			cards = groupAlphabetize(cards);
			break;
		case "faction":
			cards = groupByFaction(cards);
			break;
		case "type":
			cards = groupByType(cards);
			break;
		case "pack":
			cards = groupByPack(cards);
		case "cost":
			cards = groupSortByCost(cards);
			break;
	}
}

function numberCards(cards, cardsPerPage, pageBreak){
	var pageNumber = 1;
	var pageLocation = 1;
	for (i = 0; i < cards.length; i++){
		cards[i].pageLocation = pageLocation;
		cards[i].pageNumber = pageNumber;
		pageLocation++;
		if (cards[i+1]){
			if (cards[i][pageBreak] != cards[i+1][pageBreak]) {
				pageNumber++;
				pageLocation = 1
			} else if (pageLocation > cardsPerPage) {
				pageNumber++;
				pageLocation = 1
			}
		}
	}
}

var groupByPack = function(set){
	var returnArray = [];
	if (Array.isArray(set[0])){
		set.forEach(function(subset){
			returnArray.push(groupByPack(subset))
		})
	} else {
		pack_codes.forEach(function(){
			returnArray.push([])
		})
		set.forEach(function(item){
			returnArray[pack_codes.indexOf(item.pack_code)].push(item)
		})
	}
	return returnArray
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

var groupAlphabetize = function(set){
	var returnSet = set;
	if (Array.isArray(set[0])){
		returnSet.forEach(function(subset){
			groupAlphabetize(subset)
		})
	} else {
		returnSet.sort(sortAlphabeticByTitle)
	}
	return returnSet
}

var groupSortByCost = function(set){
	var returnArray = [];
	if (Array.isArray(set[0])){
		set.forEach(function(subset){
			returnArray.push(groupSortByCost(subset))
		})
	} else {
		for (i = 0; i <= maxCardCost + 1; i++){
			returnArray.push([])
		}
		set.forEach(function(item){
			if (item.cost == undefined){
				returnArray[0].push(item)
			} else {
				returnArray[item.cost + 1].push(item)
			}
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

function steamrollArray(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? steamrollArray(toFlatten) : toFlatten);
  }, []);
}