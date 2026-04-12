import { RendererInfo } from '../types';

export type UpdateFn = (time: number) => void;
export declare function setLoopPaused(paused: boolean): void;
export declare function startLoop(info: RendererInfo, update: UpdateFn): void;
