import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { mensagemErro } from "../services/api";
import { dataCurta, diaDaSemana, frequencia, hora, jaComecou } from "../utils/datas";

function atividadeInicial(atividades) {
    const comecadas = atividades.filter((a) => jaComecou(a.data_inicio));
    return (comecadas.at(-1) ?? atividades[0])?.id ?? null;
}

export default function Inscritos() {
    const { id } = useParams();
    const [evento, setEvento] = useState(null);
    const [inscritos, setInscritos] = useState([]);
    const [atividadeId, setAtividadeId] = useState(null);
    const [erro, setErro] = useState("");
    const [erroPresenca, setErroPresenca] = useState("");
    const [salvando, setSalvando] = useState(null);

    useEffect(() => {
        Promise.all([api.get(`/eventos/${id}`), api.get(`/eventos/${id}/inscritos`)])
            .then(([respostaEvento, respostaInscritos]) => {
                setEvento(respostaEvento.data);
                setInscritos(respostaInscritos.data);
                setAtividadeId(atividadeInicial(respostaEvento.data.atividades));
            })
            .catch((err) => setErro(mensagemErro(err)));
    }, [id]);

    async function marcarPresenca(inscricao, presente) {
        setErroPresenca("");
        setSalvando(inscricao.id);
        try {
            const { data } = await api.put(`/atividades/${atividadeId}/presencas/${inscricao.id}`, { presente });
            setInscritos(inscritos.map((i) => (i.id === data.id ? data : i)));
        } catch (err) {
            setErroPresenca(mensagemErro(err));
        } finally {
            setSalvando(null);
        }
    }

    const trilha = (
        <nav className="trilha" aria-label="Você está em">
            <Link to="/painel">Meus eventos</Link> <span aria-hidden="true">/</span>{" "}
            <Link to={`/eventos/${id}`}>{evento?.titulo ?? "…"}</Link> <span aria-hidden="true">/</span>{" "}
            <span>Inscritos</span>
        </nav>
    );

    if (erro) {
        return (
            <>
                {trilha}
                <div className="erro" role="alert">
                    <span>{erro}</span>
                    <Link to="/painel" className="botao-texto">Voltar ao painel</Link>
                </div>
            </>
        );
    }

    if (!evento) {
        return (
            <div aria-busy="true">
                {trilha}
                <span className="esqueleto" style={{ width: 320, height: 34, marginBottom: 24 }} />
                <span className="esqueleto" style={{ height: 240 }} />
            </div>
        );
    }

    const atividades = evento.atividades;
    const atividade = atividades.find((a) => a.id === atividadeId);
    const podeMarcar = evento.status !== "cancelado" && atividade && jaComecou(atividade.data_inicio);
    const presentesNaAtividade = inscritos.filter((i) => i.atividades_presentes.includes(atividadeId)).length;

    let aviso = "";
    if (evento.status === "cancelado") aviso = "Evento cancelado: não há presença para registrar.";
    else if (atividades.length === 0) aviso = "Cadastre a programação do evento para poder registrar presença.";
    else if (atividade && !podeMarcar) aviso = "A presença poderá ser marcada quando esta atividade começar.";

    return (
        <>
            {trilha}

            <div className="titulo">
                <div>
                    <h1>Inscritos</h1>
                    <p><strong>{inscritos.length}</strong> de {evento.vagas} vagas preenchidas em {evento.titulo}</p>
                    <p>
                        Certificado a partir de <strong>{evento.frequencia_minima}%</strong> de frequência
                        {evento.frequencia_minima === 0 && " (qualquer presença)"}
                    </p>
                </div>
            </div>

            {atividades.length > 0 && inscritos.length > 0 && (
                <label className="campo seletor-atividade">
                    Chamada da atividade
                    <select value={atividadeId ?? ""} onChange={(e) => setAtividadeId(Number(e.target.value))}>
                        {atividades.map((a) => (
                            <option key={a.id} value={a.id}>
                                {diaDaSemana(new Date(a.data_inicio))} · {hora(a.data_inicio)} · {a.titulo}
                            </option>
                        ))}
                    </select>
                </label>
            )}

            {aviso && inscritos.length > 0 && <p className="aviso-presenca">{aviso}</p>}
            {erroPresenca && <p className="erro" role="alert">{erroPresenca}</p>}

            <section className="painel">
                {inscritos.length === 0 ? (
                    <p className="vazio">Ninguém se inscreveu neste evento ainda.</p>
                ) : (
                    <>
                        {atividade && (
                            <p className="total contagem-presenca">
                                {presentesNaAtividade} de {inscritos.length} presentes nesta atividade
                            </p>
                        )}
                        <table className="tabela tabela-inscritos">
                            <thead>
                                <tr>
                                    <th>Presente</th>
                                    <th>Nome</th>
                                    <th>E-mail</th>
                                    <th>Inscrito em</th>
                                    <th className="num">Frequência</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inscritos.map((i) => {
                                    const freq = frequencia(i.atividades_presentes, atividades);
                                    const atinge = freq > 0 && freq >= evento.frequencia_minima;
                                    return (
                                        <tr key={i.id}>
                                            <td className="col-presenca">
                                                <input
                                                    type="checkbox"
                                                    checked={i.atividades_presentes.includes(atividadeId)}
                                                    disabled={!podeMarcar || salvando === i.id}
                                                    onChange={(e) => marcarPresenca(i, e.target.checked)}
                                                    aria-label={`Presença de ${i.usuario.nome}`}
                                                />
                                            </td>
                                            <td className="col-nome">{i.usuario.nome}</td>
                                            <td className="col-email">{i.usuario.email}</td>
                                            <td className="col-data num">{dataCurta(i.criada_em)}, {hora(i.criada_em)}</td>
                                            <td className={`col-frequencia num ${atinge ? "atinge" : ""}`}>{freq}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </>
                )}
            </section>
        </>
    );
}