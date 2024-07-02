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

import particleFrag from '../shaders/particle.frag';
import particleVert from '../shaders/particle.vert';

import sprite from '../../assets/spark1.png';

const particles = 5000;
export const particleSystem = createParticleSystem();

function createParticleSystem() {
  const shaderMaterial = new ShaderMaterial({
    uniforms: {
      pointTexture: { value: new TextureLoader().load(sprite) },
    },
    vertexShader: particleVert,
    fragmentShader: particleFrag,
    blending: AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true,
  });

  const geometry = new BufferGeometry();
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

export function animateParticles(isScrolling: boolean, delta: number) {
  if (isScrolling) particleSystem.rotation.z -= delta / 10000;

  const time = (Date.now() * 0.005) / 2;
  const sizes = particleSystem.geometry.attributes.size.array as unknown as Array<number>;

  for (let i = 0; i < particles; i++) {
    sizes[i] = 5 * (1 + Math.sin(0.1 * i + time));
  }
  particleSystem.geometry.attributes.size.needsUpdate = true;
}
