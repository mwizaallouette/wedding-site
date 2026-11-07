
async function updateNavigation() {
    const signInLink = document.getElementById("signInNavLink");
    const userName = document.getElementById("userNameNav");

    if (!signInLink || !userName) return;

    const { data: { session }, error } =
        await supabaseClient.auth.getSession();

    if (error || !session) {
        signInLink.hidden = false;
        userName.hidden = true;
        return;
    }

    const metadata = session.user.user_metadata || {};
    const displayName =
        metadata.display_name ||
        metadata.full_name ||
        session.user.email?.split("@")[0] ||
        "My Account";

    userName.textContent = displayName;
    userName.hidden = false;
    signInLink.hidden = true;
}

updateNavigation();

supabaseClient.auth.onAuthStateChange(() => {
    updateNavigation();
});
