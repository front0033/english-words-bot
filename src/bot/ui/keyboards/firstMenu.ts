import { InlineKeyboard } from "grammy";
import { ADD, SEND, STOP } from "../../actions";
import { addWordButton, startLearningAddedWordsButton, stopLearningAddedWordsButton } from "../buttons";

//Build keyboard

export function getFirstMenuMarkup() {
  const firstMenuMarkup = new InlineKeyboard()
    .text(addWordButton, ADD)
    .text(startLearningAddedWordsButton, SEND)
    .text(stopLearningAddedWordsButton, STOP);

  return firstMenuMarkup;
}

