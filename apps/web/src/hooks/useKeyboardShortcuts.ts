import { useEffect } from 'react';
import { useGraphStore } from '../stores/graphStore';
import { useSelectionStore } from '../stores/selectionStore';

interface KeyboardShortcutHandlers {
  onCommandPalette?: () => void;
  onSearch?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts({ onCommandPalette, onSearch, onEscape }: KeyboardShortcutHandlers = {}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onCommandPalette?.();
      }

      // Escape
      if (e.key === 'Escape') {
        onEscape?.();
        // Also clear selection by default if not handled specifically
        useSelectionStore.getState().setSelectedNode(null);
      }

      // Focus search (/)
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        onSearch?.();
      }

      // 'f' for fit view is handled in DigitalTwinCanvas via useReactFlow
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCommandPalette, onSearch, onEscape]);
}
