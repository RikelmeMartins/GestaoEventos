import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import FolhaCalendario from "../components/FolhaCalendario";
import { useAuth } from "../contexts/AuthContext";
import api, { mensagemErro } from "../services/api";
import {
    NOMES_SITUACAO, agruparPorDia, baixarIcs, dataCurta, diaDaSemana, diasAte, duracaoEmDias, hora, periodo, rotulo, situacao,
} from "../utils/datas";

function Numeros({ evento, s }) {
    const dias = duracaoEmDias(evento.data_inicial, evento.data_fim);
    const horas = Math.round((new Date(evento.data_fim) - new Date(evento.data_inicial)) / 36e5);
    const faltam = diasAte(evento.data_inicial);

    let ultimo = null;
    if (s === "encerrado") ultimo = { rotulo: "Terminou há", valor: -diasAte(evento.data_fim), unidade: "dias" };
    else if (s === "acontecendo") {
        const restam = diasAte(evento.data_fim);
        ultimo = restam === 0 ? { rotulo: "Termina", valor: "Hoje" } : { rotulo: "Termina em", valor: restam, unidade: "dias" };
    } else if (s === "proximo") {
        ultimo = faltam === 1 ? { rotulo: "Começa", valor: "Amanhã" } : { rotulo: "Começa em", valor: faltam, unidade: "dias" };
    }

    const itens = [
        { rotulo: "Vagas", valor: evento.vagas, unidade: "lugares" },
        { rotulo: "Atividades", valor: evento.atividades.length },
        dias > 1
            ? { rotulo: "Duração", valor: dias, unidade: "dias" }
            : { rotulo: "Duração", valor: horas, unidade: horas === 1 ? "hora" : "horas" },
        ultimo,
    ].filter(Boolean);

    return (
        <dl className="numeros">
            {itens.map((item) => (
                <div key={item.rotulo}>
                    <dt>{item.rotulo}</dt>
                    <dd>{item.valor}{item.unidade && <small>{item.unidade}</small>}</dd>
                </div>
            ))}
        </dl>
    );
}

function Programacao({ atividades }) {
    const dias = agruparPorDia(atividades);
    return (
        <section className="painel programacao" aria-labelledby="titulo-programacao">
            <div className="painel-cabecalho">
                <h2 id="titulo-programacao">Programação</h2>
                {dias.length > 0 && (
                    <span className="total">
                        {atividades.length} {atividades.length === 1 ? "atividade" : "atividades"} em {dias.length} {dias.length === 1 ? "dia" : "dias"}
                    </span>
                )}
            </div>
            {dias.length === 0 ? (
                <p className="vazio">A programação deste evento ainda não foi publicada.</p>
            ) : (
                <div className="dias">
                    {dias.map(({ dia, atividades: doDia }) => (
                        <div key={dia.toDateString()} className="dia">
                            <h3>{diaDaSemana(dia)}</h3>
                            <ol>
                                {doDia.map((a) => (
                                    <li key={a.id} className="atividade">
                                        <span className="horario">{hora(a.data_inicio)}–{hora(a.data_fim)}</span>
                                        <h4>{a.titulo}</h4>
                                        <p className="quem">{[a.palestrante, a.local].filter(Boolean).join(" · ")}</p>
                                        <span className="pilula">{rotulo(a.tipo)}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default function EventoDetalhe() {
    const { id } = useParams();
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [evento, setEvento] = useState(null);
    const [erro, setErro] = useState("");
    const [inscrito, setInscrito] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [erroInscricao, setErroInscricao] = useState("");

    const carregar = useCallback(async () => {
        try {
            const { data } = await api.get(`/eventos/${id}`);
            setEvento(data);
            if (usuario) {
                const minhas = await api.get("/inscricoes/minhas");
                setInscrito(minhas.data.some((i) => i.evento_id === data.id && i.status === "ativa"));
            } else {
                setInscrito(false);
            }
        } catch (err) {
            setErro(mensagemErro(err));
        }
    }, [id, usuario]);

    useEffect(() => {
        setEvento(null);
        setErro("");
        setErroInscricao("");
        carregar();
    }, [carregar]);

    async function alternarInscricao() {
        if (!usuario) {
            navigate("/login", { state: { de: location.pathname } });
            return;
        }
        setErroInscricao("");
        setEnviando(true);
        try {
            if (inscrito) await api.delete(`/eventos/${id}/inscricao`);
            else await api.post(`/eventos/${id}/inscricao`);
            await carregar();
        } catch (err) {
            setErroInscricao(mensagemErro(err));
        } finally {
            setEnviando(false);
        }
    }

    const trilha = (
        <nav className="trilha" aria-label="Você está em">
            <Link to="/">Eventos</Link> <span aria-hidden="true">/</span> <span>{evento?.titulo ?? "…"}</span>
        </nav>
    );

    if (erro) {
        return (
            <>
                {trilha}
                <h1 className="titulo">Evento</h1>
                <div className="erro" role="alert">
                    <span>{erro}</span>
                    <Link to="/" className="botao-texto">Voltar para os eventos</Link>
                </div>
            </>
        );
    }

    if (!evento) {
        return (
            <div aria-busy="true">
                {trilha}
                <span className="esqueleto" style={{ width: 420, height: 34, marginBottom: 12 }} />
                <span className="esqueleto" style={{ width: 300, marginBottom: 24 }} />
                <span className="esqueleto" style={{ height: 82, marginBottom: 24 }} />
                <span className="esqueleto" style={{ height: 320 }} />
            </div>
        );
    }

    const s = situacao(evento);
    const podeSalvar = s === "proximo" || s === "acontecendo";

    const botaoAgenda = (
        <button className="botao botao-grande" onClick={() => baixarIcs(evento)}>Salvar na agenda</button>
    );

    const botaoInscricao = (
        <button className="botao botao-principal botao-grande" onClick={alternarInscricao} disabled={enviando}>
            {enviando ? "Aguarde…" : inscrito ? "Cancelar inscrição" : "Inscrever-se"}
        </button>
    );

    return (
        <>
            {trilha}

            <header className="cabecalho-evento">
                <FolhaCalendario data={evento.data_inicial} situacao={s} />
                <div className="info">
                    <h1>
                        {evento.titulo}
                        {s !== "proximo" && <span className={`pilula ${s}`}>{NOMES_SITUACAO[s]}</span>}
                    </h1>
                    <p className="meta">{periodo(evento.data_inicial, evento.data_fim)} · {evento.local}</p>
                </div>
                {podeSalvar && <div className="acoes">{botaoInscricao} {botaoAgenda}</div>}
            </header>

            {podeSalvar && <div className="acoes-celular">{botaoInscricao}{botaoAgenda}</div>}

            {erroInscricao && <p className="erro" role="alert">{erroInscricao}</p>}
            {inscrito && podeSalvar && <p className="meta">Você está inscrito neste evento.</p>}

            {s === "cancelado" && (
                <p className="aviso-cancelado">Este evento foi cancelado. {evento.descricao}</p>
            )}

            <Numeros evento={evento} s={s} />

            <div className="grade-detalhe">
                <Programacao atividades={evento.atividades} />

                <section className="painel sobre" aria-labelledby="titulo-sobre">
                    <div className="painel-cabecalho">
                        <h2 id="titulo-sobre">Sobre o evento</h2>
                    </div>
                    {s !== "cancelado" && (
                        <p className="descricao">{evento.descricao || "O organizador ainda não escreveu uma descrição."}</p>
                    )}
                    <dl className="ficha">
                        <div><dt>Responsável</dt><dd>{evento.organizador?.nome ?? "—"}</dd></div>
                        <div><dt>Local</dt><dd>{evento.local}</dd></div>
                        <div><dt>Categoria</dt><dd>{rotulo(evento.categoria)}</dd></div>
                        <div><dt>Publicado em</dt><dd>{evento.criado_em ? dataCurta(evento.criado_em) : "—"}</dd></div>
                    </dl>
                </section>
            </div>
        </>
    );
}