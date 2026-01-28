import type { WebGLRenderer, Texture, WebGLRenderTarget, RenderTargetOptions } from "three";
import { Vector2 } from "three";
import { PingPongBuffer } from "../utils/PingPongBuffer";
import { blit } from "../utils/blit";
import type { Pass } from "../types";

export class Compositor {
  private passes: Pass[] = [];
  private pingPongBuffers = new Map<string, PingPongBuffer>();
  private renderer: WebGLRenderer;
  private textureRegistry = new Map<string, Texture>();
  private passRegistry = new Map<string, Pass>();
  private pingPongPassMapping = new Map<string, string>();

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;

    (window as any).__compositor = this;
  }

  addPass(pass: Pass, name?: string): Compositor {
    this.passes.push(pass);
    if (name) {
      this.passRegistry.set(name, pass);
    }

    if (pass.opts.outputTextureName && pass.texture) {
      this.textureRegistry.set(pass.opts.outputTextureName, pass.texture);
    }

    return this;
  }

  getPass(name: string): Pass | undefined {
    return this.passRegistry.get(name);
  }

  getTexture(name: string): Texture | undefined {
    return this.textureRegistry.get(name);
  }

  registerTexture(name: string, texture: Texture): Compositor {
    this.textureRegistry.set(name, texture);
    return this;
  }

  createPingPong(name: string, width: number, height: number, options?: Partial<RenderTargetOptions>): PingPongBuffer {
    const pingPong = new PingPongBuffer(width, height, options);
    this.pingPongBuffers.set(name, pingPong);

    this.textureRegistry.set(`${name}_read`, pingPong.read.texture);
    this.textureRegistry.set(`${name}_write`, pingPong.write.texture);

    return pingPong;
  }

  getPingPong(name: string): PingPongBuffer | undefined {
    return this.pingPongBuffers.get(name);
  }

  swapPingPong(name: string): Compositor {
    const pingPong = this.pingPongBuffers.get(name);
    if (pingPong) {
      pingPong.swap();
      this.textureRegistry.set(`${name}_read`, pingPong.read.texture);
      this.textureRegistry.set(`${name}_write`, pingPong.write.texture);
    }
    return this;
  }

  swapAllPingPong(): Compositor {
    for (const [name, pingPong] of this.pingPongBuffers) {
      pingPong.swap();
      this.textureRegistry.set(`${name}_read`, pingPong.read.texture);
      this.textureRegistry.set(`${name}_write`, pingPong.write.texture);
    }
    return this;
  }

  renderPass(index: number): Compositor {
    if (index >= 0 && index < this.passes.length) {
      const pass = this.passes[index];
      this.resolveDependencies(pass);
      pass.render(this.renderer);
    }
    return this;
  }

  renderPassByName(name: string): Compositor {
    const pass = this.getPass(name);
    if (pass) {
      this.resolveDependencies(pass);
      pass.render(this.renderer);
    }
    return this;
  }

  renderRange(start: number, end: number): Compositor {
    const passes = this.passes.slice(start, end);
    for (const pass of passes) {
      this.resolveDependencies(pass);
      pass.render(this.renderer);
    }
    return this;
  }

  render(): Compositor {
    for (const pass of this.passes) {
      this.resolveDependencies(pass);
      pass.render(this.renderer);
    }
    return this;
  }

  renderToScreen(viewport?: { x: number; y: number; width: number; height: number }): Compositor {
    const size = new Vector2();
    this.renderer.getSize(size);

    if (viewport) {
      this.renderer.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
    }

    const lastPass = this.passes[this.passes.length - 1];
    if (lastPass) {
      this.resolveDependencies(lastPass);
      lastPass.render(this.renderer);
    }

    this.renderer.setViewport(0, 0, size.x, size.y);
    return this;
  }

  blit(source: Texture, target: WebGLRenderTarget): Compositor {
    blit(this.renderer, source, target);
    return this;
  }

  execute(operation: (renderer: WebGLRenderer) => void): Compositor {
    operation(this.renderer);
    return this;
  }

  clear(): Compositor {
    this.passes = [];
    this.textureRegistry.clear();
    this.passRegistry.clear();
    return this;
  }

  removePass(name: string): Compositor {
    const index = this.passes.findIndex(pass => this.passRegistry.get(name) === pass);
    if (index !== -1) {
      this.passes.splice(index, 1);
      this.passRegistry.delete(name);
    }
    return this;
  }

  getPassCount(): number {
    return this.passes.length;
  }

  getDescription(): string {
    const descriptions: string[] = [];
    let totalQuadFragments = 0;

    descriptions.push(`Compositor with ${this.passes.length} pass${this.passes.length !== 1 ? 'es' : ''}:`);

    this.passes.forEach((pass, index) => {
      const passName = this.getPassNameByIndex(index);
      const passType = this.getPassType(pass);
      const passDetails = this.getPassDetails(pass);

      const estimated = this.estimateQuadFragments(pass);
      if (estimated > 0) {
        totalQuadFragments += estimated;
      }

      descriptions.push(`  ${index + 1}. ${passName} (${passType})${passDetails ? ` - ${passDetails}` : ''}`);
    });

    if (totalQuadFragments > 0) {
      descriptions.push('');
      const approxSide = Math.max(1, Math.round(Math.sqrt(totalQuadFragments)));
      descriptions.push(`Estimated fragments (quad passes): ${totalQuadFragments} (~${approxSide}x${approxSide})`);
    }

    if (this.pingPongBuffers.size > 0) {
      descriptions.push('');
      descriptions.push(`Ping-pong buffers:`);
      for (const [name, pingPong] of this.pingPongBuffers) {
        descriptions.push(`  - ${name} (${pingPong.read.width}x${pingPong.read.height})`);
      }
    }

    if (this.textureRegistry.size > 0) {
      descriptions.push('');
      descriptions.push(`Registered textures:`);
      for (const [name, texture] of this.textureRegistry) {
        const size = `${(texture.image as any)?.width || (texture.image as any)?.videoWidth || '?'}x${(texture.image as any)?.height || (texture.image as any)?.videoHeight || '?'}`;
        descriptions.push(`  - ${name} (${size})`);
      }
    }

    return descriptions.join('\n');
  }

  private getPassNameByIndex(index: number): string {
    for (const [name, pass] of this.passRegistry) {
      if (this.passes[index] === pass) {
        return name;
      }
    }
    return `Pass ${index + 1}`;
  }

  private getPassType(pass: Pass): string {
    if (pass.constructor.name === 'FullscreenPass') {
      return 'Quad';
    } else if (pass.constructor.name === 'ParticlePass') {
      return 'Particle';
    } else if (pass.constructor.name === 'WeightedOITParticlesPass') {
      return 'WeightedOIT';
    }
    return pass.constructor.name;
  }

  private getPassDetails(pass: Pass): string {
    const details: string[] = [];

    let pingPongTarget: string | null = null;

    const passName = this.getPassNameByIndex(this.passes.indexOf(pass));
    if (this.pingPongPassMapping.has(passName)) {
      pingPongTarget = this.pingPongPassMapping.get(passName)!;
    } else {
      for (const [name, pingPong] of this.pingPongBuffers) {
        if ((pass as any).outputTarget === pingPong.write || (pass as any).outputTarget === pingPong.read) {
          pingPongTarget = name;
          break;
        }
      }
    }

    if (pingPongTarget) {
      const pingPong = this.pingPongBuffers.get(pingPongTarget);
      if (pingPong) {
        details.push(`ping-pong (${pingPong.read.width}x${pingPong.read.height}, ${pingPongTarget})`);
      }
    } else if (pass.opts.rtSize) {
      details.push(`render-target (${pass.opts.rtSize.width}x${pass.opts.rtSize.height})`);
    } else if (pass.opts.outputTarget) {
      details.push('custom render-target');
    } else {
      const size = new Vector2();
      this.renderer.getSize(size);
      details.push(`screen (${size.x}x${size.y})`);
    }

    if (pass.opts.viewport) {
      details.push(`viewport (${pass.opts.viewport.width}x${pass.opts.viewport.height})`);
    }

    if (pass.opts.inputTextures && Object.keys(pass.opts.inputTextures).length > 0) {
      const inputs = Object.values(pass.opts.inputTextures).join(', ');
      details.push(`inputs: ${inputs}`);
    }

    if (pass.opts.outputTextureName) {
      details.push(`output: ${pass.opts.outputTextureName}`);
    }

    if (pass.opts.particleOptions) {
      details.push(`${pass.opts.particleOptions.count} particles`);
    }

    return details.join(', ');
  }

  updatePingPongPass(passName: string, pingPongName: string, inputUniform: string, outputTarget?: WebGLRenderTarget): Compositor {
    const pass = this.getPass(passName);
    const pingPong = this.getPingPong(pingPongName);

    if (pass && pingPong) {
      pass.setUniform!(inputUniform, pingPong.read.texture);
      if (outputTarget) {
        (pass as any).outputTarget = outputTarget;
      }
      this.pingPongPassMapping.set(passName, pingPongName);
    }

    return this;
  }

  private resolveDependencies(pass: Pass) {
    if (pass.opts.inputTextures) {
      for (const [uniformName, textureName] of Object.entries(pass.opts.inputTextures)) {
        const texture = this.textureRegistry.get(textureName);
        if (texture) {
          pass.setUniform!(uniformName, texture);
        }
      }
    }
  }

  private estimateQuadFragments(pass: Pass): number {
    let width = 0;
    let height = 0;
    const p: any = pass as any;

    if (pass.constructor.name === 'FullscreenPass') {
      if (p.outputTarget) {
        if (pass.opts.rtSize) {
          width = pass.opts.rtSize.width;
          height = pass.opts.rtSize.height;
        } else if (p.outputTarget.width && p.outputTarget.height) {
          width = p.outputTarget.width;
          height = p.outputTarget.height;
        }
      } else {
        if (pass.opts.viewport) {
          width = pass.opts.viewport.width;
          height = pass.opts.viewport.height;
        } else {
          const size = new Vector2();
          this.renderer.getSize(size);
          width = size.x;
          height = size.y;
        }
      }
    }
    else if (pass.constructor.name === 'ParticlePass') {
      if (p.outRT === null) {
        if (pass.opts.viewport) {
          width = pass.opts.viewport.width;
          height = pass.opts.viewport.height;
        } else {
          const size = new Vector2();
          this.renderer.getSize(size);
          width = size.x;
          height = size.y;
        }
      }
    }

    const w = Math.max(0, Math.floor(width));
    const h = Math.max(0, Math.floor(height));
    return w * h;
  }

  resize(width: number, height: number) {
    for (const pass of this.passes) {
      if (pass.resize) {
        pass.resize(width, height);
      }
    }
  }

  resizePass(passName: string, width: number, height: number) {
    const pass = this.getPass(passName);
    if (pass && pass.resize) {
      pass.resize(width, height);
    }
  }
}
