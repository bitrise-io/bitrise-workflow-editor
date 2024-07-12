import { useCallback, useState } from 'react';
import { useDisclosure } from '@bitrise/bitkit';
import useFilterableActionList, { FilterableActionListResult } from './useFilterableActionList';

export enum Mode {
  CREATE = 'create',
  SELECT = 'select',
}

type UseMultiModePopoverResult<TActionItem> = {
  mode: Mode;
  isMode: (mode: Mode) => boolean;
  switchTo: (mode: Mode) => void;
  isOpen: boolean;
  open: VoidFunction;
  close: VoidFunction;
  create: (item: TActionItem) => void;
  select: (item: TActionItem) => void;
  cancel: VoidFunction;
  focus: VoidFunction;
  clear: VoidFunction;
  getCreateFormProps: () => {
    items: TActionItem[];
    onCreate: (item: TActionItem) => void;
    onCancel: VoidFunction;
  };
} & Pick<
  FilterableActionListResult<TActionItem>,
  'getActionListProps' | 'getActionListItemProps' | 'getFilterInputProps' | 'filteredItems'
>;

type UseMultiModePopoverProps<TActionItem> = {
  mode?: Mode;
  isOpen?: boolean;
  filterPredicate: (item: TActionItem, filter: string) => boolean;
  items: TActionItem[];
  onOpen?: VoidFunction;
  onClose?: VoidFunction;
  onCreate: (item: TActionItem) => void;
  onSelect: (item: TActionItem) => void;
};

const useMultiModePopover = <TActionItem>({
  mode: initialMode = Mode.SELECT,
  isOpen: initialIsOpen = false,
  filterPredicate,
  items,
  onOpen,
  onClose,
  onCreate,
  onSelect,
}: UseMultiModePopoverProps<TActionItem>): UseMultiModePopoverResult<TActionItem> => {
  const {
    isOpen,
    onOpen: onOpenDiscosure,
    onClose: onCloseDisclosure,
  } = useDisclosure({ defaultIsOpen: initialIsOpen });
  const [mode, switchTo] = useState<Mode>(initialMode);

  const isMode = useCallback((m: Mode) => mode === m, [mode]);

  const close = useCallback(() => {
    onCloseDisclosure();
    onClose?.();
  }, [onClose, onCloseDisclosure]);

  const create = useCallback(
    (item: TActionItem) => {
      onCreate(item);
      close();
    },
    [onCreate, close],
  );

  const cancel = useCallback(() => {
    switchTo(Mode.SELECT);
  }, [switchTo]);

  const select = (item: TActionItem) => {
    onSelect(item);
    close();
  };

  const {
    clearFilterInput,
    focusFilterInput,
    filteredItems,
    getFilterInputProps,
    getActionListProps,
    getActionListItemProps,
  } = useFilterableActionList<TActionItem>({
    items,
    predicate: filterPredicate,
    interceptKeyboardEvents: isOpen,
    onSelect: select,
  });

  const open = useCallback(() => {
    switchTo(Mode.SELECT);
    clearFilterInput();
    onOpenDiscosure();
    onOpen?.();
    focusFilterInput();
  }, [switchTo, clearFilterInput, focusFilterInput, onOpen, onOpenDiscosure]);

  const getCreateFormProps = useCallback(() => {
    return {
      items,
      onCreate: create,
      onCancel: cancel,
    };
  }, [cancel, create, items]);

  return {
    mode,
    isMode,
    switchTo,
    isOpen,
    open,
    close,
    create,
    select,
    cancel,
    focus: focusFilterInput,
    clear: clearFilterInput,
    filteredItems,
    getFilterInputProps,
    getActionListProps,
    getActionListItemProps,
    getCreateFormProps,
  };
};

export default useMultiModePopover;
