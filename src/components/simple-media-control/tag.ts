import { CSSResult, LitElement, PropertyValues, TemplateResult, css, customElement, html, property } from 'lit-element';
import { CardConfig, names } from './const';
import { HomeAssistant, LovelaceCardEditor, getLovelace, hasConfigOrEntityChanged } from 'custom-card-helpers';
import { MediaPlayerStateObject, MediaPlayerStates } from '../../types';
import { Strings, localize, localizeToString } from '../../localize';

import { MediaPlayerEntity } from '../../entities/media-player';

@customElement(names.tag)
export class SimpleMediaControlCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await customElements.whenDefined('hui-media-control-card');
    const HuiMediaControlCard = document.createElement('hui-media-control-card').constructor;
    return await (HuiMediaControlCard as any).getConfigElement();
  }

  public static getStubConfig(): object {
    return {};
  }

  @property() public hass?: HomeAssistant;
  @property() private _config?: CardConfig;

  private _player?: MediaPlayerEntity;

  public setConfig(config: CardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config || config.show_error) {
      throw new Error(localizeToString(Strings.InvalidConfiguration));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this._config = {
      ...config,
    };
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    const stateObj = this.hass!.states[this._config.entity];
    if (!stateObj) {
      return html``;
    }

    const player = new MediaPlayerEntity(this.hass!, stateObj as MediaPlayerStateObject);
    this._player = player;

    return html`
      <paper-card class=${player.isOff ? 'off' : 'on'}>
        <paper-icon-button aria-label="Turn off" icon="hass:power" @click=${this._togglePower}></paper-icon-button>
      </paper-card>
    `;
  }

  private _togglePower() {
    this._player?.togglePower();
  }

  static get styles(): CSSResult {
    return css`
      paper-icon-button {
        transition: color linear 0.5s;
      }

      .on paper-icon-button {
        color: var(--label-badge-green);
      }

      .off paper-icon-button {
        color: var(--label-badge-grey);
      }
    `;
  }
}
