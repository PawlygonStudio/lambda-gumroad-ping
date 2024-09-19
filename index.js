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

        // Destructure the fields from the ping data, only extract the fields that exist
        const {
            seller_id,
            product_id,
            product_name,
            email,
            price,
            gumroad_fee,
            currency,
            quantity,
            referrer,
            card,
            order_number,
            sale_id,
            sale_timestamp,
            purchaser_id,
            affiliate_credit_amount_cents,
            license_key,
            ip_country,
            affiliate,
            is_gift_receiver_purchase,
            refunded,
            disputed,
            dispute_won,
            test
        } = body;

        // Prepare the message content based on available fields
        let embed = {
            title: product_name ? `Product: ${product_name}` : "New Sale Notification",
            description: `A new sale has been made via Gumroad.`,
            fields: [],
            color: 5814783 // Color of the embed
        };

        // Add fields dynamically based on the available data
        if (email) embed.fields.push({ name: "Email", value: email, inline: true });
        if (order_number) embed.fields.push({ name: "Order Number", value: order_number, inline: true });
        if (sale_timestamp) embed.fields.push({ name: "Sale Timestamp", value: new Date(sale_timestamp).toUTCString(), inline: true });
        if (license_key) embed.fields.push({ name: "License Key", value: license_key, inline: true });
        if (price) embed.fields.push({ name: "Price", value: `$${price / 100} ${currency}`, inline: true });
        if (gumroad_fee) embed.fields.push({ name: "Gumroad Fee", value: `$${gumroad_fee / 100}`, inline: true });
        if (quantity) embed.fields.push({ name: "Quantity", value: quantity, inline: true });
        if (referrer) embed.fields.push({ name: "Referrer", value: referrer, inline: true });
        if (affiliate) embed.fields.push({ name: "Affiliate", value: affiliate, inline: true });
        if (affiliate_credit_amount_cents) embed.fields.push({ name: "Affiliate Credit", value: `$${affiliate_credit_amount_cents / 100}`, inline: true });
        if (purchaser_id) embed.fields.push({ name: "Purchaser ID", value: purchaser_id, inline: true });
        if (ip_country) embed.fields.push({ name: "IP Country", value: ip_country, inline: true });
        if (refunded) embed.fields.push({ name: "Refunded", value: refunded === "true" ? "Yes" : "No", inline: true });
        if (disputed) embed.fields.push({ name: "Disputed", value: disputed === "true" ? "Yes" : "No", inline: true });
        if (dispute_won) embed.fields.push({ name: "Dispute Won", value: dispute_won === "true" ? "Yes" : "No", inline: true });
        
        if (seller_id) embed.fields.push({ name: "Seller ID", value: seller_id, inline: true });
        if (sale_id) embed.fields.push({ name: "Sale ID", value: sale_id, inline: true });
        if (product_id) embed.fields.push({ name: "Product ID", value: product_id, inline: true });

        // Discord API setup
        const discordApiUrl = `https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages`;

        // Prepare message body
        const messageBody = {
            content: "**New Gumroad Ping Received!**",
            embeds: [embed]
        };

        // Send message to Discord using bot
        const response = await axios.post(discordApiUrl, messageBody, {
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Discord response:", response.data);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Ping processed and sent to Discord' }),
        };
    } catch (error) {
        console.error("Error processing Gumroad ping:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error processing ping' }),
        };
    }
};
