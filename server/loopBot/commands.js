const { LOOP_URL, LOOP_BOT_TOKEN } = process.env;

const router = require("express").Router();
const fetch = require("node-fetch");
const sendLoopMessage = require("./sendLoopMessage");
const { connect } = require('./../util/mongoConnector');

const Logger = require("./../util/logger");

router.post("/create_hook", async (request, response) => {
  const channelId  = request.body.channel_id;
  const channelName = request.body.channel_name;
  const userId = request.body.user_id;

  const userFetchFullResponse = await fetch(`${LOOP_URL}/api/v4/users/${userId}`, {
    headers: {
      "Authorization": "Bearer " + LOOP_BOT_TOKEN,
    }
  });

  const userFetchResponse = await userFetchFullResponse.json();

  if(!(userFetchResponse.roles.includes("system_user") && userFetchResponse.roles.includes("system_admin"))) {
    await sendLoopMessage(channelId, {
      message: "Ошибка! Команда доступна только администраторам."
    });

    return;
  }

  connect(async (client) => {
    const db = client.db("schedule");
    const hooksCollection = db.collection("hooks");

    const foundHooks = await hooksCollection.find({$or: [{channelId},{group: channelName}]}).toArray();
    if(foundHooks.length > 0){
      client.close();
      await sendLoopMessage(channelId, {
        message: "Ошибка! Хук уже существует❗️❗️❗️"
      });
      return;
    }

    await hooksCollection.insertOne({group: channelName, channelId, channel: channelName, messegerType: "loop" })
    await sendLoopMessage(channelId, {
      message: "Успешно добавлено."
    });
  });
});

router.post("/remove_hook", async (request, response) => {
  const channelId  = request.body.channel_id;
  const channelName = request.body.channel_name;
  const userId = request.body.user_id;

  const userFetchFullResponse = await fetch(`${LOOP_URL}/api/v4/users/${userId}`, {
    headers: {
      "Authorization": "Bearer " + LOOP_BOT_TOKEN,
    }
  });

  const userFetchResponse = await userFetchFullResponse.json();

  if(!(userFetchResponse.roles.includes("system_user") && userFetchResponse.roles.includes("system_admin"))) {
    await sendLoopMessage(channelId, {
      message: "Ошибка! Команда доступна только администраторам."
    });

    return;
  }

  connect(async (client) => {
    const db = client.db("schedule");
    const hooksCollection = db.collection("hooks");

    const hooks = await hooksCollection.find({$or: [{channelId: channelId},{group: channelName}]}).toArray();
    if(hooks.length == 0){
      client.close();
      await sendLoopMessage(channelId, {
        message: "Ошибка! Хук уже удалён❗️❗️❗️"
      });
      return;
    }
  
    await hooksCollection.remove({channelId: channelId});
    await sendLoopMessage(channelId, {
      message: "Хук успешно удалён"
    });
  });
});

router.post("/addme", (request, response) => {
  const groupName = request.body.text;
  const userId = request.body.user_id;
  const userName = request.body.user_name;
  const channelId = request.body.channel_id;
   
  connect(async (client) => {
    const db = client.db("schedule");
    const hooksCollection = db.collection("hooks");

    const hook = await hooksCollection.findOne({$and: [{messegerType: "loop"},{channel: groupName}]});
    if(!hook){
      client.close();
      await sendLoopMessage(channelId, {
        message: `@${userName} Канал ${groupName} не найден. Обратитесь к координатору курса за помощью.`
      });

      Logger.sendUserTextMessage(userName, groupName, `Неудачная попытка пользователя добавиться в канал *${groupName}*. ☹️`)
      return;
    }

    const addUserToChannelFetchFullResponse = await fetch(`${LOOP_URL}/api/v4/channels/${hook.channelId}/members`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userId
      }),
      headers: {
        "Authorization": "Bearer " + LOOP_BOT_TOKEN,
      },
    });
    
    await addUserToChannelFetchFullResponse.json();
    await sendLoopMessage(channelId, {
      message: `@${userName}, добавил вас в ${groupName}.`
    });

    Logger.sendUserTextMessage(userName, groupName, `Удачная попытка пользователя добавиться в канал *${groupName}*. 🎉`)
  });
});

module.exports = router;