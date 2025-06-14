        console.log("Script is running!");

        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
        import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
        import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
        import GUI from 'lil-gui';

        // --- STATE OBJECT FOR GUI (NEW) ------------------------------------
        const backgroundControls = {
            showHdri: true,
            color: '#3e3e56'
        };

        // --- CORE SETUP ----------------------------------------------------

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(-12, 20, -22);

        const renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('canvas.webgl'),
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.79;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // --- GUI SETUP (PART 1) -------------------------------------------
        // We create the main GUI and controls that DON'T depend on loaded files.
        const gui = new GUI();
        gui.add(renderer, 'toneMappingExposure', 0, 3, 0.01).name('Exposure');

        const cameraFolder = gui.addFolder('Camera');
        cameraFolder.add(camera.position, 'x', -20, 20, 0.01).name('Position X').listen();
        cameraFolder.add(camera.position, 'y', -20, 20, 0.01).name('Position Y').listen();
        cameraFolder.add(camera.position, 'z', -20, 20, 0.01).name('Position Z').listen();
        cameraFolder.open();

        // --- LIGHTING ------------------------------------------------------
        const ambientLight = new THREE.AmbientLight(0xffffff, 0);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0);
        directionalLight.position.set(3, 3, 3);
        scene.add(directionalLight);

        // --- THREE POINT LIGHT SETUP ---------------------------------------------
        // Key Light
        const keyLight = new THREE.RectAreaLight(0xffffff, 20);
        keyLight.position.set(11, 25, -9);
        // Set initial rotation (in radians)
        keyLight.rotation.set(
            THREE.MathUtils.degToRad(225), // X
            THREE.MathUtils.degToRad(41),  // Y
            THREE.MathUtils.degToRad(0)   // Z
        );
        scene.add(keyLight);
        // Visual helper for key light
        const keyLightHelper = new RectAreaLightHelper(keyLight);
        keyLight.add(keyLightHelper);

        // Fill Light
        const fillLight = new THREE.RectAreaLight(0xffffff, 10);
        fillLight.position.set(-10, 15, -10);
        fillLight.rotation.set(
            THREE.MathUtils.degToRad(0),
            THREE.MathUtils.degToRad(238),
            THREE.MathUtils.degToRad(0)
        );
        scene.add(fillLight);
        // Visual helper for fill light
        const fillLightHelper = new RectAreaLightHelper(fillLight);
        keyLight.add(fillLightHelper);

        // Back Light
        const backLight = new THREE.RectAreaLight(0xffffff, 5);
        backLight.position.set(0.7, 21, 8);
        backLight.rotation.set(
            THREE.MathUtils.degToRad(306),
            THREE.MathUtils.degToRad(0),
            THREE.MathUtils.degToRad(0)
        );
        scene.add(backLight);
        // Visual helper for back light
        const backLightHelper = new RectAreaLightHelper(backLight);
        keyLight.add(backLightHelper);

        // Add three-point lights to GUI
        const threePointFolder = gui.addFolder('Three Point Lights');

        // --- Rotation wrappers for GUI (degrees) ---
        const keyLightRotation = {
            x: THREE.MathUtils.radToDeg(keyLight.rotation.x),
            y: THREE.MathUtils.radToDeg(keyLight.rotation.y),
            z: THREE.MathUtils.radToDeg(keyLight.rotation.z)
        };

        const fillLightRotation = {
            x: THREE.MathUtils.radToDeg(fillLight.rotation.x),
            y: THREE.MathUtils.radToDeg(fillLight.rotation.y),
            z: THREE.MathUtils.radToDeg(fillLight.rotation.z)
        };

        const backLightRotation = {
            x: THREE.MathUtils.radToDeg(backLight.rotation.x),
            y: THREE.MathUtils.radToDeg(backLight.rotation.y),
            z: THREE.MathUtils.radToDeg(backLight.rotation.z)
        };

        // --- GUI Setup ---
        const keyFolder = threePointFolder.addFolder('Key Light');
        keyFolder.add(keyLight.position, 'x', -30, 30, 0.1).name('X');
        keyFolder.add(keyLight.position, 'y', -30, 30, 0.1).name('Y');
        keyFolder.add(keyLight.position, 'z', -30, 30, 0.1).name('Z');
        keyFolder.add(keyLight, 'intensity', 0, 100, 0.01).name('Intensity');
        keyFolder.add(keyLightRotation, 'x', 0, 360, 1).name('Rot X (deg)').onChange(v => keyLight.rotation.x = THREE.MathUtils.degToRad(v));
        keyFolder.add(keyLightRotation, 'y', 0, 360, 1).name('Rot Y (deg)').onChange(v => keyLight.rotation.y = THREE.MathUtils.degToRad(v));
        keyFolder.add(keyLightRotation, 'z', 0, 360, 1).name('Rot Z (deg)').onChange(v => keyLight.rotation.z = THREE.MathUtils.degToRad(v));

        const fillFolder = threePointFolder.addFolder('Fill Light');
        fillFolder.add(fillLight.position, 'x', -30, 30, 0.1).name('X');
        fillFolder.add(fillLight.position, 'y', -30, 30, 0.1).name('Y');
        fillFolder.add(fillLight.position, 'z', -30, 30, 0.1).name('Z');
        fillFolder.add(fillLight, 'intensity', 0, 50, 0.01).name('Intensity');
        fillFolder.add(fillLightRotation, 'x', 0, 360, 1).name('Rot X (deg)').onChange(v => fillLight.rotation.x = THREE.MathUtils.degToRad(v));
        fillFolder.add(fillLightRotation, 'y', 0, 360, 1).name('Rot Y (deg)').onChange(v => fillLight.rotation.y = THREE.MathUtils.degToRad(v));
        fillFolder.add(fillLightRotation, 'z', 0, 360, 1).name('Rot Z (deg)').onChange(v => fillLight.rotation.z = THREE.MathUtils.degToRad(v));

        const backFolder = threePointFolder.addFolder('Back Light');
        backFolder.add(backLight.position, 'x', -30, 30, 0.1).name('X');
        backFolder.add(backLight.position, 'y', -30, 30, 0.1).name('Y');
        backFolder.add(backLight.position, 'z', -30, 30, 0.1).name('Z');
        backFolder.add(backLight, 'intensity', 0, 20, 0.01).name('Intensity');
        backFolder.add(backLightRotation, 'x', 0, 360, 1).name('Rot X (deg)').onChange(v => backLight.rotation.x = THREE.MathUtils.degToRad(v));
        backFolder.add(backLightRotation, 'y', 0, 360, 1).name('Rot Y (deg)').onChange(v => backLight.rotation.y = THREE.MathUtils.degToRad(v));
        backFolder.add(backLightRotation, 'z', 0, 360, 1).name('Rot Z (deg)').onChange(v => backLight.rotation.z = THREE.MathUtils.degToRad(v));

        threePointFolder.open();

        // Add lighting controls to the GUI
        const lightFolder = gui.addFolder('Lighting');
        lightFolder.add(ambientLight, 'intensity', 0, 2, 0.01).name('Ambient Intensity');
        lightFolder.add(directionalLight, 'intensity', 0, 2, 0.01).name('Sun Intensity');


        // --- ENVIRONMENT & GUI (PART 2) (MODIFIED SECTION) ---------------
        const rgbeLoader = new RGBELoader();
        rgbeLoader.load('./bloem_field_sunrise_1k.hdr', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;

            // Set lighting and initial background
            scene.environment = texture;
            scene.background = new THREE.Color(backgroundControls.color);
            console.log('HDRI loaded and applied.');

            // *** NOW that the texture is loaded, we can create the GUI for it ***
            const backgroundFolder = gui.addFolder('Background');
            backgroundFolder.add(backgroundControls, 'showHdri').name('Show HDRI Background')
                .onChange((show) => {
                    if (show) {
                        scene.background = texture; // Use the loaded texture
                    } else {
                        scene.background = new THREE.Color(backgroundControls.color);
                    }
                });
            backgroundFolder.addColor(backgroundControls, 'color').name('BG Color')
                .onChange((colorValue) => {
                    if (!backgroundControls.showHdri) {
                        scene.background = new THREE.Color(colorValue);
                    }
                });
        });


        // --- MODEL LOADING -------------------------------------------------
        const gltfLoader = new GLTFLoader();

        // --- Store loaded model in variable --------------------------------
        let modelGroup = null;

        gltfLoader.load(
            'floating_island.glb',
            (gltf) => {
                console.log('Success! Model loaded.', gltf);
                modelGroup = gltf.scene;
                scene.add(modelGroup);

                // Make key light look at the model's position
                keyLight.lookAt(modelGroup.position);
                fillLight.lookAt(modelGroup.position);
                backLight.lookAt(modelGroup.position);
            }
        );



        // --- ANIMATION LOOP ------------------------------------------------
        const animate = () => {
            controls.update();

            // Animate model rotation if loaded
            if (modelGroup) {
                const time = performance.now() * 0.001; // seconds
                // Oscillate between -PI/8 and +PI/8 with ease in/out
                modelGroup.rotation.y = Math.sin(time) * (Math.PI / 8);
            }

            renderer.render(scene, camera);
            window.requestAnimationFrame(animate);
        };
        animate();

        // --- RESPONSIVENESS ------------------------------------------------
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });