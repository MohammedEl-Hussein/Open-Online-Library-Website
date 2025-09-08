import { login, register, logout } from './api.js';

// Add authentication check to protected pages
document.addEventListener('DOMContentLoaded', async function() {
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await login(username, password);
                if (response.href) {
                    // Make a GET request to the dashboard URL
                    const dashboardResponse = await fetch(response.href, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json'
                        }
                    });
                    
                    if (dashboardResponse.ok) {
                        window.location.href = response.href;
                    } else {
                        const error = await dashboardResponse.json();
                        alert(error.error || 'Access denied');
                    }
                }
            } catch (error) {
                alert(error.message || 'Login failed');
                console.error('Login error:', error);
            }
        });
    }

    // Handle registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = {
                username: document.getElementById('reg-username').value,
                password: document.getElementById('reg-password').value,
                password2: document.getElementById('reg-password2').value,
                email: document.getElementById('reg-email').value,
                first_name: document.getElementById('reg-firstname').value,
                last_name: document.getElementById('reg-lastname').value
            };

            try {
                const response = await register(formData);
                 const data = await response.json();

                if (response.ok) {
                    alert('Registration successful! Please login.');
                     // Redirect to login page
                     if (typeof loginUrl !== 'undefined') {
                         window.location.href = loginUrl;
                     } else {
                         console.error('loginUrl is not defined for redirection');
                     }
                } else {
                    // Display validation errors or general registration failure message
                     if (typeof data === 'object') {
                        const errorText = Object.values(data).flat().join(', ');
                        alert(errorText);
                    } else {
                        alert(data.error || 'Registration failed. Please try again.');
                    }
                }
            } catch (error) {
                alert(error.message || 'Registration failed');
                console.error('Registration error:', error);
            }
        });
    }

    // Handle logout - Assuming the logout link has an ID like 'logout-link'
    const logoutButton = document.getElementById('logout-link');
    if (logoutButton) {
        logoutButton.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                await logout();
                // Redirect to home page after logout
                if (typeof homeUrl !== 'undefined') {
                    window.location.href = homeUrl;
                } else {
                    console.error('homeUrl is not defined for redirection');
                }
            } catch (error) {
                console.error('Logout failed:', error);
                alert('Logout failed. Please try again.');
            }
        });
    }
});

// Removed the updateUIForLoggedInUser and updateUIForLoggedOutUser functions

// Removed checkUser function (assumed to be part of old local storage logic) 