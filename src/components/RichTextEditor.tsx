'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start typing...",
  className = ""
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Format text command
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Handle input changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Toolbar buttons configuration
  const toolbarButtons = [
    { command: 'bold', icon: 'B', title: 'Bold', className: 'font-bold text-black' },
    { command: 'italic', icon: 'I', title: 'Italic', className: 'italic text-black' },
    { command: 'underline', icon: 'U', title: 'Underline', className: 'underline text-black' },
    { command: 'insertUnorderedList', icon: '•', title: 'Bullet List', className: 'text-black' },
    { command: 'insertOrderedList', icon: '1.', title: 'Numbered List', className: 'text-black' },
    { command: 'createLink', icon: '🔗', title: 'Insert Link', requiresInput: true, className: 'text-black' },
    { command: 'removeFormat', icon: '🧹', title: 'Clear Formatting', className: 'text-black' },
  ];

  const handleButtonClick = (button: typeof toolbarButtons[0]) => {
    if (button.requiresInput) {
      const url = prompt('Enter URL:');
      if (url) {
        execCommand(button.command, url);
      }
    } else {
      execCommand(button.command);
    }
  };

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center space-x-1">
        {toolbarButtons.map((button) => (
          <button
            key={button.command}
            type="button"
            onClick={() => handleButtonClick(button)}
            className={`px-3 py-1 text-sm rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B8860B] transition-colors ${button.className || ''}`}
            title={button.title}
          >
            {button.icon}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`min-h-[120px] p-4 focus:outline-none ${
          !value && !isFocused ? 'text-gray-400' : 'text-gray-900'
        }`}
        dangerouslySetInnerHTML={!value && !isFocused ? { __html: placeholder } : undefined}
        style={{ 
          fontSize: '14px',
          lineHeight: '1.6'
        }}
      />

      {/* Character count */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-1 text-xs text-gray-500 text-right">
        {value.replace(/<[^>]*>/g, '').length} characters
      </div>
    </div>
  );
}