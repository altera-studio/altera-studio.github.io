firebase.auth().signInAnonymously().then(function(user) 
{
	var isNewUser = user.additionalUserInfo.isNewUser
	var uid = user.user.uid;

	if(isNewUser)
	{
		// Bucket users into two groups, A and B, on first sign in only
		var ABvalue = Math.random();

		if(ABvalue < .5) {
			console.log('User is added to test A group');

			firebase.database().ref().child('users/' + uid).update({
				group: 'A'
			});
		}
		else {
			console.log('User is added to test B group');
			
			firebase.database().ref().child('users/' + uid).update({
				group: 'B'
			});
		}
	}
}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // ...
  console.log(errorMessage);
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;

    console.log(uid);

  } else {
    // User is signed out.
    // ...
  }
  // ...
});