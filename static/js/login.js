import { getUser } from "./storage.js";
const message = document.getElementById('messageArea');

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    // Keep the event listener, but simplify the logic to potentially call auth.js's login
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // The actual login logic will be handled by auth.js
        // This listener might just prevent default and let auth.js handle it.

        // Remove the fetch call and the redirection logic from here.

        // Example: You might want to trigger the login function from auth.js here,
        // or ensure auth.js's listener runs after this one if needed.
        // For now, just preventing default to avoid duplicate submissions.
    });
});

// This checkUser function seems to be using localStorage directly, which might conflict with the fetch-based auth in the other listener.
// It might be remnants of a different auth approach. Let's comment it out for now.
/*
function checkUser (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = getUser(username);
    
    if (user && user.password === password) {
        console.log("Login successful");
    
        localStorage.setItem("current", JSON.stringify(user));
        message.textContent = "Login successful";
        message.style.color = "rgb(40, 202, 0)";
        setTimeout ( function (){message.textContent = ""; message.style.color = "000000";}, 2999);
        setTimeout ( function () { 
            if (user.role === "admin") {window.location = "admindash.html";}
            else {window.location = "user_dashboard.html";}}, 3000)

    } else {
        console.log("Invalid credentials");
        message.textContent = "Invalid credentials";
        message.style.color = "rgb(255, 0, 0)";
        setTimeout ( function (){message.textContent = ""; message.style.color = "000000";}, 5000);
        return;
    }
}
*/