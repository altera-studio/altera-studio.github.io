function getFarmingScore(duration, role, rank, callback)
{
	fetch('https://altera.studio/assets/js/farming.json')
	.then((response) => {
		return response.json();
	})
	.then((results) => {
		var result = {
			perfectCS : results['perfect-cs'][duration],
			averageCS : results['average-cs'][role][rank]
		};

		callback(result);
	});
}