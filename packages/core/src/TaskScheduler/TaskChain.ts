interface LinkdNode<T> {
  pre?: LinkdNode<T>;
  next?: LinkdNode<T>;
  current?: T;
}

interface LinkList<T> {
  node: LinkdNode<T>;
  size: number;
  append: (data: T) => void;
  remove: (data: T) => void;
  insert: (index: number, data: T) => void;
  get: (index: number) => LinkdNode<T> | undefined;
  clear: () => void;
  each: (fn: (node: LinkdNode<T>, index: number) => void) => void
}

export type TASK_STATUS =
  | "TODO"
  | "PENGDING"
  | "PAUSE"
  | "DONE"
  | "FAILED"
  | "CANCELLED";

export interface Task {
  $id: symbol;
  status: TASK_STATUS;
  action: () => Promise<boolean>;
}

export class TaskChain implements LinkList<Task> {
  size: number = 0;
  node: LinkdNode<Task> = {};
  header: LinkdNode<Task> | undefined;

  constructor() {}

  append(data: Task) {
    if (this.header) {
      const appendNode: LinkdNode<Task> = { current: data };
      appendNode.pre = this.node;
      this.node.next = appendNode;
      this.node = appendNode;
    } else {
      this.node.current = data;
      this.header = this.node
    }
    this.size ++
  }

  each(fn: (node: LinkdNode<Task>, index: number) => void) {
    let iterator: LinkdNode<Task> | undefined = this.header;
    let index = 0;
    while (iterator) {
      const next = iterator.next;
      iterator && fn(iterator, index);
      iterator = next
      index++;
    }
  }

  remove(data: Task) {
    this.each((node: LinkdNode<Task>) => {
      if (data.$id === node?.current?.$id) {
        node.pre && (node.pre.next = node.next);
        node.next && (node.next.pre = node.pre);
      }
    });
    this.size --
  }

  replace(index: number, data: Task) {
    this.each((node: LinkdNode<Task>, nIndex: number) => {
      if (nIndex === index) {
        node.current = data
      }
    });
  }

  insert(index: number, data: Task) {
    this.each((node: LinkdNode<Task>, nIndex: number) => {
      if (nIndex === index) {
        const insertNode: LinkdNode<Task> = { current: data }
        insertNode.pre = node
        insertNode.next = node.next
        node.next && (node.next.pre = insertNode)
        node.next = insertNode
      }
    });
    this.size ++
  }

  clear() {
    this.each((node) => {
      node.current = undefined
      node.pre = undefined
      node.next = undefined
    })
    this.header = undefined
    this.node = {}
    this.size = 0
  }

  get(index: number) {
    let target: LinkdNode<Task> | undefined;
    this.each((node, nIndex) => {
      if (index === nIndex) { target = node }
    })
    return target
  }
}
