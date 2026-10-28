import { useParams } from "react-router-dom";

export default function EventoDetalhe() {
    const { id } = useParams();
    return <div className="titulo"><h1>Evento {id}</h1></div>;
}