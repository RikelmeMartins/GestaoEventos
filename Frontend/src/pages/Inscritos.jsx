import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { mensagemErro } from "../services/api";
import { dataCurta, hora, situacao } from "../utils/datas";

export default function Inscritos() {
    const { id } = useParams();
    const [evento, setEvento] = useState(null);
    const [inscritos, setInscritos] = useState([]);
    const [erro, setErro] = useState("");
    const [erroPresenca, setErroPresenca] = useState("");
    const [salvando, setSalvando] = useState(null);

    useEffect(() => {
        Promise.all([api.get(`/eventos/${id}`), api.get(`/eventos/${id}/inscritos`)])
            .then(([respostaEvento, respostaInscritos]) => {
                setEvento(respostaEvento.data);
                setInscritos(respostaInscritos.data);
            })
            .catch((err) => setErro(mensagemErro(err)));
    }, [id]);

    async function marcarPresenca(inscricao, presente) {
        setErroPresenca("");
        setSalvando(inscricao.id);
        try {
            const { data } = await api.put(`/eventos/${id}/inscritos/${inscricao.id}/presenca`, { presente });
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

    const s = situacao(evento);
    const podeMarcar = s === "acontecendo" || s === "encerrado";
    const presentes = inscritos.filter((i) => i.presente).length;

    return (
        <>
            {trilha}

            <div className="titulo">
                <div>
                    <h1>Inscritos</h1>
                    <p><strong>{inscritos.length}</strong> de {evento.vagas} vagas preenchidas em {evento.titulo}</p>
                    {inscritos.length > 0 && <p><strong>{presentes}</strong> {presentes === 1 ? "presente" : "presentes"}</p>}
                </div>
            </div>

            {!podeMarcar && inscritos.length > 0 && (
                <p className="aviso-presenca">
                    {s === "cancelado"
                        ? "Evento cancelado: não há presença para registrar."
                        : "A presença poderá ser marcada quando o evento começar."}
                </p>
            )}
            {erroPresenca && <p className="erro" role="alert">{erroPresenca}</p>}

            <section className="painel">
                {inscritos.length === 0 ? (
                    <p className="vazio">Ninguém se inscreveu neste evento ainda.</p>
                ) : (
                    <table className="tabela tabela-inscritos">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>E-mail</th>
                                <th>Inscrito em</th>
                                <th>Presente</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inscritos.map((i) => (
                                <tr key={i.id}>
                                    <td className="col-nome">{i.usuario.nome}</td>
                                    <td className="col-email">{i.usuario.email}</td>
                                    <td className="col-data num">{dataCurta(i.criada_em)}, {hora(i.criada_em)}</td>
                                    <td className="col-presenca">
                                        <input
                                            type="checkbox"
                                            checked={i.presente}
                                            disabled={!podeMarcar || salvando === i.id}
                                            onChange={(e) => marcarPresenca(i, e.target.checked)}
                                            aria-label={`Presença de ${i.usuario.nome}`}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </>
    );
}