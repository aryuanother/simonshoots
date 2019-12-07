export let joystick = {x: 0, y: 0}
export let justReleased = false
export let justPressed = false
let keystate = {}

export function init(){
    document.onkeydown = e=>{
        if(e.repeat) return
        e.preventDefault()
        keystate[e.key] = true
    }
    document.onkeyup = e=>{
        keystate[e.key] = false
    }
    joystick = {x: 0, y: 0}
    justReleased = false
    justPressed = false
    keystate = {}
}
export function update(){
    const pjm = joystick.x**2+joystick.y**2
    joystick.x = joystick.y = 0
    keystate["ArrowRight"] && joystick.x++
    keystate["ArrowLeft"] && joystick.x--
    keystate["ArrowDown"] && joystick.y++
    keystate["ArrowUp"] && joystick.y--
    const jm = joystick.x**2+joystick.y**2
    const jmrt = Math.sqrt(jm)
    if(jmrt != 0){
        joystick.x /= jmrt
        joystick.y /= jmrt
    }
    justReleased = jm == 0 && pjm != 0
    justPressed = jm != 0 && pjm == 0
}