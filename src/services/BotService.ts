import { InlineKeyboardMarkup, ReplyKeyboardMarkup, ReplyKeyboardRemove, ForceReply, ParseMode } from "grammy/types";
import { getTranslatetMenuMarkup } from "../bot/ui/keyboards/translateMenu";
import { firstMenu, translateMenu } from "../bot/ui/menu";
import { ChartGPTService } from "../chartGPT/ChartGPTService";
import { Words } from '../db/words';
import { connection } from "../db/connect";
import { getFirstMenuMarkup } from "../bot/ui/keyboards/firstMenu";

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
}

export class BotService {
  private chartGPTServise: ChartGPTService;
  private wordsDB: Words;
  private userState: Record<number, UserState> = {};

  public constructor() {
    this.chartGPTServise = ChartGPTService.ensure();
    this.wordsDB = new Words(connection);
  }

  public async messageEventHandler(data: MessageEventParams, userId: number): Promise<MessageEventData> {
    const { messageText, firstName } = data;

    let messageData: MessageEventData = {};

    if (messageText) {
      switch (true) {
        case this.userState[userId] === UserState.WORD_ADDING:
          const [word, translate] = messageText.split('-');
          const preparedWord = word.trim();
          const preparedTranslate = translate.trim();
          console.log('word: ', preparedWord, ', translate: ', preparedTranslate);
          // далее сохраняем слово в базу данных
          this.wordsDB.save({
            word: preparedWord,
            translate: preparedTranslate,
            user_id: userId,
            last_time_to_revise: new Date().toString(),
            part_of_speech: null,
            constructor: {
              name: 'RowDataPacket', // ???
            },
          }, userId);

          this.removeFromUserState(userId);

          // отправляем пользователю сообщение что слово успешно добавлено
          // и менюшку базовую
          messageData = this.getStartMenu('Success');

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
}
