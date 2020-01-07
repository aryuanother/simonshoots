import {Random} from "./framework/random"
import {GameObject, audio} from "./framework/index"
import {player, Bullet, Muzzle}from "./gobj"
import {svg} from "./svg"
import times_ = require('lodash/times')
let _ = {
    times:times_,
}
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
    new Muzzle(gobj.pos.x, gobj.pos.y, svg[aimType==="Aim"?"bullet_aim":"bullet"].width*2, 20)
    audio.play("bullet_l2",0.2)
}

export function jetshot(e){
    let rg = new Random()
    rg.setSeed(213427823147)
    let aa = [...Array(20)].map(()=>rg.get(85*Math.PI/180,95*Math.PI/180))
    let sa = [...Array(20)].map(()=>rg.getInt(25,50)/10)
    let px = e.pos.x
    e.pos.x -=56
    for(let i = 0; i < 20; i++){
        new Bullet(e, sa[i], aa[i], 12, svg["bullet"])
    }
    new Muzzle(e.pos.x, e.pos.y, svg["bullet"].width*2, 20)
    e.pos.x +=112
    for(let i = 0; i < 20; i++){
        new Bullet(e, sa[i], aa[i], 12, svg["bullet"])
    }
    new Muzzle(e.pos.x, e.pos.y, svg["bullet"].width*4, 20)
    audio.play("bullet_h")
    e.pos.x = px
}
export function penaltyshot_upper(e){
    let px = e.pos.x
    let py = e.pos.y
    e.pos.x -=36
    e.pos.y -= 42
    shootNWay(e, 3, Math.PI/3, -Math.PI/2, "Fixed", 1, 10)
    new Muzzle(e.pos.x, e.pos.y, svg["bullet"].width*2, 20)
    e.pos.x +=72
    shootNWay(e, 3, Math.PI/3, -Math.PI/2, "Fixed", 1, 10)
    new Muzzle(e.pos.x, e.pos.y, svg["bullet"].width*2, 20)
    e.pos.x = px
    e.pos.y = py
    audio.play("bullet_l1",0.1)
}
export function shootNWay_enemymid(gobj:GameObject, way:number, spreadAngle:number, aimAngle:number, aimType:"Fixed"|"Aim", times:number, speed:number){
    let px = gobj.pos.x
    let py = gobj.pos.y
    if(aimAngle < 0){
        gobj.pos.x -=36
        gobj.pos.y -= 42
        shootNWay(gobj, way, spreadAngle, aimAngle, aimType, times, speed)
        gobj.pos.x +=72
        shootNWay(gobj, way, spreadAngle, aimAngle, aimType, times, speed)
    }
    else{
        gobj.pos.x -=56
        shootNWay(gobj, way, spreadAngle, aimAngle, aimType, times, speed)
        gobj.pos.x +=112
        shootNWay(gobj, way, spreadAngle, aimAngle, aimType, times, speed)
    }
    gobj.pos.x = px
    gobj.pos.y = py
}