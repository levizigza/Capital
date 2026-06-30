// WebGL post-FX utilities — single-pass overlay, no FBO readback.

import { perfMonitor } from "@/perf/PerformanceMonitor";

import commonGlsl from "@/shaders/common.glsl?raw";
import postfxVert from "@/shaders/postfx.vert?raw";
import postfxFrag from "@/shaders/postfx.frag?raw";

export type HoverTarget = {
  cx: number;
  cy: number;
  radius: number;
};

export type PostFxUniforms = {
  time: number;
  intensity: number;
  dissolve: number;
  dissolveDir: [number, number];
  hover: HoverTarget | null;
};

function buildFragmentSource(): string {
  return postfxFrag.replace("// @common", commonGlsl);
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[fx] Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function linkProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("[fx] Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/** Full-screen triangle positions (clip space). */
const TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3]);

export type PostFxRenderer = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  uniforms: {
    resolution: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
    intensity: WebGLUniformLocation | null;
    dissolve: WebGLUniformLocation | null;
    dissolveDir: WebGLUniformLocation | null;
    hoverActive: WebGLUniformLocation | null;
    hoverCenter: WebGLUniformLocation | null;
    hoverRadius: WebGLUniformLocation | null;
  };
  posBuffer: WebGLBuffer;
  render: (width: number, height: number, u: PostFxUniforms) => void;
  destroy: () => void;
};

export function createPostFxRenderer(canvas: HTMLCanvasElement): PostFxRenderer | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;

  const vs = compileShader(gl, gl.VERTEX_SHADER, postfxVert);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, buildFragmentSource());
  if (!vs || !fs) return null;

  const program = linkProgram(gl, vs, fs);
  if (!program) return null;

  gl.deleteShader(vs);
  gl.deleteShader(fs);

  const posBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, TRIANGLE, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const uniforms = {
    resolution: gl.getUniformLocation(program, "uResolution"),
    time: gl.getUniformLocation(program, "uTime"),
    intensity: gl.getUniformLocation(program, "uIntensity"),
    dissolve: gl.getUniformLocation(program, "uDissolve"),
    dissolveDir: gl.getUniformLocation(program, "uDissolveDir"),
    hoverActive: gl.getUniformLocation(program, "uHoverActive"),
    hoverCenter: gl.getUniformLocation(program, "uHoverCenter"),
    hoverRadius: gl.getUniformLocation(program, "uHoverRadius"),
  };

  const render = (width: number, height: number, u: PostFxUniforms) => {
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.uniform2f(uniforms.resolution, width, height);
    gl.uniform1f(uniforms.time, u.time);
    gl.uniform1f(uniforms.intensity, u.intensity);
    gl.uniform1f(uniforms.dissolve, u.dissolve);
    gl.uniform2f(uniforms.dissolveDir, u.dissolveDir[0], u.dissolveDir[1]);

    if (u.hover) {
      gl.uniform1f(uniforms.hoverActive, 1);
      gl.uniform2f(uniforms.hoverCenter, u.hover.cx, u.hover.cy);
      gl.uniform1f(uniforms.hoverRadius, u.hover.radius);
    } else {
      gl.uniform1f(uniforms.hoverActive, 0);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    perfMonitor.recordDrawCalls(1);
  };

  const destroy = () => {
    gl.deleteBuffer(posBuffer);
    gl.deleteProgram(program);
  };

  return { gl, program, uniforms, posBuffer, render, destroy };
}

/** Cap DPR for overlay — keeps fill rate low on retina displays. */
export function overlayPixelSize(cssWidth: number, cssHeight: number): { w: number; h: number } {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  return {
    w: Math.max(1, Math.floor(cssWidth * dpr)),
    h: Math.max(1, Math.floor(cssHeight * dpr)),
  };
}

/** Ease in-out for transition animation */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Animate a uniform from `from` to `to` over `durationMs`. */
export function animateUniform(
  from: number,
  to: number,
  durationMs: number,
  onProgress: (value: number) => void,
): Promise<void> {
  if (durationMs <= 0) {
    onProgress(to);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeInOutCubic(t);
      onProgress(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

export function animateDissolve(
  durationMs: number,
  onProgress: (value: number) => void,
  reducedMotion: boolean,
): Promise<void> {
  if (reducedMotion || durationMs <= 0) {
    onProgress(1);
    onProgress(0);
    return Promise.resolve();
  }

  const half = durationMs / 2;
  return animateUniform(0, 1, half, onProgress).then(() =>
    animateUniform(1, 0, half, onProgress),
  );
}
