const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const logoutButton = document.getElementById("logoutButton");
const userName = document.getElementById("userName");


/* =========================
   LOGIN
========================= */

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        loginMessage.textContent =
            "Entering our universe...";


        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });


        if (error) {

            console.error("Login error:", error);

            loginMessage.textContent =
                "Login failed. Please check your email and password.";

            return;
        }


        console.log("Login successful:", data.user);

        loginMessage.textContent =
            "Welcome back ✦";


        window.location.href = "index.html";

    });

}


/* =========================
   CHECK USER
========================= */

async function checkUser() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();


    console.log("Current user:", user);


    /* =========================
       NOT LOGGED IN
    ========================= */

    if (!user && !loginForm) {

        window.location.href = "login.html";

        return;
    }


    /* =========================
       ALREADY LOGGED IN
    ========================= */

    if (user && loginForm) {

        window.location.href = "index.html";

        return;
    }


    /* =========================
       GET PROFILE NAME
    ========================= */

    if (user && userName) {

        const { data: profile, error } =
            await supabaseClient
                .from("profiles")
                .select("display_name")
                .eq("id", user.id)
                .single();


        console.log("Profile:", profile);
        console.log("Profile error:", error);


        if (profile && profile.display_name) {

            userName.textContent =
                profile.display_name;

        } else {

            userName.textContent =
                user.email.split("@")[0];

        }

    }

}


/* =========================
   LOGOUT
========================= */

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        const { error } =
            await supabaseClient.auth.signOut();


        if (error) {

            console.error("Logout error:", error);

            return;
        }


        window.location.href = "login.html";

    });

}


/* =========================
   START
========================= */
