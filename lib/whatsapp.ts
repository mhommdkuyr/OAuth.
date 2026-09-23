const DEFAULT_WHATSAPP_GRAPH_VERSION = "v26.0";

function normalizeGraphVersion(raw?: string) {
  let value = (raw || DEFAULT_WHATSAPP_GRAPH_VERSION).trim();

  try {
    if (/^https?:\/\//i.test(value)) {
      const url = new URL(value);
      const parts = url.pathname.split("/").filter(Boolean);
      value = parts.at(-1) || "";
    }
  } catch {
    value = "";
  }

  value = value.replace(/^\/+|\/+$/g, "");
  if (/^\d+\.\d+$/.test(value)) value = \`v\${value}\`;

  if (!/^v\d+\.\d+$/.test(value)) {
    throw new Error(
      "WHATSAPP_GRAPH_VERSION must be like v26.0, 26.0, or a Meta Graph API URL ending in /v26.0."
    );
  }

  return value;
}

function whatsappConfig() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const graphVersion = normalizeGraphVersion(process.env.WHATSAPP_GRAPH_VERSION);

  if (!accessToken || !phoneNumberId) {
    throw new Error(
      "WhatsApp Cloud API environment variables are incomplete: access token or phone number ID is missing."
    );
  }

  return { accessToken, phoneNumberId, graphVersion };
}

async function graphRequest(path: string, body: unknown) {
  const { accessToken, graphVersion } = whatsappConfig();
  const response = await fetch(
    \`https://graph.facebook.com/\${graphVersion}\${path}\`,
    {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("WhatsApp Graph API error", {
      status: response.status,
      graphVersion,
      path,
      payload,
    });
    throw new Error(
      \`WhatsApp API \${response.status}: \${JSON.stringify(payload)}\`
    );
  }

  return payload;
}

export async function checkWhatsAppConnection() {
  const { accessToken, phoneNumberId, graphVersion } = whatsappConfig();

  const response = await fetch(
    \`https://graph.facebook.com/\${graphVersion}/\${phoneNumberId}\`,
    {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      cache: "no-store",
    }
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      httpStatus: response.status,
      graphVersion,
      phoneNumberId,
      metaError: {
        message: payload?.error?.message ?? "Meta Graph API rejected the request.",
        type: payload?.error?.type ?? null,
        code: payload?.error?.code ?? null,
        subcode: payload?.error?.error_subcode ?? null,
      },
    };
  }

  return {
    ok: true,
    httpStatus: response.status,
    graphVersion,
    phoneNumberId,
    meta: {
      id: payload?.id ?? null,
      messagingProduct: payload?.messaging_product ?? null,
    },
  };
}

export async function sendWhatsAppText(to: string, body: string) {
  const { phoneNumberId } = whatsappConfig();

  return graphRequest(\`/\${phoneNumberId}/messages\`, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { preview_url: false, body },
  });
}

export async function sendWhatsAppProductList(
  to: string,
  title: string,
  rows: { id: string; title: string; description?: string }[]
) {
  const { phoneNumberId } = whatsappConfig();

  return graphRequest(\`/\${phoneNumberId}/messages\`, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: title },
      action: {
        button: "عرض المنتجات",
        sections: [{ title: "المنتجات", rows: rows.slice(0, 10) }],
      },
    },
  });
}

export async function downloadWhatsAppMedia(mediaId: string) {
  const { accessToken, graphVersion } = whatsappConfig();

  const metadataResponse = await fetch(
    \`https://graph.facebook.com/\${graphVersion}/\${mediaId}\`,
    {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      cache: "no-store",
    }
  );

  const metadata = await metadataResponse.json();

  if (!metadataResponse.ok || !metadata.url) {
    throw new Error(
      \`Could not resolve WhatsApp media URL: \${JSON.stringify(metadata)}\`
    );
  }

  const mediaResponse = await fetch(metadata.url, {
    headers: { Authorization: \`Bearer \${accessToken}\` },
    cache: "no-store",
  });

  if (!mediaResponse.ok) {
    throw new Error(
      \`Could not download WhatsApp media: \${mediaResponse.status}\`
    );
  }

  const buffer = Buffer.from(await mediaResponse.arrayBuffer());

  return {
    buffer,
    mimeType: metadata.mime_type || "image/jpeg",
  };
}
