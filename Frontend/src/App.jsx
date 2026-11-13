import { Link, Route, Routes } from "react-router-dom";
import Topo from "./components/Topo";
import Cadastro from "./pages/Cadastro";
import EventoDetalhe from "./pages/EventoDetalhe";
import Eventos from "./pages/Eventos";
import Login from "./pages/Login";
import RotaProtegida from "./components/RotaProtegida";
import Painel from "./pages/Painel";
import NovoEvento from "./pages/NovoEvento";
import NovaAtividade from "./pages/NovaAtividade";

function NaoEncontrada() {
  return (
    <div className="titulo">
      <div>
        <h1>Página não encontrada</h1>
        <p>O endereço não existe. <Link to="/" className="botao-texto">Ver os eventos</Link></p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Topo />
      <main className="canvas">
        <Routes>
          <Route path="/" element={<Eventos />} />
          <Route path="/eventos/:id" element={<EventoDetalhe />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/painel" element={<RotaProtegida><Painel /></RotaProtegida>} />
          <Route path="/painel/novo" element={<RotaProtegida><NovoEvento /></RotaProtegida>} />
          <Route path="/painel/eventos/:id/atividades/nova" element={<RotaProtegida><NovaAtividade /></RotaProtegida>} />
          <Route path="/painel/eventos/:id/editar" element={<RotaProtegida><NovoEvento /></RotaProtegida>} />
          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
      </main>
    </>
  );
}