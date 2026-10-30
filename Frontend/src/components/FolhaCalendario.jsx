import { MESES } from "../utils/datas";

export default function FolhaCalendario({ data, situacao }) {
    const d = new Date(data);
    return (
        <div className={`folha ${situacao}`} aria-hidden="true">
            <span className="mes">{MESES[d.getMonth()]}</span>
            <span className="dia num">{d.getDate()}</span>
        </div>
    );
}