import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api, { mensagemErro } from "../services/api";
import { periodo, situacao } from "../utils/datas";

export default function EventoDetalhe() {
    const { id } = useParams();
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [evento, setEvento] = useState(null);
    const [inscrito, setInscrito] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState("");

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
        carregar();
    }, [carregar]);

    async function alternarInscricao() {
        if (!usuario) {
            navigate("/login", { state: { de: location.pathname } });
            return;
        }
        setErro("");
        setEnviando(true);
        try {
            if (inscrito) await api.delete(`/eventos/${id}/inscricao`);
            else await api.post(`/eventos/${id}/inscricao`);
            await carregar();
        } catch (err) {
            setErro(mensagemErro(err));
        } finally {
            setEnviando(false);
        }
    }

    if (!evento) return <p>{erro || "Carregando…"}</p>;

    const s = situacao(evento);
    const aberto = s === "proximo" || s === "acontecendo";

    return (
        <>
            <p><Link to="/" className="botao-texto">← Eventos</Link></p>
            <h1>{evento.titulo}</h1>
            <section className="painel">
                <p><strong>Quando:</strong> {periodo(evento.data_inicial, evento.data_fim)}</p>
                <p><strong>Local:</strong> {evento.local}</p>
                <p><strong>Vagas (total):</strong> {evento.vagas}</p>
                {erro && <p className="erro" role="alert">{erro}</p>}
                {inscrito && <p>Você está inscrito neste evento.</p>}
                {aberto ? (
                    <button className="botao botao-principal" onClick={alternarInscricao} disabled={enviando}>
                        {enviando ? "Aguarde…" : inscrito ? "Cancelar inscrição" : "Inscrever-se"}
                    </button>
                ) : (
                    <p>As inscrições estão encerradas.</p>
                )}
            </section>
        </>
    );
}