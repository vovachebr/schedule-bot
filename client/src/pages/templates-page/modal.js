import React from 'react';
import { withSnackbar } from 'notistack';
import DateFnsUtils from '@date-io/date-fns';

import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Switch from '@material-ui/core/Switch';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Check } from '@material-ui/icons';

import { HooksContext } from '../../App';

const useStyles = makeStyles((theme) => ({
  modalRoot: {
    position: 'fixed',
    left: "35%",
    top: "10%",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  templateInput: {
    marginTop: "5%",
    marginBottom: "5%",
    width: "100%"
  },
  textArea: {
    resize: "none",
    width: "100%"
  },
  datePicker: {
    width: "100%"
  }
}));

function CreateTemplateModal(props){
  const classes = useStyles();
  const [messageText, setMessageText] = React.useState("");
  const [templateLabel, setTemplateLabel] = React.useState("");

  const [checked, toggleChecked] = React.useState(false);
  const [selectedDate, handleDateChange] = React.useState(new Date());
  const [channel, setChannel] = React.useState('');

  const resetFields = () => {
    setTemplateLabel("");
    setMessageText("");
    toggleChecked(false);
    handleDateChange("");
    setChannel("");
  }

  const saveTemplate = () => {
    const body = {};
    body.title = templateLabel;
    body.value = messageText;
    if(props.template)
      body.id = props.template.id;
      
    if(checked){
      body.schedule = {
        channel,
        date: selectedDate && new Date(selectedDate).toISOString().slice(0,10)
      }
    }
    fetch(`${process.env.REACT_APP_API_URL}/templates/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    }).then(res => res.json()).then(res => {
      if(!res.success){
        props.enqueueSnackbar(res.error, { variant: 'error' });
        return;
      }

      props.enqueueSnackbar("Выполнено успешно", { variant: 'success' });
      resetFields();
      props.onClose();
      props.onUpdate(res.templates);
    });
  };

  const renderedModal = () => {
    if(props.template){
      setTemplateLabel(props.template.title);
      setMessageText(props.template.value);
      if(props.template.schedule){
        toggleChecked(true);
        handleDateChange(props.template.schedule.date);
        setChannel(props.template.schedule.channel);
      }
    }
  };
      
  const printCalendar = () => 
  <>
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        className={classes.datePicker}
        disableToolbar
        variant="inline"
        format="MM/dd/yyyy"
        margin="normal"
        label="Дата отправки сообщения"
        defaultValue={new Date().toISOString().slice(0,10).split("-").join("/")}
        error={false}
        value={selectedDate}
        onChange={handleDateChange}
        KeyboardButtonProps={{
          'aria-label': 'change date',
        }}
      />
      <HooksContext.Consumer>
      {data => (
        <Autocomplete
          id="channel-combo-box"
          value={channel}
          options={data.hooks.map(h => h.channel)}
          getOptionLabel={(h) => h}
          onChange={(event, value) => setChannel(value)}
          style={{ width: '100%' }}
          renderInput={(params) => <TextField {...params} label="Канал" variant="outlined" />}
        />
      )}
      </HooksContext.Consumer>
      </MuiPickersUtilsProvider>
    </>

    return (
    <Modal
      open={props.open}
      onRendered={renderedModal}
      onClose={() => {resetFields(); props.onClose();}}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <div className={classes.modalRoot}>
        <TextField
          label="Название шаблона"
          variant="outlined"
          value={templateLabel}
          className={classes.templateInput}
          onChange={event => setTemplateLabel(event.target.value)}
        />

        <TextareaAutosize 
          className={classes.textArea}
          aria-label="minimum height"
          rowsMin={5}
          rowsMax={20}
          placeholder="Текст сообщения"
          value={messageText}
          onChange={event => setMessageText(event.target.value)}
        />
        <FormControlLabel
          control={<Switch checked={checked} onChange={() => toggleChecked(!checked)} />}
          label="Использовать дату отправки"
        />
        {checked && printCalendar()}
        <br/>
        <Button
          variant="contained"
          color="primary"
          endIcon={<Check/>}
          onClick={() => saveTemplate()}
        >
        {props.template ? "Обновить" : "Создать"}
        </Button>
      </div>
    </Modal>
  );
}

export default withSnackbar(CreateTemplateModal);
