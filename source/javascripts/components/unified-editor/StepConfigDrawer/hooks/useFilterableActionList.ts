import { ListItemProps } from '@bitrise/bitkit';
import { ListProps } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type FilterInputProps } from '../components/FilterInput/FilterInput';

export type FilterableActionListResult<TActionItem> = {
  filter: string;
  filteredItems: TActionItem[];
  focusFilterInput: () => void;
  clearFilterInput: () => void;
  getFilterInputProps: (props: Omit<FilterInputProps, 'ref' | 'value' | 'onChange'>) => FilterInputProps;
  getActionListProps: (props: Omit<ListProps, 'ref'>) => ListProps;
  getActionListItemProps: (item: TActionItem, props?: ListItemProps) => ListItemProps;
};

export type FilterPredicate<TActionItem> = (item: TActionItem, filter: string) => boolean;

export type UseFilterableActionListProps<TActionItem> = {
  items: TActionItem[];
  predicate: FilterPredicate<TActionItem>;
  onSelect: (item: TActionItem) => void;
  interceptKeyboardEvents?: boolean;
};

const useFilterableActionList = <TActionItem>({
  items,
  predicate,
  onSelect,
  interceptKeyboardEvents = true,
}: UseFilterableActionListProps<TActionItem>): FilterableActionListResult<TActionItem> => {
  const filterRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [filter, onFilterChange] = useState('');
  const filteredItems = useMemo(
    () => (filter ? items.filter((item) => predicate(item, filter)) : items),
    [items, predicate, filter],
  );

  const clearFilterInput = useCallback(() => onFilterChange(''), []);
  const focusFilterInput = useCallback(() => {
    setTimeout(() => {
      filterRef.current?.focus();
    }, 125);
  }, []);

  const getFilterInputProps = useCallback(
    (props: Omit<FilterInputProps, 'ref' | 'value' | 'onChange'> = {}) => {
      return {
        ref: filterRef,
        value: filter,
        onChange: onFilterChange,
        ...props,
      };
    },
    [filter],
  );

  const getActionListProps = useCallback((props: Omit<ListProps, 'ref'> = {}) => {
    return {
      ref: listRef,
      ...props,
    };
  }, []);

  const getActionListItemProps = useCallback(
    (item: TActionItem, { onClick, ...props }: ListItemProps = {}) => {
      return {
        tabIndex: 0,
        outline: 'none',
        cursor: 'pointer',
        _focusVisible: { boxShadow: 'none' },
        _focus: { backgroundColor: 'background/hover' },
        _hover: { backgroundColor: 'background/hover' },
        onClick: () => onSelect(item),
        onKeyDown: (event: React.KeyboardEvent<HTMLLIElement>) => {
          const idx = filteredItems.indexOf(item);
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            const listLength = filteredItems.length;
            // Loop over index
            const nextIndex = event.key === 'ArrowDown' ? (idx + 1) % listLength : (idx - 1 + listLength) % listLength;
            const nextItem = listRef.current?.children[nextIndex] as HTMLElement;
            nextItem?.focus();
          } else if (event.key === 'Enter') {
            onSelect(filteredItems[idx]);
          }
        },
        ...props,
      };
    },
    [filteredItems, onSelect],
  );

  useEffect(() => {
    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (!interceptKeyboardEvents || !filterRef.current || event.target === filterRef.current) {
        return;
      }

      if (/^[a-zA-Z0-9_]$/.test(event.key)) {
        filterRef.current.focus();
      }
    };

    if (interceptKeyboardEvents) {
      document.addEventListener('keydown', handleDocumentKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [interceptKeyboardEvents]);

  return {
    filter,
    filteredItems,
    focusFilterInput,
    clearFilterInput,
    getFilterInputProps,
    getActionListProps,
    getActionListItemProps,
  };
};

export default useFilterableActionList;
