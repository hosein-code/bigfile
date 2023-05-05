import { Task, TaskChain } from "./TaskChain";

export const createTask = (action: Task["action"]): Task => {
  return { $id: Symbol(), status: "TODO", action: action };
};

export const execTask = async (target: Task): Promise<boolean> => {
  try {
    target.status = 'PENGDING'
    const taskExecResult = await target.action();
    if (target.status === 'PENGDING') {
      target.status = taskExecResult ? 'DONE' : 'FAILED'
    }
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

  let TASK_ITERATOR  = taskChain.get(startIndex);
  let IS_PAUSE = false;
  // 执行
  

  const exec = async (): Promise<boolean> => {
    let CURRENT_TASK = TASK_ITERATOR?.current
    if (IS_PAUSE) {
      // 暂停
      CHAIN_TASK.status = 'PAUSE'
      return true
    }
    if (CURRENT_TASK) {
      // 任务执行
      const taskExecTag = await execTask(CURRENT_TASK);
      if (taskExecTag) {
        TASK_ITERATOR = TASK_ITERATOR?.next
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
      CHAIN_TASK.status = "PENGDING";
      IS_PAUSE = false;
      execTask(CHAIN_TASK);
    }
  };

  const pause = () => {
    if (CHAIN_TASK.status === "PENGDING") {
      CHAIN_TASK.status = "PAUSE";
      IS_PAUSE = true;
    }
  };

  const retry = () => {
    if (CHAIN_TASK.status === "FAILED") {
      CHAIN_TASK.status = "PENGDING";
      execTask(CHAIN_TASK)
    }
  };

  const cancel = () => {
    if (CHAIN_TASK.status !== "CANCELLED" && CHAIN_TASK.status !== "DONE") {
      CHAIN_TASK.status = "CANCELLED";
      taskChain.clear()
      IS_PAUSE = false
    }
  };

  return { start, pause, retry, cancel, task: CHAIN_TASK };
};
