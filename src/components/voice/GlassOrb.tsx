'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { fragmentShader, vertexShader } from './glassOrbShader';

interface GlassOrbProps {
  analyser: AnalyserNode | null;
  className?: string;
}

export default function GlassOrb({ analyser, className }: GlassOrbProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const palette = useMemo(() => {
    // Lumina palette (tuned to mimic glossy orb look)
    return {
      highlight: new THREE.Color('#3B82F6'), // blue
      base: new THREE.Color('#D4AF37'), // gold
      accent: new THREE.Color('#F08336'), // orange
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1.35, 6);

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uFrequency: { value: 0.55 },
        uAmplitude: { value: 0.15 },
        uIntensity: { value: 0.0 },
        uColor1: { value: palette.highlight },
        uColor2: { value: palette.base },
        uColor3: { value: palette.accent },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Soft outer glow shell (additive)
    const glowMat = material.clone();
    glowMat.blending = THREE.AdditiveBlending;
    (glowMat.uniforms.uAmplitude.value as number) = 0.10;
    (glowMat.uniforms.uFrequency.value as number) = 0.45;
    const glowMesh = new THREE.Mesh(geometry, glowMat);
    glowMesh.scale.setScalar(1.06);
    scene.add(glowMesh);

    const clock = new THREE.Clock();
    const baseArr = new Uint8Array(256);

    const resizeToHost = () => {
      const w = Math.max(1, host.clientWidth);
      const h = Math.max(1, host.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    resizeToHost();
    const ro = new ResizeObserver(() => resizeToHost());
    ro.observe(host);

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      // Audio intensity (0..1)
      let intensity = 0;
      if (analyser) {
        const len = analyser.frequencyBinCount;
        const arr = len === baseArr.length ? baseArr : new Uint8Array(len);
        analyser.getByteFrequencyData(arr);
        let sum = 0;
        for (let i = 0; i < arr.length; i++) sum += arr[i] ?? 0;
        const avg = sum / Math.max(1, arr.length);
        intensity = Math.min(1, avg / 160);
      }

      // Smooth drive
      const uTime = material.uniforms.uTime;
      const uIntensity = material.uniforms.uIntensity;
      uTime.value = t;
      uIntensity.value += (intensity - uIntensity.value) * 0.18;
      glowMat.uniforms.uTime.value = t;
      glowMat.uniforms.uIntensity.value = uIntensity.value;

      // Reactivity: more "liquid" when loud
      const targetAmp = 0.15 + uIntensity.value * 0.28;
      const targetFreq = 0.55 + uIntensity.value * 0.65;
      material.uniforms.uAmplitude.value += (targetAmp - material.uniforms.uAmplitude.value) * 0.14;
      material.uniforms.uFrequency.value += (targetFreq - material.uniforms.uFrequency.value) * 0.14;

      // Gentle rotation like reference
      mesh.rotation.y = t * 0.22;
      mesh.rotation.x = t * 0.10;
      glowMesh.rotation.copy(mesh.rotation);

      renderer.render(scene, camera);
    };

    tick();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      ro.disconnect();
      try { host.removeChild(renderer.domElement); } catch {}
      geometry.dispose();
      material.dispose();
      glowMat.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, [analyser, palette]);

  return <div ref={hostRef} className={className} />;
}

