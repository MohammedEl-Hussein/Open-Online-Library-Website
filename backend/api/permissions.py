from rest_framework import permissions

class IsStaffOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow staff members or admins to access the view.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.userprofile.is_staff_member

class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow administrators to access the view.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.userprofile.is_admin

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow administrators to edit objects.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to administrators
        return request.user.is_authenticated and hasattr(request.user, 'userprofile') and request.user.userprofile.is_admin

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or administrators to access it.
    """
    def has_object_permission(self, request, view, obj):
        # Administrators can access any object
        if request.user.is_authenticated and hasattr(request.user, 'userprofile') and request.user.userprofile.is_admin:
            return True

        # Check if the object has a user attribute (for BorrowingRecord)
        if hasattr(obj, 'user'):
            return obj.user == request.user

        # Check if the object is a UserProfile
        if hasattr(obj, 'userprofile'):
            return obj.userprofile.user == request.user

        return False 