# reminder_bot

Simple reminder bot for discord using Discord.js

Make a ```.env``` file in root and add bot token and add bot to server using client_id. Add token by ```DISCORD_BOT_TOKEN=$your_token_here```.

Run ```npm install``` to install dependencies and then ```npm run start``` to start up the bot.

Add reminder using ```#remind $day $month $year $hours $minutes```.

View reminder using ```#show```.

Delete a reminder using its index which you can lookup using the show command by ```#delete $index```.
