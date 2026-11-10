import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export default function NovoEvento(params) {
    const navigate = useNavigate();

    const [dados, setDados] = useState(VAZIO);
    const [erro, setErro] = useState("");
    const [campos, setCampos] = useState({});
    const [enviando, setEnviando] = useState(false);

    function alterar(e) {
        setDados({ ...dados, [e.target.name]: e.target.value});
    }

    async function enviar(e) {
        e.preventDefault();
        setErro("");
        setCampos({});
        setEnviando(true);
        try {
            const { data } = await api.post("/eventos/", {
                ...dados,
                vagas: Number(dados.vagas),
                descricao: dados.descricao || null,
            });
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
                <Link to="/painel">Meus eventos</Link> <span aria-hidden="true">/</span> <span>Novo evento</span>
            </nav>

            <div className="pagina-form">
                <h1>Novo evento</h1>
                <p>Depois de criar, você poderá adicionar as atividades.</p>

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
                        {enviando ? "Criando…" : "Criar evento"}
                    </button>
                </form>
            </div>
        </>
    );
}