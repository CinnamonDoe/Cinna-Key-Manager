import { Dispatch, SetStateAction, useContext, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/core';
import { ThemesContext } from '../App';

interface props {
  viewModal: boolean,
  setModal: Dispatch<SetStateAction<boolean>>,
}


export default function AddForm({viewModal, setModal}: props) {

  const [username, setUserName] = useState("");
  const [password, setPass] = useState("");
  const [url, setUrl] = useState("");
  const favorite = 0;

  const theme = useContext(ThemesContext);
  const passRef = useRef<HTMLInputElement>(null);
  const submit = useRef<HTMLButtonElement>(null);

  const data = {username: username, password: password, url: url, favorite: favorite};

  const submitPW = () => {
    if(username === "" || password === "" || url=== ""){
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
          passRef.current.type = "text"
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
          <input type="text" placeholder='username' name="" id="" onChange={(e) => setUserName(e.currentTarget.value)}/>
          <input ref={passRef} type="password" placeholder='password' name="" id="" onChange={(e) => setPass(e.currentTarget.value)}/>
          <button onClick={() => generatePW(8)}>Generate</button>
          <input type="text" placeholder='url' name="" id="" onChange={(e) => setUrl(e.currentTarget.value)}/>
          <button ref={submit} className='add form-bttn' type="button" onClick={submitPW}>Add</button>
        </section>
        <div className='modal-bg' onClick={() => setModal(false)}></div>
      </div>
    </>
  )
}
