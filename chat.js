const TelegramBot = require("node-telegram-bot-api");

const token = "6154337959:AAE5sgQ_Yv-878vmP7oDkyoXLxuAME_MFNM";
const bot = new TelegramBot(token, { polling: true });
const waitingList = [];
const chatSessions = {};

// Handle "/start" command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Welcome to the Encrypted Pair Chat Bot! To start chatting, type /find."
  );
});

// Handle "/find" command
bot.onText(/\/find/, (msg) => {
  const chatId = msg.chat.id;

  if (chatId in chatSessions) {
    bot.sendMessage(
      chatId,
      "You are already in a chat. Use /end to leave the chat."
    );
  } else if (waitingList.includes(chatId)) {
    bot.sendMessage(
      chatId,
      "You are already in the waiting list. Please wait for a partner to be assigned."
    );
  } else {
    waitingList.push(chatId);
    tryMatchPartners();
  }
});

// Handle "/end" command
bot.onText(/\/end/, (msg) => {
  const chatId = msg.chat.id;

  if (chatId in chatSessions) {
    const partnerId = chatSessions[chatId];
    if (partnerId) {
      bot.sendMessage(chatId, "Chat ended.");
      bot.sendMessage(partnerId, "Chat ended.");
      delete chatSessions[chatId];
      delete chatSessions[partnerId];
      tryMatchPartners();
    } else {
      bot.sendMessage(chatId, "You don't have an ongoing chat.");
    }
  } else if (waitingList.includes(chatId)) {
    const index = waitingList.indexOf(chatId);
    waitingList.splice(index, 1);
    bot.sendMessage(chatId, "You have left the waiting list.");
  } else {
    bot.sendMessage(chatId, "You don't have an ongoing chat.");
  }
});

// Handle incoming messages
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (chatId in chatSessions) {
    const partnerId = chatSessions[chatId];
    if (partnerId) {
      bot.sendMessage(partnerId, text);
    } else {
      bot.sendMessage(
        chatId,
        "You don't have an ongoing chat. Use /find to search for a partner to chat with."
      );
    }
  } else {
    bot.sendMessage(
      chatId,
      "You don't have an ongoing chat. Use /find to search for a partner to chat with."
    );
  }
});

// Try to match partners from the waiting list
function tryMatchPartners() {
  while (waitingList.length >= 2) {
    const user1 = waitingList.shift();
    const user2 = waitingList.shift();

    chatSessions[user1] = user2;
    chatSessions[user2] = user1;

    bot.sendMessage(
      user1,
      "Partner found! Remember to speak in English with your partner."
    );
    bot.sendMessage(
      user2,
      "Partner found! Remember to speak in English with your partner."
    );
  }
}
