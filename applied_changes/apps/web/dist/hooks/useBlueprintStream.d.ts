export declare function useBlueprintStream(): {
    startGeneration: () => Promise<void>;
    cancelGeneration: () => void;
    isGenerating: boolean;
    progress: string;
};
