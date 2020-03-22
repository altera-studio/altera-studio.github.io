function getFarmingScore(duration, role, rank, callback)
{
	$.getJSON('./assets/js/farming.json', function(results) {
		var result = {
			perfectCS : results['perfect-cs'][duration],
			averageCS : results['average-cs'][role][rank]
		};

		callback(result);
	});
}