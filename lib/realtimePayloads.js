export function tablePayloadEvent(payload, idField) {
  return {
    type: payload.eventType,
    id: payload.old?.[idField] || payload.new?.[idField],
    new_data: JSON.parse(JSON.stringify(payload.new || {}))
  };
}

export function analysisPayloadEventForLab(payload, labId) {
  const event = tablePayloadEvent(payload, "id_analisis");
  console.log("TEST_02!!", payload); // TO DO
  return event;
}

export function filePayloadMatchesAnalysis(payload, idAnalisis) {
  if (payload.eventType === "DELETE" && !payload.old?.id_analisis) return true;
  return payload.old?.id_analisis === idAnalisis || payload.new?.id_analisis === idAnalisis;
}
