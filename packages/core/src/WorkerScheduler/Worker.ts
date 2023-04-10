import SplitFileWorker from './workers/FileSplit.worker'
export enum WORKER_STATE {
  USEING,
  WATING,
}

export interface WorkerInstance {
  _instance: Worker;
  _state: WORKER_STATE;
}

export type WORKER_ACTION = "SPLIT_FILE" | "SPLIT_FINISH";

export interface WorkerMessage<T> {
  action: WORKER_ACTION;
  data: T;
}

export type OnSuccess<T = any> = (data: T) => void;
export type OnError = (error: string) => void;
export interface WorkerBuffer<T> {
  message: WorkerMessage<T>;
  onSuccess: OnSuccess;
  onError: OnError;
}

let workers: Array<WorkerInstance> = [];
const MAX_WORKER_COUNT = 3;
let WORKER_BUFFER: Array<WorkerBuffer<unknown>> = [];

const getIdleWorker = (): WorkerInstance | null => {
  const worker = workers.find(
    (worker) => worker._state === WORKER_STATE.WATING
  );
  if (worker) return worker;
  if (workers.length < MAX_WORKER_COUNT) {
    const blob = new Blob([`(${SplitFileWorker.toString()})()`], {type: 'text/javascript'})
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    const workerInstance = { _instance: worker, _state: WORKER_STATE.WATING };
    return workerInstance;
  }
  return null;
};

export const execWorker = <T, U>(
  action: WORKER_ACTION,
  data: T,
  onSuccess: OnSuccess<U>,
  onError: OnError
) => {
  const worker = getIdleWorker();
  const workerMessage: WorkerMessage<T> = { action, data };
  if (worker) {
    worker._instance.postMessage(workerMessage);
    worker._instance.onmessage = function (
      eventMessage: MessageEvent<WorkerMessage<U>>
    ) {
      onSuccess(eventMessage.data.data);
      worker._state = WORKER_STATE.WATING;
      const workerBuffer = WORKER_BUFFER.shift() as WorkerBuffer<T>;
      if (workerBuffer) {
        execWorker<T, U>(
          workerBuffer.message.action,
          workerBuffer.message.data,
          workerBuffer.onSuccess,
          workerBuffer.onError
        );
      }
    };
  } else {
    const buffer: WorkerBuffer<T> = {
      message: workerMessage,
      onSuccess,
      onError,
    };
    WORKER_BUFFER.push(buffer);
  }
};

export const destroy = () => {
  workers.forEach((worker) => worker._instance.terminate());
  workers = [];
  WORKER_BUFFER = [];
};
