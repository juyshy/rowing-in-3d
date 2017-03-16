
"use strict";
/*jslint browser: true*/
/*global   jQuery, alert, Stats, THREE,io*/

jQuery(document).ready(function () {

    var oars = {
        dirFlag: false,
        left: {
            pivot: new THREE.Object3D(),
            initialRowRotation: -45 * Math.PI / 180,
            lastRowRotation: this.lastRowRotation,
            pos: new THREE.Vector3(22.7, 0, -13.5),
            upRotation: 0,
            lastRowRawVal: 0
        },
        right: {
            pivot: new THREE.Object3D(),
            initialRowRotation: 45 * Math.PI / 180,
            lastRowRotation: this.initialRowRotation,
            pos: new THREE.Vector3(-22.7, 0, -13.5),
            upRotation: 0,
            lastRowRawVal: 0
        },
        updateOars: function () {
            this.right.pivot.rotation.y = this.right.lastRowRotation;
            this.left.pivot.rotation.y = this.left.lastRowRotation;

            if (this.dirFlag) {
                this.right.upRotation -= 0.01;
                if (this.right.upRotation < -0.2) {
                    this.right.upRotation = -0.2;
                }
                this.left.upRotation += 0.01;
                if (this.left.upRotation > 0.2) {
                    this.left.upRotation = 0.2;
                }

            } else {

                this.right.upRotation += 0.01;
                if (this.right.upRotation > 0) {
                    this.right.upRotation = 0;
                }
                this.left.upRotation -= 0.01;
                if (this.left.upRotation < 0) {
                    this.left.upRotation = 0;
                }
            }
            this.right.pivot.rotation.z = this.right.upRotation;// mouseY / 100 * Math.PI;
            this.left.pivot.rotation.z = this.left.upRotation; //-mouseY / 100 * Math.PI;

        },
        updateOarPositions: function (processedRowingData) {
            this.right.lastRowRotation = processedRowingData.degreeR;
            this.left.lastRowRotation = processedRowingData.degreeL;
            this.right.lastRowRawVal = processedRowingData.rawValR;
            this.left.lastRowRawVal = processedRowingData.rawValL;
        },
        conf: {
            dirArray: [],
            rowPositionBufferSize: 10
        },
        rowingIntensity: 0,
        updateRowingIntensity: function () {

            this.conf.dirArray.push(this.right.lastRowRawVal);
            if (this.conf.dirArray.length > this.conf.rowPositionBufferSize) {
                this.conf.dirArray.shift();
            }

            // calculating rowing intensity 
            this.rowingIntensity = 0;
            for (var indx = 0; indx < this.conf.dirArray.length - 1; indx++) {
                this.rowingIntensity += this.conf.dirArray[indx + 1] - this.conf.dirArray[indx];
            }
            //determining oar direction 
            if (this.rowingIntensity > 0.03) {
                oars.dirFlag = true; // going forward
            } else {
                oars.dirFlag = false;
            }
        }
    };


    var speedAdjustMult = 1.0;

    var frameCount = 0;
    var randomFreq = 230;
    var randomViewPos = { x: 0, y: 10 };
    var texture_placeholder;
    var mouseX, mouseY;

    var skyboxmesh;
    var rowinfo = jQuery("#info2");

    var startTime = Date.now(), prevTime = startTime, prevTime2 = startTime, prevTime1 = startTime;
    var frameDelays = [];
    var speedLog = [];
    var unitMultiplier = 0.2;
    var speedToRealMult = 8.0;
    var speedSmoothing = 0.005;
    var startTimeDate = new Date(startTime);
    var startTimestring = startTimeDate.getDate() + "." + (startTimeDate.getMonth() + 1) + "." + startTimeDate.getFullYear() + " " +
        startTimeDate.getHours() + ":" + startTimeDate.getMinutes() + ":" + startTimeDate.getSeconds();
    var activityPeriods = [];
    var activity = false;
    var prevActiveStartTime;
    var container;
    var camera, scene, renderer;
    //var mouseX = 0, mouseY = 0;
    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;
    var boat;

    function initStats() {

        var stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms
        // Align top-left
        stats.domElement.style.position = "absolute";
        stats.domElement.style.left = "0px";
        stats.domElement.style.top = "0px";
        document.getElementById("Stats-output").appendChild(stats.domElement);

        return stats;
    }

    var stats = initStats();


    init();
    animate();

    function loadTexture(path) {

        var texture = new THREE.Texture(texture_placeholder);
        var material = new THREE.MeshBasicMaterial({ map: texture, overdraw: true });

        var image = new Image();
        image.onload = function () {

            texture.needsUpdate = true;
            material.map.image = this;

            //render();

        };
        image.src = path;

        return material;

    }

    function setSkyBox() {

        texture_placeholder = document.createElement("canvas");
        texture_placeholder.width = 128;
        texture_placeholder.height = 128;

        var context = texture_placeholder.getContext("2d");
        context.fillStyle = "rgb( 200, 200, 200 )";
        context.fillRect(0, 0, texture_placeholder.width, texture_placeholder.height);

        // 		var folder = "textures/";

        var folder = "skyboxtex/"; // "netsuns/"; // //"koivuk_skybox/";

        var materials = [


            loadTexture(folder + "posx.jpg"), // right
            loadTexture(folder + "negx.jpg"), // left
            loadTexture(folder + "posy.jpg"), // top
            loadTexture(folder + "negy.jpg"), // bottom
            loadTexture(folder + "posz.jpg"), // back
            loadTexture(folder + "negz.jpg")  // front
        ];

        skyboxmesh = new THREE.Mesh(new THREE.CubeGeometry(1300, 1300, 1300, 7, 7, 7), new THREE.MeshFaceMaterial(materials));
        skyboxmesh.scale.x = - 1;
        skyboxmesh.position.y = 75;
        skyboxmesh.rotation.y = -Math.PI * 0.5;
        scene.add(skyboxmesh);

    }


    function debugGeometry() {
        var geometry = new THREE.PlaneGeometry(4, 4, 4);
        // var geometry = new THREE.PlaneGeometry(100, 100, 4);

        var material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        var plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = Math.PI / 2;
        plane.position.z = 50;
        plane.position.y = 20;
        boat.add(plane);
        var plane2 = new THREE.Mesh(geometry, material);
        plane2.position.z = -50;
        plane2.position.y = 20;
        plane2.rotation.x = Math.PI / 2;
        boat.add(plane2);

    }

    function createSea() {

        var mapUrl = "texture/sea2.jpg";
        var map = THREE.ImageUtils.loadTexture(mapUrl);
        var material = new THREE.MeshPhongMaterial({ map: map });
        var tilesize = 1300;
        var geometry = new THREE.PlaneGeometry(tilesize, tilesize);

        for (var planeCount = 0; planeCount < 15; planeCount++) {
            var plane = new THREE.Mesh(geometry, material);
            plane.position.y = -4;
            plane.rotation.x = - Math.PI / 2;
            plane.position.z = -planeCount * tilesize;

            scene.add(plane);
        }
    }


    function setUpLight() {

        var ambient = new THREE.AmbientLight(0x888888);
        scene.add(ambient);

        var directionalLight = new THREE.DirectionalLight(0xffeedd);
        directionalLight.position.set(0, 5, 1).normalize();
        scene.add(directionalLight);
    }

    function cameraSetUp() {
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.x = 0;
        camera.position.y = 420;
        camera.position.z = 420;
    }
    function createBoat() {

        boat = new THREE.Object3D();
        boat.oars = oars;
        boat.speed = 0;
        scene.add(boat);

        boat.add(oars.right.pivot);
        boat.add(oars.left.pivot);

        var onProgress = function (xhr) {
            if (xhr.lengthComputable) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log(Math.round(percentComplete, 2) + "% downloaded");
            }
        };

        var onError = function (xhr) { };

        THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());

        function load3DObject(objFile, mtlFile, path, attachObject,
            pos = new THREE.Vector3(), doubleSided = false) {
            var mtlLoader = new THREE.MTLLoader();
            mtlLoader.setPath(path);
            mtlLoader.load(mtlFile, function (materials) {
                materials.preload();
                var objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.setPath(path);
                objLoader.load(objFile, function (object) {
                    object.position.z = pos.z;
                    object.position.x = pos.x;
                    if (doubleSided)
                        for (var meshIndx = 0; meshIndx < object.children.length; meshIndx++) {
                            object.children[meshIndx].material.side = THREE.DoubleSide;
                        }
                    //console.dir(object2);
                    attachObject.add(object);
                }, onProgress, onError);
            });
        };

        load3DObject("boat3.obj", "boat3.mtl", "3d/", boat, new THREE.Vector3(), true);
        load3DObject("oar4.obj", "oar4.mtl", "3d/", oars.right.pivot, oars.right.pos);
        load3DObject("oarleft.obj", "oarleft.mtl", "3d/", oars.left.pivot, oars.left.pos);

        oars.right.pivot.position.z = 13.5;
        oars.right.pivot.position.x = 22.7;
        oars.left.pivot.position.z = 13.5;
        oars.left.pivot.position.x = -22.7;
        boat.updateSpeed = function (timedelta) {
            if (this.oars.dirFlag) { // direction of oars
                this.speed += (this.oars.rowingIntensity * timedelta * speedAdjustMult - this.speed) * speedSmoothing; //= 0.08; //
            }
            else {
                this.speed += (0 - this.speed) * .005; //= 0.01;//
            }
            // this.speed = speed;
        }
    }

    function init() {

        container = document.createElement("div");
        document.body.appendChild(container);

        cameraSetUp();
        // scene
        scene = new THREE.Scene();
        setUpLight();
        createSea();
        setSkyBox();
        // debugGeometry();
        createBoat();

        scene.fog = new THREE.Fog(0xc3a8c5, 500, 670);//9c7b99
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xFFFFFF);
        container.appendChild(renderer.domElement);
        document.addEventListener("mousemove", onDocumentMouseMove, false);
        window.addEventListener("resize", onWindowResize, false);

    }

    function onWindowResize() {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }

    function onDocumentMouseMove(event) {

        mouseX = (event.clientX - windowHalfX) / 8;
        mouseY = (event.clientY - windowHalfY) / 8;
    }

    //

    function animate() {

        requestAnimationFrame(animate);
        render();

    }



    function render() {
        stats.update();
        var time = Date.now();
        var timer = 0.001 * time;
        //console.log(timer);
        var timedelta = timer - prevTime1;
        prevTime1 = timer;


        var ms = time - startTime;

        frameCount++;


        var frameDelay = time - prevTime2;
        if (frameDelay < 45) {
            frameDelays.push(frameDelay);
        }



        if (time > prevTime + 300) {

            var cumulativeActivityTime = 0;
            for (var actIndx = 0; actIndx < activityPeriods.length; actIndx++) {
                if (activityPeriods[actIndx].start) {
                    prevActiveStartTime = activityPeriods[actIndx].start;
                } else {
                    cumulativeActivityTime += activityPeriods[actIndx].end - prevActiveStartTime;
                }
            }
            if (activity && typeof prevActiveStartTime !== undefined) {
                cumulativeActivityTime += time - prevActiveStartTime;

            }

            var speedVal = Number(boat.speed).toFixed(2);
            if (boat.speed > 0) {
                speedLog.push(speedVal);
            }
            var jsonSpeedLog = JSON.stringify(speedLog);

            // var realSpeed = speed * speedToRealMult; // m/s
            var realSpeed = boat.speed / timedelta * unitMultiplier; // m/s
            var distanceTraveled = boat.position.z * unitMultiplier;
            var infohtml = "<p >Session start: " + startTimestring + "  </p>";
            var sessionDuration = ms / 1000;
            infohtml += "<p> sessionDuration " + Math.floor(sessionDuration) + "  </p>";
            infohtml += "<p> distanceTraveled " + Number(distanceTraveled).toFixed(1) + "  </p>";
            infohtml += "<p> activetime " + Math.floor(cumulativeActivityTime / 1000) + "  </p>";
            // infohtml += "<p> diffSum abs " + Math.abs(oars.rowingIntensity) + "  </p>";

            infohtml += "<p> Speed " + Number(boat.speed).toFixed(2) + "   </p>";
            if (activity)
                infohtml += '<p class="active"> realSpeed ' + Number(realSpeed).toFixed(2) + " m/s </p>";
            else
                infohtml += "<p> realSpeed " + Number(realSpeed).toFixed(2) + " m/s </p>";

            if (realSpeed > 0.2) {

                var realSpeed500 = 500 / realSpeed;
                var realSpeed500mins = realSpeed500 / 60;
                var realSpeed500secs = realSpeed500 % 60;
                infohtml += "<p> 500m " + Number(realSpeed500).toFixed(0) + " secs  ";
                infohtml += Number(realSpeed500mins).toFixed(0) + ":";
                infohtml += Number(realSpeed500secs).toFixed(0) + "</p>";
            }

            infohtml += "<p> frameCount " + frameCount + "</p>";
            infohtml += "<p> frameDelay " + frameDelay + "</p>";

            rowinfo.html(infohtml);
            prevTime = time;
        }
        prevTime2 = time;

        if (frameCount % randomFreq == 0) {
            randomViewPos.x = Math.random() * 300 - 150;
            randomViewPos.y = Math.random() * 150 + 1;
            //console.log(randomViewPos);
        }

        camera.position.x += (randomViewPos.x - camera.position.x) * .005;
        camera.position.y += (randomViewPos.y - camera.position.y) * .005;

        oars.updateRowingIntensity();

        if (timedelta > 0.05) {
            timedelta = 0.05;
        }

        oars.updateOars();
        boat.updateSpeed(timedelta);


        if (!activity && (Math.abs(oars.rowingIntensity) > 0 || boat.speed > 0.1)) {
            activity = true;
            activityPeriods.push({ start: time });
            if (typeof prevActiveStartTime === undefined) {
                prevActiveStartTime = time;
            }
        } else if (activity && Math.abs(oars.rowingIntensity) < 0.001 && boat.speed < 0.1) {
            activity = false;
            activityPeriods.push({ end: time });
        }


        boat.position.z -= boat.speed;
        camera.position.z = boat.position.z + 200;
        skyboxmesh.position.x = camera.position.x;
        skyboxmesh.position.z = camera.position.z;
        var lookatPos = { x: 0, y: 0, z: 0 };
        lookatPos.x = boat.position.x;
        lookatPos.y = boat.position.y + 5;
        lookatPos.z = boat.position.z;
        camera.lookAt(lookatPos);

        renderer.render(scene, camera);


    }


    function rowingMachine(callBackObj) {


        var oarDefaults = { leftMin: 65, rightMin: 147, leftMax: 676, rightMax: 752 };
        var socket = io.connect("/", {
            "reconnect": true,
            "reconnection delay": 500,
            "max reconnection attempts": 10
        });



        socket.on("message", function (rowingData) {

            var processedRowingData = process_data(rowingData);

            /* Initial position */
            if (callBackObj.right.lastRowRotation == -1) {
                callBackObj.right.lastRowRotation = processedRowingData.x;
                callBackObj.left.lastRowRotation = processedRowingData.y;

            }
            callBackObj.updateOarPositions(processedRowingData);


        });


        function process_data(data) {

            var rawData = {
                r: 0,
                l: 0
            };
            var processedData = {
                r: 0,
                l: 0
            };
            var array = data.split(",");
            if (array.length == 2) {

                rawData.r = array[0];
                rawData.l = array[1];

                processedData = processOarRotations(rawData);
                //console.log(ret);
                return processedData;
            }
        }


        /* Convert pot values to row oar degrees. */
        function processOarRotations(values) {
            var ret = {
                r: 0,
                l: 0,
                upR: 0,
                upL: 0,
                speed: 0,
                rawValR: 0,
                rawValL: 0,
            };

            var degreeL, degreeR;
            var max_potR = oarDefaults.rightMax;
            var max_potL = oarDefaults.leftMax;
            var min_potR = oarDefaults.rightMin;
            var min_potL = oarDefaults.leftMin;
            var max_rota_R = 50;
            var max_rota_L = 50;
            var min_rota_R = -50;
            var min_rota_L = -50;
            var maxPot_R_delta = max_potR - min_potR;
            var maxPot_L_delta = max_potL - min_potL;
            var max_rota_R_delta = max_rota_R - min_rota_R;
            var max_rota_L_delta = max_rota_L - min_rota_L;
            var pot2rotR_ratio = max_rota_R_delta / maxPot_R_delta;
            var pot2rotL_ratio = max_rota_L_delta / maxPot_L_delta;
            degreeR = ((values.r - min_potR) * pot2rotR_ratio + min_rota_R);
            degreeL = (values.l - min_potL) * pot2rotL_ratio + min_rota_L;
            ret.rawValR = values.r;
            ret.rawValR = values.l;
            ret.degreeR = -degreeR * 0.0174533;
            ret.degreeL = degreeL * 0.0174533;

            return ret;
        }
    }

    rowingMachine(oars);

});