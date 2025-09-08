from django.http import HttpResponse, HttpResponseForbidden, HttpResponseRedirect
from django.template import loader
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from .models import Book, UserProfile, BorrowingRecord
from .serializers import (
    BookSerializer, UserProfileSerializer, BorrowingRecordSerializer,
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer
)
from .permissions import IsAdmin, IsAdminOrReadOnly, IsOwnerOrAdmin, IsStaffOrAdmin
from django.shortcuts import render, redirect
from django.contrib.auth.models import User

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsStaffOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_available']
    search_fields = ['title', 'author', 'isbn', 'description']
    ordering_fields = ['title', 'author', 'created_at', 'updated_at']
    ordering = ['title']  # Default ordering by title

    def get_queryset(self):
        if self.request.user.userprofile.is_staff_member:
            return Book.objects.all()
        return Book.objects.filter(is_available=True)

    @action(detail=True, methods=['post'])
    def borrow(self, request, pk=None):
        book = self.get_object()
        if book.is_available:
            borrowing = BorrowingRecord.objects.create(
                user=request.user,
                book=book,
                due_date=timezone.now() + timezone.timedelta(days=14)  # 2 weeks borrowing period
            )
            return Response(BorrowingRecordSerializer(borrowing).data)
        return Response({'error': 'Book is not available'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get all available books"""
        books = self.get_queryset().filter(is_available=True)
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def borrowed(self, request):
        """Get all borrowed books"""
        books = self.get_queryset().filter(is_available=False)
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        if self.request.user.userprofile.is_admin:
            return UserProfile.objects.all()
        return UserProfile.objects.filter(user=self.request.user)

class BorrowingRecordViewSet(viewsets.ModelViewSet):
    queryset = BorrowingRecord.objects.all()
    serializer_class = BorrowingRecordSerializer
    permission_classes = [IsStaffOrAdmin]

    def get_queryset(self):
        if self.request.user.userprofile.is_staff_member:
            return BorrowingRecord.objects.all()
        return BorrowingRecord.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def return_book(self, request, pk=None):
        borrowing = self.get_object()
        if borrowing.status == 'BORROWED':
            borrowing.status = 'RETURNED'
            borrowing.return_date = timezone.now()
            borrowing.save()
            return Response(self.get_serializer(borrowing).data)
        return Response({'error': 'Book already returned'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def current_status(self, request):
        # Get the most recent borrowing record for the user
        latest_borrowing = BorrowingRecord.objects.filter(
            user=request.user
        ).order_by('-created_at').first()
        
        if not latest_borrowing:
            return Response({'status': 'NONE', 'message': 'No borrowing history'})
        
        return Response({
            'status': latest_borrowing.status,
            'book': BookSerializer(latest_borrowing.book).data if latest_borrowing.book else None,
            'borrow_date': latest_borrowing.borrow_date,
            'due_date': latest_borrowing.due_date,
            'return_date': latest_borrowing.return_date
        })

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Create user profile with default MEMBER role
            UserProfile.objects.create(
                user=user,
                membership_number=f"{user.id:08d}"  # Creates a membership number like 00000001
            )
            return Response({
                "message": "User registered successfully",
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            if user:
                # Ensure the user is active
                if not user.is_active:
                    return Response({
                        "error": "User account is disabled"
                    }, status=status.HTTP_401_UNAUTHORIZED)

                # Log the user in
                login(request, user)
                
                # Get or create the user's profile
                try:
                    user_profile = UserProfile.objects.get(user=user)
                except UserProfile.DoesNotExist:
                    # Create profile for superuser if it doesn't exist
                    if user.is_superuser:
                        user_profile = UserProfile.objects.create(
                            user=user,
                            role='ADMIN',
                            membership_number=f"{user.id:08d}"
                        )
                    else:
                        return Response({
                            "error": "User profile not found"
                        }, status=status.HTTP_404_NOT_FOUND)
                
                # Check if user is admin/superuser and return appropriate response
                is_admin = user_profile.role == 'ADMIN' or user.is_superuser
                is_staff = user_profile.role == 'STAFF'
                
                return Response({
                    "message": "Login successful",
                    "user": UserSerializer(user).data,
                    "profile": UserProfileSerializer(user_profile).data,
                    "is_admin": is_admin,
                    "is_staff": is_staff,
                    "href": "/api/admin-dashboard/" if (is_admin or is_staff) else "/api/dashboard/"
                }, status=status.HTTP_202_ACCEPTED)
            return Response({
                "error": "Invalid credentials"
            }, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]  # Allow any user to access this view

    def post(self, request):
        # If user is authenticated, log them out
        if request.user.is_authenticated:
            logout(request)
        return Response({"message": "Logout successful"})

class CheckAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                'is_authenticated': True,
                'user': UserSerializer(request.user).data
            })
        return Response({
            'is_authenticated': False
        }, status=status.HTTP_401_UNAUTHORIZED)

def home(request):
    return render(request, 'index.html')

def login_view(request):
    # If user is already logged in, redirect to appropriate dashboard
    if request.user.is_authenticated:
        try:
            if request.user.userprofile.role in ['ADMIN', 'STAFF']:
                return redirect('librarian_dashboard')
            return redirect('user_dashboard')
        except UserProfile.DoesNotExist:
            if request.user.is_superuser:
                # Create profile for superuser if it doesn't exist
                UserProfile.objects.create(
                    user=request.user,
                    role='ADMIN',
                    membership_number=f"{request.user.id:08d}"
                )
                return redirect('librarian_dashboard')
    return render(request, 'login.html')

def signup_view(request):
    return render(request, 'signup.html')

@api_view(['GET'])
def user_dashboard_view(request):
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Check if the request wants JSON response
    if request.accepted_renderer.format == 'json':
        return Response({"message": "Access granted"}, status=status.HTTP_200_OK)
    
    # Otherwise render the template
    return render(request, 'user_dashboard.html')

def borrowed_books_view(request):
    return render(request, 'borrowed_books.html')

def book_info_view(request):
    return render(request, 'book_info.html')

def book_details_view(request):
    return render(request, 'book_details.html')

def is_admin_or_staff(user):
    try:
        return user.userprofile.role in ['ADMIN', 'STAFF']
    except UserProfile.DoesNotExist:
        return user.is_superuser

@api_view(['GET'])
def admin_dashboard_view(request):
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
    
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
    
    # Check if the request wants JSON response
    if request.accepted_renderer.format == 'json':
        return Response({"message": "Access granted"}, status=status.HTTP_200_OK)
    
    # Otherwise render the template
    return render(request, 'api/admindash.html')

@login_required
@user_passes_test(is_admin_or_staff)
def add_book_view(request):
    return render(request, 'add_book.html')

@login_required
@user_passes_test(is_admin_or_staff)
def delete_book_view(request, book_id):
    return render(request, 'delete_book.html')

@login_required
@user_passes_test(is_admin_or_staff)
def edit_book_view(request, book_id):
    return render(request, 'edit_book.html')

@login_required
@user_passes_test(is_admin_or_staff)
def view_books_view(request):
    return render(request, 'viewBooks.html')

class UpdateUserRoleView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, user_id):
        try:
            user_profile = UserProfile.objects.get(user_id=user_id)
            new_role = request.data.get('role')
            
            if new_role not in dict(UserProfile.ROLE_CHOICES):
                return Response(
                    {"error": "Invalid role"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Prevent changing the role of the last admin
            if user_profile.role == 'ADMIN' and new_role != 'ADMIN':
                admin_count = UserProfile.objects.filter(role='ADMIN').count()
                if admin_count <= 1:
                    return Response(
                        {"error": "Cannot remove the last admin"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            user_profile.role = new_role
            user_profile.save()
            
            return Response({
                "message": f"User role updated to {new_role}",
                "user": UserProfileSerializer(user_profile).data
            })
            
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )