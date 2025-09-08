import { getBooks, getBookById, deleteBook } from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Load books into dropdown
    await loadBooks();
    
    // When book selection changes, show details
    document.getElementById('bookSelect').addEventListener('change', async function() {
        const bookId = this.value;
        if (bookId) {
            await showBookDetails(bookId);
        } else {
            document.getElementById('bookDetails').style.display = 'none';
            document.getElementById('deleteButton').disabled = true;
        }
    });
    
    // Handle form submission
    document.getElementById('deleteBookForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const bookId = document.getElementById('bookSelect').value;
        try {
            await deleteBook(bookId);
            alert('Book deleted successfully!');
            await loadBooks(); // Refresh the dropdown
            document.getElementById('deleteBookForm').reset();
            document.getElementById('bookDetails').style.display = 'none';
        } catch (error) {
            console.error('Failed to delete book:', error);
            alert(error.message || 'Failed to delete book');
        }
    });

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

// Load books into dropdown
async function loadBooks() {
    try {
        const books = await getBooks();
        const select = document.getElementById('bookSelect');
        
        // Clear existing options (except the first placeholder)
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Add books from API response
        books.results.forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = `${book.title} by ${book.author || 'Unknown'}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load books:', error);
        const select = document.getElementById('bookSelect');
        select.innerHTML = '<option value="">Error loading books</option>';
    }
}

// Show book details when selected
async function showBookDetails(bookId) {
    try {
        const book = await getBookById(bookId);
        
        document.getElementById('displayBookName').textContent = book.title;
        document.getElementById('displayAuthor').textContent = book.author || 'Unknown';
        document.getElementById('displayCategory').textContent = book.category || 'Not specified';
        document.getElementById('displayDescription').textContent = book.description || 'No description available';
        document.getElementById('bookDetails').style.display = 'block';
        document.getElementById('deleteButton').disabled = false;
    } catch (error) {
        console.error('Failed to fetch book details:', error);
        document.getElementById('bookDetails').style.display = 'none';
        document.getElementById('deleteButton').disabled = true;
    }
}