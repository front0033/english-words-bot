import { Bot, CallbackQueryContext, Context } from "grammy";

import { config } from "./config";
import { ADD, SUBSCRIBE, UNSUBSCRIBE } from "./bot/actions";
import { BotService, MessageEventData, UserState } from "./services/BotService";
import cron from 'node-cron';

//Create a new bot
const bot = new Bot(String(config.TELEGRAM_TOKEN));
const botService = new BotService();

const apiSendMessage = (chatId: number, text: string) => {
  bot.api.sendMessage(chatId, text, { parse_mode: 'HTML' });
}

let sendInterval: any; // TODO: записать состояние для кажддого юзера в базу: подписан от на сообщения от бота или нет

// начало работы с ботом, показываем юзеру базовое меню
bot.command(['menu', 'start'], async (ctx) => {
  const messageData = botService.getStartMenu();
  const id = ctx.from?.id;
  const chatId = ctx.chat.id;

  const first_name = ctx.from?.first_name;

  if (!id || !first_name) {
    return;
  }

  // по умолчанию подписываем юзера
  const subscribed = 1;
  botService.ensureUser(id, first_name, chatId, subscribed);

  await ctx.reply(messageData.replyMessage || '', {
    parse_mode: messageData.parseMode,
    reply_markup: messageData.replyMarkup,
  });
});

// начало работы с ботом, показываем юзеру базовое меню
bot.command(['count', 'usersCount'], async (ctx) => {
  const messageData = await botService.getUsersCount();

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

const toggleSubsrcibe = (ctx: CallbackQueryContext<Context>, subscribed: 0 | 1) => {
  const userName = ctx.from?.first_name;
  const id = ctx.from?.id;
  const chatId = ctx.chat?.id;
  const first_name = ctx.from?.first_name;

  if (chatId) {
    console.log('[toggleSubsrcibe]: user ', userName || id, subscribed ? ' have subscribed...' : ' have unsubscribed...');
    botService.ensureUser(id, first_name, chatId, subscribed);
  }
}

// при старте бота нужно достать всех юзеров из базы, посмотреть, есть ли у каждого подписка и запустить автоматическую отправку сообщений
// пользователь нажал "Start Learning Word" запускаем отправку сообщений пользователю через указанный интервал
bot.callbackQuery(SUBSCRIBE, async (ctx) => {
  toggleSubsrcibe(ctx, 1);

  const [data] = await botService.findWordByUserId(ctx.from?.id);

  if (!data) {
    ctx.reply('You have no words. Please add...');

    return;
  }

  const message = await botService.makeMessage(data);
  const chatId = ctx.chat?.id;

  if (chatId) {
    apiSendMessage(chatId, message);
  } else {
    ctx.reply('unknown error...');
  }
});

// пользователь нажал 'Stop Learning Word', следовательно нужно прекратить отправку периодичных сообщений
bot.callbackQuery([UNSUBSCRIBE, /\/stop/], async (ctx) => {
  toggleSubsrcibe(ctx, 0);
  ctx.reply('You unsubscribed from messages.');
});

cron.schedule(`*/${config.CRON_MINUTES} * * * *`, async () => {
  console.log('[schedule]: started...');
  const wordsDataItems = await botService.selectByTopUsers(config.DEFAULT_USERS_AMOUNT);

  if (wordsDataItems.length) {
    console.log('[schedule]: wordsDataItems - ', wordsDataItems);
    botService.sendMessages(wordsDataItems, apiSendMessage);
  } else {
    console.log('[schedule]: wordsDataItems is empty...');
  }
});

//Start the Bot
bot.start();
