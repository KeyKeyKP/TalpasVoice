import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface WorkEntry {
  stranka: string;
  delo: string;
  datum: string;
  kontakt: string | null;
  stevilo_ur: number | null;
  opis: string | null;
  opravil: string;
}

export async function extractWorkEntries(
  text: string,
  defaultDate: string
): Promise<WorkEntry[]> {
  const prompt = `Si pomočnik za ekstrakcijo podatkov o opravljenem delu iz prostega slovenskega besedila.

Iz spodnjega besedila ekstrahiraj naslednje podatke in jih vrni kot JSON array objektov
(ker ena transkripcija lahko vsebuje več vnosov dela):

Za vsak vnos dela ekstrahiraj:
- stranka: ime stranke/podjetja
- delo: kratek opis tipa dela
- datum: datum opravljenega dela (format DD.MM.YYYY). Če datum ni omenjen, uporabi: ${defaultDate}
- kontakt: kontaktna oseba / kdo je naročil delo (če je omenjeno, sicer null)
- stevilo_ur: število ur (število, zaokroženo na 0.25, sicer null)
- opis: podrobnejši opis dela (če je podan, sicer null)
- opravil: ime osebe ki je delo opravila (če je omenjeno, sicer prazen niz "")

PRAVILA:
- Če je omenjenih več del za različne stranke ALI različnih tipov dela pri isti stranki, vrni več objektov
- Ure pretvori v decimalno obliko (pol ure = 0.5, četrt ure = 0.25, ura in pol = 1.5, dve uri = 2)
- Besedne zveze za čas: "četrt ure" = 0.25, "pol ure" = 0.5, "tri četrt ure" = 0.75
- Če čas ni eksplicitno podan, nastavi null
- Imena podjetij zapiši v polni obliki kot se pojavljajo v besedilu
- Danes je ${defaultDate}
- "Včeraj" pomeni dan pred ${defaultDate}

Vrni SAMO veljaven JSON array, brez dodatnega besedila, brez markdown formatiranja.

BESEDILO:
${text}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Nepričakovan odgovor od Claude API");
  }

  let jsonText = content.text.trim();
  // Remove potential markdown code blocks
  jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) {
    throw new Error("Claude ni vrnil veljavnega JSON array-a");
  }

  return parsed as WorkEntry[];
}
