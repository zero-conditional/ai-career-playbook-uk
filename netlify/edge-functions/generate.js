// Server-side settings — the browser cannot change these.
const MODEL = "claude-sonnet-5-5"; // D1 confirmed 15 Nov 2026 (was claude-opus-4-8)
const MAX_TOKENS = 2000;
const MAX_PROMPT_CHARS = 12000;

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

export default async (req, context) => {
  if (req.method === "GET") {
    return json({ status: "ok" });
  }

  if (req.method !== "POST") {
    return json({ error: { message: "Use POST" } }, 405);
  }

  try {
    const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return json({ error: { message: "API key not set" } }, 500);
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: { message: "Invalid request." } }, 400);
    }

    // Accept exactly one user message containing a string prompt.
    const messages = body && Array.isArray(body.messages) ? body.messages : [];
    const first = messages[0];
    if (
      messages.length !== 1 ||
      !first ||
      first.role !== "user" ||
      typeof first.content !== "string" ||
      first.content.trim().length === 0
    ) {
      return json({ error: { message: "Invalid request." } }, 400);
    }
    if (first.content.length > MAX_PROMPT_CHARS) {
      return json(
        { error: { message: "Your answers are too long. Please shorten them and try again." } },
        400
      );
    }

    // Use streaming to send first byte quickly and avoid 40s header timeout
    const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        stream: true,
        messages: [{ role: "user", content: first.content }],
      }),
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      return json({ error: { message: errText } }, apiResponse.status);
    }

    // Stream: collect all text chunks, then return as standard API format
    // We use a TransformStream to start the response immediately
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Process stream in background
    (async () => {
      try {
        const reader = apiResponse.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        // Process one complete SSE line. Deltas whose "data:" line is split
        // across network chunks must be buffered first (see buffer handling
        // below) or their text is silently lost, corrupting the JSON.
        const handleLine = (line) => {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) return;
          const data = trimmed.slice(5).trim();
          if (!data || data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta && parsed.delta.text) {
              fullText += parsed.delta.text;
            }
          } catch {
            // skip non-JSON lines (event:, pings, blank lines)
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Keep any incomplete trailing line in the buffer for the next read.
          buffer += decoder.decode(value, { stream: true });
          let idx;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            handleLine(buffer.slice(0, idx));
            buffer = buffer.slice(idx + 1);
          }
        }
        // Flush any final line left without a trailing newline.
        handleLine(buffer);

        // Write the complete response as standard API format
        const result = JSON.stringify({ content: [{ type: "text", text: fullText }] });
        await writer.write(encoder.encode(result));
      } catch (err) {
        const errResult = JSON.stringify({ error: { message: String(err) } });
        await writer.write(encoder.encode(errResult));
      } finally {
        await writer.close();
      }
    })();

    // Return streaming response immediately (first byte sent right away)
    return new Response(readable, {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return json({ error: { message: String(err) } }, 500);
  }
};

export const config = {
  path: "/api/generate",
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
