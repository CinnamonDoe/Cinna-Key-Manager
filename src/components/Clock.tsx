import { useEffect, useState } from 'react'

export default function Clock() {
  const [time, setTime] = useState("");

  const showTime = () => {
    const date = new Date();
    const timeStr = date.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
    setTime(timeStr);
  }

  useEffect(() => {
    const showClock = setInterval(() => {
        showTime()
    }, 1000);
    return () => clearInterval(showClock)
  })
  return (
    <h4>{time}</h4>
  )
}
