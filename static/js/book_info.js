import { getBookById, borrowBook } from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get('id');
    
    if (bookId) {
        try {
            const book = await getBookById(bookId);
            
            document.title = book.title;
            document.getElementById('bookTitle').textContent = book.title;
            document.getElementById('bookImage').src = book.cover_image_url || ''; // Use cover_image_url from backend
            document.getElementById('bookImage').alt = book.title;
            
            // Check if the book is available (assuming backend provides an 'is_available' field)
            const isAvailable = book.is_available !== false; // Default to true if not specified or true
            
            const bookMeta = document.getElementById('bookMeta');
            bookMeta.innerHTML = `
                <h1>${book.title}</h1>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Category:</strong> ${book.category}</p>
                <p><strong>Description:</strong> ${book.description}</p>
                <p class="${isAvailable ? 'available' : 'unavailable'}">${isAvailable ? 'Available' : 'Unavailable'}</p>
                <div class="auth-buttons">
                    <a href="#" class="borrow-button ${!isAvailable ? 'disabled' : ''}" 
                       data-book-id="${book.id}" 
                       ${!isAvailable ? 'style="pointer-events: none; opacity: 0.5;"' : ''}>
                       ${isAvailable ? 'Borrow Book' : 'Not Available'}
                    </a>
                </div>
            `;
            
            // Add event listener to borrow button if it's available
            if (isAvailable) {
                document.querySelector('.borrow-button').addEventListener('click', async function(e) {
                    e.preventDefault();
                    const bookId = this.getAttribute('data-book-id');
                    try {
                        await borrowBook(bookId);
                        alert('Book borrowed successfully!');
                         // Redirect to borrowed books page using passed URL
                         if (typeof borrowedBooksUrl !== 'undefined') {
                            window.location.href = borrowedBooksUrl;
                         } else {
                             console.warn('borrowedBooksUrl is not defined for redirection.');
                             // Fallback, maybe reload or redirect to a default page
                             // window.location.href = '/some/default/page';
                         }
                    } catch (error) {
                        console.error('Failed to borrow book:', error);
                        alert(error.message || 'Failed to borrow book');
                    }
                });
            }

        } catch (error) {
            console.error('Failed to fetch book details:', error);
            // Display an error message on the page
            const bookDetailsContainer = document.getElementById('bookDetailsContainer'); // Assuming there's a container for book details
            if (bookDetailsContainer) {
                bookDetailsContainer.innerHTML = '<p>Error loading book details.</p>';
            }
            document.title = 'Error';
        }
    } else {
        console.error('Book ID not provided in URL.');
         const bookDetailsContainer = document.getElementById('bookDetailsContainer');
         if (bookDetailsContainer) {
             bookDetailsContainer.innerHTML = '<p>Error: Book ID missing from URL.</p>';
         }
         document.title = 'Error';
    }
});

// Removed the old borrowBook function as it used localStorage