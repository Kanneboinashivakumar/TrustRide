import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { cn } from '@/utils/cn';

interface SargamERickshawHero3DProps {
  className?: string;
}

export const SargamERickshawHero3D: React.FC<SargamERickshawHero3DProps> = ({ className }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 650;
    const height = mount.clientHeight || 540;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000);
    camera.position.set(4.2, 1.8, 5.2);
    camera.lookAt(-0.1, 0.1, 0);

    // Renderer — fully transparent canvas
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Lighting — Cyan & Deep Blue Holographic Lighting
    scene.add(new THREE.AmbientLight(0x1e3a5f, 1.4));

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.8);
    keyLight.position.set(5, 7, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.8);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    const headlightLight = new THREE.PointLight(0x7dd3fc, 3.0, 15);
    headlightLight.position.set(-0.5, 0.8, 2.2);
    scene.add(headlightLight);

    // Model group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Materials — Holographic Cyan & Deep Blue Wireframe
    const bodyMat = new THREE.MeshBasicMaterial({
      color: 0x061838,
      transparent: true,
      opacity: 0.10,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const wireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8, // Holographic Cyan-Blue Wireframe
      transparent: true,
      opacity: 0.85,
    });

    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x7dd3fc, // Glowing specular rim edges
      transparent: true,
      opacity: 0.65,
    });

    // Load compressed GLB model
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load('/e_rickshaw_fast.glb', (gltf) => {
      const model = gltf.scene;

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = bodyMat;

          // Holographic wireframe mesh
          mesh.add(new THREE.LineSegments(
            new THREE.WireframeGeometry(mesh.geometry), wireMat
          ));

          // Glowing sharp outline edges
          mesh.add(new THREE.LineSegments(
            new THREE.EdgesGeometry(mesh.geometry, 15), edgeMat
          ));
        }
      });

      // Auto-center & scale
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const s = 2.95 / Math.max(size.x, size.y, size.z);
      model.scale.set(s, s, s);
      
      // X: shifted comfortably left (-0.20), Y: moved down (-0.56) as requested
      model.position.set(-center.x * s - 0.20, -box.min.y * s - 0.56, -center.z * s);

      // 35° front-right perspective facing toward the viewer
      modelGroup.rotation.y = 3.55;
      modelGroup.rotation.x = 0.04;
      modelGroup.add(model);
    });

    // Drag rotation (persistent)
    let isDragging = false;
    let prev = { x: 0, y: 0 };
    let rY = 3.55;
    let rX = 0.04;

    const onDown = (e: MouseEvent) => { isDragging = true; prev = { x: e.clientX, y: e.clientY }; };
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      rY += (e.clientX - prev.x) * 0.007;
      rX += (e.clientY - prev.y) * 0.007;
      rX = Math.max(-0.3, Math.min(0.5, rX));
      modelGroup.rotation.y = rY;
      modelGroup.rotation.x = rX;
      prev = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => { isDragging = false; };

    mount.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) { rY += 0.0003; modelGroup.rotation.y = rY; }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('resize', onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className={cn("relative w-full h-[460px] md:h-[540px] cursor-grab active:cursor-grabbing select-none", className)}>
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default SargamERickshawHero3D;
