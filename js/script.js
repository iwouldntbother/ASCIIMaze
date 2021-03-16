
    console.log(" _ _ _ _ _ _ _____ _____ _ _ _ ____\n| | | | | | |   __|_   _| | | |    \\\n| | | | | | |__   | | | | | | |  |  |\n|_____|_____|_____| |_| |_____|____/")
                
    console.log("███╗   ███╗██╗███╗   ██╗██████╗ ███╗   ███╗ █████╗ ██████╗ \n████╗ ████║██║████╗  ██║██╔══██╗████╗ ████║██╔══██╗██╔══██╗\n██╔████╔██║██║██╔██╗ ██║██║  ██║██╔████╔██║███████║██████╔╝\n██║╚██╔╝██║██║██║╚██╗██║██║  ██║██║╚██╔╝██║██╔══██║██╔═══╝ \n██║ ╚═╝ ██║██║██║ ╚████║██████╔╝██║ ╚═╝ ██║██║  ██║██║     \n╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝     ")

    var version = "© 2021, WWSTWD Studio. All rights reserved";
    var fpsText;
    var isLocked = false;
    var canvas = document.getElementById("mainCanvas")
    var engine = new BABYLON.Engine(canvas, false, {doNotHandleContextLos: true});
    var camera;
    engine.enableOfflineSupport = false;


    // Mesh Loading Variables //

    var readyToPlay = false;
    var readyToRender = false;


    if (screen.width <= 699) {
        document.getElementById("mobileSupport").style.display = "flex";
        setTimeout(function(){window.stop(); engine.dispose();}, 500)
    }


    initialised = true;
    init()
    setTimeout(function(){readyToRender = true;},1000)

    var pieces = [];
    var pieceData;

    var scene;

    var pickable = [];
    var pickedUp;
    var pickedUpCameraDiff = new BABYLON.Vector3();

    var whiteMat = new BABYLON.StandardMaterial("whiteMat", scene)
    whiteMat.emissiveColor = new BABYLON.Color3.White();

    var redMat = new BABYLON.StandardMaterial("redMat", scene)
    redMat.emissiveColor = new BABYLON.Color3.Red();

    var blackMat = new BABYLON.StandardMaterial("blackMat", scene)
    blackMat.emissiveColor = new BABYLON.Color3.Black();

    var brickMat = new BABYLON.StandardMaterial("BrickMat", scene)
    brickMat.emissiveTexture = new BABYLON.Texture("images/BrickTexWhite.png")
    brickMat.emissiveTexture.uScale = 0.5;

    function init(){

    console.log("Started loading")
    scene = new BABYLON.Scene(engine);

    var options = new BABYLON.SceneOptimizerOptions(30, 2000);

    options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 1));
    options.addOptimization(new BABYLON.TextureOptimization(0, 1024));
    options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 1.5));
    options.addOptimization(new BABYLON.TextureOptimization(0, 512));
    options.addOptimization(new BABYLON.TextureOptimization(0, 256));

    var optimizer = new BABYLON.SceneOptimizer(scene, options);

    camera = new BABYLON.UniversalCamera("FreeCamera", new BABYLON.Vector3(0,12,0), scene);
    camera.speed = 4;
    camera.inertia = 0.7;
    camera.setTarget(new BABYLON.Vector3(0,6,0));
    camera.keysUp.push(87);
    camera.keysDown.push(83);
    camera.keysLeft.push(65);
    camera.keysRight.push(68);
    camera._needMoveForGravity = true;
    camera.minZ = 0.01;
    
    var postProcess = new BABYLON.AsciiArtPostProcess("AsciiArt", camera, {
        font: "0.75vw Monospace",
        characterSet: " -+@/'#"
    });

    scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    scene.shadowsEnabled = true;
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(0.5,6,0.5);
    scene.collisionsEnabled = true;
    camera.checkCollisions = true;
    camera.rotationQuaternion = new BABYLON.Quaternion();

    invisMat = new BABYLON.StandardMaterial("invisMat", scene);
    invisMat.alpha = 0;

    var left2load = setInterval(function(){
        document.getElementById("loadingText").innerHTML = "Items left " + scene.getWaitingItemsCount()
        if(scene.getWaitingItemsCount() === 0){
            clearInterval(left2load)
        }
    },500)




    scene.onPointerDown = function(evt){
        if(!isLocked){
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock || false;
            if(canvas.requestPointerLock){
                canvas.requestPointerLock();
                camera.attachControl(canvas);
                readyToPlay = true
            }
        }
    };

    pointerlockchange = function () {
        var controlEnabled = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement || false;
        
        if (!controlEnabled) {
            camera.detachControl(canvas);

            
            loadPauseMenu();
            

            setTimeout(function(){isLocked = false;},200);
            document.getElementById("menu").style.display = "";
            document.getElementById("helpText").innerHTML = "Click anywhere to close";
        } else {
            camera.attachControl(canvas);
            setTimeout(function(){isLocked = true;},200);
            document.getElementById("menu").style.display = "none";
            document.getElementById("helpText").innerHTML = "Press ESC to bring up the map";
        }
    };

    document.addEventListener("pointerlockchange", pointerlockchange, false);
    document.addEventListener("mspointerlockchange", pointerlockchange, false);
    document.addEventListener("mozpointerlockchange", pointerlockchange, false);
    document.addEventListener("webkitpointerlockchange", pointerlockchange, false);

    crouching = false;

    document.addEventListener("keydown", function(evnt){
        if(isLocked){
            if(evnt.code === "KeyR"){
                camera.position = new BABYLON.Vector3(0,10,0);
                camera.setTarget = new BABYLON.Vector3(0,10,0);
                camera.rotation.x = 0;
                camera.rotation.y = 7;
            }

            if(evnt.code === "ShiftLeft"){
                camera.speed = 8;
            }

            if(evnt.code === "KeyF" && !crouching){
                camera.ellipsoid = new BABYLON.Vector3(0.25,2.5,0.25);
                crouching = true;
                scene.getMeshByName("DoorBlock").checkCollisions = false;
            } else if (evnt.code === "KeyF" && crouching) {
                crouching = false;
                camera.position.y += 4;
                camera.ellipsoid = new BABYLON.Vector3(0.25,5,0.25);
                scene.getMeshByName("DoorBlock").checkCollisions = true;
            }
            
        }
    });

    document.addEventListener("keyup", function(evnt){
        if(isLocked){
            if(evnt.code === "ShiftLeft"){
                camera.speed = 4;
            }
        }
    });



    window.addEventListener("click", function (e) {
        if(isLocked){
            var pickResult = scene.pick(window.innerWidth/2, window.innerHeight/2);

            if (e.which == 3 && pickResult.hit && pickable.includes(pickResult.pickedMesh.name) && !pickedUp) {
                console.log("Picked!")
                pickedUp = pickResult.pickedMesh;
                pickedUpCameraDiff = camera.position.subtract(pickedUp.position);
            } else if (e.which == 3 && pickResult.hit && pickable.includes(pickResult.pickedMesh.name)) {
                console.log("Dropped!")
                pickedUp = null;
                pickedUpCameraDiff = new BABYLON.Vector3();
            }

        }

    });


    var distFromCam = 8;
    
    scene.registerBeforeRender(function(){
        // translateTransform = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(xAddPos/3000, 0, yAddPos/3000), BABYLON.Matrix.RotationY(camera.rotation.y));
        // camera.cameraDirection.addInPlace(translateTransform);
        // camera.cameraRotation.y += xAddRot/15000*-1;
        // camera.cameraRotation.x += yAddRot/15000*-1;

        if (pickedUp) {

            var cameraQuaternion = camera.rotationQuaternion.clone();
            var directionVector = new BABYLON.Vector3(0,0,distFromCam);
            var rotationVector = multiplyQuaternionByVector(cameraQuaternion, directionVector);

            pickedUp.position.set(-(camera.position.x + rotationVector.x), camera.position.y + rotationVector.y, camera.position.z + rotationVector.z);

        }
        

    }); 


    function multiplyQuaternionByVector(quaternion, vector){
        var target = new BABYLON.Vector3();

        var x = vector.x,
            y = vector.y,
            z = vector.z;
    
        var qx = quaternion.x,
            qy = quaternion.y,
            qz = quaternion.z,
            qw = quaternion.w;
    
        // q*v
        var ix =  qw * x + qy * z - qz * y,
        iy =  qw * y + qz * x - qx * z,
        iz =  qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;
    
        target.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        target.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        target.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    
        return target;


    };

    scene.executeWhenReady(function(){
        document.getElementById("loadingScreen").style.display = "none";
        console.log("Done Loading");
        scene.freeActiveMeshes()
        scene.cleanCachedTextureBuffer();

        camera.position = new BABYLON.Vector3(0,8,0);
        camera.setTarget = new BABYLON.Vector3(0,6,0);
        camera.rotation.x = 0;
        camera.rotation.y = 7;

        setTimeout(function(){optimizer.start()}, 5000);

        readyToPlay = true

    });

    scene.autoClear = false;
    scene.autoClearDepthAndStencil = false;
    scene.blockMaterialDirtyMechanism = true;



    return scene;
    };


    function checkVisible(targetMesh){
        var ray = new BABYLON.Ray.CreateNewFromTo(camera.position, targetMesh.position)
        var picked = scene.pickWithRay(ray)
        if(picked.hit && picked.pickedMesh.name === targetMesh.name){
            return true
        }else{
            return false
        }
    }


    engine.runRenderLoop(function(){
        if(readyToRender){
            // fpsText.text = engine.getFps().toFixed() + " fps";

            // var frustumPlanes = BABYLON.Frustum.GetPlanes(camera.getTransformationMatrix());
        
            
            scene.render();
        }
    });


    window.addEventListener("resize", function(){
        engine.resize();
    });


    function loadPauseMenu() {
        var title = document.getElementById("title");
        var name = document.getElementById("name");
        var about = document.getElementById("about");


        title.innerHTML = "Paused.";
        name.innerHTML = "This experience covers very real and intense topics.";
        about.innerHTML = "Please close this tab if you are at all uncomfortable.";
    }


    // MAZE //

    let wallHeight = 50;
    let wallThickness = 2;
    let wallWidth = 20;
    var grid = [];

    function maze(x,y) {
        var n=x*y-1;
        if (n<0) {alert("illegal maze dimensions");return;}
        var horiz =[]; for (var j= 0; j<x+1; j++) horiz[j]= [],
            verti =[]; for (var j= 0; j<x+1; j++) verti[j]= [],
            here = [Math.floor(Math.random()*x), Math.floor(Math.random()*y)],
            path = [here],
            unvisited = [];
        for (var j = 0; j<x+2; j++) {
            unvisited[j] = [];
            for (var k= 0; k<y+1; k++)
                unvisited[j].push(j>0 && j<x+1 && k>0 && (j != here[0]+1 || k != here[1]+1));
        }
        while (0<n) {
            var potential = [[here[0]+1, here[1]], [here[0],here[1]+1],
                [here[0]-1, here[1]], [here[0],here[1]-1]];
            var neighbors = [];
            for (var j = 0; j < 4; j++)
                if (unvisited[potential[j][0]+1][potential[j][1]+1])
                    neighbors.push(potential[j]);
            if (neighbors.length) {
                n = n-1;
                next= neighbors[Math.floor(Math.random()*neighbors.length)];
                unvisited[next[0]+1][next[1]+1]= false;
                if (next[0] == here[0]) {
                    horiz[next[0]][(next[1]+here[1]-1)/2]= true;
                } else { 
                    verti[(next[0]+here[0]-1)/2][next[1]]= true;
                }
                path.push(here = next);
            } else 
                here = path.pop();
        }
        return {x: x, y: y, horiz: horiz, verti: verti};
    }

    function displayMaze(m) {
        var text= [];
        for (var j= 0; j<m.x*2+1; j++) {
            var line= [];
            if (0 == j%2)
                for (var k=0; k<m.y*4+1; k++)
                    if (0 == k%4) 
                        line[k]= '+';
                    else
                        if (j>0 && m.verti[j/2-1][Math.floor(k/4)])
                            line[k]= ' ';
                        else
                            line[k]= '-';
            else
                for (var k=0; k<m.y*4+1; k++)
                    if (0 == k%4)
                        if (k>0 && m.horiz[(j-1)/2][k/4-1])
                            line[k]= '#';
                        else
                            line[k]= '|';
                    else
                        line[k]= ' ';
            if (0 == j) line[1]= line[2]= line[3]= ' ';
            if (m.x*2-1 == j) line[4*m.y]= ' ';
            text.push(line.join('')+'\r\n');
        }
        buildMazeText(text);
        return text.reverse().join('');
    }

    function buildMazeText(text) {
        for (var i=0; i<text.length; i++) {
            if (0 == i%2) {
                var temp = text[i].split("+")
                temp.splice(0, 1)
                temp.splice(temp.length-1, 1)

                for (var h=0; h<temp.length; h++) {
                    if (temp[h] == "---") {
                        insertVertiWall(h*wallWidth, (i/2)*wallWidth);
                    }
                }
            } else {
               var temp = text[i].replace(/\s/g, "").split("")
                for (var v=0; v<temp.length; v++) {
                    if (temp[v] == "|") {
                        insertHorizWall(v*wallWidth, (i/2)*wallWidth)
                    }
                }
            }
        }

        var mazeGroundSize = Math.floor(text[0].length/4) * wallWidth
        var mazeGround = new BABYLON.MeshBuilder.CreateGround("MazeGround", {height: mazeGroundSize, width: mazeGroundSize}, scene)
        mazeGround.material = blackMat;
        mazeGround.checkCollisions = true;
        mazeGround.position.x = ((Math.floor(text[0].length/4) * wallWidth) / 2) - (wallWidth/2)
        mazeGround.position.z = ((Math.floor(text[0].length/4) - 1) * wallWidth) / 2

        var endGround = new BABYLON.MeshBuilder.CreateGround("EndGround", {height: wallWidth, width: wallWidth}, scene)
        endGround.material = redMat;
        endGround.checkCollisions = true;
        endGround.position.x = Math.floor(text[0].length/4) * wallWidth
        endGround.position.z = (Math.floor(text[0].length/4) - 1) * wallWidth

        var endGoal = new BABYLON.MeshBuilder.CreateBox("EndGoal", {height: wallWidth/2, width: wallWidth/2, depth: wallWidth/2})
        endGoal.material = redMat;
        endGoal.position.x = (Math.floor(text[0].length/4) * wallWidth) - wallWidth;
        endGoal.position.z = (Math.floor(text[0].length/4) - 1) * wallWidth;
        endGoal.position.y = wallHeight/2;
    }

    function insertVertiWall(x, y) {
        let wall = new BABYLON.MeshBuilder.CreateBox("wall", {width: wallWidth, height: wallHeight, depth: wallThickness}, scene);
        wall.material = brickMat
        wall.renderOutline = true;
        wall.outlineWidth = 0.25;
        wall.outlineColor = BABYLON.Color3.Black();
        wall.position.x = x
        wall.position.z = y - (wallWidth/2)
        wall.checkCollisions = true;
    }

    function insertHorizWall(x, y) {
        let wall = new BABYLON.MeshBuilder.CreateBox("wall", {width: wallWidth, height: wallHeight, depth: wallThickness}, scene);
        wall.rotation.y = Math.PI / 2
        wall.material = brickMat
        wall.renderOutline = true;
        wall.outlineWidth = 0.25;
        wall.outlineColor = BABYLON.Color3.Black();
        wall.position.x = x - (wallWidth/2)
        wall.position.z = y - (wallWidth/2)
        wall.checkCollisions = true;
    }

    function buildMaze(m) {

        // console.log(displayMaze(m))

        var miniMapString = displayMaze(m).replace(/(?:\r\n|\r|\n)/g, '<br>');
        miniMapString = miniMapString.replace(/\s/g, '&nbsp;');
        miniMapString = miniMapString.replace(/#/g, '&nbsp;');
        document.getElementById("mapText").innerHTML = miniMapString

        return m
    
    }

    buildMaze(maze(10,10))