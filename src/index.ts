import {
    ViewerApp,
    AssetManagerPlugin,
    addBasePlugins,
    ITexture, TweakpaneUiPlugin, AssetManagerBasicPopupPlugin, CanvasSnipperPlugin,

    IViewerPlugin,
    MeshBasicMaterial2,
    Color,

    // Color, // Import THREE.js internals
    // Texture, // Import THREE.js internals
} from "webgi";
import "./styles.css";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger)

async function setupViewer(){

    // Initialize the viewer
    const viewer = new ViewerApp({
        canvas: document.getElementById('webgi-canvas') as HTMLCanvasElement,
        useRgbm:false,
    })

    // Add some plugins
    const manager = await viewer.addPlugin(AssetManagerPlugin)

    const camera = viewer.scene.activeCamera
    const position = camera.position
    const target = camera.target
    const exitButton = document.querySelector('.exit-btn') as HTMLElement
    const customizerInterface = document.querySelector('.customizer--container') as HTMLElement

    

    // Add a popup(in HTML) with download progress when any asset is downloading.
    await viewer.addPlugin(AssetManagerBasicPopupPlugin)



    // or use this to add all main ones at once.
    await addBasePlugins(viewer)

    // Add more plugins not available in base, like CanvasSnipperPlugin which has helpers to download an image of the canvas.
    await viewer.addPlugin(CanvasSnipperPlugin)

    // This must be called once after all plugins are added.
    viewer.renderer.refreshPipeline()

    await manager.addFromPath("./assets/bmw4.glb")
    viewer.scene.activeCamera.setCameraOptions({controlsEnabled:false})
    const carPaint = manager.materials!.findMaterialsByName('vm_T3_001_carpaint') [0] as MeshBasicMaterial2
    
    // Load an environment map if not set in the glb file
    // await viewer.scene.setEnvironment(
    //     await manager.importer!.importSinglePath<ITexture>(
    //         "./assets/environment.hdr"
    //     )
    // );
    function setupScrollAnimation(){
        const tl = gsap.timeline();

        //First Section

        tl
        .to(position, {
                x: "0.017",
                y:"0.75",
                z:"5.67",   
                
            scrollTrigger:{
                trigger: ".second",
                start:"top bottom",
                end:"top top",
                scrub:true, 
                immediateRender:false,
            },onUpdate
        })
        .to(target, {
            x: "-0.14",
            y:"-0.08",
            z:"-0.20",    
            scrollTrigger:{
            trigger: ".second",
            start:"top bottom",
            end:"top top",
            scrub:true, 
            immediateRender:false,
        },onUpdate
    })
    .to(".first", {
        opacity:0, xPercent:"-100",
        scrollTrigger:{
        trigger: ".second",
        start:"top bottom",
        end:"top top",
        scrub:true, 
        immediateRender:false,
    },onUpdate
})
.to(".roadbg", {

    opacity:0.8,
    scrollTrigger:{
    trigger: ".second",
    start:"80% bottom",
    end:"top top",
    scrub:true, 
    immediateRender:false,
},onUpdate
})


    
    }
    setupScrollAnimation()

    //Webgi update
    let needsUpdate = true

    function onUpdate(){
        needsUpdate = true
        viewer.renderer.resetShadows()
    }

    viewer.addEventListener('preFrame', ()=>{
        if(needsUpdate){
            camera.positionUpdated(false)
            camera.targetUpdated(true)
            needsUpdate =false
        }
    })

    //customize
    const sections = document.querySelector('.main') as HTMLElement
    const mainContainer = document.getElementById('webgi-canvas-container') as HTMLElement
    document.querySelector('.customize-btn')?.addEventListener("click", ()=>{
          viewer.scene.activeCamera.setCameraOptions({controlsEnabled:true})
        sections.style.visibility ="hidden"
        mainContainer.style.pointerEvents ="all"
       document.body.style.cursor="grab"

       gsap.to(position, {
        x: "-6.34",
        y:"2.10",
        z:"4.5",
        duration:2,
        ease: "power3.inOut",
        onUpdate,
        })
        gsap.to(target, {
            x: "0.04",
            y:"-0.05",
            z:"0.12",
            duration:2,
            ease: "power3.inOut",
            onUpdate,
            onComplete:enableControllers,
            })
    });

    function enableControllers(){
        exitButton.style.visibility = "visible"
        customizerInterface.style.visibility = "visible"
        viewer.scene.activeCamera.setCameraOptions({controlsEnabled:true})
    }





  
    exitButton.addEventListener("click", ()=>{

        gsap.to(position, {
            x: "0.017",
            y:"0.75",
            z:"5.67",
            duration:2,
            ease: "power3.inOut",
            onUpdate,
            })
            gsap.to(target, {
                x: "-0.14",
                y:"-0.08",
                z:"-0.20",
                duration:2,
                ease: "power3.inOut",
                onUpdate,
                     })

        viewer.scene.activeCamera.setCameraOptions({controlsEnabled:false})
        sections.style.visibility ="visible"
        mainContainer.style.pointerEvents ="none"
       document.body.style.cursor="default"
       exitButton.style.visibility = "hidden"
       customizerInterface.style.visibility = "hidden"
    })

    document.querySelector('.button--colors.black')?.addEventListener('click', ()=>{
        changeColor(new Color(0x000000).convertSRGBToLinear())
        
    })

    document.querySelector('.button--colors.yellow')?.addEventListener('click', ()=>{
        changeColor(new Color(0xfecb00).convertSRGBToLinear())
        
    })

    document.querySelector('.button--colors.white')?.addEventListener('click', ()=>{
        changeColor(new Color(0xefefef).convertSRGBToLinear())
        
    })

    function changeColor(_colorToBeChanged: Color){
        carPaint.color =  _colorToBeChanged;
        viewer.scene.setDirty()
    }

}

setupViewer()
