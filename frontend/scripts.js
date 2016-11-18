

    
jQuery( document ).ready( function () {
 
        var stats = initStats();

        // create a scene, that will hold all our elements such as objects, cameras and lights.
        var scene = new THREE.Scene();

        // create a camera, which defines where we're looking at.
        var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

        // create a render and set the size
        var renderer = new THREE.WebGLRenderer();

        renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMapEnabled = true;

        // create the ground plane
        var planeGeometry = new THREE.PlaneGeometry(60, 20, 1, 1);
        var planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
        var plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.receiveShadow = true;

        // rotate and position the plane
        plane.rotation.x = -0.5 * Math.PI;
        plane.position.x = 5;
        plane.position.y = 0;
        plane.position.z = 0;

        // add the plane to the scene
        scene.add(plane);

        // create a cube
        var cubeGeometry = new THREE.BoxGeometry(20, 3, 1);
        var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xDAC2A8});
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
		var cube2 = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.castShadow = true;
		cube2.castShadow = true;

        // position the cube
        cube.position.x = 5;
        cube.position.y = 3;
        cube.position.z = 0;

        // position the cube
        cube2.position.x = -5;
        cube2.position.y = 3;
        cube2.position.z = 0;

		var pivot = new THREE.Object3D();
		pivot.add(cube);
		var pivot2 = new THREE.Object3D();
		pivot2.add(cube2);
        // add the cube to the scene
        scene.add(pivot);
		scene.add(pivot2);

        // position and point the camera to the center of the scene
        camera.position.x = 0;
        camera.position.y = 20;
        camera.position.z = 30;
        camera.lookAt(scene.position);

        // add subtle ambient lighting
        var ambientLight = new THREE.AmbientLight(0x3c3c3c);
        scene.add(ambientLight);

        // add spotlight for the shadows
        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(10, 60, 10);
        spotLight.castShadow = true;
        scene.add(spotLight);

        // add the output of the renderer to the html element
        document.getElementById("WebGL-output").appendChild(renderer.domElement);

        // call the render function
        var degree = -45;
        var radian = 0;
        var direction = 1;
        pivot.translateX(12);
        renderScene();

        function renderScene() {
            stats.update();
            // rotate the cubes  

             pivot.rotation.y  = $lastR; 
			 pivot2.rotation.y  = $lastL;
            //cube.rotation.z += 0.01;
            // render using requestAnimationFrame
          	requestAnimationFrame(renderScene);
            renderer.render(scene, camera);
        }

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

/////////////////////////

		var $lastR = -1;
		var $lastL = -1;

		var socket = io.connect( "/", {
			"reconnect"                :true,
			"reconnection delay"       :500,
			"max reconnection attempts":10
		} );



		socket.on( "message", function ( data ) {

			data = process_data( data );

			/* Initial position */
			if ( $lastR == -1 ) {
				$lastR = data.x;
				$lastL = data.y;
			}

			$lastR = data.r;
			//console.log($lastR);
			$lastL = data.l;
			//renderScene();
 
		} );


		function process_data( data ) {

			var ret = {
				r:0,
				l:0
			};

			var array = data.split( ',' );

			if ( array.length < 2 )
				return ret;

			ret.r = array[0];
			ret.l = array[1];

			ret = sanitize_size( ret );

			return ret;
		}

		/* Convert pot values to row oar degrees. */
		function sanitize_size( values ) {
			var ret = {
				r:0,
				l:0
			};
			var max_potR = 752;
			var max_potL = 676;
			var min_potR = 145;
			var min_potL = 82;			
			var max_rota_R = 40;
			var max_rota_L = 50;
			var min_rota_R = -60;
			var min_rota_L = -50;
			var maxPot_R_delta = max_potR -min_potR;
			var maxPot_L_delta = max_potL -min_potL;
			var max_rota_R_delta = max_rota_R -min_rota_R;
			var max_rota_L_delta = max_rota_L -min_rota_L;
			var pot2rotR_ratio = max_rota_R_delta / maxPot_R_delta;
			var pot2rotL_ratio = max_rota_L_delta / maxPot_L_delta;
			degreeR = ((values.r - min_potR)  * pot2rotR_ratio + min_rota_R);
			degreeL = (values.l - min_potL)* pot2rotL_ratio + min_rota_L;
			ret.r = degreeR * 0.0174533;
			ret.l = -degreeL * 0.0174533;
			//console.log(values.r, (values.r - min_potR), degreeR, ret.r);
			return ret;
		}

	}
);