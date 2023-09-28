import React, { forwardRef } from 'react';
import { withSnackbar } from 'notistack';

import { makeStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import Telegram from '@material-ui/icons/Telegram';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(theme => ({
  table: {
    width: "90%",
    marginLeft: "5%",
    marginTop: "2%"
  },
  checkbox: {
    display: "flex"
  },
  button: {
    marginLeft: "15%"
  }
}));

const tableIcons = {
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

function GetLessonsPage({enqueueSnackbar}) {
  const classes = useStyles();

  const sendLessonNotification = (rowData) => {
    fetch(`${process.env.REACT_APP_API_URL}/lessons/sendNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: `{"id" : "${rowData.id}"}`
    })
    .then(response => response.json())
    .then(result => {
      if(result.success){
        enqueueSnackbar(result.data, { variant: 'success' });
      } else {
        enqueueSnackbar(`Ошибка: ${result.error}`, { variant: 'error' });
      }
    });
  };

  const [lessons, setLessons] = React.useState([]);
  const [isSendLessons, changeIsSendLessons] = React.useState(false);
  const columns = [
    { title: 'Занятие', field: 'lecture' },
    { title: 'Дата', field: 'date' },
    { title: 'Время', field: 'time' },
    { title: 'Группа', field: 'group' },
    { title: 'Лектор', field: 'teacher' },
    { title: 'Изображение', field: 'image' },
    {
      title: 'Опубликовать сейчас',
      render: rowData => 
        <Button 
          className={classes.button}
          variant="contained"
          onClick={() => {
            sendLessonNotification(rowData);
          }}>
          <Telegram/>
        </Button>
    }
  ];

  const getLessons = (isSendLessons) => {
    fetch(`${process.env.REACT_APP_API_URL}/lessons?isSent=${isSendLessons}`)
    .then(response => response.json())
    .then(result => setLessons(result.lessons));
  }
  
  React.useEffect(() => getLessons(isSendLessons), [isSendLessons]);

  return (
    <div className={classes.table}>
      <FormControlLabel className={classes.checkbox}
        control={
          <Checkbox checked={isSendLessons} onChange={() => {
            getLessons(!isSendLessons)
            changeIsSendLessons(!isSendLessons)
          }} color="primary"/>
        }
        label={`Отображаются ${isSendLessons ? "" : "не"}отправленные уроки`}
      />
      <MaterialTable
        title="Занятия"
        icons={tableIcons}
        columns={columns}
        data={lessons}
        options={{
          pageSize: 20,
          pageSizeOptions:[20,30,40,50,lessons.length || 100]
        }}
        editable={{
          onRowDelete: oldData =>
          new Promise(resolve => {
            fetch(`${process.env.REACT_APP_API_URL}/lessons/remove`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: `{"id" : "${oldData.id}"}`
            })
            .then(response => response.json())
            .then(result => {
              setLessons(result.lessons);
              resolve(result.lessons);
              enqueueSnackbar("Успешно удалено", { variant: 'success' });
            });
          }),
          onRowUpdate: (newData, oldData) =>
          new Promise(resolve => {
            fetch(`${process.env.REACT_APP_API_URL}/lessons/update`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(newData)
            })
            .then(response => response.json())
            .then(result => {
              setLessons(result.lessons);
              resolve(result.lessons);
              enqueueSnackbar("Успешно обновлено", { variant: 'success' });
            });
          }),
        }}
      />
    </div>
  );
}

export default withSnackbar(GetLessonsPage);
