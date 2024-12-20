const { URL, LOOP_URL, LOOP_BOT_TOKEN } = process.env;
const fetch = require("node-fetch");

const telegramBot = require('./telegramBot');
const Logger = require('./util/logger');
const { connect } = require('./util/mongoConnector');
const getLessonText = require('./util/lessonFormatter');

const sleep = async () => {
  return await new Promise(resolve => setTimeout(resolve, 15000))//задержка 15сек
}

const formatLessonForLogger = (lessonObject) => {
  let resultMessage = "";
  resultMessage += `Тема занятия: *${lessonObject.lecture}* \n`;
  resultMessage += `Преподаватель: *${lessonObject.teacher}* \n`;
  resultMessage += `Дата: *${lessonObject.date.split('-').reverse().join('.')}* \n`;
  resultMessage += `Время: *${lessonObject.time}*`;
  return resultMessage;
}

function schedule(){
  Logger.sendMessage("Запускаю отправку всех сообщений");
  connect(async dataBaseClient => {
    const db = dataBaseClient.db("schedule");
    const lessonsCollection = db.collection("lessons");
    const hooksCollection = db.collection("hooks");

    const today = new Date().toISOString().slice(0,10); // сегодня в формате YYYY-MM-DD
    const lessons = await lessonsCollection.find({date:today, isSent: false}).toArray() || []; // TODO: проверить, почему отправляются все сообщения
    
    const sender = async () => {
      for(const lesson of lessons){
        const hook = await hooksCollection.findOne({group: lesson.group});
        await sleep();
        sendLessonNotification(lesson, hook || {});
      }
    }
    await sender();
    await lessonsCollection.updateMany({date:today}, {$set: {isSent: true}});
  });
}

function startTemplates() {
  Logger.sendMessage("Запускаю отправку всех шаблонов");
  const today = new Date().toISOString().slice(0,10); // сегодня в формате YYYY-MM-DD

  const configer = {
    telegram: schedule.sendTelegramMessage,
    loop: schedule.sendLoopMessage,
  };

  connect(async (client) => {
    const db = client.db("schedule");
    const templatesCollection = db.collection("templates");
    const hooksCollection = db.collection("hooks");

    const todayTemplates = await templatesCollection.find({"schedule.date": today}).toArray() || [];

    for (let i = 0; i < todayTemplates.length; i++) {
      const template = todayTemplates[i];
      const hook = await hooksCollection.findOne({channel: template.schedule.channel});
      const sender = configer[hook.messegerType];

      const loggerMessage = {
        "Тип сообщения": "Шаблон по расписанию", 
        "Имя шаблона": template.title,
        "Канал": hook.channel,
        "Дата": template.schedule.date || "неизвестно",
      }
      sender(hook, template.value, loggerMessage);
      await templatesCollection.findOneAndUpdate({id: template.id}, {$unset: {schedule:""}})
    }
  });
}

function sendLessonNotification(lesson, hook){
  if(!hook){
    Logger.sendMessage("*Ошибка!* Не найден хук для занятия. Отправка не была выполнена. \n" + formatLessonForLogger(lesson));
    return;
  }

  if(!hook.messegerType){
    Logger.sendMessage("*Ошибка!* Отсутствует тип месседжера. Отправка не была выполенна. \n" + formatLessonForLogger(lesson));
    return;
  }

  lesson.date = lesson.date.split('-').reverse().join('.');
  const configuration = {
    telegram: (lesson, hook) => {
      const {group, image: imageName} = lesson;
      const textToSend = getLessonText(lesson);
      const imageLink = `${URL}/api/images/getImageByName?name=${imageName}`

      telegramBot.sendPhoto(hook.channelId, imageLink, {parse_mode: 'Markdown', caption: textToSend}).then((sentMessage) => {
        telegramBot.pinChatMessage(sentMessage.chat.id, sentMessage.message_id).catch(error => Logger.sendMessage(`У бота нет прав для закрепления сообщения`));
        Logger.sendMessage(`Уведомление успешно отправлено в *телеграмм* \n \`\`\` Группа: ${group} \`\`\` `);
      }).catch(error => Logger.sendMessage(`*Ошибка!* ${error.message}`))
    },
    loop: (lesson, hook) => {
      const {group, image: imageName, lecture, teacher, time, date} = lesson;
      const textToSend = getLessonText(lesson);
      const imageLink = `${URL}/api/images/getImageByName?name=${imageName}`;
      const loggerObject = {
        "Тема занятия": lecture,
        "Преподаватель": teacher,
        "Группа": group,
        "Изображение": imageName,
        "Дата": date.split('-').reverse().join('.'),
        "Время": time,
      }

      sendLoopMessage(hook, textToSend, imageLink, loggerObject);
    }
  }

  try {
    configuration[hook.messegerType] && configuration[hook.messegerType](lesson, hook); // Вызов конфигурации
  } catch (error) {
    Logger.sendMessage(JSON.stringify({lesson, hook, error: {stack: error.stack, message: error.stack }}, null, 2));
  }
}

function sendTelegramMessage(hook, message, imageLink, loggerObject = {}){
  const { channelId } = hook;

  (imageLink ? 
    telegramBot.sendPhoto(channelId, imageLink, {caption: message}) :
    telegramBot.sendMessage(channelId, message)).
      then((sentMessage) => {
        telegramBot.pinChatMessage(sentMessage.chat.id, sentMessage.message_id).catch(error => Logger.sendMessage(`У бота нет прав для закрепления сообщения`));
        let sendMessage = "Сообщение успешно отправлено в телеграмм \n";
        for(prop in loggerObject){
          sendMessage += `${prop}: *${loggerObject[prop]}* \n`;
        }
        Logger.sendMessage(sendMessage);
    });
}


async function sendLoopMessage(hook, message, imageLink, loggerObject = {}){
  await fetch(`${LOOP_URL}/api/v4/posts`, {
    headers: {
      'Authorization': 'Bearer ' + LOOP_BOT_TOKEN,
    },
    method: "POST",
    body: JSON.stringify({
      channel_id: hook.channelId,
      message,
      props: {
        attachments: [
          { image_url: imageLink } 
        ]
      }
    })
  });

  Logger.sendMessage(JSON.stringify(loggerObject, null, 2));
}


module.exports = {
  scheduler: schedule,
  sendTelegramMessage,
  sendLoopMessage,
  sendLessonNotification,
  startTemplates,
};