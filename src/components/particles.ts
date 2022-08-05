import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Float32BufferAttribute,
  Points,
  ShaderMaterial,
  TextureLoader,
} from 'three';

import particleFrag from '../shaders/particle_frag.frag';
import particleVert from '../shaders/particle_vert.vert';

export function createParticleSystem() {
  const shaderMaterial = new ShaderMaterial({
    uniforms: {
      pointTexture: { value: new TextureLoader().load('assets/spark1.png') },
    },
    vertexShader: particleVert,
    fragmentShader: particleFrag,
    blending: AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true,
  });
  const geometry = new BufferGeometry();
  const particles = 5000;
  const radius = 600;
  const positions: number[] = [];
  const colors: number[] = [];
  const sizes: number[] = [];
  const color = new Color();

  for (let i = 0; i < particles * 3; i++) {
    positions.push((Math.random() * 2 - 1) * radius);
    positions.push((Math.random() * 2 - 1) * radius);
    positions.push((Math.random() * 2 - 1) * radius);

    color.setHSL(i / particles, 1.0, 0.5);

    colors.push(color.r, color.g, color.b);

    sizes.push(5);
  }

  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.setAttribute('size', new Float32BufferAttribute(sizes, 1).setUsage(DynamicDrawUsage));

  return new Points(geometry, shaderMaterial);
}
