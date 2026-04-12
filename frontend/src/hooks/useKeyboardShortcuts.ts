import { useEffect, useRef } from 'react';

interface ShortcutCallbacks {
  onOpenPalette: () => void;
  onCreateIssue: () => void;
  onNavigateToInbox: () => void;
  onNavigateToMyIssues: () => void;
  onToggleHelp: () => void;
}

export function useKeyboardShortcuts(callbacks: ShortcutCallbacks) {
  const chordTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chordPrefix = useRef<string | null>(null);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      const isEditable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target.isContentEditable;

      if (isEditable) return;

      if (chordPrefix.current) {
        if (chordTimeout.current) {
          clearTimeout(chordTimeout.current);
          chordTimeout.current = null;
        }

        const prefix = chordPrefix.current;
        chordPrefix.current = null;

        if (prefix === 'g' && e.key === 'i') {
          e.preventDefault();
          callbacksRef.current.onNavigateToInbox();
          return;
        }
        if (prefix === 'g' && e.key === 'm') {
          e.preventDefault();
          callbacksRef.current.onNavigateToMyIssues();
          return;
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        callbacksRef.current.onOpenPalette();
        return;
      }

      if (e.key === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        callbacksRef.current.onCreateIssue();
        return;
      }

      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        chordPrefix.current = 'g';
        chordTimeout.current = setTimeout(() => {
          chordPrefix.current = null;
        }, 500);
        return;
      }

      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        callbacksRef.current.onToggleHelp();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (chordTimeout.current) {
        clearTimeout(chordTimeout.current);
      }
    };
  }, []);
}
