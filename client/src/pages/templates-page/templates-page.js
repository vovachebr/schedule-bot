import React from 'react';
import { withSnackbar } from 'notistack';

import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';

import { NoteAdd } from '@material-ui/icons';
import DeleteIcon from '@material-ui/icons/Delete';

import CreateTemplateModal from './modal';

const useStyles = makeStyles((theme) => ({
    template: {
      marginTop: "2%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },
    buttonAdd: {
      marginBottom: "2%"
    },
    circularDiv: {
      height: "40px"
    },
    list: {
      width: "90%"
    }
}));

function TemplatesPage({enqueueSnackbar}) {
  const classes = useStyles();
  const [openModal, setOpenModal] = React.useState(false);
  const [templates, setTemplates] = React.useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = React.useState(false);
  const [isLoadingOneTemplate, setIsLoadingOneTemplate] = React.useState(false);
  const [editTemplate, setEditTemplate] = React.useState();

  const getTemplates = () => {
    setIsLoadingTemplates(true);
    fetch(`${process.env.REACT_APP_API_URL}/templates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(res => res.json()).then(res => {
      setTemplates(res.templates);
      setIsLoadingTemplates(false);
    });
  };

  const getOneTemplate = (id) => {
    setIsLoadingOneTemplate(true)
    fetch(`${process.env.REACT_APP_API_URL}/templates?id=${id}`)
      .then(response => response.json())
      .then(result => {
        setEditTemplate(result.template)
        setIsLoadingOneTemplate(false);
        setOpenModal(true);
      });
  };

  const deleteTemplate = (id) => {
    setIsLoadingOneTemplate(true)
    fetch(`${process.env.REACT_APP_API_URL}/templates/remove`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({id})
    })
    .then(response => response.json())
    .then(res => {
      setTemplates(res.templates);
      enqueueSnackbar("Успешно удалено", { variant: 'success' });
      setIsLoadingOneTemplate(false);
    });
  };

  React.useEffect(() => getTemplates(), []);
  
  return (
    <div className={classes.template}>
      <Button
        className={classes.buttonAdd}
        variant="contained"
        color="primary"
        endIcon={<NoteAdd/>}
        onClick={() => setOpenModal(true)}
      >
      Создать шаблон сообщения
      </Button>
      {(isLoadingTemplates || isLoadingOneTemplate) ? <CircularProgress /> : <div className={classes.circularDiv}/>}
      <CreateTemplateModal 
        template={editTemplate}
        open={openModal} 
        onClose={() => {
          setOpenModal(false);
          setEditTemplate(null);
        }}
        onUpdate={setTemplates}
      />
      {!isLoadingTemplates && <List
        subheader={
        <ListSubheader>
          Список шаблонов
        </ListSubheader>
        }
        className={classes.list}
      >
      {templates.map(t => 
        <ListItem key={t.id} button onClick={() => getOneTemplate(t.id)}>
          <ListItemText primary={t.title} />
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="delete" onClick={() => deleteTemplate(t.id)}>
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>)}
      </List>}
    </div>
  );
}

export default withSnackbar(TemplatesPage);
