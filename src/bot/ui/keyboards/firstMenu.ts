import { InlineKeyboard } from "grammy";
import { ADD, SUBSCRIBE, UNSUBSCRIBE } from "../../actions";
import { addWordButton, startLearningAddedWordsButton, stopLearningAddedWordsButton } from "../buttons";

//Build keyboard

export function getFirstMenuMarkup() {
  const firstMenuMarkup = new InlineKeyboard()
    .text(addWordButton, ADD)
    .text(startLearningAddedWordsButton, SUBSCRIBE)
    .text(stopLearningAddedWordsButton, UNSUBSCRIBE);

  return firstMenuMarkup;
}

