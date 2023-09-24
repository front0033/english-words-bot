import { Bot, InlineKeyboard } from "grammy";

import { ChartGPTService } from "./chartGPT/ChartGPTService";
import { DEFAULT_INTERVAL_VALUE } from "./config";
import { firstMenu } from "./bot/ui/menu";
import { addWordButton, startLearningAddedWordsButton, stopLearningAddedWordsButton } from "./bot/ui/buttons";
import { ADD, SEND, STOP } from "./bot/actions";

//Create a new bot
const bot = new Bot(String(process.env.TELEGRAM_TOKEN));

//Build keyboards
const firstMenuMarkup = new InlineKeyboard()
  .text(addWordButton, ADD)
  .text(startLearningAddedWordsButton, SEND)
  .text(stopLearningAddedWordsButton, STOP);

let sendInterval: any;

bot.callbackQuery(SEND, async (ctx) => {
  const sendRandomQuestion = async () => {
    const question = await ChartGPTService.ensure().randomQuestion();

    await ctx.reply(question || '', {
      entities: ctx.message?.entities,
    });
  }
  if (sendInterval) {
    clearInterval(sendInterval);
  } else {
    sendRandomQuestion();
  }

  sendInterval = setInterval(async () => {
    sendRandomQuestion();
  }, DEFAULT_INTERVAL_VALUE);
});

const stopSending = () => {
  if (sendInterval) {
    clearInterval(sendInterval);
  }
}

bot.callbackQuery(STOP, async (ctx) => {
  stopSending();
  ctx.reply('stopping!');
})

bot.hears(/\/stop/, (ctx) => {
  stopSending();
  ctx.reply('stopping!');
});

bot.command("menu", async (ctx) => {
  await ctx.reply(firstMenu, {
    parse_mode: "HTML",
    reply_markup: firstMenuMarkup,
  });
});

//This function would be added to the dispatcher as a handler for messages coming from the Bot API
bot.on("message", async (ctx) => {
  //Print to console
  console.log(
    `${ctx.from.first_name} wrote ${
      "text" in ctx.message ? ctx.message.text : ""
    }`,
  );

  if (ctx.message.text) {
    const sentenceFromAI = await ChartGPTService.ensure().getSentenceByWord(ctx.message.text);
    const replyMessage = sentenceFromAI || ctx.message.text.toUpperCase() + '  ' + ctx.from.first_name;

    await ctx.reply(replyMessage, {
      entities: ctx.message.entities,
    });
  } else {
    //This is equivalent to forwarding, without the sender's name
    await ctx.copyMessage(ctx.message.chat.id);
  }
});

//Start the Bot
bot.start();
