import * as fw from "./framework/index"
import { GameObject, DoUnderCondition, MoveTo } from "./framework/index"
import _ = require("lodash")
import {svg} from "./svg"

export let player: Player
export function initPlayer(){
    player = new Player()
}
export class Player extends fw.Player{
    constructor(){
        super();
        this.image = svg["player"]
        this.pos.x = fw.width/2
        this.pos.y = fw.height/2
        this.collision.r = 5
    }
    update(){
        super.update()
        if(this.vel.x == 0 && this.vel.y == 0 && this.ticks%2 == 0 ){
            let s1 = new Shot(this,32,-Math.PI/2)
            let s2 = new Shot(this,32,-Math.PI/2)
            let s3 = new Shot(this,32,-Math.PI/2)
            let s4 = new Shot(this,32,-Math.PI/2)
            s1.pos.x += 10
            s2.pos.x -= 10
            s3.pos.x += 20
            s4.pos.x -= 20
            s3.pos.y += 20
            s4.pos.y += 20
        }
    }
}
export class Shot extends fw.Shot{
    damage = 1
    constructor(gobj:GameObject, speed?:number, angle?:number){
        super(gobj, speed, angle)
        this.image = svg["shot"]
        this.collision.r = 10
    }
}

export class Enemy extends fw.Enemy{
    img_aim = svg["aim"]
    aiming = false
    constructor(f:(e:Enemy)=>void){
        super();
        f(this)
    }
    dealDamage(val?:number){
        if(0 <= this.pos.x && this.pos.x <= fw.width &&
           0 <= this.pos.y && this.pos.y <= fw.height)
            super.dealDamage(val)
    }
    draw(){
        if(this.aiming){
            let s = Math.max(this.image.width,this.image.height)*1.8/this.img_aim.width
            this.context.save()
            this.context.translate(this.pos.x, this.pos.y)
            this.context.rotate(Math.atan2(player.pos.y-this.pos.y,player.pos.x-this.pos.x ))
            this.context.scale(s,s)
            this.context.drawImage(this.img_aim, -(this.img_aim.width/2), -(this.img_aim.height/2))
            this.context.restore()
        }
        super.draw()
    }
}

export class EnemyWithToughness extends Enemy{
    toughness:number = 60
    constructor(f:(e:Enemy)=>void){
        super(f)
    }
    dealDamage(val:number = 1){
        if(!val) return
        this.toughness -= val
        if(this.toughness <= 0){
            this.destroy()
        }
    }
}

export class Bullet extends fw.Bullet{
    constructor(gobj:GameObject, speed:number, angle:number, r:number, img:HTMLCanvasElement){
        super(gobj, speed, angle);
        this.collision.r = r
        this.image =img
    }
}

export class ZakoHeli extends Enemy{
    img_prop = svg["heli_prop"]
    constructor(f:(e:Enemy)=>void){
        super(f)
        this.image = svg["enemy_heli"]
        this.collision.r = 25
    }
    draw(){
        super.draw()
        let gobj = this
        gobj.context.save()
        gobj.context.translate(gobj.pos.x, gobj.pos.y)
        gobj.context.rotate(-gobj.ticks*8*Math.PI/30)
        gobj.context.scale(gobj.scale.x,gobj.scale.y)
        gobj.context.drawImage(this.img_prop, -(this.img_prop.width/2), -(this.img_prop.height/2))
        gobj.context.restore()
    }
}