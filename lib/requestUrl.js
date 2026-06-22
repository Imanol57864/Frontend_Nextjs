function firstHeaderValue(value) {
  return value?.split(",", 1)[0]?.trim() || "";
}

export function getPublicOrigin(request) {
  if (process.env.APP_URL) {
    return new URL(process.env.APP_URL).origin;
  }

  const requestUrl = new URL(request.url);
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const host = forwardedHost || firstHeaderValue(request.headers.get("host")) || requestUrl.host;
  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));
  const protocol = forwardedProto === "http" || forwardedProto === "https"
    ? forwardedProto
    : requestUrl.protocol.replace(":", "");

  return new URL(`${protocol}://${host}`).origin;
}

export function getPublicUrl(request, pathname) {
  return new URL(pathname, getPublicOrigin(request));
}
