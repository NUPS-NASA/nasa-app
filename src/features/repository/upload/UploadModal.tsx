import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, CircleAlert, Loader2, MoveLeft, Trash2 } from 'lucide-react';

import Button from '../../../shared/ui/Button';
import { useAuth } from '../../auth/AuthContext';
import { uploadsApi } from '../../../shared/api';
import type {
  PreprocessCategory,
  TempPreprocessItem,
  TempUploadItem,
  UploadCommitRequest,
  UploadPreprocessCommitItem,
} from '../../../shared/types';

interface UploadModalProps {
  onClose?: () => void;
}

const PRIMARY_HEADER_KEYS = [
  'SIMPLE',
  'BITPIX',
  'NAXIS',
  'NAXIS1',
  'NAXIS2',
  'DATE-OBS',
  'DATE',
  'OBJECT',
  'EXPTIME',
  'TELESCOP',
  'INSTRUME',
  'FILTER',
  'GAIN',
  'AIRMASS',
  'RA',
  'DEC',
];

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && (process as any)?.env?.VITE_API_BASE_URL) ||
  '/api';

const formatHeaderValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (error) {
      return String(value);
    }
  }
  return String(value);
};

const PREPROCESS_CATEGORIES: { key: PreprocessCategory; label: string }[] = [
  { key: 'dark', label: 'Dark' },
  { key: 'bias', label: 'Bias' },
  { key: 'flat', label: 'Flat' },
];

type PreprocessFilesState = Record<PreprocessCategory, File[]>;
type PreprocessHoverState = Record<PreprocessCategory, boolean>;
type StagedPreprocessState = Partial<Record<PreprocessCategory, TempPreprocessItem[]>>;

const createEmptyPreprocessFiles = (): PreprocessFilesState => ({
  dark: [],
  bias: [],
  flat: [],
});

const createEmptyPreprocessHover = (): PreprocessHoverState => ({
  dark: false,
  bias: false,
  flat: false,
});

const createEmptyStagedPreprocess = (): StagedPreprocessState => ({});

const UploadModal: React.FC<UploadModalProps> = ({ onClose }) => {
  const [dragHover, setDragHover] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [stagedItems, setStagedItems] = useState<TempUploadItem[]>([]);
  const [stagedPreprocess, setStagedPreprocess] = useState<StagedPreprocessState>(() =>
    createEmptyStagedPreprocess(),
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isStaging, setIsStaging] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repositoryName, setRepositoryName] = useState('');
  const [preprocessFiles, setPreprocessFiles] = useState<PreprocessFilesState>(() =>
    createEmptyPreprocessFiles(),
  );
  const [preprocessDragHover, setPreprocessDragHover] = useState<PreprocessHoverState>(() =>
    createEmptyPreprocessHover(),
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const preprocessFileInputRefs = useRef<Record<PreprocessCategory, HTMLInputElement | null>>({
    dark: null,
    bias: null,
    flat: null,
  });
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (stagedItems.length === 0) {
      setSelectedIndex(0);
      return;
    }

    if (selectedIndex >= stagedItems.length) {
      setSelectedIndex(stagedItems.length - 1);
    }
  }, [stagedItems, selectedIndex]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragHover(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragHover(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragHover(false);

    const files = Array.from(event.dataTransfer.files);
    if (!files.length) return;

    setSelectedFiles(files);
    setError(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
    setError(null);
  };

  const handleOpenFolder = () => {
    fileInputRef.current?.click();
  };

  const handlePreprocessDragOver =
    (category: PreprocessCategory) => (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setPreprocessDragHover(prev => ({ ...prev, [category]: true }));
    };

  const handlePreprocessDragLeave =
    (category: PreprocessCategory) => (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setPreprocessDragHover(prev => ({ ...prev, [category]: false }));
    };

  const handlePreprocessDrop =
    (category: PreprocessCategory) => (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setPreprocessDragHover(prev => ({ ...prev, [category]: false }));

      const files = Array.from(event.dataTransfer.files);
      if (!files.length) return;

      setPreprocessFiles(prev => ({ ...prev, [category]: files }));
    };

  const handlePreprocessFileChange =
    (category: PreprocessCategory) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files ? Array.from(event.target.files) : [];
      setPreprocessFiles(prev => ({ ...prev, [category]: files }));
    };

  const handlePreprocessOpenFolder = (category: PreprocessCategory) => {
    preprocessFileInputRefs.current[category]?.click();
  };

  const handleClearPreprocessFiles = (category: PreprocessCategory) => {
    setPreprocessFiles(prev => ({ ...prev, [category]: [] }));
  };

  const hasAnyPreprocessFiles = useMemo(
    () => Object.values(preprocessFiles).some(categoryFiles => categoryFiles.length > 0),
    [preprocessFiles],
  );

  const handleStageUploads = async () => {
    if (!selectedFiles.length) return;

    if (!hasAnyPreprocessFiles) {
      const shouldContinue =
        typeof window === 'undefined'
          ? true
          : window.confirm('No preprocessing files uploaded. Continue?');
      if (!shouldContinue) {
        return;
      }
    }

    setIsStaging(true);
    setError(null);

    try {
      const preprocessUploadMap = (
        Object.entries(preprocessFiles) as [PreprocessCategory, File[]][]
      ).reduce<Partial<Record<PreprocessCategory, File[]>>>((acc, [category, files]) => {
        if (files.length) {
          acc[category] = files;
        }
        return acc;
      }, {});

      const staged = await uploadsApi.stageUploads(selectedFiles, preprocessUploadMap);
      setStagedItems(staged.items ?? []);
      setStagedPreprocess(staged.preprocess ?? createEmptyStagedPreprocess());
      setSelectedIndex(0);
      setSelectedFiles([]);
      setPreprocessFiles(createEmptyPreprocessFiles());
      setPreprocessDragHover(createEmptyPreprocessHover());
      if (!repositoryName) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
        setRepositoryName(`Upload ${timestamp}`);
      }
    } catch (err) {
      setError('Failed to stage uploads. Please try again.');
      console.error(err);
    } finally {
      setIsStaging(false);
    }
  };

  const currentItem = stagedItems[selectedIndex] ?? null;

  const previewUrl = useMemo(() => {
    if (!currentItem) return '';
    return `${API_BASE_URL.replace(/\/$/, '')}/uploads/temp/${currentItem.temp_id}/preview`;
  }, [currentItem]);

  const headerEntries: { primary: [string, string][]; optional: [string, string][] } =
    useMemo(() => {
      if (!currentItem?.fits_header) {
        return { primary: [], optional: [] };
      }

      const entries = Object.entries(currentItem.fits_header || {});
      const primary = entries.filter(([key]) => PRIMARY_HEADER_KEYS.includes(key.toUpperCase()));
      const optional = entries.filter(([key]) => !PRIMARY_HEADER_KEYS.includes(key.toUpperCase()));

      return { primary, optional };
    }, [currentItem]);

  const removeCurrentItem = useCallback(() => {
    if (!currentItem) return;

    setStagedItems(prev => prev.filter(item => item.temp_id !== currentItem.temp_id));
  }, [currentItem]);

  const goPrev = () => {
    if (stagedItems.length <= 1) return;
    setSelectedIndex(index => (index - 1 + stagedItems.length) % stagedItems.length);
  };

  const goNext = () => {
    if (stagedItems.length <= 1) return;
    setSelectedIndex(index => (index + 1) % stagedItems.length);
  };

  const handleCommit = async () => {
    if (!authUser || !currentItem) return;
    if (!repositoryName.trim()) {
      setError('Please provide an upload name before continuing.');
      return;
    }
    const preprocessCommitItems = (
      Object.entries(stagedPreprocess) as [PreprocessCategory, TempPreprocessItem[] | undefined][]
    )
      .flatMap(([, items]) => items ?? [])
      .map<UploadPreprocessCommitItem>(item => ({
        temp_id: item.temp_id,
        category: item.category,
        temp_path: item.temp_path,
        original_name: item.filename,
        metadata_json: item.metadata_json ?? null,
      }));

    const payload: UploadCommitRequest = {
      user_id: authUser.id,
      repository_name: repositoryName.trim(),
      repository_description: null,
      captured_at: new Date().toISOString(),
      items: stagedItems.map(item => ({
        temp_id: item.temp_id,
        fits_temp_path: item.tmp_fits,
        image_temp_path: item.tmp_png ?? null,
        fits_data_json: item.fits_header ?? null,
        metadata_json: item.metadata_json ?? null,
      })),
      preprocess_items: preprocessCommitItems.length ? preprocessCommitItems : null,
    };

    setIsCommitting(true);
    setError(null);

    try {
      await uploadsApi.commitUploads(payload);
      setStagedItems([]);
      setRepositoryName('');
      setStagedPreprocess(createEmptyStagedPreprocess());
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError('Commit failed. Please try again.');
    } finally {
      setIsCommitting(false);
    }
  };

  const renderInitialView = () => (
    <div className="bg-auth-gradient flex h-full min-h-screen items-center justify-center bg-cover bg-center">
      <div className="flex w-[476px] flex-col items-center justify-center gap-[60px] text-white">
        <div
          style={{
            backgroundImage: 'url("/images/icon_trans_512x512.png")',
            width: '100px',
            height: '100px',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="flex h-[422px] w-full flex-col items-center">
          <div className="mb-[35px] text-title20">Upload to Exohunt</div>
          <div className="w-full">
            <div className="mb-[10px] text-title14">Object</div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="h-[310px] w-full"
            >
              {selectedFiles.length > 0 ? (
                <div className="mb-[10px] flex h-full items-center justify-center rounded-[10px] bg-white/10">
                  <div className="flex flex-col items-center justify-center gap-[19px] text-body16">
                    <div className="flex h-[39px] w-full items-center justify-between gap-[20px] rounded-[10px] bg-gray px-[30px] py-[10px] text-body16">
                      <div>{`${selectedFiles.length} files selected`}</div>
                      <button className="text-xl" onClick={() => setSelectedFiles([])}>
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ) : dragHover ? (
                <div className="mb-[10px] flex h-full items-center justify-center rounded-[10px] bg-white/50">
                  <div className="flex flex-col items-center justify-center gap-[19px] text-body16">
                    <div>Drop Here</div>
                  </div>
                </div>
              ) : (
                <div className="mb-[10px] flex h-full items-center justify-center rounded-[10px] bg-white/10">
                  <div className="flex flex-col items-center justify-center gap-[19px] text-body16">
                    <div>Drag and Drop File</div>
                    <div>or</div>
                    <button className="underline" onClick={handleOpenFolder}>
                      Open Folders
                    </button>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mt-[4px] flex w-full items-center justify-end text-body12">
              <CircleAlert className="mr-[2px] h-[12px] w-[12px]" />
              <div className="underline">Upload precautions</div>
            </div>
          </div>
        </div>

        <div className="flex w-full items-stretch justify-between gap-[16px]">
          <div className="flex w-[310px] flex-col">
            <div className="mb-[10px] text-title14">Preprocessing Files (Optional)</div>
            <div className="grid grid-cols-3 gap-[10px]">
              {PREPROCESS_CATEGORIES.map(category => {
                const files = preprocessFiles[category.key];
                const isHovering = preprocessDragHover[category.key];

                return (
                  <div key={category.key} className="flex flex-col items-center">
                    <div className="mb-[6px] text-body12 text-white/80">{category.label}</div>
                    <div
                      onDragOver={handlePreprocessDragOver(category.key)}
                      onDragLeave={handlePreprocessDragLeave(category.key)}
                      onDrop={handlePreprocessDrop(category.key)}
                      className={`flex h-[120px] w-full items-center justify-center rounded-[10px] border border-dashed border-white/30 p-3 text-center text-body12 transition-colors ${
                        isHovering ? 'bg-white/60 text-black' : 'bg-white/10'
                      }`}
                    >
                      {files.length ? (
                        <div className="flex flex-col items-center gap-2 text-body12">
                          <div>{`${files.length} files`}</div>
                          <button
                            className="underline"
                            onClick={event => {
                              event.preventDefault();
                              event.stopPropagation();
                              handleClearPreprocessFiles(category.key);
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-body12">
                          <div>Drag & Drop</div>
                          <div>or</div>
                          <button
                            className="underline"
                            onClick={event => {
                              event.preventDefault();
                              event.stopPropagation();
                              handlePreprocessOpenFolder(category.key);
                            }}
                          >
                            Open Folders
                          </button>
                        </div>
                      )}
                    </div>
                    <input
                      ref={element => {
                        preprocessFileInputRefs.current[category.key] = element;
                      }}
                      type="file"
                      multiple
                      onChange={handlePreprocessFileChange(category.key)}
                      className="hidden"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-1 items-end justify-end gap-[12px]">
            <Button
              className="h-[29px] w-[153px]"
              variant="login"
              onClick={handleStageUploads}
              disabled={!selectedFiles.length || isStaging}
            >
              {isStaging ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </span>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </div>
        {error ? <div className="text-red-400">{error}</div> : null}
      </div>
    </div>
  );

  if (!stagedItems.length) {
    return renderInitialView();
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden flex-col bg-auth-gradient py-[26px] px-[50px]">
      {/* Global style to hide scrollbars while keeping scroll behavior */}
      <style>{`
        /* Hide scrollbars cross-browser */
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none;     /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;             /* Chrome, Safari, Opera */
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center mb-[24px]">
        <div className="text-title20 text-white flex items-center">
          <MoveLeft className="mr-[6px]" />
          Upload files
        </div>

        <div className="ml-[233px] flex items-center text-white justify-between flex-1">
          <div className="flex items-center">
            <div className="text-title14 mr-[15px]">Upload Name</div>
            <div>
              <input
                value={repositoryName}
                onChange={event => setRepositoryName(event.target.value)}
                className="rounded-md border w-[589px] text-black px-2 py-1"
                placeholder="Name your upload"
              />
            </div>
          </div>

          <Button
            className="h-[29px] w-[208px] text-body14 text-black items-center justify-center py-[4px]"
            onClick={handleCommit}
            disabled={isCommitting || stagedItems.length === 0}
          >
            {isCommitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              'Find Exoplanets'
            )}
          </Button>
        </div>
      </div>

      {/* Main row: ensure children can shrink and scroll with min-h-0 */}
      <div className="flex flex-1 gap-[20px] min-h-0">
        {/* Sidebar (Left) */}
        <aside className="h-full w-[329px] flex flex-col rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden min-h-0">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white text-title14 sticky top-0 bg-white/5/80 backdrop-blur-sm">
            <span>List</span>
            <span className="text-white/80">{stagedItems.length}</span>
          </div>

          {/* Only the list scrolls (Y only) and scrollbar is hidden */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
            {stagedItems.map((item, index) => {
              const isActive = index === selectedIndex;
              return (
                <button
                  key={item.temp_id}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-body14 transition rounded-md mx-1 my-0.5 ${
                    isActive
                      ? 'bg-indigo-500/20 border border-indigo-400/30 text-white'
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <span className="w-[23px]">{index + 1}</span>
                  <span className="truncate flex-1">{item.filename}</span>
                  <span className="ml-2 text-xs text-white/50">
                    {Math.round(item.size_bytes / 1024)} KB
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Preview Section (Center) - no scroll */}
        <section className="flex flex-1 flex-col gap-4 h-full min-h-0">
          <div className="flex flex-1 rounded-lg bg-white/5 p-6 border h-full border-white/10 overflow-hidden">
            <div className="flex w-full flex-col h-full">
              <div className="mb-4 text-center text-body14 text-white/70 font-medium">
                {currentItem?.filename ?? 'Preview'}
              </div>
              <div className="flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-black/30 border border-white/10">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={currentItem?.filename ?? 'Preview'}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-white/50 flex flex-col items-center gap-2">
                    <span>📁</span>
                    <span>No preview available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-white/5 px-6 py-3 border border-white/10">
            <div className="w-[100px]"></div>

            <div className="flex items-center justify-center gap-1">
              <button
                onClick={goPrev}
                disabled={stagedItems.length <= 1}
                className="rounded-full border border-white/20 p-2 transition hover:bg-white/10 disabled:opacity-50"
                title="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="text-body14 text-white/80">
                {stagedItems.length ? selectedIndex + 1 : 0} / {stagedItems.length}
              </div>
              <button
                onClick={goNext}
                disabled={stagedItems.length <= 1}
                className="rounded-full border border-white/20 p-2 transition hover:bg-white/10 disabled:opacity-50"
                title="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={removeCurrentItem}
              className="flex items-center gap-2 rounded-md border border-red-500/40 px-4 py-2 text-body14 text-red-400 transition hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </section>

        {/* Metadata Section (Right) - whole pane scrolls (Y only), scrollbar hidden */}
        <aside className="flex w-[489px] flex-col gap-4 h-full bg-white/5 border border-white/10 p-4 overflow-y-auto overflow-x-hidden no-scrollbar min-h-0">
          <div>
            <div className="mb-2 text-title14 uppercase text-white">Primary Metadata</div>
            <div className="text-[11px] w-full h-fit p-[10px] border-[1px] font-spline-mono bg-black border-slate-300 text-green-300 rounded">
              {headerEntries.primary.map(([key, value]) => (
                <div key={key} className="px-3 py-[1px]">{`{"${key}": "${value}"}`}</div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-title14 uppercase text-white">Optional Metadata</div>
            <div className="text-[11px] w-full h-fit p-[10px] border-[1px] font-spline-mono bg-black border-slate-300 text-green-300 rounded">
              {headerEntries.optional.map(([key, value]) => (
                <div key={key} className="px-3 py-[1px]">{`{"${key}": "${value}"}`}</div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default UploadModal;
