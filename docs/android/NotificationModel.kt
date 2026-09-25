package com.aalmvastralay.app.notification

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector

/**
 * 👑 AALM VASTRALAY — NOTIFICATION PRIORITY
 * Defines color coding, importance levels, and visual accents.
 */
enum class NotificationPriority(
    val level: Int,
    val accentColor: Color,
    val label: String
) {
    URGENT(
        level = 4,
        accentColor = Color(0xFFE53935), // Royal Crimson Red
        label = "Urgent"
    ),
    HIGH(
        level = 3,
        accentColor = Color(0xFFF59E0B), // Radiant Amber
        label = "High"
    ),
    SUCCESS(
        level = 2,
        accentColor = Color(0xFF10B981), // Emerald Gold Green
        label = "Success"
    ),
    INFO(
        level = 1,
        accentColor = Color(0xFF8B5CF6), // Royal Velvet Purple
        label = "Info"
    )
}

/**
 * Notification category matching Aalm Vastralay events.
 */
enum class NotificationCategory(val rawValue: String) {
    ORDER("order"),
    DELIVERY("delivery"),
    PROMO("promo"),
    SECURITY("security"),
    GENERAL("general")
}

/**
 * Interactive Action Button on the card and system notification.
 */
data class NotificationAction(
    val id: String,
    val title: String,
    val actionType: String = "OPEN_URL", // OPEN_URL, DISMISS, TRACK_ORDER
    val payloadUrl: String? = null
)

/**
 * Immutable in-app Notification Item Model.
 */
data class NotificationItem(
    val id: String,
    val title: String,
    val message: String,
    val timestamp: String,
    val timestampMillis: Long = System.currentTimeMillis(),
    val priority: NotificationPriority = NotificationPriority.INFO,
    val category: NotificationCategory = NotificationCategory.GENERAL,
    val isRead: Boolean = false,
    val isFreshlyArrived: Boolean = true,
    val actions: List<NotificationAction> = emptyList()
)
