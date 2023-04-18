interface LinkdNode<T> {
  pre?: LinkdNode<T>;
  next?: LinkdNode<T>;
  current?: T;
}

interface LinkedArrayList<T> {
  list: Array<LinkdNode<T>>;
  node: LinkdNode<T>;
  size: () => number;
  append: (data: T) => void;
  remove: (data: T) => boolean;
  insert: (index: number, data: T) => boolean;
  get: (index: number) => LinkdNode<T> | undefined;
  clear: () => void;
}

export type TASK_STATUS = 'TODO' | 'PENGDING' | 'PAUSE' | 'DONE' | 'FAILED' | 'CANCELLED'

export interface Task {
  $id: symbol;
  status: TASK_STATUS;
  action: () => Promise<boolean>;
}

export class TaskChain implements LinkedArrayList<Task> {
  list: Array<LinkdNode<Task>> = [];
  node: LinkdNode<Task> = {};

  constructor() {}
  size() {
    return this.list.length;
  }
  append(data: Task) {
    if (this.node.current) {
      const node: LinkdNode<Task> = { current: data };
      node.pre = this.node;
      this.node.next = node;
      this.node = node;
    } else {
      this.node.current = data;
    }
    this.list.push(this.node);
  }
  remove(data: Task) {
    const index = this.list.findIndex((item) => item.current?.$id === data.$id);
    if (index > -1) {
      this.list[index - 1].next = this.list[index + 1];
      this.list[index + 1].pre = this.list[index - 1];
      this.list.splice(index, 1);
      return true;
    }
    return false;
  }

  replace(index:number, data: Task) {
    if (index >= this.size() || index < 0) return false;
    if (!this.list[index].current) return false;
    this.remove(this.list[index].current!)
    this.insert(index, data)
    return true;
  }

  insert(index: number, data: Task) {
    if (index >= this.size() || index < 0) return false;
    const node: LinkdNode<Task> = { current: data };
    node.pre = this.list[index - 1];
    node.next = this.list[index];
    this.list[index - 1].next = node;
    this.list[index].pre = node;
    this.list.splice(index, 0, node);
    return true;
  }

  clear() {
    this.list.forEach((l) => {
      l.current && (l.current = undefined);
      l.next && (l.next = undefined);
      l.pre && (l.pre = undefined);
    });
    this.node = {};
    this.list = [];
  }

  get(index: number) {
    if (index >= this.size() || index < 0) return undefined;
    return this.list[index];
  }
}
