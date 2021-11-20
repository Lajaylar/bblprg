/// <reference path='./babylon.d.ts' />
var scene2;
var camera;

async function create_furScene() {


    async function initscene() {
      
        scene2 = new BABYLON.Scene(engine);
        scene2.autoClear = false;
        scene2.clearColor = new BABYLON.Color3.FromInts(12, 12, 12);
        scene2.imageProcessingConfiguration.contrast=2.6;
        scene2.imageProcessingConfiguration.exposure=0.9;
        var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene2);
        light.intensity = 1;
        //camera = new BABYLON.ArcRotateCamera("camera", Math.PI/2, 3, 10, new BABYLON.Vector3(0.0, 0.0, 0.0), scene2);
        camera = new BABYLON.ArcRotateCamera("Cam_config", -Math.PI, Math.PI / 2, 0, new BABYLON.Vector3(0, 0, 0), scene2);
        camera.setTarget(new BABYLON.Vector3(0, 1.32, 0))
        camera.alpha=13.9265;
        camera.beta=1.5630;
        camera.radius=3;
        //camera.setPosition(new BABYLON.Vector3(33.9, 7.84, -64.5))
        //camera.fov = 0.5;
       


        camera.upperRadiusLimit = 0.5;
        camera.lowerRadiusLimit = 0.1;
        camera.wheelPrecision = 200;
        camera.pinchPrecision = 500;

        camera.allowUpsideDown = true;
        camera.minZ = 0.01;
        scene2.activeCamera = camera;
        scene2.activeCamera.attachControl(canvas);

       
        // var Pipeline = new BABYLON.DefaultRenderingPipeline(
        //     "DefaultRenderingPipeline",
        //     true, // is HDR?
        //     scene2,
        //     scene2.cameras
        // );
        // Pipeline.samples = 4;
        // Pipeline.imageProcessingEnabled = true;
        // Pipeline.sharpenEnabled = true;
        // Pipeline.sharpen.edgeAmount = 0.2;
        // Pipeline.sharpen.colorAmount = 1;
        // Pipeline.fromLinearSpace=true;
        //new BABYLON.PassPostProcess("scale_pass", 4, camera, BABYLON.Texture.LINEAR_LINEAR_MIPNEAREST);
       




        var hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("img/studio.env", scene2);
        hdrTexture.gammaSpace = false;
        var envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("img/studio.env", scene2);



        scene2.environmentTexture = hdrTexture;//只影响材质，不带skybox
        scene2.environmentIntensity = 0.57;

        scene2.debugLayer.show(true);


       

        scene2.onBeforeRenderObservable.add(function () {
            //console.log("pos:"+camera.position)
            //console.log("tar:"+camera.target)

        });
    }
    const meshes = {};

    //加载模型
    async function loadMeshes() {
        meshes.file = await BABYLON.SceneLoader.AppendAsync("Assets/hair.glb");
        //console.log("overc:"+meshes.file);   
         
      
      
        meshes.hairMesh = scene2.getMeshByName("hair");
      
        meshes.hair_inMesh = scene2.getMeshByName("hair_in");
        
      
    };

    let loadTexturesAsync = async function () {
        let textures = [];
        return new Promise((resolve, reject) => {
            let textureUrls = [
   

                "./img/Hair_ao.jpg",
                "./img/Hair_dep.jpg",
                "./img/Hair_msk.jpg",
                
            ];

            for (let url of textureUrls) {
                textures.push(new BABYLON.Texture(url, scene2, false, false));
            }
            console.log(textures);
            whenAllReady(textures, () => resolve(textures));
        }).then(() => {
            assignTextures(textures);
        });
    };

    let whenAllReady = function (textures, resolve) {
        let numRemaining = textures.length;
        if (numRemaining == 0) {
            resolve();
            return;
        }

        for (let i = 0; i < textures.length; i++) {
            let texture = textures[i];
            if (texture.isReady()) {
                if (--numRemaining === 0) {
                    resolve();
                    return;
                }
            }
            else {
                let onLoadObservable = texture.onLoadObservable;
                if (onLoadObservable) {
                    onLoadObservable.addOnce(() => {
                        if (--numRemaining === 0) {
                            resolve();
                        }
                    });
                }
            }
        }
    };


    let retrieveTexture = function (meshMat, channel, textures) {

        let texture;
        for (let file of textures) {
            let segment = file.name.split("/");

            if (segment[segment.length - 1].split("_")[0] === meshMat) {

                if (segment[segment.length - 1].split("_")[1] === channel + ".jpg") {

                    texture = file;
                    return texture;
                }
            }
        }
    };

   
    const buildTex = {};
    function assignTextures(textures) {
       

        buildTex.HairaoTex = retrieveTexture("Hair", "ao", textures);
        buildTex.HairdepTex = retrieveTexture("Hair", "dep", textures);
        buildTex.HairmskTex = retrieveTexture("Hair", "msk", textures);


      
 
    }

    BABYLON.NodeMaterial.IgnoreTexturesAtLoadTime = true;

    const meshesMats = {};
    // const buildParameters = {};
    // const buildParametersb = {};
    async function createMaterials() {
       
        const MatParameters = {};
       meshesMats.furMat = new BABYLON.PBRMaterial("furMat",scene2);
     //PBRbase
   
        
        meshesMats.furMat.metallic = 0.47;
        meshesMats.furMat.roughness = 0.8;
        meshesMats.furMat.indexOfRefraction = 1.24;
        meshesMats.furMat.albedoColor = new BABYLON.Color3.FromHexString("#532820").toLinearSpace();
        meshesMats.furMat.emissiveTexture =  buildTex.HairaoTex;
        meshesMats.furMat.emissiveColor = new BABYLON.Color3.FromHexString("#563330").toLinearSpace();
        buildTex.HairmskTex.getAlphaFromRGB = true;
        buildTex.HairdepTex.getAlphaFromRGB = true;
        meshesMats.furMat.opacityTexture = buildTex.HairmskTex;
      
        meshesMats.furMat.backFaceCulling=false;


        // //buildTex.HairaoTex; 
        // //buildTex.HairdepTex;
       
         meshes.hair_inMesh.material = meshes.hairMesh.material = meshesMats.furMat;

       
    }

    

    
    initscene();
    await loadMeshes();
    await loadTexturesAsync();
    await createMaterials();
    //await createMarble()





    engine.runRenderLoop(function () {
        scene.render();
       
    });


    // Resize
    window.addEventListener("resize", function () {
        engine.resize();
    });
}