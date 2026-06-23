import PopupShell from "./PopupShell";

export default function CreateAnalisisPopup() {
  return (
    <PopupShell id="createAnalisisPopup">
      <h3 id="createAnalisisPopup-title">Nuevo análisis</h3>
      <label className="field-row" htmlFor="createAnalisisPopup-lab">
        <span>Laboratorio</span>
        <select id="createAnalisisPopup-lab" defaultValue="">
          <option value="" disabled>Selecciona un laboratorio</option>
        </select>
      </label>
      <div className="analysis-code-box">
        <span className="analysis-code-label">Código de análisis</span>
        <div className="analysis-code-wrapper">
          <div id="createAnalisisPopup-codigo_lab" className="analysis-prefix" />
          <input id="a_code_input" type="text" placeholder="001-S" className="analysis-suffix-input" />
        </div>
      </div>
      <div className="field-row">
        <span>Archivo</span>
        <input type="file" id="file_input" />
      </div>
    </PopupShell>
  );
}
