const { connect } = require('./mongoConnector');
const telegramBot = require("../telegramBot");

class Logger {
  static sendUserTextMessage(userName, channelName, message){
    let sendMessage = message + "\n";
    sendMessage += `Пользователь: <@${userName}>\n`;
    sendMessage += "Имя: *" + userName + "*\n";
    sendMessage += "В группу: *" + channelName + "*\n";
    this.sendMessage(sendMessage);
  }

  static sendMessage(message){
    connect(async (client) => {
      const db = client.db("schedule");
      const hooksCollection = db.collection("hooks");
      const hook = await hooksCollection.findOne({group: "sheduler-center"});
      if(hook) {
        telegramBot.sendMessage(Number(hook.channelId), '```json \n' + message + '```', {parse_mode: 'MarkdownV2'});
      }
    });
  }
}

module.exports = Logger;