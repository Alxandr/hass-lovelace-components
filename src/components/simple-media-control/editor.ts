import { CSSResult, LitElement, TemplateResult, css, customElement, html, property } from 'lit-element';
import { CardConfig, names } from './const';
import { EditorTarget, EntitiesEditorEvent } from '../../types';
import { HomeAssistant, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';
import { cardStruct, loadLovelaceFile } from '../../utils';

const cardConfigStruct = cardStruct({
  type: 'string',
  entity: 'string?',
});

@customElement(names.editor)
export class SimpleMediaControlEditor extends LitElement implements LovelaceCardEditor {
  @property() public hass?: HomeAssistant;
  @property() private _config?: CardConfig;

  public setConfig(config: CardConfig): void {
    this._config = config;
  }

  private get _entity(): string {
    return this._config?.entity ?? '';
  }

  protected render(): TemplateResult | void {
    if (!this.hass) {
      return html``;
    }

    loadLovelaceFile(this.hass, 'hui-entities-card-editor.js');

    return html`
      <div class="card-config">
        <ha-entity-picker
          .label="${this.hass.localize('ui.panel.lovelace.editor.card.generic.entity')} (${this.hass.localize(
            'ui.panel.lovelace.editor.card.config.required',
          )})"
          .hass="${this.hass}"
          .value="${this._entity}"
          .configValue=${'entity'}
          include-domains='["media_player"]'
          @change="${this._valueChanged}"
          allow-custom-entity
        ></ha-entity-picker>
      </div>
    `;
  }

  private _valueChanged(ev: EntitiesEditorEvent): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target! as EditorTarget;

    if ((this as any)[`_${target.configValue}`] === target.value) {
      return;
    }

    if (target.configValue) {
      if (target.value === '') {
        delete (this._config as any)[target.configValue!];
      } else {
        this._config = {
          ...this._config,
          [target.configValue!]: target.value,
        };
      }
    }

    fireEvent(this, 'config-changed', { config: this._config });
  }
}
