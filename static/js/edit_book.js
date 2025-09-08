import { getBooks, getBookById, updateBook } from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    const bookSelect = document.getElementById('bookSelect');
    const nameInput = document.getElementById('editBookName');
    const authorInput = document.getElementById('editAuthor');
    const categoryInput = document.getElementById('editCategory');
    const descInput = document.getElementById('editDescription');
    const imageInput = document.getElementById('editImage');
    const backButton = document.getElementById('backButton');
    
    try {
        const books = await getBooks();
        
        bookSelect.innerHTML = '<option value="">-- Select a Book --</option>';
        books.results.forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = `${book.title} by ${book.author}`;
            bookSelect.appendChild(option);
        });
        
        bookSelect.addEventListener('change', async function() {
            if (this.value) {
                try {
                    const selectedBook = await getBookById(this.value);
                    nameInput.value = selectedBook.title;
                    authorInput.value = selectedBook.author;
                    categoryInput.value = selectedBook.category;
                    descInput.value = selectedBook.description;
                    imageInput.value = selectedBook.cover_image_url || '';
                } catch (error) {
                    console.error('Failed to fetch book details:', error);
                    alert('Failed to load book details');
                }
            }
        });
        
        document.getElementById('editBookForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const bookId = bookSelect.value;
            const updatedBook = {
                title: nameInput.value,
                author: authorInput.value,
                category: categoryInput.value,
                description: descInput.value,
                cover_image_url: imageInput.value
            };
            
            try {
                await updateBook(bookId, updatedBook);
                alert('Book updated successfully!');
                // Redirect to admin dashboard using passed URL
                if (typeof adminDashboardUrl !== 'undefined') {
                    window.location.href = adminDashboardUrl;
                } else {
                    console.warn('adminDashboardUrl is not defined for redirection.');
                    // Fallback to reloading the page
                    location.reload();
                }
            } catch (error) {
                console.error('Failed to update book:', error);
                alert(error.message || 'Failed to update book');
            }
        });

         // Add event listener for the back button
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

    } catch (error) {
        console.error('Failed to load books:', error);
        bookSelect.innerHTML = '<option value="">Error loading books</option>';
    }
});