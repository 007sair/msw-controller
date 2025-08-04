declare interface Window {
  msw: {
    worker: ReturnType<typeof setupWorker>
  }
}
