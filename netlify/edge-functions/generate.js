export default async (req, context) => {
  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { "content-type": "application/json" },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: { message: "Use POST" } }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: { message: "API key not set" } }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const body = await req.json();

    // Use streaming to send first byte quickly and avoid 40s header timeout
    const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: body.model || "claude-opus-4-8",
        max_tokens: body.max_tokens || 4000,
        stream: true,
        messages: body.messages || [],
      }),
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      return new Response(
        JSON.stringify({ error: { message: errText } }),
        { status: apiResponse.status, headers: { "content-type": "application/json" } }
      );
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
    return new Response(
      JSON.stringify({ error: { message: String(err) } }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
};

export const config = {
  path: "/api/generate",
};
