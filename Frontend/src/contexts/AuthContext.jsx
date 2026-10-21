import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

function lerUsuariosSalvo() {
    try{
        return JSON.parse(localStorage.getItem("usuario"));
    } catch {
        return null;
    }
}

export function AuthProvider ({children}) {
    const [usuario, setUsuario] = useState(lerUsuariosSalvo);

    async function login(email, senha) {
        const {data} = await api.post("/usuarios/login", {email, senha});
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        setUsuario(data.usuario);
        return data.usuario;
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setUsuario(null);
    }

    async function cadastrar(dados) {
        await api.post("/usuarios/", dados);
        return login(dados.email, dados.senha);
    }

    useEffect(() => {
        const id = api.interceptors.response.use(
            (resposta) => resposta,
            (erro) => {
                if (erro.response?.status === 401 && localStorage.getItem("token")) logout();
                return Promise.reject(erro);
            }
        );
        return () => api.interceptors.response.eject(id);
    }, []);

    const perfil = usuario?.perfil;
    const valor = {
        usuario,
        login,
        logout,
        cadastrar,
        ehAdmin: perfil === "administrador",
        ehOrganizador: perfil === "organizador" || perfil === "administrador",
    };


    return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}