const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

// ✅ Allowed Bot Tokens (सिर्फ अलाउ किए गए बॉट्स एक्सेस कर सकते हैं)
const ALLOWED_TOKENS = [
    "7641129485:AAHYV8bP_9UZ0JHWFYKbSqWi8WeSWbyHh9I", // आपका बॉट
    "123456789:ABCDEF1234567890XYZ" // किसी और यूज़र का बॉट टोकन (Optional)
];

// ✅ Home Route (Fixes "Cannot GET /" error)
app.get("/", (req, res) => {
    res.send("API is running successfully!");
});

// ✅ Check Membership API
app.get("/check-membership", async (req, res) => {
    const { user_id, chat_id, bot_token } = req.query;

    if (!user_id || !chat_id || !bot_token) {
        return res.json({ status: "error", message: "User ID, Chat ID और Bot Token चाहिए" });
    }

    if (!ALLOWED_TOKENS.includes(bot_token)) {
        return res.json({ status: "error", message: "Unauthorized API Access!" });
    }

    const channels = JSON.parse(decodeURIComponent(chat_id));
    let notJoinedChannels = [];

    try {
        for (let channel of channels) {
            let response = await axios.get(`https://api.telegram.org/bot${bot_token}/getChatMember`, {
                params: { chat_id: channel, user_id: user_id }
            });

            let status = response.data.result.status;
            if (status === "left" || status === "kicked") {
                notJoinedChannels.push(channel);
            }
        }

        if (notJoinedChannels.length === 0) {
            return res.json({ status: "true", is_joined: true });
        } else {
            return res.json({
                status: "false",
                is_joined: false,
                not_joined_channels: notJoinedChannels
            });
        }
    } catch (error) {
        console.error("Error checking channels:", error.response ? error.response.data : error.message);
        return res.json({ status: "error", message: "Failed to check channels" });
    }
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
