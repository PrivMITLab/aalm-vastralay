package com.aalmvastralay.app.notification

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddAlert
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.DoneAll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

/**
 * 👑 AALM VASTRALAY — COMPLETE NOTIFICATION SCREEN DEMO
 *
 * Demonstrates:
 * 1. Simulating incoming real-time notifications.
 * 2. System-level Heads-Up slide-down peeking notification.
 * 3. In-App composite entrance animation (fadeIn + spring bounce slide-in + expand).
 * 4. Swipe-to-dismiss with smooth fadeOut & shrink.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationScreen(
    onNavigateBack: () -> Unit = {}
) {
    val context = LocalContext.current
    val notificationHelper = remember { NotificationHelper(context) }

    // Reactive notification list
    val notifications = remember {
        mutableStateListOf(
            NotificationItem(
                id = UUID.randomUUID().toString(),
                title = "Order #AV-8492 Confirmed! 🎉",
                message = "Aapka Banarasi Silk Saree order confirm ho gaya hai. Dispatch details jald hi bheji jayegi.",
                timestamp = "Just now",
                priority = NotificationPriority.SUCCESS,
                category = NotificationCategory.ORDER,
                isFreshlyArrived = true,
                actions = listOf(
                    NotificationAction("1", "Track Order", "TRACK_ORDER", "/orders/av-8492"),
                    NotificationAction("2", "Invoice", "OPEN_URL", "/orders/av-8492/invoice")
                )
            ),
            NotificationItem(
                id = UUID.randomUUID().toString(),
                title = "Security Alert: New Sign-in",
                message = "New login detected from Chrome (Android 14). If this was not you, lock your account immediately.",
                timestamp = "10m ago",
                priority = NotificationPriority.URGENT,
                category = NotificationCategory.SECURITY,
                isFreshlyArrived = false,
                actions = listOf(
                    NotificationAction("3", "Review Activity", "OPEN_URL", "/dashboard/security")
                )
            ),
            NotificationItem(
                id = UUID.randomUUID().toString(),
                title = "Shahi Wedding Sale is Live! 👑",
                message = "Get 25% off on Bridal Lehengas & Sherwanis with code SHAHI25. Valid till Sunday.",
                timestamp = "1h ago",
                priority = NotificationPriority.HIGH,
                category = NotificationCategory.PROMO,
                isFreshlyArrived = false,
                actions = listOf(
                    NotificationAction("4", "Shop Now", "OPEN_URL", "/categories/wedding-sale")
                )
            )
        )
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = "Notifications",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF722F37) // Royal Maroon
                        )
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color(0xFF722F37)
                        )
                    }
                },
                actions = {
                    IconButton(onClick = {
                        // Mark all as read
                        val updated = notifications.map { it.copy(isRead = true, isFreshlyArrived = false) }
                        notifications.clear()
                        notifications.addAll(updated)
                    }) {
                        Icon(
                            imageVector = Icons.Default.DoneAll,
                            contentDescription = "Mark all as read",
                            tint = Color(0xFFD4AF37) // Imperial Gold
                        )
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        bottomBar = {
            // Action button to simulate real-time notification push
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                Button(
                    onClick = {
                        val timeStr = SimpleDateFormat("h:mm a", Locale.getDefault()).format(Date())
                        val samplePriorities = listOf(
                            NotificationPriority.URGENT,
                            NotificationPriority.HIGH,
                            NotificationPriority.SUCCESS,
                            NotificationPriority.INFO
                        )
                        val randomPriority = samplePriorities.random()
                        val newNotification = NotificationItem(
                            id = UUID.randomUUID().toString(),
                            title = "Real-time Alert [${randomPriority.label}]",
                            message = "Aalm Vastralay instant dispatch alert at $timeStr. Native Heads-Up banner triggered.",
                            timestamp = "Just now",
                            priority = randomPriority,
                            category = NotificationCategory.DELIVERY,
                            isFreshlyArrived = true,
                            actions = listOf(
                                NotificationAction("act_1", "View Details", "OPEN_URL", "/orders")
                            )
                        )

                        // 1. Insert at top to trigger Jetpack Compose bouncy spring entrance
                        notifications.add(0, newNotification)

                        // 2. Trigger native Android system-level Heads-Up slide-down banner
                        notificationHelper.showHeadsUpNotification(
                            notificationId = (100..9999).random(),
                            title = newNotification.title,
                            body = newNotification.message,
                            priority = newNotification.priority
                        )
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF722F37), // Royal Maroon
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth().height(48.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.AddAlert,
                        contentDescription = null,
                        tint = Color(0xFFD4AF37)
                    )
                    Spacer(modifier = Modifier.padding(horizontal = 4.dp))
                    Text(
                        text = "Simulate Heads-Up & Entrance Animation",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }
        }
    ) { innerPadding ->
        if (notifications.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Koi naya notification nahi hai (No notifications)",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            NotificationList(
                notifications = notifications,
                onItemDismiss = { dismissedItem ->
                    notifications.remove(dismissedItem)
                },
                onItemClick = { clickedItem ->
                    val index = notifications.indexOf(clickedItem)
                    if (index >= 0) {
                        notifications[index] = clickedItem.copy(isRead = true, isFreshlyArrived = false)
                    }
                },
                onActionClick = { _, action ->
                    // Handle button action click (e.g. open link or deep link)
                },
                contentPadding = innerPadding
            )
        }
    }
}
