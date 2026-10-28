import { Link, Route, Routes } from "react-router-dom";
import Topo from "./components/Topo";
import Cadastro from "./pages/Cadastro";
import EventoDetalhe from "./pages/EventoDetalhe";
import Eventos from "./pages/Eventos";
import Login from "./pages/Login";

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
          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
      </main>
    </>
  );
}