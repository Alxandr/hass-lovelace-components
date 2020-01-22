import { CSSResult, LitElement, PropertyValues, TemplateResult, css, customElement, html, property } from 'lit-element';
import { CardConfig, names } from './const';
import { HomeAssistant, LovelaceCardEditor, getLovelace, hasConfigOrEntityChanged } from 'custom-card-helpers';
import { Strings, localize, localizeToString } from '../../localize';

@customElement(names.tag)
export class SimpleMediaControlCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement(names.editor) as LovelaceCardEditor;
  }

  public static getStubConfig(): object {
    return {};
  }

  @property() public hass?: HomeAssistant;
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

    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (this._config.show_warning) {
      return html`
        <ha-card>
          <div class="warning">${localize(Strings.ShowWarning)}</div>
        </ha-card>
      `;
    }

    return html`
      <ha-card>Test</ha-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .warning {
        display: block;
        color: black;
        background-color: #fce588;
        padding: 8px;
      }
    `;
  }
}
