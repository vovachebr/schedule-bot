import React from 'react';
import clsx from 'clsx';
import { withSnackbar } from 'notistack';
import { green } from '@material-ui/core/colors';
import { withStyles } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import CircularProgress from '@material-ui/core/CircularProgress';
import Input from '@material-ui/core/Input';
import CheckIcon from '@material-ui/icons/Check';
import SaveIcon from '@material-ui/icons/Save';
import { DeleteForever } from '@material-ui/icons';

const useStyles = makeStyles({
  card: {
    margin: "10px",
    width: "160px",
  },
  backgroundsList: {
    display: "flex",
    flexDirection: "column"
  },
  backgroundImageCard: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: "5px"
  },
  popover: {
    pointerEvents: "none",
  },
  paper: {
    padding: 10
  },
  wrapper: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "50px"
  },
  uploadInut: {
    display: "flex",
  },
  uploadButtonWrapper: {
    position: 'relative',
    height: 20
  },
  fabProgress: {
    color: green[500],
    position: 'absolute',
    top: -3,
    left: -3,
    zIndex: 1,
  }
});

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
    display: "flex",
    flexWrap: "wrap"
  },
}))(MuiAccordionDetails);

function SettingsAccordion({enqueueSnackbar}) {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState("");
  const [coordinatorsList, setcoordinatorsList] = React.useState([]);
  const [backgroundsList, setBackgroundsList] = React.useState([]);
  const [coordinatorsUploadFileLoader, setcoordinatorsUploadFileLoader] = React.useState(false);
  const [coordinatorsUploadFileLoadedSuccess, setcoordinatorsUploadFileLoadedSuccess] = React.useState(false);

  const inputRef = React.createRef();

  const buttonClassname = clsx({
    [classes.buttonSuccess]: coordinatorsUploadFileLoadedSuccess,
  });

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const getImages = () => {
  fetch(`${process.env.REACT_APP_API_URL}/images/getNamesByType?type=фон`)
    .then(response => response.json())
    .then(result => setBackgroundsList(result.data || []));
  }

  const getCoordinators = () => {
    fetch(`${process.env.REACT_APP_API_URL}/coordinators/`)
    .then(response => response.json())
    .then(result => setcoordinatorsList(result.coordinators || []));
  }

  const uploadCoordinatorsFile = () => {
    const file = inputRef.current.children[0].files[0];
    if(!file){
      enqueueSnackbar("Файл не был выбран", { variant: 'error' });
      return;
    }
    setcoordinatorsUploadFileLoader(true);
    const formData = new FormData();
    formData.append('coordinators', file);
    fetch(`${process.env.REACT_APP_API_URL}/coordinators/addFile`, {
      method: 'POST',
      body: formData
    }).then(res => res.json()).then(res => {
      setcoordinatorsUploadFileLoader(false);
      if(res.success){
        setcoordinatorsUploadFileLoadedSuccess(true);
        setTimeout(()=> setcoordinatorsUploadFileLoadedSuccess(false), 3000);
        setcoordinatorsList(res.coordinators);
          enqueueSnackbar("Успешно обновлено", { variant: 'success' });
      }
    });
  }

  React.useEffect(getImages, []);
  React.useEffect(getCoordinators, []);

  const removeImage = (name, setter) => {
    fetch(`${process.env.REACT_APP_API_URL}/images/removeImageByName?name=`+name)
    .then(response => response.json())
    .then(result => {
      setter(result.data || []);
    });
  }

  const downloadCoordinators = () => {
    fetch(`${process.env.REACT_APP_API_URL}/coordinators/export_csv`)
    .then(response => response.blob())
    .then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = "coordinators.csv";
      document.body.appendChild(a);
      a.click();    
      a.remove();
  });
  }

  return (
    <>
      <Accordion square expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
        <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
          <Typography>Наши координаторы</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.backgroundsList}>
          <table>
          <thead>
            <tr><th>Имя</th><th>Id</th><th>Курс</th></tr>
          </thead>
          <tbody>
          {
            coordinatorsList && coordinatorsList.map(c => <tr key={`${c.id}-${c.course}`}><td>{c.name}</td><td>{c.id}</td><td>{c.course}</td></tr>)
          }
          </tbody>
          </table>
          <div className={classes.wrapper}>
            <Button variant="outlined" color="primary" onClick={downloadCoordinators}>
              Скачать файл с координаторами
            </Button>
            <div className={classes.uploadInut}>
              <Input 
                type="file"
                ref={inputRef}
                inputProps={{accept:"csv"}}
              />
              <div className={classes.uploadButtonWrapper}>
                <Fab
                  size="small"
                  aria-label="save"
                  color="primary"
                  className={buttonClassname}
                  onClick={uploadCoordinatorsFile}
                >
                  {coordinatorsUploadFileLoadedSuccess ? <CheckIcon /> : <SaveIcon />}
                </Fab>
                {coordinatorsUploadFileLoader && <CircularProgress size={46} className={classes.fabProgress} />}
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
      <Accordion square expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
        <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
          <Typography>Наши фоны для анонсов лекций</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.backgroundsList}>
          {
            backgroundsList.map(b => 
            <div key={b.name} className={classes.backgroundImageCard}>
              <img alt={b.name} src={`${process.env.REACT_APP_API_URL}/images/getImageByName?name=${b.name}`} width="760" height="365"/>
              <Typography>{b.name}</Typography>
              <Fab color="primary" size="small" onClick={() => removeImage(b.name, setBackgroundsList)}>
                <DeleteForever />
              </Fab>
            </div>)
          }
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default withSnackbar(SettingsAccordion);
