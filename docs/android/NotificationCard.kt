package com.aalmvastralay.app.notification

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocalOffer
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

/**
 * 👑 AALM VASTRALAY — MODERN MATERIAL 3 NOTIFICATION CARD
 *
 * Features:
 * - 16dp rounded corners with subtle luxury elevation.
 * - Dynamic priority accent pill (Red/Amber/Emerald/Purple).
 * - Category icon badge, bold title, timestamp, structured body.
 * - Subtle 1.5s glowing border pulse for freshly arrived items.
 * - Action buttons at the footer.
 */
@Composable
fun NotificationCard(
    item: NotificationItem,
    onClick: () => Unit = {},
    onActionClick: (NotificationAction) -> Unit = {},
    modifier: Modifier = Modifier
) {
    // 1.5-second pulse glow animation for newly arrived items
    val glowAlpha = remember { Animatable(if (item.isFreshlyArrived) 0.85f else 0f) }

    LaunchedEffect(item.isFreshlyArrived) {
        if (item.isFreshlyArrived) {
            // Pulse 2 times over 1500ms then gently fade out
            glowAlpha.animateTo(
                targetValue = 1f,
                animationSpec = tween(durationMillis = 350, easing = FastOutSlowInEasing)
            )
            glowAlpha.animateTo(
                targetValue = 0.2f,
                animationSpec = tween(durationMillis = 500, easing = FastOutSlowInEasing)
            )
            glowAlpha.animateTo(
                targetValue = 0.9f,
                animationSpec = tween(durationMillis = 350, easing = FastOutSlowInEasing)
            )
            glowAlpha.animateTo(
                targetValue = 0f,
                animationSpec = tween(durationMillis = 300, easing = LinearEasing)
            )
        }
    }

    val accent = item.priority.accentColor
    val glowColor = accent.copy(alpha = glowAlpha.value * 0.45f)
    val borderColor = if (glowAlpha.value > 0.05f) {
        accent.copy(alpha = glowAlpha.value)
    } else {
        MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .shadow(
                elevation = if (glowAlpha.value > 0.1f) 6.dp else 2.dp,
                shape = RoundedCornerShape(16.dp),
                spotColor = accent.copy(alpha = glowAlpha.value * 0.5f)
            )
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(
            width = if (glowAlpha.value > 0.05f) 1.8.dp else 1.dp,
            brush = if (glowAlpha.value > 0.05f) {
                Brush.horizontalGradient(listOf(accent, Color(0xFFD4AF37), accent))
            } else {
                Brush.linearGradient(listOf(borderColor, borderColor))
            }
        ),
        colors = CardDefaults.cardColors(
            containerColor = if (item.isRead) {
                MaterialTheme.colorScheme.surface
            } else {
                MaterialTheme.colorScheme.surfaceContainerHigh
            }
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Header: Category Icon + Title + Priority Pill + Timestamp
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Category Icon Badge
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(accent.copy(alpha = 0.14f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = getCategoryIcon(item.category),
                        contentDescription = item.category.name,
                        tint = accent,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                // Title & Priority indicator
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = item.title,
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = if (item.isRead) FontWeight.SemiBold else FontWeight.Bold,
                                fontSize = 15.sp
                            ),
                            color = MaterialTheme.colorScheme.onSurface,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.weight(1f, fill = false)
                        )

                        // Priority Badge
                        PriorityBadge(priority = item.priority)
                    }

                    Spacer(modifier = Modifier.height(2.dp))

                    Text(
                        text = item.timestamp,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.75f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Body message
            Text(
                text = item.message,
                style = MaterialTheme.typography.bodyMedium.copy(
                    lineHeight = 20.sp,
                    fontSize = 13.5.sp
                ),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis
            )

            // Interactive Action Buttons
            if (item.actions.isNotEmpty()) {
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item.actions.forEach { action ->
                        OutlinedButton(
                            onClick = { onActionClick(action) },
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, accent.copy(alpha = 0.5f)),
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = accent
                            ),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Text(
                                text = action.title,
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold)
                            )
                        }
                    }
                }
            }
        }
    }
}

/**
 * Priority accent badge pill.
 */
@Composable
private fun PriorityBadge(priority: NotificationPriority) {
    Surface(
        shape = RoundedCornerShape(6.dp),
        color = priority.accentColor.copy(alpha = 0.15f),
        contentColor = priority.accentColor
    ) {
        Text(
            text = priority.label,
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp
            ),
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
        )
    }
}

/**
 * Maps category to appropriate Material vector icon.
 */
private fun getCategoryIcon(category: NotificationCategory): ImageVector {
    return when (category) {
        NotificationCategory.ORDER -> Icons.Default.CheckCircle
        NotificationCategory.DELIVERY -> Icons.Default.LocalShipping
        NotificationCategory.PROMO -> Icons.Default.LocalOffer
        NotificationCategory.SECURITY -> Icons.Default.Security
        NotificationCategory.GENERAL -> Icons.Default.Info
    }
}
