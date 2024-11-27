const { LOOP_URL, LOOP_BOT_TOKEN } = process.env;

async function sendLoopMessage(channelId, data) {
  return fetch(`${LOOP_URL}/api/v4/posts`, {
    headers: {
      'Authorization': 'Bearer ' + LOOP_BOT_TOKEN,
    },
    method: "POST",
    body: JSON.stringify({
      channel_id: channelId,
      ...data
    })
  });
}

module.exports = sendLoopMessage;