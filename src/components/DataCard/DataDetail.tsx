import { invoke } from '@tauri-apps/api/core'
import { ask } from '@tauri-apps/plugin-dialog'
import React, { useContext, useRef, useState } from 'react'
import { BiShow, BiHide, BiStar, BiLink, BiCheck } from 'react-icons/bi'
import { GiPaperBagCrumpled } from 'react-icons/gi'
import { ThemesContext } from '../../App'

interface props {
    id: number,
    username: string,
    url: string,
    password: string
    favorite: number
    key: React.Key,
    editMode: boolean
}

export const deletePass = async (id: number) => {
    const answer = await ask('Are you sure you want to delete this password? This action cannot be undone.', {title: "Delete Password", kind: "warning"});
    try {
        if(answer == true){
            await invoke("delete_pw", {id: id});
            return "password has deleted successfully!";
        }
    } catch(e) {
        console.log("Something went wrong: " + e)
    }
}

export default function DataDetail({id, username, url, password, favorite, editMode}: props) {

    const [fave, setFave] = useState<number>(favorite);
    const [viewing, isViewing] = useState(false);
    const [pass, viewPass] = useState(password.split('').map((c) => c.replace(c, "*")).join(""));
    const [copied, setCopied] = useState(false);

    const element = useRef<HTMLParagraphElement>(null);
    const buttonContainer = useRef<HTMLElement>(null);
    const faveRef = useRef<HTMLButtonElement>(null);
    const copyRef = useRef<HTMLButtonElement>(null);


    const theme = useContext(ThemesContext);

    const updateFave = async () => {
        const option = !!fave;
        setFave(() => Number(!option));
        await invoke("favorite_pw", {fave: fave, id: id});
    }

    const copyPass = async (passkey: string) => {
        try {
            await invoke("decrypt_str", {encrypted: passkey}).then((res) => navigator.clipboard.writeText(res as string));
            setCopied(true)
            setTimeout(() => {
                setCopied(false)
            }, 2000);
        } catch (err) {
            console.log(err);
        }
    }

    const viewIt = () => {
        isViewing(!viewing);
        if(element.current){
            if(!viewing){
                invoke("decrypt_str", {encrypted: password}).then((res) => viewPass(res as string));
            } else {
                invoke("encrypt_pw", {pw: pass}).then((res) => viewPass((res as string).split('').map((c: string) => c.replace(c, "*")).join("") as string));
            }
        }
    }

    buttonContainer.current?.querySelectorAll("button").forEach((bttn) => {
        bttn.addEventListener("mouseenter", function changeColor() {
            if(bttn.classList.contains("1") || bttn.classList.contains("copied") || bttn.classList.contains("delete")){
                this.removeEventListener("mouseenter", changeColor)
            } else {
                bttn.style.backgroundColor = theme.buttonHover
            }
          })
          bttn.addEventListener("mouseleave", function changeBack() {
            if(bttn.classList.contains("1") || bttn.classList.contains("copied") || bttn.classList.contains("delete")){
                this.removeEventListener("mouseleave", changeBack)
            } else {
                bttn.style.backgroundColor = theme.button
            }
          })
    })
    
    if(faveRef.current){
        if(favorite == 1){
            faveRef.current.style.backgroundColor ="#edc532";
            faveRef.current.style.color ="#cf9323";
            faveRef.current.classList.add(`${favorite}`);
        } else {
            faveRef.current.style.backgroundColor = theme.button;
            faveRef.current.style.color = theme.textColor;
            if(faveRef.current.classList.contains("1")){
                faveRef.current.classList.remove("1");
            };
            faveRef.current.classList.add(`${favorite}`);
        }
    }

    if(copyRef.current){
        if(copied == true){
            copyRef.current.classList.add('copied');
        } else {
            if(copyRef.current.classList.contains("copied")){
                copyRef.current.classList.remove("copied");
            };
        }
    }

  return (
    <article className='pass-card' style={{backgroundColor: theme.card}}>
        <aside className='details'>
            <p>{username}</p>
            <p ref={element} className='password' style={{textShadow: viewing ? "none" : `0px 0px 6px ${theme.textColor}`, color: viewing ? theme.textColor : "transparent"}}>{pass}</p>
            <p>{url}</p>
        </aside>
        <section className='action-buttons' ref={buttonContainer}>
            <button style={{backgroundColor: theme.button, color: theme.textColor}} type="button" onClick={viewIt}>{viewing ? <BiHide/> : <BiShow/>}</button>
            <button data-testid="copy-paste-bttn" ref={copyRef} style={{backgroundColor: copied ? "#8fe038" : theme.button, color: copied ? "#22ad15" : theme.textColor}} type="button" onClick={() => copyPass(password)}>{copied ? <BiCheck/> : <BiLink/>}</button>
            <button className="favorite" data-testid="favorite-bttn" ref={faveRef} style={{backgroundColor: theme.button, color: theme.textColor}} type="button" onClick={updateFave}><BiStar/></button>   
            <button className='delete' data-testid="delete-bttn" style={{display: editMode ? "block" : "none"}} type="button" onClick={() => deletePass(id)}><GiPaperBagCrumpled/></button>    
        </section>
    </article>
  )
}
