import React from "react";
import "./ConfirmDialog.css";

/**
 * Componente reutilizable para reemplazar window.confirm()
 * Uso:
 *   const [confirmConfig, setConfirmConfig] = useState(null);
 *   
 *   const handleAction = () => {
 *     setConfirmConfig({
 *       title: "Confirmar acción",
 *       message: "¿Estás seguro?",
 *       onConfirm: () => { // lógica aquí },
 *       onCancel: () => setConfirmConfig(null)
 *     });
 *   };
 *   
 *   return (
 *     <>
 *       <button onClick={handleAction}>Acción</button>
 *       {confirmConfig && <ConfirmDialog {...confirmConfig} />}
 *     </>
 *   );
 */
export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmText = "Confirmar", cancelText = "Cancelar" }) {
  const handleConfirm = () => {
    onConfirm();
    onCancel(); // cierra el diálogo
  };

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-dialog-title">{title}</h3>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-buttons">
          <button className="confirm-dialog-btn confirm-dialog-btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="confirm-dialog-btn confirm-dialog-btn-confirm" onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
