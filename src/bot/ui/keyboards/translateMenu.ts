import { InlineKeyboard } from "grammy";
import { TRANSLATE_BUTTONS } from "../../actions";

export function getTranslatetMenuMarkup(transalates: (string | null)[]) {
  //Build keyboard
  const translateMenuMarkup = new InlineKeyboard();

  transalates.forEach((transalate, index) => {
    if (transalate) {
    translateMenuMarkup.text(transalate, TRANSLATE_BUTTONS[index]);
    }
  });

  return translateMenuMarkup;
}

