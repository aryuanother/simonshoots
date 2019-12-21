import {GameObject, Text} from "./gameobject"
import * as input from "./input"
import * as audio from "./audio"
import {Random} from "./random"
export {audio, input, Random}
export * from "./gameobject"
export * from "./util"
export * from "./component"
import forEach_ = require('lodash/forEach')
let _ = {
    forEach:forEach_,
}

export enum Scene{
    title, playing, gameover
}
export let ticks = 0
export let score = 0
export let random: Random
export let scene: Scene
export let targetFramerate = 60
export let canvas: HTMLCanvasElement
export let context: CanvasRenderingContext2D
export let width:number, height:number
export let title:string
let h:Howl
let time_lastframe:number
let _init:Function, _start:Function, _update:Function, _postUpdate:Function

export function run(f_init:()=>void, f_start:()=>void,
                     f_update?:()=>void, f_postUpdate?:()=>void){
    _init = f_init
    _start = f_start
    _update = f_update
    _postUpdate = f_postUpdate
    random = new Random()
    input.init()
    GameObject.init()
    canvas = <HTMLCanvasElement>document.getElementById("canvas")
    context = canvas.getContext('2d')
    width = canvas.width
    height = canvas.height
    _init()
    startTitle()
    window.requestAnimationFrame = (function(){
        return  window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window["mozRequestAnimationFrame"]    ||
                function( callback: TimerHandler ){
                    window.setTimeout(callback, 1000 / targetFramerate)
                }
    })()
    time_lastframe = window.performance.now()
    window.requestAnimationFrame(mainLoop)
}

function mainLoop(){
    const time_between_frames = 1000/targetFramerate
    const eps = 5
    let now = window.performance.now()
    let deltaFrame = now-time_lastframe
    if(deltaFrame >= time_between_frames-eps){
        update()
        time_lastframe = now
    }
    window.requestAnimationFrame(mainLoop)
}

function update(){
    context.fillRect(0,0,width,height)
    switchScene()
    GameObject.showCollision = input.keystate["s"]
    // will play sounds
    if(!!_update) _update()
    // will update global components
    // will update particles as priority 0
    GameObject.update()
    if(!!_postUpdate) _postUpdate()
    // will show score
    drawSceneText()
    ticks++
}

function switchScene(){
    if(scene === Scene.title && input.justPressed){
        startGame()
    }
    if(scene === Scene.gameover && (ticks >= 150 || (ticks >= 20 && input.justPressed))){
        startTitle()
    }
    input.update()
}
function startTitle(){
    scene = Scene.title
    ticks = 0
}
function startGame(){
    // will clear global components
    GameObject.clear()
    // will clear particles
    _start()
    input.init()
    scene = Scene.playing
    score = ticks = 0;

}
export function endGame(){
    if(scene === Scene.gameover || scene === Scene.title){
        return
    }
    scene = Scene.gameover
    ticks = 0
    // will stop music
}

export function addScore(v: number = 1, pos:{x: number,y:number} = null){
    if(scene === Scene.playing){
        score += v
        // will set score displayer 
    }
}

export function setTitle(str:string){
    title = str
    document.title = title
}

export function drawText(str:string, x:number, y:number){
    let originFillStyle = context.fillStyle
    let originFont = context.font
    context.fillStyle = "white"
    context.font = "small-caps 14px sans-serif"
    context.textAlign = "center"
    context.textBaseline = "middle"
    _.forEach(str.split("\n"), (line, index)=>{
        context.fillText(line, x, y+index*14)
    })
    context.fillStyle = originFillStyle
    context.font = originFont
} 

function drawSceneText(){
    switch(scene){
        case Scene.title:
            drawText(title, width/2, height/2)
            break
        case Scene.gameover:
            drawText("Game Over", width/2, height/2)
            break
    }
}
