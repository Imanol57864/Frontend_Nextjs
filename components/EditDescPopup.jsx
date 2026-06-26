import PopupShell from "./PopupShell";

const DESCRIPTION_FIELDS = [
  ["desc_toptext", "Nombre del análisis"],
  ["desc_metodo", "Metodología"],
  ["desc_respuesta", "Tiempo de respuesta"],
  ["desc_muestra_tipo", "Tipo de muestra"],
  ["desc_muestra_cantd", "Cantidad de muestra"]
];

const ACCREDITATION_OPTIONS = ["a", "a,b", "MrS", "Mna", "b", "c", "d", "e", "f", "Mna,b"];

export default function EditDescPopup() {
  return (
    <PopupShell id="editdescPopup" panelClassName="popup-panel popup-panel-lg" title="Editar descripción">
      <div id="editdescPopup-form">
        {DESCRIPTION_FIELDS.map(([id, label]) => (
          <div className="field-row" key={id}>
            <span>{label}</span>
            <textarea id={id} />
          </div>
        ))}
        <div className="field-row">
          <span>Acreditación</span>
          <select id="desc_acred">
            {ACCREDITATION_OPTIONS.map((value) => <option value={value} key={value}>{value}</option>)}
          </select>
        </div>
        <div className="field-row">
          <span>Indicaciones especiales</span>
          <textarea id="desc_bottomtext" placeholder="Se agrega la indicación de..." />
        </div>
      </div>
    </PopupShell>
  );
}
