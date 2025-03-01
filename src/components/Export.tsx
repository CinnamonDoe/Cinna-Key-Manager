import { save } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { useContext } from 'react';
import { ThemesContext } from '../App';

export const saveToFile = async () => {
  const filePath = await save({
    filters: [{
      name: "Comma Separated Values",
      extensions: ['csv']
    }]
  })

  if(filePath){
    //@ts-expect-error lib has been changed.
    const path = encodeURI(filePath).replaceAll("%5C", "/");
    const newPath = decodeURI(path);
    await invoke("export_pass", {filePath: newPath});
  }

  return filePath

}

export default function Export() {

  const theme = useContext(ThemesContext);

  return (
    <>
      <button style={{color: theme.textColor}} className="nav-bttn export" onClick={saveToFile}>Export</button>
    </>
  )
}
