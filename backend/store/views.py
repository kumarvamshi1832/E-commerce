from django.http import HttpResponse
import csv
import json
from django.db.models import Sum
from django.db.models import Avg, Count
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import (Product, Order, OrderItem, Coupon,
                     EmailOTP,Wishlist,ProductFeedback,
                     SupportTicket,SupportMessage,Notification,ProductReview,
                     DeliveryPincode, Address,Wallet,WalletTransaction,Referral,UserProfile,)
from django.db import transaction
from decimal import Decimal
import random
import os
import requests
import resend
from django.conf import settings
from django.core.mail import send_mail

from django.utils import timezone

resend.api_key = os.environ.get("RESEND_API_KEY")

from functools import wraps
from rest_framework.authtoken.models import Token

def token_auth_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):

        # Check Authorization header
        auth_header = request.headers.get("Authorization", "")

        if auth_header.startswith("Token "):

            token_key = auth_header.split(" ", 1)[1].strip()

            if token_key:

                try:
                    token = Token.objects.select_related("user").get(
                        key=token_key
                    )

                    # Replace anonymous/session user with token user
                    request.user = token.user

                except Token.DoesNotExist:
                    pass

        return view_func(request, *args, **kwargs)

    return wrapper


def admin_required(view_func):
    @wraps(view_func)
    @token_auth_required
    def wrapper(request, *args, **kwargs):

        if not request.user.is_authenticated:
            return JsonResponse(
                {"error": "Authentication required."},
                status=401
            )

        if not request.user.is_superuser:
            return JsonResponse(
                {"error": "Admin access required."},
                status=403
            )

        return view_func(request, *args, **kwargs)

    return wrapper

@csrf_exempt
@admin_required
def admin_dashboard(request):
    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET method allowed."},
            status=405
        )

    total_products = Product.objects.count()

    active_products = Product.objects.filter(
        is_active=True
    ).count()

    total_orders = Order.objects.count()

    pending_orders = Order.objects.filter(
        status="Pending"
    ).count()

    total_customers = User.objects.filter(
        is_superuser=False,
        is_staff=False
    ).count()

    total_revenue = Order.objects.exclude(
        status="Cancelled"
    ).aggregate(
        total=Sum("total_amount")
    )["total"] or 0

    low_stock_products = Product.objects.filter(
        stock__gt=0,
        stock__lte=5
    ).count()

    out_of_stock_products = Product.objects.filter(
        stock=0
    ).count()

    recent_orders = Order.objects.select_related(
        "user"
    ).order_by("-created_at")[:20]

    recent_order_data = []

    for order in recent_orders:
        recent_order_data.append({
            "id": order.id,
            "customer": order.user.username,
            "email": order.user.email,
            "total_amount": float(order.total_amount),
            "status": order.status,
            "created_at": order.created_at,
        })

    low_stock = Product.objects.filter(
        stock__lte=5
    ).order_by("stock", "name")[:5]

    low_stock_data = []

    for product in low_stock:
        low_stock_data.append({
            "id": product.id,
            "name": product.name,
            "stock": product.stock,
            "is_active": product.is_active,
        })

    return JsonResponse({
        "summary": {
            "total_products": total_products,
            "active_products": active_products,
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "total_customers": total_customers,
            "total_revenue": float(total_revenue),
            "low_stock_products": low_stock_products,
            "out_of_stock_products": out_of_stock_products,
        },
        "recent_orders": recent_order_data,
        "low_stock": low_stock_data,
    })


@csrf_exempt
@admin_required
def admin_product_list(request):
    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET method allowed."},
            status=405
        )

    products = Product.objects.all().order_by("-created_at")

    data = []

    for product in products:
        data.append({
            "id": product.id,
            "name": product.name,
            "price": float(product.price),
            "description": product.description,
            "image": request.build_absolute_uri(product.image.url)
                     if product.image else None,
            "category": product.category,
            "stock": product.stock,
            "is_active": product.is_active,
            "created_at": product.created_at,
            "updated_at": product.updated_at,
        })

    return JsonResponse(data, safe=False)

def admin_required(view_func):
    @wraps(view_func)
    @token_auth_required
    def wrapper(request, *args, **kwargs):

        if not request.user.is_authenticated:
            return JsonResponse(
                {"error": "Authentication required."},
                status=401
            )

        if not request.user.is_superuser:
            return JsonResponse(
                {"error": "Admin access required."},
                status=403
            )

        return view_func(request, *args, **kwargs)

    return wrapper

@csrf_exempt
@admin_required
def admin_create_product(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST method allowed."},
            status=405
        )

    name = request.POST.get("name", "").strip()
    price = request.POST.get("price")
    description = request.POST.get("description", "").strip()
    category = request.POST.get("category", "").strip()
    stock = request.POST.get("stock")
    image = request.FILES.get("image")

    if not name or price is None or not category or stock is None:
        return JsonResponse(
            {"error": "Name, price, category and stock are required."},
            status=400
        )

    product = Product.objects.create(
        name=name,
        price=price,
        description=description,
        category=category,
        stock=stock,
        image=image,
        is_active=True
    )

    return JsonResponse({
        "message": "Product created successfully.",
        "product": {
            "id": product.id,
            "name": product.name,
            "price": float(product.price),
            "description": product.description,
            "category": product.category,
            "stock": product.stock,
            "image": product.image.url if product.image else None,
            "is_active": product.is_active,
        }
    }, status=201)


@csrf_exempt
@admin_required
def admin_update_product(request, product_id):

    if request.method != "PUT":
        return JsonResponse(
            {"error": "Only PUT method allowed."},
            status=405
        )

    try:
        product = Product.objects.get(id=product_id)

    except Product.DoesNotExist:
        return JsonResponse(
            {"error": "Product not found."},
            status=404
        )

    try:
        data = json.loads(request.body)

        name = data.get("name")
        price = data.get("price")
        description = data.get("description")
        category = data.get("category")
        stock = data.get("stock")

        if name is not None:
            product.name = name.strip()

        if price is not None:
            product.price = price

        if description is not None:
            product.description = description.strip()

        if category is not None:
            product.category = category.strip()

        if stock is not None:
            product.stock = stock

        product.save()

        return JsonResponse(
            {
                "message": "Product updated successfully.",
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "price": float(product.price),
                    "description": product.description,
                    "category": product.category,
                    "stock": product.stock,
                    "is_active": product.is_active,
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
@admin_required
def admin_toggle_product_status(request, product_id):

    if request.method != "PATCH":
        return JsonResponse(
            {"error": "Only PATCH method allowed."},
            status=405
        )

    try:
        product = Product.objects.get(id=product_id)

    except Product.DoesNotExist:
        return JsonResponse(
            {"error": "Product not found."},
            status=404
        )

    product.is_active = not product.is_active
    product.save()

    return JsonResponse(
        {
            "message": (
                "Product activated successfully."
                if product.is_active
                else "Product deactivated successfully."
            ),
            "id": product.id,
            "is_active": product.is_active
        }
    )

@csrf_exempt
@admin_required
def admin_delete_product(request, product_id):

    if request.method != "DELETE":
        return JsonResponse(
            {"error": "Only DELETE method allowed."},
            status=405
        )

    try:
        product = Product.objects.get(id=product_id)

    except Product.DoesNotExist:
        return JsonResponse(
            {"error": "Product not found."},
            status=404
        )

    product.delete()

    return JsonResponse(
        {
            "message": "Product deleted successfully."
        }
    )

@csrf_exempt
@admin_required
def admin_order_list(request):

    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET method allowed."},
            status=405
        )

    orders = Order.objects.all().select_related("user").order_by("-created_at")

    data = []

    for order in orders:

        data.append({
            "id": order.id,
            "user": {
                "id": order.user.id,
                "username": order.user.username,
                "email": order.user.email,
            },
            "total_amount": float(order.total_amount),
            "status": order.status,
            "created_at": order.created_at,
        })

    return JsonResponse(data, safe=False)

@csrf_exempt
@admin_required
def admin_order_detail(request, order_id):

    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET method allowed."},
            status=405
        )

    try:
        order = Order.objects.select_related("user").get(id=order_id)
    except Order.DoesNotExist:
        return JsonResponse(
            {"error": "Order not found."},
            status=404
        )

    items = order.items.select_related("product").all()

    data = {
        "id": order.id,
        "user": {
            "id": order.user.id,
            "username": order.user.username,
            "email": order.user.email,
        },
        "total_amount": float(order.total_amount),
        "status": order.status,
        "created_at": order.created_at,
        "items": []
    }

    for item in items:

        data["items"].append({
            "id": item.id,
            "product_id": item.product.id,
            "product_name": item.product.name,
            "quantity": item.quantity,
            "price": float(item.price),
            "subtotal": float(item.price * item.quantity),
            "image": (
                request.build_absolute_uri(item.product.image.url)
                if item.product.image else None
            ),
        })

    return JsonResponse(data)

@csrf_exempt
@admin_required
def admin_update_order_status(request, order_id):

    if request.method != "PATCH":
        return JsonResponse(
            {"error": "Only PATCH method allowed."},
            status=405
        )

    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return JsonResponse(
            {"error": "Order not found."},
            status=404
        )

    try:
        data = json.loads(request.body)
        new_status = data.get("status")

        valid_statuses = [
            choice[0]
            for choice in Order.STATUS_CHOICES
        ]

        if new_status not in valid_statuses:
            return JsonResponse(
                {
                    "error": "Invalid order status.",
                    "valid_statuses": valid_statuses
                },
                status=400
            )

        old_status = order.status

        with transaction.atomic():

            order.status = new_status
            order.save()

            if old_status != "Delivered" and new_status == "Delivered":

                try:
                    referral = Referral.objects.get(
                        referred_user=order.user
                    )
                except Referral.DoesNotExist:
                    referral = None

                if referral:

                    if (
                        not referral.first_bonus_credited
                        and order.total_amount >= Decimal("200")
                    ):
                        wallet, created = Wallet.objects.get_or_create(
                            user=referral.referrer
                        )

                        wallet.balance += Decimal("100")
                        wallet.save()

                        WalletTransaction.objects.create(
                            user=referral.referrer,
                            amount=Decimal("100"),
                            transaction_type="Credit",
                            description=(
                                f"Referral bonus for referring "
                                f"{order.user.username}"
                            ),
                            order=order
                        )

                        referral.first_order = order
                        referral.first_bonus_credited = True
                        referral.status = "Successful"
                        referral.save()

                    elif (
                        referral.first_bonus_credited
                        and referral.status == "Successful"
                    ):
                        commission = (
                            order.total_amount * Decimal("0.10")
                        )

                        if commission > 0:
                            wallet, created = Wallet.objects.get_or_create(
                                user=referral.referrer
                            )

                            wallet.balance += commission
                            wallet.save()

                            WalletTransaction.objects.create(
                                user=referral.referrer,
                                amount=commission,
                                transaction_type="Credit",
                                description=(
                                    f"10% referral commission from "
                                    f"{order.user.username}"
                                ),
                                order=order
                            )

        return JsonResponse({
            "message": "Order status updated successfully.",
            "id": order.id,
            "status": order.status
        })

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data."},
            status=400
        )
    
@csrf_exempt
@admin_required
def admin_customer_list(request):

    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET method allowed."},
            status=405
        )

    customers = User.objects.filter(
        is_superuser=False,
        is_staff=False
    ).order_by("-date_joined")

    data = []

    for customer in customers:

        order_count = Order.objects.filter(
            user=customer
        ).count()

        data.append({
            "id": customer.id,
            "username": customer.username,
            "email": customer.email,
            "first_name": customer.first_name,
            "last_name": customer.last_name,
            "date_joined": customer.date_joined,
            "is_active": customer.is_active,
            "order_count": order_count,
        })

    return JsonResponse(data, safe=False)

@csrf_exempt
@admin_required
def admin_customer_detail(request, customer_id):

    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET method allowed."},
            status=405
        )

    try:
        customer = User.objects.get(
            id=customer_id,
            is_superuser=False,
            is_staff=False
        )
    except User.DoesNotExist:
        return JsonResponse(
            {"error": "Customer not found."},
            status=404
        )

    orders = Order.objects.filter(
        user=customer
    ).order_by("-created_at")

    data = {
        "id": customer.id,
        "username": customer.username,
        "email": customer.email,
        "first_name": customer.first_name,
        "last_name": customer.last_name,
        "date_joined": customer.date_joined,
        "is_active": customer.is_active,
        "order_count": orders.count(),
        "total_spent": float(
            sum(order.total_amount for order in orders)
        ),
        "orders": []
    }

    for order in orders:
        data["orders"].append({
            "id": order.id,
            "total_amount": float(order.total_amount),
            "status": order.status,
            "created_at": order.created_at,
        })

    return JsonResponse(data)


@csrf_exempt
@admin_required
def admin_inventory_list(request):

    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET method allowed."},
            status=405
        )

    products = Product.objects.all().order_by("stock", "name")

    data = []

    for product in products:

        if product.stock == 0:
            stock_status = "Out of Stock"
        elif product.stock <= 5:
            stock_status = "Low Stock"
        else:
            stock_status = "In Stock"

        data.append({
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "stock": product.stock,
            "stock_status": stock_status,
            "is_active": product.is_active,
            "image": (
                request.build_absolute_uri(product.image.url)
                if product.image else None
            ),
        })

    return JsonResponse(data, safe=False)

@csrf_exempt
@admin_required
def admin_update_inventory(request, product_id):

    if request.method != "PATCH":
        return JsonResponse(
            {"error": "Only PATCH method allowed."},
            status=405
        )

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return JsonResponse(
            {"error": "Product not found."},
            status=404
        )

    try:
        data = json.loads(request.body)
        stock = data.get("stock")

        if stock is None:
            return JsonResponse(
                {"error": "Stock is required."},
                status=400
            )

        stock = int(stock)

        if stock < 0:
            return JsonResponse(
                {"error": "Stock cannot be negative."},
                status=400
            )

        product.stock = stock
        product.save()

        return JsonResponse({
            "message": "Stock updated successfully.",
            "id": product.id,
            "stock": product.stock
        })

    except (ValueError, TypeError):
        return JsonResponse(
            {"error": "Stock must be a valid number."},
            status=400
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data."},
            status=400
        )

@csrf_exempt
@admin_required
def admin_review_list(request):
    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET method allowed."},
            status=405
        )

    reviews = ProductReview.objects.select_related(
        "user",
        "product",
        "order_item"
    ).order_by("-created_at")

    data = []

    for review in reviews:
        data.append({
            "id": review.id,
            "customer": {
                "id": review.user.id,
                "username": review.user.username,
                "email": review.user.email,
            },
            "product": {
                "id": review.product.id,
                "name": review.product.name,
                "image": (
                    request.build_absolute_uri(review.product.image.url)
                    if review.product.image
                    else None
                ),
            },
            "rating": review.rating,
            "review": review.review,
            "created_at": review.created_at,
            "updated_at": review.updated_at,
        })

    return JsonResponse(data, safe=False)

@csrf_exempt
@admin_required
def admin_review_detail(request, review_id):
    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET method allowed."},
            status=405
        )

    try:
        review = ProductReview.objects.select_related(
            "user",
            "product",
            "order_item"
        ).get(id=review_id)

    except ProductReview.DoesNotExist:
        return JsonResponse(
            {"error": "Review not found."},
            status=404
        )

    data = {
        "id": review.id,

        "customer": {
            "id": review.user.id,
            "username": review.user.username,
            "email": review.user.email,
        },

        "product": {
            "id": review.product.id,
            "name": review.product.name,
            "image": (
                request.build_absolute_uri(review.product.image.url)
                if review.product.image
                else None
            ),
        },

        "rating": review.rating,
        "review": review.review,
        "created_at": review.created_at,
        "updated_at": review.updated_at,
    }

    return JsonResponse(data)


@csrf_exempt
@admin_required
def admin_feedback_list(request):
    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET method allowed."},
            status=405
        )

    feedbacks = ProductFeedback.objects.select_related(
        "user",
        "product",
        "order_item"
    ).order_by("-created_at")

    data = []

    for feedback in feedbacks:
        data.append({
            "id": feedback.id,

            "customer": {
                "id": feedback.user.id,
                "username": feedback.user.username,
                "email": feedback.user.email,
            },

            "product": {
                "id": feedback.product.id,
                "name": feedback.product.name,
                "image": (
                    request.build_absolute_uri(feedback.product.image.url)
                    if feedback.product.image
                    else None
                ),
            },

            "feedback": feedback.feedback,
            "admin_reply": feedback.admin_reply,
            "status": feedback.status,
            "created_at": feedback.created_at,
            "replied_at": feedback.replied_at,
        })

    return JsonResponse(data, safe=False)

@csrf_exempt
@admin_required
def admin_feedback_detail(request, feedback_id):
    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET method allowed."},
            status=405
        )

    try:
        feedback = ProductFeedback.objects.select_related(
            "user",
            "product",
            "order_item"
        ).get(id=feedback_id)

    except ProductFeedback.DoesNotExist:
        return JsonResponse(
            {"error": "Feedback not found."},
            status=404
        )

    data = {
        "id": feedback.id,

        "customer": {
            "id": feedback.user.id,
            "username": feedback.user.username,
            "email": feedback.user.email,
        },

        "product": {
            "id": feedback.product.id,
            "name": feedback.product.name,
            "image": (
                request.build_absolute_uri(feedback.product.image.url)
                if feedback.product.image
                else None
            ),
        },

        "feedback": feedback.feedback,
        "admin_reply": feedback.admin_reply,
        "status": feedback.status,
        "created_at": feedback.created_at,
        "replied_at": feedback.replied_at,
    }

    return JsonResponse(data)

@csrf_exempt
@admin_required
def admin_reply_feedback(request, feedback_id):
    if request.method != "PATCH":
        return JsonResponse(
            {"error": "Only PATCH method allowed."},
            status=405
        )

    try:
        feedback = ProductFeedback.objects.get(id=feedback_id)

    except ProductFeedback.DoesNotExist:
        return JsonResponse(
            {"error": "Feedback not found."},
            status=404
        )

    try:
        data = json.loads(request.body)

        admin_reply = data.get("admin_reply", "").strip()

        if not admin_reply:
            return JsonResponse(
                {"error": "Reply cannot be empty."},
                status=400
            )

        feedback.admin_reply = admin_reply
        feedback.status = "Replied"
        feedback.replied_at = timezone.now()
        feedback.save()

        return JsonResponse({
            "message": "Reply sent successfully.",
            "id": feedback.id,
            "admin_reply": feedback.admin_reply,
            "status": feedback.status,
            "replied_at": feedback.replied_at,
        })

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data."},
            status=400
        )

@csrf_exempt
@admin_required
def admin_update_feedback_status(request, feedback_id):
    if request.method != "PATCH":
        return JsonResponse(
            {"error": "Only PATCH method allowed."},
            status=405
        )

    try:
        feedback = ProductFeedback.objects.get(id=feedback_id)

    except ProductFeedback.DoesNotExist:
        return JsonResponse(
            {"error": "Feedback not found."},
            status=404
        )

    try:
        data = json.loads(request.body)

        new_status = data.get("status")

        valid_statuses = [
            choice[0]
            for choice in ProductFeedback.STATUS_CHOICES
        ]

        if new_status not in valid_statuses:
            return JsonResponse(
                {
                    "error": "Invalid feedback status.",
                    "valid_statuses": valid_statuses
                },
                status=400
            )

        feedback.status = new_status
        feedback.save()

        return JsonResponse({
            "message": "Feedback status updated successfully.",
            "id": feedback.id,
            "status": feedback.status,
        })

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data."},
            status=400
        )

@csrf_exempt
@admin_required
def admin_notification_list(request):
    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET method allowed."},
            status=405
        )

    notifications = Notification.objects.select_related(
        "user"
    ).order_by("-created_at")

    data = []

    for notification in notifications:
        data.append({
            "id": notification.id,

            "customer": {
                "id": notification.user.id,
                "username": notification.user.username,
                "email": notification.user.email,
            },

            "message": notification.message,
            "notification_type": notification.notification_type,
            "is_read": notification.is_read,
            "created_at": notification.created_at,
        })

    return JsonResponse(data, safe=False)

@csrf_exempt
@admin_required
def admin_create_notification(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST method allowed."},
            status=405
        )

    try:
        data = json.loads(request.body)

        user_id = data.get("user_id")
        send_to = data.get("send_to", "single")

        message = data.get("message", "").strip()

        notification_type = data.get(
            "notification_type",
            "General"
        ).strip()

        if not message:
            return JsonResponse(
                {"error": "Message cannot be empty."},
                status=400
            )

        if send_to == "all":

            customers = User.objects.filter(
                is_superuser=False,
                is_staff=False
            )

            if not customers.exists():
                return JsonResponse(
                    {"error": "No customers found."},
                    status=404
                )

            notifications = []

            for customer in customers:
                notification = Notification.objects.create(
                    user=customer,
                    message=message,
                    notification_type=notification_type
                )

                notifications.append({
                    "id": notification.id,
                    "user_id": customer.id,
                    "username": customer.username,
                    "email": customer.email,
                    "message": notification.message,
                    "notification_type":
                        notification.notification_type,
                    "is_read": notification.is_read,
                    "created_at": notification.created_at,
                })

            return JsonResponse({
                "message": "Notification sent to all customers.",
                "count": len(notifications),
                "notifications": notifications
            }, status=201)

        if not user_id:
            return JsonResponse(
                {"error": "Customer is required."},
                status=400
            )

        try:
            user = User.objects.get(
                id=user_id,
                is_superuser=False,
                is_staff=False
            )

        except User.DoesNotExist:
            return JsonResponse(
                {"error": "Customer not found."},
                status=404
            )

        notification = Notification.objects.create(
            user=user,
            message=message,
            notification_type=notification_type
        )

        return JsonResponse({
            "message": "Notification sent successfully.",
            "notification": {
                "id": notification.id,
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "message": notification.message,
                "notification_type":
                    notification.notification_type,
                "is_read": notification.is_read,
                "created_at": notification.created_at,
            }
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data."},
            status=400
        )

    
@csrf_exempt
@admin_required
def admin_notification_customers(request):
    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET method allowed."},
            status=405
        )

    customers = User.objects.filter(
        is_superuser=False,
        is_staff=False
    ).order_by("username")

    data = []

    for customer in customers:
        data.append({
            "id": customer.id,
            "username": customer.username,
            "email": customer.email,
        })

    return JsonResponse(data, safe=False)

@csrf_exempt
@admin_required
def admin_coupon_list(request):
    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET method allowed."},
            status=405
        )

    coupons = Coupon.objects.all().order_by("-created_at")

    data = []

    for coupon in coupons:
        data.append({
            "id": coupon.id,
            "code": coupon.code,
            "discount_percent": coupon.discount_percent,
            "active": coupon.active,
            "created_at": coupon.created_at,
        })

    return JsonResponse(data, safe=False)

@csrf_exempt
@admin_required
def admin_create_coupon(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST method allowed."},
            status=405
        )

    try:
        data = json.loads(request.body)

        code = data.get("code", "").strip().upper()
        discount_percent = data.get("discount_percent")

        if not code:
            return JsonResponse(
                {"error": "Coupon code is required."},
                status=400
            )

        if not discount_percent:
            return JsonResponse(
                {"error": "Discount percentage is required."},
                status=400
            )

        discount_percent = int(discount_percent)

        if discount_percent <= 0 or discount_percent > 100:
            return JsonResponse(
                {"error": "Discount must be between 1 and 100."},
                status=400
            )

        if Coupon.objects.filter(code=code).exists():
            return JsonResponse(
                {"error": "Coupon code already exists."},
                status=400
            )

        coupon = Coupon.objects.create(
            code=code,
            discount_percent=discount_percent
        )

        return JsonResponse({
            "message": "Coupon created successfully.",
            "coupon": {
                "id": coupon.id,
                "code": coupon.code,
                "discount_percent": coupon.discount_percent,
                "active": coupon.active,
                "created_at": coupon.created_at,
            }
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data."},
            status=400
        )

    except (ValueError, TypeError):
        return JsonResponse(
            {"error": "Discount must be a valid number."},
            status=400
        )

@csrf_exempt
@admin_required
def admin_update_coupon(request, coupon_id):
    if request.method != "PUT":
        return JsonResponse(
            {"error": "Only PUT method allowed."},
            status=405
        )

    try:
        coupon = Coupon.objects.get(id=coupon_id)

    except Coupon.DoesNotExist:
        return JsonResponse(
            {"error": "Coupon not found."},
            status=404
        )

    try:
        data = json.loads(request.body)

        code = data.get("code", "").strip().upper()
        discount_percent = data.get("discount_percent")

        if not code:
            return JsonResponse(
                {"error": "Coupon code is required."},
                status=400
            )

        if discount_percent is None:
            return JsonResponse(
                {"error": "Discount percentage is required."},
                status=400
            )

        discount_percent = int(discount_percent)

        if discount_percent <= 0 or discount_percent > 100:
            return JsonResponse(
                {"error": "Discount must be between 1 and 100."},
                status=400
            )

        if Coupon.objects.filter(code=code).exclude(id=coupon_id).exists():
            return JsonResponse(
                {"error": "Coupon code already exists."},
                status=400
            )

        coupon.code = code
        coupon.discount_percent = discount_percent
        coupon.save()

        return JsonResponse({
            "message": "Coupon updated successfully.",
            "id": coupon.id,
            "code": coupon.code,
            "discount_percent": coupon.discount_percent,
            "active": coupon.active,
        })

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data."},
            status=400
        )

    except (ValueError, TypeError):
        return JsonResponse(
            {"error": "Discount must be a valid number."},
            status=400
        )

@csrf_exempt
@admin_required
def admin_toggle_coupon_status(request, coupon_id):
    if request.method != "PATCH":
        return JsonResponse(
            {"error": "Only PATCH method allowed."},
            status=405
        )

    try:
        coupon = Coupon.objects.get(id=coupon_id)

    except Coupon.DoesNotExist:
        return JsonResponse(
            {"error": "Coupon not found."},
            status=404
        )

    coupon.active = not coupon.active
    coupon.save()

    return JsonResponse({
        "message": "Coupon status updated successfully.",
        "id": coupon.id,
        "active": coupon.active,
    })

@csrf_exempt
@admin_required
def admin_referrals(request):

    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET requests are allowed."},
            status=405
        )

    referrals = Referral.objects.select_related(
        "referrer",
        "referred_user",
        "first_order"
    ).order_by("-created_at")

    referral_data = []

    total_referrals = referrals.count()
    successful_referrals = referrals.filter(
        status="Successful"
    ).count()
    pending_referrals = referrals.filter(
        status="Pending"
    ).count()

    total_earnings = WalletTransaction.objects.filter(
        transaction_type="Credit",
        description__icontains="Referral"
    ).aggregate(
        total=Sum("amount")
    )["total"] or 0

    for referral in referrals:

        referral_transactions = WalletTransaction.objects.filter(
            user=referral.referrer,
            transaction_type="Credit",
            description__icontains="Referral",
            created_at__gte=referral.created_at
        )

        referral_earnings = referral_transactions.aggregate(
            total=Sum("amount")
        )["total"] or 0

        first_order_amount = None

        if referral.first_order:
            first_order_amount = str(
                referral.first_order.total_amount
            )

        referral_data.append({
            "id": referral.id,
            "referrer_id": referral.referrer.id,
            "referrer_username": referral.referrer.username,
            "referred_user_id": referral.referred_user.id,
            "referred_username": referral.referred_user.username,
            "referred_email": referral.referred_user.email,
            "referral_code": referral.referral_code,
            "status": referral.status,
            "first_order_id": (
                referral.first_order.id
                if referral.first_order
                else None
            ),
            "first_order_amount": first_order_amount,
            "first_bonus_credited": referral.first_bonus_credited,
            "referral_earnings": str(referral_earnings),
            "created_at": referral.created_at.isoformat()
        })

    return JsonResponse({
        "total_referrals": total_referrals,
        "successful_referrals": successful_referrals,
        "pending_referrals": pending_referrals,
        "total_earnings": str(total_earnings),
        "referrals": referral_data
    })


# =========================================================
# PRODUCT LIST
# =========================================================

def product_list(request):

    products = Product.objects.filter(is_active=True)

    data = []

    for product in products:

        summary = ProductReview.objects.filter(
            product=product
        ).aggregate(
            average_rating=Avg("rating"),
            rating_count=Count("id")
        )

        data.append({
            "id": product.id,
            "name": product.name,
            "price": float(product.price),
            "description": product.description,
            "image": (
                request.build_absolute_uri(product.image.url)
                if product.image
                else None
            ),
            "category": product.category,
            "stock": product.stock,

            "average_rating": round(
                summary["average_rating"] or 0,
                1
            ),
            "rating_count": summary["rating_count"],
        })

    return JsonResponse(data, safe=False)



# =========================================================
# PRODUCT DETAIL
# =========================================================
def product_detail(request, product_id):

    try:

        product = Product.objects.get(id=product_id,is_active=True)

    except Product.DoesNotExist:

        return JsonResponse(
            {"error": "Product not found"},
            status=404
        )

    summary = ProductReview.objects.filter(
        product=product
    ).aggregate(
        average_rating=Avg("rating"),
        rating_count=Count("id")
    )

    data = {
        "id": product.id,
        "name": product.name,
        "price": float(product.price),
        "description": product.description,
        "image": (
            request.build_absolute_uri(product.image.url)
            if product.image
            else None
        ),
        "category": product.category,
        "stock": product.stock,

        "average_rating": round(
            summary["average_rating"] or 0,
            1
        ),
        "rating_count": summary["rating_count"],
    }

    return JsonResponse(data)

# =========================================================
# CREATE ORDER
# =========================================================
@csrf_exempt
@token_auth_required
def create_order(request):

    if request.method != "POST":
        return JsonResponse(
            {
                "error": "Only POST method allowed"
            },
            status=405
        )

    try:

        # =================================================
        # READ REQUEST DATA
        # =================================================

        data = json.loads(request.body)

        user = request.user

        # =================================================
        # CHECK LOGIN
        # =================================================

        if not user.is_authenticated:
            return JsonResponse(
                {
                    "error": "User must be logged in"
                },
                status=401
            )

        # =================================================
        # GET CART ITEMS
        # =================================================

        items = data.get("items", [])

        if not items:
            return JsonResponse(
                {
                    "error": "Cart is empty"
                },
                status=400
            )

        # =================================================
        # GET COUPON
        # =================================================

        coupon_code = data.get(
            "coupon_code",
            ""
        ).strip().upper()

        discount_percent = 0

        if coupon_code == "SAVE10":
            discount_percent = 10

        elif coupon_code == "SAVE20":
            discount_percent = 20

        elif coupon_code == "SAVE30":
            discount_percent = 30

        elif coupon_code:
            return JsonResponse(
                {
                    "error": "Invalid coupon code."
                },
                status=400
            )

        # =================================================
        # CHECK STOCK + CALCULATE SUBTOTAL
        # =================================================

        total_amount = 0

        order_items_data = []

        for item in items:

            product = Product.objects.get(
                id=item["product_id"]
            )

            quantity = int(
                item["quantity"]
            )

            # =================================================
            # CHECK QUANTITY
            # =================================================

            if quantity <= 0:
                return JsonResponse(
                    {
                        "error": (
                            f"Invalid quantity for "
                            f"{product.name}."
                        )
                    },
                    status=400
                )

            # =================================================
            # CHECK STOCK
            # =================================================

            if quantity > product.stock:
                return JsonResponse(
                    {
                        "error": (
                            f"Only {product.stock} item(s) "
                            f"available for "
                            f"{product.name}."
                        )
                    },
                    status=400
                )

            # =================================================
            # CALCULATE SUBTOTAL
            # =================================================

            item_total = product.price * quantity

            total_amount += item_total

            # =================================================
            # SAVE ITEM INFORMATION
            # =================================================

            order_items_data.append(
                {
                    "product": product,
                    "quantity": quantity,
                    "price": product.price,
                }
            )

        # =================================================
        # DELIVERY PINCODE
        # =================================================

        pincode = data.get(
            "pincode",
            ""
        ).strip()

        if len(pincode) != 6 or not pincode.isdigit():
            return JsonResponse(
                {
                    "error": "Invalid pincode"
                },
                status=400
            )

        # =================================================
        # GET SELECTED ADDRESS
        # =================================================

        address_id = data.get("address_id")

        if not address_id:
            return JsonResponse(
                {
                    "error": "Please select an address"
                },
                status=400
            )

        try:

            address = Address.objects.get(
                id=address_id,
                user=user
            )

        except Address.DoesNotExist:

            return JsonResponse(
                {
                    "error": "Selected address not found"
                },
                status=404
            )

        # =================================================
        # CHECK ADDRESS PINCODE
        # =================================================

        if address.pincode != pincode:
            return JsonResponse(
                {
                    "error": (
                        "Selected address pincode does not "
                        "match the delivery pincode."
                    )
                },
                status=400
            )

        # =================================================
        # CHECK PRODUCT DELIVERY AVAILABILITY
        # =================================================

        non_deliverable_products = []

        for item in order_items_data:

            product = item["product"]

            deliverable = DeliveryPincode.objects.filter(
                product=product,
                pincode=pincode
            ).exists()

            if not deliverable:

                non_deliverable_products.append(
                    {
                        "product_id": product.id,
                        "product_name": product.name,
                    }
                )

        # =================================================
        # BLOCK ORDER IF PRODUCT NOT DELIVERABLE
        # =================================================

        if non_deliverable_products:

            return JsonResponse(
                {
                    "error": (
                        f"Some products are not "
                        f"deliverable to {pincode}"
                    ),
                    "pincode": pincode,
                    "non_deliverable_products": (
                        non_deliverable_products
                    ),
                },
                status=400
            )

        # =================================================
        # DELIVERY CHARGE
        # =================================================

        if pincode.startswith("500"):
            delivery = 40
        else:
            delivery = 140

        # =================================================
        # CALCULATE DISCOUNT
        # =================================================

        discount_amount = (
            total_amount *
            discount_percent /
            100
        )

        # =================================================
        # FINAL TOTAL
        # =================================================

        final_total = (
            total_amount
            - discount_amount
            + delivery
        )

        # =================================================
        # CREATE ORDER
        # =================================================

        order = Order.objects.create(
            user=user,

            subtotal=total_amount,
            discount=discount_amount,
            delivery_charge=delivery,
            coupon_code=coupon_code if coupon_code else None,
            total_amount=final_total,

            address_full_name=address.full_name,
            address_phone=address.phone,
            address_line1=address.address_line1,
            address_line2=address.address_line2,
            address_city=address.city,
            address_state=address.state,
            address_pincode=address.pincode,
            address_landmark=address.landmark,
            address_type=address.address_type
        )

        # =================================================
        # ORDER NOTIFICATION
        # =================================================

        Notification.objects.create(
            user=user,
            message=(
                f"🎉 Your order #{order.id} "
                f"has been placed successfully."
            ),
            notification_type="order"
        )

        # =================================================
        # CREATE ORDER ITEMS
        # REDUCE STOCK
        # =================================================

        for item in order_items_data:

            product = item["product"]

            quantity = item["quantity"]

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=item["price"]
            )

            product.stock -= quantity

            product.save()

        # =================================================
        # EMAIL ITEMS
        # =================================================

        email_items = []

        for item in order_items_data:

            product = item["product"]

            quantity = item["quantity"]

            price = item["price"]

            item_total = price * quantity

            email_items.append(
                f"""
Product  : {product.name}
Quantity : {quantity}
Price    : ₹{price:.2f}
Total    : ₹{item_total:.2f}
----------------------------------------
"""
            )

        # =================================================
        # EMAIL BODY
        # =================================================

        email_body = f"""
Hello {user.username},

🎉 THANK YOU FOR YOUR ORDER!

Your order has been placed successfully.

========================================
           ORDER CONFIRMATION
========================================

Order ID : #{order.id}
Status   : {order.status}

----------------------------------------
           DELIVERY ADDRESS
----------------------------------------

Name      : {address.full_name}
Phone     : {address.phone}

Address   : {address.address_line1}
"""

        if address.address_line2:
            email_body += f"""Address 2 : {address.address_line2}
"""

        email_body += f"""City      : {address.city}
State     : {address.state}
Pincode   : {address.pincode}
"""

        if address.landmark:
            email_body += f"""Landmark  : {address.landmark}
"""

        email_body += f"""
Address Type : {address.address_type.title()}

----------------------------------------
           PRODUCT DETAILS
----------------------------------------

{"".join(email_items)}

========================================
             PRICE DETAILS
========================================

Original Subtotal : ₹{total_amount:.2f}
Delivery          : ₹{delivery:.2f}
"""

        # =================================================
        # COUPON DETAILS
        # =================================================

        if coupon_code and discount_percent > 0:

            email_body += f"""
----------------------------------------
           COUPON DISCOUNT
----------------------------------------

Coupon Applied : {coupon_code}
Discount       : {discount_percent}%
You Saved      : ₹{discount_amount:.2f}

🎉 CONGRATULATIONS!

You saved ₹{discount_amount:.2f}
by applying coupon code {coupon_code}.
"""

        # =================================================
        # FINAL PRICE
        # =================================================

        original_total = total_amount

        email_body += f"""
========================================
             PAYMENT SUMMARY
========================================

Subtotal       : ₹{total_amount:.2f}
Discount       : -₹{discount_amount:.2f}
After Discount : ₹{total_amount - discount_amount:.2f}
Delivery       : +₹{delivery:.2f}

----------------------------------------
FINAL TOTAL    : ₹{final_total:.2f}
----------------------------------------

🎉 Your order has been confirmed!

Thank you for shopping with us. ❤️

Your MyStore Team
"""

        # =================================================
        # SEND EMAIL USING BREVO API
        # =================================================

        try:

            print(
                "STARTING BREVO API EMAIL",
                flush=True
            )

            print(
                "Recipient:",
                user.email,
                flush=True
            )

            print(
                "Order ID:",
                order.id,
                flush=True
            )

            brevo_api_key = os.environ.get(
                "BREVO_API_KEY"
            )

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
                        f"🎉 Order Confirmation - "
                        f"Order #{order.id}"
                    ),
                    "textContent": email_body,
                },
                timeout=10,
            )

            print(
                "BREVO API STATUS:",
                response.status_code,
                flush=True
            )

            print(
                "BREVO API RESPONSE:",
                response.text,
                flush=True
            )

            response.raise_for_status()

            print(
                "BREVO API EMAIL SENT SUCCESSFULLY",
                flush=True
            )

        except Exception as email_error:

            print(
                "BREVO API EMAIL ERROR:",
                repr(email_error),
                flush=True
            )

        # =================================================
        # SUCCESS RESPONSE
        # =================================================

        return JsonResponse(
            {
                "message": "Order created successfully",

                "order_id": order.id,

                "subtotal": float(
                    total_amount
                ),

                "coupon_code": (
                    coupon_code
                    if coupon_code
                    else None
                ),

                "discount_percent": (
                    discount_percent
                ),

                "discount_amount": float(
                    discount_amount
                ),

                "delivery": float(
                    delivery
                ),

                "original_total": float(
                    original_total
                ),

                "total_amount": float(
                    order.total_amount
                ),

                "status": order.status,

                "address": {
                    "full_name": order.address_full_name,
                    "phone": order.address_phone,
                    "address_line1": order.address_line1,
                    "address_line2": order.address_line2,
                    "city": order.address_city,
                    "state": order.address_state,
                    "pincode": order.address_pincode,
                    "landmark": order.address_landmark,
                    "address_type": order.address_type
                }
            },
            status=201
        )

    # =====================================================
    # PRODUCT NOT FOUND
    # =====================================================

    except Product.DoesNotExist:

        return JsonResponse(
            {
                "error": "Product not found"
            },
            status=404
        )

    # =====================================================
    # INVALID DATA
    # =====================================================

    except (ValueError, KeyError) as e:

        return JsonResponse(
            {
                "error": "Invalid order data.",
                "details": str(e)
            },
            status=400
        )

    # =====================================================
    # OTHER ERRORS
    # =====================================================

    except Exception as e:

        return JsonResponse(
            {
                "error": str(e)
            },
            status=400
        )

# =========================================================
# MY ORDERS
# =========================================================

@token_auth_required
def my_orders(request):

    if not request.user.is_authenticated:

        return JsonResponse(
            {"error": "User must be logged in"},
            status=401
        )

    orders = (
        Order.objects
        .filter(
            user=request.user
        )
        .prefetch_related(
            "items__product"
        )
        .order_by(
            "-created_at"
        )
    )

    data = []

    for order in orders:

        items = []

        for item in order.items.all():

            items.append(
                {
                    "id": item.id,

                    "product_id": item.product.id,

                    "name": item.product.name,

                    "quantity": item.quantity,

                    "price": float(
                        item.price
                    ),

                    "image": (
                        request.build_absolute_uri(
                            item.product.image.url
                        )
                        if item.product.image
                        else None
                    ),
                }
            )

        data.append(
            {
                "id": order.id,

                "total_amount": float(
                    order.total_amount
                ),

                "status": order.status,

                "created_at": order.created_at,

                "items": items,
            }
        )

    return JsonResponse(
        data,
        safe=False
    )

# =========================================================
# CURRENT USER
# =========================================================
@csrf_exempt
@token_auth_required
def current_user(request):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Not logged in"},
            status=401
        )

    # =========================
    # GET PROFILE
    # =========================

    if request.method == "GET":

        return JsonResponse({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
        })

    # =========================
    # UPDATE PROFILE
    # =========================

    if request.method == "PUT":

        try:
            data = json.loads(request.body)

        except json.JSONDecodeError:
            return JsonResponse(
                {"error": "Invalid JSON data"},
                status=400
            )

        username = data.get("username", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        # Username validation
        if not username:
            return JsonResponse(
                {"error": "Username is required."},
                status=400
            )

        # Email validation
        if not email:
            return JsonResponse(
                {"error": "Email is required."},
                status=400
            )

        # Check username already exists
        if User.objects.filter(
            username=username
        ).exclude(
            id=request.user.id
        ).exists():

            return JsonResponse(
                {"error": "Username already exists."},
                status=400
            )

        # Check email already exists
        if User.objects.filter(
            email=email
        ).exclude(
            id=request.user.id
        ).exists():

            return JsonResponse(
                {"error": "Email already exists."},
                status=400
            )

        # Update username and email
        request.user.username = username
        request.user.email = email

        # Update password only if entered
        if password:

            if len(password) < 8:
                return JsonResponse(
                    {
                        "error":
                        "Password must be at least 8 characters."
                    },
                    status=400
                )

            request.user.set_password(password)

        request.user.save()

        return JsonResponse({
            "message": "Profile updated successfully.",
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
            }
        })

    return JsonResponse(
        {"error": "Method not allowed"},
        status=405
    )

@csrf_exempt
@token_auth_required
def address_list(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)

    if request.method == "GET":
        addresses = Address.objects.filter(
            user=request.user
        ).order_by("-is_default", "-created_at")

        data = []

        for address in addresses:
            data.append({
                "id": address.id,
                "full_name": address.full_name,
                "phone": address.phone,
                "address_line1": address.address_line1,
                "address_line2": address.address_line2,
                "city": address.city,
                "state": address.state,
                "pincode": address.pincode,
                "landmark": address.landmark,
                "address_type": address.address_type,
                "is_default": address.is_default
            })

        return JsonResponse(data, safe=False)

    if request.method == "POST":
        data = json.loads(request.body)

        full_name = data.get("full_name", "").strip()
        phone = data.get("phone", "").strip()
        address_line1 = data.get("address_line1", "").strip()
        address_line2 = data.get("address_line2", "").strip()
        city = data.get("city", "").strip()
        state = data.get("state", "").strip()
        pincode = data.get("pincode", "").strip()
        landmark = data.get("landmark", "").strip()
        address_type = data.get("address_type", "home")
        is_default = data.get("is_default", False)

        if not full_name or not phone or not address_line1 or not city or not state or not pincode:
            return JsonResponse(
                {"error": "Please fill all required fields."},
                status=400
            )

        if not phone.isdigit() or len(phone) != 10:
            return JsonResponse(
                {"error": "Phone number must contain 10 digits."},
                status=400
            )

        if not pincode.isdigit() or len(pincode) != 6:
            return JsonResponse(
                {"error": "Pincode must contain 6 digits."},
                status=400
            )

        if address_type not in ["home", "work", "other"]:
            return JsonResponse(
                {"error": "Invalid address type."},
                status=400
            )

        if not Address.objects.filter(user=request.user).exists():
            is_default = True

        if is_default:
            Address.objects.filter(user=request.user).update(is_default=False)

        address = Address.objects.create(
            user=request.user,
            full_name=full_name,
            phone=phone,
            address_line1=address_line1,
            address_line2=address_line2,
            city=city,
            state=state,
            pincode=pincode,
            landmark=landmark,
            address_type=address_type,
            is_default=is_default
        )

        return JsonResponse({
            "message": "Address added successfully.",
            "address": {
                "id": address.id,
                "full_name": address.full_name,
                "phone": address.phone,
                "address_line1": address.address_line1,
                "address_line2": address.address_line2,
                "city": address.city,
                "state": address.state,
                "pincode": address.pincode,
                "landmark": address.landmark,
                "address_type": address.address_type,
                "is_default": address.is_default
            }
        }, status=201)

    return JsonResponse({"error": "Method not allowed."}, status=405)


@csrf_exempt
@token_auth_required
def address_detail(request, address_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)

    try:
        address = Address.objects.get(
            id=address_id,
            user=request.user
        )
    except Address.DoesNotExist:
        return JsonResponse({"error": "Address not found."}, status=404)

    if request.method in ["PUT", "PATCH"]:
        data = json.loads(request.body)

        if "full_name" in data:
            address.full_name = data["full_name"].strip()

        if "phone" in data:
            phone = data["phone"].strip()

            if not phone.isdigit() or len(phone) != 10:
                return JsonResponse(
                    {"error": "Phone number must contain 10 digits."},
                    status=400
                )

            address.phone = phone

        if "address_line1" in data:
            address.address_line1 = data["address_line1"].strip()

        if "address_line2" in data:
            address.address_line2 = data["address_line2"].strip()

        if "city" in data:
            address.city = data["city"].strip()

        if "state" in data:
            address.state = data["state"].strip()

        if "pincode" in data:
            pincode = data["pincode"].strip()

            if not pincode.isdigit() or len(pincode) != 6:
                return JsonResponse(
                    {"error": "Pincode must contain 6 digits."},
                    status=400
                )

            address.pincode = pincode

        if "landmark" in data:
            address.landmark = data["landmark"].strip()

        if "address_type" in data:
            if data["address_type"] not in ["home", "work", "other"]:
                return JsonResponse(
                    {"error": "Invalid address type."},
                    status=400
                )

            address.address_type = data["address_type"]

        if data.get("is_default") is True:
            Address.objects.filter(
                user=request.user
            ).exclude(id=address.id).update(is_default=False)

            address.is_default = True

        address.save()

        return JsonResponse({
            "message": "Address updated successfully."
        })

    if request.method == "DELETE":
        was_default = address.is_default
        address.delete()

        if was_default:
            next_address = Address.objects.filter(
                user=request.user
            ).order_by("-created_at").first()

            if next_address:
                next_address.is_default = True
                next_address.save()

        return JsonResponse({
            "message": "Address deleted successfully."
        })

    return JsonResponse({"error": "Method not allowed."}, status=405)

# =========================================================
# ORDER DETAIL
# =========================================================

@token_auth_required
def order_detail(request, order_id):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "User must be logged in"},
            status=401
        )

    try:

        order = Order.objects.get(
            id=order_id,
            user=request.user
        )

    except Order.DoesNotExist:

        return JsonResponse(
            {"error": "Order not found"},
            status=404
        )

    items = OrderItem.objects.filter(
        order=order
    )

    order_items = []

    for item in items:

        item_total = (
            item.price * item.quantity
        )

        order_items.append({

            "id": item.id,

            "product_id": item.product.id,

            "product_name": item.product.name,

            "quantity": item.quantity,

            "price": float(item.price),

            "item_total": float(item_total),

            "image": (
                request.build_absolute_uri(
                    item.product.image.url
                )
                if item.product.image
                else None
            ),
        })

    return JsonResponse({

        "id": order.id,

        "status": order.status,

        "created_at": order.created_at,

        "subtotal": float(
            order.subtotal
        ),

        "discount": float(
            order.discount
        ),

        "delivery_charge": float(
            order.delivery_charge
        ),

        "coupon_code": (
            order.coupon_code
            if order.coupon_code
            else None
        ),

        "total_amount": float(
            order.total_amount
        ),

        "address": {

            "full_name": order.address_full_name,

            "phone": order.address_phone,

            "address_line1": order.address_line1,

            "address_line2": order.address_line2,

            "city": order.address_city,

            "state": order.address_state,

            "pincode": order.address_pincode,

            "landmark": order.address_landmark,

            "address_type": order.address_type,

        },

        "items": order_items,

    })
# =========================================================
# PRODUCT FEEDBACK
# =========================================================

@csrf_exempt
@token_auth_required
def submit_feedback(request, order_item_id):

    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST method allowed"},
            status=405
        )

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "User must be logged in"},
            status=401
        )

    try:
        # -------------------------------------------------
        # GET ORDER ITEM
        # -------------------------------------------------

        order_item = OrderItem.objects.select_related(
            "order",
            "product"
        ).get(
            id=order_item_id,
            order__user=request.user
        )

    except OrderItem.DoesNotExist:
        return JsonResponse(
            {"error": "Order item not found"},
            status=404
        )

    # -------------------------------------------------
    # ONLY DELIVERED ORDERS CAN GIVE FEEDBACK
    # -------------------------------------------------

    if order_item.order.status != "Delivered":
        return JsonResponse(
            {
                "error": (
                    "You can give feedback only after "
                    "your order has been delivered."
                )
            },
            status=400
        )

    # -------------------------------------------------
    # READ REQUEST DATA
    # -------------------------------------------------

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data"},
            status=400
        )

    feedback_text = data.get(
        "feedback",
        ""
    ).strip()

    # -------------------------------------------------
    # VALIDATE FEEDBACK
    # -------------------------------------------------

    if not feedback_text:
        return JsonResponse(
            {"error": "Please enter your feedback."},
            status=400
        )

    if len(feedback_text) > 2000:
        return JsonResponse(
            {"error": "Feedback cannot exceed 2000 characters."},
            status=400
        )

    # -------------------------------------------------
    # CREATE FEEDBACK
    # -------------------------------------------------

    feedback = ProductFeedback.objects.create(
        order_item=order_item,
        user=request.user,
        product=order_item.product,
        feedback=feedback_text,
        status="Pending"
    )

    # -------------------------------------------------
    # SUCCESS RESPONSE
    # -------------------------------------------------

    return JsonResponse(
        {
            "message": "Feedback submitted successfully.",
            "feedback": {
                "id": feedback.id,
                "product_id": feedback.product.id,
                "product_name": feedback.product.name,
                "feedback": feedback.feedback,
                "admin_reply": feedback.admin_reply,
                "status": feedback.status,
                "created_at": feedback.created_at,
            }
        },
        status=201
    )

@token_auth_required
def get_feedback(request, order_item_id):

    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET method allowed"},
            status=405
        )

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "User must be logged in"},
            status=401
        )

    try:
        order_item = OrderItem.objects.select_related(
            "order",
            "product"
        ).get(
            id=order_item_id,
            order__user=request.user
        )

    except OrderItem.DoesNotExist:
        return JsonResponse(
            {"error": "Order item not found"},
            status=404
        )

    feedbacks = ProductFeedback.objects.filter(
        order_item=order_item
    ).order_by("-created_at")

    return JsonResponse({
        "order_item_id": order_item.id,
        "product_id": order_item.product.id,
        "product_name": order_item.product.name,

        "feedbacks": [
            {
                "id": feedback.id,
                "feedback": feedback.feedback,
                "admin_reply": feedback.admin_reply,
                "status": feedback.status,
                "created_at": feedback.created_at,
                "replied_at": feedback.replied_at,
            }
            for feedback in feedbacks
        ]
    })
@csrf_exempt
@token_auth_required
def create_support_ticket(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST method allowed"},
            status=405
        )

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "User must be logged in"},
            status=401
        )

    try:
        data = json.loads(request.body)

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data"},
            status=400
        )

    category = data.get("category", "").strip()
    subject = data.get("subject", "").strip()
    description = data.get("description", "").strip()
    order_id = data.get("order_id")

    # =========================
    # VALID CATEGORIES
    # =========================

    valid_categories = [
        "Order",
        "Payment",
        "Delivery",
        "Product",
        "Refund",
        "Account",
        "Other",
    ]

    if category not in valid_categories:
        return JsonResponse(
            {"error": "Please select a valid category."},
            status=400
        )

    # =========================
    # VALIDATE SUBJECT
    # =========================

    # if not subject:
    #     return JsonResponse(
    #         {"error": "Subject is required."},
    #         status=400
    #     )

    if len(subject) > 200:
        return JsonResponse(
            {"error": "Subject cannot exceed 200 characters."},
            status=400
        )

    # =========================
    # VALIDATE DESCRIPTION
    # =========================

    if not description:
        return JsonResponse(
            {"error": "Description is required."},
            status=400
        )

    if len(description) > 5000:
        return JsonResponse(
            {"error": "Description cannot exceed 5000 characters."},
            status=400
        )

    # =========================
    # OPTIONAL ORDER
    # =========================

    order = None

    if order_id:

        try:
            order = Order.objects.get(
                id=order_id,
                user=request.user
            )

        except Order.DoesNotExist:
            return JsonResponse(
                {"error": "Order not found."},
                status=404
            )

    # =========================
    # CREATE TICKET
    # =========================

    ticket = SupportTicket.objects.create(
        user=request.user,
        order=order,
        category=category,
        subject=subject,
        description=description,
        status="Open"
    )

    # =========================
    # CREATE FIRST MESSAGE
    # =========================

    SupportMessage.objects.create(
        ticket=ticket,
        sender="Customer",
        message=description
    )

    # =========================
    # RESPONSE
    # =========================

    return JsonResponse(
        {
            "message": "Support ticket created successfully.",

            "ticket": {
                "id": ticket.id,
                "category": ticket.category,
                "subject": ticket.subject,
                "description": ticket.description,
                "status": ticket.status,
                "order_id": ticket.order.id if ticket.order else None,
                "created_at": ticket.created_at,
            }
        },
        status=201
    )


@token_auth_required
def my_support_tickets(request):

    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET method allowed"},
            status=405
        )

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "User must be logged in"},
            status=401
        )

    tickets = SupportTicket.objects.filter(
        user=request.user
    ).select_related("order").order_by("-created_at")

    return JsonResponse({
        "tickets": [
            {
                "id": ticket.id,
                "category": ticket.category,
                "subject": ticket.subject,
                "description": ticket.description,
                "status": ticket.status,
                "admin_reply": ticket.admin_reply,
                "order_id": ticket.order.id if ticket.order else None,
                "created_at": ticket.created_at,
                "updated_at": ticket.updated_at,
                "resolved_at": ticket.resolved_at,
            }
            for ticket in tickets
        ]
    })

@token_auth_required
def support_ticket_detail(request, ticket_id):

    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET method allowed"},
            status=405
        )

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "User must be logged in"},
            status=401
        )

    try:
        ticket = SupportTicket.objects.select_related(
            "order"
        ).prefetch_related(
            "messages"
        ).get(
            id=ticket_id,
            user=request.user
        )

    except SupportTicket.DoesNotExist:
        return JsonResponse(
            {"error": "Support ticket not found."},
            status=404
        )

    return JsonResponse({
        "ticket": {
            "id": ticket.id,
            "category": ticket.category,
            "subject": ticket.subject,
            "description": ticket.description,
            "status": ticket.status,
            "order_id": ticket.order.id if ticket.order else None,
            "created_at": ticket.created_at,
            "updated_at": ticket.updated_at,
            "resolved_at": ticket.resolved_at,

            "messages": [
                {
                    "id": message.id,
                    "sender": message.sender,
                    "message": message.message,
                    "created_at": message.created_at,
                }
                for message in ticket.messages.all().order_by("created_at")
            ],
        }
    })


@csrf_exempt
@token_auth_required
def send_support_message(request, ticket_id):

    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST method allowed"},
            status=405
        )

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "User must be logged in"},
            status=401
        )

    try:
        ticket = SupportTicket.objects.get(
            id=ticket_id,
            user=request.user
        )

    except SupportTicket.DoesNotExist:
        return JsonResponse(
            {"error": "Support ticket not found."},
            status=404
        )

    # Customer cannot reply to a closed ticket
    if ticket.status == "Closed":
        return JsonResponse(
            {"error": "This support ticket is closed."},
            status=400
        )

    try:
        data = json.loads(request.body)

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data"},
            status=400
        )

    message_text = data.get("message", "").strip()

    if not message_text:
        return JsonResponse(
            {"error": "Please enter a message."},
            status=400
        )

    if len(message_text) > 5000:
        return JsonResponse(
            {"error": "Message cannot exceed 5000 characters."},
            status=400
        )

    message = SupportMessage.objects.create(
        ticket=ticket,
        sender="Customer",
        message=message_text
    )

    # If the ticket was resolved and customer replies,
    # reopen it so support can continue the conversation.
    if ticket.status == "Resolved":
        ticket.status = "Open"
        ticket.save(update_fields=["status", "updated_at"])

    return JsonResponse(
        {
            "message": "Message sent successfully.",
            "support_message": {
                "id": message.id,
                "sender": message.sender,
                "message": message.message,
                "created_at": message.created_at,
            }
        },
        status=201
    )

# =========================================================
# CANCEL ORDER
# =========================================================
@csrf_exempt
@token_auth_required
def cancel_order(request, order_id):

    if request.method != "POST":

        return JsonResponse(
            {"error": "Only POST method allowed"},
            status=405
        )

    if not request.user.is_authenticated:

        return JsonResponse(
            {"error": "User must be logged in"},
            status=401
        )

    try:

        # Only get the user's own order

        order = Order.objects.get(
            id=order_id,
            user=request.user
        )

    except Order.DoesNotExist:

        return JsonResponse(
            {"error": "Order not found"},
            status=404
        )

    # -------------------------------------------------
    # ONLY PENDING ORDERS CAN BE CANCELLED
    # -------------------------------------------------

    if order.status != "Pending":

        return JsonResponse(
            {
                "error": (
                    f"Order cannot be cancelled because "
                    f"its status is {order.status}."
                )
            },
            status=400
        )

    # -------------------------------------------------
    # RESTORE STOCK
    # -------------------------------------------------

    items = OrderItem.objects.filter(
        order=order
    )

    for item in items:

        product = item.product

        product.stock += item.quantity

        product.save()

    # -------------------------------------------------
    # CHANGE ORDER STATUS
    # -------------------------------------------------

    order.status = "Cancelled"

    order.save()

    # -------------------------------------------------
    # RESPONSE
    # -------------------------------------------------

    return JsonResponse({

        "message": "Order cancelled successfully",

        "order_id": order.id,

        "status": order.status
    })

@csrf_exempt
def apply_coupon(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST method allowed"},
            status=405
        )

    try:

        data = json.loads(request.body)

        code = data.get("code", "").strip().upper()

        if not code:
            return JsonResponse(
                {"error": "Please enter a coupon code."},
                status=400
            )

        try:
            coupon = Coupon.objects.get(
                code=code,
                active=True
            )

        except Coupon.DoesNotExist:

            return JsonResponse(
                {"error": "Invalid or inactive coupon."},
                status=400
            )

        return JsonResponse({
            "message": "Coupon applied successfully",
            "code": coupon.code,
            "discount_percent": coupon.discount_percent,
        })

    except (ValueError, KeyError):

        return JsonResponse(
            {"error": "Invalid coupon data."},
            status=400
        )

    except Exception as e:

        return JsonResponse(
            {"error": str(e)},
            status=400
        )
@csrf_exempt
def send_otp(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "POST method required"},
            status=405
        )

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

    # Check email format

    if not email.endswith("@gmail.com"):
        return JsonResponse(
            {
                "error": "Please use a valid Gmail address"
            },
            status=400
        )

    # Check existing email

    if User.objects.filter(
        email=email
    ).exists():

        return JsonResponse(
            {
                "error": "Email already registered"
            },
            status=400
        )

    # Generate OTP

    otp = str(
        random.randint(
            100000,
            999999
        )
    )

    # Remove old OTP for this email

    EmailOTP.objects.filter(
        email=email
    ).delete()

    # Save pending registration

    EmailOTP.objects.create(
        email=email,
        username=username,
        password=password,
        otp=otp
    )

    # =================================================
    # SEND OTP USING BREVO API
    # =================================================

    try:

        print(
            "STARTING BREVO OTP EMAIL",
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
                    "MyStore Email Verification OTP"
                ),

                "textContent": otp_message,
            },

            timeout=10,
        )

        print(
            "BREVO OTP API STATUS:",
            response.status_code,
            flush=True
        )

        print(
            "BREVO OTP API RESPONSE:",
            response.text,
            flush=True
        )

        response.raise_for_status()

        print(
            "BREVO OTP EMAIL SENT SUCCESSFULLY",
            flush=True
        )

    except Exception as email_error:

        print(
            "BREVO OTP EMAIL ERROR:",
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
@csrf_exempt
@token_auth_required
def add_to_wishlist(request, product_id):
    
    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please login to add items to wishlist"},
            status=401
        )

    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST method allowed"},
            status=405
        )

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return JsonResponse(
            {"error": "Product not found"},
            status=404
        )

    wishlist_item, created = Wishlist.objects.get_or_create(
        user=request.user,
        product=product
    )

    return JsonResponse({
        "message": (
            "Product added to wishlist"
            if created
            else "Product already in wishlist"
        ),
        "wishlisted": True
    })


@token_auth_required
def get_wishlist(request):
    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please login"},
            status=401
        )

    wishlist_items = Wishlist.objects.filter(
        user=request.user
    ).select_related("product")

    data = []

    for item in wishlist_items:
        product = item.product

        data.append({
            "wishlist_id": item.id,
            "id": product.id,
            "name": product.name,
            "price": float(product.price),
            "description": product.description,
            "image": (
                request.build_absolute_uri(product.image.url)
                if product.image
                else None
            ),
            "category": product.category,
            "stock": product.stock,
        })

    return JsonResponse(data, safe=False)


@csrf_exempt
@token_auth_required
def remove_from_wishlist(request, product_id):
    
    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please login"},
            status=401
        )

    if request.method != "DELETE":
        return JsonResponse(
            {"error": "Only DELETE method allowed"},
            status=405
        )

    deleted, _ = Wishlist.objects.filter(
        user=request.user,
        product_id=product_id
    ).delete()

    if deleted == 0:
        return JsonResponse(
            {"error": "Product is not in wishlist"},
            status=404
        )

    return JsonResponse({
        "message": "Product removed from wishlist",
        "wishlisted": False
    })

# =========================
# NOTIFICATIONS
# =========================

@token_auth_required
def get_notifications(request):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please login"},
            status=401
        )

    notifications = Notification.objects.filter(
        user=request.user
    ).order_by("-created_at")

    data = []

    for notification in notifications:

        data.append({
            "id": notification.id,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat(),
        })

    unread_count = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).count()

    return JsonResponse({
        "notifications": data,
        "unread_count": unread_count
    })

@csrf_exempt
@token_auth_required
def mark_notification_read(request, notification_id):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please login"},
            status=401
        )

    if request.method != "PATCH":
        return JsonResponse(
            {"error": "Only PATCH requests are allowed."},
            status=405
        )

    try:

        notification = Notification.objects.get(
            id=notification_id,
            user=request.user
        )

    except Notification.DoesNotExist:

        return JsonResponse(
            {"error": "Notification not found"},
            status=404
        )

    notification.is_read = True
    notification.save()

    unread_count = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).count()

    return JsonResponse({
        "message": "Notification marked as read",
        "unread_count": unread_count
    })


@csrf_exempt
@token_auth_required
def mark_all_notifications_read(request):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please login"},
            status=401
        )

    if request.method != "PATCH":
        return JsonResponse(
            {"error": "Only PATCH requests are allowed."},
            status=405
        )

    Notification.objects.filter(
        user=request.user,
        is_read=False
    ).update(
        is_read=True
    )

    return JsonResponse({
        "message": "All notifications marked as read",
        "unread_count": 0
    })

    
@csrf_exempt
@token_auth_required
def add_product_review(request, product_id, order_item_id):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please login"},
            status=401
        )

    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST method allowed"},
            status=405
        )

    try:
        order_item = OrderItem.objects.select_related(
            "order",
            "product"
        ).get(
            id=order_item_id,
            product_id=product_id,
            order__user=request.user
        )

    except OrderItem.DoesNotExist:
        return JsonResponse(
            {"error": "You did not purchase this product"},
            status=403
        )

    # Only delivered orders can be reviewed
    if order_item.order.status != "Delivered":
        return JsonResponse(
            {"error": "You can review the product only after delivery"},
            status=400
        )

    # Prevent duplicate review for the same order item
    # if ProductReview.objects.filter(
    #     user=request.user,
    #     order_item=order_item
    # ).exists():

    #     return JsonResponse(
    #         {"error": "You have already reviewed this product for this order"},
    #         status=400
    #     )

    data = json.loads(request.body)

    rating = data.get("rating")
    review = data.get("review", "").strip()

    if not rating:
        return JsonResponse(
            {"error": "Rating is required"},
            status=400
        )

    try:
        rating = int(rating)
    except (ValueError, TypeError):
        return JsonResponse(
            {"error": "Rating must be between 1 and 5"},
            status=400
        )

    if rating < 1 or rating > 5:
        return JsonResponse(
            {"error": "Rating must be between 1 and 5"},
            status=400
        )

    if not review:
        return JsonResponse(
            {"error": "Review cannot be empty"},
            status=400
        )

    product_review = ProductReview.objects.create(
        user=request.user,
        product=order_item.product,
        order_item=order_item,
        rating=rating,
        review=review
    )

    return JsonResponse({
        "message": "Rating and review submitted successfully",
        "review": {
            "id": product_review.id,
            "product_id": product_review.product.id,
            "rating": product_review.rating,
            "review": product_review.review,
            "username": request.user.username,
            "created_at": product_review.created_at.isoformat(),
        }
    }, status=201)

def get_product_reviews(request, product_id):

    try:
        product = Product.objects.get(id=product_id)

    except Product.DoesNotExist:
        return JsonResponse(
            {"error": "Product not found"},
            status=404
        )

    summary = ProductReview.objects.filter(
        product=product
    ).aggregate(
        average_rating=Avg("rating"),
        rating_count=Count("id")
    )

    reviews = ProductReview.objects.filter(
        product=product
    ).select_related(
        "user"
    ).order_by(
        "-created_at"
    )

    review_data = []

    for item in reviews:

        review_data.append({
            "id": item.id,
            "username": item.user.username,
            "rating": item.rating,
            "review": item.review,
            "created_at": item.created_at.isoformat(),
        })

    return JsonResponse({
        "product_id": product.id,
        "product_name": product.name,
        "average_rating": round(
            summary["average_rating"] or 0,
            1
        ),
        "rating_count": summary["rating_count"],
        "reviews": review_data
    })

@token_auth_required
def support_dashboard_summary(request):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please login"},
            status=401
        )

    if not request.user.is_staff:
        return JsonResponse(
            {"error": "Support access required"},
            status=403
        )

    total_tickets = SupportTicket.objects.count()

    open_tickets = SupportTicket.objects.filter(
        status="Open"
    ).count()

    in_progress_tickets = SupportTicket.objects.filter(
        status="In Progress"
    ).count()

    resolved_tickets = SupportTicket.objects.filter(
        status="Resolved"
    ).count()

    closed_tickets = SupportTicket.objects.filter(
        status="Closed"
    ).count()

    categories = {}

    for category, label in SupportTicket.CATEGORY_CHOICES:
        categories[category] = SupportTicket.objects.filter(
            category=category
        ).count()

    return JsonResponse({
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "in_progress_tickets": in_progress_tickets,
        "resolved_tickets": resolved_tickets,
        "closed_tickets": closed_tickets,
        "categories": categories
    })

@token_auth_required
def support_dashboard_tickets(request):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please login"},
            status=401
        )

    if not request.user.is_staff:
        return JsonResponse(
            {"error": "Support access required"},
            status=403
        )

    category = request.GET.get("category")
    status = request.GET.get("status")

    tickets = SupportTicket.objects.select_related(
        "user",
        "order"
    ).prefetch_related(
        "messages"
    ).order_by("-created_at")

    if category:
        tickets = tickets.filter(category=category)

    if status:
        tickets = tickets.filter(status=status)

    ticket_data = []

    for ticket in tickets:

        ticket_data.append({
            "id": ticket.id,
            "customer_username": ticket.user.username,
            "customer_email": ticket.user.email,
            "category": ticket.category,
            "subject": ticket.subject,
            "description": ticket.description,
            "status": ticket.status,
            "admin_reply": ticket.admin_reply,
            "order_id": ticket.order.id if ticket.order else None,
            "created_at": ticket.created_at.isoformat(),
            "updated_at": ticket.updated_at.isoformat(),
            "resolved_at": (
                ticket.resolved_at.isoformat()
                if ticket.resolved_at
                else None
            ),
        })

    return JsonResponse({
        "tickets": ticket_data
    })

# =========================
# SUPPORT TICKET DETAIL
# =========================

@token_auth_required
def support_dashboard_ticket_detail(request, ticket_id):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please login"},
            status=401
        )

    if not request.user.is_staff:
        return JsonResponse(
            {"error": "Support access required"},
            status=403
        )

    try:
        ticket = SupportTicket.objects.select_related(
            "user",
            "order"
        ).prefetch_related(
            "messages"
        ).get(id=ticket_id)

    except SupportTicket.DoesNotExist:
        return JsonResponse(
            {"error": "Ticket not found"},
            status=404
        )

    messages = []

    for message in ticket.messages.all():
        messages.append({
            "id": message.id,
            "sender": message.sender,
            "message": message.message,
            "created_at": message.created_at.isoformat(),
        })

    return JsonResponse({
        "ticket": {
            "id": ticket.id,
            "customer_username": ticket.user.username,
            "customer_email": ticket.user.email,
            "category": ticket.category,
            "subject": ticket.subject,
            "description": ticket.description,
            "status": ticket.status,
            "admin_reply": ticket.admin_reply,
            "order_id": ticket.order.id if ticket.order else None,
            "created_at": ticket.created_at.isoformat(),
            "updated_at": ticket.updated_at.isoformat(),
            "resolved_at": (
                ticket.resolved_at.isoformat()
                if ticket.resolved_at
                else None
            ),
        },
        "messages": messages
    })

# =========================
# SUPPORT REPLY
# =========================

@csrf_exempt
@token_auth_required
def support_dashboard_reply(request, ticket_id):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please login"},
            status=401
        )

    if not request.user.is_staff:
        return JsonResponse(
            {"error": "Support access required"},
            status=403
        )

    if request.method != "POST":
        return JsonResponse(
            {"error": "POST method required"},
            status=405
        )

    try:
        ticket = SupportTicket.objects.get(
            id=ticket_id
        )

    except SupportTicket.DoesNotExist:
        return JsonResponse(
            {"error": "Ticket not found"},
            status=404
        )

    if ticket.status == "Closed":
        return JsonResponse(
            {"error": "Closed tickets cannot receive replies"},
            status=400
        )

    data = json.loads(request.body)

    message_text = data.get("message", "").strip()

    if not message_text:
        return JsonResponse(
            {"error": "Reply message is required"},
            status=400
        )

    SupportMessage.objects.create(
        ticket=ticket,
        sender="Admin",
        message=message_text
    )

    ticket.admin_reply = message_text

    if ticket.status == "Open":
        ticket.status = "In Progress"

    ticket.save()

    Notification.objects.create(
        user=ticket.user,
        message=f"Support replied to your ticket #{ticket.id}.",
        notification_type="support"
    )

    return JsonResponse({
        "message": "Reply sent successfully",
        "ticket_status": ticket.status
    })

# =========================
# UPDATE SUPPORT TICKET STATUS
# =========================

@csrf_exempt
@token_auth_required
def support_dashboard_update_status(request, ticket_id):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please login"},
            status=401
        )

    if not request.user.is_staff:
        return JsonResponse(
            {"error": "Support access required"},
            status=403
        )

    if request.method != "PATCH":
        return JsonResponse(
            {"error": "PATCH method required"},
            status=405
        )

    try:
        ticket = SupportTicket.objects.get(
            id=ticket_id
        )

    except SupportTicket.DoesNotExist:
        return JsonResponse(
            {"error": "Ticket not found"},
            status=404
        )

    data = json.loads(request.body)

    new_status = data.get("status")

    valid_statuses = [
        "Open",
        "In Progress",
        "Resolved",
        "Closed"
    ]

    if new_status not in valid_statuses:
        return JsonResponse(
            {"error": "Invalid status"},
            status=400
        )

    ticket.status = new_status

    if new_status == "Resolved":
        ticket.resolved_at = timezone.now()

    elif new_status != "Resolved":
        ticket.resolved_at = None

    ticket.save()

    Notification.objects.create(
        user=ticket.user,
        message=f"Your support ticket #{ticket.id} status is now {new_status}.",
        notification_type="support"
    )

    return JsonResponse({
        "message": "Ticket status updated successfully",
        "status": ticket.status,
        "resolved_at": (
            ticket.resolved_at.isoformat()
            if ticket.resolved_at
            else None
        )
    })


@token_auth_required
def check_delivery(request):
    if request.method != "GET":
        return JsonResponse(
            {"error": "GET method required"},
            status=405
        )

    pincode = request.GET.get("pincode", "").strip()

    if not pincode:
        return JsonResponse(
            {"error": "Pincode is required"},
            status=400
        )

    if not pincode.isdigit() or len(pincode) != 6:
        return JsonResponse(
            {"error": "Enter a valid 6-digit pincode"},
            status=400
        )

    products = Product.objects.all()

    delivery_data = []

    for product in products:
        deliverable = product.delivery_pincodes.filter(
            pincode=pincode
        ).exists()

        delivery_data.append({
            "product_id": product.id,
            "deliverable": deliverable
        })

    return JsonResponse({
        "pincode": pincode,
        "products": delivery_data
    })

@csrf_exempt
@token_auth_required
def get_wallet(request):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please login"},
            status=401
        )

    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET requests are allowed."},
            status=405
        )

    wallet, created = Wallet.objects.get_or_create(
        user=request.user
    )

    transactions = WalletTransaction.objects.filter(
        user=request.user
    )

    total_credits = transactions.filter(
        transaction_type="Credit"
    ).aggregate(
        total=Sum("amount")
    )["total"] or 0

    total_debits = transactions.filter(
        transaction_type="Debit"
    ).aggregate(
        total=Sum("amount")
    )["total"] or 0

    return JsonResponse({
        "balance": str(wallet.balance),
        "total_credits": str(total_credits),
        "total_debits": str(total_debits)
    })


@csrf_exempt
@token_auth_required
def get_wallet_transactions(request):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please login"},
            status=401
        )

    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET requests are allowed."},
            status=405
        )

    transactions = WalletTransaction.objects.filter(
        user=request.user
    ).order_by("-created_at")

    transaction_data = []

    for transaction_item in transactions:
        transaction_data.append({
            "id": transaction_item.id,
            "amount": str(transaction_item.amount),
            "transaction_type": transaction_item.transaction_type,
            "description": transaction_item.description,
            "order_id": transaction_item.order.id
            if transaction_item.order
            else None,
            "created_at": transaction_item.created_at.isoformat()
        })

    return JsonResponse({
        "transactions": transaction_data
    })

@csrf_exempt
@token_auth_required
def get_referral_details(request):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please login"},
            status=401
        )

    if request.method != "GET":
        return JsonResponse(
            {"error": "Only GET requests are allowed."},
            status=405
        )

    profile, created = UserProfile.objects.get_or_create(
        user=request.user
    )

    referrals = Referral.objects.filter(
        referrer=request.user
    ).select_related("referred_user", "first_order")

    total_referrals = referrals.count()

    successful_referrals = referrals.filter(
        status="Successful"
    ).count()

    total_earnings = WalletTransaction.objects.filter(
        user=request.user,
        transaction_type="Credit",
        description__icontains="Referral"
    ).aggregate(
        total=Sum("amount")
    )["total"] or 0

    referral_history = []

    for referral in referrals.order_by("-created_at"):

        referral_history.append({
            "id": referral.id,
            "username": referral.referred_user.username,
            "status": referral.status,
            "first_order_id": (
                referral.first_order.id
                if referral.first_order
                else None
            ),
            "first_bonus_credited": referral.first_bonus_credited,
            "created_at": referral.created_at.isoformat()
        })

    return JsonResponse({
        "referral_code": profile.referral_code,
        "total_referrals": total_referrals,
        "successful_referrals": successful_referrals,
        "total_earnings": str(total_earnings),
        "referral_history": referral_history
    })  