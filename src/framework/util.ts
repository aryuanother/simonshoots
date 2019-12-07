export function getClassName(obj:Object){
    return ('' + obj.constructor).replace(/^\s*function\s*([^\(]*)[\S\s]+$/im, '$1')
}

export function loadImageAsync(path:string, width:number | null = null, height:number | null = null){
    let canvas = document.createElement("canvas")
    let DOMURL = window.URL|| window.webkitURL, url:string
    
    canvas.width = width || 0
    canvas.height = height || 0;
    // canvasだけとりあえず返す（ロードされてないうちはただの四角）
    (async ()=>{
        await fetch(path).then(response =>response.blob())
        .then(svg=>{
        let img = new Image()
        url = DOMURL.createObjectURL(svg)
        return new Promise<HTMLImageElement>((resolve,reject)=>{
            img.onload = ()=>resolve(img)
            img.onerror = e=>reject(e)
            img.src = url
        })
        }).then(img=>{
            canvas.width = width || img.width
            canvas.height = height || img.height
            let ctx = canvas.getContext("2d")
            if(ctx == null) return
            ctx.clearRect(0,0,canvas.width,canvas.height)
            ctx.drawImage(img,0,0,canvas.width,canvas.height)
            DOMURL.revokeObjectURL(url)
        })
    })()
    return canvas
}

export function isIn(v: number, low: number, high: number) {
    return v >= low && v <= high;
  }
export function clamp(v:number, low:number, high:number){
    return Math.max(low, Math.min(high, v))
}