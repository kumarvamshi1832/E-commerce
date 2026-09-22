from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.core.cache import cache
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
import json
import random
import os
import requests
from rest_framework.authtoken.models import Token
from .models import UserProfile, Referral



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

        username = data.get(
            "username",
            ""
        ).strip()

        email = data.get(
            "email",
            ""
        ).strip().lower()

        password = data.get(
            "password",
            ""
        )

        confirm_password = data.get(
            "confirm_password",
            ""
        )

        referral_code = data.get(
            "referral_code",
            ""
        ).strip().upper()

        if (
            not username
            or not email
            or not password
            or not confirm_password
        ):
            return JsonResponse(
                {"error": "All fields are required."},
                status=400
            )

        if password != confirm_password:
            return JsonResponse(
                {"error": "Passwords do not match."},
                status=400
            )

        # =================================================
        # VALIDATE REFERRAL CODE
        # =================================================

        referrer = None

        if referral_code:

            try:
                referrer_profile = UserProfile.objects.select_related(
                    "user"
                ).get(
                    referral_code=referral_code
                )

            except UserProfile.DoesNotExist:

                return JsonResponse(
                    {"error": "Invalid referral code."},
                    status=400
                )

            referrer = referrer_profile.user

            if not referrer.is_active:

                return JsonResponse(
                    {"error": "This referral code is not active."},
                    status=400
                )

            if referrer.username.lower() == username.lower():

                return JsonResponse(
                    {
                        "error": (
                            "You cannot use your own referral code."
                        )
                    },
                    status=400
                )

        # =================================================
        # CHECK USERNAME
        # =================================================

        existing_username = User.objects.filter(
            username__iexact=username
        ).first()

        if existing_username:

            if not existing_username.is_active:

                cache.delete(
                    f"registration_otp_{existing_username.id}"
                )

                cache.delete(
                    f"registration_referrer_{existing_username.id}"
                )

                existing_username.delete()

            else:

                return JsonResponse(
                    {"error": "Username already exists."},
                    status=400
                )

        # =================================================
        # CHECK EMAIL
        # =================================================

        existing_email = User.objects.filter(
            email__iexact=email
        ).first()

        if existing_email:

            if not existing_email.is_active:

                cache.delete(
                    f"registration_otp_{existing_email.id}"
                )

                cache.delete(
                    f"registration_referrer_{existing_email.id}"
                )

                existing_email.delete()

            else:

                return JsonResponse(
                    {
                        "error": (
                            "User already exists "
                            "with this email."
                        )
                    },
                    status=400
                )

        # =================================================
        # CREATE INACTIVE USER
        # =================================================

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        user.is_active = False
        user.save()

        # =================================================
        # STORE REFERRER TEMPORARILY
        # =================================================

        if referrer:

            cache.set(
                f"registration_referrer_{user.id}",
                referrer.id,
                OTP_EXPIRY
            )

        # =================================================
        # GENERATE OTP
        # =================================================

        otp = generate_otp()

        cache.set(
            f"registration_otp_{user.id}",
            make_password(otp),
            OTP_EXPIRY
        )

        # =================================================
        # SEND REGISTRATION OTP USING BREVO API
        # =================================================

        try:

            print(
                "STARTING BREVO REGISTRATION OTP",
                flush=True
            )

            print(
                "OTP Recipient:",
                email,
                flush=True
            )

            brevo_api_key = os.environ.get(
                "BREVO_API_KEY"
            )

            otp_message = f"""
Hello {username},

Your MyStore verification OTP is:

{otp}

This OTP is valid for 5 minutes.

If you did not create an account, please ignore this email.

MyStore Team
"""

            response = requests.post(
                "https://api.brevo.com/v3/smtp/email",

                headers={
                    "accept": "application/json",
                    "api-key": brevo_api_key,
                    "content-type": "application/json",
                },

                json={
                    "sender": {
                        "name": "MyStore",
                        "email": "kumarvamshi1832@gmail.com",
                    },

                    "to": [
                        {
                            "email": email,
                        }
                    ],

                    "subject": (
                        "Your MyStore Verification OTP"
                    ),

                    "textContent": otp_message,
                },

                timeout=10,
            )

            print(
                "BREVO REGISTRATION OTP STATUS:",
                response.status_code,
                flush=True
            )

            print(
                "BREVO REGISTRATION OTP RESPONSE:",
                response.text,
                flush=True
            )

            response.raise_for_status()

            print(
                "BREVO REGISTRATION OTP SENT SUCCESSFULLY",
                flush=True
            )

        except Exception as email_error:

            print(
                "BREVO REGISTRATION OTP ERROR:",
                repr(email_error),
                flush=True
            )

            return JsonResponse(
                {
                    "error": (
                        "Unable to send OTP email. "
                        "Please try again."
                    )
                },
                status=500
            )

        return JsonResponse(
            {
                "message": (
                    "OTP sent successfully "
                    "to your email."
                ),

                "user_id": user.id,

                "email": email,
            },

            status=201
        )

    except json.JSONDecodeError:

        return JsonResponse(
            {
                "error": "Invalid JSON data."
            },
            status=400
        )

    except Exception as e:

        return JsonResponse(
            {
                "error": str(e)
            },
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

        otp = data.get(
            "otp",
            ""
        ).strip()

        if not user_id or not otp:
            return JsonResponse(
                {
                    "error": (
                        "User ID and OTP are required."
                    )
                },
                status=400
            )

        if not otp.isdigit() or len(otp) != 6:
            return JsonResponse(
                {
                    "error": "OTP must be 6 digits."
                },
                status=400
            )

        try:

            user = User.objects.get(
                id=user_id
            )

        except User.DoesNotExist:

            return JsonResponse(
                {
                    "error": (
                        "Registration session not found."
                    )
                },
                status=404
            )

        stored_otp = cache.get(
            f"registration_otp_{user.id}"
        )

        if not stored_otp:

            return JsonResponse(
                {
                    "error": (
                        "OTP has expired. "
                        "Please request a new OTP."
                    )
                },
                status=400
            )

        if not check_password(
            otp,
            stored_otp
        ):

            return JsonResponse(
                {
                    "error": "Invalid OTP."
                },
                status=400
            )

        # =================================================
        # OTP CORRECT
        # =================================================

        user.is_active = True
        user.save()

        # =================================================
        # CREATE REFERRAL
        # =================================================

        referrer_id = cache.get(
            f"registration_referrer_{user.id}"
        )

        if referrer_id:

            try:

                referrer = User.objects.get(
                    id=referrer_id,
                    is_active=True
                )

                referral_code = UserProfile.objects.get(
                    user=referrer
                ).referral_code

                Referral.objects.get_or_create(
                    referred_user=user,
                    defaults={
                        "referrer": referrer,
                        "referral_code": referral_code,
                        "status": "Pending",
                        "first_bonus_credited": False,
                    }
                )

            except User.DoesNotExist:

                pass

            except UserProfile.DoesNotExist:

                pass

        # =================================================
        # DELETE REGISTRATION CACHE
        # =================================================

        cache.delete(
            f"registration_otp_{user.id}"
        )

        cache.delete(
            f"registration_referrer_{user.id}"
        )

        return JsonResponse(
            {
                "message": (
                    "Email verified successfully. "
                    "Registration completed!"
                )
            }
        )

    except json.JSONDecodeError:

        return JsonResponse(
            {
                "error": "Invalid JSON data."
            },
            status=400
        )

    except Exception as e:

        return JsonResponse(
            {
                "error": str(e)
            },
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
            user = User.objects.get(
                id=user_id
            )

        except User.DoesNotExist:
            return JsonResponse(
                {
                    "error": (
                        "Registration session "
                        "not found."
                    )
                },
                status=404
            )

        if user.is_active:
            return JsonResponse(
                {
                    "error": (
                        "This account is already "
                        "verified."
                    )
                },
                status=400
            )

        # Generate new OTP
        otp = generate_otp()

        # Store hashed OTP in cache
        cache.set(
            f"registration_otp_{user.id}",
            make_password(otp),
            OTP_EXPIRY
        )

        # Preserve referral ID if it exists
        referrer_id = cache.get(
            f"registration_referrer_{user.id}"
        )

        if referrer_id:
            cache.set(
                f"registration_referrer_{user.id}",
                referrer_id,
                OTP_EXPIRY
            )

        # =================================================
        # SEND NEW OTP USING BREVO API
        # =================================================

        try:
            print(
                "STARTING BREVO RESEND OTP",
                flush=True
            )

            print(
                "OTP Recipient:",
                user.email,
                flush=True
            )

            brevo_api_key = os.environ.get(
                "BREVO_API_KEY"
            )

            otp_message = f"""
Hello {user.username},

Your new MyStore verification OTP is:

{otp}

This OTP is valid for 5 minutes.

If you did not create an account, please ignore this email.

MyStore Team
"""

            response = requests.post(
                "https://api.brevo.com/v3/smtp/email",
                headers={
                    "accept": "application/json",
                    "api-key": brevo_api_key,
                    "content-type": "application/json",
                },
                json={
                    "sender": {
                        "name": "MyStore",
                        "email": "kumarvamshi1832@gmail.com",
                    },
                    "to": [
                        {
                            "email": user.email,
                        }
                    ],
                    "subject": (
                        "Your MyStore Verification OTP"
                    ),
                    "textContent": otp_message,
                },
                timeout=10,
            )

            print(
                "BREVO RESEND OTP STATUS:",
                response.status_code,
                flush=True
            )

            print(
                "BREVO RESEND OTP RESPONSE:",
                response.text,
                flush=True
            )

            response.raise_for_status()

            print(
                "BREVO RESEND OTP SENT SUCCESSFULLY",
                flush=True
            )

        except Exception as email_error:
            print(
                "BREVO RESEND OTP ERROR:",
                repr(email_error),
                flush=True
            )

            return JsonResponse(
                {
                    "error": (
                        "Unable to send OTP email. "
                        "Please try again."
                    )
                },
                status=500
            )

        return JsonResponse(
            {
                "message": "New OTP sent successfully."
            }
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {
                "error": "Invalid JSON data."
            },
            status=400
        )

    except Exception as e:
        return JsonResponse(
            {
                "error": str(e)
            },
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
                    "error": (
                        "Please verify your email "
                        "with OTP before logging in."
                    )
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

        # Create or get token
        token, created = Token.objects.get_or_create(
            user=authenticated_user
        )

        # Determine user role
        if authenticated_user.is_superuser:
            role = "admin"

        elif authenticated_user.is_staff:
            role = "support"

        else:
            role = "customer"

        # Send login response
        return JsonResponse(
            {
                "message": "Login successful!",
                "token": token.key,
                "user": {
                    "id": authenticated_user.id,
                    "username": authenticated_user.username,
                    "email": authenticated_user.email,
                    "role": role,
                }
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
def forgot_password(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST method allowed."},
            status=405
        )

    try:
        data = json.loads(request.body)

        email = data.get("email", "").strip()

        if not email:
            return JsonResponse(
                {"error": "Email is required."},
                status=400
            )

        try:
            user = User.objects.get(
                email=email,
                is_active=True
            )
        except User.DoesNotExist:
            return JsonResponse(
                {"error": "No active account found with this email."},
                status=404
            )

        otp = generate_otp()

        cache.set(
            f"password_reset_otp_{user.id}",
            make_password(otp),
            timeout=OTP_EXPIRY
        )

        email_data = {
            "sender": {
                "name": "MyStore",
                "email": "kumarvamshi1832@gmail.com"
            },
            "to": [
                {
                    "email": user.email,
                    "name": user.username
                }
            ],
            "subject": "Your MyStore Password Reset OTP",
            "htmlContent": f"""
                <html>
                    <body>
                        <h2>Password Reset Request</h2>

                        <p>Hello {user.username},</p>

                        <p>
                            Use the following OTP to reset your
                            MyStore password:
                        </p>

                        <h1>{otp}</h1>

                        <p>
                            This OTP is valid for 5 minutes.
                        </p>

                        <p>
                            If you did not request a password reset,
                            please ignore this email.
                        </p>

                        <p>
                            Regards,<br>
                            MyStore Team
                        </p>
                    </body>
                </html>
            """
        }

        headers = {
            "accept": "application/json",
            "api-key": os.environ.get("BREVO_API_KEY"),
            "content-type": "application/json"
        }

        response = requests.post(
            "https://api.brevo.com/v3/smtp/email",
            headers=headers,
            json=email_data
        )

        if response.status_code not in [200, 201, 202]:
            return JsonResponse(
                {"error": "Unable to send OTP email."},
                status=500
            )

        return JsonResponse(
            {
                "message": "Password reset OTP sent successfully."
            },
            status=200
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data."},
            status=400
        )


@csrf_exempt
def reset_password(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST method allowed."},
            status=405
        )

    try:
        data = json.loads(request.body)

        email = data.get("email", "").strip()
        otp = data.get("otp", "").strip()
        new_password = data.get("new_password", "")
        confirm_password = data.get(
            "confirm_password",
            ""
        )

        if not email:
            return JsonResponse(
                {"error": "Email is required."},
                status=400
            )

        if not otp:
            return JsonResponse(
                {"error": "OTP is required."},
                status=400
            )

        if not new_password:
            return JsonResponse(
                {"error": "New password is required."},
                status=400
            )

        if not confirm_password:
            return JsonResponse(
                {"error": "Please confirm your password."},
                status=400
            )

        if new_password != confirm_password:
            return JsonResponse(
                {"error": "Passwords do not match."},
                status=400
            )

        try:
            user = User.objects.get(
                email=email,
                is_active=True
            )
        except User.DoesNotExist:
            return JsonResponse(
                {"error": "Account not found."},
                status=404
            )

        cache_key = f"password_reset_otp_{user.id}"

        stored_otp = cache.get(cache_key)

        if not stored_otp:
            return JsonResponse(
                {
                    "error":
                    "OTP has expired. Please request a new OTP."
                },
                status=400
            )

        if not check_password(otp, stored_otp):
            return JsonResponse(
                {"error": "Invalid OTP."},
                status=400
            )

        user.set_password(new_password)
        user.save()
        Token.objects.filter(user=user).delete()

        cache.delete(cache_key)

        return JsonResponse(
            {
                "message":
                "Password reset successfully. Please login again."
            },
            status=200
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data."},
            status=400
        )