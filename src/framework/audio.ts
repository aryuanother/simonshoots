import {Howl} from 'howler';
import forEach_ = require('lodash/forEach')
import filter_ = require('lodash/filter')
let _ = {
    forEach:forEach_,
    filter:filter_
}
let h:Howl

let perviousPlay:number
export function setSprite(jsonfile:string){
    (async ()=>{
        await fetch(jsonfile).then(response=>response.json()).then(json=>{
            json["onplayerror"] = ()=>{
                h.once("unlock", ()=>h.play("silence"))
            }
            h = new Howl(json)
            h.play("silence")
            perviousPlay = performance.now()
        })
    })()
}
let playlist:{[name:string]:{volume:number, rate:number}} = {}
export function play(name:string, volume:number = 0.3, rate:number = 1.0){
    playlist[name] = {"volume":volume,"rate":rate}
}
let interval:number
export function setBPM(bpm:number){
    interval = (60*1000/bpm)/4
}
const eps = 5
export function update(){
    let now = performance.now()
    let deltaPlay = now-perviousPlay
    if(deltaPlay >= interval-eps){
        h?.state() == "loaded" && 
        _.forEach(Object.keys(playlist),key=>{
            let id = h?.play(key)
            h?.fade(0,playlist[key].volume,h?.duration(id)/2,id)
            h?.rate(playlist[key].rate, id)
        })
        playlist = {}
        
        perviousPlay = now
    }
}