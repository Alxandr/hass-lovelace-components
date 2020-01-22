import { ActionConfig } from 'custom-card-helpers';
import { InputType } from 'zlib';

export interface EntityConfig {
  entity: string;
  type?: string;
  name?: string;
  icon?: string;
  image?: string;
}

export interface EntitiesEditorEvent {
  detail?: {
    entities?: EntityConfig[];
  };
  target?: EventTarget;
}

export interface EditorTarget extends EventTarget {
  value?: string;
  index?: number;
  checked?: boolean;
  configValue?: string;
  type?: InputType;
  config: ActionConfig;
}

export type MediaPlayerStates = 'off' | 'idle' | 'paused' | 'playing' | 'on';

export interface MediaPlayerAttributes {}

export interface StateObject<TState extends string, TAttributes = {}> {
  state: TState;
  attributes: TAttributes;
}

export interface MediaPlayerStateObject extends StateObject<MediaPlayerStates, MediaPlayerAttributes> {}
