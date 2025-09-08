// /js/search.js
import { searchBooks, borrowBook } from './api.js';

async function handleSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Please enter a search term');
        return;
    }

    try {
        const results = await searchBooks(query);
        displaySearchResults(results);
    } catch (error) {
        console.error('Search failed:', error);
        alert('Failed to search books');
    }
}

function displaySearchResults(results) {
    // Remove existing search results if any
    const existingResults = document.getElementById('searchResults');
    if (existingResults) {
        document.body.removeChild(existingResults);
    }

    // Create container for search results
    const searchResultsDiv = document.createElement('div');
    searchResultsDiv.id = 'searchResults';
    searchResultsDiv.className = 'search-results';

    // Create header with close button
    const header = document.createElement('div');
    header.className = 'search-results-header';
    header.innerHTML = `
        <h2>Search Results</h2>
        <button onclick="document.body.removeChild(document.getElementById('searchResults'))">×</button>
    `;
    searchResultsDiv.appendChild(header);

    // Create container for book results
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'results-container';

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No books found matching your search.</p>';
    } else {
        results.forEach(book => {
            const bookDiv = document.createElement('div');
            bookDiv.className = 'book-card';
            bookDiv.innerHTML = `
                <div class="book-cover">
                    ${book.cover_image_url ? 
                        `<img src="${book.cover_image_url}" alt="${book.title} cover">` :
                        '<div class="no-cover">No Cover</div>'
                    }
                </div>
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="author">by ${book.author}</p>
                    <p class="isbn">ISBN: ${book.isbn}</p>
                    <p class="description">${book.description}</p>
                    <button 
                        class="borrow-button ${!book.is_available ? 'disabled' : ''}" 
                        data-book-id="${book.id}"
                        ${!book.is_available ? 'disabled' : ''}
                    >
                        ${book.is_available ? 'Borrow' : 'Not Available'}
                    </button>
                </div>
            `;
            resultsContainer.appendChild(bookDiv);
        });
    }

    searchResultsDiv.appendChild(resultsContainer);
    document.body.appendChild(searchResultsDiv);

    // Add event listeners to borrow buttons
    document.querySelectorAll('.borrow-button:not([disabled])').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const bookId = this.getAttribute('data-book-id');
            try {
                await borrowBook(bookId);
                alert('Book borrowed successfully!');
                // Close search results after borrowing
                document.body.removeChild(searchResultsDiv);
                // Reload the current page to reflect changes
                window.location.reload();
            } catch (error) {
                alert(error.message || 'Failed to borrow book');
            }
        });
    });
}