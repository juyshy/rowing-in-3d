


jQuery(document).ready(function () {
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

    var oar_pivot_right = new THREE.Object3D();
    var oar_pivot_left = new THREE.Object3D();
    init();
    animate();



    function init() {

        container = document.createElement('div');
        document.body.appendChild(container);

        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.x = 0;
        camera.position.y = 120;
        camera.position.z = 120;

        // scene

        scene = new THREE.Scene();

        var ambient = new THREE.AmbientLight(0x888888);
        scene.add(ambient);

        var directionalLight = new THREE.DirectionalLight(0xffeedd);
        directionalLight.position.set(0, 5, 1).normalize();
        scene.add(directionalLight);

        // model
        var pivot = new THREE.Object3D();
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
        camera.position.x += (mouseX - camera.position.x) * .05;
        //camera.position.y += 10 + ( - mouseY - camera.position.y ) * .05;
        oar_pivot_right.rotation.y = $lastR;// mouseY / 100 * Math.PI;
        oar_pivot_left.rotation.y = $lastL ; //-mouseY / 100 * Math.PI;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);

    }
    var $lastR = -1;
    var $lastL = -1;

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

        return ret;
    }

    /* Convert pot values to row oar degrees. */
    function sanitize_size(values) {
        var ret = {
            r: 0,
            l: 0
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
        ret.r = -degreeR * 0.0174533;
        ret.l = degreeL * 0.0174533;
        //console.log(values.r, (values.r - min_potR), degreeR, ret.r);
        return ret;
    }

}
);