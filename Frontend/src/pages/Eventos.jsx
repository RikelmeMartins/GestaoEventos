import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { mensagemErro } from "../services/api";
import { MESES, NOMES_SITUACAO, diasAte, periodo, rotulo, situacao } from "../utils/datas";

const ABAS = [
    { id: "proximos", nome: "Próximos", inclui: (s) => s === "proximo" || s === "acontecendo", vazio: "Nenhum evento marcado para os próximos dias." },
    { id: "encerrados", nome: "Encerrados", inclui: (s) => s === "encerrado", vazio: "Nenhum evento encerrado ainda." },
    { id: "cancelados", nome: "Cancelados", inclui: (s) => s === "cancelado", vazio: "Nenhum evento cancelado." },
    { id: "todos", nome: "Todos", inclui: () => true, vazio: "Nenhum evento cadastrado." },
];

function quandoComeca(iso) {
    const dias = diasAte(iso);
    const d = new Date(iso);
    if (dias === 0) return "hoje";
    if (dias === 1) return "amanhã";
    return `em ${dias} dias (${d.getDate()} ${MESES[d.getMonth()]})`;
}

function Destaque({ eventos }) {
    const atual = eventos.find((e) => situacao(e) === "acontecendo");
    if (atual) return <p>Acontecendo agora: <strong>{atual.titulo}</strong>, em {atual.local}.</p>;

    const proximo = eventos.find((e) => situacao(e) === "proximo");
    if (proximo) return <p>Próximo: <strong>{proximo.titulo}</strong>, {quandoComeca(proximo.data_inicial)}.</p>;

    return <p>Nenhum evento marcado para os próximos meses.</p>;
}

function LinhasCarregando() {
    return [1, 2, 3, 4].map((n) => (
        <tr key={n} aria-hidden="true">
            <td className="col-evento"><span className="esqueleto" style={{ width: 260 }} /></td>
            <td className="col-quando"><span className="esqueleto" style={{ width: 120 }} /></td>
            <td className="col-local"><span className="esqueleto" style={{ width: 110 }} /></td>
            <td className="col-atividades num"><span className="esqueleto" style={{ width: 24, marginLeft: "auto" }} /></td>
            <td className="col-vagas num"><span className="esqueleto" style={{ width: 32, marginLeft: "auto" }} /></td>
        </tr>
    ));
}

export default function Eventos() {
    const navigate = useNavigate();
    const [eventos, setEventos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [abaAtual, setAbaAtual] = useState("proximos");
    const [busca, setBusca] = useState("");

    function carregar() {
        setCarregando(true);
        setErro("");
        api.get("/eventos/")
            .then((resposta) => setEventos(resposta.data))
            .catch((err) => setErro(mensagemErro(err)))
            .finally(() => setCarregando(false));
    }

    useEffect(carregar, []);

    const termo = busca.trim().toLowerCase();
    const buscados = eventos.filter((e) =>
        [e.titulo, e.local, e.categoria].some((campo) => campo?.toLowerCase().includes(termo))
    );
    const aba = ABAS.find((a) => a.id === abaAtual);
    const daAba = (a) => buscados.filter((e) => a.inclui(situacao(e)));
    const linhas = daAba(aba).sort((a, b) =>
        aba.id === "encerrados" ? b.data_inicial.localeCompare(a.data_inicial) : a.data_inicial.localeCompare(b.data_inicial)
    );

    return (
        <>
            <div className="titulo">
                <div>
                    <h1>Eventos</h1>
                    {!carregando && !erro && <Destaque eventos={[...eventos].sort((a, b) => a.data_inicial.localeCompare(b.data_inicial))} />}
                </div>
            </div>

            {erro ? (
                <div className="erro" role="alert">
                    <span>Não foi possível carregar os eventos. {erro}</span>
                    <button className="botao-texto" onClick={carregar}>Tentar de novo</button>
                </div>
            ) : (
            <section aria-label="Lista de eventos">
                <div className="abas" role="tablist">
                    {ABAS.map((a) => (
                    <button key={a.id} role="tab" aria-selected={a.id === abaAtual} onClick={() => setAbaAtual(a.id)}>
                        {a.nome}
                        {!carregando && <span className="contagem num">{daAba(a).length}</span>}
                    </button>
                    ))}
                </div>

                <div className="ferramentas">
                    <input
                        className="busca"
                        type="search"
                        placeholder="Buscar por nome, local ou categoria"
                        aria-label="Buscar eventos"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                    {!carregando && <span className="total">{linhas.length} {linhas.length === 1 ? "evento" : "eventos"}</span>}
                </div>

                {!carregando && linhas.length === 0 ? (
                    <p className="vazio">{termo ? `Nenhum evento encontrado para “${busca.trim()}”.` : aba.vazio}</p>
                ) : (
                <table className="tabela">
                    <thead>
                        <tr>
                            <th>Evento</th>
                            <th>Quando</th>
                            <th>Local</th>
                            <th className="num">Atividades</th>
                            <th className="num">Vagas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {carregando ? <LinhasCarregando /> : linhas.map((evento) => {
                            const s = situacao(evento);
                            return (
                                <tr key={evento.id} onClick={() => navigate(`/eventos/${evento.id}`)}>
                                    <td className="col-evento">
                                        <div className="evento-nome">
                                            <Link to={`/eventos/${evento.id}`} onClick={(e) => e.stopPropagation()}>{evento.titulo}</Link>
                                            {aba.id === "todos" && s !== "proximo" && <span className={`pilula ${s}`}>{NOMES_SITUACAO[s]}</span>}
                                            {aba.id === "proximos" && s === "acontecendo" && <span className="pilula acontecendo">{NOMES_SITUACAO[s]}</span>}
                                        </div>
                                        <p className="sublinha">{rotulo(evento.categoria)} · {evento.organizador?.nome ?? "—"}</p>
                                    </td>
                                    <td className="col-quando">{periodo(evento.data_inicial, evento.data_fim)}</td>
                                    <td className="col-local">{evento.local}</td>
                                    <td className="col-atividades num">
                                        {evento.atividades.length}<span className="unidade so-celular"> {evento.atividades.length === 1 ? "atividade" : "atividades"}</span>
                                    </td>
                                    <td className="col-vagas num">
                                        {evento.vagas}<span className="unidade so-celular"> vagas</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                )}
            </section>
            )}
        </>
    );    
}   