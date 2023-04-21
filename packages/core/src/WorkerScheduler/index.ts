import { execWorker } from "./Worker";
import { FileChunk, FileSplitData } from "./workers/FileSplit.worker";

export const splitFile = (data: FileSplitData) => {
  return new Promise<FileChunk[]>((resovle, reject) => {
    execWorker<FileSplitData, FileChunk[]>("SPLIT_FILE", data, resovle, reject);
  });
};

export { destroy } from "./Worker";
