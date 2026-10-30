// Finta conversazione e finto pannello tessuti, disegnati in HTML a grandezza reale.
// Tessuti, codici e nomi sono inventati. L'etichetta ESEMPIO DIMOSTRATIVO · DATI FITTIZI è sempre visibile.
export const ETI = 'ESEMPIO DIMOSTRATIVO · DATI FITTIZI';

const STATO = { d: ['Disponibile', 'st-d'], e: ['In esaurimento', 'st-e'], n: ['Non disponibile', 'st-n'] };
const TESSUTI = [
  ['TS-4102', 'Gessato Blu Notte', 'Lana', '280 g', 'e'],
  ['TS-4108', 'Gessato Fine Navy', 'Lana', '275 g', 'd'],
  ['TS-2207', 'Spina Sabbia', 'Lana e lino', '260 g', 'd'],
  ['TS-3318', 'Principe Grigio', 'Lana', '300 g', 'n'],
];
export const stato = k => `<span class="st ${STATO[k][1]}">${STATO[k][0]}</span>`;

export function chat(r) {
  return `<div class="chat">
    <div class="ch-top"><b>Area rivenditori</b><span>Da lui le 15:20 · In Sardegna le 02:10</span></div>
    <div class="ch-msg">
      <p class="m tu ${r(4)}">Hi, is TS-4102 still available for a made-to-measure order?</p>
      <p class="m as ${r(5)}">Good evening. TS-4102 Midnight Chalk Stripe is <b>low in stock</b>: wool, 280 g. The closest alternative is TS-4108 Fine Navy Stripe, <b>available</b>, same composition and a similar weight, colour and pattern.</p>
      <p class="m tu ${r(6)}">Can you hold 3 metres for us?</p>
      <p class="m as ${r(7)}">I'm passing this to the sales office, who will reply to you directly.</p>
    </div>
  </div>`;
}

export function pannello(r) {
  return `<div class="pan">
    <div class="pa-top"><b>Pannello tessuti</b><span>Aggiungi a mano</span><span>Importa da Excel</span></div>
    <table><thead><tr><th>Codice</th><th>Tessuto</th><th class="hn">Composizione</th><th class="hn">Peso</th><th>Stato</th></tr></thead><tbody>
      ${TESSUTI.map(t => `<tr><td>${t[0]}</td><td><b>${t[1]}</b></td><td class="hn">${t[2]}</td><td class="hn">${t[3]}</td><td>${stato(t[4])}</td></tr>`).join('')}
    </tbody></table>
    <div class="bozza ${r(8)}"><div class="bz-t"><b>Bozza di risposta alla mail di un retailer</b><i>In attesa di approvazione</i></div>
      <p>«Dear Anna, TS-4102 is low in stock. We suggest TS-4108 as the closest alternative…»</p>
      <div class="bz-az"><span class="ok">Approva e invia</span><span>Modifica</span></div></div>
  </div>`;
}
