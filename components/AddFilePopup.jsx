import PopupShell from "./PopupShell";

export default function AddFilePopup({ idAnalisis }) {
  return (
    <PopupShell id="addFilePopup" title={`Agregar un archivo a "${idAnalisis}"`}>
      <div className="field-row">
        <input type="file" id="file_input" />
      </div>
    </PopupShell>
  );
}
