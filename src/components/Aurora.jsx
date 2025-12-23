import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';
import './Aurora.css';

const VERT = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStop0;
uniform vec3 uColorStop1;
uniform vec3 uColorStop2;
uniform vec2 uResolution;
uniform float uBlend;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// WebGL1 호환: 동적 인덱싱 대신 조건문 사용
vec3 getColorRamp(float factor, vec3 color0, vec3 color1, vec3 color2) {
  if (factor <= 0.5) {
    float t = factor / 0.5;
    return mix(color0, color1, t);
  } else {
    float t = (factor - 0.5) / 0.5;
    return mix(color1, color2, t);
  }
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  vec3 rampColor = getColorRamp(uv.x, uColorStop0, uColorStop1, uColorStop2);
  
  // 오로라 높이 계산 (노이즈 기반)
  float noiseValue = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  float waveHeight = exp(noiseValue);
  
  // 오로라가 화면 하단에서 시작하도록 조정
  float auroraY = 1.0 - uv.y;
  float height = auroraY * 2.0 - waveHeight + 0.3;
  
  // intensity 계산
  float intensity = max(0.0, height) * 1.2;
  
  // 오로라가 부드럽게 나타나도록 alpha 계산
  float midPoint = 0.25;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.4, midPoint + uBlend * 0.6, intensity);
  auroraAlpha = clamp(auroraAlpha, 0.0, 1.0);
  
  // 최종 색상 계산
  vec3 auroraColor = intensity * rampColor * 1.5;
  
  gl_FragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

export default function Aurora(props) {
  const { colorStops = ['#5227FF', '#7cff67', '#5227FF'], amplitude = 1.0, blend = 0.5 } = props;

  const propsRef = useRef(props);
  propsRef.current = props;

  const ctnDom = useRef(null);

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) {
      console.error('Aurora: 컨테이너를 찾을 수 없습니다.');
      return;
    }

    console.log('Aurora: 초기화 시작', { width: ctn.offsetWidth, height: ctn.offsetHeight });

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true
    });

    const gl = renderer.gl;

    // WebGL2 지원 확인
    if (!gl) {
      console.error('Aurora: WebGL을 지원하지 않는 브라우저입니다.');
      return;
    }


    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    
    // Canvas 스타일 명시적으로 설정
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.top = '0';
    gl.canvas.style.left = '0';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.pointerEvents = 'none';

    let program;

    function resize() {
      if (!renderer || !program) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width > 0 && height > 0) {
        renderer.setSize(width, height);
        if (program.uniforms && program.uniforms.uResolution) {
          program.uniforms.uResolution.value = [width, height];
        }
      }
    }

    window.addEventListener('resize', resize);

    const geometry = new Triangle(gl);

    if (geometry.attributes.uv) {
      delete geometry.attributes.uv;
    }

    const colorStop0 = new Color(colorStops[0] || '#5227FF');
    const colorStop1 = new Color(colorStops[1] || '#7cff67');
    const colorStop2 = new Color(colorStops[2] || '#5227FF');

    try {
      program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uAmplitude: { value: amplitude },
          uColorStop0: { value: [colorStop0.r, colorStop0.g, colorStop0.b] },
          uColorStop1: { value: [colorStop1.r, colorStop1.g, colorStop1.b] },
          uColorStop2: { value: [colorStop2.r, colorStop2.g, colorStop2.b] },
          uResolution: { value: [window.innerWidth, window.innerHeight] },
          uBlend: { value: blend }
        }
      });
    } catch (error) {
      console.error('Aurora: Shader 컴파일 오류:', error);
      return;
    }

    const mesh = new Mesh(gl, { geometry, program });

    // Canvas를 DOM에 추가
    ctn.appendChild(gl.canvas);
    
    // Canvas 크기를 명시적으로 설정
    const initialWidth = window.innerWidth;
    const initialHeight = window.innerHeight;
    renderer.setSize(initialWidth, initialHeight);
    program.uniforms.uResolution.value = [initialWidth, initialHeight];

    let animateId = 0;

    const update = t => {
      animateId = requestAnimationFrame(update);

      if (!program || !program.uniforms || !renderer) return;

      const { time = t * 0.01, speed = 1.0 } = propsRef.current;

      program.uniforms.uTime.value = time * speed * 0.1;
      program.uniforms.uAmplitude.value = propsRef.current.amplitude ?? 1.0;
      program.uniforms.uBlend.value = propsRef.current.blend ?? blend;

      const stops = propsRef.current.colorStops ?? colorStops;
      const c0 = new Color(stops[0] || '#5227FF');
      const c1 = new Color(stops[1] || '#7cff67');
      const c2 = new Color(stops[2] || '#5227FF');
      program.uniforms.uColorStop0.value = [c0.r, c0.g, c0.b];
      program.uniforms.uColorStop1.value = [c1.r, c1.g, c1.b];
      program.uniforms.uColorStop2.value = [c2.r, c2.g, c2.b];

      renderer.render({ scene: mesh });
    };

    animateId = requestAnimationFrame(update);

    return () => {
      if (animateId) {
        cancelAnimationFrame(animateId);
      }
      window.removeEventListener('resize', resize);
      if (ctn && gl.canvas && gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amplitude]);

  return <div ref={ctnDom} className="aurora-container" />;
}

