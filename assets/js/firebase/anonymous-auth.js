firebase.auth().signInAnonymously().then(function(user) 
{
	var isNewUser = user.additionalUserInfo.isNewUser
	var uid = user.user.uid;

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