import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { Check } from '@material-ui/icons';

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
    marginBottom: "5%",
    width: "100%"
  },
  textArea: {
    resize: "none",
    width: "100%"
  }
}));

export default function CreateLessonModal(props){
  const classes = useStyles();
  const [lessonName, setLessonName] = React.useState("");
  const [course, setCourse] = React.useState('');
  const [teacher, setTeacher] = React.useState("");
  const [additional, setAdditional] = React.useState("");

  const resetFields = () => {
    setLessonName('');
    setCourse('');
    setTeacher('');
    setAdditional('');
  }
    
  return (
  <Modal
    open={props.open}
    onClose={() => {
      resetFields();
      props.onClose();
    }}
    aria-labelledby="simple-modal-title"
    aria-describedby="simple-modal-description"
  >
    <div className={classes.modalRoot}>
      <TextField
        label="Название занятия"
        variant="outlined"
        value={lessonName}
        className={classes.templateInput}
        onChange={event => setLessonName(event.target.value)}
      />
      <TextField
        label="Код курса"
        variant="outlined"
        value={course}
        className={classes.templateInput}
        onChange={event => setCourse(event.target.value)}
      />
      <TextField
        label="Преподаватель"
        variant="outlined"
        value={teacher}
        className={classes.templateInput}
        onChange={event => setTeacher(event.target.value)}
      />
      <TextareaAutosize 
        className={classes.textArea}
        aria-label="minimum height"
        rowsMin={5}
        rowsMax={20}
        placeholder="Обсуждаемые темы"
        value={additional}
        onChange={event => setAdditional(event.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        endIcon={<Check/>}
        onClick={() => {
          props.onCreate(lessonName, course, teacher, additional);
          resetFields();
        }}
      >
      Создать
      </Button>
    </div>
  </Modal>
  );
}
