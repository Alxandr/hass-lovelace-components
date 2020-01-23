import { CSSResult, LitElement, PropertyValues, TemplateResult, css, customElement, html, property } from 'lit-element';
import { CardConfig, names } from './const';
import { HomeAssistant, LovelaceCardEditor, getLovelace, hasConfigOrEntityChanged } from 'custom-card-helpers';
import { MediaPlayerStateObject, MediaPlayerStates } from '../../types';
import { Strings, localize, localizeToString } from '../../localize';

import { MediaPlayerEntity } from '../../entities/media-player';
import { classMap } from 'lit-html/directives/class-map';

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
      return html`
        <hui-warning>
          ${this.hass.localize('ui.panel.lovelace.warning.entity_not_found', 'entity', this._config.entity)}
        </hui-warning>
      `;
    }

    const player = new MediaPlayerEntity(this.hass!, stateObj as MediaPlayerStateObject);
    this._player = player;

    return html`
      <ha-card
        class=${classMap({
          on: !player.isOff,
          off: player.isOff,
          muted: player.isMuted === true,
        })}
      >
        <div class="card-content">
          <div>
            <state-badge
              class=${classMap({
                pointer: true,
              })}
              .hass=${this.hass}
              .stateObj=${stateObj}
              .overrideIcon=${'hass:power'}
              @action=${this._togglePower}
              tabindex="0"
            ></state-badge>
            <!--<paper-icon-button
              aria-label=${player.isOff ? 'Turn on' : 'Turn off'}
              icon="hass:power"
              @click=${this._togglePower}
            ></paper-icon-button>-->
          </div>
        </div>
      </ha-card>
    `;
  }

  private _togglePower() {
    this._player?.togglePower();
  }

  static get styles(): CSSResult {
    return css`
      state-badge {
        transition: color linear 0.5s;
      }

      .on state-badge {
        color: var(--label-badge-green);
      }

      .off state-badge {
        color: var(--label-badge-grey);
      }
    `;
  }
}
