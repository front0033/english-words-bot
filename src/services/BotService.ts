import Bot, { InlineKeyboardMarkup, ReplyKeyboardMarkup, ReplyKeyboardRemove, ForceReply, ParseMode } from "grammy/types";
import { firstMenu } from "../bot/ui/menu";
import { ChartGPTService } from "../chartGPT/ChartGPTService";
import { connection } from "../db/connect";
import { WordWithUserId, WordDB } from '../db/word';
import { UserDB } from "../db/user";
import { getFirstMenuMarkup } from "../bot/ui/keyboards/firstMenu";
import User from "../db/models/user.model";

export interface MessageEventParams {
  messageText: string | null;
  firstName: string;
}

export interface MessageEventData {
  replyMessage?: string;
  parseMode?: ParseMode;
  replyMarkup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export enum UserState {
  WORD_ADDING = 'word-adding',
  STUDING = 'studing', // пока нигде не используется, подумать, нужно ли вообще
}

export class BotService {
  private chartGPTServise: ChartGPTService;
  private usersDB: UserDB;
  private wordsDB: WordDB;
  private userState: Record<number, UserState> = {};

  public constructor() {
    this.chartGPTServise = ChartGPTService.ensure();
    this.usersDB = new UserDB(connection);
    this.wordsDB = new WordDB(connection);
  }

  public async checkUser(userId: number) {
    await this.usersDB.retrieveById(userId);
  }

  public async setUser(userId: number, name: string, chatId: number) {
    await this.usersDB.save({
      id: userId,
      chat_id: chatId,
      name,
      last_usage_data: null,
      rating: null,
      subscribed: null,
      constructor: {
        name: 'RowDataPacket',
      }
    });
  }

  // пишем что юзер подписан или не подписан на отправку сообщений в базу
  public async ensureUser(userId: number, name: string, chatId: number, subscribed: number | null) {
    const user: User = {
      id: userId,
      chat_id: chatId,
      name,
      last_usage_data: null,
      rating: null,
      subscribed: subscribed,
      constructor: {
        name: 'RowDataPacket',
      }
    };

    try {
      const res = await this.usersDB.retrieveById(userId);
      console.log('[ensureUser]: res - ', res);

      if (!res) {
        await this.usersDB.save(user);
      } else {
        await this.usersDB.update(user)
      }
    } catch (error) {
      console.log('[ensureUser]: error - ', error);
    }

  }

  public async getRandomWordByUserId(userId: number) {
    const result = await this.wordsDB.getRandomWordByUserId(userId);

    return result.word;
  }

  // ? удалить так как есть новый запрос в базу который уже забирает слова по топ юзерам
  public async getRandomTextByUserId(userId: number): Promise<MessageEventData> {
    const word = await this.getRandomWordByUserId(userId);
    const text = await this.randomSentenceWithWord(word);
    const preparedText = text?.replace(word, `<b>${word}</b>`) ?? '';

    const messageData: MessageEventData = {
      replyMessage: preparedText,
    };

    return messageData;
  }

  public async randomSentenceWithWord(word: string) {
    const text = await this.chartGPTServise.randomSentenceWithWord(word);
    console.log('[randomSentenceWithWord]: text - ', text);
    return text;
  }

  public async messageEventHandler(data: MessageEventParams, userId: number): Promise<MessageEventData> {
    const { messageText } = data;

    let messageData: MessageEventData = {};

    if (messageText) {
      switch (true) {
        case this.userState[userId] === UserState.WORD_ADDING:
          const [word, translate] = messageText.split('-');
          const preparedWord = word?.trim().toLowerCase() ?? '';
          const preparedTranslate = translate?.trim().toLowerCase() ?? '';
          console.log('word: ', preparedWord, ', translate: ', preparedTranslate);
          // далее сохраняем слово в базу данных
          if (!preparedWord || !preparedTranslate) {
            messageData.replyMessage = 'preparedWord or preparedTranslate are undefined';

            return messageData;
          }

          try {
            await this.wordsDB.save({
              word: preparedWord,
              translate: preparedTranslate,
              user_id: userId,
              last_time_to_revise: new Date().toString(),
              part_of_speech: null,
              constructor: {
                name: 'RowDataPacket', // ???
              },
            }, userId);

            // отправляем пользователю сообщение что слово успешно добавлено
            // и менюшку базовую
            messageData = this.getStartMenu('Success');
          } catch (error) {
            console.log(error);
            messageData.replyMessage = 'unknown error... please repeat...';
          } finally {
            this.removeFromUserState(userId);
          }

          break;

        default:
          messageData.replyMessage = 'Sorry. This bot will work very soon, but now it is at the development stage...';
      }
    }

    return messageData;
  }

  public getStartMenu(message?: string) {
    let messageData: MessageEventData = {
      replyMessage: message || firstMenu,
      parseMode: 'HTML',
      replyMarkup: getFirstMenuMarkup(),
    };

    return messageData;
  }

  public setUserState(userId: number, state: UserState) {
    this.userState = {
      ...this.userState,
      [userId]: state,
    };

    console.log('[setState]: state - ', this.userState);
  }

  public removeFromUserState(userId: number) {
    delete this.userState[userId];
    console.log('[removeFromState]: state - ', this.userState);
  }

  // пользователь нажал на кнопку добавить слово, отправляем ему предложение "давайте добавим новое слово"
  public addWordEventHandler(): MessageEventData  {
    const messageData: MessageEventData = {};

    messageData.replyMessage = 'Please write a word and translate. Example: "Forthight - две недели" ';
    return messageData;
  }

  public selectByTopUsers(amountOfUsers: number) {
    return this.wordsDB.selectByTopUsers(amountOfUsers);
  }

  public async sendMessages(items: WordWithUserId[], sendMessage: (userId: number, text: string) => void) {
    const [{ userId, word, translate }, ...rest] = items;

    const text = await this.randomSentenceWithWord(word);
    const formattedText = text?.replace(word, `<b>${word}</b>`) || '';
    const translateText = ` (<b>${word}</b>: ${translate}).`;
    const message = `${formattedText} ${translateText}`;

    await sendMessage(userId, message);

    if (rest.length) {
      this.sendMessages(rest, sendMessage);
    }
  }
}
