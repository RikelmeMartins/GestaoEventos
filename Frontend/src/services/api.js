import axios from "axios";

const api = axios.create({baseURL: "http://localhost:5000/api"});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export function mensagemErro(erro) {
    const dados = erro.response?.data;
    if (!dados) return "Não foi possivel conectar ao servidor.";
    return dados.erro ?? "Erro inesperado.";
}

export function errosDosCampos(erro) {
    return erro.response?.data?.detalhes ?? {};
}

export default api;