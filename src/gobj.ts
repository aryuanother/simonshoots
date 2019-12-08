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
        if(this.vel.x == 0 && this.vel.y == 0 && this.ticks%4 == 0 ){
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
    destroy(){
        new Explosion(this, this.pos.x, this.pos.y, this.vel.x/2, this.vel.y/2, 60)
        super.destroy()
    }
}

export class Muzzle extends fw.GameObject{
    constructor(x:number, y:number, public maxsize:number, public wt:number){
        super()
        this.pos.x = x
        this.pos.y = y
        this.image = svg["muz"]
        this.angle = fw.random.get(0, 2*Math.PI)
        this.scale.x = (this.maxsize/2)/this.image.width
        this.scale.y = (this.maxsize/2)/this.image.height
    }
    update(){
        super.update()
        this.scale.x = (this.maxsize*((this.ticks/this.wt)+1)/2)/this.image.width
        this.scale.y = (this.maxsize*((this.ticks/this.wt)+1)/2)/this.image.height
        if(this.ticks > this.wt) this.destroy()
    }
    draw(){
        let a = this.context.globalAlpha
        this.context.globalAlpha = 1-(((this.ticks/this.wt)+1)/2)
        super.draw()
        this.context.globalAlpha = a
    }
}

export class Explosion extends fw.GameObject{
    size :number
    constructor(gobj:GameObject, x:number, y:number, vx:number, vy:number, public wt:number){
        super()
        this.pos.x = x
        this.pos.y = y
        this.vel.x = vx
        this.vel.y = vy
        this.image = svg["exp"]
        this.angle = fw.random.get(0, 2*Math.PI)
        this.size = gobj.image.width > gobj.image.height ? gobj.image.width : gobj.image.height
        this.scale.x = this.size/this.image.width
        this.scale.y = this.size/this.image.height
    }
    update(){
        super.update()
        this.scale.x = (this.size*((this.ticks/this.wt)/2+1))/this.image.width
        this.scale.y = (this.size*((this.ticks/this.wt)/2+1))/this.image.height
        if(this.ticks > this.wt) this.destroy()
    }
    draw(){
        let a = this.context.globalAlpha
        this.context.globalAlpha = 1-(((this.ticks/this.wt)+1)/2)
        super.draw()
        this.context.globalAlpha = a
    }
}

export class Shot extends fw.Shot{
    damage = 1.5
    constructor(gobj:GameObject, speed?:number, angle?:number){
        super(gobj, speed, angle)
        this.image = svg["shot"]
        this.collision.r = 10
        this.priority = 0.3
    }
    update(){
        if(this.ticks == 1)
            new Muzzle(this.pos.x, this.pos.y, this.image.width*2, 10)
        if(this.ticks == 5)
            this.damage = 1
        super.update()
    }
    dealDamage(val?:number){
        super.dealDamage(val)
        new Explosion(this, this.pos.x, this.pos.y, 0, this.damage != 1 ?-2:0, 10*this.damage)
    }
}

export class Enemy extends fw.Enemy{
    img_aim = svg["aim"]
    aiming = false
    constructor(f:(e:Enemy)=>void){
        super();
        f(this)
        this.priority = 0.3
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
    destroy(){
        new Explosion(this, this.pos.x, this.pos.y, this.vel.x/2, this.vel.y/2, 60)
        super.destroy()
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
    update(){
        if(this.ticks == 1)
            new Muzzle(this.pos.x, this.pos.y, this.image.width*2, 20)
        super.update()
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
        gobj.context.rotate(-gobj.ticks*8*Math.PI/60)
        gobj.context.scale(gobj.scale.x,gobj.scale.y)
        gobj.context.drawImage(this.img_prop, -(this.img_prop.width/2), -(this.img_prop.height/2))
        gobj.context.restore()
    }
}