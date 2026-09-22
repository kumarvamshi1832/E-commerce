from django.urls import path
from .auth_views import (
    register_user,
    login_user,
    verify_registration_otp,
    resend_registration_otp,
    forgot_password,
    reset_password,
)
from .views import (
    product_list,
    product_detail,
    create_order,
    current_user,
    my_orders,
    order_detail,
    cancel_order,
    apply_coupon,
    submit_feedback,
    get_feedback,
    create_support_ticket,
    my_support_tickets,
    support_ticket_detail,
    send_support_message,
    add_product_review,
    get_product_reviews,
    support_dashboard_summary,
    support_dashboard_tickets,
    support_dashboard_ticket_detail,
    support_dashboard_reply,
    support_dashboard_update_status,
    check_delivery,
    admin_product_list,
    admin_create_product,
    admin_update_product,
    admin_toggle_product_status,
    admin_delete_product,
    admin_order_list,
    admin_order_detail,
    admin_update_order_status,
    admin_customer_list,
    admin_customer_detail,
    admin_inventory_list,
    admin_update_inventory,
    admin_review_list,
    admin_review_detail,
    admin_feedback_list,
    admin_feedback_detail,
    admin_reply_feedback,
    admin_update_feedback_status,
    admin_notification_list,
    admin_create_notification,
    admin_notification_customers,
    admin_coupon_list,
    admin_create_coupon,
    admin_update_coupon,
    admin_toggle_coupon_status,
    admin_dashboard,
    address_list,
    address_detail,
    )

from .views import (
    get_wishlist,
    add_to_wishlist,
    remove_from_wishlist,
    get_notifications,
    mark_notification_read,
    mark_all_notifications_read,
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
    "forgot-password/",
    forgot_password,
    name="forgot-password"
),

path(
    "reset-password/",
    reset_password,
    name="reset-password"
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
    "order-items/<int:order_item_id>/feedback/",
    submit_feedback,
    name="submit-feedback"
),

path(
    "support/tickets/",
    create_support_ticket,
    name="create-support-ticket"
),

path(
    "support/my-tickets/",
    my_support_tickets,
    name="my-support-tickets"
),

path(
    "order-items/<int:order_item_id>/feedback/list/",
    get_feedback,
    name="get-feedback"
),

path(
    "support/tickets/<int:ticket_id>/",
    support_ticket_detail,
    name="support-ticket-detail"
),

path(
    "support/tickets/<int:ticket_id>/messages/",
    send_support_message,
    name="send-support-message"
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

path("notifications/", get_notifications),

path(
    "notifications/<int:notification_id>/read/",
    mark_notification_read
),
path(
    "notifications/read-all/",
    mark_all_notifications_read
),

path(
    "products/<int:product_id>/reviews/<int:order_item_id>/",
    add_product_review
),

path(
    "products/<int:product_id>/reviews/",
    get_product_reviews
),

path(
    "support/dashboard/",
    support_dashboard_summary,
    name="support-dashboard-summary"
),

path(
    "support/dashboard/tickets/",
    support_dashboard_tickets,
    name="support-dashboard-tickets"
),

path(
    "support/dashboard/tickets/<int:ticket_id>/",
    support_dashboard_ticket_detail,
    name="support-dashboard-ticket-detail"
),

path(
    "support/dashboard/tickets/<int:ticket_id>/reply/",
    support_dashboard_reply,
    name="support-dashboard-reply"
),

path(
    "support/dashboard/tickets/<int:ticket_id>/status/",
    support_dashboard_update_status,
    name="support-dashboard-update-status"
),

path("delivery/check/", check_delivery, name="check-delivery"),

path(
    "admin/products/",
    admin_product_list,
    name="admin-product-list"
),

path(
    "admin/products/create/",
    admin_create_product,
    name="admin-create-product"
),

path(
    "admin/products/<int:product_id>/update/",
    admin_update_product,
    name="admin-update-product"
),

path(
    "admin/products/<int:product_id>/status/",
    admin_toggle_product_status,
    name="admin-toggle-product-status"
),

path(
    "admin/products/<int:product_id>/delete/",
    admin_delete_product,
    name="admin-delete-product"
),
path(
    "admin/orders/",
    admin_order_list,
    name="admin-order-list"
),

path(
    "admin/orders/<int:order_id>/",
    admin_order_detail,
    name="admin-order-detail"
),

path(
    "admin/orders/<int:order_id>/status/",
    admin_update_order_status,
    name="admin-update-order-status"
),

path(
    "admin/customers/",
    admin_customer_list,
    name="admin-customer-list"
),

path(
    "admin/customers/<int:customer_id>/",
    admin_customer_detail,
    name="admin-customer-detail"
),

path(
    "admin/inventory/",
    admin_inventory_list,
    name="admin-inventory-list"
),

path(
    "admin/inventory/<int:product_id>/update/",
    admin_update_inventory,
    name="admin-update-inventory"
),

path(
    "admin/reviews/",
    admin_review_list,
    name="admin-review-list"
),

path(
    "admin/reviews/<int:review_id>/",
    admin_review_detail,
    name="admin-review-detail"
),

path(
    "admin/support/",
    admin_feedback_list,
    name="admin-feedback-list"
),

path(
    "admin/support/<int:feedback_id>/",
    admin_feedback_detail,
    name="admin-feedback-detail"
),

path(
    "admin/support/<int:feedback_id>/reply/",
    admin_reply_feedback,
    name="admin-reply-feedback"
),

path(
    "admin/support/<int:feedback_id>/status/",
    admin_update_feedback_status,
    name="admin-update-feedback-status"
),

path(
    "admin/notifications/",
    admin_notification_list,
    name="admin-notification-list"
),

path(
    "admin/notifications/create/",
    admin_create_notification,
    name="admin-create-notification"
),

path(
    "admin/notifications/customers/",
    admin_notification_customers,
    name="admin-notification-customers"
),

path("admin/coupons/", admin_coupon_list, name="admin-coupon-list"),
path("admin/coupons/create/", admin_create_coupon, name="admin-create-coupon"),
path("admin/coupons/<int:coupon_id>/update/", admin_update_coupon, name="admin-update-coupon"),
path("admin/coupons/<int:coupon_id>/status/", admin_toggle_coupon_status, name="admin-toggle-coupon-status"),

path(
    "admin/dashboard/",
    admin_dashboard,
    name="admin-dashboard"
),

path("addresses/", address_list),
path("addresses/<int:address_id>/", address_detail),

]
