import React from 'react';

import { withSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import { Refresh, DeleteForever } from '@material-ui/icons';

const useStyles = makeStyles({
    root: {
      width: 370,
    },
    title: {
      fontSize: 14,
    },
    info: {
      height: 100
    },
    actions: {
      justifyContent: "space-around"
    },
    popover: {
      pointerEvents: 'none',
    },
    paper: {
      padding: 10
    }
});

function DataBaseInfo({enqueueSnackbar}) {
  const classes = useStyles();
  const [dbInfo, setDbInfo] = React.useState({});

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handlePopoverOpen = (event) => setAnchorEl(event.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);
  const openPopup = Boolean(anchorEl);

  const getInfo = () => {
    fetch(`${process.env.REACT_APP_API_URL}/getDatabaseStat`)
    .then(response => response.json())
    .then(result => {
      if(result.success){
        setDbInfo({
            busySize:result.busySize,
            allSize:result.allSize
        });
      }
    });
  };

  const clearData = () => {
    fetch(`${process.env.REACT_APP_API_URL}/clearLessons`, {method: "POST"})
    .then(response => response.json())
    .then(result => {
      if(result.success){
        setDbInfo({
          busySize:result.busySize,
          allSize:result.allSize
        });
        enqueueSnackbar(`Удалено ${result.deletedLessons} анонсов, очищено ${getSize(result.clearedSize)}`, { variant: 'info' });
      }
    });
  }

  React.useEffect(() => getInfo(), []);

  const getSize = (size) => {
      const divided = size / 1024;
      if(divided < 1000){
        return Number(divided.toFixed(4))+"Kb";
      }else{
        return Number((divided / 1024).toFixed(4)) + "Mb";
      }
  }

  return (
    <>
      <Card className={classes.root}>
        <CardContent>
          <Typography className={classes.title} color="textSecondary" gutterBottom>
            Информация о занятом месте в базе данных
          </Typography>
          <div className={classes.info}>
          {
              !dbInfo.busySize ? 
              <CircularProgress /> :
              <>
              Занято: {getSize(dbInfo.busySize)}<br/>
              Всего: {getSize(dbInfo.allSize)}<br/><br/>
              {Number((dbInfo.busySize / dbInfo.allSize) * 100).toFixed(4)}%
              </>
          }
          </div>
        </CardContent>
        <CardActions className={classes.actions}>
          <Fab color="primary" size="small" onClick={() => {setDbInfo({}); getInfo()}}>
            <Refresh/>
          </Fab>
          <Fab
            color="primary"
            size="small"
            onClick={() => {setDbInfo({}); clearData();}}
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
          >
            <DeleteForever />
          </Fab>
          <Popover
            open={openPopup}
            className={classes.popover}
            classes={{
              paper: classes.paper,
            }}
            onClose={handlePopoverClose}
            anchorEl={anchorEl}
            disableRestoreFocus
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
          >
          <Typography>
            Будут удалены только уже отправленыe анонсы
          </Typography>
        </Popover>
        </CardActions>
      </Card>
    </>
  );
}

export default withSnackbar(DataBaseInfo);
