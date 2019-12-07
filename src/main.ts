import * as fw from "./framework/index"
import { GameObject, DoUnderCondition, MoveTo } from "./framework/index"
import _ = require("lodash")
let player: Player
let svg: { [x: string]: HTMLCanvasElement; } = {}
function loadSVG(filename:string, alias:string, width:number, height:number){
    svg[alias] = fw.loadImageAsync(filename,width,height)
    return svg[alias]
}

class Player extends fw.Player{
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
class Shot extends fw.Shot{
    damage = 1
    constructor(gobj:GameObject, speed?:number, angle?:number){
        super(gobj, speed, angle)
        this.image = svg["shot"]
        this.collision.r = 10
    }
}

class Enemy extends fw.Enemy{
    img_aim = svg["aim"]
    aiming = false
    constructor(f:(e:Enemy)=>void){
        super();
        f(this)
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

class EnemyWithToughness extends Enemy{
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

class Bullet extends fw.Bullet{
    constructor(gobj:GameObject, speed:number, angle:number, r:number, img:HTMLCanvasElement){
        super(gobj, speed, angle);
        this.collision.r = r
        this.image =img
    }
}





class ZakoHeli extends Enemy{
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

function shootNWay(gobj:GameObject, way:number, spreadAngle:number, aimAngle:number, aimType:"Fixed"|"Aim", times:number, speed:number){
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
function init(){
    svg = {}
    loadSVG("svg/player.svg","player",60,60)
    loadSVG("svg/missile.svg","shot",20,20)
    loadSVG("svg/bullet_aim.svg","bullet_aim",30,30)
    loadSVG("svg/bullet_noaim.svg","bullet",30,30)
    loadSVG("svg/enemy_mid.svg","enemy_mid",180,110)
    loadSVG("svg/enemy_heli.svg","enemy_heli",50,95)
    loadSVG("svg/propeller.svg","heli_prop",80,80)
    loadSVG("svg/explosion.svg","exp",500,500)
    loadSVG("svg/muzzle.svg","muz",500,500)
    loadSVG("svg/aimmark.svg","aim",500,500)
    fw.context.fillStyle = "#07071f"
    fw.setTitle("Simon Shoots...")
}

function* stageScript(){
    for(let i = 0; i < 120; i++) yield;
    let f1 = (ax:number, ay:number,
        tx:number, ty:number, vx:number, vy:number, mt:number, wt:number)=>{
        return new ZakoHeli((e)=>{
            e.pos.x = ax
            e.pos.y = ay
    
            new fw.MoveTo(e, tx, ty, mt)

            new fw.DoUnderCondition(e,
                (c)=>{
                    let gobj = c.gobj
                    gobj.clearComponent()
                    gobj.ticks = 0
                    new fw.DoUnderCondition(gobj,
                        (c)=>{
                            let gobj = c.gobj
                            gobj.clearComponent()
                            gobj.vel.x = vx 
                            gobj.vel.y = vy
                            shootNWay(gobj, 4, Math.PI/2, Math.PI/2, "Fixed", 3,5)
                        },
                        (c)=>{
                            return Math.abs(c.gobj.pos.x - tx) < 1 &&
                                   Math.abs(c.gobj.pos.y - ty) < 1
                        }
                    )
                },
                (c)=>{
                    return c.gobj.ticks == mt+wt
                }
            )
        })
    }
    f1(-25,0,fw.width/3,fw.height/4,0,-10,15,30)
    for(let i = 0; i < 30; i++) yield;
    f1(fw.width+25,0,2*fw.width/3,fw.height/4,0,-10,15,0)
    for(let i = 0; i < 60; i++) yield;
    let f2 = (x:number, y:number, vx:number, vy:number, si:number)=>{
        return new ZakoHeli((e)=>{
            e.pos.x = x
            e.pos.y = y
            e.vel.x = vx 
            e.vel.y = vy
            new fw.DoUnderCondition(e, (c)=>{
                shootNWay(c.gobj, 3, Math.PI/20, 0, "Aim", 1,8-c.gobj.ticks/si)
            }, 
            (c)=>{
                return c.gobj.ticks %  si == 0
            })
        })
    }
    f2(4*fw.width/10,-45,0,5,20)
    f2(5*fw.width/10,-45,0,5,20)
    f2(6*fw.width/10,-45,0,5,20)
    for(let i = 0; i < 60; i++) yield;
    let f3 = (x:number, y:number)=>{
        let leftside = (x < fw.width/2)
        return new ZakoHeli((e)=>{
            e.pos.x = leftside?-25:fw.width+25
            e.pos.y = y
            new fw.MoveTo(e, x, y, 10)
            new DoUnderCondition(e, (c)=>{
                shootNWay(c.gobj, 1, 0,
                    (Math.PI/2)+(leftside?-1:1)*(Math.PI/3)*(c.gobj.ticks-10)/30,
                    "Fixed", 2,5+(c.gobj.ticks-10)/6)
            },
            (c)=>{
                return c.gobj.ticks >= 10 && c.gobj.ticks < 40
            })
        })
    }
    f3(2*fw.width/10, fw.height/5)
    for(let i = 0; i < 30; i++) yield;
    f3(8*fw.width/10, fw.height/5)
    for(let i = 0; i < 120; i++) yield;
   
    let f4 =(x:number, y:number, speed:number)=>{
        return new ZakoHeli((e)=>{
            e.pos.x = x
            e.pos.y = y
            new DoUnderCondition(e, (c)=>{
                if(c.gobj.pos.y < player.pos.y && Math.abs((player.pos.y-c.gobj.pos.y)/(player.pos.x-c.gobj.pos.x)) >= 1){
                    let gobj = c.gobj
                    let dx = player.pos.x - gobj.pos.x
                    let dy = player.pos.y - gobj.pos.y
                    let mag = Math.sqrt(dx**2+dy**2)
                    dx /= mag
                    dy /= mag
                    dx *= speed
                    dy *= speed*0.8
                    dy += speed*0.2
                    gobj.vel.x = dx
                    gobj.vel.y = dy
                    gobj["aiming"] = true
                    if(gobj.ticks%30 == 0) shootNWay(c.gobj, 1, 0, 0, "Aim", 1, 0.8*speed)
                }
                else{
                    if(c.gobj.vel.x == 0 && c.gobj.vel.y == 0){
                        c.gobj.vel.x = 0
                        c.gobj.vel.y = speed
                    }
                    
                    c.gobj["aiming"] = false
                }
            },(c)=>true)
        })
    }
    for(let i = 1; i <= 6; i++) {
        f4(i*(fw.width+100)/7-50, -45,10)
        yield;yield;
    }
    for(let i = 0; i < 60; i++) yield;
    for(let i = 6; i >= 1; i--) {
        new ZakoHeli((e)=>{
            e.pos.x = i*fw.width/7
            e.pos.y = -45
            e.vel.x = 0
            e.vel.y = 10
        })
        yield;yield;
    }
    
    for(let i = 0; i < 60; i++) yield;
    let fire1=(e)=>{
        let rg = new fw.Random()
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
    let f5 = (x:number, y:number)=>{
        new EnemyWithToughness((e)=>{
            e.image = svg["enemy_mid"]
            e.collision.r = 50
            e.pos.x = x
            e.pos.y = y
            e["aiming"] = true
            
            new DoUnderCondition(e, (c)=>{
                c.gobj.vel.x = (player.pos.x-c.gobj.pos.x)/20
            },
            (c)=>{
                return c.gobj.ticks < 60
            })
            new DoUnderCondition(e, (c)=>{
                c.gobj.clearComponent()
                c.gobj.ticks = 0
                c.gobj.vel.x = c.gobj.vel.y = 0
                c.gobj["aiming"] = false
                new DoUnderCondition(c.gobj, (c)=>{
                    let gobj = c.gobj
                    fire1(gobj)
                    gobj.vel.x = 0
                    gobj.vel.y = -5
                    gobj.clearComponent()
                },
                (c)=>{
                    return c.gobj.ticks == 30
                })
            },
            (c)=>{
                return c.gobj.ticks == 60
            })
        }).toughness = 180
    }
    f5(-90, fw.height/3)
    for(let i = 0; i < 90; i++) yield;
    f5(fw.width+90, fw.height/2)
    for(let i = 0; i < 90; i++) yield;
    let f6 =(ax:number, ay:number, tx:number, ty:number, mt:number, wt:number)=>{
        new EnemyWithToughness((e)=>{
            e.image = svg["enemy_mid"]
            e.collision.r = 50
            e.pos.x = ax
            e.pos.y = ay
            new MoveTo(e, tx, ty, mt)
            new DoUnderCondition(e, (c)=>{
                let gobj = c.gobj
                fire1(gobj)
                gobj.vel.x = 0
                gobj.vel.y = -5
                gobj.clearComponent()
            },
            (c)=>{
                return c.gobj.ticks == mt+wt
            })
            
        }).toughness = 180
        
    }
    f6(-90,3*fw.height/4,fw.width/4,fw.height/3,30,180)
    for(let i = 0; i < 30; i++) yield;
    f6(fw.width/2,-55,fw.width/2,fw.height/4,30,150)
    for(let i = 0; i < 30; i++) yield;
    f6(fw.width+90,3*fw.height/4,3*fw.width/4,fw.height/3,30,120)
    for(let i = 0; i < 300; i++) yield;
    fw.endGame()
}
let ss: Generator<any, void, unknown>
function start(){
    player = new Player()
    ss = stageScript()
}
function update(){
    !!ss && ss.next()
}
fw.run(init, start, update)