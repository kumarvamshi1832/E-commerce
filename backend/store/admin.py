from django.contrib import admin

from .models import (
    Product,
    Order,
    OrderItem,
    Coupon,
    ProductFeedback,
    SupportTicket,
    SupportMessage,
)


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


@admin.register(ProductFeedback)
class ProductFeedbackAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "product",
        "order_item",
        "feedback",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "user__username",
        "product__name",
        "feedback",
    )

    fields = (
        "user",
        "product",
        "order_item",
        "feedback",
        "admin_reply",
        "status",
        "created_at",
        "replied_at",
    )

    readonly_fields = (
        "user",
        "product",
        "order_item",
        "feedback",
        "created_at",
        "replied_at",
    )

    def save_model(self, request, obj, form, change):

        if obj.admin_reply and obj.admin_reply.strip():

            obj.status = "Replied"

            if not obj.replied_at:
                from django.utils import timezone
                obj.replied_at = timezone.now()

        else:
            obj.status = "Pending"
            obj.replied_at = None

        super().save_model(
            request,
            obj,
            form,
            change
        )
class SupportMessageInline(admin.TabularInline):
    model = SupportMessage
    extra = 0
    can_delete = False
    max_num = 0

    fields = (
        "sender",
        "message",
        "created_at",
    )

    readonly_fields = (
        "sender",
        "message",
        "created_at",
    )

@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "category",
        "subject",
        "order",
        "status",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "category",
        "status",
        "created_at",
    )

    search_fields = (
        "user__username",
        "user__email",
        "subject",
        "description",
    )

    fields = (
        "user",
        "order",
        "category",
        "subject",
        "description",
        "status",
        "admin_reply",
        "created_at",
        "updated_at",
        "resolved_at",
    )

    readonly_fields = (
        "user",
        "order",
        "category",
        "subject",
        "description",
        "created_at",
        "updated_at",
        "resolved_at",
    )

    inlines = (
    SupportMessageInline,
)

    def save_model(self, request, obj, form, change):

        old_reply = ""

        if change:
            try:
                old_ticket = SupportTicket.objects.get(
                    pk=obj.pk
                )

                old_reply = old_ticket.admin_reply or ""

            except SupportTicket.DoesNotExist:
                pass

        new_reply = (obj.admin_reply or "").strip()

        # Create a SupportMessage when admin sends a new reply
        if new_reply and new_reply != old_reply.strip():

            SupportMessage.objects.create(
                ticket=obj,
                sender="Admin",
                message=new_reply
            )

        # Automatically move Open ticket to In Progress
        if new_reply and obj.status == "Open":
            obj.status = "In Progress"

        # Handle resolved timestamp
        if obj.status == "Resolved":

            if not obj.resolved_at:
                from django.utils import timezone

                obj.resolved_at = timezone.now()

        else:
            obj.resolved_at = None

        super().save_model(
            request,
            obj,
            form,
            change
        )


@admin.register(SupportMessage)
class SupportMessageAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "ticket",
        "sender",
        "message",
        "created_at",
    )

    list_filter = (
        "sender",
        "created_at",
    )

    search_fields = (
        "message",
        "ticket__subject",
        "ticket__user__username",
        "ticket__user__email",
    )

    readonly_fields = (
        "ticket",
        "sender",
        "message",
        "created_at",
    )