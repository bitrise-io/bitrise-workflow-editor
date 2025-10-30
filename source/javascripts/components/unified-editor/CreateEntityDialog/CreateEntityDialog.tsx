import { Button, Dialog, DialogBody, DialogFooter, DialogProps, Input, Select } from '@bitrise/bitkit';
import { ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';

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

export type Props<T> = Omit<DialogProps, 'onCloseComplete' | 'title'> & {
  baseEntities: BaseEntityType<T>[];
  entityName: string;
  extraInputs?: 'title'[];
  onCloseComplete: (entityId: string) => void;
  onCreateEntity: (entityId: string, baseEntityId?: string, title?: string) => void;
  sanitizer: (value: string) => string;
  validator: (value: string) => string | boolean;
  withTitle?: boolean;
};

const CreateEntityDialog = <T,>({
  baseEntities,
  entityName,
  extraInputs,
  onClose,
  onCloseComplete,
  onCreateEntity,
  sanitizer,
  validator,
  ...props
}: Props<T>) => {
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
    <Dialog title={`Create ${entityName}`} onClose={onClose} onCloseComplete={handleCloseComplete} {...props}>
      <DialogBody as="form" display="flex" flexDir="column" gap="24" onSubmit={handleCreate}>
        <Input
          autoFocus
          isRequired
          label="Name"
          placeholder={`${entityName} ID`}
          inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
          errorText={errors.entityId?.message}
          {...register('entityId', {
            onChange: handleNameChange,
            validate: validator,
          })}
        />
        {extraInputs?.includes('title') && (
          <Input
            label="Title"
            placeholder={`${entityName} Title`}
            inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
            helperText="Human-readable name, overridable per instance."
            {...register('title')}
          />
        )}
        <Select label="Based on" {...register('baseEntityId')}>
          <option key="" value="">
            An empty {entityName}
          </option>
          <Options<T> baseEntities={baseEntities} />
        </Select>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleCreate}>
          Create {entityName}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateEntityDialog;
