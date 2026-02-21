import { put } from "@vercel/blob";

export const config = { runtime: "nodejs" };

function clampCount(n) {
  if (!Number.isFinite(n)) return 10;
  return Math.max(1, Math.min(50, Math.floor(n))); // max 50 per click (prevents overload)
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const count = clampCount(Number(url.searchParams.get("count")));

    const saved = [];
    for (let i = 0; i < count; i++) {
      const imgRes = await fetch("https://thispersondoesnotexist.com/image", {
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      if (!imgRes.ok) throw new Error(`Face fetch failed: ${imgRes.status}`);
      const buf = Buffer.from(await imgRes.arrayBuffer());

      // simple quality gate (avoid tiny/broken images)
      if (buf.length < 50_000) {
        i--;
        continue;
      }

      const key = `faces/${crypto.randomUUID()}.jpg`;
      const blob = await put(key, buf, {
        access: "public",
        contentType: "image/jpeg"
      });

      saved.push(blob.url);
    }

    res.status(200).json({ ok: true, count: saved.length, urls: saved });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}
