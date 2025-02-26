import { BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";
import { useContext, useRef, useState } from "react"
import { ThemesContext } from "../App";

const themeOptions = ["Skylight", "New Moon", "Lavender Lilac", "Deep Sea"]

export default function ChangeTheme() {
  const [viewThemes, setView] = useState(false);
  const themeElement = useRef<HTMLElement>(null);
  const buttonElement = useRef<HTMLButtonElement>(null);
  const theme = useContext(ThemesContext);

  if(themeElement.current && buttonElement.current) {
    themeElement.current.style.top = `${buttonElement.current?.getBoundingClientRect().top + 40}px`;
    themeElement.current.style.left = `${buttonElement.current?.getBoundingClientRect().left}px`;
  }

  const setTheme = async (option: string) => {
    await writeTextFile("preferredtheme.set", option.toLowerCase(), {baseDir: BaseDirectory.AppLocalData});
    location.reload();
  }

  return (
    <>
      <button onClick={() => setView(!viewThemes)} style={{color: theme.textColor}} ref={buttonElement} className="nav-bttn theme">Themes</button>
      <section style={{display: viewThemes ? "flex" : "none", backgroundColor: theme.themeList}} ref={themeElement} className="themes-list">
        {themeOptions.map((option, i) => (
          <button key={i} onClick={() => setTheme(option)} style={{backgroundColor: "transparent", color: theme.themeButtonText}} className="">{option}</button>
        ))}
      </section>
    </>
  )
}
