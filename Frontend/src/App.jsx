import { useEffect, useState } from "react";
import api, { mensagemErro } from "./services/api";
import { NOMES_SITUACAO, periodo, rotulo, situacao } from "./utils/datas";

export default function App() {
  const [eventos, setEventos] = useState([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api.get("/eventos/")
      .then((resposta) => setEventos(resposta.data))
      .catch((err) => setErro(mensagemErro(err)));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Teste dos passos 1 a 4</h1>
      {erro && <p>Erro: {erro}</p>}
      <ul>
        {eventos.map((e) => (
          <li key={e.id}>
            {e.titulo} · {rotulo(e.categoria)} · {periodo(e.data_inicial, e.data_fim)} · {NOMES_SITUACAO[situacao(e)]}
          </li>
        ))}
      </ul>
    </div>
  );
}