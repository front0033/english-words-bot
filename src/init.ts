import { Bot } from "grammy";

import { ChartGPTService } from "./chartGPT/ChartGPTService";
import { DEFAULT_INTERVAL_VALUE } from "./config";
import { firstMenu } from "./bot/ui/menu";
import { ADD, SEND, STOP } from "./bot/actions";
import { getFirstMenuMarkup } from "./bot/ui/keyboards/firstMenu";
import { BotService, MessageEventData } from "./services/BotService";

//Create a new bot
const bot = new Bot(String(process.env.TELEGRAM_TOKEN));
const botService = new BotService();

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

// слушаем когда пользователь нажмет на кнопку добавить
bot.hears(/\/add/, async (ctx) => {
  const messageEventData: MessageEventData = botService.addWordEventHandler();
  console.log('---- add ---- ');
  await ctx.reply(messageEventData.replyMessage || '', {
    entities: ctx.message?.entities,
    ...messageEventData,
  });
});

bot.hears(/\/translate:/, async (ctx) => {
  console.log('---- translate ---- ');
  if (ctx.message?.text) {
    const messageEventData: MessageEventData = botService.selectTranslateEvetHandler({
      messageText: ctx.message.text || null,
      firstName: ctx.from.first_name,
    });

    await ctx.reply(messageEventData.replyMessage || '', {
      entities: ctx.message?.entities,
      ...messageEventData,
    });
  } else {
    console.log('ranslate: ', ctx.message);
  }
});

bot.command(['menu', 'start'], async (ctx) => {
  await ctx.reply(firstMenu, {
    parse_mode: "HTML",
    reply_markup: getFirstMenuMarkup(),
  });
});

// This function would be added to the dispatcher as a handler for messages coming from the Bot API
bot.on("message", async (ctx) => {

  let messageEventData: MessageEventData = {};

  if (ctx.message.text) {
    const {first_name, username, id } = ctx.from;
    //Print to console
    console.log(
      `{ first_name: ${first_name}, username: ${username}, id: ${id} }: wrote ${
        ctx.message.text || ''
      }`,
    );

    messageEventData = await botService.messageEventHandler({
      messageText: ctx.message.text || null,
      firstName: ctx.from.first_name,
    });

    await ctx.reply(messageEventData.replyMessage || '', {
      entities: ctx.message.entities,
      ...messageEventData,
    });
  } else {
    //This is equivalent to forwarding, without the sender's name
    await ctx.copyMessage(ctx.message.chat.id);
  }
});

//Start the Bot
bot.start();
