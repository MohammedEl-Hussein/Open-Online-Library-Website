from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'books', views.BookViewSet)
router.register(r'profiles', views.UserProfileViewSet, basename='profile')
router.register(r'borrowings', views.BorrowingRecordViewSet, basename='borrowing')

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('dashboard/', views.user_dashboard_view, name='user_dashboard'),
    path('borrowed/', views.borrowed_books_view, name='borrowed_books'),
    path('book-info/<int:book_id>/', views.book_info_view, name='book_info'),
    path('book-details/', views.book_details_view, name='book_details'),
    path('admin-dashboard/', views.admin_dashboard_view, name='admin_dashboard'),
    path('add-book/', views.add_book_view, name='add_book'),
    path('delete-book/<int:book_id>/', views.delete_book_view, name='delete_book'),
    path('edit-book/<int:book_id>/', views.edit_book_view, name='edit_book'),
    path('view-books/', views.view_books_view, name='view_books'),
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='api_login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/check/', views.CheckAuthView.as_view(), name='check_auth'),
    path('users/<int:user_id>/update-role/', views.UpdateUserRoleView.as_view(), name='update_user_role'),
    path('', include(router.urls)),
]