import json

from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import (Product, Order, OrderItem, Coupon,
                     EmailOTP,Wishlist,ProductFeedback,
                     SupportTicket,SupportMessage,)
import random
import os
import requests
import resend
from django.conf import settings
from django.core.mail import send_mail

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


# =========================================================
# PRODUCT LIST
# =========================================================

def product_list(request):

    products = Product.objects.all()

    data = []

    for product in products:

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
        })

    return JsonResponse(data, safe=False)


# =========================================================
# PRODUCT DETAIL
# =========================================================

def product_detail(request, product_id):

    try:

        product = Product.objects.get(id=product_id)

    except Product.DoesNotExist:

        return JsonResponse(
            {"error": "Product not found"},
            status=404
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
            {"error": "Only POST method allowed"},
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
                {"error": "User must be logged in"},
                status=401
            )

        # =================================================
        # GET CART ITEMS
        # =================================================

        items = data.get("items", [])

        if not items:
            return JsonResponse(
                {"error": "Cart is empty"},
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

            quantity = int(item["quantity"])

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
        # DELIVERY
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

        if pincode.startswith("500"):
            delivery = 40
        else:
            delivery = 140

        # =================================================
        # CALCULATE DISCOUNT
        # =================================================

        discount_amount = (
            total_amount * discount_percent / 100
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
            total_amount=final_total
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
        # SEND EMAIL USING BREVO SMTP
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

                "discount_percent": discount_percent,

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

                "status": order.status
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

    except (ValueError, KeyError):

        return JsonResponse(
            {
                "error": "Invalid order data."
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

        # Only allow logged-in user
        # to access their own order

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

    subtotal = 0

    for item in items:

        item_total = (
            item.price * item.quantity
        )

        subtotal += item_total

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

    delivery = 40 if subtotal > 0 else 0

    return JsonResponse({

        "id": order.id,

        "status": order.status,

        "created_at": order.created_at,

        "subtotal": float(subtotal),

        "delivery": delivery,

        "total_amount": float(
            order.total_amount
        ),

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