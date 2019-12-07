import {Random} from "./framework/random"
import {GameObject} from "./framework/index"
import {player, Bullet}from "./gobj"
import {svg} from "./svg"
import _ = require("lodash")

export function shootNWay(gobj:GameObject, way:number, spreadAngle:number, aimAngle:number, aimType:"Fixed"|"Aim", times:number, speed:number){
    let a = aimAngle, da = 0
    if(aimType === "Aim"){
        a += Math.atan2(player.pos.y-gobj.pos.y,player.pos.x-gobj.pos.x )
    }
    if(way > 1){
        a += spreadAngle/2
        da = spreadAngle/(way-1)
    }
    _.times(way, ()=>{
        let s = speed, ds = 0
        if(times > 1){
            ds = speed/times
        }
        _.times(times, ()=>{
            new Bullet(gobj, s, a, 12, svg[aimType==="Aim"?"bullet_aim":"bullet"])
            s -= ds
        })
        a -= da
    })
}

export function jetshot(e){
    let rg = new Random()
    rg.setSeed(213427823147)
    let aa = [...Array(20)].map(()=>rg.get(88*Math.PI/180,92*Math.PI/180))
    let sa = [...Array(20)].map(()=>rg.getInt(50,100)/10)
    e.pos.x -=56
    for(let i = 0; i < 20; i++){
        shootNWay(e, 1, 0, aa[i], "Fixed", 1, sa[i])
    }
    e.pos.x +=112
    for(let i = 0; i < 20; i++){
        shootNWay(e, 1, 0, aa[i], "Fixed", 1, sa[i])
    }
    e.pos.x -=56
}