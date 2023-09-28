import React from 'react';
import logo from './logo.svg';

import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { Http, NoteAdd, Schedule, Email, Description, Settings, RateReview } from '@material-ui/icons';

import './App.css';
import Hooks from './pages/hook-page/hook-page';
import AddLessonPage from './pages/add-lesson-page/add-lesson-page';
import GetLessonsPage from './pages/get-lessons-page/get-lessons-page';
import SendMessagePage from './pages/send-message-page/send-message-page';
import TemplatesPage from './pages/templates-page/templates-page';
import SettingsPage from './pages/settings-page/settings-page';
import DefaultLessonsPage from './pages/default-lessons-page/default-lessons-page';

export const HooksContext = React.createContext();

function App() {
  const [hooks, setHooks] = React.useState([]);
  const [templates, setTemplates] = React.useState([]);
  const [value, setValue] = React.useState("addlesson"); 

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  React.useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/hooks`)
        .then(response => response.json())
        .then(result => {
          setHooks(result.hooks || [])
        });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Планировщик расписания</h1>
        <img src={logo} className="App-logo-right" alt="logo" />
        <span className="author">created by vovachebr</span>
      </header>
      <BottomNavigation value={value} onChange={handleChange}>
        <BottomNavigationAction label="Создать занятие" value="addlesson" icon={<NoteAdd/>} />
        <BottomNavigationAction label="Расписание занятий" value="getlessons" icon={<Schedule/>} />
        <BottomNavigationAction label="Шаблоны сообщений" value="templates" icon={<Description/>} />
        <BottomNavigationAction label="Отправить" value="sendmessage" icon={<Email/>} />
        <BottomNavigationAction label="Хуки" value="hooks" icon={<Http/>} />
        <BottomNavigationAction label="Закрепленные лекции" value="default_lectures" icon={<RateReview/>} />
        <BottomNavigationAction label="Настройки" value="settings" icon={<Settings/>} />
      </BottomNavigation>
      <HooksContext.Provider value={{
        hooks, 
        updateHooks: (hooks) => setHooks(hooks),
        templates,
        updateTemplates: (templates) => setTemplates(templates)
        }}>
      {value === "addlesson" && <AddLessonPage /> }
      {value === "getlessons" && <GetLessonsPage /> }
      {value === "sendmessage" && <SendMessagePage /> }
      {value === "templates" && <TemplatesPage /> }
      {value === "hooks" && <Hooks /> }
      {value === "default_lectures" && <DefaultLessonsPage /> }
      {value === "settings" && <SettingsPage /> }
      </HooksContext.Provider>
    </div>
  );
}

export default App;
