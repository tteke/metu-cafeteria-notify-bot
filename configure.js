const Input = require('prompt-input');
const fs = require('fs');

const q_token = new Input({
  name: 'token',
  message: 'What is the telegram bot api token?'
});

const q_chatId = new Input({
  name: 'chatId',
  message: 'Where do you want the messages to be send (chat_id)'
});

(async () => {
  const token = await q_token.run()
  const chatId = await q_chatId.run()

  fs.writeFileSync('conf.js', `module.exports = { botToken: "${token}", chatId: "${chatId}"};`)

  console.info('Your configuration was written successfully.');
})();