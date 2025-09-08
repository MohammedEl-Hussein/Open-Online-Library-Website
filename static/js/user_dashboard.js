document.addEventListener('DOMContentLoaded', async function() {
    await fetchAndDisplayBooks();

    const books = JSON.parse(localStorage.getItem('books')) || [];
    const booksByCategory = {};
    
    books.forEach(book => {
        if (!booksByCategory[book.category]) {
            booksByCategory[book.category] = [];
        }
        booksByCategory[book.category].push(book);
    });

    const booksContainer = document.getElementById('books-container');
    const firstCategory = document.querySelector('.Category');
    booksContainer.innerHTML = '';

    Object.entries(booksByCategory).forEach(([category, categoryBooks], index) => {
        const categorySection = index === 0 ? firstCategory : firstCategory.cloneNode(true);
        categorySection.querySelector('h2').textContent = `${category} Books`;
        
        const bookList = categorySection.querySelector('.book-list');
        bookList.innerHTML = '';
        
        categoryBooks.forEach(book => {
            const bookDiv = document.createElement('div');
            bookDiv.className = 'book';
            
            const bookLink = document.createElement('a');
            bookLink.href = `/html/book_info.html?id=${book.id}`;
            
            const bookImage = document.createElement('img');
            bookImage.src = book.image;
            bookImage.alt = book.name;
            
            bookLink.appendChild(bookImage);
            bookDiv.appendChild(bookLink);
            bookList.appendChild(bookDiv);
        });
        
        booksContainer.appendChild(categorySection);
    });
});

async function fetchAndDisplayBooks() {
    const booksContainer = document.getElementById('books-container');
    const firstCategory = document.querySelector('.Category');
    booksContainer.innerHTML = '';

    try {
        const response = await fetch('http://localhost:8000/api/books/', { credentials: 'include' });

        if (!response.ok) {
            console.error('Failed to fetch books:', response.status, response.statusText);
            booksContainer.innerHTML = '<p>Error loading books.</p>';
            return;
        }

        const books = await response.json();

        const booksByCategory = {};
        books.results.forEach(book => {
            const category = book.category || 'Uncategorized';
            if (!booksByCategory[category]) {
                booksByCategory[category] = [];
            }
            booksByCategory[category].push(book);
        });

        Object.entries(booksByCategory).forEach(([category, categoryBooks], index) => {
            const categorySection = index === 0 ? firstCategory : firstCategory.cloneNode(true);
            categorySection.querySelector('h2').textContent = `${category} Books`;
            
            const bookList = categorySection.querySelector('.book-list');
            bookList.innerHTML = '';
            
            categoryBooks.forEach(book => {
                const bookDiv = document.createElement('div');
                bookDiv.className = 'book';
                
                const bookLink = document.createElement('a');
                bookLink.href = `/book-info/${book.id}/`;
                
                const bookImage = document.createElement('img');
                bookImage.src = book.cover_image_url || book.image;
                bookImage.alt = book.title || 'Book Cover';
                
                bookLink.appendChild(bookImage);
                bookDiv.appendChild(bookLink);
                bookList.appendChild(bookDiv);
            });
            
            booksContainer.appendChild(categorySection);
        });

    } catch (error) {
        console.error('Error fetching or displaying books:', error);
        booksContainer.innerHTML = '<p>Error loading books.</p>';
    }
}