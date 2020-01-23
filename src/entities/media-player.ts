import { HomeAssistant } from 'custom-card-helpers';
import { MediaPlayerStateObject } from '../types';

export class MediaPlayerEntity {
  constructor(private hass: HomeAssistant, private stateObj: MediaPlayerStateObject) {}

  get isOff() {
    return this.stateObj.state === 'off';
  }

  togglePower() {
    if (this.isOff) {
      this.turnOn();
    } else {
      this.turnOff();
    }
  }

  turnOff() {
    this.callService('turn_off');
  }

  turnOn() {
    this.callService('turn_on');
  }

  volumeDown() {
    this.callService('volume_down');
  }

  volumeUp() {
    this.callService('volume_up');
  }

  private callService(service: string, data: any = {}) {
    data.entity_id = this.stateObj.entity_id;
    this.hass.callService('media_player', service, data);
  }
}
