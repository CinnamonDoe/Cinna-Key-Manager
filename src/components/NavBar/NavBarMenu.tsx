import React, { useContext, useLayoutEffect } from 'react'
import { ThemesContext } from '../../App'

interface props {
    children?: React.ReactNode
}

export default function NavBarMenu({children}: props) {
  const theme = useContext(ThemesContext)

  useLayoutEffect(() => {
    const navItems = document.querySelectorAll(".nav-bttn") as NodeListOf<HTMLButtonElement>;

    navItems.forEach((bttn) => {
      bttn.addEventListener("mouseenter", function change() {
        bttn.style.backgroundColor = theme.buttonHover;
      })
      bttn.addEventListener("mouseleave", function change(){
        bttn.style.backgroundColor = "transparent";
      })
    })
  }, [theme.buttonHover]);

  return (
    <nav style={{backgroundColor: theme.navbar}} className='epic-nav'>{children}</nav>
  )
}
