import { Task, TaskChain } from "./TaskChain";

export const createTask = (action: Task["action"]): Task => {
  return { $id: Symbol(), status: "TODO", action: action };
};

export const execTask = async (target: Task): Promise<boolean> => {
  try {
    const taskExecResult = await target.action();
    return taskExecResult;
  } catch (error) {
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
  let CURRENT_TASK = taskChain.get(startIndex);
  let IS_PAUSE = false;

  // 执行
  const exec = async (): Promise<boolean> => {
    if (CURRENT_TASK?.current && !IS_PAUSE) {
      const taskExecTag = await execTask(CURRENT_TASK.current);
      if (taskExecTag) {
        CURRENT_TASK = CURRENT_TASK.next;
        CHAIN_TASK.status = "PENGDING";
        return await exec();
      } else {
        CHAIN_TASK.status = "FAILED";
        return false;
      }
    }
    CHAIN_TASK.status = IS_PAUSE ? "PAUSE" : "DONE";
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
      exec();
    }
  };

  const cancel = () => {
    if (CHAIN_TASK.status !== "CANCELLED" && CHAIN_TASK.status !== "DONE") {
      CURRENT_TASK = undefined;
      IS_PAUSE = false
    }
  };

  return { start, pause, retry, cancel, task: CHAIN_TASK };
};
