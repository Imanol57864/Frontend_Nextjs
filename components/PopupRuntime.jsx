"use client";

import { useEffect } from "react";

function resolvePopup(id, beforeAccept) {
  const modal = document.getElementById(id);
  const accept = document.getElementById(`${id}-true`);
  const cancel = document.getElementById(`${id}-false`);
  if (!modal || !accept || !cancel) return Promise.resolve(false);

  modal.classList.remove("hide");
  return new Promise((resolve) => {
    accept.onclick = () => {
      const value = beforeAccept?.();
      if (value === false) return;
      modal.classList.add("hide");
      resolve(value ?? true);
    };
    cancel.onclick = () => {
      modal.classList.add("hide");
      resolve(false);
    };
  });
}

function readDescriptionForm(rowData) {
  const elements = {};
  Object.entries(rowData || {}).forEach(([key, value]) => {
    const element = document.getElementById(key);
    if (element) {
      element.value = value ?? "";
      elements[key] = element;
    }
  });

  return () => {
    const values = {};
    Object.entries(elements).forEach(([key, element]) => {
      values[key] = element.value;
      element.value = "";
    });
    return values;
  };
}

export default function PopupRuntime() {
  useEffect(() => {
    window.confirmPopup = (message) => {
      const text = document.getElementById("confirmPopup-msg");
      if (text) text.textContent = message;
      return resolvePopup("confirmPopup");
    };

    window.addFilePopup = () => resolvePopup("addFilePopup");

    window.createAnalisisPopup = (labname, codigoLab) => {
      const title = document.getElementById("createAnalisisPopup-title");
      const prefix = document.getElementById("createAnalisisPopup-codigo_lab");
      const fileInput = document.getElementById("file_input");
      const codeInput = document.getElementById("a_code_input");
      if (title) title.textContent = `Nuevo análisis para ${labname}`;
      if (prefix) prefix.textContent = codigoLab;
      if (codeInput) codeInput.oninput = (event) => { event.target.value = event.target.value.replace(/\D/g, ""); };

      return resolvePopup("createAnalisisPopup", () => {
        if (!fileInput?.files?.[0]) return alert("Ingresa una cotización antes de crear el análisis."), false;
        if (!/^\d{3}$/.test(codeInput?.value || "")) return alert("Ingresa un código identificador de análisis válido."), false;
        return true;
      });
    };

    window.editdescPopup = (rowData) => {
      const collect = readDescriptionForm(rowData);
      return resolvePopup("editdescPopup", collect);
    };

    window.activateLoadScreen = (time = 3000) => {
      const loadscreen = document.getElementById("loadscreen");
      loadscreen?.classList.add("active");
      window.setTimeout(() => {
        loadscreen?.classList.remove("active");
      }, time);
    };

    return () => {
      delete window.confirmPopup;
      delete window.addFilePopup;
      delete window.createAnalisisPopup;
      delete window.editdescPopup;
      delete window.activateLoadScreen;
    };
  }, []);

  return null;
}



