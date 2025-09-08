import { getBooks } from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    await loadBooks();

    // Add event listener for the back button
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', function() {
            // Redirect to admin dashboard
            if (typeof adminDashboardUrl !== 'undefined') {
                window.location.href = adminDashboardUrl;
            } else {
                console.error('adminDashboardUrl is not defined for redirection');
            }
        });
    }
});

async function loadBooks() {
    try {
        const response = await getBooks();
        displayBooks(response.results);
    } catch (error) {
        console.error('Failed to load books:', error);
        const tbody = document.querySelector('tbody');
        tbody.innerHTML = '<tr><td colspan="6">Error loading books</td></tr>';
    }
}

function displayBooks(books) {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.id}</td>
            <td><h2>${book.title}</h2></td>
            <td><h2>${book.author}</h2></td>
            <td><h2>${book.category}</h2></td>
            <td><h2>${book.description}</h2></td>
            <td><img src="${book.cover_image_url || ''}" alt="${book.title}" style="width: 60px;" /></td>
        `;
        tbody.appendChild(row);
    });
}
