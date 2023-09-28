import React from 'react';
import { withSnackbar } from 'notistack';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { NoteAdd } from '@material-ui/icons';

import CreateLessonModal from './modal';
import LessonsAccordion from './lessonsAccordion';

const useStyles = makeStyles({
    root:{
      width: "90%",
      marginTop: "2%",
      marginLeft: "5%"
    },
    buttonAdd: {
      marginBottom: "2%"
    },
});

function DefaultLessonsPage({enqueueSnackbar}) {
  const classes = useStyles();
  const [isLoading, setIsLoading] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [lessons, setLessons] = React.useState({});

  const createDefaultLesson = (lessonName, course, teacher, additional) => {
    setIsLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/defaultLessons/create`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({lessonName, course, teacher, additional})
      })
      .then(response => response.json())
      .then(res => {
        setIsLoading(false);
        if(res.success){
          setLessons(res.lessons);
          enqueueSnackbar("Успешно создано", { variant: 'success' });
        }else{
          enqueueSnackbar(res.error, { variant: 'error' });
        }
      });
  };
  const getTemplates = () => {
    setIsLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/defaultLessons/`)
      .then(response => response.json())
      .then(res => {
        setLessons(res.lessons);
        setIsLoading(false);
      });
  };

  const removeLesson = (id) => {
    setIsLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/defaultLessons/remove`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({id})
    })
    .then(response => response.json())
    .then(res => {
      setIsLoading(false);
      if(res.success){
        setLessons(res.lessons);
        enqueueSnackbar("Успешно удалено", { variant: 'success' });
      }else{
        enqueueSnackbar(res.error, { variant: 'error' });
      }
    });
  }

  React.useEffect(() => getTemplates(), []);

  return (
    <div className={classes.root}>
      <Button
        className={classes.buttonAdd}
        variant="contained"
        color="primary"
        endIcon={<NoteAdd/>}
        onClick={() => setOpenModal(true)}
      >
      Создать прикреплённое занятие
      </Button>
      <CreateLessonModal 
        open={openModal} 
        onClose={() => setOpenModal(false)}
        onCreate={(lessonName, course, teacher, additional) => {
          setOpenModal(false);
          createDefaultLesson(lessonName, course, teacher, additional)
        }}
      />
      <br />
      {
        isLoading ? 
        <CircularProgress /> :
        <LessonsAccordion lessons={lessons} onRemoveLesson={(id) => removeLesson(id)}/>
      }
    </div>
  );
}

export default withSnackbar(DefaultLessonsPage);
