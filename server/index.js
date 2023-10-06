require('dotenv').config();
const { PORT, DISCORD_BOT_TOKEN, TELEGRAM_BOT_TOKEN } = process.env;
const express = require('express');
const basicAuth = require('express-basic-auth');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const api = require('./routes').router;
const telegramBot = require('./telegramBot');
const discordBot = require('./discordBot');
const CronJob = require('cron').CronJob;
const schedule = require('./schedule');
const job = new CronJob(
  '0 0 10 * * *',
  function() {
    schedule.scheduler();
    schedule.startTemplates();
  },
  null,
  true,
  'Europe/Moscow'
);
job.start();

discordBot.login(DISCORD_BOT_TOKEN);
const app = express();
app.use((req, res, next) => {
  if(req.url.startsWith('/api/images/getImageByName')) {
    next();
  }
}), basicAuth({
  authorizer: (username, password) => !!(username && password),
  unauthorizedResponse: () => 'No credentials provided'
});
app.use(morgan('tiny'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', api);

app.post(`/bot${TELEGRAM_BOT_TOKEN}`, function(request, response){
  telegramBot.processUpdate(request.body);
});

app.use(express.static(__dirname));

app.get("/*", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(`Server started at ${PORT}`));