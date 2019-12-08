export let joystick = {x: 0, y: 0}
export let justReleased = false
export let justPressed = false
export let keystate = {}
let mousex:number, mousey:number
let px:number, py:number
let dragging:boolean
export function init(){
    document.onkeydown = e=>{
        if(e.repeat) return
        e.preventDefault()
        keystate[e.key] = true
    }
    document.onkeyup = e=>{
        keystate[e.key] = false
    }
    document.onmousedown = e=>{
        e.preventDefault()
        px = e.clientX
        py = e.clientY
        dragging = true
    }
    document.addEventListener("touchstart",e=>{
        e.preventDefault()
        px = mousex = e.touches[0].clientX
        py = mousey = e.touches[0].clientY
        dragging = true
    }, {passive:false})
    document.onmousemove = e=>{
        e.preventDefault()
        if(!dragging)return
        mousex = e.clientX
        mousey = e.clientY
    }
    document.addEventListener("touchmove",e=>{
        e.preventDefault()
        if(!dragging)return
        mousex = e.touches[0].clientX
        mousey = e.touches[0].clientY
    }, {passive:false})
    document.onmouseup = e=>{
        mousex = e.clientX
        mousey = e.clientY
        dragging = false
    }
    document.ontouchend = e=>{
        mousex = e.touches[0].clientX
        mousey = e.touches[0].clientY
        dragging = false
    }
    joystick = {x: 0, y: 0}
    justReleased = false
    justPressed = false
    keystate = {}
    
    dragging = false
}
export function update(){
    const pjm = joystick.x**2+joystick.y**2
    joystick.x = joystick.y = 0
    keystate["ArrowRight"] && joystick.x++
    keystate["ArrowLeft"] && joystick.x--
    keystate["ArrowDown"] && joystick.y++
    keystate["ArrowUp"] && joystick.y--
    
    let dx = mousex-px, dy = mousey-py
    dx > 0 && joystick.x++
    dx < 0 && joystick.x--
    dy > 0 && joystick.y++
    dy < 0 && joystick.y--
    px = mousex
    py = mousey

    const jm = joystick.x**2+joystick.y**2
    const jmrt = Math.sqrt(jm)
    if(jmrt != 0){
        joystick.x /= jmrt
        joystick.y /= jmrt
    }
    justReleased = jm == 0 && pjm != 0
    justPressed = jm != 0 && pjm == 0
}