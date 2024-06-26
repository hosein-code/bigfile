import { uploadFile } from "@bigfile/core";
import { useState } from "react";
import type { UploadFn } from "@bigfile/core";

interface FileItem {
  name: string;
  actions: Awaited<ReturnType<typeof uploadFile>>;
}

export const useUpload = (fn: UploadFn) => {
  const [fileList, setFileList] = useState<FileItem[]>([]);

  const upload = async (file: File) => {
    const uploadActions = await uploadFile(file, fn);
    const nList = [
      ...fileList,
      {
        name: file.name,
        actions: uploadActions,
      },
    ];
    setFileList(nList);
    uploadActions.start();
  };

  return [fileList, upload];
};
