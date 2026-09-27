# Image prompts for the Fishinity Pro landing page

The landing page renders **labelled placeholders** until you drop real images into
`public/images/`. UI mockups (the hero app shot, feature-card previews, the data
card) are built in CSS and need **no** images — AI-generated screenshots look
garbled, CSS stays crisp.

Only the **photographic** slots below need images. Generate each with Gemini
(Google AI Studio → "Create images", or the Gemini API image model), download,
and save it under `public/images/` with the **exact filename** shown. Refresh the
page and the placeholder is replaced automatically.

> Tip: ask Gemini for a **16:9** (or the ratio noted) image, then export as JPG.

---

## 1. `public/images/hero-sky.jpg`  — hero backdrop (16:9, wide)

Sits faintly behind the hero headline (rendered at ~40% opacity over a sky-blue
gradient), so keep it soft and airy — nothing busy near the centre.

**Prompt:**
> A serene, minimal photograph of a calm lake at golden hour, soft pale blue sky
> with gentle wispy clouds, faint mist over glassy water, distant treeline low on
> the horizon, lots of empty sky, dreamy and bright, soft focus, pastel tones,
> cinematic, high resolution, 16:9 aspect ratio. No people, no text, no
> watermark, no boats.

---

## 2. `public/images/avatar-1.jpg` — testimonial: Kieran Moore (1:1, square)

**Prompt:**
> Professional headshot portrait of a friendly white man in his early 30s with
> short brown hair and light stubble, wearing a casual olive fishing jacket,
> outdoors by a lake with a softly blurred green background, natural daylight,
> warm and approachable expression, sharp focus on the face, 1:1 square, high
> resolution. No text, no watermark.

## 3. `public/images/avatar-2.jpg` — testimonial: Sarah Lowe (1:1, square)

**Prompt:**
> Professional headshot portrait of a confident woman in her late 30s with
> shoulder-length auburn hair, wearing a navy outdoor gilet, standing near a
> reservoir with a softly blurred blue-grey background, natural daylight, calm
> friendly expression, sharp focus on the face, 1:1 square, high resolution. No
> text, no watermark.

## 4. `public/images/avatar-3.jpg` — testimonial: Marco Bianchi (1:1, square)

**Prompt:**
> Professional headshot portrait of a man in his 40s with short dark hair and a
> trimmed beard, wearing a branded quarter-zip fishing top, softly blurred
> outdoor tackle-shop background, natural daylight, warm confident smile, sharp
> focus on the face, 1:1 square, high resolution. No text, no watermark.

---

## Optional extras

### `public/images/og-image.jpg` — social share card (1200×630)

**Prompt:**
> Clean marketing hero graphic for "Fishinity Pro", a pale sky-blue gradient
> background with soft clouds, a floating white app dashboard card showing a
> fishing catch dashboard with charts, teal accents, modern SaaS aesthetic,
> centred composition, 1200x630. No lorem text.

If you add this, wire it into `src/app/layout.tsx` metadata via
`openGraph: { images: ["/images/og-image.jpg"] }`.

---

### Using the Gemini API instead of the web UI

```bash
curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"<paste a prompt from above>"}]}]}' \
  > out.json
# the image bytes are base64 in candidates[0].content.parts[].inlineData.data — decode to a .jpg
```

(Your key must be a valid AI Studio key — standard keys begin with `AIza`.)
