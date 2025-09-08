import { getBorrowedBooks, returnBook } from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    const bookList = document.getElementById('borrowedBooksList');
    
    try {
        const borrowedBooks = await getBorrowedBooks();
        
        if (borrowedBooks.length === 0) {
            bookList.innerHTML = '<li class="book-item">No books currently borrowed</li>';
            return;
        }

        bookList.innerHTML = borrowedBooks.map(book => `
            <li class="book-item">
                <div class="book-info">
                    <h3>${book.book.title}</h3>
                    <p>Author: ${book.book.author}</p>
                    <p>Borrowed on: ${new Date(book.borrow_date).toLocaleDateString()}</p>
                    <p>Due date: ${new Date(book.due_date).toLocaleDateString()}</p>
                    ${book.fine_amount > 0 ? `<p class="fine">Fine: $${book.fine_amount}</p>` : ''}
                    ${book.is_overdue ? '<p class="overdue">OVERDUE!</p>' : ''}
                </div>
                ${book.status === 'BORROWED' ? `
                    <button onclick="returnBook(${book.id})" class="return-button">Return Book</button>
                ` : ''}
            </li>
        `).join('');
    } catch (error) {
        console.error('Failed to fetch borrowed books:', error);
        bookList.innerHTML = '<li class="book-item">Error loading borrowed books</li>';
    }
});

async function returnBook(borrowingId) {
    try {
        await returnBook(borrowingId);
        alert('Book returned successfully!');
        location.reload();
    } catch (error) {
        alert(error.message || 'Failed to return book');
    }
}

   