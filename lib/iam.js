import IAM from "./IAM.json";

export function canUseIam(section, permission, areaId) {
  const rule = IAM?.[section]?.[permission];

  if (rule === true) return true;
  if (Array.isArray(rule)) return rule.includes(Number(areaId));

  return false;
}

export { IAM };
