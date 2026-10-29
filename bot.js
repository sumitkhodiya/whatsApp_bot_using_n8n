const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false
    }
});

client.on("qr", (qr) => {
    console.log("📱 Scan the QR Code");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("✅ WhatsApp is ready!");
});

client.on("authenticated", () => {
    console.log("✅ Authentication successful!");
});

client.on("message", async (message) => {

    console.log("📩", message.body);

    try {

        const response = await axios.post(
            "http://localhost:5678/webhook-test/webhook/whatsapp",
            {
                body: message.body,
                from: message.from
            }
        );
        console.log("Response:", response.data);
        if (response.data.reply) {
            await message.reply(response.data.reply);
            console.log("✅ Reply Sent");
        }
    } catch (error) {
        console.error(error.response?.data || error.message);
    }
});

client.initialize();
app.listen(3000, () => {
    console.log("🚀 Express Server Running on Port 3000");
});

