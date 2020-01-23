import { CSSResult, LitElement, PropertyValues, TemplateResult, css, customElement, html, property } from 'lit-element';
import { CardConfig, names } from './const';
import { HomeAssistant, LovelaceCardEditor, getLovelace, hasConfigOrEntityChanged } from 'custom-card-helpers';
import { Strings, localize, localizeToString } from '../../localize';

import { MediaPlayerStateObject } from '../../types';

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
  @property() public stateObj?: MediaPlayerStateObject;
  @property() private _config?: CardConfig;

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

    return html`
      <paper-icon-button aria-label="Turn off" icon="hass:power"></paper-icon-button>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        position: relative;
        font-size: 0px;
        border-radius: 2px;
      }
    `;
  }
}
