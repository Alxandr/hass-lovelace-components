import { tagNames } from '../../utils';

export const names = tagNames('simple-media-control');

export interface CardConfig {
  type: 'simple-media-control';
  show_warning?: boolean;
  show_error?: boolean;
  test_gui?: boolean;
  entity?: string;
}
