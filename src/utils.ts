import { Branch, Failure, Path, Validator, superstruct } from 'superstruct';

import { HomeAssistant } from 'custom-card-helpers';

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

const _root = Symbol('root');
const _assetManifest = Symbol('asset-manifest');
const lovelaceFileLoaded: any = {};

const fetchManifest = async (rootUrl: string): Promise<{ [name: string]: string | undefined }> => {
  const fullPath = rootUrl + 'frontend_latest/manifest.json';
  const res = await fetch(fullPath);
  const json = await res.json();
  json[_root] = rootUrl;
  return json;
};

const loadComponent = async (manifestPromise: Promise<{ [name: string]: string | undefined }>, name: string) => {
  const manifest = await manifestPromise;
  let path = manifest[name];
  if (!path) {
    throw new Error(`Component file not found in manfiest: ${name}`);
  }

  const root: string = (manifest as any)[_root];
  if (path.startsWith('/')) {
    path = path.substr(1);
  }

  const fullPath = root + path;
  await import(fullPath);
};

export const loadLovelaceFile = (hass: HomeAssistant, name: string): Promise<void> => {
  const rootUrl = (hass as any).hassUrl();
  const root = lovelaceFileLoaded[rootUrl] || (lovelaceFileLoaded[rootUrl] = {});
  if (!root[_assetManifest]) {
    root[_assetManifest] = fetchManifest(rootUrl);
  }

  if (!root[name]) {
    root[name] = loadComponent(root[_assetManifest], name);
  }

  return root[name];
};
