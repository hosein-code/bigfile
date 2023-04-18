import { Task, TaskChain } from "./TaskChain";

export const createTask = (action: Task["action"]): Task => {
  return { $id: Symbol(), status: "TODO", action: action };
};

export const execTask = async (target: Task): Promise<boolean> => {
  try {
    target.status = 'PENGDING'
    const taskExecResult = await target.action();
    target.status = taskExecResult && target.status === 'PENGDING' ? 'DONE' : 'FAILED'
    return taskExecResult;
  } catch (error) {
    target.status = 'FAILED'
    console.error(error);
    return false;
  }
};

export const execTaskChain = (startIndex: number = 0, taskChain: TaskChain): {
    start: () => void
    pause: () => void
    retry: () => void
    cancel: () => void
    task: Task
} => {
  let execIndex = startIndex;
  let IS_PAUSE = false;
  // 执行
  const exec = async (): Promise<boolean> => {
    if (IS_PAUSE) {
      CHAIN_TASK.status = 'PAUSE'
      return true
    }
    const task = taskChain.get(execIndex)
    if (execIndex >= taskChain.size()) return true
    if (task?.current) {
      const taskExecTag = await execTask(task.current);
      if (taskExecTag) {
        execIndex ++
        return await exec();
      }
      return false
    }
    return true;
  };

  // 任务链任务
  const CHAIN_TASK = createTask(() => exec());

  const start = () => {
    if (CHAIN_TASK.status === "TODO" || CHAIN_TASK.status === "PAUSE") {
      IS_PAUSE = false;
      execTask(CHAIN_TASK);
    }
  };

  const pause = () => {
    if (CHAIN_TASK.status === "PENGDING") {
      IS_PAUSE = true;
      CHAIN_TASK.status = "PAUSE";
    }
  };

  const retry = () => {
    if (CHAIN_TASK.status === "FAILED") {
      execTask(CHAIN_TASK)
    }
  };

  const cancel = () => {
    if (CHAIN_TASK.status !== "CANCELLED" && CHAIN_TASK.status !== "DONE") {
      taskChain.clear()
      IS_PAUSE = false
    }
  };

  return { start, pause, retry, cancel, task: CHAIN_TASK };
};
