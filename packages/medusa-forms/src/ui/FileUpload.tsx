import { clx } from '@medusajs/ui';
import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, FC, KeyboardEvent, ReactElement } from 'react';

const defaultText = (
  <span>
    Drop your files here, or <span className="text-violet-60">click to browse</span>
  </span>
);

type FileUploadProps = {
  filetypes: string[];
  onFileChosen: (files: File[]) => void;
  className?: string;
  errorMessage?: string;
  multiple?: boolean;
  placeholder?: ReactElement | string;
  text?: ReactElement | string;
};

const FileUpload: FC<FileUploadProps> = ({
  className,
  errorMessage,
  filetypes,
  multiple = false,
  onFileChosen,
  placeholder = '',
  text = defaultText,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploadError, setUploadError] = useState(false);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;

    if (fileList) {
      onFileChosen(Array.from(fileList));
    }
  };

  const extractFilesFromItems = (items: DataTransferItemList): File[] => {
    const files: File[] = [];
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file && filetypes.indexOf(file.type) > -1) {
          files.push(file);
        }
      }
    }
    return files;
  };

  const extractFilesFromFileList = (fileList: FileList): File[] => {
    const files: File[] = [];
    for (const file of fileList) {
      if (filetypes.indexOf(file.type) > -1) {
        files.push(file);
      }
    }
    return files;
  };

  const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
    setUploadError(false);
    e.preventDefault();

    const files = e.dataTransfer.items
      ? extractFilesFromItems(e.dataTransfer.items)
      : extractFilesFromFileList(e.dataTransfer.files);

    if (files.length === 1) {
      onFileChosen(files);
    } else {
      setUploadError(true);
    }
  };

  const handleTriggerClick = () => {
    inputRef.current?.click();
  };

  // Actions triggered using mouse events should have corresponding keyboard events
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleTriggerClick();
    }
  };

  return (
    <div
      className={clx(
        'p-4 border-2 border-dashed border-grey-20 cursor-pointer flex flex-col h-full inter-base-regular items-center justify-center rounded-rounded select-none text-grey-50 transition-colors w-full hover:border-violet-60 hover:text-grey-40',
        className,
      )}
      onClick={handleTriggerClick}
      onKeyDown={handleKeyDown}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleFileDrop}
    >
      <div className="flex flex-col items-center">
        <p>{text}</p>
        <span>{placeholder}</span>
      </div>
      {uploadError ? <span className="text-rose-60">{errorMessage || 'Please upload an image file'}</span> : null}
      <input
        ref={inputRef}
        accept={filetypes.join(', ')}
        className="hidden"
        multiple={multiple}
        type="file"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default FileUpload;
