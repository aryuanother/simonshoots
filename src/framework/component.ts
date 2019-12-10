import * as _ from 'lodash'
import * as fw from "./index"
import { GameObject } from './gameobject'
import { isIn } from './util'

export class Component{
    update() {
        
    }
    constructor(public gobj:GameObject){
        if(gobj != null){
            gobj._addComponent(this)
        }
    }
}

export class DoUnderCondition extends Component{
    enable = true
    constructor(gobj:GameObject, public f:(x: DoUnderCondition) => void, public cond: (x: DoUnderCondition) => boolean){
        super(gobj)
    }
    update(){
        if(this.enable && this.cond(this)){
            this.f(this)
        }
    }
}

export class MoveTo extends Component{
    originX:number
    originY:number
    ticks = 0
    constructor(gobj:GameObject,public targetX:number,public targetY:number, public duration:number){
        super(gobj)
        this.originX = gobj.pos.x
        this.originY = gobj.pos.y
    }
    update(){
        if(this.ticks >= this.duration) return
        this.ticks++
        let t = this.ticks/this.duration
        let rate = t*t*(3.0-2.0*t)
        this.gobj.pos.x = this.originX*(1-rate)+this.targetX*rate
        this.gobj.pos.y = this.originY*(1-rate)+this.targetY*rate
    }
}
export class StayOnScreen extends Component{
    constructor(gobj:GameObject, public padding :number = 30){
        super(gobj)
    }
    update(){
        this.gobj.pos.x = fw.clamp(this.gobj.pos.x, this.padding, fw.width-this.padding)
        this.gobj.pos.y = fw.clamp(this.gobj.pos.y, this.padding, fw.height-this.padding)
    }
}

export class RemoveWhenOut extends Component{
    constructor(gobj:GameObject, public padding :number = 10){
        super(gobj)
    }
    update(){
        if(!fw.isIn(this.gobj.pos.x, -this.padding, fw.width+this.padding) ||
           !fw.isIn(this.gobj.pos.y, -this.padding, fw.height+this.padding)){
           this.gobj.remove();
        }
    }
}

export class RemoveWhenInAndOut extends RemoveWhenOut{
    isIn = false
    paddingOuter = 100
    constructor(gobj:GameObject, padding:number = 10){
        super(gobj, padding)
    }
    update(){
        if(this.isIn){
            return super.update()
        }
        if(fw.isIn(this.gobj.pos.x, -this.padding, fw.width+this.padding) &&
           fw.isIn(this.gobj.pos.y, -this.padding, fw.height+this.padding)){
           this.isIn = true;
        }
        if(!fw.isIn(this.gobj.pos.x, -this.paddingOuter, fw.width+this.paddingOuter) ||
           !fw.isIn(this.gobj.pos.y, -this.paddingOuter, fw.height+this.paddingOuter)){
            this.gobj.remove();
        }
    }
}