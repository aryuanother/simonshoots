import * as fw from "./framework/index"
import {DoUnderCondition, MoveTo } from "./framework/index"
import { ZakoHeli, player, EnemyWithToughness } from "./gobj"
import { shootNWay, jetshot, penaltyshot_upper } from "./firecontrol"
import { svg } from "./svg"
import times_ = require('lodash/times')
let _ = {
    times:times_,
}

export let intervalFrame: number
export function setBPM(bpm:number){
    intervalFrame = Math.round((60*fw.targetFramerate)/bpm)
}
export function enemy1(ax:number, ay:number,
                       tx:number, ty:number,
                       vx:number, vy:number,
                       mt:number, wt:number){
    return new ZakoHeli((e)=>{
        e.pos.x = ax
        e.pos.y = ay

        new fw.MoveTo(e, tx, ty, mt)

        new fw.DoUnderCondition(e,
            (c)=>{
                let gobj = c.gobj
                gobj.ticks = 0
                gobj.component[gobj.component.indexOf(c)] = new fw.DoUnderCondition(gobj,
                    (c)=>{
                        let gobj = c.gobj
                        gobj.component[gobj.component.indexOf(c)] = new fw.Component(gobj)
                        gobj.vel.x = vx 
                        gobj.vel.y = vy
                        shootNWay(gobj, 6, Math.PI/2, Math.PI/2, "Fixed", 8,12)
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

export function enemy2(x:number, y:number,
                       vx:number, vy:number, si:number){
    return new ZakoHeli((e)=>{
        e.pos.x = x
        e.pos.y = y
        e.vel.x = vx 
        e.vel.y = vy
        new fw.DoUnderCondition(e, (c)=>{
            shootNWay(c.gobj, 3, Math.PI/20, 0, "Aim", 1,4-0.5*(c.gobj.ticks/si))
        }, 
        (c)=>{
            return c.gobj.ticks %  si == 0
        })
    })
}

export function enemy3(x:number, y:number){
    let leftside = (x < fw.width/2)
    return new ZakoHeli((e)=>{
        e.pos.x = leftside?-25:fw.width+25
        e.pos.y = y
        new fw.MoveTo(e, x, y, intervalFrame/2)
        new DoUnderCondition(e, (c)=>{
            if(c.gobj.ticks%10 < 3){
                shootNWay(c.gobj, 1, 0,
                    (Math.PI/2)+(leftside?-1:1)*(2*Math.PI/5)*(c.gobj.ticks-(intervalFrame/2))/(2*intervalFrame),
                    "Fixed", 2,2.5+(c.gobj.ticks-(intervalFrame/2))/(intervalFrame/5))
            }
            if(c.gobj.ticks == 2*intervalFrame){
                c.gobj.vel.y = 8
                c.gobj.vel.x = c.gobj.pos.x < fw.width/2?-8:8
            }
        },
        (c)=>{
            return c.gobj.ticks >= intervalFrame/2 && c.gobj.ticks <= 2*intervalFrame
        })
    })
}

export function enemy4(x:number, y:number, speed:number){
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
                dy *= speed
                gobj.vel.x = dx
                gobj.vel.y = dy
                gobj["aiming"] = true
                if(gobj.ticks%intervalFrame == 0) shootNWay(c.gobj, 1, 0, 0, "Aim", 1, 0.8*speed)
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

export function enemy5(x:number, y:number){
    return new EnemyWithToughness((e)=>{
        e.image = svg["enemy_mid"]
        e.collision.r = 50
        e.pos.x = x
        e.pos.y = y
        e["aiming"] = true
        
        new DoUnderCondition(e, (c)=>{
            c.gobj.vel.x = (player.pos.x-c.gobj.pos.x)/(intervalFrame/4)
        },
        (c)=>{
            return c.gobj.ticks < intervalFrame
        })
        new DoUnderCondition(e, (c)=>{
            c.gobj["aiming"] = false
            jetshot(c.gobj)
            c.gobj.vel.x = 0
            c.gobj.vel.y = -5
        },
        (c)=>{
            return c.gobj.ticks == intervalFrame
        })
        new DoUnderCondition(e, (c)=>{
            let gobj = c.gobj
            if(gobj.ticks%10 == 0) penaltyshot_upper(gobj)
        },
        (c)=>{
            return c.gobj.pos.y > player.pos.y
        })
    })
}

export function enemy6(ax:number, ay:number,
                       tx:number, ty:number,
                       mt:number, wt:number){
    return new EnemyWithToughness((e)=>{
        e.image = svg["enemy_mid"]
        e.collision.r = 50
        e.pos.x = ax
        e.pos.y = ay
        new MoveTo(e, tx, ty, mt)
        new DoUnderCondition(e, (c)=>{
            let gobj = c.gobj
            jetshot(gobj)
            gobj.vel.x = 0
            gobj.vel.y = -5
        },
        (c)=>{
            return c.gobj.ticks == mt+wt
        })
        new DoUnderCondition(e, (c)=>{
            let gobj = c.gobj
            if(gobj.ticks%10 == 0) penaltyshot_upper(gobj)
        },
        (c)=>{
            return c.gobj.pos.y > player.pos.y
        })
        
    })
    
}

export function enemy2wide(x:number, y:number,
    vx:number, vy:number, si:number){
return new ZakoHeli((e)=>{
e.pos.x = x
e.pos.y = y
e.vel.x = vx 
e.vel.y = vy
new fw.DoUnderCondition(e, (c)=>{
shootNWay(c.gobj, 3, Math.PI/6, 0, "Aim", 1,4)
}, 
(c)=>{
return c.gobj.ticks %  si == 0
})
})
}

export function enemy7(ax:number, ay:number,
    tx:number, ty:number,
    mt:number, wt:number){
    return new EnemyWithToughness((e)=>{
        e.image = svg["enemy_mid"]
        e.collision.r = 50
        e.pos.x = ax
        e.pos.y = ay
        new MoveTo(e, tx, ty, mt)
        new DoUnderCondition(e, (c)=>{
            let px = c.gobj.pos.x
            c.gobj.pos.x -=56
            if((c.gobj.ticks/intervalFrame)%2 == 0)shootNWay(c.gobj, 9, Math.PI, 0, "Aim", 2, 5)
            c.gobj.pos.x +=112
            if((c.gobj.ticks/intervalFrame)%2 == 1)shootNWay(c.gobj, 9, Math.PI, 0, "Aim", 2, 5)
            c.gobj.pos.x = px
        },
        (c)=>{
            return c.gobj.ticks <= mt && c.gobj.ticks%intervalFrame == 0
        })
        new DoUnderCondition(e, (c)=>{
            let px = c.gobj.pos.x
            c.gobj.pos.x -=56
            if((c.gobj.ticks/(intervalFrame*2))%2 == 0){    
                shootNWay(c.gobj, 3, Math.PI/3, 
                    Math.PI/2, "Fixed", 10, 10)
            }
            c.gobj.pos.x +=112
            if((c.gobj.ticks/(intervalFrame*2))%2 == 1){
                shootNWay(c.gobj, 3, Math.PI/3, 
                    Math.PI/2, "Fixed", 10, 10)
            }
            c.gobj.pos.x = px
        },
        (c)=>{
            return c.gobj.ticks > mt && (c.gobj.ticks-mt)%(intervalFrame*2) == 0
        })
        new DoUnderCondition(e, (c)=>{
            c.gobj.vel.x = 0
            c.gobj.vel.y = -5
        },
        (c)=>{
            return c.gobj.ticks == mt+wt
        })
        new DoUnderCondition(e, (c)=>{
            let gobj = c.gobj
            if(gobj.ticks%10 == 0) penaltyshot_upper(gobj)
        },
        (c)=>{
            return c.gobj.pos.y > player.pos.y
        })

    })

}
