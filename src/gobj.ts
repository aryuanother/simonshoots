import * as fw from "./framework/index"
import { GameObject, isIn, MoveTo} from "./framework/index"
import {svg} from "./svg"
import forEach_ = require('lodash/forEach')
import { intervalFrame } from "./enemy"
import { shootNWay } from "./firecontrol"
let _ = {
    forEach:forEach_,
}

export let player: Player
export let hud: HUD
export function initGameObjects(){
    player = new Player()
    hud = new HUD()
}
export class Player extends fw.Player{
    mortal = true
    freezed = false
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
        if(fw.scene == fw.Scene.title) return
        this.collision.r = this.mortal?5:NaN
        super.update()
        
        if(this.freezed){
            this.vel.x = this.vel.y = 0
        }
        else{
            if(this.mortal && this.vel.x == 0 && this.vel.y == 0 && this.ticks%4 == 0 ){
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
        if(!this.mortal){
            if(this.ticks%30 == 0){
                new Explosion(this, this.pos.x, this.pos.y, 0, 0, 30).image = this.image
            }
            if(this.scheduledMortalTicks > 0 && this.scheduledMortalTicks == this.ticks){
                this.mortal = true
                this.scheduledMortalTicks = 0
            }
        }    
    }
    dealDamage(){
        if(this.count_shield == 0)this.destroy()
        else{
            this.count_shield--
            new Explosion(this, hud.pos.x, hud.pos.y+(hud.pos.y > fw.height/2?-45:45), 0, 0, 60)
            new Explosion(this, this.pos.x, this.pos.y, 0, 0, 60)
            fw.audio.play("playerhit")
            this.setMortal(false)
        }
    }
    destroy(){
        new Explosion(this, this.pos.x, this.pos.y, this.vel.x/2, this.vel.y/2, 60)
        fw.audio.play("playerdestroyed")
        super.destroy()
    }
    setMortal(mortal:boolean){
        mortal?(this.scheduledMortalTicks = this.ticks+2):(this.mortal = false)
    }
    setFreeze(freeze:boolean){
        this.freezed = freeze
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
        fw.audio.play("shot", 0.08)
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
    score = 0
    count_enemy = 0
    count_destroyed = 0
    count_bullet_exp = 0
    count_bullet_act = 0
    sweep_bonus = 0
    constructor(){
        super()
        this.image = svg["hud"]
        this.ticks = 10
        this.pos.x = fw.width/2
        this.clearComponent()
    }

    stay(){
        this.isStay = true
        // bullet prevent bonus
        if(this.count_bullet_exp > this.count_bullet_act){
            this.score += 100*(this.count_bullet_exp-this.count_bullet_act)
            let upper = (this.isUpper && this.ticks >= 10) || (!this.isUpper && this.ticks < 10)
            fw.audio.play("bonus")
            new fw.Text("SEALED+"+100*(this.count_bullet_exp-this.count_bullet_act)).pos = {x:3*fw.width/4,y:this.pos.y+(upper?60:-30)}
        }
        // destroy all shots and bullets
        _.forEach(GameObject.getByCollisionType("shot"),gobj=>gobj.destroy())
        _.forEach(GameObject.getByCollisionType("bullet"),gobj=>gobj.destroy())
        // make the player immotal and locked
        player.setMortal(false)
        player.setFreeze(true)
        // store deep copy of the enemies
        this.snapshots = []
        _.forEach(GameObject.getByCollisionType("enemy"),gobj=>this.snapshots.push(snapShotEnemy(gobj)))

        new Explosion(player, hud.pos.x, hud.pos.y+(hud.pos.y > fw.height/2?-15:15), 0, 0, 60).image = this.img_stay

        this.count_enemy = 0
        this.count_bullet_exp = 0
    }
    move(){
        this.isStay = false
        // destroy all bullets
        _.forEach(GameObject.getByCollisionType("bullet"),gobj=>gobj.destroy())
        // make the player motal and free
        player.setMortal(true)
        player.setFreeze(false)
        // restore deep copy of the enemies
        _.forEach(GameObject.getByCollisionType("enemy"),gobj=>gobj.remove())
        _.forEach(this.snapshots,gobj=>GameObject.add(gobj))
        this.snapshots = []
        
        new Explosion(player, hud.pos.x, hud.pos.y+(hud.pos.y > fw.height/2?-15:15), 0, 0, 60).image = this.img_move
        
        this.count_destroyed = 0
        this.count_bullet_act = 0
    }
    toggle(){
        this.isStay?this.move():this.stay()
        fw.audio.play("modechange",0.1)
    }
    appearEnemy(){
        if(this.isStay) this.count_enemy++
    }
    disappearEnemy(){
        if(!this.isStay){
            this.count_destroyed++
            if(this.count_enemy == this.count_destroyed){
                this.score += this.sweep_bonus
                let upper = (this.isUpper && this.ticks >= 10) || (!this.isUpper && this.ticks < 10)
                fw.audio.play("bonus")
                new fw.Text("SWEPT+"+this.sweep_bonus).pos = {x:3*fw.width/4,y:this.pos.y+(upper?60:-30)}
            }
        }
    }
    shotBullet(){
        this.isStay?this.count_bullet_exp++:this.count_bullet_act++
    }
    update(){
        if(fw.scene == fw.Scene.title) return
        if(!this.isUpper && player.pos.y > 2*fw.height/3){
            this.isUpper = true
            this.ticks = 0
        }
        if(this.isUpper && player.pos.y < fw.height/3){
            this.isUpper = false
            this.ticks = 0
        }
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
        this.pos.y = anchor_y
        super.update()
    }
    draw(){
        let upper = (this.isUpper && this.ticks >= 10) || (!this.isUpper && this.ticks < 10)
        
        this.context.save()
        this.context.translate(this.pos.x, this.pos.y)
        this.context.rotate((upper?1:-1)*Math.PI/2)
        this.context.drawImage(this.image, -(this.image.width/2), -(this.image.height/2))
        this.context.restore()
        
        let img_mode = this.isStay?this.img_stay:this.img_move
        
        this.context.save()
        this.context.translate(this.pos.x, this.pos.y+(upper?15:-15))
        this.context.drawImage(img_mode, -(img_mode.width/2), -(img_mode.height/2))
        this.context.restore()

        this.context.save()
        this.context.translate(this.pos.x, this.pos.y+(upper?45:-45))
        let x = -(this.img_shield.width/2)
        x -= (player.count_shield-1)*this.img_shield.width/2
        for(let i = 1; i <= player.count_shield; i++){
            this.context.drawImage(this.img_shield, x, -(this.img_shield.height/2))
            x += this.img_shield.width
        }
        this.context.restore()

        let score_str = "SCORE:"
        score_str += ("00000000"+this.score).slice(-8)
        fw.drawText(score_str, 4*fw.width/5, this.pos.y+(upper?15:-15))
    }
}

function snapShotEnemy(enem: fw.GameObject){
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
        hud.appearEnemy()
    }
    dealDamage(val?:number){
        if(fw.isIn(this.pos.x,0, fw.width) &&fw.isIn(this.pos.y,0, fw.height))
            super.dealDamage(val)
        
        val != undefined && val != 1 && fw.audio.play("enemydestroyed_l2",0.08)
        hud.score += 10*val
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
        if(!this.isAlive) return
        new Explosion(this, this.pos.x, this.pos.y, this.vel.x/2, this.vel.y/2, 60)
        hud.disappearEnemy()
        super.destroy()
    }
}

export class EnemyWithToughness extends Enemy{
    toughness:number = 60
    constructor(f:(e:Enemy)=>void){
        super(f)
        fw.audio.play("warning1")
    }
    dealDamage(val:number = 1){
        if(0 <= this.pos.x && this.pos.x <= fw.width &&
            0 <= this.pos.y && this.pos.y <= fw.height)
            this.toughness -= val
        hud.score += 10*val
        if(this.toughness <= 0){
            this.destroy()
        }
    }
    destroy(){
        fw.audio.play("enemydestroyed_h2")
        super.destroy()
    }
}

export class Bullet extends fw.Bullet{
    constructor(gobj:GameObject, speed:number, angle:number, r:number, img:HTMLCanvasElement){
        super(gobj, speed, angle);
        this.collision.r = r
        this.image =img
        hud.shotBullet()
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
        fw.audio.play("bullet_l1")
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
    destroy(){
        fw.audio.play("enemydestroyed_l"+fw.random.getInt(1,3))
        super.destroy()
    }
}
export class WarningEnemy extends EnemyWithToughness{
    message:string
    constructor(f:(e:Enemy)=>void){
        super(f)
        this.image = svg["bullet_aim"]
        this.collision.r = 15
        this.toughness = NaN
    }
    update(){
        this.scale.x = this.scale.y = Math.min(1, 0.5+this.ticks/(fw.targetFramerate/2))
        super.update()
    }
    draw(){
        this.angle = Math.PI/2
        super.draw()
        this.angle = 0
        {
            let originFillStyle = this.context.fillStyle
            let originFont = this.context.font
            this.context.fillStyle = "blue"
            this.context.font = "small-caps 24px sans-serif"
            this.context.textAlign = "center"
            this.context.textBaseline = "middle"
            this.context.fillText(this.message,
                                this.pos.x, this.pos.y)
            this.context.fillStyle = originFillStyle
            this.context.font = originFont
        }
    }
}
export class Boss1 extends EnemyWithToughness{
    children_r:number[] = []
    children_angle:number[] = []
    children_ch:string[] = []
    img_child = svg["bullet_aim"]
    constructor(){
        super(e=>{})
        this.clearComponent()
        this.image = svg["boss1"]
        this.collision.r = 48
        this.pos.x = -100
        this.pos.y = fw.height+100
        this.toughness = NaN
        _.forEach(GameObject.getByCollisionType("enemy"),gobj=>{if(gobj !== this)gobj.remove()})
    }
    enter(){
        new Boss1Enter(this)
    }
    attack(idx:number){
        switch(idx){
            case 1:
                this.component=[new Boss1Attack1(this)]
                break;
            case 2:
                this.component=[new Boss1Attack2(this)]
                break;
        }
    }
    add(r:number, angle:number, ch:string){
        this.children_r.push(r)
        this.children_angle.push(angle)
        this.children_ch.push(ch)
    }
    shootStraight(times:number, speed:number){
        let originpos = {x:this.pos.x, y:this.pos.y}
        _.forEach(this.children_r, (r,i)=>{
            let x = originpos.x+r*Math.cos(this.children_angle[i]),
                y = originpos.y+r*Math.sin(this.children_angle[i])
            this.pos.x = x
            this.pos.y = y
            shootNWay(this, 1, 0, this.children_angle[i], "Fixed", times, speed)
        })
        this.pos = originpos
    }
    shootNWay(way:number, spreadAngle:number, aimAngle:number, aimType:"Aim"|"Fixed", times:number, speed:number){
        let originpos = {x:this.pos.x, y:this.pos.y}
        _.forEach(this.children_r, (r,i)=>{
            let x = originpos.x+r*Math.cos(this.children_angle[i]),
                y = originpos.y+r*Math.sin(this.children_angle[i])
            this.pos.x = x
            this.pos.y = y
            shootNWay(this, way, spreadAngle, aimAngle, aimType, times, speed)
        })
        this.pos = originpos
    }
    rotate(ang:number){
        _.forEach(this.children_r, (_,i)=>{
            this.children_angle[i] += ang
        })
    }
    draw(){
        super.draw()
        let gobj = this
        _.forEach(this.children_r, (r,i)=>{
            let x = gobj.pos.x+r*Math.cos(this.children_angle[i]),
                y = gobj.pos.y+r*Math.sin(this.children_angle[i])
            gobj.context.save()
            gobj.context.translate(x, y)
            gobj.context.rotate(this.children_angle[i])
            gobj.context.scale(gobj.scale.x,gobj.scale.y)
            gobj.context.drawImage(this.img_child, -(this.img_child.width/2), -(this.img_child.height/2))
            gobj.context.restore()
            let originFillStyle = this.context.fillStyle
            let originFont = this.context.font
            this.context.fillStyle = "blue"
            this.context.font = "small-caps 24px sans-serif"
            this.context.textAlign = "center"
            this.context.textBaseline = "middle"
            this.context.fillText(this.children_ch[i], x, y)
            this.context.fillStyle = originFillStyle
            this.context.font = originFont
        })
    }
}
class Boss1Enter extends fw.MoveTo{
    gobj:Boss1
    constructor(gobj:Boss1){
        super(gobj, fw.width+100, -100, intervalFrame*4)
        gobj.add(80, Math.PI+Math.PI/6, "S")
        gobj.add(80, Math.PI          , "I")
        gobj.add(80, Math.PI-Math.PI/6, "G")
        gobj.add(80,        -Math.PI/6, "H")
        gobj.add(80,                 0, "U")
        gobj.add(80,        +Math.PI/6, "P")
    }
    update(){
        super.update()
        if(this.ticks % (intervalFrame/2) == intervalFrame/4){
            this.gobj.shootStraight(10, 10)
        }
        if(this.ticks > this.duration+intervalFrame){
            this.gobj.clearComponent()
            this.gobj.pos.x = fw.width/2
            this.gobj.pos.y = -100
            new MoveTo(this.gobj, fw.width/2, fw.height/4, intervalFrame)
        }
    }
}
class Boss1Attack1 extends  fw.Component{
    gobj:Boss1
    ticks = 0
    constructor(gobj:Boss1){
        super(gobj)
        console.log("attack1 c")
    }
    update(){
        
        console.log("attack1 u")
        let angvel = (Math.PI/60)*Math.cos(Math.PI*this.ticks/intervalFrame)
        this.gobj.rotate(angvel)
        if(this.ticks%4 == 0 && (this.ticks%(2*intervalFrame) > 5*intervalFrame/4 || this.ticks%(2*intervalFrame) < intervalFrame)){
            this.gobj.shootStraight(1,10)
        }
        if(this.ticks%(2*intervalFrame) == intervalFrame){
            shootNWay(this.gobj, 2, Math.PI/10, 0, "Aim", 2,3)
            shootNWay(this.gobj, 1, 0, 0, "Aim", 2,5)
            fw.audio.play("bullet_h")
        }
        
        this.ticks++
    }
}
class Boss1Attack2 extends fw.Component{
    gobj:Boss1
    ticks = 0
    roundang:number
    angvel:number
    angacc:number
    constructor(gobj:Boss1){
        super(gobj)
        console.log("attack2 c")
    }
    update(){
        console.log("attack2 u")
        if(this.ticks % (intervalFrame/2) == 0 && this.ticks % (intervalFrame*8) > intervalFrame*3){
            shootNWay(this.gobj, 16, 15*Math.PI/8, this.roundang, "Fixed", 1, 3)
            this.roundang += 2*(Math.PI/8)/7
        }
        if(this.ticks % (intervalFrame*8) == 0){
            this.angacc = (Math.PI/360+Math.PI/180)
            this.angvel = 0
            this.roundang = Math.PI/8
        }
        else if(this.ticks % (intervalFrame*8) < intervalFrame*5){
            this.angvel +=  this.angacc
            this.gobj.rotate(this.angvel)
        }
        else if(this.ticks % (intervalFrame*8) == intervalFrame*5){
            this.gobj.shootNWay(3, Math.PI/3, 0, "Aim", 5, 5)
            fw.audio.play("bullet_m")
        }
        this.ticks++
    }
}