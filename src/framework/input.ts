export let joystick = {x: 0, y: 0}
export let justReleased = false
export let justPressed = false
export let keystate = {}
let mousex:number[], mousey:number[]
let px, py
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
    document.ontouchstart = e=>{
        e.preventDefault()
        px = e.touches[0].clientX
        py = e.touches[0].clientY
        dragging = true
    }
    document.onmousemove = e=>{
        if(!dragging)return
        e.preventDefault()
        mousex.push(e.clientX)
        mousey.push(e.clientY)
    }
    document.ontouchmove = e=>{
        if(!dragging)return
        e.preventDefault()
        mousex.push(e.touches[0].clientX)
        mousey.push(e.touches[0].clientY)
    }
    document.onmouseup = e=>{
        mousex.push(e.clientX)
        mousey.push(e.clientY)
        dragging = false
    }
    document.ontouchend = e=>{
        mousex.push(e.touches[0].clientX)
        mousey.push(e.touches[0].clientY)
        dragging = false
    }
    joystick = {x: 0, y: 0}
    justReleased = false
    justPressed = false
    keystate = {}
    
    mousex = new Array(0)
    mousey = new Array(0)
    dragging = false
}
export function update(){
    const pjm = joystick.x**2+joystick.y**2
    joystick.x = joystick.y = 0
    keystate["ArrowRight"] && joystick.x++
    keystate["ArrowLeft"] && joystick.x--
    keystate["ArrowDown"] && joystick.y++
    keystate["ArrowUp"] && joystick.y--
    if(mousex.length != 0){
        let mx = mousex.reduce((sum,val)=>sum+val)
        let my = mousey.reduce((sum,val)=>sum+val)
        mx != 0 && (mx /= mousex.length)
        my != 0 && (my /= mousey.length)
        let dx = mx-px, dy = my-py
        dx > 0 && joystick.x++
        dx < 0 && joystick.x--
        dy > 0 && joystick.y++
        dy < 0 && joystick.y--
        px = mx
        py = my
        mousex = new Array(0)
        mousey = new Array(0)
    }
    const jm = joystick.x**2+joystick.y**2
    const jmrt = Math.sqrt(jm)
    if(jmrt != 0){
        joystick.x /= jmrt
        joystick.y /= jmrt
    }
    justReleased = jm == 0 && pjm != 0
    justPressed = jm != 0 && pjm == 0
}