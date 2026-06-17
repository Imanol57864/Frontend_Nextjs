import PopupShell from "./PopupShell";

export default function CreateAnalisisPopup() {
  return (
    <PopupShell id="createAnalisisPopup">
      <h3 id="createAnalisisPopup-title" />
      <div className="analysis-code-box">
        <span className="analysis-code-label">Código de análisis</span>
        <div className="analysis-code-wrapper">
          <div id="createAnalisisPopup-codigo_lab" className="analysis-prefix" />
          <input id="a_code_input" type="text" maxLength="3" placeholder="***" className="analysis-suffix-input" />
          <span className="analysis-code-label">Ingresa 3 dígitos para el análisis.</span>
        </div>
      </div>
      <div className="field-row">
        <span>Archivo</span>
        <input type="file" id="file_input" />
      </div>
    </PopupShell>
  );
}
