import { Branch, Failure, Path, Validator, superstruct } from 'superstruct';

const isEntityId: Validator = (value: any, branch: Branch, path: Path): Failure | boolean => {
  if (typeof value !== 'string') {
    return {
      branch,
      path,
      value,
      type: 'entity-id',
      error: 'entity id should be a string',
    };
  }

  if (!value.includes('.')) {
    return {
      branch,
      path,
      value,
      type: 'entity-id',
      error: "entity id should be in the format 'domain.entity'",
    };
  }

  return true;
};

const isIcon: Validator = (value: any, branch: Branch, path: Path): Failure | boolean => {
  if (typeof value !== 'string') {
    return {
      branch,
      path,
      value,
      type: 'icon',
      error: 'icon should be a string',
    };
  }
  if (!value.includes(':')) {
    return {
      branch,
      path,
      value,
      type: 'icon',
      error: "icon should be in the format 'mdi:icon'",
    };
  }
  return true;
};

export const cardStruct = superstruct({
  types: {
    'entity-id': isEntityId,
    icon: isIcon,
  },
});

export const tagNames = (name: string) =>
  Object.freeze({
    tag: name,
    editor: `${name}-editor`,
  });
