import { splitFile, destroy } from "./WorkerScheduler/index";
import { Task, TaskChain } from "./TaskScheduler/TaskChain";
import { createTask, execTaskChain, execTask } from "./TaskScheduler";
import { FileChunk } from "./WorkerScheduler/workers/FileSplit.worker";

interface UploadOptions {
  chunkSize?: number;
  concurrent?: number;
}

const to2DArray = <T>(array: Array<T>, length: number): Array<T[]> => {
  let index = 0;
  const split = [];
  while (index < array.length) {
    const start = index;
    const end = Math.min(index + length, array.length);
    split.push(array.slice(start, end));
    index = end;
  }
  return split;
};

type UploadFn = (chunk: FileChunk) => Promise<boolean>

export const uploadFile = async (
  file: File,
  upload: UploadFn,
  options?: UploadOptions
) => {
  const uploadChain = new TaskChain();
  const settings = Object.assign(
    { file, chunkSize: 10, concurrent: 1 },
    options || {}
  );
  const chunks = await splitFile(settings);

  const splitChunks = to2DArray(chunks, settings.concurrent);
  const errorTask: Task[] = [];
  const execTasks = async (tasks: Task[]): Promise<boolean> => {
    const taskExecResult = await Promise.all(tasks.map(execTask))
    .then((res) =>
      res.reduce((p, c, i) => {
        !c && errorTask.push(tasks[i]);
        return p && c;
      }, true)
    );
    return taskExecResult
  }
  splitChunks.map((chunks, index) => {
    uploadChain.append(
      createTask(async () => {
        const tasks = chunks.map((chunk) => createTask(() => upload(chunk)));
        const tasksExecResult = await execTasks(tasks)
        !tasksExecResult && uploadChain.replace(index, createTask(() => execTasks(errorTask)))
        return tasksExecResult
      })
    );
  });
  return execTaskChain(0, uploadChain);
};

export { splitFile, destroy, TaskChain, createTask, execTaskChain, execTask };
export type { FileChunk, UploadOptions, UploadFn  }
