import { InlineKeyboard } from "grammy";
import { TRANSLATE } from "../../actions";

export function getTranslatetMenuMarkup(transalates: (string | null)[]) {
  //Build keyboard
  const translateMenuMarkup = new InlineKeyboard();

  transalates.forEach((transalate) => {
    if (transalate) {
    translateMenuMarkup.text(transalate, TRANSLATE);
    }
  });

  return translateMenuMarkup;
}

