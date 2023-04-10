declare module 'web-worker:*' {
    class ImplWorker extends Worker {
        constructor()
    }
    export default ImplWorker
}