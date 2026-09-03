from django.contrib import admin
from .models import Product, Order, OrderItem, Coupon


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "category",
        "price",
        "stock",
        "created_at",
    )

    list_filter = (
        "category",
    )

    search_fields = (
        "name",
        "category",
    )

    ordering = (
        "-created_at",
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "total_amount",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "user__username",
        "user__email",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "order",
        "product",
        "quantity",
        "price",
    )

    search_fields = (
        "product__name",
        "order__id",
    )

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):

    list_display = (
        "code",
        "discount_percent",
        "active",
        "created_at",
    )

    list_filter = (
        "active",
        "discount_percent",
    )

    search_fields = (
        "code",
    )

    ordering = (
        "-created_at",
    )