import React from 'react'

import { withStyles } from '@material-ui/core/styles';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';

import LessonCard from './lessonCard';

const Accordion = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiAccordion);
  
const AccordionSummary = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .03)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
}))(MuiAccordionDetails);

export default function LessonsAccordion({lessons, onRemoveLesson}) {
  const [expanded, setExpanded] = React.useState("");
  const handleChange = React.useCallback((panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  }, [setExpanded]);

  return Object.keys(lessons).map(group => {
    const groupLessons = lessons[group];
    return (
      <Accordion square expanded={expanded === group} key={group} onChange={handleChange(group)}>
        <AccordionSummary aria-controls={`${group}-content`} id={`${group}-header`}>
        <Typography>Группа {group}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {groupLessons.map((lesson,i) => <LessonCard lesson={lesson} key={i} onRemoveLesson={onRemoveLesson}/>)}
        </AccordionDetails>
      </Accordion>
    )
  });
}
