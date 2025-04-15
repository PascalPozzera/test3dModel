// smoothTileBlendShader.ts
import * as THREE from 'three';

export const createSmoothTileMaterial = (
    grassTexture: THREE.Texture,
    desertTexture: THREE.Texture,
    blend: number
) => {
    return new THREE.ShaderMaterial({
        uniforms: {
            grassTex: { value: grassTexture },
            desertTex: { value: desertTexture },
            blendFactor: { value: blend },
            time: { value: 0.0 },
        },
        vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      uniform sampler2D grassTex;
      uniform sampler2D desertTex;
      uniform float blendFactor;
      varying vec2 vUv;

      // Simple noise function
      float rand(vec2 co){
          return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }

      void main() {
        vec4 grass = texture2D(grassTex, vUv);
        vec4 desert = texture2D(desertTex, vUv);

        // Radial blending from center
        float radial = smoothstep(0.25, 0.75, length(vUv - vec2(0.5)));

        // Add subtle noise to the blend
        float noise = rand(vUv * 40.0) * 0.25;

        float finalBlend = clamp(blendFactor * (radial + noise), 0.0, 1.0);

        gl_FragColor = mix(desert, grass, finalBlend);
      }
    `
    });
};