import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errosDosCampos, mensagemErro } from "../services/api";

const CAMPOS = [
    { nome: "titulo", rotulo: "Título", tipo: "text" },
    { nome: "categoria", rotulo: "Categoria", tipo: "text" },
    { nome: "local", rotulo: "Local", tipo: "text" },
    { nome: "data_inicial", rotulo: "Início", tipo: "datetime-local" },
    { nome: "data_fim", rotulo: "Término", tipo: "datetime-local" },
    { nome: "vagas", rotulo: "Vagas", tipo: "number", min: 1 }, 
];

const VAZIO = { titulo: "", categoria: "", local: "", data_inicial: "", data_fim: "", vagas: "", descricao: "" };

export default function NovoEvento() {
    const { id } = useParams();
    const editando = Boolean(id);
    const navigate = useNavigate();

    const [dados, setDados] = useState(VAZIO);
    const [erro, setErro] = useState("");
    const [campos, setCampos] = useState({});
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
    if (!editando) return;
    api.get(`/eventos/${id}`)
        .then(({ data }) => setDados({
            titulo: data.titulo,
            categoria: data.categoria,
            local: data.local,
            data_inicial: data.data_inicial.slice(0, 16),
            data_fim: data.data_fim.slice(0, 16),
            vagas: String(data.vagas),
            descricao: data.descricao ?? "",
        }))
        .catch((err) => setErro(mensagemErro(err)));
    }, [id, editando]);

    function alterar(e) {
        setDados({ ...dados, [e.target.name]: e.target.value});
    }

    async function enviar(e) {
        e.preventDefault();
        setErro("");
        setCampos({});
        setEnviando(true);
        try {
            const corpo = { ...dados, vagas: Number(dados.vagas), descricao: dados.descricao || null};
            const { data } = editando
                ? await api.put(`/eventos/${id}`, corpo)
                : await api.post("/eventos/", corpo);
            navigate(`/eventos/${data.id}`);
        } catch (error) {
            setErro(mensagemErro(error));
            setCampos(errosDosCampos(error));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <>
            <nav className="trilha" aria-label="Você está em">
                <Link to="/painel">Meus eventos</Link> <span aria-hidden="true">/</span> <span>{editando ? "Editar evento" : "Novo evento"}</span>
            </nav>

            <div className="pagina-form">
                <h1>{editando ? "Editar evento" : "Novo evento"}</h1>
                {!editando && <p>Depois de criar, você poderá adicionar as atividades.</p>}

                <form className="painel form" onSubmit={enviar}>
                    {erro && <p className="erro" role="alert">{erro}</p>}

                    {CAMPOS.map((c) => (
                        <label key={c.nome} className="campo">
                            {c.rotulo}
                            <input
                                name={c.nome}
                                type={c.tipo}
                                value={dados[c.nome]}
                                onChange={alterar}
                                required
                                min={c.min}
                                aria-invalid={Boolean(campos[c.nome])}
                            />
                            {campos[c.nome] && <span className="erro-campo">{campos[c.nome][0]}</span>}
                        </label>
                    ))}

                    <label className="campo">
                        Descrição (opcional)
                        <textarea name="descricao" value={dados.descricao} onChange={alterar} />
                    </label>

                    <button className="botao botao-principal botao-grande" disabled={enviando}>
                        {enviando ? "Salvando…" : editando ? "Atualizar evento" : "Criar evento"}
                    </button>
                </form>
            </div>
        </>
    );
}