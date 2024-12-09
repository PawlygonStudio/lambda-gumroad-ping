# Gumroad Ping to Discord Bot AWS Lambda

This AWS Lambda function receives a POST request from the Gumroad ping system, processes the data, and sends a formatted message to a Discord channel using a bot. The message is formatted with Discord embeds and includes relevant sale information.

## Environment variables

- DISCORD_BOT_TOKEN
- DISCORD_CHANNEL_ID
