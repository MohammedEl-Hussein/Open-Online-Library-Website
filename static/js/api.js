const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to handle API responses
async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Something went wrong');
    }
    return response.json();
}

// Auth API calls
async function login(username, password) {
    const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
}

async function register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
}

async function logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
    });
    
    // For logout, we consider both 200 and 401 as successful responses
    if (response.ok || response.status === 401) {
        return { message: "Logout successful" };
    }
    
    // Only throw error for other status codes
    const error = await response.json().catch(() => ({ message: 'Logout failed' }));
    throw new Error(error.message || 'Logout failed');
}

async function checkAuth() {
    const response = await fetch(`${API_BASE_URL}/auth/check/`, {
        credentials: 'include',
    });
    return handleResponse(response);
}

// Books API calls
async function getBooks() {
    const response = await fetch(`${API_BASE_URL}/books/`, {
        credentials: 'include',
    });
    return handleResponse(response);
}

async function deleteBook(bookId) {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}/`, {
        method: 'DELETE',
        credentials: 'include',
    });
    return handleResponse(response);
}

async function getBookById(bookId) {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}/`, {
        credentials: 'include',
    });
    return handleResponse(response);
}

async function addBook(bookData) {
    const response = await fetch(`${API_BASE_URL}/books/create/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(bookData),
    });
    return handleResponse(response);
}

async function searchBooks(query) {
    const response = await fetch(`${API_BASE_URL}/books/?search=${encodeURIComponent(query)}`, {
        credentials: 'include',
    });
    return handleResponse(response);
}

async function borrowBook(bookId) {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}/borrow/`, {
        method: 'POST',
        credentials: 'include',
    });
    return handleResponse(response);
}

// Borrowing Records API calls
async function getBorrowedBooks() {
    const response = await fetch(`${API_BASE_URL}/borrowings/`, {
        credentials: 'include',
    });
    return handleResponse(response);
}

async function returnBook(borrowingId) {
    const response = await fetch(`${API_BASE_URL}/borrowings/${borrowingId}/return_book/`, {
        method: 'POST',
        credentials: 'include',
    });
    return handleResponse(response);
}

async function getCurrentBorrowingStatus() {
    const response = await fetch(`${API_BASE_URL}/borrowings/current_status/`, {
        credentials: 'include',
    });
    return handleResponse(response);
}

export {
    login,
    register,
    logout,
    checkAuth,
    getBooks,
    searchBooks,
    borrowBook,
    getBorrowedBooks,
    returnBook,
    getCurrentBorrowingStatus,
    addBook,
    getBookById,
    deleteBook
}; 