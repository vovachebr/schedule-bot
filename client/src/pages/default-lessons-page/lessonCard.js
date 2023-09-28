import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import { DeleteForever } from '@material-ui/icons';

const useStyles = makeStyles({
  root: {
    width: 300,
    marginBottom: '2%',
    boxShadow: '5px 5px 10px 0px black'
  },
  title: {
    fontSize: 14
  },
  textArea: {
    width: '100%',
    resize: 'none'
  },
  info: {
    textAlign: 'left'
  }
});

export default function LessonCard({lesson, onRemoveLesson}) {
  const classes = useStyles();
  return (
    <>
      <Card className={classes.root}>
        <CardContent>
          <Typography className={classes.title} color="textSecondary" gutterBottom>
            {lesson.lessonName}
          </Typography>
          <Typography className={classes.teacher} color="primary" gutterBottom>
            {lesson.teacher}
          </Typography>
          <TextareaAutosize 
            className={classes.textArea}
            aria-label="minimum height"
            rowsMin={5}
            rowsMax={20}
            placeholder="Текст сообщения"
            value={lesson.additional}
            disabled
          />
          <Fab
            color="primary"
            size="small"
            onClick={() => onRemoveLesson(lesson.id)}
          >
            <DeleteForever />
          </Fab>
        </CardContent>
      </Card>
    </>
  );
}
