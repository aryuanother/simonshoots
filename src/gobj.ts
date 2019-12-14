import * as fw from "./framework/index"
import { GameObject, DoUnderCondition, MoveTo } from "./framework/index"
import _ = require("lodash")
import {svg} from "./svg"

export let player: Player
export let hud: HUD
export function initPlayer(){
    player = new Player()
    hud = new HUD()
}
export class Player extends fw.Player{
    mortal = true
    scheduledMortalTicks = 0
    count_shield = 3
    constructor(){
        super();
        this.image = svg["player"]
        this.pos.x = fw.width/2
        this.pos.y = fw.height/2
        this.collision.r = 5
    }
    update(){
        if(this.mortal){
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
        else{
            this.ticks++
            if(this.scheduledMortalTicks > 0 && this.scheduledMortalTicks == this.ticks){
                this.mortal = true
                this.scheduledMortalTicks = 0
            }
            this.draw()
        }
        
    }
    destroy(){
        new Explosion(this, this.pos.x, this.pos.y, this.vel.x/2, this.vel.y/2, 60)
        super.destroy()
    }
    setMortal(mortal:boolean){
        mortal?(this.scheduledMortalTicks = this.ticks+2):(this.mortal = false)
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
    destroy(){
        super.destroy()
        new Explosion(this, this.pos.x, this.pos.y, 0, this.damage != 1 ?-2:0, 10*this.damage)
    }

}

export class HUD extends fw.GameObject{
    isUpper = true
    isStay = false
    img_shield = svg["shield"]
    img_stay = svg["stay"]
    img_move = svg["move"]
    snapshots:fw.GameObject[] = []
    constructor(){
        super()
        this.image = svg["hud"]
        this.ticks = 20
    }

    stay(){
        this.isStay = true
        // destroy all shots and bullets
        _.forEach(GameObject.getByCollisionType("shot"),gobj=>gobj.destroy())
        _.forEach(GameObject.getByCollisionType("bullet"),gobj=>gobj.destroy())
        // make the player immotal and locked
        player.setMortal(false)
        // store deep copy of the enemies
        this.snapshots = []
        _.forEach(GameObject.getByCollisionType("enemy"),gobj=>this.snapshots.push(snapShotEnemy(gobj)))
    }
    move(){
        this.isStay = false
        // destroy all bullets
        _.forEach(GameObject.getByCollisionType("bullet"),gobj=>gobj.destroy())
        // make the player motal and free
        player.setMortal(true)
        // restore deep copy of the enemies
        _.forEach(GameObject.getByCollisionType("enemy"),gobj=>gobj.remove())
        _.forEach(this.snapshots,gobj=>GameObject.add(gobj))
        this.snapshots = []
    }
    toggle(){
        this.isStay?this.move():this.stay()
    }

    update(){
        
        if(!this.isUpper && player.pos.y > 2*fw.height/3){
            this.isUpper = true
            this.ticks = 0
        }
        if(this.isUpper && player.pos.y < fw.height/3){
            this.isUpper = false
            this.ticks = 0
        }
        super.update()
    }
    draw(){
        let upper = (this.isUpper && this.ticks >= 10) || (!this.isUpper && this.ticks < 10)
        let anchor_y = upper?0:fw.height
        if(this.ticks < 10){
            if(upper) anchor_y -= 6*this.ticks
            else anchor_y += 6*this.ticks
        }
        else if(this.ticks < 20){
            if(upper) anchor_y += 6*(this.ticks-20)
            else anchor_y -= 6*(this.ticks-20)
        }

        this.context.save()
        this.context.translate(fw.width/2, anchor_y)
        this.context.rotate((upper?1:-1)*Math.PI/2)
        this.context.drawImage(this.image, -(this.image.width/2), -(this.image.height/2))
        this.context.restore()
        
        let img_mode = this.isStay?this.img_stay:this.img_move
        
        this.context.save()
        this.context.translate(fw.width/2, anchor_y+(upper?15:-15))
        this.context.drawImage(img_mode, -(img_mode.width/2), -(img_mode.height/2))
        this.context.restore()

        this.context.save()
        this.context.translate(fw.width/2, anchor_y+(upper?45:-45))
        let x = -(this.img_shield.width/2)
        x -= (player.count_shield-1)*this.img_shield.width/2
        for(let i = 1; i <= player.count_shield; i++){
            this.context.drawImage(this.img_shield, x, -(this.img_shield.height/2))
            x += this.img_shield.width
        }
        this.context.restore()
    }
}

export function snapShotEnemy(enem: fw.GameObject){
    const clone = Object.create(enem)
    for(const prop of Object.getOwnPropertyNames(enem)){
        if(Array.isArray(enem[prop])){
            if(prop === "component"){
                clone[prop] = []
                for(let i in enem[prop]){
                    const component = Object.create(enem[prop][i])
                    Object.assign(component, enem[prop][i])
                    component.gobj = clone
                    clone[prop].push(component)
                }
            }
            else{
                clone[prop] = [...enem[prop]]
            }
        }
        else if(Object.prototype.toString.call(enem[prop]) === "[object Object]"){
            clone[prop] = {}
            Object.assign(clone[prop], enem[prop])
        }
        else{
            clone[prop] = enem[prop]
        }
    }
    return clone
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
    destroy(){
        new Explosion(this, this.pos.x, this.pos.y, this.vel.x/2, this.vel.y/2, 60)
        super.destroy()
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