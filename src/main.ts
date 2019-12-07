import * as fw from "./framework/index"
import { GameObject, DoUnderCondition, MoveTo, Player } from "./framework/index"
import _ = require("lodash")
import { ZakoHeli, player, initPlayer } from "./gobj"
import { loadSVG } from "./svg"
import { enemy1, enemy2, enemy3, enemy4, enemy5, enemy6 } from "./enemy"

function init(){
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
    
    enemy1(-25,0,fw.width/3,fw.height/4,0,-10,30,60)
    for(let i = 0; i < 60; i++) yield;
    enemy1(fw.width+25,0,2*fw.width/3,fw.height/4,0,-10,30,0)
    for(let i = 0; i < 60; i++) yield;
    
    enemy2(4*fw.width/10,-45,0,5,30)
    enemy2(5*fw.width/10,-45,0,5,30)
    enemy2(6*fw.width/10,-45,0,5,30)
    for(let i = 0; i < 120; i++) yield;
    enemy3(2*fw.width/10, fw.height/5)
    for(let i = 0; i < 60; i++) yield;
    enemy3(8*fw.width/10, fw.height/5)
    for(let i = 0; i < 120; i++) yield;

    for(let i = 1; i <= 6; i++) {
        enemy4(i*(fw.width+100)/7-50, -45,5)
        yield;yield;yield;yield;
    }
    for(let i = 0; i < 120; i++) yield;
    for(let i = 6; i >= 1; i--) {
        new ZakoHeli((e)=>{
            e.pos.x = i*fw.width/7
            e.pos.y = -45
            e.vel.x = 0
            e.vel.y = 5
        })
        yield;yield;yield;yield;
    }
    
    for(let i = 0; i < 60; i++) yield;
    enemy5(-90, fw.height/3)
    for(let i = 0; i < 180; i++) yield;
    enemy5(fw.width+90, fw.height/2)
    for(let i = 0; i < 180; i++) yield;
    enemy6(-90,3*fw.height/4,fw.width/4,fw.height/3,60,360)
    for(let i = 0; i < 60; i++) yield;
    enemy6(fw.width/2,-55,fw.width/2,fw.height/4,60,300)
    for(let i = 0; i < 60; i++) yield;
    enemy6(fw.width+90,3*fw.height/4,3*fw.width/4,fw.height/2,60,240)
    for(let i = 0; i < 600; i++) yield;
    fw.endGame()
}
let ss: Generator<any, void, unknown>
function start(){
    initPlayer()
    ss = stageScript()
}
function update(){
    !!ss && ss.next()
}
fw.run(init, start, update)