import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { mensagemErro } from "../services/api";
import { dataCurta, hora } from "../utils/datas";

export default function Inscritos() {
    const { id } = useParams();
    const [evento, setEvento] = useState(null);
    const [inscritos, setInscritos] = useState([]);
    const [erro, setErro] = useState("");

    useEffect(() => {
        Promise.all([api.get(`/eventos/${id}`), api.get(`/eventos/${id}/inscritos`)])
            .then(([respostaEvento, respostaInscritos]) => {
                setEvento(respostaEvento.data);
                setInscritos(respostaInscritos.data);
            })
            .catch((err) => setErro(mensagemErro(err)));
    }, [id]);

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

    return (
        <>
            {trilha}

            <div className="titulo">
                <div>
                    <h1>Inscritos</h1>
                    <p><strong>{inscritos.length}</strong> de {evento.vagas} vagas preenchidas em {evento.titulo}</p>
                </div>
            </div>

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
                            </tr>
                        </thead>
                        <tbody>
                            {inscritos.map((i) => (
                                <tr key={i.id}>
                                    <td className="col-nome">{i.usuario.nome}</td>
                                    <td className="col-email">{i.usuario.email}</td>
                                    <td className="col-data num">{dataCurta(i.criada_em)}, {hora(i.criada_em)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </>
    );
}