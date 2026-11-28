import { use, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api, { errosDosCampos, mensagemErro } from "../services/api";

export default function RedefinirSenha() {
    const [params] = useSearchParams();
    const token = params.get("token");
    const navigate = useNavigate();

    const [senha, setSenha] = useState("");
    const [confirmacao, setConfirmacao] = useState("");
    const [erro, setErro] = useState("");
    const [campos, setCampos] = useState({});
    const [enviando, setEnviando] = useState(false);

    async function enviar(e) {
        e.preventDefault();
        setErro("");
        if (senha !== confirmacao) {
            setCampos({ confirmacao: ["As senhas não são iguais."]});
            return;
        }
        setEnviando(true);
        try {
            const { data } = await api.post("/usuarios/redefinir-senha", { token, senha })
            navigate("/login", { replace: true, state: { mensagem: data.mensagem }});
        } catch (error) {
            setErro(mensagemErro(error));
            setCampos(errosDosCampos(error));
        } finally {
            setEnviando(false);
        }
    }

    if (!token) {
        return (
            <div className="pagina-form">
                <h1>Link inválido</h1>
                <p>Este endereço não tem o código de redefinição. <Link to="/esqueci-senha">Peça um novo link</Link>.</p>
            </div>
        );
    }

    return (
        <div className="pagina-form">
            <h1>Criar nova senha</h1>
            <p>Depois de salvar, você vai precisar entrar de novo em todos os aparelhos.</p>

            <form className="painel form" onSubmit={enviar}>
                {erro && (
                    <p className="erro" role="alert">
                        {erro} <Link to="/esqueci-senha" className="botao-texto">Pedir novo link</Link>
                    </p>
                )}

                <label className="campo">
                    Nova senha (mínimo 8 caracteres)
                    <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={8} autoComplete="new-password" aria-invalid={Boolean(campos.senha)} />
                    {campos.senha && <span className="erro-campo">{campos.senha[0]}</span>}
                </label>

                <label className="campo">
                    Repita a nova senha
                    <input type="password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} required autoComplete="new-password" aria-invalid={Boolean(campos.confirmacao)} />
                    {campos.confirmacao && <span className="erro-campo">{campos.confirmacao[0]}</span>}
                </label>

                <button className="botao botao-principal botao-grande" disabled={enviando}>
                    {enviando ? "Salvando…" : "Salvar nova senha"}
                </button>
            </form>
        </div>
    );
}
