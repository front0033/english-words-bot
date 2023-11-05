import { Bot } from "grammy";

import { config } from "./config";
import { ADD, SUBSCRIBE, UNSUBSCRIBE } from "./bot/actions";
import { BotService, MessageEventData, UserState } from "./services/BotService";
import cron from 'node-cron';

//Create a new bot
const bot = new Bot(String(config.TELEGRAM_TOKEN));
const botService = new BotService();

let sendInterval: any; // TODO: записать состояние для кажддого юзера в базу: подписан от на сообщения от бота или нет

// начало работы с ботом, показываем юзеру базовое меню
bot.command(['menu', 'start'], async (ctx) => {
  const messageData = botService.getStartMenu();

  const id = ctx.from?.id;

  const first_name = ctx.from?.first_name;

  if (!id || !first_name) {
    return;
  }

  // по умолчанию подписываем юзера
  const subscribed = 1;
  botService.ensureUser(id, first_name, subscribed);

  await ctx.reply(messageData.replyMessage || '', {
    parse_mode: messageData.parseMode,
    reply_markup: messageData.replyMarkup,
  });
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

// слушаем любое сообщение от пользователя
bot.on("message", async (ctx) => {
  let messageEventData: MessageEventData = {};

  if (ctx.message.text) {
    const { first_name, username, id } = ctx.from;
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

// при старте бота нужно достать всех юзеров из базы, посмотреть, есть ли у каждого подписка и запустить автоматическую отправку сообщений
// пользователь нажал "Start Learning Words" запускаем отправку сообщений пользователю через указанный интервал
bot.callbackQuery(SUBSCRIBE, async (ctx) => {
  const sendRandomQuestion = async () => {
    // найти в базе рандомное слово и попросить у chartGPT придумать с ним предложение
    const messageEventData = await botService.getRandomTextByUserId(ctx.from.id);

    await ctx.reply(messageEventData.replyMessage || '', {
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
  }, config.DEFAULT_INTERVAL_VALUE);
});

const stopSending = () => {
  if (sendInterval) {
    clearInterval(sendInterval);
  }
}

// пользователь нажал 'Stop Learning Words', следовательно нужно прекратить отправку периодичных сообщений
bot.callbackQuery([UNSUBSCRIBE, /\/stop/], async (ctx) => {
  stopSending();
  ctx.reply('stopping!');
});

cron.schedule('*/5 * * * *', async () => {
  const wordsDataItems = await botService.selectByTopUsers(config.DEFAULT_USERS_AMOUNT);

  if (wordsDataItems.length) {
    console.log('[schedule]: wordsDataItems - ', wordsDataItems);
    botService.sendMessages(wordsDataItems, bot.api.sendMessage);
  } else {
    console.log('[schedule]: wordsDataItems is empty...');
  }
});

//Start the Bot
bot.start();
