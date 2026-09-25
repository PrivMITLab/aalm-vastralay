package com.aalmvastralay.app.notification

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.aalmvastralay.app.MainActivity
import com.aalmvastralay.app.R

/**
 * 👑 AALM VASTRALAY — NATIVE HEADS-UP NOTIFICATION HELPER
 *
 * Configures Android NotificationManager & NotificationChannel to trigger
 * native system-level "Heads-Up" slide-down peeking banner animation at the top
 * of the screen even when the user is actively inside other apps or games.
 */
class NotificationHelper(private val context: Context) {

    companion object {
        const val CHANNEL_ID_HIGH_PRIORITY = "aalm_vastralay_urgent_alerts"
        const val CHANNEL_NAME = "Aalm Vastralay Priority Alerts"
        const val CHANNEL_DESC = "Immediate Heads-up notifications for Orders, Deliveries, and Security"

        // Custom urgent vibration cadence: pause 0ms, buzz 250ms, pause 150ms, buzz 350ms
        val VIBRATION_PATTERN = longArrayOf(0, 250, 150, 350)
    }

    private val notificationManager: NotificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    init {
        createHighPriorityHeadsUpChannel()
    }

    /**
     * Creates and registers NotificationChannel with IMPORTANCE_HIGH / IMPORTANCE_MAX.
     * Required for Android 8.0 (API 26) and above to enable heads-up slide-down peeking.
     */
    private fun createHighPriorityHeadsUpChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val existing = notificationManager.getNotificationChannel(CHANNEL_ID_HIGH_PRIORITY)
            if (existing == null) {
                val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
                val audioAttributes = AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION_COMMUNICATION_INSTANT)
                    .build()

                val channel = NotificationChannel(
                    CHANNEL_ID_HIGH_PRIORITY,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_HIGH // Triggers Heads-up peeking banner
                ).apply {
                    description = CHANNEL_DESC
                    enableVibration(true)
                    vibrationPattern = VIBRATION_PATTERN
                    setSound(soundUri, audioAttributes)
                    enableLights(true)
                    lightColor = android.graphics.Color.parseColor("#D4AF37") // Imperial Gold
                    lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
                    setShowBadge(true)
                    setBypassDnd(true)
                }

                notificationManager.createNotificationChannel(channel)
            }
        }
    }

    /**
     * Dispatches a high-priority Heads-Up Notification banner.
     *
     * Key flags required for Heads-Up peeking:
     * 1. Priority = PRIORITY_MAX (or PRIORITY_HIGH)
     * 2. Defaults = DEFAULT_ALL (Sound + Vibrate)
     * 3. Category = CATEGORY_MESSAGE (or CATEGORY_EVENT / CATEGORY_ALARM)
     * 4. FullScreenIntent (or valid ContentIntent)
     */
    fun showHeadsUpNotification(
        notificationId: Int,
        title: String,
        body: String,
        targetUrl: String? = null,
        priority: NotificationPriority = NotificationPriority.HIGH
    ) {
        // Android 13+ (API 33) Runtime Permission Check
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ActivityCompat.checkSelfPermission(
                    context,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                // Permission not granted; skip to avoid crash
                return
            }
        }

        // Tap Intent -> Open app to destination
        val contentIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("EXTRA_NOTIFICATION_ID", notificationId)
            putExtra("EXTRA_NAV_TARGET", targetUrl)
        }
        val pendingContentIntent = PendingIntent.getActivity(
            context,
            notificationId,
            contentIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        // Build Notification with all Heads-Up triggers
        val builder = NotificationCompat.Builder(context, CHANNEL_ID_HIGH_PRIORITY)
            .setSmallIcon(R.drawable.ic_notification_logo) // Mono small icon with alpha channel
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(pendingContentIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_MAX) // CRITICAL: Max priority triggers slide-down peek
            .setDefaults(NotificationCompat.DEFAULT_ALL)   // CRITICAL: Sound & vibration trigger heads-up
            .setVibrate(VIBRATION_PATTERN)
            .setSound(soundUri)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE) // Semantic category
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setColor(android.graphics.Color.parseColor("#722F37")) // Royal Maroon Brand Accent
            .setTicker(title)

        // Action button 1: Open / View
        val actionIntent = Intent(context, MainActivity::class.java).apply {
            putExtra("ACTION_CLICK", "VIEW")
            putExtra("EXTRA_NAV_TARGET", targetUrl)
        }
        val actionPendingIntent = PendingIntent.getActivity(
            context,
            notificationId + 1000,
            actionIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        builder.addAction(
            R.drawable.ic_eye,
            "View Details",
            actionPendingIntent
        )

        // Dispatch via NotificationManagerCompat
        NotificationManagerCompat.from(context).notify(notificationId, builder.build())
    }
}
