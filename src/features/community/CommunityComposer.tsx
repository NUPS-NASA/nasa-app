import { type FormEvent, type FC, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useQuery } from '@tanstack/react-query';

import { ApiError } from '../../shared/api';
import { listProjects } from '../../shared/api/projects';
import type { CommunityPostCategory, CommunityPostCreate } from '../../shared/types/community';
import type { ProjectRead } from '../../shared/types';
import Button from '../../shared/ui/Button';
import { cn } from '../../shared/utils';

interface CategoryOption {
  label: string;
  value: CommunityPostCategory;
}

interface CommunityComposerProps {
  categories: CategoryOption[];
  defaultCategory: CommunityPostCategory;
  onSubmit: (payload: CommunityPostCreate) => Promise<unknown>;
  onCancel?: () => void;
  onSubmitted?: () => void;
  isSubmitting: boolean;
}

const CommunityComposer: FC<CommunityComposerProps> = ({
  categories,
  defaultCategory,
  onSubmit,
  isSubmitting,
  onCancel,
  onSubmitted,
}) => {
  const MIN_TITLE_LENGTH = 3;
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CommunityPostCategory>(defaultCategory);
  const [linkedProjectId, setLinkedProjectId] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [isContentEmpty, setIsContentEmpty] = useState(true);
  const formRef = useRef<HTMLFormElement | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class:
          'tiptap-editor min-h-[180px] max-h-[360px] w-full overflow-y-auto rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
      },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
          formRef.current?.requestSubmit();
          return true;
        }
        return false;
      },
    },
    onCreate: ({ editor: createdEditor }) => {
      const text = createdEditor.getText().replace(/\u00a0/g, ' ').trim();
      setIsContentEmpty(text.length === 0);
    },
    onUpdate: ({ editor: updatedEditor }) => {
      const text = updatedEditor.getText().replace(/\u00a0/g, ' ').trim();
      setIsContentEmpty(text.length === 0);
    },
  });

  useEffect(() => {
    setCategory(defaultCategory);
  }, [defaultCategory]);

  const projectsQuery = useQuery<ProjectRead[]>({
    queryKey: ['community', 'composer', 'projects'],
    queryFn: () => listProjects(),
    staleTime: 1000 * 60,
  });

  const disabled = isSubmitting || !title.trim() || isContentEmpty;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor) {
      return;
    }

    const trimmedTitle = title.trim();
    const textContent = editor.getText().replace(/\u00a0/g, ' ').trim();
    if (!trimmedTitle) {
      setError('제목을 입력해 주세요.');
      return;
    }
    if (trimmedTitle.length < MIN_TITLE_LENGTH) {
      setError(`제목은 최소 ${MIN_TITLE_LENGTH}자 이상 입력해 주세요.`);
      return;
    }
    if (textContent.length === 0) {
      setError('내용을 작성해 주세요.');
      return;
    }

    const payload: CommunityPostCreate = {
      title: trimmedTitle,
      content: editor.getHTML(),
      category,
      linked_project_id: linkedProjectId === '' ? null : Number(linkedProjectId),
    };

    try {
  setError(null);
  await onSubmit(payload);
  setTitle('');
  setLinkedProjectId('');
  setCategory(payload.category);
      editor.commands.clearContent(true);
      setIsContentEmpty(true);
      onSubmitted?.();
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        const { body } = submitError;
        let message = '게시글 작성에 실패했습니다. 입력값을 다시 확인해 주세요.';
        if (body) {
          if (typeof body === 'string') {
            message = body;
          } else if (typeof body === 'object') {
            const detail = (body as { detail?: unknown }).detail;
            if (typeof detail === 'string') {
              message = detail;
            } else if (Array.isArray(detail)) {
              const first = detail[0];
              if (first && typeof first === 'object' && 'msg' in first) {
                message = String((first as { msg?: unknown }).msg ?? message);
              }
            }
          }
        }
        setError(message);
      } else if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError('게시글 작성에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
    }
  };

  const handleCancel = () => {
    if (isSubmitting) {
      return;
    }
    setTitle('');
    setLinkedProjectId('');
    setCategory(defaultCategory);
    editor?.commands.clearContent(true);
    setIsContentEmpty(true);
    setError(null);
    onCancel?.();
  };

  const toolbarButton = (
    label: string,
    onClick: () => void,
    active = false,
    disabledOverride?: boolean,
  ) => (
    <button
      type="button"
      onClick={onClick}
      disabled={!editor || disabledOverride}
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-primary text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-60 disabled:cursor-not-allowed',
      )}
    >
      {label}
    </button>
  );

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex-1 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            제목
          </label>
          <input
            value={title}
            onChange={event => setTitle(event.target.value)}
            type="text"
            placeholder="프로젝트 소식이나 미션 브리핑을 소개해 보세요"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="w-full space-y-3 md:w-52">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            카테고리
          </label>
          <select
            value={category}
            onChange={event => setCategory(event.target.value as CommunityPostCategory)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {categories.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full space-y-3 md:w-64">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            링크할 프로젝트 (선택)
          </label>
          <select
            value={linkedProjectId === '' ? '' : String(linkedProjectId)}
            onChange={event =>
              setLinkedProjectId(event.target.value === '' ? '' : Number(event.target.value))
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={projectsQuery.isLoading}
          >
            <option value="">선택하지 않음</option>
            {(projectsQuery.data ?? []).map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {toolbarButton(
            'Bold',
            () => {
              if (!editor) {
                return;
              }
              editor.chain().focus().toggleBold().run();
            },
            editor?.isActive('bold') ?? false,
          )}
          {toolbarButton(
            'Italic',
            () => {
              if (!editor) {
                return;
              }
              editor.chain().focus().toggleItalic().run();
            },
            editor?.isActive('italic') ?? false,
          )}
          {toolbarButton(
            'Bullet List',
            () => {
              if (!editor) {
                return;
              }
              editor.chain().focus().toggleBulletList().run();
            },
            editor?.isActive('bulletList') ?? false,
          )}
          {toolbarButton(
            'Numbered List',
            () => {
              if (!editor) {
                return;
              }
              editor.chain().focus().toggleOrderedList().run();
            },
            editor?.isActive('orderedList') ?? false,
          )}
          {toolbarButton(
            'Quote',
            () => {
              if (!editor) {
                return;
              }
              editor.chain().focus().toggleBlockquote().run();
            },
            editor?.isActive('blockquote') ?? false,
          )}
          {toolbarButton(
            'Clear',
            () => {
              if (!editor) {
                return;
              }
              editor.chain().focus().clearNodes().run();
            },
            false,
            isContentEmpty,
          )}
        </div>
        <EditorContent editor={editor} />
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <p className="text-xs text-slate-500">
          • 새 글은 상단에 노출됩니다 • <span className="font-medium">Ctrl/⌘ + Enter</span>로도 게시할 수 있어요
        </p>
        <div className="flex items-center justify-end gap-3">
          {onCancel ? (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
              disabled={isSubmitting}
            >
              취소
            </button>
          ) : null}
          <Button
            variant="primary"
            type="submit"
            disabled={disabled}
            className="px-6 py-2"
          >
            {isSubmitting ? '게시 중...' : '게시글 올리기'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommunityComposer;
