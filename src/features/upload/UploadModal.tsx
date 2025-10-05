import { CircleAlert } from 'lucide-react';
import Button from '../../../src/shared/ui/Button';
import { useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { uploadsApi } from '../../../src/shared/api';

const UploadModal: React.FC = () => {
  const [dragHover, setDragHover] = useState(false);
  const [data, setData] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user: authUser } = useAuth();

  const handleUpload = async () => {
    if (data.length == 0) return;
    const staged = await uploadsApi.stageUploads(data);
    console.log(staged);
  };
  // Handle drag over event
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragHover(true);
  };

  // Handle drag leave event
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragHover(false);
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragHover(false);
    const files = Array.from(e.dataTransfer.files);
    console.log(files);
    setData(files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    console.log(files);
    setData(files);
  };

  const handleOpenFolder = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-auth-gradient flex h-screen items-center justify-center bg-cover bg-center">
      <div className="flex w-[476px] flex-col items-center justify-center text-white gap-[83px]">
        <div
          style={{
            backgroundImage: 'url("/images/icon_trans_512x512.png")',
            width: '100px',
            height: '100px',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>

        <div className="w-full h-[422px] flex flex-col items-center">
          <div className="text-title20 mb-[35px]">Upload to Exohunt</div>
          <div className="w-full">
            <div className="text-title14 mb-[10px]">Object</div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="w-full h-[310px]"
            >
              {data.length > 0 ? (
                <div className="mb-[10px] bg-white/10  h-full rounded-[10px] flex items-center justify-center">
                  <div className="">
                    <div className="body16 w-full justify-center items-center flex flex-col gap-[19px]">
                      <div className="py-[10px] w-full items-center gap-[20px] justify-between flex pr-[10px] pl-[30px] bg-gray h-[39px] text-body16">
                        <div>{`${data.length} files selected`}</div>
                        <div className="" onClick={() => setData([])}>
                          x
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : dragHover ? (
                <div className="mb-[10px] bg-white/50 h-full rounded-[10px] flex items-center justify-center">
                  <div className="body16 flex flex-col gap-[19px] items-center justify-center">
                    <div>Drop Here</div>
                  </div>
                </div>
              ) : (
                <div className="mb-[10px] bg-white/10 h-full rounded-[10px] flex items-center justify-center">
                  <div className="body16 flex flex-col gap-[19px] items-center justify-center">
                    <div>Drag and Drop File</div>
                    <div>or</div>
                    <div className="underline cursor-pointer" onClick={handleOpenFolder}>
                      Open Folders
                    </div>
                  </div>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mt-[4px] text-body12 w-full justify-end items-center flex">
              <CircleAlert className="w-[12px] h-[12px] mr-[2px]" />
              <div className="underline">Upload precautions</div>
            </div>
          </div>
        </div>

        <div className="w-full h-[29px] flex justify-between">
          <Button className="w-[153px] h-[29px]" variant="login">
            Calibrated files
          </Button>
          <Button className="w-[153px] h-[29px]" variant="login" onClick={handleUpload}>
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
