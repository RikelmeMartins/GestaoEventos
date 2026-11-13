import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errosDosCampos, mensagemErro } from "../services/api";

const TIPOS = [
    {valor: "palestra", nome: "Palestra"},
    {valor: "minicursos", nome: "Minicurso"},
    {valor: "workshop", nome: "Workshop"},
    {valor: "outro", nome: "Outro"},
];

const CAMPOS = [
    { nome: "titulo", rotulo: "Título", tipo: "text", obrigatorio: true },
    { nome: "palestrante", rotulo: "Palestrante (opcional)", tipo: "text" },
    { nome: "local", rotulo: "Local (opcional)", tipo: "text" },
    { nome: "data_inicio", rotulo: "Início", tipo: "datetime-local", obrigatorio: true },
    { nome: "data_fim", rotulo: "Término", tipo: "datetime-local", obrigatorio: true },
];

const VAZIO = { titulo: "", tipo: "palestra", palestrante: "", local: "", data_inicio: "", data_fim: "", descricao: "" };

export default function NovaAtividade() {
    const { id, atividadeId } = useParams();
    const editando = Boolean(atividadeId);
    const navigate = useNavigate();

    const [evento, setEvento] = useState(null);
    const [dados, setDados] = useState(VAZIO);
    const [erro, setErro] = useState("");
    const [campos, setCampos] = useState({});
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        api.get(`/eventos/${id}`)
            .then(({ data }) => {
                setEvento(data);
                if (!editando) return;

                const atividade = data.atividades.find((a) => a.id === Number(atividadeId));
                if (!atividade) {
                    setErro("Atividade não encontrada neste evento.");
                    return;
                }
                setDados({
                    titulo: atividade.titulo,
                    tipo: atividade.tipo,
                    palestrante: atividade.palestrante ?? "",
                    local: atividade.local ?? "",
                    data_inicio: atividade.data_inicio.slice(0, 16),
                    data_fim: atividade.data_fim.slice(0, 16),
                    descricao: atividade.descricao ?? "",
                });
            })
            .catch((err) => setErro(mensagemErro(err)));
    }, [id, atividadeId, editando]);

    function alterar (e) {
        setDados({ ...dados, [e.target.name]: e.target.value});
    }

    async function enviar(e) {
        e.preventDefault();
        setErro("");
        setCampos({});
        setEnviando(true);
        try {
            const corpo = {
                ...dados,
                palestrante: dados.palestrante || null,
                local: dados.local || null,
                descricao: dados.descricao || null,
            };
            if (editando) await api.put(`/atividades/${atividadeId}`, corpo);
            else await api.post(`/eventos/${id}/atividades`, corpo);
            navigate(`/eventos/${id}`);
        } catch (error) {
            setErro(mensagemErro(error));
            setCampos(errosDosCampos(error));
        } finally {
            setEnviando(false);
        }
    }

    const limiteInicio = evento?.data_inicial.slice(0, 16);
    const limiteFim = evento?.data_fim.slice(0, 16);

    return (
        <>
            <nav className="trilha" aria-label="Você está em">
                <Link to="/painel">Meus eventos</Link> <span aria-hidden="true">/</span>{" "}
                <Link to={`/eventos/${id}`}>{evento?.titulo ?? "…"}</Link> <span aria-hidden="true">/</span>{" "}
                <span>{editando ? "Editar atividade" : "Nova atividade"}</span>
            </nav>

            <div className="pagina-form">
                <h1>{editando ? "Editar atividade" : "Nova atividade"}</h1>
                <p>{evento ? `Em ${evento.titulo}` : "Carregando evento…"}</p>

                <form className="painel form" onSubmit={enviar}>
                    {erro && <p className="erro" role="alert">{erro}</p>}

                    <label className="campo">
                        Tipo
                        <select name="tipo" value={dados.tipo} onChange={alterar}>
                            {TIPOS.map((t) => (
                                <option key={t.valor} value={t.valor}>{t.nome}</option>
                            ))}
                        </select>
                        {campos.tipo && <span className="erro-campo">{campos.tipo[0]}</span>}
                    </label>

                    {CAMPOS.map((c) => {
                        const ehData = c.tipo === "datetime-local";
                        return (
                            <label key={c.nome} className="campo">
                                {c.rotulo}
                                <input
                                    name={c.nome}
                                    type={c.tipo}
                                    value={dados[c.nome]}
                                    onChange={alterar}
                                    required={c.obrigatorio}
                                    min={ehData ? limiteInicio : undefined}
                                    max={ehData ? limiteFim : undefined}
                                    aria-invalid={Boolean(campos[c.nome])}
                                />
                                {campos[c.nome] && <span className="erro-campo">{campos[c.nome][0]}</span>}
                            </label>
                        );
                    })}

                    <label className="campo">
                        Descrição (opcional)
                        <textarea name="descricao" value={dados.descricao} onChange={alterar} />
                    </label>

                    <button className="botao botao-principal botao-grande" disabled={enviando || !evento}>
                        {enviando ? "Salvando…" : editando ? "Atualizar atividade" : "Adicionar atividade"}
                    </button>
                </form>
            </div>
        </>
    );
}