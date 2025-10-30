// jobs/notificationJob.js
const cron = require("node-cron");
const Notification = require("../models/tripModels/notificationModel");
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config(); // Make sure .env is loaded

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;
let notificationsEnabled = false;

try {
  if (!serviceAccountPath) {
    console.warn("FIREBASE_SERVICE_ACCOUNT env variable not set. Notification job disabled.");
  } else {
    const resolvedPath = path.resolve(serviceAccountPath);
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`Service account file not found at path: ${resolvedPath}. Notification job disabled.`);
    } else {
      const serviceAccount = require(resolvedPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      notificationsEnabled = true;
      console.log("✅ Firebase Admin initialized for notifications");
    }
  }
} catch (err) {
  console.warn(`Failed to initialize Firebase Admin: ${err.message}. Notification job disabled.`);
}

if (notificationsEnabled) {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const pending = await Notification.find({
        sendAt: { $lte: now },
        sent: false,
      });

      for (let note of pending) {
        console.log(`📩 Sending notification: ${note.title}`);

        try {
          await admin.messaging().send({
            token: note.fcmToken,
            notification: {
              title: note.title,
              body: note.body,
            },
            data: {
              dealerName: note.dealerName,
              shopName: note.shopName,
              mobile: note.mobile || "",
              amount: note.amount.toString(), // Convert number to string for FCM
              notificationId: note._id.toString()
            }
          });

          note.sent = true;
          await note.save();
          console.log(`✅ Notification sent: ${note.title}`);
        } catch (sendErr) {
          console.error("❌ Failed to send notification:", sendErr.message);
        }
      }
    } catch (err) {
      console.error("❌ Cron job error:", err.message);
    }
  });
} else {
  console.log("🔕 Notification job is disabled.");
}
