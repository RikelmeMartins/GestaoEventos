import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { errosDosCampos, mensagemErro } from "../services/api";

const CAMPOS = [
    { nome: "nome", rotulo: "Nome completo", tipo: "text", autoComplete: "name" },
    { nome: "email", rotulo: "E-mail", tipo: "email", autoComplete: "email" },
    { nome: "senha", rotulo: "Senha (mínimo 6 caracteres)", tipo: "password", autoComplete:"new-password", minLength: 6},
];

export default function Cadastro() {
    const { cadastrar } = useAuth();
    const navigate = useNavigate();

    const [dados, setDados] = useState({nome: "", email: "", senha: ""});
    const [erro, setErro] = useState("");
    const [campos, setCampos] = useState({});
    const [enviando, setEnviando] = useState(false);

    function alterar(e) {
        setDados({ ...dados, [e.target.name]: e.target.value });
    }

    async function enviar(e) {
        e.preventDefault();
        setErro("");
        setEnviando(true);
        setCampos({});
        try {
            await cadastrar(dados); 
            navigate("/", { replace: true });
        } catch (error) {
            setErro(mensagemErro(error));
            setCampos(errosDosCampos(error));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="pagina-form">
            <h1>Criar conta</h1>
            <p>Toda conta nova começa como participante.</p>

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
                    minLength={c.minLength}
                    autoComplete={c.autoComplete}
                    aria-invalid={Boolean(campos[c.nome])}
                    />
                    {campos[c.nome] && <span className="erro-campo">{campos[c.nome][0]}</span>}
                </label>
                ))}

                <button className="botao botao-principal botao-grande" disabled={enviando}>
                    {enviando ? "Criando…" : "Criar conta"}
                </button>
            </form>

            <p className="rodape-form">Já tem conta? <Link to="/login">Entrar</Link></p>
        </div>      
    );
}