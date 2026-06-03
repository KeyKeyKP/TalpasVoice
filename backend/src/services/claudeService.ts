import Anthropic from "@anthropic-ai/sdk";

let anthropic: Anthropic;
function getAnthropic() {
  if (!anthropic) anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "missing" });
  return anthropic;
}

export interface WorkEntry {
  opis_dela: string;
  stranka: string;
  kontakt: string | null;
  vrsta_prijave: string | null;
  datum: string;
  stevilo_ur: number;
  obisk: string | null;
  dostop_osebni_podatki: string | null;
  podroben_opis: string | null;
  opravil: string;
  vrsta_elementa: string | null;
  pot: string | null;
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
- kontakt: kontaktna oseba / kdo je naročil delo (če je omenjeno, sicer null)
- vrsta_prijave: kako je bila prijava oddana (elektronska pošta, telefon, osebno, drugo) — če ni omenjeno, nastavi null
- datum: datum opravljenega dela (format DD.MM.YYYY). Če datum ni omenjen, uporabi: ${defaultDate}
- stevilo_ur: število ur (število, zaokroženo na 0.25). Če čas ni eksplicitno podan, nastavi 0
- obisk: ali je bilo opravljeno z obiskom (da/ne) — če ni omenjeno, nastavi null
- dostop_osebni_podatki: ali je bil dostop do osebnih podatkov (da/ne) — če ni omenjeno, nastavi null
- opis_dela: KRATEK povzetek opravljenega dela (1 stavek, max 10 besed). Primer: "Pregled backupov", "Servis tiskalnika", "Namestitev VPN"
- podroben_opis: PODROBNI opis opravljenega dela. Vse podrobnosti iz govora.
- opravil: ime osebe ki je delo opravila (če je omenjeno, sicer prazen niz "")
- vrsta_elementa: null (prazno, za ročni vnos)
- pot: null (prazno, za ročni vnos)

PRAVILA ZA OPIS:
- Če je govor kratek (npr. "pregledal sem backupe"), kopiraj isto besedilo v oba opisa
- Če je govor daljši, naredi:
  - opis_dela: kratek povzetek (1 stavek, max 10 besed)
  - podroben_opis: vse podrobnosti iz govora

PRAVILA ZA URE:
- Ure pretvori v decimalno obliko: pol ure = 0.5, četrt ure = 0.25, ura in pol = 1.5, dve uri = 2
- Besedne zveze za čas: "četrt ure" = 0.25, "pol ure" = 0.5, "tri četrt ure" = 0.75
- Številka z vejico na koncu (npr. "2," ali "3,") — vejica NI decimalna, zapiši samo število (2 ali 3)
- Decimalne vrednosti s vejico (npr. "0,5" ali "1,5") pretvori v piko (0.5 ali 1.5)

SPLOŠNA PRAVILA:
- Če je omenjenih več del za različne stranke ALI različnih tipov dela pri isti stranki, vrni več objektov
- Imena podjetij zapiši v polni obliki kot se pojavljajo v besedilu
- Danes je ${defaultDate}
- "Včeraj" pomeni dan pred ${defaultDate}

Vrni SAMO veljaven JSON array, brez dodatnega besedila, brez markdown formatiranja.

BESEDILO:
${text}`;

  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY ni nastavljen v .env");
  const message = await getAnthropic().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Nepričakovan odgovor od Claude API");
  }

  let jsonText = content.text.trim();
  jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) {
    throw new Error("Claude ni vrnil veljavnega JSON array-a");
  }

  // Post-process entries: clean stevilo_ur
  const entries = parsed.map((entry: any) => {
    entry.stevilo_ur = Number(String(entry.stevilo_ur).replace(/,/g, '.').replace(/[^0-9.]/g, ''));
    if (isNaN(entry.stevilo_ur)) entry.stevilo_ur = 0;
    return entry;
  });

  return entries as WorkEntry[];
}
