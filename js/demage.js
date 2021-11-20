/// <reference path='./babylon.d.ts' />
var scene;
var camera;

async function createScene() {


    async function initScene() {
      
        scene = new BABYLON.Scene(engine);
        scene.autoClear = false;
        scene.clearColor = new BABYLON.Color3.FromInts(12, 12, 12);
        scene.imageProcessingConfiguration.contrast=2.6;
        scene.imageProcessingConfiguration.exposure=0.9;
        var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 1;
        //camera = new BABYLON.ArcRotateCamera("camera", Math.PI/2, 3, 10, new BABYLON.Vector3(0.0, 0.0, 0.0), scene);
        camera = new BABYLON.ArcRotateCamera("Cam_config", -Math.PI, Math.PI / 2, 0, new BABYLON.Vector3(0, 0, 0), scene);
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
        scene.activeCamera = camera;
        scene.activeCamera.attachControl(canvas);

       
        // var Pipeline = new BABYLON.DefaultRenderingPipeline(
        //     "DefaultRenderingPipeline",
        //     true, // is HDR?
        //     scene,
        //     scene.cameras
        // );
        // Pipeline.samples = 4;
        // Pipeline.imageProcessingEnabled = true;
        // Pipeline.sharpenEnabled = true;
        // Pipeline.sharpen.edgeAmount = 0.2;
        // Pipeline.sharpen.colorAmount = 1;
        // Pipeline.fromLinearSpace=true;
        //new BABYLON.PassPostProcess("scale_pass", 4, camera, BABYLON.Texture.LINEAR_LINEAR_MIPNEAREST);
       




        var hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("img/studio.env", scene);
        hdrTexture.gammaSpace = false;
        var envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("img/studio.env", scene);



        scene.environmentTexture = hdrTexture;//只影响材质，不带skybox
        scene.environmentIntensity = 0.57;

        scene.debugLayer.show(true);


       

        scene.onBeforeRenderObservable.add(function () {
            //console.log("pos:"+camera.position)
            //console.log("tar:"+camera.target)

        });
    }
    const meshes = {};

    //加载模型
    async function loadMeshes() {
        meshes.file = await BABYLON.SceneLoader.AppendAsync("Assets/head.glb");
        console.log("overc:"+meshes.file);   
         
        //A建筑模型
        meshes.faceMesh = scene.getMeshByName("face");
        meshes.browMesh = scene.getMeshByName("brow");
        meshes.eyelashesMesh = scene.getMeshByName("eyelashes");
        meshes.eyesMesh = scene.getMeshByName("eyes");
        meshes.hairMesh = scene.getMeshByName("hair");
        meshes.tearMesh = scene.getMeshByName("tear");
        meshes.hair_inMesh = scene.getMeshByName("hair_in");
        
      
    };

    let loadTexturesAsync = async function () {
        let textures = [];
        return new Promise((resolve, reject) => {
            let textureUrls = [
                "./img/eyes_duf.jpg",
                "./img/eyes_emi.jpg",
                "./img/eyes_hei.jpg",
                "./img/eyes_rou.jpg",
                "./img/eyes_nor.jpg",

                "./img/face_cav.jpg",
                "./img/face_duf.jpg",
                "./img/face_mnor.jpg",
                "./img/face_msk.jpg",
                "./img/face_nor.jpg",
                "./img/face_rou.jpg",
                "./img/face_sca.jpg",
                "./img/face_tic.jpg",

                "./img/tear_nor.jpg",
                "./img/tear_tic.jpg",

                "./img/Hair_ao.jpg",
                "./img/Hair_dep.jpg",
                "./img/Hair_msk.jpg",
                
            ];

            for (let url of textureUrls) {
                textures.push(new BABYLON.Texture(url, scene, false, false));
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
        buildTex.eyesdufTex = retrieveTexture("eyes", "duf", textures);
        buildTex.eyesemiTex = retrieveTexture("eyes", "emi", textures);
        buildTex.eyesheiTex = retrieveTexture("eyes", "hei", textures);
        buildTex.eyesrouTex = retrieveTexture("eyes", "rou", textures);
        buildTex.eyesnorTex = retrieveTexture("eyes", "nor", textures);

        buildTex.facecavTex = retrieveTexture("face", "cav", textures);
        buildTex.facedufTex = retrieveTexture("face", "duf", textures);
        buildTex.facemnorTex = retrieveTexture("face", "mnor", textures);
        buildTex.facemskTex = retrieveTexture("face", "msk", textures);
        buildTex.facenorTex = retrieveTexture("face", "nor", textures);
        buildTex.facerouTex = retrieveTexture("face", "rou", textures);
        buildTex.facescaTex = retrieveTexture("face", "sca", textures);
        buildTex.faceticTex = retrieveTexture("face", "tic", textures);

        buildTex.tearnorTex = retrieveTexture("tear", "nor", textures);
        buildTex.tearticTex = retrieveTexture("tear", "tic", textures);
       

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
        // pbr material for face
        meshesMats.faceMat = new BABYLON.PBRMaterial("faceMat",scene);
        //PBRbase
        meshesMats.faceMat.metallic = 0.04;
        meshesMats.faceMat.roughness = 0.44;
        meshesMats.faceMat.indexOfRefraction = 1.3;
        meshesMats.faceMat.albedoTexture =  buildTex.facedufTex;
        meshesMats.faceMat.bumpTexture =  buildTex.facenorTex;
        meshesMats.faceMat.bumpTexture.level = 0.4;
        
        //subSurface
        meshesMats.faceMat.subSurface.thicknessTexture = buildTex.faceticTex;
        meshesMats.faceMat.subSurface.minimumThickness = 0.3;
        meshesMats.faceMat.subSurface.maximumThickness = 1.8;
        meshesMats.faceMat.subSurface.diffusionDistance = new BABYLON.Color3(0.973, 0.8, 0.906);
        meshesMats.faceMat.subSurface.scatteringDiffusionProfile = new BABYLON.Color3(0.98, 0.643, 0.486);
        //meshesMats.faceMat.subSurface.disableAlphaBlending = true;
                                      
        meshesMats.faceMat.subSurface.translucencyIntensity=0.4;

        
        meshesMats.faceMat.subSurface.isTranslucencyEnabled = true;
        meshesMats.faceMat.subSurface.isScatteringEnabled = true;
        scene.enableSubSurfaceForPrePass().metersPerUnit = 1.8;
        scene.prePassRenderer.samples = 8;
        //clearCoat
        meshesMats.faceMat.clearCoat.isEnabled = true;
        meshesMats.faceMat.clearCoat.intensity = 1;
        meshesMats.faceMat.clearCoat.roughness = 0.5;
        meshesMats.faceMat.clearCoat.indexOfRefraction = 1.66;
        meshesMats.faceMat.clearCoat.bumpTexture =  buildTex.facemnorTex;
        meshesMats.faceMat.clearCoat.bumpTexture.level = 0.13;

        meshesMats.faceMat.clearCoat.isTintEnabled = true;
        meshesMats.faceMat.clearCoat.tintColor = new BABYLON.Color3(1, 0.9, 0.965);
        meshesMats.faceMat.clearCoat.tintColorAtDistance = 4.7;
        meshesMats.faceMat.clearCoat.tintThickness = 1.1;
     
         //sheen
         meshesMats.faceMat.sheen.isEnabled = true;
         meshesMats.faceMat.sheen.intensity = 0.5;
         meshesMats.faceMat.sheen.color = new BABYLON.Color3(0.937, 0.196, 0.353);
         
         meshes.faceMesh.material = meshesMats.faceMat;



        /************************************************pbrMaterial for eyes*********************************************************************/
        //  meshesMats.eyesMat = new BABYLON.NodeMaterial("eyesMat",scene);
        //  await meshesMats.eyesMat.loadAsync("json/nodeMat_eyes.json");
        //  meshesMats.eyesMat.build(false);
        //  meshesMats.eyesMat.needDepthPrePass = false;//true的话苹果会出现破面
        //  meshesMats.eyesMat.backFaceCulling = true;
         
        meshesMats.eyesMat = new BABYLON.PBRMaterial("eyesMat",scene);
       
        meshesMats.eyesMat.metallic = 0.04;
        meshesMats.eyesMat.roughness = 0;
        meshesMats.eyesMat.indexOfRefraction = 2;
        meshesMats.eyesMat.albedoTexture =  buildTex.eyesdufTex;
        meshesMats.eyesMat.emissiveTexture =  buildTex.eyesemiTex;
        meshesMats.eyesMat.emissiveColor = new BABYLON.Color3(1,0.867,0.361);



         meshes.eyesMesh.material = meshesMats.eyesMat;




     /************************************************pbrMaterial for tear*********************************************************************/
         meshesMats.tearMat = new BABYLON.PBRMaterial("tearMat",scene);
         //PBRbase
         meshesMats.tearMat.metallic = 0.04;
         meshesMats.tearMat.roughness = 0.36;
         meshesMats.tearMat.indexOfRefraction = 1.34;
         meshesMats.tearMat.environmentIntensity = 0.56;
         meshesMats.tearMat.albedoColor = new BABYLON.Color3.FromHexString("#C98D82").toLinearSpace();
         meshesMats.tearMat.bumpTexture =  buildTex.tearnorTex;
         meshesMats.tearMat.bumpTexture.level = 0.4;
         
         //subSurface

         meshesMats.tearMat.subSurface.diffusionDistance = new BABYLON.Color3(1,0.537,0.537);
         meshesMats.tearMat.subSurface.scatteringDiffusionProfile = new BABYLON.Color3.FromHexString("#C16767").toLinearSpace();
         meshesMats.tearMat.subSurface.translucencyIntensity=0.9;
 
         meshesMats.tearMat.subSurface.isTranslucencyEnabled = true;
         meshesMats.tearMat.subSurface.isScatteringEnabled = false;

          meshes.tearMesh.material = meshesMats.tearMat;

     /************************************************standeraterial for fur*********************************************************************/
    //   meshesMats.furMat = new BABYLON.StandardMaterial("furMat",scene);
    //   meshesMats.furMat.diffuseColor = new BABYLON.Color3.FromHexString("#C16767").toLinearSpace();
    //   buildTex.HairmskTex.getAlphaFromRGB = true;
    //   meshesMats.furMat.opacityTexture = buildTex.HairmskTex;





    //   meshes.hair_inMesh.material = meshes.hairMesh.material = meshesMats.furMat;
      
    



    /************************************************pbrMaterial for fur*********************************************************************/

     /************************************************pbrMaterial for fur*********************************************************************/
     meshesMats.furMat = new BABYLON.NodeMaterial("furMat",scene);
     await meshesMats.furMat.loadAsync("json/nodeMat_hair.json");
     //PBRbase
        meshesMats.furMat.build(false);
        meshesMats.furMat.needDepthPrePass = false;//true的话苹果会出现破面
        meshesMats.furMat.backFaceCulling = false;
        MatParameters.fuOptTexture = meshesMats.furMat.getBlockByName("hairOtp");
        MatParameters.fuOptTexture.texture = buildTex.HairmskTex;
        meshes.hair_inMesh.material = meshes.hairMesh.material = meshesMats.furMat;
    /************************************************pbrMaterial for fur*********************************************************************/
       
    
    



        // //获取节点对象
       
         //MatParameters.faceMatTexture = meshesMats.faceMat.AlbedoTexture;
         //MatParameters.eyesDufTexture = meshesMats.eyesMat.getBlockByName("eyesDuf");
        // MatParameters.mainA_NTexture = meshesMats.mainMatA.getBlockByName("NTexture");
        // //LiaoningjianParameters.metallicFloat = meshesMats.overBuildA_qiang.getBlockByName("metallicFloat");
         //MatParameters.roughness = meshesMats.faceMat.metallic;
         //MatParameters.metallic = meshesMats.faceMat.roughness;
       
      


         

         //MatParameters.faceMatTexture.texture = buildTex.facedufTex;
         //MatParameters.eyesDufTexture.texture = buildTex.eyesdufTex;
        // MatParameters.mainA_NTexture.texture = buildTex.mainA_n;



         //MatParameters.roughness = 0.55;
         //MatParameters.metallic = 0.05;

         
    }

    

    
    initScene();
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