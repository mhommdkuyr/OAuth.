function whatsappConfig() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const graphVersion = process.env.WHATSAPP_GRAPH_VERSION;

  if (!accessToken || !phoneNumberId || !graphVersion) {
    throw new Error("WhatsApp Cloud API environment variables are incomplete.");
  }

  return { accessToken, phoneNumberId, graphVersion };
}

async function graphRequest(path: string, body: unknown) {
  const { accessToken, graphVersion } = whatsappConfig();
  const response = await fetch(`https://graph.facebook.com/${graphVersion}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`WhatsApp API ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload;
}

export async function sendWhatsAppText(to: string, body: string) {
  const { phoneNumberId } = whatsappConfig();
  return graphRequest(`/${phoneNumberId}/messages`, {
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
  return graphRequest(`/${phoneNumberId}/messages`, {
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
    `https://graph.facebook.com/${graphVersion}/${mediaId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );

  const metadata = await metadataResponse.json();
  if (!metadataResponse.ok || !metadata.url) {
    throw new Error("Could not resolve WhatsApp media URL.");
  }

  const mediaResponse = await fetch(metadata.url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!mediaResponse.ok) {
    throw new Error("Could not download WhatsApp media.");
  }

  const buffer = Buffer.from(await mediaResponse.arrayBuffer());
  return {
    buffer,
    mimeType: metadata.mime_type || "image/jpeg",
  };
}
