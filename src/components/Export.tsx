import { save } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { useContext } from 'react';
import { ThemesContext } from '../App';


export default function Export() {

  const theme = useContext(ThemesContext);

  const getFile = async () => {
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
        console.log(newPath);
        await invoke("export_pass", {filePath: newPath});
      }

   }
  return (
    <>
      <button style={{color: theme.textColor}} className="nav-bttn export" onClick={getFile}>Export</button>
    </>
  )
}
