import { WorkerMessage } from '../Worker'

export interface FileChunk {
  fileName: string;
  fileSize: number;
  fileType: string;
  chunkName: string;
  chunkNum: number;
  chunkSize: number;
  chunkTotal: number;
  chunkFile: File;
}

export interface FileSplitData {
  file: File;
  chunkSize: number;
}

const SplitFileWorker = () => {
  const splitFile = (options: FileSplitData): FileChunk[] => {
    const { file, chunkSize = 20 } = options;
    if (!file) return [];
    let start = 0,
      index = 0;
  
    const chunks: FileChunk[] = [];
    const CHUNK_SIZE = chunkSize * 1024 * 1024;
    const CHUNK_TOTAL = Math.ceil(file.size / CHUNK_SIZE);
  
    while (start < file.size) {
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = new File([file.slice(start, end)], file.name, {
        type: file.type,
      });
      chunks.push({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        chunkName: file.name,
        chunkTotal: CHUNK_TOTAL,
        chunkFile: chunk,
        chunkSize: chunk.size,
        chunkNum: index,
      });
      start += CHUNK_SIZE;
      index++;
    }
    return chunks;
  };
  
  self.onmessage = (event: MessageEvent<WorkerMessage<FileSplitData>>) => {
    const { action, data } = event.data;
    // 文件切割
    if (action === "SPLIT_FILE") {
      const { file, chunkSize } = data;
      const chunks = splitFile({ file, chunkSize });
      const resultMessage: WorkerMessage<FileChunk[]> = { action: 'SPLIT_FINISH', data: chunks}
      self.postMessage(resultMessage);
    }
  };
}

export default SplitFileWorker


