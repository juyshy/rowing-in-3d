


jQuery(document).ready(function () {


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

        camera.position.x += (mouseX - camera.position.x) * .05;
        //camera.position.y += 10 + ( - mouseY - camera.position.y ) * .05;
        oar_pivot_right.rotation.y = mouseY / 100 * Math.PI;
        oar_pivot_left.rotation.y = -mouseY / 100 * Math.PI;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);

    }
}
);