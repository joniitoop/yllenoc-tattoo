"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { motion } from "framer-motion"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null)

  const [form, setForm] = useState({
    nombre: "",
    edad: "",
    email: "",
    fecha: "",
    hora: ""
  })

  const [turnos, setTurnos] = useState<any[]>([])

  useEffect(() => {
    getTurnos()
  }, [])

  const getTurnos = async () => {
    const { data, error } = await supabase.from("turnos").select("*")
    if (error) {
      console.error("Error cargando turnos:", error)
    } else {
      setTurnos(data || [])
    }
  }

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const enviarEmailConfirmacion = async (email: string, nombre: string, fecha: string, hora: string, codigo: string) => {
    try {
      const fechaObj = new Date(fecha);
      const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const fechaFormateada = fechaObj.toLocaleDateString('es-ES', opciones);

      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "Reserva confirmada - Yllenoc Tattoo",
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 550px; margin: 0 auto; background-color: #f9f9f9; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <div style="background-color: #000000; padding: 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">YLLENOC TATTOO</h1>
                <p style="color: #cccccc; margin: 8px 0 0 0;">Arte en piel</p>
              </div>
              <div style="padding: 32px;">
                <h2 style="color: #333333; margin: 0 0 8px 0; font-size: 22px;">Reserva confirmada</h2>
                <p style="color: #666666; margin: 0 0 32px 0; border-bottom: 1px solid #eeeeee; padding-bottom: 16px;">Tu turno ha sido agendado correctamente</p>
                <div style="background-color: #f0f0f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <h3 style="color: #333333; margin: 0 0 16px 0; font-size: 16px;">Datos de la reserva</h3>
                  <div style="margin-bottom: 12px;">
                    <span style="color: #999999; font-size: 12px;">Código</span>
                    <p style="color: #333333; margin: 4px 0 0 0; font-family: monospace; font-size: 14px;">${codigo.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="color: #999999; font-size: 12px;">Horario</span>
                    <p style="color: #333333; margin: 4px 0 0 0; font-weight: 500;">${fechaFormateada} - ${hora}</p>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="color: #999999; font-size: 12px;">Cliente</span>
                    <p style="color: #333333; margin: 4px 0 0 0;">${nombre}</p>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="color: #999999; font-size: 12px;">Email</span>
                    <p style="color: #333333; margin: 4px 0 0 0;">${email}</p>
                  </div>
                </div>
                <div style="text-align: center;">
                  <a href="/mis-turnos" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 500; margin-bottom: 16px;">Ver mis reservas</a>
                  <p style="color: #999999; font-size: 12px; margin: 0;">¿Necesitas cancelar? Usá el código: <strong style="color: #333;">${codigo.slice(0, 8).toUpperCase()}</strong></p>
                </div>
              </div>
              <div style="background-color: #f0f0f0; padding: 16px; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="color: #999999; font-size: 11px; margin: 0;">Yllenoc Tattoo · Arte en piel</p>
                <p style="color: #999999; font-size: 11px; margin: 8px 0 0 0;">Este correo es generado automáticamente, por favor no responder.</p>
              </div>
            </div>
          `
        })
      });
    } catch (error) {
      console.error("Error enviando email:", error);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    const edadNum = Number(form.edad)

    if (!form.nombre || !form.edad || !form.email || !form.fecha || !form.hora) {
      alert("Complete todos los campos")
      return
    }

    if (edadNum < 13 || edadNum > 100) {
      alert("La edad debe estar entre 13 y 100 años")
      return
    }

    const ocupado = turnos.some(
      (t) => t.fecha === form.fecha && t.hora === form.hora && t.estado !== "cancelado"
    )

    if (ocupado) {
      alert("Ese horario ya esta ocupado")
      return
    }

    if (edadNum < 18) {
      alert("Usted es menor de edad. Necesita el consentimiento de un adulto. Sera redirigido al formulario.")
      window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSda5W7ffjAnqciIv8OHmwEYEsQta2qoD2wWS0yvBbHfz8sv7Q/viewform"
      return
    }

    const codigoCancelacion = crypto.randomUUID()

    const { error } = await supabase.from("turnos").insert([
      {
        nombre: form.nombre,
        edad: edadNum,
        email: form.email,
        fecha: form.fecha,
        hora: form.hora,
        es_menor: false,
        consentimiento: true,
        codigo_cancelacion: codigoCancelacion,
        estado: "pendiente"
      }
    ])

    if (error) {
      console.error("Error al guardar:", error)
      alert("Error al guardar: " + error.message)
    } else {
      alert("Turno reservado correctamente")
      
      await enviarEmailConfirmacion(form.email, form.nombre, form.fecha, form.hora, codigoCancelacion)
      
      setForm({ 
        nombre: "", 
        edad: "", 
        email: "", 
        fecha: "", 
        hora: "" 
      })
      setFechaSeleccionada(null)
      getTurnos()
    }
  }

  const edades = Array.from({ length: 88 }, (_, i) => i + 13)
  const horas = ["10:00", "11:00", "12:00", "13:00", "15:00", "16:00", "17:00"]

  const horasOcupadas = turnos
    .filter((t) => t.fecha === form.fecha && t.estado !== "cancelado")
    .map((t) => t.hora)

  const images = [
    "https://picsum.photos/id/100/400/400",
    "https://picsum.photos/id/101/400/400",
    "https://picsum.photos/id/102/400/400",
    "https://picsum.photos/id/103/400/400",
    "https://picsum.photos/id/104/400/400",
    "https://picsum.photos/id/105/400/400"
  ]

  const formatearFechaLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCalendarChange = (value: any) => {
    if (value && value instanceof Date) {
      const formatted = formatearFechaLocal(value);
      
      if (fechaSeleccionada && formatearFechaLocal(fechaSeleccionada) === formatted) {
        setFechaSeleccionada(null);
        setForm({ ...form, fecha: "" });
      } else {
        setFechaSeleccionada(value);
        setForm({ ...form, fecha: formatted });
      }
    }
  };

  return (
    <div className="bg-gradient-to-b from-black via-zinc-900 to-black text-white min-h-screen font-sans">

      <div 
        className="relative h-[90vh] flex flex-col justify-center items-center text-center px-4 bg-black"
        style={{
          backgroundImage: "url('/tattoo logo.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <h1 className="text-7xl md:text-8xl font-black tracking-wider text-white drop-shadow-2xl">
            YLLENOC TATTOO
          </h1>
          <p className="text-xl md:text-2xl text-zinc-200 mt-6 max-w-2xl mx-auto drop-shadow-lg">
            Arte en piel · Diseños unicos · Experiencia unica
          </p>

          <div className="flex gap-4 mt-10 justify-center flex-wrap">
            <a href="#reserva" className="bg-white text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition-all duration-300 shadow-xl">
              Reservar turno
            </a>
            <a href="#galeria" className="border-2 border-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-black transition-all duration-300">
              Ver trabajos
            </a>
            <a href="/mis-turnos" className="bg-zinc-700 hover:bg-zinc-600 px-8 py-4 rounded-full font-bold transition-all duration-300 shadow-xl">
              Mis Turnos
            </a>
          </div>
        </motion.div>
      </div>

      <section id="galeria" className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold mb-4">Mis trabajos</h2>
          <div className="w-24 h-1 bg-white mx-auto"></div>
          <p className="text-zinc-400 mt-4">Cada tatuaje es una obra unica</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-xl shadow-2xl cursor-pointer"
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img}
                alt={`Trabajo ${i + 1}`}
                className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-4">
                <span className="text-white font-bold">Ver detalle</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 flex justify-center items-center z-50 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={selectedImage} className="max-w-full max-h-[90vh] object-contain rounded-xl" />
            <button
              className="absolute top-4 right-4 bg-white text-black w-10 h-10 rounded-full text-2xl hover:scale-110 transition"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <section id="reserva" className="bg-zinc-900 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-bold mb-4">Reservar turno</h2>
            <div className="w-24 h-1 bg-white mx-auto"></div>
            <p className="text-zinc-400 mt-4">Elija fecha y horario</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-10 justify-center">

            <div className="bg-black p-6 rounded-2xl shadow-2xl">
              <Calendar
                onChange={handleCalendarChange}
                value={fechaSeleccionada}
                tileClassName={({ date }) => {
                  const d = formatearFechaLocal(date);
                  const ocupado = turnos.some((t) => t.fecha === d && t.estado !== "cancelado");
                  const isSelected = fechaSeleccionada && formatearFechaLocal(fechaSeleccionada) === d;
                  
                  if (isSelected) {
                    return "bg-blue-600 text-white rounded-full";
                  }
                  return ocupado
                    ? "bg-red-600 text-white rounded-full"
                    : "bg-green-600 text-white rounded-full hover:bg-green-500";
                }}
                className="border-0 shadow-xl"
                minDate={new Date()}
              />
              <p className="text-center text-zinc-500 text-sm mt-4">
                {fechaSeleccionada ? `Fecha seleccionada: ${formatearFechaLocal(fechaSeleccionada)}` : "Seleccione una fecha"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full lg:w-96 bg-black p-8 rounded-2xl shadow-2xl">
              <h3 className="text-2xl font-bold mb-2">Complete sus datos</h3>

              <input
                name="nombre"
                placeholder="Nombre completo"
                value={form.nombre}
                onChange={handleChange}
                required
                className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-white transition"
              />

              <select
                name="edad"
                value={form.edad}
                onChange={handleChange}
                required
                className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-white transition"
              >
                <option value="">Seleccionar edad</option>
                {edades.map((edad) => (
                  <option key={edad} value={edad}>
                    {edad} años
                  </option>
                ))}
              </select>

              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-white transition"
              />

              <select
                name="hora"
                value={form.hora}
                onChange={handleChange}
                required
                className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-white transition"
              >
                <option value="">Seleccionar hora</option>
                {horas.map((h) => (
                  <option key={h} value={h} disabled={horasOcupadas.includes(h)}>
                    {h} {horasOcupadas.includes(h) ? "(ocupado)" : "(disponible)"}
                  </option>
                ))}
              </select>

              <button type="submit" className="bg-gradient-to-r from-white to-gray-300 text-black p-4 rounded-lg font-bold text-lg hover:scale-105 transition-all duration-300 mt-4 shadow-xl">
                Reservar turno
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4">
        <div className="flex flex-col md:flex-row justify-center gap-6 items-center flex-wrap">
          <a
            href="https://wa.me/5491123754226?text=Hola%20quiero%20reservar%20un%20turno"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-xl"
          >
            WhatsApp
          </a>

          <a
            href="https://www.instagram.com/yllenoc.tattoo/"
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:scale-105 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-xl"
          >
            Instagram
          </a>
        </div>
      </div>

      <footer className="text-center text-zinc-500 py-8 border-t border-zinc-800">
        <p>© 2025 Yllenoc Tattoo · Todos los derechos reservados</p>
      </footer>

    </div>
  )
}