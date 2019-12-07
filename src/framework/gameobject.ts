import * as _ from 'lodash'
import * as fw from "./index"
import { StayOnScreen } from './component'

export class GameObject{
    pos = {x:0, y:0}
    ppos = {x:0, y:0}
    vel = {x:0, y:0}
    angle = 0
    speed = 0
    ticks = 0
    priority = 0
    image : HTMLCanvasElement | null = null
    scale = {x:1.0, y:1.0}
    type: string
    isAlive = true
    isActive = true
    static showCollision = !true
    collision = {r:0, /*w:0, h:0*/}
    collisionType :string = ""
    component: fw.Component[] = []
    componentName: string[] = []
    context = fw.context
    

    constructor(){
        GameObject.add(this)
        this.type = fw.getClassName(this)
        new fw.RemoveWhenInAndOut(this)
    }

    update(){
        this.ppos = this.pos
        this.pos.x += this.vel.x + Math.cos(this.angle)*this.speed
        this.pos.y += this.vel.y + Math.sin(this.angle)*this.speed
        this.draw()
        _.forEach(this.component, (c) => {
            c.update()
        });
        this.ticks++
    }

    enable(){
        this.isActive = true
    }
    disable(){
        this.isActive = false
    }
    remove(){
        this.isAlive = false
    }
    dealDamage(val:number = 1){
        this.destroy()
    }
    destroy(){
        this.remove()
    }
    clearComponent(){
        this.component = []
        this.componentName = []
    }
    checkCollision(type:string){
        return _.filter<GameObject>(GameObject.getByCollisionType(type), o =>
            ((this.pos.x-o.pos.x)**2)+((this.pos.y-o.pos.y)**2) <= Math.pow(this.collision.r+ o.collision.r, 2)
        )
    }

    draw(){
        if(this.context == null || this.image == null) return;
        this.context.save()
        this.context.translate(this.pos.x, this.pos.y)
        this.context.rotate(this.angle)
        this.context.scale(this.scale.x,this.scale.y)
        this.context.drawImage(this.image, -(this.image.width/2), -(this.image.height/2))
        this.context.restore()

        if(GameObject.showCollision){
            let originFillStyle = this.context.fillStyle
            this.context.fillStyle = "rgba(255,0,0,63)"
            this.context.beginPath()
            this.context.arc(this.pos.x, this.pos.y, this.collision.r, 0, 2*Math.PI)
            this.context.closePath()
            this.context.fill()
            this.context.fillStyle = originFillStyle
        }
    }

    getComponent(name:string){
        return this.component[_.indexOf(this.componentName, name)]
    }

    _addComponent(c:fw.Component){
        this.component.push(c)
        this.componentName.push(fw.getClassName(c))
    }

    static gobj: GameObject[]
    static add(obj:GameObject){
        GameObject.gobj.push(obj)
    }
    static init(){
        GameObject.clear()
    }
    static clear(){
        GameObject.gobj = []
    }
    static update(){
        _.sortBy(GameObject.gobj, "priority")
        for(let i = 0; i < GameObject.gobj.length;){
            const obj = GameObject.gobj[i]
            if(obj.isAlive !==false && obj.isActive !== false){
                obj.update()
            }
            if(obj.isAlive === false){
                GameObject.gobj.splice(i,1)
            }
            else{
                i++
            }
        }
    }

    static getByType(type:string | null = null){
        return type == null ? GameObject.gobj:
        _.filter<GameObject>(GameObject.gobj, o => o.type === type)
    }
    static getByComponentName(name:string){
        return _.filter<GameObject>(GameObject.gobj, o=> _.indexOf(o.componentName, name) >= 0)
    }
    static getByCollisionType(type:string){
        return _.filter<GameObject>(GameObject.gobj, o=> o.collisionType == type)
    }
}

export class Player extends GameObject{
    
    constructor(){
        super()
        this.type = this.collisionType = "player"
        this.collision = {r : 5}
        this.clearComponent()
        new fw.StayOnScreen(this)
    }
    update(){
        // will emit particles
        super.update()
        this.vel.x = 5* fw.input.joystick.x
        this.vel.y = 5* fw.input.joystick.y
        if(this.checkCollision("enemy").length  > 0 ||
           this.checkCollision("bullet").length > 0){
           this.dealDamage()
        }
    }
    destroy(){
        // will play a sound
        // will emit particles
        super.destroy()
        fw.endGame()
    }
}

export class Enemy extends GameObject{
    constructor(){
        super();
        this.type = this.collisionType = "enemy"
    }
    update(){
        // will emit particles
        super.update()
        const cs = this.checkCollision("shot")
        if(cs.length  > 0){
           this.dealDamage()
           _.forEach(cs, (s:GameObject)=>{
               this.dealDamage(s["damage"])
               s.dealDamage()
            })
        }
    }
    destroy(){
        // will play a sound
        // will emit particles
        // will gain score
        super.destroy()
    }
}

export class Shot extends GameObject{
    constructor(gobj:GameObject, speed:number = 8, angle?:number){
        super();
        this.type = this.collisionType = "shot"
        this.pos.x = gobj.pos.x
        this.pos.y = gobj.pos.y
        this.angle = !angle ? gobj.angle : angle
        this.speed = speed
        this.priority = 0.3
    }
    update(){
        if(this.ticks === 0){
            // will play a sound
            // will emit particles
        }
        // will emit particles
        super.update();
    }
}

export class Bullet extends GameObject{
    constructor(gobj:GameObject, speed:number = 8, angle?:number){
        super();
        this.type = this.collisionType = "bullet"
        this.pos.x = gobj.pos.x
        this.pos.y = gobj.pos.y
        this.angle = !angle ? gobj.angle : angle
        this.speed = speed
    }
    update(){
        if(this.ticks === 0){
            // will play a sound
            // will emit particles
        }
        // will emit particles
        super.update();
    }
}

export class Text extends GameObject{
    constructor(public str:string, public duration:number = 30){
        super();
        this.vel.y = -2;
    }

    update(){
        super.update();
        this.vel.x *= 0.9;
        this.vel.y *= 0.9;
        fw.drawText(this.str, this.pos.x, this.pos.y)
        if(this.duration >= 0 && this.ticks >= this.duration){
            this.remove()
        }
    }
}