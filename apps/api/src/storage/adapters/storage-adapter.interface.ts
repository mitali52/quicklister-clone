export interface UploadResult {
  url: string;
  filename: string;
}

export interface IStorageAdapter {
  upload(file: Express.Multer.File): Promise<UploadResult>;
  delete(filename: string): Promise<void>;
}

export const STORAGE_ADAPTER = Symbol('STORAGE_ADAPTER');
