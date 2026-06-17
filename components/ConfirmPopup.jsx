import PopupShell from "./PopupShell";

export default function ConfirmPopup() {
  return (
    <PopupShell id="confirmPopup" panelClassName="popup-panel popup-panel-sm" acceptLabel="Aceptar" acceptClassName="btn btn-accept-destructive">
      <p id="confirmPopup-msg" className="popup-message" />
    </PopupShell>
  );
}
