import { Dispatch, SetStateAction, useContext, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/core';
import { ThemesContext } from '../App';

interface props {
  viewModal: boolean,
  setModal: Dispatch<SetStateAction<boolean>>,
}

export interface PasswordDTO {
  username: string,
  password: string,
  url: string,
  favorite: number
}

export default function AddForm({viewModal, setModal}: props) {

  const [username, setUserName] = useState("");
  const [password, setPass] = useState("");
  const [url, setUrl] = useState("");
  const favorite = 0;

  const theme = useContext(ThemesContext);
  const passRef = useRef<HTMLInputElement>(null);
  const submit = useRef<HTMLButtonElement>(null);

  const data: PasswordDTO = {username: username, password: password, url: url, favorite: favorite};

  const submitPW = (data: PasswordDTO) => {
    if(data.username === "" || data.password === "" || data.url=== ""){
      console.log("Can't do that!");
    }
    invoke('add_pw', {data: data});
    setModal(false);
  }

  
  const generatePW = (length: number) => {
    const alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12334567890!@#$%^&*()[]"
    let result = '';
    let counter = 0;

    while(counter < length){
      result += alpha.charAt(Math.floor(Math.random() * alpha.length));
      counter += 1
    }
    if(passRef.current){
      passRef.current.value = result;
      setPass(result);
      passRef.current.addEventListener("focus", () => {
        if(passRef.current?.type === "password"){
          passRef.current.type = "text";
        }
      })
    }
  }

  if(submit.current){
    if(username === "" || password === "" || url=== ""){
      submit.current.disabled = true;
    } else {
      submit.current.disabled = false;
    }
  }

  return (
    <>
      <div style={{display: !viewModal ? "none" : "flex"}}>
        <section className='add-modal' style={{backgroundColor: theme.background}}>
          <h3>Add a new Password</h3>
          <input data-testid="username" type="text" placeholder='username' name="username" id="" onChange={(e) => setUserName(e.currentTarget.value)}/>
          <input data-testid="password" ref={passRef} type="password" placeholder='password' name="password" id="" onChange={(e) => setPass(e.currentTarget.value)}/>
          <button onClick={() => generatePW(12)}>Generate</button>
          <input data-testid="url" type="text" placeholder='url' name="url" id="" onChange={(e) => setUrl(e.currentTarget.value)}/>
          <button name="submit-new" ref={submit} className='add form-bttn' type="button" onClick={() => submitPW(data)}>Add</button>
        </section>
        <div className='modal-bg' onClick={() => setModal(false)}></div>
      </div>
    </>
  )
}
