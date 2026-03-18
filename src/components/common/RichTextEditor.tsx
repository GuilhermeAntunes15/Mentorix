import { useEffect, useMemo, useRef } from 'react';
import {
  Bold,
  Eraser,
  Heading1,
  Heading2,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Strikethrough,
  Underline
} from 'lucide-react';

function normalizeHtml(value: string) {
  const trimmed = value.trim();
  return trimmed === '<p></p>' || trimmed === '<div></div>' ? '' : value;
}

function placeCursorAfterNode(node: Node) {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escreva suas anotacoes aqui...'
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const normalized = normalizeHtml(value);
    if (editor.innerHTML !== normalized) {
      editor.innerHTML = normalized;
    }
  }, [value]);

  function focusEditor() {
    editorRef.current?.focus();
  }

  function emitChange() {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    onChange(normalizeHtml(editor.innerHTML));
  }

  function runCommand(command: string, commandValue?: string) {
    focusEditor();
    document.execCommand(command, false, commandValue);
    emitChange();
  }

  function formatBlock(tagName: 'h1' | 'h2' | 'p') {
    focusEditor();
    document.execCommand('formatBlock', false, tagName);
    emitChange();
  }

  function applyColoredUnderline(color: string) {
    focusEditor();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    const fragment = range.extractContents();
    const span = document.createElement('span');
    span.style.textDecoration = 'underline';
    span.style.textDecorationColor = color;
    span.style.textDecorationThickness = '2px';
    span.appendChild(fragment);
    range.insertNode(span);
    placeCursorAfterNode(span);
    emitChange();
  }

  const underlineColors = useMemo(
    () => [
      { label: 'Azul', value: '#7dd3fc' },
      { label: 'Verde', value: '#34d399' },
      { label: 'Amarelo', value: '#fbbf24' }
    ],
    []
  );

  return (
    <div className="rich-editor-shell">
      <div className="rich-editor-toolbar">
        <button type="button" className="rich-editor-tool" onClick={() => formatBlock('h1')} aria-label="Titulo">
          <Heading1 size={18} />
        </button>
        <button type="button" className="rich-editor-tool" onClick={() => formatBlock('h2')} aria-label="Subtitulo">
          <Heading2 size={18} />
        </button>
        <button type="button" className="rich-editor-tool" onClick={() => formatBlock('p')} aria-label="Texto normal">
          <Pilcrow size={18} />
        </button>
        <button type="button" className="rich-editor-tool" onClick={() => runCommand('bold')} aria-label="Negrito">
          <Bold size={18} />
        </button>
        <button type="button" className="rich-editor-tool" onClick={() => runCommand('italic')} aria-label="Italico">
          <Italic size={18} />
        </button>
        <button type="button" className="rich-editor-tool" onClick={() => runCommand('underline')} aria-label="Sublinhado">
          <Underline size={18} />
        </button>
        <button type="button" className="rich-editor-tool" onClick={() => runCommand('strikeThrough')} aria-label="Riscado">
          <Strikethrough size={18} />
        </button>
        <button type="button" className="rich-editor-tool" onClick={() => runCommand('insertUnorderedList')} aria-label="Lista">
          <List size={18} />
        </button>
        <button type="button" className="rich-editor-tool" onClick={() => runCommand('insertOrderedList')} aria-label="Lista numerada">
          <ListOrdered size={18} />
        </button>
        <button type="button" className="rich-editor-tool" onClick={() => runCommand('removeFormat')} aria-label="Limpar formatacao">
          <Eraser size={18} />
        </button>

        <div className="rich-editor-tool-group">
          <span className="rich-editor-tool-label">
            <Highlighter size={16} /> Sublinhado colorido
          </span>
          {underlineColors.map((color) => (
            <button
              key={color.value}
              type="button"
              className="rich-editor-color"
              style={{ background: color.value }}
              onClick={() => applyColoredUnderline(color.value)}
              aria-label={`Sublinhar com ${color.label.toLowerCase()}`}
              title={`Sublinhar com ${color.label.toLowerCase()}`}
            />
          ))}
        </div>
      </div>

      <div
        ref={editorRef}
        className="rich-editor-surface"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emitChange}
      />
    </div>
  );
}
