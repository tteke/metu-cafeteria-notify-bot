const puppeteer = require('puppeteer');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

if (!fs.existsSync('./conf.js')) {
  console.error('Please run `npm configure` first');
  process.exit(1);
}

const { botToken, chatId} = require('./conf.js');

const cafeteriaUrl = 'http://kafeterya.metu.edu.tr';

const notify = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(cafeteriaUrl);

  const mealData = await page.evaluate(() => {
    const mealDivs = document.querySelector('.yemek-listesi:nth-of-type(2)').querySelectorAll('.yemek');

    return Array.prototype.map.call(mealDivs, div => {
      
      const mealName = div.querySelector('p').textContent;
      const mealUrl = div.querySelector('img').src;

      return {
        mealName,
        mealUrl
      }
    });
  });

  const theBot = new TelegramBot(botToken, { polling: true });

  theBot.sendMessage(chatId, 'Gunun Menusu');
  theBot.sendMediaGroup(chatId, mealData.map(e => ({
    type: 'photo',
    media: e.mealUrl,
    caption: e.mealName
  })));

  return true;
};

const notifyDaily = async () => {
  console.log('scheduled for next day.');
  setTimeout(async () => {
    await notify()
    await notifyDaily();
  }, 24 * 60 * 60 * 1000)
};

const desiredHour = 11;
const desiredMinute = 00;

const date = new Date();

if (date.getHours() >= desiredHour && date.getMinutes() >= desiredMinute) {
  const tomorrow = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  tomorrow.setHours(desiredHour);
  tomorrow.setMinutes(desiredMinute);
  tomorrow.setSeconds(0);
  tomorrow.setMilliseconds(0);

  setTimeout(async () => {
    await notify();
    await notifyDaily();
  }, tomorrow.getTime() - date.getTime());

} else {
  const today = new Date();
  today.setHours(desiredHour);
  today.setMinutes(desiredMinute);
  today.setSeconds(0);
  today.setMilliseconds(0);


  setTimeout(async () => {
    await notify();
    await notifyDaily();
  }, today.getTime() - date.getTime());

}