from django.urls import path

from .auth_views import register_user, login_user,verify_registration_otp,resend_registration_otp
from .views import product_list, product_detail, create_order,current_user,my_orders, order_detail,cancel_order, apply_coupon
from .views import (
    get_wishlist,
    add_to_wishlist,
    remove_from_wishlist,
)



urlpatterns = [
    path("products/", product_list, name="product-list"),
    path(
        "products/<int:product_id>/",
        product_detail,
        name="product-detail",
    ),

    path(
        "register/",
        register_user,
        name="register"
    ),

    path(
        "login/",
        login_user,
        name="login"
    ),

    path(
    "orders/",
    create_order,
    name="create-order"
),
path(
    "my-orders/",
    my_orders,
    name="my-orders"
),

 path(
    "me/",
    current_user,
    name="current-user"
),

path(
    "orders/<int:order_id>/",
    order_detail,
    name="order-detail"
),

path(
    "orders/<int:order_id>/cancel/",
    cancel_order,
    name="cancel-order"
),

path(
    "apply-coupon/",
    apply_coupon,
    name="apply-coupon"
),

path(
    "verify-registration-otp/",
    verify_registration_otp,
    name="verify-registration-otp"
),

path(
    "resend-registration-otp/",
    resend_registration_otp,
    name="resend-registration-otp"
),

path("wishlist/", get_wishlist, name="get_wishlist"),

path(
    "wishlist/add/<int:product_id>/",
    add_to_wishlist,
    name="add_to_wishlist"
),

path(
    "wishlist/remove/<int:product_id>/",
    remove_from_wishlist,
    name="remove_from_wishlist"
),


]