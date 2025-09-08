import { register } from './api.js';
const signUpForm = document.getElementById("signUpForm");
const message = document.getElementById('messageArea');

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signUpForm');

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('userEmail').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('Cpassword').value;
        const firstName = document.getElementById('first_name').value;
        const lastName = document.getElementById('last_name').value;

        // Validate required fields
        if (username === "" || email === "" || password === "" || confirmPassword === "" || firstName === "" || lastName === "") {
            message.textContent = "Please fill in all fields.";
            message.style.color = "#ff0000";
            setTimeout(function() {
                message.textContent = "";
                message.style.color = "#000000";
            }, 5000);
            return;
        }

        // Validate passwords match
        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            message.style.color = "#ff0000";
            setTimeout(function() {
                message.textContent = "";
                message.style.color = "#000000";
            }, 5000);
            return;
        }

        // Validate password length
        if (password.length < 8) {
            message.textContent = "Password should be at least 8 characters long";
            message.style.color = "#ff0000";
            setTimeout(function() {
                message.textContent = "";
                message.style.color = "#000000";
            }, 5000);
            return;
        }

        try {
            const formData = {
                username: username,
                email: email,
                password: password,
                password2: confirmPassword,
                first_name: firstName,
                last_name: lastName
            };

            const response = await fetch('http://localhost:8000/api/auth/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                message.textContent = "Sign up successful!";
                message.style.color = "#008000";
                setTimeout(function() {
                    message.textContent = "";
                    message.style.color = "#000000";
                }, 2999);
                setTimeout(function() {
                    // Use passed URL for redirection
                    if (typeof loginUrl !== 'undefined') {
                        window.location.href = loginUrl;
                    } else {
                        console.error('loginUrl is not defined');
                        // Fallback or error handling
                    }
                }, 3000);
            } else {
                // Display validation errors
                if (typeof data === 'object') {
                    const errorText = Object.values(data).flat().join(', ');
                    message.textContent = errorText;
                } else {
                    message.textContent = 'Registration failed. Please try again.';
                }
                message.style.color = "#ff0000";
                setTimeout(function() {
                    message.textContent = "";
                    message.style.color = "#000000";
                }, 5000);
            }
        } catch (error) {
            message.textContent = 'An error occurred. Please try again.';
            message.style.color = "#ff0000";
            setTimeout(function() {
                message.textContent = "";
                message.style.color = "#000000";
            }, 5000);
            console.error('Registration error:', error);
        }
    });
});