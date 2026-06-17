export default function PopupShell({
  id,
  panelClassName = "popup-panel",
  title,
  children,
  acceptLabel = "Enviar",
  acceptClassName = "btn btn-accept-constructive",
  cancelLabel = "Cancelar"
}) {
  return (
    <div id={id} className="confirm-overlay hide" role="dialog" aria-modal="true">
      <div className={panelClassName}>
        {title ? <h3>{title}</h3> : null}
        {children}
        <div className="confirm-actions">
          <button id={`${id}-true`} className={acceptClassName} type="button">
            {acceptLabel}
          </button>
          <button id={`${id}-false`} className="btn btn-cancel" type="button">
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
