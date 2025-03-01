import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { useContext } from 'react';
import { ThemesContext } from '../App';

export const getFile = async () => {

  const selected = await open({
    multiple: false,
    filters: [{
      name: 'Comma Separated Values',
      extensions: ['csv']
    }]
  })

  if(selected) {
    invoke('import_pass', {filePath: selected});
  }

  return selected
}

export default function Import() {

  const theme = useContext(ThemesContext);
  

  return (
    <>
        <button style={{color: theme.textColor}} className="nav-bttn import" onClick={getFile}>Import</button>
    </>
  )
}
