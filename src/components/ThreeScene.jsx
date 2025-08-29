// src/components/ThreeScene.jsx
import { useEffect, useRef, useState, memo } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useParams, useNavigate } from 'react-router-dom';

const isMobile = () => {
  return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth <= 768;
};

// Configuration
const CAMERA_CONFIG = {
  position: { x: 0.85, y: 2.7, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  fov: isMobile() ? 110 : 70,
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
    position: { x: -0.3, y: 2.6, z: 0 }, 
    rotation: { x: 0, y: 0, z: 0 } 
  },
  bookcenter: { 
    position: { x: -0.3, y: 2.6, z: 0 }, 
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

// Tooltip configuration
const TOOLTIP_CONFIG = {
  Book: "Open the first chapter of Floch Forster OVA",
  Coffee: "Buy me a coffee ♥",
  Note1: "Check the Note",
  Note2: "Check the Social Credit"
};

let GLOWABLE_OBJECTS = ["Book", "Coffee", "Note1", "Note2"];

const ThreeScene = ({ onNote1Click, onNote2Click, onBookClick, onCoffeeClick, onBackHome }) => {
  const navigate = useNavigate();
  const targetCameraConfig = useRef({
    position: new THREE.Vector3(CAMERA_CONFIG.position.x, CAMERA_CONFIG.position.y, CAMERA_CONFIG.position.z),
    rotation: new THREE.Euler(CAMERA_CONFIG.rotation.x, CAMERA_CONFIG.rotation.y, CAMERA_CONFIG.rotation.z)
  });
  const isTransitioning = useRef(false);
  const currentCameraLockRef = useRef("cube"); // Use ref instead of state to avoid re-renders
  const [enableCursorFollow, setEnableCursorFollow] = useState(true);
  const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });
  const lookAtTargetRef = useRef(null);
  const mountRef = useRef();
  const sceneObjectsRef = useRef({});
  
  // Keep track of the interactive object for back home functionality
  const interactiveObjectRef = useRef(null);

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
    if (targetKey === "book"){
      setTimeout(() => navigate('/manga'), 3000);
    }
  };

  // Handle back home - this will NOT recreate the scene
  useEffect(() => {
    if (onBackHome) {
      // Reset the global state
      GLOWABLE_OBJECTS = ["Book", "Coffee", "Note1", "Note2"];
      currentCameraLockRef.current = "cube";
      setEnableCursorFollow(true);
      setTooltip({ visible: false, text: "", x: 0, y: 0 });
      
      // Find cube object and set it as lookAt target
      if (interactiveObjectRef.current) {
        interactiveObjectRef.current.traverse((child) => {
          if (child.name && child.name.toLowerCase().includes("cube")) {
            lookAtTargetRef.current = child;
          }
        });
      }
      
      transitionToPosition("cube");
    }
  }, [onBackHome]);

  // Main scene setup - removed currentCameraLock from dependencies
  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      CAMERA_CONFIG.fov,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      CAMERA_CONFIG.near,
      CAMERA_CONFIG.far
    );

    // Clean previous canvas if any - with better error handling
    if (mountRef.current) {
      // Create a copy of children to avoid live NodeList issues
      const children = Array.from(mountRef.current.children);
      children.forEach(child => {
        try {
          if (mountRef.current.contains(child)) {
            mountRef.current.removeChild(child);
          }
        } catch (error) {
          console.warn('Error removing child node:', error);
        }
      });
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
    scene.add(new THREE.AmbientLight(0x2B334E, 0.6));
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
      interactiveObjectRef.current = interactiveObject;

      interactiveObject.traverse((child) => {
        if (child.isMesh) {
          originalMaterials.set(child, child.material.clone());
        }
        // Set initial lookAt target based on current camera lock
        if (child.name && child.name.toLowerCase().includes(currentCameraLockRef.current)) {
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
      
      // Update tooltip position
      setTooltip(prev => ({
        ...prev,
        x: event.clientX,
        y: event.clientY
      }));
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
              currentCameraLockRef.current = "note1";
              transitionToPosition("note1", targetObject);
              setTooltip({ visible: false, text: "", x: 0, y: 0 });
              onNote1Click?.();
              break;
            case "Note2":
              GLOWABLE_OBJECTS = [];
              currentCameraLockRef.current = "note2";
              transitionToPosition("note2", targetObject);
              setTooltip({ visible: false, text: "", x: 0, y: 0 });
              onNote2Click?.();
              break;
            case "Book":
              GLOWABLE_OBJECTS = [];
              currentCameraLockRef.current = "book";
              transitionToPosition("book", null); // Don't set lookAt target for book
              setEnableCursorFollow(false);
              setTooltip({ visible: false, text: "", x: 0, y: 0 });
              onBookClick?.();
              break;
            case "Coffee":
              setTooltip({ visible: false, text: "", x: 0, y: 0 });
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

    const getObjectName = (object) => {
      if (object.name) {
        const foundObject = GLOWABLE_OBJECTS.find(name => 
          object.name.toLowerCase().includes(name.toLowerCase())
        );
        if (foundObject) return foundObject;
      }
      let parent = object.parent;
      while (parent) {
        if (parent.name) {
          const foundObject = GLOWABLE_OBJECTS.find(name => 
            parent.name.toLowerCase().includes(name.toLowerCase())
          );
          if (foundObject) return foundObject;
        }
        parent = parent.parent;
      }
      return null;
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
      } else if (enableCursorFollow) {
        // Only apply mouse hover effects when not transitioning AND cursor following is enabled
        const targetOffsetY = mouse.y * MOUSE_CONFIG.maxRotation;
        const targetOffsetX = mouse.x * MOUSE_CONFIG.maxRotation;

        // Get the base position for current camera lock
        const basePosition = CAMERA_POSITIONS[currentCameraLockRef.current] || CAMERA_POSITIONS.cube;
        
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

            // Show tooltip
            const objectName = getObjectName(intersected);
            if (objectName && TOOLTIP_CONFIG[objectName]) {
              setTooltip(prev => ({
                ...prev,
                visible: true,
                text: TOOLTIP_CONFIG[objectName]
              }));
            }

            isHovering = true;
            renderer.domElement.style.cursor = "pointer";
          } else {
            if (isHovering) {
              isHovering = false;
              if (hoveredObject) removeGlowEffect(hoveredObject);
              hoveredObject = null;
              renderer.domElement.style.cursor = "default";
              setTooltip(prev => ({ ...prev, visible: false }));
            }
          }
        } else {
          if (isHovering) {
            isHovering = false;
            if (hoveredObject) removeGlowEffect(hoveredObject);
            hoveredObject = null;
            renderer.domElement.style.cursor = "default";
            setTooltip(prev => ({ ...prev, visible: false }));
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
      if (renderer.domElement) {
        renderer.domElement.removeEventListener("click", onMouseClick);
      }
      
      // Safe cleanup
      if (mountRef.current && renderer.domElement) {
        try {
          if (mountRef.current.contains(renderer.domElement)) {
            mountRef.current.removeChild(renderer.domElement);
          }
        } catch (error) {
          console.warn('Error during cleanup:', error);
        }
      }
      
      renderer.dispose();
      scene.clear();
      originalMaterials.clear();
      sceneObjectsRef.current = {};
      interactiveObjectRef.current = null;
    };
  }, [enableCursorFollow, onNote1Click, onNote2Click, onBookClick, onCoffeeClick]); // Removed currentCameraLock

  return (
    <div className="w-full h-screen z-10 relative" ref={mountRef}>
      {/* Tooltip */}
      {tooltip.visible && (
        <div 
          className="absolute bg-black bg-opacity-80 text-white px-3 py-2 rounded-lg text-sm pointer-events-none z-50 transition-opacity duration-200"
          style={{ 
            left: tooltip.x + 10, 
            top: tooltip.y - 35,
            transform: 'translateX(-50%)'
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

export default memo(ThreeScene);