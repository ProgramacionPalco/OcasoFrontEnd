import { useState } from "react";
import api from "../services/api";

function ContactoForm({ clienteId, onClose, onSuccess }) {

    const [form, setForm] = useState({
    nombreContacto: "",
    correoContacto: "",
    telefonoContacto: "",
    area: "",
    puesto: "",
    ext: "",
    numeroOficina: "",
    fechaCumple:""
    });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.post(`/altas/clientes/${clienteId}/contactos`, form);

    onSuccess();
    onClose();
  };

  return (
    <div className="card p-3 mb-3">
      <h5>Nuevo Contacto</h5>

      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" name="nombreContacto" placeholder="Nombre" onChange={handleChange} required />
        <input className="form-control mb-2" name="correoContacto" placeholder="Correo" onChange={handleChange} />
        <input className="form-control mb-2" name="telefonoContacto" placeholder="Teléfono" onChange={handleChange} />
        <input className="form-control mb-2" name="numeroOficina" placeholder="Número Oficina" onChange={handleChange} />
        <input className="form-control mb-2" name="ext" placeholder="Extensión" onChange={handleChange} />
        <input className="form-control mb-2" name="area" placeholder="Área" onChange={handleChange} />
        <input className="form-control mb-2" name="puesto" placeholder="Puesto" onChange={handleChange} />
        <input className="form-control mb-2" name="fechaCumple" type="date" placeholder="Fecha Cumpleaños" onChange={handleChange} />

        <button className="btn btn-success me-2">Guardar</button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default ContactoForm;