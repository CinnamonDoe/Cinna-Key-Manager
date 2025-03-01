import { useState, Suspense, useEffect, useLayoutEffect, createContext, useCallback, useRef} from 'react'
import './App.css'

import { invoke } from '@tauri-apps/api/core';
import DataDetail from './components/DataCard/DataDetail';
import AddForm from './components/AddForm';
import { GiBigGear } from 'react-icons/gi';
import Import from './components/Import';
import Export from './components/Export';
import NavBarMenu from './components/NavBar/NavBarMenu';
import ChangeTheme from './components/NavBar/ChangeTheme';

import { readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';

import themes from '././assets/themes.json';
import Clock from './components/Clock';
import { BiCaretDown } from 'react-icons/bi';

// data for the passwords.
export interface PassData {
  id: number,
  username: string,
  url: string,
  password: string
  favorite: number
}

interface Theme {
  name: string
  button: string,
  actionButton: string,
  actionButtonHover: string,
  buttonHover: string,
  background: string,
  textColor: string,
  navbar: string,
  card: string,
  themeList: string,
  themeButtonText: string
}


export const getDataTest = async () => {
  await invoke('fetchdata').then((res) => {return res as PassData[]});
}

// context for themes to be applied to all components.
export const ThemesContext = createContext<Theme>(themes.themes[0]); // light theme by default.

function App() {

  const [passes, setPasses] = useState<PassData[]>([]);
  const [viewModal, setModal] = useState(false);
  const [editMode, setEdit] = useState(false);
  const [theme, setTheme] = useState<Theme>(themes.themes[0]);


  const [filter, setFilter] = useState("all"); // sets the filter
  const [filterText, setFilterText] = useState("All"); // sets the text for the button for custom select element.

  // Toggle viewing for filter options
  const [select, viewSelect] = useState(false);

  // Refs to position dropdown/ select for filters.
  const filtersRef = useRef<HTMLElement>(null);
  const filterDrop = useRef<HTMLButtonElement>(null);

  const loadTheme = async () => {
    const contents = await readTextFile("preferredtheme.set", {baseDir: BaseDirectory.AppLocalData});
    const index = themes.themes.findIndex((t) => t.name === contents);
    setTheme(themes.themes[index]);
  }
  
  // Toggle edit mode to delete passwords.
  const setEditMode = () => {
    setEdit(!editMode);
  }

  const getData = useCallback(async () => {
    await invoke('fetchdata').then((res) => setPasses(res as PassData[]));

  }, []);


  const getFilter = (filter: string) => {
    setFilter(filter);
    viewSelect(false);
  } 

  useEffect(() => {
    // targets the buttons within the action buttons container and apply the custom theme.
    document.querySelector(".actions")?.querySelectorAll("button").forEach((bttn) => {
      bttn.addEventListener("mouseenter", () => {
        bttn.style.backgroundColor = theme.actionButtonHover
      })
      bttn.addEventListener("mouseleave", () => {
        bttn.style.backgroundColor = theme.actionButton
      })
    })
  })
  

  useEffect(() => {
    if(filter == "favorites"){
      setFilterText("Favorites Only")
      setPasses(passes.filter((password) => password.favorite === 1));
    } else {
      setFilterText("All");
      setPasses(passes)
    }

    const data = setInterval(getData, 1000);

    return () => clearInterval(data);
    
  }, [theme.textColor, filter, passes, getData])

      if(filtersRef.current && filterDrop.current) {
        filtersRef.current.style.top = `${filterDrop.current.getBoundingClientRect().top - 10}px`; // shows underneath the button as dropdown.
        filtersRef.current.style.width = `${filterDrop.current.getBoundingClientRect().width}px`;
    }

 
  useLayoutEffect(() => {
    loadTheme()
    document.body.style.scrollbarColor = `${theme.navbar} transparent`;
    document.body.style.backgroundColor = theme.background;
    document.body.style.color = theme.textColor;

  }, [theme.background, theme.textColor, theme.navbar])
  return (
    <>
      <ThemesContext.Provider value={theme}>
        <NavBarMenu>
          <Import/>
          <Export/>
          <ChangeTheme/>
        </NavBarMenu>      
        <section className='pass-app'>
          <section className='password-table'>
            <section className='header-content'>
              <Clock/>
              <section className='filter-select'>
                  <button ref={filterDrop} onClick={() => viewSelect(!select)}className='select-button' style={{borderBottom: `1px ${theme.textColor} solid`, color: theme.textColor}}>{filterText}{<BiCaretDown className="caret" style={{color: theme.textColor}}/>}</button>
                  <section ref={filtersRef} className='filter-options' style={{color: theme.textColor, display: select ? "flex" : "none"}}>
                        <p onClick={() => getFilter("all")} className='choose' style={{color: theme.themeButtonText}}>All</p>
                        <p onClick={() => getFilter("favorites")} style={{color: theme.themeButtonText}} >Favorites Only</p>
                  </section>
              </section>
              <section className='actions'>
                <button style={{backgroundColor: theme.actionButton, color: theme.textColor, padding: editMode ? "0.1em .1em" : "0.6em 1.2em"}} onClick={setEditMode}>{editMode ? <p>Cancel</p> : <GiBigGear/> }</button>
                <button style={{backgroundColor: theme.actionButton, color: theme.textColor}} onClick={() => setModal(true)}>+</button>
              </section>
            </section>
            <AddForm viewModal={viewModal} setModal={setModal}/>
            <section className='passes'>
              <Suspense fallback="Waiting for passwords...">
                {passes.length == 0 ? <h5>Add a new password!</h5> : passes.map((data: PassData) => (
                    <DataDetail id = {data.id} key={data.id} username={data.username} password={data.password} favorite={data.favorite} url={data.url} editMode={editMode}/>
                ))} 
              </Suspense>
            </section>
          </section>
        </section>
        <p className='version'>v.1.0.1</p>
      </ThemesContext.Provider>
    </>
  )
}

export default App
