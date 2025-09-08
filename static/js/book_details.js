import { borrowBook } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    // This would normally fetch data from a server
    // For demo, we'll use localStorage or default data
    
    // Removed search form logic as it was commented out and likely redundant
    
    // Handle borrow button clicks
    document.querySelectorAll('.borrow-button').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            // The book ID needs to be passed from the HTML template
            const bookId = this.getAttribute('data-book-id'); // Assuming data-book-id attribute is set on the button
            
            if (!bookId) {
                console.error('Book ID not found for borrowing.');
                alert('Could not borrow book: Book ID missing.');
                return;
            }

            try {
                await borrowBook(bookId);
                alert('Book borrowed successfully!');
                // Optionally redirect or update UI after successful borrow
                 // Example: Redirect to borrowed books page
                 if (typeof borrowedBooksUrl !== 'undefined') {
                    window.location.href = borrowedBooksUrl;
                 } else {
                    console.warn('borrowedBooksUrl is not defined for redirection.');
                    // Reload the page to show updated status
                     location.reload();
                 }
            } catch (error) {
                console.error('Failed to borrow book:', error);
                alert(error.message || 'Failed to borrow book');
            }
        });
    });
});