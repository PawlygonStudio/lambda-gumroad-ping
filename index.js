const axios = require('axios');
const querystring = require('querystring'); 

exports.handler = async (event) => {
    try {
        console.log("Received event:", JSON.stringify(event));

        let body;
        
        // Check if the body is base64 encoded
        if (event.isBase64Encoded) {
            console.log("Decoding base64 encoded body");
            const decodedBody = Buffer.from(event.body, 'base64').toString('utf-8');
            body = querystring.parse(decodedBody); // Parse as URL-encoded data
        } else {
            // If not base64 encoded, directly parse the URL-encoded body
            body = querystring.parse(event.body);
        }

        console.log("Parsed body:", JSON.stringify(body));

        // Prepare the message content based on available fields
        let embed = {
            title: body.product_name ? `Product: ${body.product_name}` : "New Sale Notification",
            description: `A new sale has been made via Gumroad.`,
            fields: [],
            color: 5814783 // Color of the embed
        };

        // Add fields dynamically based on the available data
        for (const [key, value] of Object.entries(body)) {
            if (value) {
                // Format the key to be more readable
                let formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
                // Handle nested fields like card[expiry_year]
                formattedKey = formattedKey.replace(/\[(.*?)\]/g, ' $1');
                embed.fields.push({ name: formattedKey, value: String(value), inline: true });
            }
        }

        console.log("Embed:", JSON.stringify(embed));

        // Discord API setup
        const discordApiUrl = `https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages`; // Updated with the correct channel ID

        // Function to send a message to Discord
        const sendToDiscord = async (messageBody) => {
            const response = await axios.post(discordApiUrl, messageBody, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
                }
            });

            if (response.status !== 200) {
                console.error('Error sending message to Discord:', response.statusText);
            }
        };

        // Split fields into chunks of 25 and send each chunk as a separate message
        const chunkSize = 25;
        for (let i = 0; i < embed.fields.length; i += chunkSize) {
            const chunk = embed.fields.slice(i, i + chunkSize);
            const messageBody = {
                embeds: [{ ...embed, fields: chunk }]
            };
            if (i === 0) {
                messageBody.content = "**New Gumroad Ping Received!**";
            } else {
                messageBody.embeds[0].title = "Additional Fields";
                messageBody.embeds[0].description = "Here are some additional fields from the sale.";
            }
            await sendToDiscord(messageBody);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Success' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};
