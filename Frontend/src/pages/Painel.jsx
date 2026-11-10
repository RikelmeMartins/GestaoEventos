import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api, { mensagemErro } from "../services/api";
import { NOMES_SITUACAO, periodo, situacao } from "../utils/datas";

export default function Painel() {
    const { usuario, ehAdmin } = useAuth();
    const [eventos, setEventos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        api.get("/eventos/")
            .then((resposta) => setEventos(resposta.data))
            .catch((err) => setErro(mensagemErro(err)))
            .finally(() => setCarregando(false));
    }, []);

    const meus = ehAdmin ? eventos : eventos.filter((e) => e.organizador?.id === usuario.id);

    return (
        <>
            <div className="titulo">
                <div>
                    <h1>Meus eventos</h1>
                    <p>{ehAdmin ? "Todos os eventos do sistema." : "Os eventos que você organiza."}</p>
                </div>
                <Link to="/painel/novo" className="botao botao-principal">Novo evento</Link>
            </div>

            {erro && <div className="erro" role="alert"><span>{erro}</span></div>}

            {!erro && (
                <section className="painel" aria-busy={carregando}>
                    {carregando ? (
                        <span className="esqueleto" style={{ height: 120 }} />
                    ) : meus.length === 0 ? (
                    <p className="vazio">{ehAdmin ? "Nenhum evento cadastrado." : "Você ainda não criou nenhum evento."}</p>
                    ) : (
                        <ul className="lista-painel">
                            {meus.map((evento) => {
                                const s = situacao(evento);
                                return (
                                    <li key={evento.id}>
                                        <div>
                                            <Link to={`/eventos/${evento.id}`}>{evento.titulo}</Link>
                                            <p>{periodo(evento.data_inicial, evento.data_fim)} · {evento.local}</p>
                                        </div>
                                        <span className={`pilula ${s}`}>{NOMES_SITUACAO[s]}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            )}
        </>
    );
}