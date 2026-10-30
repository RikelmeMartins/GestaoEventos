export const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const DIA_MS = 24 * 60 * 60 * 1000;

const doisDigitos = (n) => String(n).padStart(2, "0"); // 9 -> "09"

export function hora(iso) {
  const d = new Date(iso);
  return `${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
}

export function dataCurta(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export function diaDaSemana(data) {
  const semana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return `${semana[data.getDay()]}, ${data.getDate()} ${MESES[data.getMonth()]}`;
}

function mesmoDia(a, b) {
  return a.toDateString() === b.toDateString();
}

export function periodo(inicioIso, fimIso) {
  const a = new Date(inicioIso);
  const b = new Date(fimIso);
  if (mesmoDia(a, b)) return `${dataCurta(inicioIso)}, ${hora(inicioIso)}–${hora(fimIso)}`;
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()}–${b.getDate()} ${MESES[b.getMonth()]} ${b.getFullYear()}`;
  }
  return `${a.getDate()} ${MESES[a.getMonth()]} – ${dataCurta(fimIso)}`;
}

export function diasAte(iso, agora = new Date()) {
  const alvo = new Date(iso);
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const inicioAlvo = new Date(alvo.getFullYear(), alvo.getMonth(), alvo.getDate());
  return Math.round((inicioAlvo - inicioHoje) / DIA_MS);
}

export function duracaoEmDias(inicioIso, fimIso) {
  return diasAte(fimIso, new Date(inicioIso)) + 1;
}

export function situacao(evento, agora = new Date()) {
  if (evento.status === "cancelado") return "cancelado";
  if (new Date(evento.data_fim) < agora) return "encerrado";
  if (new Date(evento.data_inicial) <= agora) return "acontecendo";
  return "proximo";
}

export const NOMES_SITUACAO = {
  proximo: "Próximo",
  acontecendo: "Acontecendo agora",
  encerrado: "Encerrado",
  cancelado: "Cancelado",
};

export function semestreAtual(agora = new Date()) {
  const ano = agora.getFullYear();
  const segundo = agora.getMonth() >= 6;
  return {
    rotulo: `${ano}.${segundo ? 2 : 1}`,
    inicio: new Date(ano, segundo ? 7 : 1, 1),
    fim: new Date(ano, segundo ? 12 : 6, 1), // primeiro dia depois do semestre
  };
}

export function agruparPorDia(atividades) {
  const grupos = new Map();
  for (const atividade of [...atividades].sort((a, b) => a.data_inicio.localeCompare(b.data_inicio))) {
    const d = new Date(atividade.data_inicio);
    const chave = d.toDateString();
    if (!grupos.has(chave)) grupos.set(chave, { dia: d, atividades: [] });
    grupos.get(chave).atividades.push(atividade);
  }
  return [...grupos.values()];
}

export function rotulo(texto) {
  if (!texto) return "";
  const t = texto.replaceAll("_", " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const paraIcs = (iso) => iso.replace(/[-:]/g, "").slice(0, 15); // 20261110T080000
const escaparIcs = (texto = "") => texto.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

export function baixarIcs(evento) {
  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gestao de Eventos//PT-BR",
    "BEGIN:VEVENT",
    `UID:evento-${evento.id}@gestao-eventos`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART:${paraIcs(evento.data_inicial)}`,
    `DTEND:${paraIcs(evento.data_fim)}`,
    `SUMMARY:${escaparIcs(evento.titulo)}`,
    `LOCATION:${escaparIcs(evento.local)}`,
    `DESCRIPTION:${escaparIcs(evento.descricao ?? "")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const arquivo = new Blob([linhas.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(arquivo);
  link.download = `${evento.titulo}.ics`;
  link.click();
  URL.revokeObjectURL(link.href);
}