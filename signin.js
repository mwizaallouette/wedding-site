console.log("NEW SIGNIN.JS LOADED!");
const signinForm = document.getElementById("signinForm");
const signupButton = document.getElementById("signupButton");
const googleButton = document.getElementById("googleButton");
const guestButton = document.getElementById("guestButton");
const signinMessage = document.getElementById("signinMessage");

function showMessage(message) {
    signinMessage.textContent = message;
}

signinForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    showMessage("Signing in...");

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        showMessage(error.message);
        return;
    }

    showMessage("Signed in successfully!");
    window.location.href = "wedding.html";
});


signupButton.addEventListener("click", async function () {
    console.log("CREATE ACCOUNT CLICKED!");
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const displayNameInput = document.getElementById("displayName");

    // First click: reveal the name field.
    if (displayNameInput.hidden) {
        displayNameInput.hidden = false;
        displayNameInput.required = true;
        displayNameInput.focus();

        showMessage("Choose the name RELIVE should call you.");
        return;
    }

    const displayName = displayNameInput.value.trim();

    if (!displayName) {
        showMessage("Please choose a display name.");
        displayNameInput.focus();
        return;
    }

    if (!email || password.length < 6) {
        showMessage("Enter your email and a password of at least 6 characters.");
        return;
    }

    showMessage("Creating your account...");

    const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: {
                display_name: displayName
            },
            emailRedirectTo: window.location.origin + "/signin.html"
        }
    });

    if (error) {
        showMessage(error.message);
        return;
    }

    showMessage(
        "Account request submitted! Check your email if confirmation is required."
    );
});

   

googleButton.addEventListener("click", async function () {
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: window.location.origin + "/wedding.html"
        }
    });

    if (error) {
        showMessage(error.message);
    }
});

guestButton.addEventListener("click", function () {
    showMessage("Guest access is not configured yet.");
});
