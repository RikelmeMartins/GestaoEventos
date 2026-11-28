import { useState } from "react";
import { Link } from "react-router-dom";
import api, { mensagemErro } from "../services/api";

export default function EsqueciSenha() {
    const [email, setEmail] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    async function enviar(e) {
        e.preventDefault();
        setErro("");
        setEnviando(true);
        try {
            const { data } = await api.post("/usuarios/esqueci-senha", { email });
            setMensagem(data.mensagem);
        } catch (error) {
            setErro(mensagemErro(error));
        } finally {
            setEnviando(false)
        }
    }

    return (
        <div className="pagina-form">
            <h1>Esqueci minha senha</h1>
            <p>Informe o e-mail da sua conta. Vamos enviar um link para você criar uma nova senha.</p>

            {mensagem ? (
                <div className="painel form">
                    <p className="sucesso" role="status">{mensagem}</p>
                    <p>O link vale por 30 minutos. Confira também a caixa de spam.</p>
                </div>
            ) : (
                <form className="painel form" onSubmit={enviar}>
                    {erro && <p className="erro" role="alert">{erro}</p>}

                    <label className="campo">
                        E-mail
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                    </label>

                    <button className="botao botao-principal botao-grande" disabled={enviando}>
                        {enviando ? "Enviando…" : "Enviar link"}
                    </button>
                </form>
            )}

            <p className="rodape-form">Lembrou a senha? <Link to="/login">Entrar</Link></p>
        </div>
    );
}