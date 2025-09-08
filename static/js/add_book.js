import { addBook } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const bookData = {
                bookID: document.getElementById('bookID').value,
                title: document.getElementById('bookName').value,
                author: document.getElementById('author').value,
                category: document.getElementById('category').value,
                description: document.getElementById('description').value,
                image: document.getElementById('image').value // Assuming image is a URL for now
            };
            
            try {
                await addBook(bookData);
                alert('Book added successfully!');
                this.reset();
            } catch (error) {
                console.error('Failed to add book:', error);
                alert('Failed to add book');
            }
        });
    }

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