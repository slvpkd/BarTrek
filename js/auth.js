       // Initialize Firebase
       var config = {
        apiKey: "AIzaSyBl9zw7_kIy708CNAE6NdqtLhGWlxU4HfA",
        authDomain: "bartrek-1526408945523.firebaseapp.com",
        databaseURL: "https://bartrek-1526408945523.firebaseio.com",
        projectId: "bartrek-1526408945523",
        storageBucket: "bartrek-1526408945523.appspot.com",
        messagingSenderId: "508874898290"
      };
      firebase.initializeApp(config);
      
      /**
       * Handles the sign in button press.
       */
      var signInEmail = document.getElementById('signInEmail');
     console.log(signInEmail.innerHTML);
      var loggedInView = document.getElementById('loggedInView');
      var loggedInContent = document.getElementById('loggedInContent');
      var loginPage = document.getElementById('loginPage');
      
function toggleSignIn() {
 if (firebase.auth().currentUser) {
   // [START signout]
   firebase.auth().signOut();
   // [END signout]
 } else {
   var email = document.getElementById('email').value;
   var password = document.getElementById('password').value;
             
   if (email.length < 4) {
     showAlertBar('Please enter an email address.');
     return;
   }
   if (password.length < 4) {
     showAlertBar('Please enter a password.');
     return;
   }
   // Sign in with email and pass.
   // [START authwithemail]
   firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
     // Handle Errors here.
     var errorCode = error.code;
     var errorMessage = error.message;
     // [START_EXCLUDE]
     if (errorCode === 'auth/wrong-password') {
       showAlertBar('Wrong password.');
     } else {
       showAlertBar(errorMessage);
     }
     console.log(error);
     document.getElementById('quickstart-sign-in').disabled = false;
     // [END_EXCLUDE]
   });
   // [END authwithemail]
             
 }
 document.getElementById('quickstart-sign-in').disabled = true;
}

/**
* Handles the sign up button press.
*/
function handleSignUp() {
 var email = document.getElementById('email').value;
 var password = document.getElementById('password').value;
 if (email.length < 4) {
   showAlertBar('Please enter an email address.');
   return;
 }
 if (password.length < 4) {
   showAlertBar('Please enter a password.');
   return;
 }
 // Sign in with email and pass.
 // [START createwithemail]
 firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
   // Handle Errors here.
   var errorCode = error.code;
   var errorMessage = error.message;
   // [START_EXCLUDE]
   if (errorCode == 'auth/weak-password') {
     showAlertBar('The password is too weak.');
   } else {
     showAlertBar(errorMessage);
   }
   console.log(error);
   // [END_EXCLUDE]
 });
 // [END createwithemail]
}

/**
* Sends an email verification to the user.
*/
function sendEmailVerification() {
 // [START sendemailverification]
 firebase.auth().currentUser.sendEmailVerification().then(function() {
   // Email Verification sent!
   // [START_EXCLUDE]
   showAlertBar('Email Verification Sent!');
   // [END_EXCLUDE]
 });
 // [END sendemailverification]
}

function sendPasswordReset() {
 var email = document.getElementById('email').value;
 // [START sendpasswordemail]
 firebase.auth().sendPasswordResetEmail(email).then(function() {
   // Password Reset Email Sent!
   // [START_EXCLUDE]
   showAlertBar('Password Reset Email Sent!');
   // [END_EXCLUDE]
 }).catch(function(error) {
   // Handle Errors here.
   var errorCode = error.code;
   var errorMessage = error.message;
   // [START_EXCLUDE]
   if (errorCode == 'auth/invalid-email') {
     showAlertBar(errorMessage);
   } else if (errorCode == 'auth/user-not-found') {
     showAlertBar(errorMessage);
   }
   console.log(error);
   // [END_EXCLUDE]
 });
 // [END sendpasswordemail];
}

