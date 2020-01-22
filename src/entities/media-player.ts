import { HomeAssistant } from 'custom-card-helpers';
import { MediaPlayerStateObject } from '../types';

export class MediaPlayerEntity {
  constructor(private hass: HomeAssistant, private stateObj: MediaPlayerStateObject) {}

  get isOff() {
    return this.stateObj.state === 'off';
  }
}
