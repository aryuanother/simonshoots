import * as fw from "./framework/index"
import { ZakoHeli, hud, initGameObjects, player } from "./gobj"
import { loadSVG } from "./svg"
import { enemy1, enemy2, enemy3, enemy4, enemy5, enemy6, setBPM, intervalFrame } from "./enemy"
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
    fw.audio.setSprite("wav/sprite.json")
    fw.audio.setBPM(75)
    setBPM(75)
    fw.setTitle("Simon Shoots...")
    tutorialOn = document.cookie.match(/tutorialDone/g) == null
}

function* stageScript(){
    hud.move()
    for(let i = 0; i < intervalFrame*2; i++) yield;
    if(tutorialOn){
        new fw.Text("ドラッグ・↑↓←→で自機の移動\n\n自機停止時ショット発射", intervalFrame*4).pos = {x:fw.width/2,y:fw.height/2}
        for(let i = 0; i < intervalFrame*8; i++) yield;
    }

    hud.toggle();{
        if(tutorialOn){
            let text = "Stayモード\n敵機の行動パターンを予見"
            if(hud.pos.y < fw.height/2) text = "↑\n"+text
            else text = text+"\n↓"
            new fw.Text(text, intervalFrame*4).pos = {x:fw.width/2,y:hud.pos.y < fw.height/2?fw.height/4:3*fw.height/4}
            for(let i = 0; i < intervalFrame*4; i++) yield;
        }
        enemy1(-25,0,fw.width/3,fw.height/4,0,-10,intervalFrame,intervalFrame*2)
        for(let i = 0; i < intervalFrame; i++) yield;
        enemy1(fw.width+25,0,2*fw.width/3,fw.height/4,0,-10,intervalFrame,intervalFrame)
        for(let i = 0; i < intervalFrame*3; i++) yield;
    }
    hud.sweep_bonus = 1000;
    hud.toggle();{
        if(tutorialOn){
            let text = "Moveモード\n予見した行動パターンを回避・迎撃"
            if(hud.pos.y < fw.height/2) text = "↑\n"+text
            else text = text+"\n↓"
            new fw.Text(text, intervalFrame*4).pos = {x:fw.width/2,y:hud.pos.y < fw.height/2?fw.height/4:3*fw.height/4}
            for(let i = 0; i < intervalFrame*4; i++) yield;
        }
        enemy1(-25,0,fw.width/3,fw.height/4,0,-10,intervalFrame,intervalFrame*2)
        for(let i = 0; i < intervalFrame; i++) yield;
        enemy1(fw.width+25,0,2*fw.width/3,fw.height/4,0,-10,intervalFrame,intervalFrame)
        for(let i = 0; i < intervalFrame*3; i++) yield;
    }

    if(tutorialOn){
        new fw.Text("赤弾：自機　依存の攻撃\n青弾：自機非依存の攻撃", intervalFrame*4).pos = {x:fw.width/2,y:fw.height/2}
        for(let i = 0; i < intervalFrame*4; i++) yield;
    }
    hud.toggle();{
        enemy2(3*fw.width/8,-30,0,5,30)
        enemy2(4*fw.width/8,-30,0,5,30)
        enemy2(5*fw.width/8,-30,0,5,30)
        for(let i = 0; i < intervalFrame*4; i++) yield;
    }
    hud.sweep_bonus = 1000;
    hud.toggle();{
        enemy2(3*fw.width/8,-30,0,5,30)
        enemy2(4*fw.width/8,-30,0,5,30)
        enemy2(5*fw.width/8,-30,0,5,30)
        for(let i = 0; i < intervalFrame*4; i++) yield;
    }

    hud.toggle();{
        enemy3(3*fw.width/10, fw.height/4)
        for(let i = 0; i < intervalFrame; i++) yield;
        enemy3(2*fw.width/10, fw.height/5)
        for(let i = 0; i < intervalFrame*3; i++) yield;
        enemy3(7*fw.width/10, fw.height/4)
        for(let i = 0; i < intervalFrame; i++) yield;
        enemy3(8*fw.width/10, fw.height/5)
        for(let i = 0; i < intervalFrame*3; i++) yield;
    }
    hud.sweep_bonus = 2000;
    hud.toggle();{
        enemy3(3*fw.width/10, fw.height/4)
        for(let i = 0; i < intervalFrame; i++) yield;
        enemy3(2*fw.width/10, fw.height/5)
        for(let i = 0; i < intervalFrame*3; i++) yield;
        enemy3(7*fw.width/10, fw.height/4)
        for(let i = 0; i < intervalFrame; i++) yield;
        enemy3(8*fw.width/10, fw.height/5)
        for(let i = 0; i < intervalFrame*3; i++) yield;
    }
    
    if(tutorialOn){
        new fw.Text("自機誘導する敵機は矢印マーク有り", intervalFrame*4).pos = {x:fw.width/2,y:fw.height/2}
        for(let i = 0; i < intervalFrame*4; i++) yield;
    }
    hud.toggle();{
        for(let i = 1; i <= 8; i++) {
            enemy4(i*(fw.width+100)/9-50, -45,5)
            for(let j = 0; j < intervalFrame/4; j++) yield;
        }
        for(let i = 0; i < intervalFrame*2; i++) yield;
    }    
    hud.sweep_bonus = 2000;
    hud.toggle();{
        for(let i = 1; i <= 8; i++) {
            enemy4(i*(fw.width+100)/9-50, -45,5)
            for(let j = 0; j < intervalFrame/4; j++) yield;
        }
        for(let i = 0; i < intervalFrame*2; i++) yield;
    }

    hud.toggle();{
        for(let i = 8; i >= 1; i--) {
            new ZakoHeli((e)=>{
                e.pos.x = i*fw.width/9
                e.pos.y = -45
                e.vel.x = 0
                e.vel.y = 5
            })
            for(let j = 0; j < intervalFrame/4; j++) yield;
        }
        for(let i = 0; i < intervalFrame*2; i++) yield;
    }
    hud.sweep_bonus = 4000;
    hud.toggle();{
        for(let i = 8; i >= 1; i--) {
            new ZakoHeli((e)=>{
                e.pos.x = i*fw.width/9
                e.pos.y = -45
                e.vel.x = 0
                e.vel.y = 5
            })
            for(let j = 0; j < intervalFrame/4; j++) yield;
        }
        for(let i = 0; i < intervalFrame*2; i++) yield;
    }
    
    hud.toggle();{
        enemy5(-90, fw.height/3).toughness = intervalFrame
        for(let i = 0; i < intervalFrame*2; i++) yield;
        enemy5(fw.width+90, fw.height/2).toughness = intervalFrame
        for(let i = 0; i < intervalFrame*2; i++) yield;
    }
    hud.sweep_bonus = 4000;
    hud.toggle();{
        enemy5(-90, fw.height/3).toughness = intervalFrame
        for(let i = 0; i < intervalFrame*2; i++) yield;
        enemy5(fw.width+90, fw.height/2).toughness = intervalFrame
        for(let i = 0; i < intervalFrame*2; i++) yield;
    }

    hud.toggle();{
        enemy6(-90,3*fw.height/4,fw.width/4,fw.height/2,intervalFrame,intervalFrame*5).toughness = intervalFrame*2
        for(let i = 0; i < intervalFrame; i++) yield;
        enemy6(fw.width/2,-55,fw.width/2,fw.height/4,intervalFrame,intervalFrame*4).toughness = intervalFrame*2
        for(let i = 0; i < intervalFrame; i++) yield;
        enemy6(fw.width+90,3*fw.height/4,3*fw.width/4,fw.height/2,intervalFrame,intervalFrame*3).toughness = intervalFrame*2
        for(let i = 0; i < intervalFrame*6; i++) yield;
    }
    hud.sweep_bonus = 4000;
    hud.toggle();{
        enemy6(-90,3*fw.height/4,fw.width/4,fw.height/2,intervalFrame,intervalFrame*5).toughness = intervalFrame*2
        for(let i = 0; i < intervalFrame; i++) yield;
        enemy6(fw.width/2,-55,fw.width/2,fw.height/4,intervalFrame,intervalFrame*4).toughness = intervalFrame*2
        for(let i = 0; i < intervalFrame; i++) yield;
        enemy6(fw.width+90,3*fw.height/4,3*fw.width/4,fw.height/2,intervalFrame,intervalFrame*3).toughness = intervalFrame*2
        for(let i = 0; i < intervalFrame*6; i++) yield;
    }
    hud.toggle();
    if(tutorialOn){
        let text = "盾がない状態で被弾すると\nGame Over"
        if(hud.pos.y < fw.height/2) text = "↑\n"+text
        else text = text+"\n↓"
        new fw.Text(text, intervalFrame*4).pos = {x:fw.width/2,y:hud.pos.y < fw.height/2?fw.height/4:3*fw.height/4}
        for(let i = 0; i < intervalFrame*4; i++) yield;
        player.count_shield = 3
        document.cookie = "tutorialDone=1;expires="+new Date(new Date().setDate(new Date().getDate()+1)).toUTCString()
        tutorialOn = false
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