import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import DataBaseInfo from './databaseInfo';
import ImageUploader from './imageUploader';

import SettingsAccordion from './settingsAccordion';

const useStyles = makeStyles({
    root:{
      width: "90%",
      marginTop: "2%",
      marginLeft: "5%"
    },
    cards: {
      display: "flex",
      justifyContent: "space-around",
      marginBottom: "5%"
    }
});

export default function SettingsPage() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.cards}>
      <DataBaseInfo />
      <ImageUploader />
      </div>
      <SettingsAccordion />
    </div>
  );
}
