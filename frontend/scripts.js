

    
jQuery( document ).ready( function () {


			var container, stats;

			var camera, scene, renderer;

			var mouseX = 0, mouseY = 0;

			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;


			init();
			animate();


			function init() {

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
				camera.position.x = 0;
                camera.position.y = 120;
                camera.position.z = 120;

				// scene

				scene = new THREE.Scene();

				var ambient = new THREE.AmbientLight( 0x888888 );
				scene.add( ambient );

				var directionalLight = new THREE.DirectionalLight( 0xffeedd );
				directionalLight.position.set( 0, 5, 1 ).normalize();
				scene.add( directionalLight );

				// model

				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};

				var onError = function ( xhr ) { };

				THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

				var mtlLoader = new THREE.MTLLoader();
				mtlLoader.setPath( '3d/' );
				mtlLoader.load( 'boat2.mtl', function( materials ) {

					materials.preload();
                    
					var objLoader = new THREE.OBJLoader();
					objLoader.setMaterials( materials );
					objLoader.setPath( '3d/' );
					objLoader.load( 'boat2.obj', function ( object ) {
                   // object.doubleSided = true;
                   console.dir(object);
                   object.children[0].material.side = THREE.DoubleSide;
                   object.children[1].material.side = THREE.DoubleSide;
                   object.children[2].material.side = THREE.DoubleSide;
						object.position.y = 0;
                        object.rotation.y = 0.5 * Math.PI;
						scene.add( object );

					}, onProgress, onError );

				});




				//

				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
                
                renderer.setClearColor( 0xFFFFFF );
				container.appendChild( renderer.domElement );

				document.addEventListener( 'mousemove', onDocumentMouseMove, false );

				//

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {

				windowHalfX = window.innerWidth / 2;
				windowHalfY = window.innerHeight / 2;

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function onDocumentMouseMove( event ) {

				mouseX = ( event.clientX - windowHalfX ) / 8;
				mouseY = ( event.clientY - windowHalfY ) / 8;

			}

			//

			function animate() {

				requestAnimationFrame( animate );
				render();

			}

			function render() {

				camera.position.x += ( mouseX - camera.position.x ) * .05;
				camera.position.y += 10 + ( - mouseY - camera.position.y ) * .05;

				camera.lookAt( scene.position );

				renderer.render( scene, camera );

			}
	}
);