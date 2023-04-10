import { splitFile, destroy } from "./WorkerScheduler/index";
import { TaskChain } from "./TaskScheduler/TaskChain";
import { createTask, execTaskChain } from "./TaskScheduler";
import { FileChunk } from './WorkerScheduler/workers/FileSplit.worker'

interface UploadOptions {
  chunkSize?: number
  concurrent?: number
}

export const uploadFile = async (
  file: File,
  upload: (chunk: FileChunk) => Promise<boolean>,
  options?: UploadOptions,
) => {
  const uploadChain = new TaskChain();
  const settings = Object.assign({ file, chunkSize: 10 }, options || {})
  const chunks = await splitFile(settings);
  chunks.map((chunk) => {
    uploadChain.append(createTask(() => upload(chunk)));
  });
  return execTaskChain(0, uploadChain);
};

export { splitFile, destroy, TaskChain, createTask, execTaskChain }
