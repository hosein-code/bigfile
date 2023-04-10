import { splitFile, destroy } from "./WorkerScheduler/index";
import { TaskChain } from "./TaskScheduler/TaskChain";
import { createTask, execTaskChain } from "./TaskScheduler";
import { FileChunk } from './WorkerScheduler/workers/FileSplit.worker'

interface UploadOptions {
  chunkSize?: number
  concurrent?: number
}

const to2DArray = <T>(array: Array<T>, length: number): Array<T[]> => {
  let index = 0;
  const split = []
  while(index < array.length) {
    const start = index;
    const end = Math.min(index + length, array.length)
    split.push(array.slice(start, end))
    index = end
  }
  return split
}

export const uploadFile = async (
  file: File,
  upload: (chunk: FileChunk) => Promise<boolean>,
  options?: UploadOptions,
) => {
  const uploadChain = new TaskChain();
  const settings = Object.assign({ file, chunkSize: 10, concurrent: 1 }, options || {})
  const chunks = await splitFile(settings);
  
  const splitChunks = to2DArray(chunks, settings.concurrent)
  splitChunks.map((chunks) => {
    uploadChain.append(createTask(() => {
      return Promise.all(chunks.map(chunk => upload(chunk))).then(res => res.reduce((p,r) => p && r, true))
    }))
  });
  return execTaskChain(0, uploadChain);
};

export { splitFile, destroy, TaskChain, createTask, execTaskChain }
