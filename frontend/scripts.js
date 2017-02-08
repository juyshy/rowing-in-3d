


jQuery(document).ready(function () {
    var $lastR = -1;
    var $lastL = -1;
    var $lastLup = 0;
    var $lastRup = 0;
    var $lastSpeed = 0;
    var $lastRowValR = -1;
    var $lastRowValL = -1;
    var maxim = 0;
    var previousAngle = 0;
    var dirFlag = false;
    var dirArray = [];
    var speed = 0;
    var frameCount = 0;
    var randomFreq = 230;
    var randomViewPos = { x: 0, y: 10 };

    var skyboxmesh;

    function initStats() {

        var stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms
        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.getElementById("Stats-output").appendChild(stats.domElement);

        return stats;
    }

    var stats = initStats();
    var container, stats;

    var camera, scene, renderer;

    var mouseX = 0, mouseY = 0;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;
    var pivot = new THREE.Object3D();
    var oar_pivot_right = new THREE.Object3D();
    var oar_pivot_left = new THREE.Object3D();
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

        texture_placeholder = document.createElement('canvas');
        texture_placeholder.width = 128;
        texture_placeholder.height = 128;

        var context = texture_placeholder.getContext('2d');
        context.fillStyle = 'rgb( 200, 200, 200 )';
        context.fillRect(0, 0, texture_placeholder.width, texture_placeholder.height);

        // 		var folder = "textures/";

        var folder = "skyboxtex/"; // "netsuns/"; // //"koivuk_skybox/";

        var materials = [

            /* 					loadTexture( folder + 'px.jpg' ), // right
                                loadTexture( folder + 'nx.jpg' ), // left
                                loadTexture( folder + 'py.jpg' ), // top
                                loadTexture( folder + 'ny.jpg' ), // bottom
                                loadTexture( folder + 'pz.jpg' ), // back
                                loadTexture( folder + 'nz.jpg' )  // front */

            loadTexture(folder + 'posx.jpg'), // right
            loadTexture(folder + 'negx.jpg'), // left
            loadTexture(folder + 'posy.jpg'), // top
            loadTexture(folder + 'negy.jpg'), // bottom
            loadTexture(folder + 'posz.jpg'), // back
            loadTexture(folder + 'negz.jpg')  // front
        ];

        skyboxmesh = new THREE.Mesh(new THREE.CubeGeometry(1300, 1300, 1300, 7, 7, 7), new THREE.MeshFaceMaterial(materials));
        skyboxmesh.scale.x = - 1;
        skyboxmesh.position.y = 75;
        skyboxmesh.rotation.y = -Math.PI * 0.5;
        scene.add(skyboxmesh);

    }

    function init() {

        container = document.createElement('div');
        document.body.appendChild(container);

        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.x = 0;
        camera.position.y = 420;
        camera.position.z = 420;

        // scene

        scene = new THREE.Scene();

        var ambient = new THREE.AmbientLight(0x888888);
        scene.add(ambient);

        var directionalLight = new THREE.DirectionalLight(0xffeedd);
        directionalLight.position.set(0, 5, 1).normalize();
        scene.add(directionalLight);

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
        // model

        setSkyBox();
        scene.add(pivot);

        pivot.add(oar_pivot_right);
        pivot.add(oar_pivot_left);
        var onProgress = function (xhr) {
            if (xhr.lengthComputable) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log(Math.round(percentComplete, 2) + '% downloaded');
            }
        };

        var onError = function (xhr) { };

        THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());

        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath('3d/');
        mtlLoader.load('boat3.mtl', function (materials) {

            materials.preload();

            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('3d/');
            objLoader.load('boat3.obj', function (object) {
                // object.doubleSided = true;
                console.dir(object);
                object.children[0].material.side = THREE.DoubleSide;
                object.children[1].material.side = THREE.DoubleSide;
                object.children[2].material.side = THREE.DoubleSide;
                pivot.add(object);

            }, onProgress, onError);

        });

        mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath('3d/');
        mtlLoader.load('oar4.mtl', function (materials) {

            materials.preload();

            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('3d/');
            objLoader.load('oar4.obj', function (object2) {

                object2.position.z = -13.5;
                object2.position.x = -22.7;
                //console.dir(object2);
                oar_pivot_right.add(object2);

            }, onProgress, onError);

        });
        mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath('3d/');
        mtlLoader.load('oarleft.mtl', function (materials) {

            materials.preload();

            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('3d/');
            objLoader.load('oarleft.obj', function (object2) {

                object2.position.z = -13.5;
                object2.position.x = 22.7;
                oar_pivot_left.add(object2);

            }, onProgress, onError);

        });
        oar_pivot_right.position.z = 13.5;
        oar_pivot_right.position.x = 22.7;
        oar_pivot_left.position.z = 13.5;
        oar_pivot_left.position.x = -22.7;

        //



        scene.fog = new THREE.Fog(0xc3a8c5, 300, 640);//9c7b99

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        renderer.setClearColor(0xFFFFFF);
        container.appendChild(renderer.domElement);

        document.addEventListener('mousemove', onDocumentMouseMove, false);

        //

        window.addEventListener('resize', onWindowResize, false);

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
        frameCount++;

        if (frameCount % randomFreq == 0) {
            randomViewPos.x = Math.random() * 300 - 150;
            randomViewPos.y = Math.random() * 150 + 1;
            //console.log(randomViewPos);
        }


        //camera.position.x += (mouseX*2 - camera.position.x) * .05;
        //camera.position.y += 10 + ( - mouseY*2 - camera.position.y ) * .05;
        camera.position.x += (randomViewPos.x - camera.position.x) * .005;
        camera.position.y += (randomViewPos.y - camera.position.y) * .005;
        oar_pivot_right.rotation.y = $lastR;// mouseY / 100 * Math.PI;
        oar_pivot_left.rotation.y = $lastL; //-mouseY / 100 * Math.PI;




        dirArray.push($lastRowValR);
        if (dirArray.length > 10) {
            dirArray.shift();
        }
        var diffSum = 0;
        for (var indx = 0; indx < dirArray.length - 1; indx++) {
            diffSum += dirArray[indx + 1] - dirArray[indx];
        }
        //console.log(diffSum);
        if (diffSum > 0) {
            dirFlag = true;
            //console.log("eteenp");
        } else {
            dirFlag = false;
        }
        //console.log(dirArray);
        //previousAngle =values.r;

        if (dirFlag) {

            $lastRup = -0.2;// ( -0.3 - ret.upR  ) * 0.05;  //-(0.872 - Math.abs(0- ret.r)) * 0.3;
            $lastLup = 0.2;
            speed += (diffSum * 0.02 - speed) * .01; //= 0.08; //
        }


        else {
            $lastRup = 0;
            $lastLup = 0;
            speed += (0 - speed) * .005; //= 0.01;//
        }

        oar_pivot_right.rotation.z = $lastRup;// mouseY / 100 * Math.PI;
        oar_pivot_left.rotation.z = $lastLup; //-mouseY / 100 * Math.PI;

        pivot.position.z -= speed;
        camera.position.z = pivot.position.z + 200;
        skyboxmesh.position.x = camera.position.x;
        skyboxmesh.position.z = camera.position.z;
        var lookatPos = { x: 0, y: 0, z: 0 };
        lookatPos.x = pivot.position.x;
        lookatPos.y = pivot.position.y + 5;
        lookatPos.z = pivot.position.z;
        camera.lookAt(lookatPos);

        renderer.render(scene, camera);

    }

    var socket = io.connect("/", {
        "reconnect": true,
        "reconnection delay": 500,
        "max reconnection attempts": 10
    });



    socket.on("message", function (data) {

        data = process_data(data);

        /* Initial position */
        if ($lastR == -1) {
            $lastR = data.x;
            $lastL = data.y;

        }

        $lastR = data.r;
        //console.log($lastR);
        $lastL = data.l;
        $lastRup = data.upR;
        $lastLup = data.upL;
        $lastRowValR = data.rawValR;
        $lastRowValL = data.rawValL;
        //$lastSpeed = data.speed;
        //console.log($lastSpeed);
        //renderScene();

    });


    function process_data(data) {

        var ret = {
            r: 0,
            l: 0
        };

        var array = data.split(',');

        if (array.length < 2)
            return ret;
        ret.r = array[0];
        ret.l = array[1];
        ret = sanitize_size(ret);
        //console.log(ret);
        return ret;
    }


    /* Convert pot values to row oar degrees. */
    function sanitize_size(values) {
        var ret = {
            r: 0,
            l: 0,
            upR: 0,
            upL: 0,
            speed: 0,
            rawValR: 0,
            rawValL: 0,
        };
        var max_potR = 752;
        var max_potL = 676;
        var min_potR = 145;
        var min_potL = 82;
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
        ret.r = -degreeR * 0.0174533;
        ret.l = degreeL * 0.0174533;
        /*
        if(maxim < ret.l){
            maxim = ret.l;
            //console.log(ret.l);
        }*/


        //ret.upL = ( 0.872 - Math.abs(0- ret.l)) * 0.3;
        //console.log(values.r, (values.r - min_potR), degreeR, ret.r);
        // console.log(ret);
        return ret;
    }

}
);