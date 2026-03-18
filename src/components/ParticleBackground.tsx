import { useEffect, useRef } from 'react';
import { useAdaptiveExperience } from '../hooks/useAdaptiveExperience';

export default function ParticleBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { allowHeavyBackgrounds, allowPointerEffects } = useAdaptiveExperience();

  useEffect(() => {
    if (!allowHeavyBackgrounds || !mountRef.current) {
      return;
    }

    let disposed = false;
    let animationFrameId = 0;
    let cleanup = () => undefined;

    void (async () => {
      const THREE = await import('three');
      if (disposed || !mountRef.current) {
        return;
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 135;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
      mountRef.current.appendChild(renderer.domElement);

      const particleCount = window.innerWidth < 1200 ? 700 : 1100;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      const phases = new Float32Array(particleCount);
      const colorPalette = [
        new THREE.Color('#00d4ff'),
        new THREE.Color('#00ff88'),
        new THREE.Color('#7dd3fc'),
      ];

      for (let index = 0; index < particleCount; index += 1) {
        const radius = 80 + Math.random() * 115;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];

        positions[index * 3] = x;
        positions[index * 3 + 1] = y;
        positions[index * 3 + 2] = z;
        colors[index * 3] = color.r;
        colors[index * 3 + 1] = color.g;
        colors[index * 3 + 2] = color.b;
        sizes[index] = Math.random() * 1.6 + 0.55;
        phases[index] = Math.random() * Math.PI * 2;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          mouse: { value: new THREE.Vector3(999, 999, 999) },
        },
        vertexShader: `
          uniform float time;
          uniform vec3 mouse;
          attribute float size;
          attribute float phase;
          attribute vec3 color;
          varying vec3 vColor;

          void main() {
            vColor = color;
            vec3 pos = position;
            pos.x += sin(time * 1.8 + phase) * 12.0;
            pos.y += cos(time * 1.5 + phase * 1.3) * 10.0;
            pos.z += sin(time * 1.2 + phase) * 9.0;

            float dist = distance(pos, mouse);
            if (dist < 36.0) {
              vec3 dir = normalize(pos - mouse);
              pos += dir * (36.0 - dist) * 0.22;
            }

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (175.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            float dist = distance(gl_PointCoord, vec2(0.5));
            if (dist > 0.5) discard;
            float alpha = smoothstep(0.5, 0.08, dist);
            gl_FragColor = vec4(vColor, alpha * 0.62);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      const raycaster = new THREE.Raycaster();
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const mouse = new THREE.Vector2();
      const targetMouse = new THREE.Vector3(999, 999, 999);
      const clock = new THREE.Clock();
      let lastRenderTime = 0;
      let isVisible = !document.hidden;

      const handleMouseMove = (event: MouseEvent) => {
        if (!allowPointerEffects) {
          return;
        }

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(plane, targetMouse);
      };

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
      };

      const handleVisibilityChange = () => {
        isVisible = !document.hidden;
        if (isVisible) {
          clock.start();
          animationFrameId = window.requestAnimationFrame(animate);
        } else if (animationFrameId) {
          window.cancelAnimationFrame(animationFrameId);
        }
      };

      const animate = () => {
        if (!isVisible) {
          return;
        }

        const elapsed = clock.getElapsedTime();
        if (elapsed - lastRenderTime < 1 / 32) {
          animationFrameId = window.requestAnimationFrame(animate);
          return;
        }

        lastRenderTime = elapsed;
        material.uniforms.time.value = elapsed;
        material.uniforms.mouse.value.lerp(targetMouse, 0.09);
        particles.rotation.y = elapsed * 0.08;
        particles.rotation.x = Math.sin(elapsed * 0.25) * 0.08;
        renderer.render(scene, camera);
        animationFrameId = window.requestAnimationFrame(animate);
      };

      if (allowPointerEffects) {
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
      }
      window.addEventListener('resize', handleResize);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      animationFrameId = window.requestAnimationFrame(animate);

      cleanup = () => {
        if (allowPointerEffects) {
          window.removeEventListener('mousemove', handleMouseMove);
        }
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (animationFrameId) {
          window.cancelAnimationFrame(animationFrameId);
        }
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (mountRef.current?.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [allowHeavyBackgrounds, allowPointerEffects]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(circle at 20% 20%, rgba(0,212,255,0.08), transparent 34%), radial-gradient(circle at 78% 24%, rgba(0,255,136,0.05), transparent 28%), linear-gradient(180deg, rgba(8,10,12,0.18), rgba(8,10,12,0.82))',
      }}
    />
  );
}
