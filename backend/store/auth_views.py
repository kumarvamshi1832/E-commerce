from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.core.cache import cache
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
import json
import random


OTP_EXPIRY = 5 * 60  # 5 minutes


def generate_otp():
    return str(random.randint(100000, 999999))


@csrf_exempt
def register_user(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST requests are allowed."},
            status=405
        )

    try:
        data = json.loads(request.body)

        username = data.get("username", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        confirm_password = data.get("confirm_password", "")

        if not username or not email or not password or not confirm_password:
            return JsonResponse(
                {"error": "All fields are required."},
                status=400
            )

        if password != confirm_password:
            return JsonResponse(
                {"error": "Passwords do not match."},
                status=400
            )

        # Check username
        existing_username = User.objects.filter(
            username__iexact=username
        ).first()

        if existing_username:
            # Allow retry if previous registration was never verified
            if not existing_username.is_active:
                existing_username.delete()
            else:
                return JsonResponse(
                    {"error": "Username already exists."},
                    status=400
                )

        # Check email
        existing_email = User.objects.filter(
            email__iexact=email
        ).first()

        if existing_email:
            if not existing_email.is_active:
                existing_email.delete()
            else:
                return JsonResponse(
                    {"error": "User already exists with this email."},
                    status=400
                )

        # Create inactive user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # User cannot login until OTP is verified
        user.is_active = False
        user.save()

        # Generate OTP
        otp = generate_otp()

        # Store hashed OTP in cache
        cache.set(
            f"registration_otp_{user.id}",
            make_password(otp),
            OTP_EXPIRY
        )

        # Send OTP email
        send_mail(
            subject="Your MyStore Verification OTP",
            message=(
                f"Hello {username},\n\n"
                f"Your OTP for account verification is: {otp}\n\n"
                f"This OTP is valid for 5 minutes.\n\n"
                f"If you did not create this account, please ignore this email."
            ),
            from_email=None,
            recipient_list=[email],
            fail_silently=False,
        )

        return JsonResponse(
            {
                "message": "OTP sent successfully to your email.",
                "user_id": user.id,
                "email": email,
            },
            status=201
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data."},
            status=400
        )

    except Exception as e:
        return JsonResponse(
            {"error": str(e)},
            status=500
        )


@csrf_exempt
def verify_registration_otp(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST requests are allowed."},
            status=405
        )

    try:
        data = json.loads(request.body)

        user_id = data.get("user_id")
        otp = data.get("otp", "").strip()

        if not user_id or not otp:
            return JsonResponse(
                {"error": "User ID and OTP are required."},
                status=400
            )

        if not otp.isdigit() or len(otp) != 6:
            return JsonResponse(
                {"error": "OTP must be 6 digits."},
                status=400
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse(
                {"error": "Registration session not found."},
                status=404
            )

        stored_otp = cache.get(
            f"registration_otp_{user.id}"
        )

        if not stored_otp:
            return JsonResponse(
                {
                    "error": "OTP has expired. Please request a new OTP."
                },
                status=400
            )

        if not check_password(otp, stored_otp):
            return JsonResponse(
                {"error": "Invalid OTP."},
                status=400
            )

        # OTP correct
        user.is_active = True
        user.save()

        # Delete OTP after successful verification
        cache.delete(
            f"registration_otp_{user.id}"
        )

        return JsonResponse(
            {
                "message": "Email verified successfully. Registration completed!"
            }
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data."},
            status=400
        )

    except Exception as e:
        return JsonResponse(
            {"error": str(e)},
            status=500
        )


@csrf_exempt
def resend_registration_otp(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST requests are allowed."},
            status=405
        )

    try:
        data = json.loads(request.body)

        user_id = data.get("user_id")

        if not user_id:
            return JsonResponse(
                {"error": "User ID is required."},
                status=400
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse(
                {"error": "Registration session not found."},
                status=404
            )

        if user.is_active:
            return JsonResponse(
                {"error": "This account is already verified."},
                status=400
            )

        otp = generate_otp()

        cache.set(
            f"registration_otp_{user.id}",
            make_password(otp),
            OTP_EXPIRY
        )

        send_mail(
            subject="Your MyStore Verification OTP",
            message=(
                f"Hello {user.username},\n\n"
                f"Your new OTP is: {otp}\n\n"
                f"This OTP is valid for 5 minutes."
            ),
            from_email=None,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return JsonResponse(
            {"message": "New OTP sent successfully."}
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data."},
            status=400
        )

    except Exception as e:
        return JsonResponse(
            {"error": str(e)},
            status=500
        )


@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST requests are allowed."},
            status=405
        )

    try:
        data = json.loads(request.body)

        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return JsonResponse(
                {"error": "Email and password are required."},
                status=400
            )

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return JsonResponse(
                {"error": "Invalid email or password."},
                status=401
            )

        if not user.is_active:
            return JsonResponse(
                {
                    "error": "Please verify your email with OTP before logging in."
                },
                status=403
            )

        authenticated_user = authenticate(
            username=user.username,
            password=password
        )

        if authenticated_user is None:
            return JsonResponse(
                {"error": "Invalid email or password."},
                status=401
            )

        login(request, authenticated_user)

        return JsonResponse(
            {
                "message": "Login successful!",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                }
            }
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data."},
            status=400
        )