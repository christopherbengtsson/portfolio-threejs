varying vec2 vUv;

uniform float time;

// Simply passes the UV coordinates to the fragment shader
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
