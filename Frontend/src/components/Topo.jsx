import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { semestreAtual } from "../utils/datas";
import Marca from "./Marca";

const NOMES_PERFIL = { participante: "Participante", organizador: "Organizador", administrador: "Administrador"};

export default function Topo() {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const [aberto, setAberto] = useState(false);

    function sair() {
        logout();
        setAberto(false);
        navigate("/")
    }

    const fechar = () => setAberto(false);

    const conta = usuario ? (
        <>
            <span className="nome">{usuario.nome} · {NOMES_PERFIL[usuario.perfil]}</span>
            <button className="botao-texto" onClick={sair}>Sair</button>
        </>
        ) : (
        <>
            <Link to="/login" className="botao-texto" onClick={fechar}>Entrar</Link>
            <Link to="/cadastro" className="botao botao-principal" onClick={fechar}>Criar conta</Link>
        </>
    );
    return (
        <header className="topo">
            <Link to="/" className="marca" onClick={fechar}>
                <Marca />
                Gestão de Eventos <small>{semestreAtual().rotulo}</small>
            </Link>

            <nav aria-label="Principal">
                <NavLink to="/" end>Eventos</NavLink>
            </nav>

            <div className="conta">{conta}</div>

            <button className="botao menu-botao" aria-expanded={aberto} onClick={() => setAberto(!aberto)}>
                {aberto ? "Fechar" : "Menu"}
            </button>

            {aberto && (
                <div className="menu-sheet">
                    <NavLink to="/" end onClick={fechar}>Eventos</NavLink>
                    {conta}
                </div>
            )}
        </header>
    );
}
