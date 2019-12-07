import * as fw from "./framework/util"

export let svg: { [x: string]: HTMLCanvasElement; } = {}
export function loadSVG(filename:string, alias:string, width:number, height:number){
    svg[alias] = fw.loadImageAsync(filename,width,height)
    return svg[alias]
}