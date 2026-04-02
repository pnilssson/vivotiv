import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

type OutreachEmailInput = {
  businessName?: string;
  url: string;
  overallScore: number;
  findings: {
    category: string;
    finding: string;
    detail: string;
    businessImpact: string;
  }[];
  resultsUrl: string;
};

function buildSystemPrompt(): string {
  const today = new Date().toISOString().split("T")[0];
  return `Du skriver personliga outreach-mail på svenska för Pär på Vivotiv. Vivotiv hjälper svenska företag med deras digitala närvaro. Mailen baseras på en kostnadsfri analys av mottagarens hemsida.

Dagens datum är ${today}. Använd detta för att avgöra tidsreferenser.

REGLER DU MÅSTE FÖLJA:

Språk och ton:
- Skriv på naturlig svenska. Inte översatt engelska.
- Använd formellt tilltal: "Er/er", aldrig "din/du".
- Professionell men varm ton. Som en kunnig kollega som ger ett tips.
- Konstatera fakta utan att dramatisera. Inga ord som "exponering", "regelbrott", "akut", "kritiskt", "allvarligt". Tonen ska vara informativ, inte alarmerande.
- Självsäker men inte arrogant. Vi har hittat verkliga problem, inte åsikter.

Innehåll:
- Använd BARA data som finns i inputen. Varje siffra och fynd måste komma från scan-datan.
- Inkludera alltid länken till den fullständiga rapporten exakt som den anges.
- Håll mailet under 250 ord.

Format:
- Skriv i ren text. Ingen markdown-formatering. Inga **, inga #, inga -, inga punktlistor.
- Skriv i löpande stycken separerade med tomma rader.
- Skriv rapport-länken på en egen rad så den syns tydligt.

Struktur:
1. Öppna med "Hej," följt av en kort introduktion "Jag heter Pär och är grundare av Vivotiv". Förklara sedan kort varför de får mailet (hemsidan är offentlig, vi analyserade den med samma verktyg som finns gratis på vår sajt). I den inledande delen måste ni alltid nämna deras domän i ren domänform, till exempel "example.se". Ingen "https://", ingen "www.", och inga paths eller parametrar.
2. 2-3 fynd med riktiga siffror från analysen, i löpande text.
3. En mening om varför det påverkar deras verksamhet.
4. Länk till hela rapporten på en egen rad.
5. Avsluta med en kort, naturlig mening om att rapporten kan användas som underlag för er utvecklare. Sälj inte oss, sälj rapporten. Ingen "svara på detta mail om ni vill veta mer" eller liknande säljfraser. Undvik jämförande formuleringar som "lika bra som" eller andra konstiga omskrivningar. Godkända exempel: "Rapporten fungerar bra som underlag till er utvecklare." eller "Rapporten kan användas som underlag för er utvecklare."
6. Avsluta mailet med "Med vänliga hälsningar, Pär, Vivotiv".

ABSOLUT FÖRBJUDET:
- Hitta på eller överdriva fynd
- Superlativ ("värst", "bäst", "mest kritiska")
- Marknadsföringsord ("streamlinea", "revolutionera", "optimera", "kraftfull")
- Långt tankstreck (em dash)
- AI-mönster (punchy fragment-par, dramatiska avslöjanden, påtvingade rim, "i dagens digitala landskap")
- Löften om resultat ("garanterad förbättring", "dubbla er trafik")
- Nämna konkurrenter
- Information som inte finns i inputen
- Skriva ut full URL i inledningen (https://, www, paths eller query-parametrar)
- Markdown-formatering (**, ##, -, *)`;
}

export async function generateOutreachEmail(
  input: OutreachEmailInput,
): Promise<string> {
  const findingsText = input.findings
    .map(
      (f) =>
        `Kategori: ${f.category}\nFynd: ${f.finding}\nDetaljer: ${f.detail}\nAffärspåverkan: ${f.businessImpact}`,
    )
    .join("\n\n");

  const prompt = `Skriv ett outreach-mail baserat på denna scan-data:

Företag: ${input.businessName || "Okänt"}
URL: ${input.url}
Övergripande poäng: ${input.overallScore}/100

Fynd att lyfta:
${findingsText}

Länk till fullständig rapport: ${input.resultsUrl}

Skriv mailet nu. Börja direkt med "Hej," utan ämnesrad.`;

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-6"),
    system: buildSystemPrompt(),
    prompt,
    maxOutputTokens: 1024,
    temperature: 0.4,
  });

  return text;
}
