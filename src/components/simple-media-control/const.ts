import { LovelaceCardConfig } from 'custom-card-helpers';
import { tagNames } from '../../utils';

export const names = tagNames('simple-media-control');

export interface CardConfig extends LovelaceCardConfig {
  entity: string;
}
