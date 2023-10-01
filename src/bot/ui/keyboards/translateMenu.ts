import { InlineKeyboard } from "grammy";

export const TRANSLATE_PREFIX = 'translate:';

export function getTranslatetMenuMarkup(transalates: (string | null)[]) {
  //Build keyboard
  const translateMenuMarkup = new InlineKeyboard();

  transalates.forEach((transalate) => {
    if (transalate) {
      translateMenuMarkup.text(transalate, `${TRANSLATE_PREFIX}${transalate}`);
    }
  });

  return translateMenuMarkup;
}

