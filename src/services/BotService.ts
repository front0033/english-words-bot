import { InlineKeyboardMarkup, ReplyKeyboardMarkup, ReplyKeyboardRemove, ForceReply, ParseMode } from "grammy/types";
import { getTranslatetMenuMarkup } from "../bot/ui/keyboards/translateMenu";
import { translateMenu } from "../bot/ui/menu";
import { ChartGPTService } from "../chartGPT/ChartGPTService";

export interface MessageEventParams {
  messageText: string | null;
  firstName: string;
}

export interface MessageEventData {
  replyMessage?: string;
  parseMode?: ParseMode;
  replyMarkup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export class BotService {
  private translating: boolean = false;
  private wordToTranslate: string | null = null;
  private currentTranslate: string | null = null;
  private sendInterval: any;

  public async messageEventHandler(data: MessageEventParams): Promise<MessageEventData> {
    const { messageText, firstName } = data;

    let messageData: MessageEventData = {};

    if (messageText) {
      switch (true) {

        // когда пользователь ввел слово, и хочет получить варианты переводов
        case this.translating:
          messageData = await this.translateWordEventHandler(data);

          break;
        default:
          messageData.replyMessage = 'Sorry. This bot will work very soon, but now it is at the development stage...';
      }
    }

    return messageData;
  }

  // пользователь нажал на кнопку добавить слово, отправляем ему предложение "давайте добавим новое слово"
  public addWordEventHandler(): MessageEventData  {
    const messageData: MessageEventData = {};

    messageData.replyMessage = 'please write a word...';
    this.translating = true;

    return messageData;
  }

  public async translateWordEventHandler(data: MessageEventParams): Promise<MessageEventData>  {
    const messageData: MessageEventData = {};

    if (!this.translating) {
      console.log('Trying to translate without word... data: ', data);
      messageData.replyMessage = 'Please press add button again';
      return messageData;
    }

    const { messageText } = data;

    const chartGPT = ChartGPTService.ensure();
    // когда пользователь находится в режиме добавления слова, он должен получить список возможных переводов к слову
    const translates = await chartGPT.translateWord(messageText || '');
    console.log('translates: ', translates);
    messageData.replyMessage = translateMenu;
    messageData.parseMode = 'HTML',
    messageData.replyMarkup = getTranslatetMenuMarkup(translates),
    this.translating = false;
    this.wordToTranslate = messageText;

    return messageData;
  }

  // когда выбрал перевод, и ожидает что слово сохранится с этим переводом
  public selectTranslateEvetHandler(data: MessageEventParams): MessageEventData  {
    const { messageText, firstName } = data;
    const messageData: MessageEventData = {};

    if (!!this.wordToTranslate) {
      this.currentTranslate = messageText;
      console.log('this.currentTranslate: ', this.currentTranslate);

      // далее сохраняем слово в базу данных

      this.translating = false;
      this.wordToTranslate = null;
      this.currentTranslate = null;
    }

    return messageData;
  }
}
