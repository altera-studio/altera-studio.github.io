// Add a callback (promise)
function getBuildForChampion(name, callback)
{
	var name = name.toLowerCase();
	var recommended = [];

	$.getJSON('https://ddragon.leagueoflegends.com/cdn/10.4.1/data/en_US/item.json', function(results) {
		var items = results.data;
		var champions = firebase.database().ref('champions');

		console.log(items);

		champions.once('value', function(snapshot) {
		    snapshot.forEach(function(childSnapshot) {
		      	var obj = childSnapshot.val();   
		      	var championName = obj.name.toLowerCase();

		      	if(name == championName)
		      	{
		      		var build = obj.items.split(',');

			      	for (var id in items)
				    	for(var i in build) 
				    		if(items[id].name == build[i]) 
				    			recommended.push('https://ddragon.leagueoflegends.com/cdn/10.4.1/img/item/' + items[id].image.full); // retrieve image from items
		      	} 
		    });

			return callback(recommended);
		});
	});
}
