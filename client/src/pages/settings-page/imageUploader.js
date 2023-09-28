import React from 'react';
import { withSnackbar } from 'notistack';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import Fab from '@material-ui/core/Fab';
import CircularProgress from '@material-ui/core/CircularProgress';
import Input from '@material-ui/core/Input';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CheckIcon from '@material-ui/icons/Check';
import SaveIcon from '@material-ui/icons/Save';

const useStyles = makeStyles((theme) => ({
    root: {
      width: 370
    },
    wrapper: {
      margin: theme.spacing(1),
      position: 'relative',
      height: 20
    },
    buttonSuccess: {
      backgroundColor: green[500],
      '&:hover': {
        backgroundColor: green[700],
      },
    },
    imageInput: {
      paddingTop: "15px",
    },
    cardText: {
      textAlign: "left"
    },
    loader: {
      display: "flex",
      alignItems: "center",
      marginTop: "5%"
    },
    fabProgress: {
      color: green[500],
      position: 'absolute',
      top: -3,
      left: -3,
      zIndex: 1,
    },
}));

function ImageUploader({enqueueSnackbar}) {
  const classes = useStyles();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const inputRef = React.createRef();

  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  });

  const saveImage = () => {
    const file = inputRef.current.children[0].files[0];
    if(!file){
      enqueueSnackbar("Файл не был выбран", { variant: 'error' });
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    fetch(`${process.env.REACT_APP_API_URL}/images/addImage`, {
      method: 'POST',
      body: formData
    }).then(res => res.json()).then(res => {
      setLoading(false);
      if(res.success){
        setSuccess(true);
        setTimeout(()=> setSuccess(false), 3000);
        if(res.info)
          enqueueSnackbar(res.info, { variant: 'info' });
      }
      else{
        enqueueSnackbar(res.error, { variant: 'error' });
      }
    });
  };

  return (
    <>
      <Card className={classes.root}>
        <CardContent>
          <Typography className={classes.title} color="textSecondary" gutterBottom>
            Загрузчик изображений
          </Typography>
          <div className={classes.loader}>
            <Input 
              className={classes.imageInput}
              type="file"
              ref={inputRef}
              inputProps={{accept:".jpg, .jpeg, .png"}}
            />
            <div className={classes.wrapper}>
              <Fab
                size="small"
                aria-label="save"
                color="primary"
                className={buttonClassname}
                onClick={saveImage}
              >
                {success ? <CheckIcon /> : <SaveIcon />}
              </Fab>
              {loading && <CircularProgress size={46} className={classes.fabProgress} />}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default withSnackbar(ImageUploader);
