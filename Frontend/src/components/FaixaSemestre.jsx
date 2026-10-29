import { useEffect, useRef } from "react";
import { data, Link } from "react-router-dom";
import { MESES, semestreAtual, situacao } from "../utils/datas";

export default function FaixaSemestre({ eventos, agora = new Date() }) {
    const semestre = semestreAtual(agora);
    const total = semestre.fim - semestre.inicio;

    const posicao = (data) => Math.min(100, Math.max(0, ((new Date(data) - semestre.inicio) / total) * 100));

    const doSemestre = eventos
        .filter((e) => new Date(e.data_fim) >= semestre.inicio && new Date(e.data_inicial) < semestre.fim)
        .sort((a, b) => a.data_inicial.localeCompare(b.data_inicial));

    const meses = [];
    for (let d = new Date(semestre.inicio); d < semestre.fim; d = new Date(d.getFullYear, d.getMonth() + 1, 1)){
        const nome = MESES[d.getMonth()];
        meses.push({ nome: nome.charAt(0).toUpperCase() + nome.slice(1), esquerda: posicao(d)});
    }

    const hojeVisivel = agora >= semestre.inicio  && agora < semestre.fim;
    
    const rolagem = useRef(null);
    useEffect(() => {
        const el = rolagem.current;
        if (!el || !hojeVisivel || el.scrollWidth <= el.clientWidth) return;
        el.scrollLeft = (el.scrollWidth * posicao(agora)) / 100 - 40;
    }, [eventos]);

    return (
        <section className="painel semestre" aria-labelledby="titulo-semestre">
            <div className="painel-cabecalho">
                <h2 id="titulo-semestre">Calendário do semestre {semestre.rotulo}</h2>
                <div className="legenda">
                    <span><i className="proximo" /> Próximo</span>
                    <span><i className="encerrado" /> Encerrado</span>
                    <span><i className="cancelado" /> Cancelado</span>
                </div>
            </div>

            {doSemestre.length === 0 ? (
                <p className="vazio">Nenhum evento marcado para este semestre.</p>
            ) : (
                <div className="rolagem" ref={rolagem}>
                    <div className="faixa">
                        <div className="meses">
                            {meses.map((m) => <span key={m.nome} style={{ left: `${m.esquerda}%` }}>{m.nome}</span>)}
                        </div>
                        <div className="linhas-mes">
                            {meses.slice(1).map((m) => <span key={m.nome} style={{ left: `${m.esquerda}%` }} />)}
                        </div>

                        {doSemestre.map((evento) => {
                            const s = situacao(evento, agora);
                            const classe = s === "acontecendo" ? "proximo" : s;
                            const inicio = posicao(evento.data_inicial);
                            const largura = posicao(evento.data_fim) - inicio;
                            const rotuloAEsquerda = inicio > 62;
                            const estiloRotulo = rotuloAEsquerda
                                ? { right: `calc(${100 - inicio}% + 8px)` }
                                : { left: `calc(${inicio + largura}% + 8px)` };
                                return (
                                    <div key={evento.id} className="raia">
                                        <span className={`barra ${classe}`} style={{ left: `${inicio}%`, width: `${largura}%` }} />
                                        <Link to={`/eventos/${evento.id}`} className={`barra-rotulo ${classe}`} style={estiloRotulo}>
                                            {evento.titulo}
                                        </Link>
                                    </div>
                                );
                        })}
                        {hojeVisivel && (
                            <div className="hoje" style={{ left: `${posicao(agora)}%` }}>
                                <span>Hoje, {agora.getDate()} {MESES[agora.getMonth()]}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}