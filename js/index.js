
      function showAlertBar(message) {
        var options = {
          content: message, // text of the snackbar
          timeout: 3000, // time in milliseconds after the snackbar autohides, 0 is disabled
        }
        $.snackbar(options);
      }

      /**
       * initApp handles setting up UI event listeners and registering Firebase auth listeners:
       *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
       *    out, and that is where we update the UI.
       */
      function initApp() {
        // Listening for auth state changes.
        // [START authstatelistener]
        firebase.auth().onAuthStateChanged(function(user) {
          // [START_EXCLUDE silent]
          document.getElementById('quickstart-verify-email').disabled = true;
					signInEmail.innerHTML = "Not Signed In";
					loggedInView.style.display = 'none';
          $("#loggedInContent").fadeOut();
					loginPage.style.display = 'block';
					
          // [END_EXCLUDE]
          if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;
						

            // [START_EXCLUDE]
            
                signInEmail.innerHTML = user.email;
                loggedInView.style.display = 'block';
                // loggedInContent.style.display = 'block';
                $("#loggedInContent").fadeIn();
                $('#wrapper').fadeOut();
                loginPage.style.display = 'none';
                
            document.getElementById('quickstart-sign-in').textContent = 'Sign out';
            //document.getElementById('quickstart-account-details').textContent = JSON.stringify(user, null, '  ');
						
            if (!emailVerified) {
              document.getElementById('quickstart-verify-email').disabled = false;
            }
            // [END_EXCLUDE]
          } else {
            // User is signed out.
            // [START_EXCLUDE]
            $('#wrapper').fadeIn();
            document.getElementById('quickstart-sign-in').textContent = 'Sign in';
            //document.getElementById('quickstart-account-details').textContent = 'null';
            // [END_EXCLUDE]
          }
          // [START_EXCLUDE silent]
          document.getElementById('quickstart-sign-in').disabled = false;
          // [END_EXCLUDE]
        });
        // [END authstatelistener]

        document.getElementById('quickstart-sign-in').addEventListener('click', toggleSignIn, false);
        document.getElementById('quickstart-sign-up').addEventListener('click', handleSignUp, false);
        document.getElementById('quickstart-verify-email').addEventListener('click', sendEmailVerification, false);
        document.getElementById('quickstart-password-reset').addEventListener('click', sendPasswordReset, false);

      }

      window.onload = function() {
        initApp();
      };

      $(document).ready(function() { $('body').bootstrapMaterialDesign(); });


