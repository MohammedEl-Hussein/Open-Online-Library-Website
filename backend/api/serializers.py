from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Book, UserProfile, BorrowingRecord
from django.utils import timezone

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'username', 'password', 'password2', 'email')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'is_superuser']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'phone_number', 'address', 'membership_number', 'created_at']

class BookSerializer(serializers.ModelSerializer):
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'isbn', 'description', 
                 'is_available', 'cover_image', 'cover_image_url',
                 'created_at', 'updated_at']
        read_only_fields = ['cover_image_url']

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            return self.context['request'].build_absolute_uri(obj.cover_image.url)
        return None

class BorrowingRecordSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = BorrowingRecord
        fields = ['id', 'user', 'book', 'borrow_date', 'due_date', 
                 'return_date', 'status', 'fine_amount', 'notes',
                 'is_overdue', 'created_at', 'updated_at']
        read_only_fields = ['fine_amount', 'is_overdue']

    def get_is_overdue(self, obj):
        return obj.status == 'OVERDUE' or (obj.status == 'BORROWED' and timezone.now() > obj.due_date)