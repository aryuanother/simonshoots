import * as fw from "./framework/index"
import { ZakoHeli, hud, initGameObjects } from "./gobj"
import { loadSVG } from "./svg"
import { enemy1, enemy2, enemy3, enemy4, enemy5, enemy6 } from "./enemy"
let tutorialOn:boolean
function init(){
    loadSVG("svg/player.svg","player",60,60)
    loadSVG("svg/missile.svg","shot",20,20)
    loadSVG("svg/bullet_aim.svg","bullet_aim",30,30)
    loadSVG("svg/bullet_noaim.svg","bullet",30,30)
    loadSVG("svg/bullet_noaim.svg","hud",120,120)
    loadSVG("svg/enemy_mid.svg","enemy_mid",180,110)
    loadSVG("svg/enemy_heli.svg","enemy_heli",50,95)
    loadSVG("svg/propeller.svg","heli_prop",80,80)
    loadSVG("svg/explosion.svg","exp",500,500)
    loadSVG("svg/muzzle.svg","muz",500,500)
    loadSVG("svg/aimmark.svg","aim",500,500)
    loadSVG("svg/shield.svg","shield",30,30)
    loadSVG("svg/stay.svg","stay",80,30)
    loadSVG("svg/move.svg","move",92,30)
    fw.context.fillStyle = "#07071f"
    fw.setTitle("Simon Shoots...")
    tutorialOn = true
}

function* stageScript(){
    hud.move()
    for(let i = 0; i < 120; i++) yield;
    if(tutorialOn){
        new fw.Text("ドラッグ・↑↓←→で自機の移動\n\n自機停止時ショット発射", 240).pos = {x:fw.width/2,y:fw.height/2}
        for(let i = 0; i < 240; i++) yield;
        for(let i = 0; i < 240; i++) yield;
    }

    hud.toggle();{
        if(tutorialOn){
            new fw.Text("↑\nStayモード\n敵機の行動パターンを予見", 240).pos = {x:fw.width/2,y:fw.height/4}
            for(let i = 0; i < 240; i++) yield;
        }
        enemy1(-25,0,fw.width/3,fw.height/4,0,-10,30,60)
        for(let i = 0; i < 60; i++) yield;
        enemy1(fw.width+25,0,2*fw.width/3,fw.height/4,0,-10,30,0)
        for(let i = 0; i < 60; i++) yield;
    }
    hud.sweep_bonus = 1000;
    hud.toggle();{
        if(tutorialOn){
                new fw.Text("↑\nMoveモード\n予見した行動パターンを回避・迎撃", 240).pos = {x:fw.width/2,y:fw.height/4}
                for(let i = 0; i < 240; i++) yield;
        }
        enemy1(-25,0,fw.width/3,fw.height/4,0,-10,30,60)
        for(let i = 0; i < 60; i++) yield;
        enemy1(fw.width+25,0,2*fw.width/3,fw.height/4,0,-10,30,0)
        for(let i = 0; i < 60; i++) yield;
    }

    if(tutorialOn){
        new fw.Text("赤弾：自機依存の攻撃\n青弾：自機 非 依存攻撃", 240).pos = {x:fw.width/2,y:fw.height/2}
        for(let i = 0; i < 240; i++) yield;
    }
    hud.toggle();{
        enemy2(3*fw.width/8,-45,0,5,30)
        enemy2(4*fw.width/8,-45,0,5,30)
        enemy2(5*fw.width/8,-45,0,5,30)
        for(let i = 0; i < 120; i++) yield;
    }
    hud.sweep_bonus = 1500;
    hud.toggle();{
        enemy2(3*fw.width/8,-45,0,5,30)
        enemy2(4*fw.width/8,-45,0,5,30)
        enemy2(5*fw.width/8,-45,0,5,30)
        for(let i = 0; i < 120; i++) yield;
    }

    hud.toggle();{
        enemy3(2*fw.width/10, fw.height/5)
        for(let i = 0; i < 60; i++) yield;
        enemy3(8*fw.width/10, fw.height/5)
        for(let i = 0; i < 180; i++) yield;
    }
    hud.sweep_bonus = 2000;
    hud.toggle();{
        enemy3(2*fw.width/10, fw.height/5)
        for(let i = 0; i < 60; i++) yield;
        enemy3(8*fw.width/10, fw.height/5)
        for(let i = 0; i < 180; i++) yield;
    }
    
    if(tutorialOn){
        new fw.Text("矢印付き敵機は自機依存の行動を取る", 240).pos = {x:fw.width/2,y:fw.height/2}
        for(let i = 0; i < 240; i++) yield;
    }
    hud.toggle();{
        for(let i = 1; i <= 6; i++) {
            enemy4(i*(fw.width+100)/7-50, -45,5)
            yield;yield;yield;yield;
        }
        for(let i = 0; i < 120; i++) yield;
    }    
    hud.sweep_bonus = 1000;
    hud.toggle();{
        for(let i = 1; i <= 6; i++) {
            enemy4(i*(fw.width+100)/7-50, -45,5)
            yield;yield;yield;yield;
        }
        for(let i = 0; i < 120; i++) yield;
    }

    hud.toggle();{
        for(let i = 6; i >= 1; i--) {
            new ZakoHeli((e)=>{
                e.pos.x = i*fw.width/7
                e.pos.y = -45
                e.vel.x = 0
                e.vel.y = 5
            })
            yield;yield;yield;yield;
        }
        for(let i = 0; i < 120; i++) yield;
    }
    hud.sweep_bonus = 4000;
    hud.toggle();{
        for(let i = 6; i >= 1; i--) {
            new ZakoHeli((e)=>{
                e.pos.x = i*fw.width/7
                e.pos.y = -45
                e.vel.x = 0
                e.vel.y = 5
            })
            yield;yield;yield;yield;
        }
        for(let i = 0; i < 120; i++) yield;
    }
    
    hud.toggle();{
        enemy5(-90, fw.height/3).toughness = 90
        for(let i = 0; i < 180; i++) yield;
        enemy5(fw.width+90, fw.height/2).toughness = 90
        for(let i = 0; i < 300; i++) yield;
    }
    hud.sweep_bonus = 2000;
    hud.toggle();{
        enemy5(-90, fw.height/3).toughness = 90
        for(let i = 0; i < 180; i++) yield;
        enemy5(fw.width+90, fw.height/2).toughness = 90
        for(let i = 0; i < 300; i++) yield;
    }

    hud.toggle();{
        enemy6(-90,3*fw.height/4,fw.width/4,fw.height/2,60,360).toughness = 90
        for(let i = 0; i < 60; i++) yield;
        enemy6(fw.width/2,-55,fw.width/2,fw.height/4,60,300).toughness = 90
        for(let i = 0; i < 60; i++) yield;
        enemy6(fw.width+90,3*fw.height/4,3*fw.width/4,fw.height/2,60,240).toughness = 90
        for(let i = 0; i < 420; i++) yield;
    }
    hud.sweep_bonus = 4000;
    hud.toggle();{
        enemy6(-90,3*fw.height/4,fw.width/4,fw.height/2,60,360).toughness = 90
        for(let i = 0; i < 60; i++) yield;
        enemy6(fw.width/2,-55,fw.width/2,fw.height/4,60,300).toughness = 90
        for(let i = 0; i < 60; i++) yield;
        enemy6(fw.width+90,3*fw.height/4,3*fw.width/4,fw.height/2,60,240).toughness = 90
        for(let i = 0; i < 420; i++) yield;
    }
    hud.toggle();
    if(tutorialOn){
        new fw.Text("↑\n盾がない状態で被弾すると\nGame Over", 240).pos = {x:fw.width/2,y:fw.height/4}
        for(let i = 0; i < 240; i++) yield;
    }
    for(let i = 0; i < 300; i++) yield;
    hud.toggle();
    fw.endGame()
}
let ss: Generator<any, void, unknown>
function start(){
    initGameObjects()
    ss = stageScript()
}
function update(){
    !!ss && ss.next()
}
fw.run(init, start, update)