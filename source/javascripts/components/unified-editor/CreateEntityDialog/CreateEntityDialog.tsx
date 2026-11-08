import { Select } from '@bitrise/bitkit';
import { BitkitButton, BitkitFormDialog, BitkitTextInput } from '@bitrise/bitkit-v2';
import { ChangeEvent, useRef } from 'react';
import { useForm } from 'react-hook-form';

import ignore1Password, { ignore1PasswordProps } from '@/utils/ignore1Password';

type BaseEntityType<T> = { ids: string[]; groupLabel?: string; type?: T };

const Options = <T,>({ baseEntities }: { baseEntities: BaseEntityType<T>[] }) => {
  return (
    <>
      {baseEntities.map(({ ids, groupLabel, type }) => {
        if (!groupLabel) {
          return ids.map((id) => (
            <option key={id} value={(type ? `${type}#` : '') + id}>
              {id}
            </option>
          ));
        }
        return (
          <optgroup key={groupLabel} label={groupLabel}>
            {ids.map((id) => (
              <option key={id} value={(type ? `${type}#` : '') + id}>
                {id}
              </option>
            ))}
          </optgroup>
        );
      })}
    </>
  );
};

type FormValues = {
  entityId: string;
  title?: string;
  baseEntityId: string;
};

export type Props<T> = {
  isOpen: boolean;
  onClose: () => void;
  baseEntities: BaseEntityType<T>[];
  entityName: string;
  extraInputs?: 'title'[];
  onCloseComplete: (entityId: string) => void;
  onCreateEntity: (entityId: string, baseEntityId?: string, title?: string) => void;
  sanitizer: (value: string) => string;
  validator: (value: string) => string | boolean;
};

const CreateEntityDialog = <T,>({
  baseEntities,
  entityName,
  extraInputs,
  isOpen,
  onClose,
  onCloseComplete,
  onCreateEntity,
  sanitizer,
  validator,
}: Props<T>) => {
  const idInputRef = useRef<HTMLInputElement>(null);

  const {
    reset,
    register,
    getValues,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      entityId: '',
      title: '',
      baseEntityId: '',
    },
  });

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue('entityId', sanitizer(event.target.value), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleCreate = handleSubmit(({ entityId, baseEntityId, title }) => {
    onCreateEntity(entityId, baseEntityId, title || undefined);
    onClose();
  });

  const handleCloseComplete = () => {
    const entityId = getValues('entityId');
    if (entityId) {
      onCloseComplete?.(entityId);
    }
    reset();
  };

  return (
    <BitkitFormDialog
      title={`Create ${entityName}`}
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
      onExitComplete={handleCloseComplete}
      onSubmit={handleCreate}
      initialFocusEl={() => idInputRef.current}
      footerButtons={
        <>
          <BitkitButton variant="secondary" onClick={onClose}>
            Cancel
          </BitkitButton>
          <BitkitButton type="submit">{`Create ${entityName}`}</BitkitButton>
        </>
      }
    >
      <BitkitTextInput
        label="ID"
        placeholder={`${entityName} ID`}
        inputRef={idInputRef}
        helperText="Unique ID for referencing in YAML. Allowed characters: A-Za-z0-9-_."
        errorText={errors.entityId?.message}
        inputProps={{
          ...ignore1PasswordProps,
          ...register('entityId', {
            onChange: handleNameChange,
            validate: validator,
          }),
        }}
      />
      {extraInputs?.includes('title') && (
        <BitkitTextInput
          optional
          label="Title"
          placeholder={`${entityName} Title`}
          inputRef={ignore1Password}
          helperText="Human-readable name, overridable per instance."
          inputProps={register('title')}
        />
      )}
      <Select label="Based on" {...register('baseEntityId')}>
        <option key="" value="">
          An empty {entityName}
        </option>
        <Options<T> baseEntities={baseEntities} />
      </Select>
    </BitkitFormDialog>
  );
};

export default CreateEntityDialog;
