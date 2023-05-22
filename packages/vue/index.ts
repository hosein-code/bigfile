import { uploadFile } from "@bigfile/core";
import type { UploadFn } from "@bigfile/core";
import { reactive, ref } from "vue";

interface FileItem {
  name: string;
  actions: Awaited<ReturnType<typeof uploadFile>>;
}

export const useUpload = (fn: UploadFn) => {
  const fileList = reactive<FileItem[]>([]);

  const upload = async (file: File) => {
    const uploadActions = await uploadFile(file, fn);
    fileList.push({
      name: file.name,
      actions: uploadActions,
    });
    uploadActions.start();
  };

  return [fileList, upload];
};
