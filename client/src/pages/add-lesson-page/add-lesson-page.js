import React from 'react';
import {withSnackbar} from 'notistack';

import {makeStyles} from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {Stars} from '@material-ui/icons';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  DateTimePicker,
} from '@material-ui/pickers';
import {HooksContext} from '../../App';

const useStyles = makeStyles(theme => ({
  formControl: {
    minWidth: 500,
  },
  page: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "50px"
  },
  column: {
    display: "flex",
    flexDirection: "column",
    width: "40%",
    minHeight: "900px",
  },
  pre: {
    display: "block",
    padding: "9.5px",
    margin: "0 0 10px",
    wordBreak: "break-all",
    wordWrap: "break-word",
    backgroundColor: "#f5f5f5",
    border: "1px solid #ccc",
    borderRadius: "10px",
    whiteSpace: "pre-wrap",
    textAlign: "initial"
  },
  messageConstructor: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "space-between"
  },
  sendButton: {
    marginTop: "20px",
  },
  liHelper: {
    textAlign: "initial"
  }
}));

function AddLessonPage({enqueueSnackbar}) {
  const classes = useStyles();

  const [hooks, setHooks] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState('');
  const [lecture, setLecture] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [lector, setLector] = React.useState("");
  const [additional, setAdditional] = React.useState("");
  const [backgroundsList, setBackgroundsList] = React.useState([]);
  const [imageNameToSend, setImageNameToSend] = React.useState("");
  const [templateToSend, setTemplateToSend] = React.useState(`<@&${process.env.REACT_APP_STUDENT_TAG_ID}> Добрый день!
Сегодня, **{date}**, в **{time}** по московскому времени состоится занятие «{lesson}». Его проведет **{lector}**.
{additional}

Ссылку на трансляцию вы найдёте в личном кабинете и в письме, которое сегодня придёт вам на почту за два часа до лекции.
`);

  const getDate = () => {
    const options = {
      month: '2-digit',
      day: 'numeric'
    };
    let todayDay = selectedDate.toLocaleString("ru", options);
    const getMounth = (num) => [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря"][num];
    const splittedData = todayDay.split(".");
    splittedData[1] = getMounth(+splittedData[1] - 1);
    return splittedData.join(' ');
  }

  React.useEffect(() => {
    fetch('/api/images/getNamesByType?type=фон')
    .then(response => response.json())
    .then(result => setBackgroundsList(result.data || []));
  }, []);

  const convertText = () => {

    return templateToSend
      .replace(/{date}/g, getDate())
      .replace(/{time}/g, getTime())
      .replace(/{lesson}/g, lecture)
      .replace(/{lector}/g, lector)
      .replace(/{additional}/g, additional);
  }

  const getTime = () => {
    const options = {
      hour: '2-digit',
      minute: '2-digit'
    };
    return selectedDate.toLocaleString("ru", options);
  }

  const getLastLesson = () => {
    if(!hooks.length === 0) {
      enqueueSnackbar("Необходимо выбрать канал для отправки", {variant: 'error'});
      return;
    }
    const course = hooks[0].group.split('-')[0].toUpperCase();
    fetch(`${process.env.REACT_APP_API_URL}/lessons/getLastLecture?lecture=${lecture}&course=${course}`)
      .then(response => response.json())
      .then(result => {
        if (result.success && result.lesson) {
          setLecture(result.lesson.lessonName);
          setLector(result.lesson.lector);
          setAdditional(result.lesson.additional);
          enqueueSnackbar("Успешно найдено", {variant: 'info'});
        } else {
          enqueueSnackbar(result.error || "Занятие не было найдено", {variant: 'error'});
        }
      });
  }

  const createLesson = () => {
    if(hooks.length === 0) {
      enqueueSnackbar("Нельзя создать анонс без группы", {variant: 'error'});
      return;
    }

    hooks.forEach(hook => {
      const data = {
        group: hook.group,
        text: templateToSend,
        image: imageNameToSend,
        date: selectedDate.toISOString().slice(0, 10),
        time: getTime(),
        teacher: lector,
        lecture,
        additional
      }
  
      fetch(`${process.env.REACT_APP_API_URL}/lessons/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            enqueueSnackbar("Успешно добавлено", {variant: 'success'});
            setHooks([]);
            setSearchValue("");
            setLecture("");
            setLector("");
            setAdditional("");
            setImageNameToSend("");
          } else {
            enqueueSnackbar(result.error, {variant: 'error'});
          }
        });
    });
  }

  return (
    <HooksContext.Consumer>
      {data => (
        <div className={classes.page}>
          <div className={classes.column}>
            <h2>Конструктор сообщения:</h2>
            <div className={classes.messageConstructor}>
              <FormControl variant="outlined" className={classes.formControl}>
                <Autocomplete
                  id="group"
                  multiple
                  options={data.hooks}
                  inputValue={searchValue}
                  onInputChange={(e, value) => setSearchValue(value)}
                  getOptionLabel={(h) => `Группа: "${h.group}", канал: "${h.channel}".`}
                  onChange={(event, value) => {
                    setHooks(value);
                  }}
                  style={{width: '100%'}}
                  renderInput={(params) => <TextField {...params} label="Группа/канал" variant="outlined"/>}
                />
              </FormControl>
              <TextField
                label="Название занятия"
                variant="outlined"
                value={lecture}
                onChange={event => setLecture(event.target.value)}
              />
              { hooks.length > 0 && <Button variant="outlined" color="primary" onClick={getLastLesson}>
                Получить закреплённое занятие к группе: {hooks[0].group}
                <Stars/>
              </Button> }
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DateTimePicker
                  variant="inline"
                  format="dd-MM-yyyy HH:mm"
                  autoOk={true}
                  minutesStep={5}
                  ampm={false}
                  margin="normal"
                  label="Дата и время занятия"
                  disablePast={true}
                  value={selectedDate}
                  error={false}
                  onChange={date => setSelectedDate(date)}
                />
              </MuiPickersUtilsProvider>
              <TextField
                label="Лектор"
                variant="outlined"
                value={lector}
                onChange={event => setLector(event.target.value)}
              />
              <TextareaAutosize
                aria-label="minimum height"
                rowsMin={5}
                rowsMax={10}
                placeholder="Обсуждаемые темы"
                value={additional}
                onChange={event => setAdditional(event.target.value)}
              />
              <FormControl variant="outlined" className={classes.formControl}>
                <Autocomplete
                  id="image-dropdown"
                  options={backgroundsList}
                  getOptionLabel={image => image.name}
                  onChange={(event, value) => setImageNameToSend(value && value.name)}
                  style={{width: '100%'}}
                  renderInput={(params) => <TextField {...params} label="Изображение для отправки" variant="outlined"/>}
                />
              </FormControl>
              <TextareaAutosize
                aria-label="minimum height"
                rowsMin={5}
                rowsMax={10}
                placeholder="Тест для отправки"
                value={templateToSend}
                onChange={event => setTemplateToSend(event.target.value)}
              />
              <ul className={classes.liHelper}>
                <li>{`<@&${process.env.REACT_APP_STUDENT_TAG_ID}> для тега всех студентов`}</li>
                <li>{`{date} для добавления даты занятия`}</li>
                <li>{`{time} для добавления времени занятия`}</li>
                <li>{`{lesson} для добавления темы занятия`}</li>
                <li>{`{lector} для добавления ФИ преподавателя`}</li>
                <li>{`{additional} для добавления обсуждаемых тем`}</li>
              </ul>
            </div>
          </div>
          <div className={classes.column}>
            <h2>Результат сообщения:</h2>
            <h3>Группы: {hooks.map(h => h.group).join("/") || "не заданы"}</h3>
            <h3>Сообщение:</h3>
            <pre className={classes.pre}>{convertText(templateToSend)}</pre>
            {imageNameToSend && <img alt="изображение для отправки" src={`${process.env.REACT_APP_API_URL}/images/getImageByName?name=${imageNameToSend}`}/>}
            <Button
              variant="contained"
              className={classes.sendButton}
              onClick={createLesson}>Создать занятие</Button>
          </div>
        </div>
      )}
    </HooksContext.Consumer>
  );
}

export default withSnackbar(AddLessonPage);
