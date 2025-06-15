// src/components/ThreeScene.jsx
import { useEffect, useRef, useState, memo } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Configuration
const CAMERA_CONFIG = {
  position: { x: 0.85, y: 2.7, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  fov: 70,
  near: 0.2,
  far: 1000
};

// Camera positions for different objects
const CAMERA_POSITIONS = {
  cube: { 
    position: { x: 0.05, y: 2.7, z: 0 }, 
    rotation: { x: 0, y: 0, z: 0 } 
  },
  note1: { 
    position: { x: -0.7, y: 2.4, z: 0 }, 
    rotation: { x: 0, y: 0, z: 0 } 
  },
  note2: { 
    position: { x: -0.7, y: 2.5, z: -0.1 }, 
    rotation: { x: 0, y: 0, z: 0 } 
  },
  book: { 
    position: { x: 0.3, y: 2.5, z: 0.2 }, 
    rotation: { x: 0, y: 0, z: 0 } 
  },
  coffee: { 
    position: { x: -0.2, y: 2.3, z: 0.4 }, 
    rotation: { x: 0, y: 0, z: 0 } 
  }
};

const MOUSE_CONFIG = {
  maxRotation: 0.1,
  sensitivity: 1
};

const GLOW_CONFIG = {
  color: 0x00ffff,
  intensity: 0,
  distance: 1,
  decay: 0
};

const TRANSITION_CONFIG = {
  speed: 0.03, // Lower = slower transition
  threshold: 0.01 // Distance threshold to stop transition
};

let GLOWABLE_OBJECTS = ["Book", "Coffee", "Note1", "Note2"];

const ThreeScene = ({ onNote1Click, onNote2Click, onBookClick, onCoffeeClick, onBackHome }) => {
  const targetCameraConfig = useRef({
    position: new THREE.Vector3(CAMERA_CONFIG.position.x, CAMERA_CONFIG.position.y, CAMERA_CONFIG.position.z),
    rotation: new THREE.Euler(CAMERA_CONFIG.rotation.x, CAMERA_CONFIG.rotation.y, CAMERA_CONFIG.rotation.z)
  });
  const isTransitioning = useRef(false);
  const [currentCameraLock, setCurrentCameraLock] = useState("cube");
  const lookAtTargetRef = useRef(null);
  const mountRef = useRef();
  const sceneObjectsRef = useRef({});

  // Function to smoothly transition camera to target position
  const transitionToPosition = (targetKey, targetObject = null) => {
    const target = CAMERA_POSITIONS[targetKey];
    if (!target) return;

    // Immediately lock camera to the target object
    if (targetObject) {
      lookAtTargetRef.current = targetObject;
    }

    targetCameraConfig.current.position.set(target.position.x, target.position.y, target.position.z);
    targetCameraConfig.current.rotation.set(target.rotation.x, target.rotation.y, target.rotation.z);
    isTransitioning.current = true;
  };

  useEffect(() => {
    if (onBackHome) {
      GLOWABLE_OBJECTS = ["Book", "Coffee", "Note1", "Note2"];
      setCurrentCameraLock("cube");
      transitionToPosition("cube");
    }
  }, [onBackHome]);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      CAMERA_CONFIG.fov,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      CAMERA_CONFIG.near,
      CAMERA_CONFIG.far
    );

    // Clean previous canvas if any
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.set(
      CAMERA_CONFIG.position.x,
      CAMERA_CONFIG.position.y,
      CAMERA_CONFIG.position.z
    );
    camera.rotation.set(
      CAMERA_CONFIG.rotation.x,
      CAMERA_CONFIG.rotation.y,
      CAMERA_CONFIG.rotation.z
    );

    // Lights
    scene.add(new THREE.AmbientLight(0x9BC09C, 0.6));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const glowLight = new THREE.PointLight(
      GLOW_CONFIG.color, 0, GLOW_CONFIG.distance, GLOW_CONFIG.decay
    );
    scene.add(glowLight);

    // Load model
    const loader = new GLTFLoader();
    let interactiveObject;
    const originalMaterials = new Map();

    loader.load("/model.glb", (gltf) => {
      interactiveObject = gltf.scene;

      interactiveObject.traverse((child) => {
        if (child.isMesh) {
          originalMaterials.set(child, child.material.clone());
        }
        // Set initial lookAt target based on current camera lock
        if (child.name && child.name.toLowerCase().includes(currentCameraLock)) {
          lookAtTargetRef.current = child;
        }
      });

      scene.add(interactiveObject);
    });

    // Raycasting setup
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isHovering = false;
    let hoveredObject = null;

    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    // Click handler
    const onMouseClick = (event) => {
      if (!interactiveObject) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const clickMouse = new THREE.Vector2();
      clickMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      clickMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(clickMouse, camera);
      const intersects = raycaster.intersectObject(interactiveObject, true);

      if (intersects.length > 0) {
        const intersected = intersects[0].object;
        
        if (shouldObjectGlow(intersected)) {
          // Find the root object name for the clicked item
          let targetObject = intersected;
          let objectName = null;

          // Check the clicked object and its parents for a recognizable name
          while (targetObject) {
            if (targetObject.name) {
              const foundObject = GLOWABLE_OBJECTS.find(name => 
                targetObject.name.toLowerCase().includes(name.toLowerCase())
              );
              if (foundObject) {
                objectName = foundObject;
                break;
              }
            }
            targetObject = targetObject.parent;
            if (targetObject === interactiveObject) break;
          }

          // Call the appropriate handler and transition camera based on the object name
          switch(objectName) {
            case "Note1":
              GLOWABLE_OBJECTS = [];
              setCurrentCameraLock("note1");
              transitionToPosition("note1", targetObject);
              onNote1Click?.();
              break;
            case "Note2":
              GLOWABLE_OBJECTS = [];
              setCurrentCameraLock("note2");
              transitionToPosition("note2", targetObject);
              onNote2Click?.();
              break;
            case "Book":
              GLOWABLE_OBJECTS = [];
              setCurrentCameraLock("book");
              transitionToPosition("book", targetObject);
              onBookClick?.();
              break;
            case "Coffee":
              onCoffeeClick?.();
              break;
          }
        }
      }
    };
  
    // Glow logic
    const createGlowMaterial = (originalMaterial) => {
      return new THREE.MeshStandardMaterial({
        color: originalMaterial.color,
        emissive: new THREE.Color(GLOW_CONFIG.color),
        emissiveIntensity: 0.3,
        metalness: originalMaterial.metalness ?? 0,
        roughness: originalMaterial.roughness ?? 0.5,
        transparent: true,
        opacity: 0.9
      });
    };

    const applyGlowEffect = (object) => {
      object.traverse((child) => {
        if (child.isMesh && originalMaterials.has(child)) {
          child.material = createGlowMaterial(originalMaterials.get(child));
        }
      });

      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      glowLight.position.copy(center);
      glowLight.intensity = GLOW_CONFIG.intensity;
    };

    const removeGlowEffect = (object) => {
      object.traverse((child) => {
        if (child.isMesh && originalMaterials.has(child)) {
          child.material = originalMaterials.get(child);
        }
      });
      glowLight.intensity = 0;
    };

    const shouldObjectGlow = (object) => {
      if (object.name && GLOWABLE_OBJECTS.some(name => object.name.toLowerCase().includes(name.toLowerCase()))) return true;
      let parent = object.parent;
      while (parent) {
        if (parent.name && GLOWABLE_OBJECTS.some(name => parent.name.toLowerCase().includes(name.toLowerCase()))) return true;
        parent = parent.parent;
      }
      return false;
    };

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Always make camera look at the current target if it exists
      if (lookAtTargetRef.current) {
        const targetPosition = new THREE.Vector3();
        lookAtTargetRef.current.getWorldPosition(targetPosition);
        camera.lookAt(targetPosition);
      }
      
      // Handle camera transitions
      if (isTransitioning.current) {
        // Interpolate position only during transition
        camera.position.lerp(targetCameraConfig.current.position, TRANSITION_CONFIG.speed);

        // Check if transition is complete (only check position since rotation is handled by lookAt)
        const positionDistance = camera.position.distanceTo(targetCameraConfig.current.position);

        if (positionDistance < TRANSITION_CONFIG.threshold) {
          camera.position.copy(targetCameraConfig.current.position);
          isTransitioning.current = false;
        }
      } else {
        // Only apply mouse hover effects when not transitioning
        const targetOffsetY = mouse.y * MOUSE_CONFIG.maxRotation;
        const targetOffsetX = mouse.x * MOUSE_CONFIG.maxRotation;

        // Get the base position for current camera lock
        const basePosition = CAMERA_POSITIONS[currentCameraLock] || CAMERA_POSITIONS.cube;
        
        // Smoothly interpolate camera position with mouse offset
        camera.position.x = THREE.MathUtils.lerp(
          camera.position.x, 
          basePosition.position.x + targetOffsetX, 
          0.05
        );
        camera.position.y = THREE.MathUtils.lerp(
          camera.position.y, 
          basePosition.position.y + targetOffsetY, 
          0.05
        );
      }

      // Handle object hovering and glow effects
      if (interactiveObject) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(interactiveObject, true);

        if (intersects.length > 0) {
          const intersected = intersects[0].object;

          if (shouldObjectGlow(intersected)) {
            let root = intersected;
            while (root.parent && root.parent !== interactiveObject) {
              root = root.parent;
            }

            if (hoveredObject !== root) {
              if (hoveredObject) removeGlowEffect(hoveredObject);
              applyGlowEffect(root);
              hoveredObject = root;
            }

            isHovering = true;
            renderer.domElement.style.cursor = "pointer";
          } else {
            if (isHovering) {
              isHovering = false;
              if (hoveredObject) removeGlowEffect(hoveredObject);
              hoveredObject = null;
              renderer.domElement.style.cursor = "default";
            }
          }
        } else {
          if (isHovering) {
            isHovering = false;
            if (hoveredObject) removeGlowEffect(hoveredObject);
            hoveredObject = null;
            renderer.domElement.style.cursor = "default";
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("click", onMouseClick);

    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", onMouseClick);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
      originalMaterials.clear();
      sceneObjectsRef.current = {};
    };
  }, [currentCameraLock, onNote1Click, onNote2Click, onBookClick, onCoffeeClick]);

  return <div className="w-full h-screen z-10" ref={mountRef}/>;
}

export default memo(ThreeScene);