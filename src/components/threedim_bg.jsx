import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const ThreedimBg = () => {
  const mountRef = useRef(null);
  const modelRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 3);
    camera.lookAt(0, -32, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add mixer reference
    let mixer;
    const clock = new THREE.Clock();

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x000000);
    scene.add(ambientLight);

    const spotLight1 = new THREE.SpotLight(0x00ff00, 2);
    spotLight1.position.set(0, 10, 0);
    spotLight1.angle = Math.PI / 6;
    spotLight1.penumbra = 0.3;
    scene.add(spotLight1);

    const rimLight = new THREE.DirectionalLight(0x00ff00, 0.5);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    // Set up OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.enablePan = false;
    controlsRef.current = controls;

    let isUserInteracting = false;

    // Add interaction handlers
    const handleInteractionStart = () => {
      isUserInteracting = true;
    };

    const handleInteractionEnd = () => {
      isUserInteracting = false;
    };

    renderer.domElement.addEventListener("mousedown", handleInteractionStart);
    renderer.domElement.addEventListener("mouseup", handleInteractionEnd);
    renderer.domElement.addEventListener("touchstart", handleInteractionStart);
    renderer.domElement.addEventListener("touchend", handleInteractionEnd);

    // Create a clock for timing
    // const clock = new THREE.Clock();

    // Set up model group for rotation
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Model loading
    const loader = new GLTFLoader();
    loader.load(
      "/matrix_void.glb",
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        modelGroup.add(model);

        // Center and position the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());

        model.position.set(0, 0, 0); // Reset Y position
        model.position.x -= center.x;
        model.position.z -= center.z;

        console.log("Model position:", model.position);
        console.log("Model scale:", model.scale);

        // Set up animations
        mixer = new THREE.AnimationMixer(model);
        const clips = gltf.animations;
        clips.forEach((clip) => {
          mixer.clipAction(clip).play();
        });

        // Update OrbitControls target
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
        }
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("An error occurred loading the model:", error);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();

      if (!isUserInteracting && modelGroup) {
        modelGroup.rotation.y += 0.001;
      }

      if (mixer) {
        mixer.update(delta);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <div className="w-full h-full overflow-hidden">
        <div ref={mountRef} className="three-container"></div>
      </div>
    </>
  );
};

export default ThreedimBg;
