declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare const module: {
  hot?: {
    data: any;
    accept(callback: () => void): void;
    dispose(callback: (data: { root: ReturnType<typeof createRoot> }) => void): void;
    addStatusHandler(callback: (status: string) => void): void;
  };
};
