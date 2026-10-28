import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { mensagemErro } from "../services/api";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    async function enviar(e) {
        e.preventDefault();
        setErro("");
        setEnviando(true);
        try {
            await login(email, senha);
            navigate(location.state?.de ?? "/", { replace: true });
        } catch (error) {
            setErro(mensagemErro(error));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="pagina-form">
            <h1>Entrar</h1>
            <p>Use o e-mail e a senha da sua conta.</p>

            <form className="painel form" onSubmit={enviar}>
                {erro && <p className="erro" role="alert">{erro}</p>}

                <label className="campo">
                    E-mail
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </label>

                <label className="campo">
                    Senha
                    <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required autoComplete="current-password" />
                </label>

                <button className="botao botao-principal botao-grande" disabled={enviando}>
                    {enviando ? "Entrando…" : "Entrar"}
                </button>
            </form>

            <p className="rodape-form">Ainda não tem conta? <Link to="/cadastro">Criar conta</Link></p>
        </div>
    );
}