import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { useContext } from 'react';
import { ThemesContext } from '../App';

export default function Import() {

  const theme = useContext(ThemesContext);
 const getFile = async () => {

    const selected = await open({
      multiple: false,
      filters: [{
        name: 'Comma Separated Values',
        extensions: ['csv']
      }]
    })

    if(selected) {
      console.log(selected);
      invoke('import_pass', {filePath: selected});
    }
 }
  return (
    <>
        <button style={{color: theme.textColor}} className="nav-bttn import" onClick={getFile}>Import</button>
    </>
  )
}
