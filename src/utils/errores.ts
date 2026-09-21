// utils/parseApiError.ts
export function parseApiError(error: any): string {
  const responseData = error?.response?.data;

  if (!responseData) {
    if (typeof error?.message === "string" && !error.message.includes("status code")) {
      return error.message;
    }
    return "Ocurrió un error inesperado.";
  }

  if (typeof responseData === "string") return responseData;

  // Array de mensajes de validación (ej. ValidationPipe del backend)
  if (Array.isArray(responseData.message)) {
    const formatted = responseData.message
      .map((msg: any) => {
        if (typeof msg === "string") return msg;
        if (msg && typeof msg === "object" && typeof msg.message === "string") {
          return msg.message;
        }
        return null;
      })
      .filter(Boolean)
      .join(". ");

    if (formatted) return formatted;
  }

  // Mensaje string directo
  if (typeof responseData.message === "string") return responseData.message;

  // Caso donde message es un objeto con campo message
  if (
    typeof responseData.message === "object" &&
    responseData.message !== null &&
    "message" in responseData.message
  ) {
    const inner = responseData.message.message;
    if (typeof inner === "string") return inner;
    if (Array.isArray(inner)) {
      return inner
        .map((msg: any) => (typeof msg === "string" ? msg : msg?.message))
        .filter(Boolean)
        .join(". ");
    }
  }

  // Si tiene un campo error como string
  if (typeof responseData.error === "string" && responseData.error.trim().length > 0) {
    return responseData.error;
  }

  return "Ocurrió un error inesperado.";
}
