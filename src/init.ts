import { Bot } from "grammy";

import { ChartGPTService } from "./chartGPT/ChartGPTService";
import { config } from "./config";
import { firstMenu } from "./bot/ui/menu";
import { ADD, SEND, STOP, TRANSLATE_BUTTONS } from "./bot/actions";
import { getFirstMenuMarkup } from "./bot/ui/keyboards/firstMenu";
import { BotService, MessageEventData, UserState } from "./services/BotService";

const { DEFAULT_INTERVAL_VALUE, TELEGRAM_TOKEN } = config;

//Create a new bot
console.log('TELEGRAM_TOKEN: ', TELEGRAM_TOKEN);
const bot = new Bot(String(TELEGRAM_TOKEN));
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
bot.callbackQuery(ADD, async (ctx) => {
  const messageEventData: MessageEventData = botService.addWordEventHandler();
  botService.setUserState(ctx.from.id, UserState.WORD_ADDING);
  await ctx.reply(messageEventData.replyMessage || '', {
    entities: ctx.message?.entities,
    ...messageEventData,
  });
 });

// слушаем когда пользователь выберет перевод
bot.callbackQuery(TRANSLATE_BUTTONS, async (ctx) => {
  if (TRANSLATE_BUTTONS.includes(ctx.callbackQuery.data)) {
    const actionName = ctx.callbackQuery.data;
    // номер кнопки на которую нажали для выбора перевода
    const index = actionName.charAt(actionName.length - 1);

    // const messageEventData: MessageEventData = botService.selectTranslateEvetHandler({
    //   messageText: ctx.message.text || null,
    //   firstName: ctx.from.first_name,
    // }, ctx.from.id);

    // await ctx.reply(messageEventData.replyMessage || '', {
    //   entities: ctx.message?.entities,
    //   parse_mode: messageEventData.parseMode,
    //   reply_markup: messageEventData.replyMarkup,
    // });
  } else {
    console.log('translate ctx: ', JSON.stringify(ctx));
  }
});

bot.command(['menu', 'start'], async (ctx) => {
  const messageData = botService.getStartMenu();

  await ctx.reply(messageData.replyMessage || '', {
    parse_mode: messageData.parseMode,
    reply_markup: messageData.replyMarkup,
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
    }, ctx.from.id);

    await ctx.reply(messageEventData.replyMessage || '', {
      entities: ctx.message.entities,
      parse_mode: messageEventData.parseMode,
      reply_markup: messageEventData.replyMarkup,
    });
  } else {
    //This is equivalent to forwarding, without the sender's name
    await ctx.copyMessage(ctx.message.chat.id);
  }
});

//Start the Bot
bot.start();
