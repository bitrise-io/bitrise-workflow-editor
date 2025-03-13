import { Button, Dialog, DialogBody, DialogFooter, DialogProps, Input, Select } from '@bitrise/bitkit';
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
  baseEntityId: string;
};

export type Props<T> = Omit<DialogProps, 'onCloseComplete' | 'title'> & {
  baseEntities: BaseEntityType<T>[];
  entityName: string;
  onCloseComplete: (entityId: string) => void;
  onCreateEntity: (entityId: string, baseEntityId?: string) => void;
  sanitizer: (value: string) => string;
  validator: (value: string) => string | boolean;
};

const CreateEntityDialog = <T,>({
  baseEntities,
  entityName,
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
      baseEntityId: '',
    },
  });

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('entityId', sanitizer(event.target.value), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleCreate = handleSubmit(({ entityId, baseEntityId }) => {
    onCreateEntity(entityId, baseEntityId);
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
          placeholder={`${entityName} name`}
          inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
          errorText={errors.entityId?.message}
          {...register('entityId', {
            onChange: handleNameChange,
            validate: validator,
          })}
        />
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
