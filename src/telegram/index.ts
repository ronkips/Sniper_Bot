import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start((ctx: any) => {
  ctx.reply(
    "Welcome, You account is successfully setup and is ready to receive notifications  ..."
  );
});

const sendNotification = async (message: any) => {
  console.log("\n\n Sending telegram notification ...");

  bot.telegram
    .sendMessage("288307809", message, {
      parse_mode: "HTML",
      disable_web_page_preview: true
    })
    .catch((error: any) => {
      console.log(
        "\n\n Encountered an error while sending notification to the bot "
      );
      console.log("==============================");
      console.log(error);
    });

  console.log("Done");
};

bot.launch();
export { sendNotification };
