/**
 * Send the species image generation brief to support@gofishvip.com
 *
 * Run with: npx tsx scripts/send-species-image-brief.ts
 *
 * Requires RESEND_API_KEY in .env
 */

import { Resend } from "resend";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || "PartyBoatsUSA <noreply@notifications.partyboatsusa.com>";
const TO = ["support@gofishvip.com"];

const IMAGE_PROMPT = `
=============================================================
NANOBANANA 2 - FISH SPECIES IMAGE GENERATION PROMPT
=============================================================

OBJECTIVE:
Generate 157 photo-realistic fish species illustrations for PartyBoatsUSA.com.
Every image must look like it belongs to the same professional illustration set.

=============================================================
MASTER PROMPT TEMPLATE (use for EVERY fish):
=============================================================

"A photo-realistic scientific illustration of a [FISH NAME] ([SCIENTIFIC NAME]), full body, side profile facing left. The fish is rendered with anatomically accurate proportions, natural coloring, and realistic scale/fin detail. Studio lighting with soft, even illumination from the upper left. Clean, solid pure white background (#FFFFFF) with no shadows, no ground, no water, no bubbles, no other elements. The fish is centered in the frame with equal padding on all sides. High detail, sharp focus, natural museum-quality specimen illustration style. 4K resolution, 16:9 aspect ratio."

=============================================================
CRITICAL CONSISTENCY RULES (apply to ALL images):
=============================================================

1. ORIENTATION: Every fish faces LEFT (head on the left side)
2. BACKGROUND: Pure white (#FFFFFF), completely clean, no gradients
3. LIGHTING: Soft studio lighting from upper-left, no harsh shadows
4. PERSPECTIVE: Perfect side profile (lateral view), slight 5-degree angle for depth
5. FRAMING: Fish centered, occupying roughly 70-80% of the frame width
6. STYLE: Photo-realistic, NOT cartoon, NOT watercolor, NOT oil painting
7. DETAIL LEVEL: Museum/field-guide quality, every fin ray and scale pattern visible
8. COLORS: True-to-life natural coloring as the fish appears when freshly caught
9. ASPECT RATIO: 16:9 (landscape) for all images
10. RESOLUTION: Minimum 1920x1080 pixels
11. NO EXTRAS: No hooks, no hands, no water splashes, no text, no watermarks
12. FINS: All fins fully extended and visible (dorsal, anal, pectoral, pelvic, caudal)

=============================================================
SPECIES-SPECIFIC NOTES:
=============================================================

For SHARKS: Show full body including tail, slight 3/4 angle to show body shape
For RAYS: Show from above (dorsal view) rather than side profile
For FLATFISH: Show the "eyed" side (colored side), flat orientation
For BILLFISH: Ensure the bill/sword is fully visible and proportionally accurate
For TRIGGERFISH: Show the trigger spine in the raised position
For PUFFERFISH: Show in normal (non-inflated) state
For SAILFISH: Show the sail (dorsal fin) partially raised

=============================================================
FILE NAMING CONVENTION:
=============================================================

Use the slug name with .png extension:
  red-snapper.png
  yellowfin-tuna.png
  mahi-mahi.png
  etc.

=============================================================
OUTPUT FORMAT:
=============================================================

- File format: PNG with transparent background (preferred) or white background
- If transparent background is possible, that is ideal for web use
- Dimensions: 1920x1080 minimum (16:9)
- File size: Optimize for web (under 500KB per image if possible)

=============================================================
QUALITY CHECK:
=============================================================

Before finalizing each image, verify:
[ ] Fish species is anatomically correct
[ ] Fish faces LEFT
[ ] Background is pure white or transparent
[ ] No extra elements (water, hooks, text, etc.)
[ ] Colors match real-life appearance
[ ] All fins visible and extended
[ ] Consistent lighting and style with other images in the set
[ ] Resolution meets minimum requirements
`;

const FISH_LIST = `
=============================================================
COMPLETE SPECIES LIST (157 fish)
=============================================================

## Snappers
1. Red Snapper (Lutjanus campechanus)
2. Yellowtail Snapper (Ocyurus chrysurus)
3. Mangrove Snapper (Lutjanus griseus)
4. Mutton Snapper (Lutjanus analis)
5. Lane Snapper (Lutjanus synagris)
6. Vermilion Snapper (Rhomboplites aurorubens)
7. Cubera Snapper (Lutjanus cyanopterus)
8. Silk Snapper (Lutjanus vivanus)
9. Queen Snapper (Etelis oculatus)
10. Dog Snapper (Lutjanus jocu)
11. Schoolmaster Snapper (Lutjanus apodus)
12. Mahogany Snapper (Lutjanus mahogoni)
13. Blackfin Snapper (Lutjanus buccanella)
14. Wenchman Snapper (Pristipomoides aquilonaris)

## Groupers
15. Red Grouper (Epinephelus morio)
16. Black Grouper (Mycteroperca bonaci)
17. Gag Grouper (Mycteroperca microlepis)
18. Goliath Grouper (Epinephelus itajara)
19. Scamp Grouper (Mycteroperca phenax)
20. Snowy Grouper (Hyporthodus niveatus)
21. Warsaw Grouper (Hyporthodus nigritus)
22. Yellowfin Grouper (Mycteroperca venenosa)
23. Yellowedge Grouper (Hyporthodus flavolimbatus)
24. Yellowmouth Grouper (Mycteroperca interstitialis)
25. Speckled Hind (Epinephelus drummondhayi)
26. Rock Hind (Epinephelus adscensionis)
27. Nassau Grouper (Epinephelus striatus)
28. Tiger Grouper (Mycteroperca tigris)
29. Coney Grouper (Cephalopholis fulva)

## Tunas
30. Yellowfin Tuna (Thunnus albacares)
31. Bluefin Tuna (Thunnus thynnus)
32. Blackfin Tuna (Thunnus atlanticus)
33. Bigeye Tuna (Thunnus obesus)
34. Skipjack Tuna (Katsuwonus pelamis)
35. Albacore Tuna (Thunnus alalunga)
36. Little Tunny (Euthynnus alletteratus)

## Mackerels
37. King Mackerel (Scomberomorus cavalla)
38. Spanish Mackerel (Scomberomorus maculatus)
39. Cero Mackerel (Scomberomorus regalis)
40. Wahoo (Acanthocybium solandri)
41. Atlantic Bonito (Sarda sarda)

## Billfish
42. Blue Marlin (Makaira nigricans)
43. White Marlin (Kajikia albida)
44. Sailfish (Istiophorus platypterus)
45. Swordfish (Xiphias gladius)
46. Spearfish (Tetrapturus pfluegeri)

## Jacks & Pompanos
47. Greater Amberjack (Seriola dumerili)
48. Lesser Amberjack (Seriola fasciata)
49. Almaco Jack (Seriola rivoliana)
50. Crevalle Jack (Caranx hippos)
51. Yellow Jack (Carangoides bartholomaei)
52. Blue Runner (Caranx crysos)
53. Permit (Trachinotus falcatus)
54. Florida Pompano (Trachinotus carolinus)
55. African Pompano (Alectis ciliaris)
56. Lookdown (Selene vomer)
57. Bar Jack (Carangoides ruber)
58. Rainbow Runner (Elagatis bipinnulata)

## Drums & Croakers
59. Red Drum (Sciaenops ocellatus)
60. Black Drum (Pogonias cromis)
61. Spotted Seatrout (Cynoscion nebulosus)
62. Weakfish (Cynoscion regalis)
63. Atlantic Croaker (Micropogonias undulatus)
64. Spot (Leiostomus xanthurus)
65. Sheepshead (Archosargus probatocephalus)
66. Whiting (Menticirrhus spp.)

## Flatfish
67. Summer Flounder (Paralichthys dentatus)
68. Winter Flounder (Pseudopleuronectes americanus)
69. Southern Flounder (Paralichthys lethostigma)
70. Gulf Flounder (Paralichthys albigutta)
71. Pacific Halibut (Hippoglossus stenolepis)
72. California Halibut (Paralichthys californicus)
73. Windowpane Flounder (Scophthalmus aquosus)

## Sharks
74. Blacktip Shark (Carcharhinus limbatus)
75. Spinner Shark (Carcharhinus brevipinna)
76. Bull Shark (Carcharhinus leucas)
77. Hammerhead Shark (Sphyrna spp.)
78. Mako Shark (Isurus oxyrinchus)
79. Thresher Shark (Alopias vulpinus)
80. Tiger Shark (Galeocerdo cuvier)
81. Lemon Shark (Negaprion brevirostris)
82. Nurse Shark (Ginglymostoma cirratum)
83. Dusky Shark (Carcharhinus obscurus)
84. Sandbar Shark (Carcharhinus plumbeus)
85. Bonnethead Shark (Sphyrna tiburo)

## Dolphinfish
86. Mahi-Mahi (Coryphaena hippurus)
87. Pompano Dolphinfish (Coryphaena equiselis)

## Cobia
88. Cobia (Rachycentron canadum)

## Bass & Bluefish
89. Striped Bass (Morone saxatilis)
90. Bluefish (Pomatomus saltatrix)
91. Black Sea Bass (Centropristis striata)

## Cod & Pollock
92. Atlantic Cod (Gadus morhua)
93. Haddock (Melanogrammus aeglefinus)
94. Pollock (Pollachius virens)
95. Red Hake (Urophycis chuss)
96. White Hake (Urophycis tenuis)

## Porgies & Wrasses
97. Porgy (Stenotomus chrysops)
98. Red Porgy (Pagrus pagrus)
99. Jolthead Porgy (Calamus bajonado)
100. Tautog (Tautoga onitis)
101. Hogfish (Lachnolaimus maximus)
102. California Sheephead (Semicossyphus pulcher)
103. Cunner (Tautogolabrus adspersus)

## Tarpon & Flats
104. Tarpon (Megalops atlanticus)
105. Snook (Centropomus undecimalis)
106. Bonefish (Albula vulpes)
107. Ladyfish (Elops saurus)
108. Tripletail (Lobotes surinamensis)

## Pacific Rockfish
109. Vermilion Rockfish (Sebastes miniatus)
110. Copper Rockfish (Sebastes caurinus)
111. Blue Rockfish (Sebastes mystinus)
112. Canary Rockfish (Sebastes pinniger)
113. Bocaccio (Sebastes paucispinis)
114. Yelloweye Rockfish (Sebastes ruberrimus)
115. Black Rockfish (Sebastes melanops)
116. Quillback Rockfish (Sebastes maliger)
117. Olive Rockfish (Sebastes serranoides)
118. China Rockfish (Sebastes nebulosus)
119. Starry Rockfish (Sebastes constellatus)
120. Gopher Rockfish (Sebastes carnatus)

## Pacific Game Fish
121. California Yellowtail (Seriola dorsalis)
122. White Seabass (Atractoscion nobilis)
123. Lingcod (Ophiodon elongatus)
124. Barracuda (Sphyraena argentea)
125. Pacific Bonito (Sarda chiliensis)
126. Kelp Bass (Paralabrax clathratus)
127. Spotted Bay Bass (Paralabrax maculatofasciatus)
128. Barred Sand Bass (Paralabrax nebulifer)
129. Cabezon (Scorpaenichthys marmoratus)
130. Opah (Lampris guttatus)
131. Pacific Mackerel (Scomber japonicus)
132. Yellowfin Croaker (Umbrina roncador)
133. Corbina (Menticirrhus undulatus)

## Triggerfish & Tilefish
134. Gray Triggerfish (Balistes capriscus)
135. Queen Triggerfish (Balistes vetula)
136. Ocean Triggerfish (Canthidermis sufflamen)
137. Golden Tilefish (Lopholatilus chamaeleonticeps)
138. Blueline Tilefish (Caulolatilus microps)

## Rays & Skates
139. Stingray (Dasyatis spp.)
140. Cownose Ray (Rhinoptera bonasus)
141. Eagle Ray (Aetobatus narinari)

## Other Species
142. Great Barracuda (Sphyraena barracuda)
143. Snowy Cod (Lepidion ensiferus)
144. Spadefish (Chaetodipterus faber)
145. Toadfish (Opsanus tau)
146. Pinfish (Lagodon rhomboides)
147. Mullet (Mugil cephalus)
148. Seatrout (Cynoscion arenarius)
149. Jewfish Snapper (Pristipomoides typus)
150. Remora (Echeneis naucrates)
151. Banded Rudderfish (Seriola zonata)
152. Ocean Sunfish (Mola mola)
153. Needlefish (Strongylura marina)
154. Northern Puffer (Sphoeroides maculatus)
155. Searobin (Prionotus spp.)
156. Scad (Decapterus spp.)
157. American Shad (Alosa sapidissima)
`;

async function sendBrief() {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY not found in environment");
    process.exit(1);
  }

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background:#f5f5f5;">
<div style="max-width:800px;margin:0 auto;background:#fff;padding:32px;border-radius:8px;">

<h1 style="color:#004685;margin-top:0;">PartyBoatsUSA - Fish Species Image Generation Brief</h1>

<p>This email contains the complete image generation prompt and species list for generating 157 fish species illustrations for PartyBoatsUSA.com using NanoBanana 2.</p>

<hr style="border:none;border-top:2px solid #004685;margin:24px 0;">

<h2>Image Generation Prompt</h2>
<pre style="background:#f8f8f8;padding:16px;border-radius:6px;overflow-x:auto;font-size:13px;line-height:1.6;white-space:pre-wrap;">${IMAGE_PROMPT}</pre>

<hr style="border:none;border-top:2px solid #004685;margin:24px 0;">

<h2>Complete Species List</h2>
<pre style="background:#f8f8f8;padding:16px;border-radius:6px;overflow-x:auto;font-size:13px;line-height:1.6;white-space:pre-wrap;">${FISH_LIST}</pre>

<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
<p style="color:#6b7280;font-size:12px;">Generated by Claude Code for PartyBoatsUSA.com</p>

</div>
</body>
</html>`;

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: TO,
      subject: "PartyBoatsUSA - Fish Species Image Generation Brief (157 Species)",
      html,
    });
    console.log("Email sent successfully!", result);
  } catch (error) {
    console.error("Failed to send email:", error);
    process.exit(1);
  }
}

sendBrief();
