import { RendererInfo, RendererOptions } from '../types';

export interface ExperimentSetup {
    config?: RendererOptions;
    init: (info: RendererInfo) => void;
    update: (time: number) => void;
    setupInputs?: boolean;
    setupResize?: boolean;
    title?: string;
    onResize?: (info: RendererInfo) => void;
    onToggleInfo?: (visible: boolean) => void;
    onInit?: (info: RendererInfo) => void;
    afterUpdate?: (time: number) => void;
}
export declare function runExperiment(experiment: ExperimentSetup): void;
