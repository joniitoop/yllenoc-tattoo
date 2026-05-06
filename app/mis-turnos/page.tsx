"use client"

import { useState } from "react"
import { supabase } from "../../lib/supabase"

export default function MisTurnos() {
  const [email, setEmail] = useState("")
  const [turnos, setTurnos] = useState<any[]>([])
  const [buscando, setBuscando] = useState(false)

  const buscarTurnos = async () => {
    if (!email) {
      alert("Ingrese su email")
      return
    }

    setBuscando(true)
    const { data, error } = await supabase
      .from("turnos")
      .select("*")
      .eq("email", email)
      .order("fecha", { ascending: false })

    if (error) {
      console.error(error)
      alert("Error al buscar turnos")
    } else {
      setTurnos(data || [])
    }
    setBuscando(false)
  }

  const cancelarTurno = async (id: number, codigo: string, fecha: string, hora: string, emailUsuario: string, nombre: string) => {
    const codigoIngresado = prompt("Ingrese el código de cancelación que recibió por email:")
    
    if (codigoIngresado !== codigo) {
      alert("Código incorrecto")
      return
    }

    const confirmar = confirm(`¿Cancelar turno del ${fecha} a las ${hora}?`)
    if (!confirmar) return

    const { error } = await supabase
      .from("turnos")
      .update({ estado: "cancelado" })
      .eq("id", id)

    if (error) {
      alert("Error al cancelar")
    } else {
      alert("Turno cancelado correctamente")
      
      const fechaObj = new Date(fecha);
      const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const fechaFormateada = fechaObj.toLocaleDateString('es-ES', opciones);
      
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: emailUsuario,
            subject: "Reserva cancelada - Yllenoc Tattoo",
            html: `
              <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 550px; margin: 0 auto; background-color: #f9f9f9; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="background-color: #000000; padding: 24px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">YLLENOC TATTOO</h1>
                  <p style="color: #cccccc; margin: 8px 0 0 0;">Arte en piel</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 32px;">
                  <h2 style="color: #333333; margin: 0 0 8px 0; font-size: 22px;">Reserva cancelada</h2>
                  <p style="color: #666666; margin: 0 0 32px 0; border-bottom: 1px solid #eeeeee; padding-bottom: 16px;">Tu turno ha sido cancelado correctamente</p>
                  
                  <div style="background-color: #fafafa; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #cc0000;">
                    <h3 style="color: #333333; margin: 0 0 16px 0; font-size: 16px;">Detalles de la cancelación</h3>
                    
                    <div style="margin-bottom: 12px;">
                      <span style="color: #999999; font-size: 12px;">Horario original</span>
                      <p style="color: #333333; margin: 4px 0 0 0; font-weight: 500;">${fechaFormateada} - ${hora}</p>
                    </div>
                    
                    <div style="margin-bottom: 12px;">
                      <span style="color: #999999; font-size: 12px;">Cliente</span>
                      <p style="color: #333333; margin: 4px 0 0 0;">${nombre}</p>
                    </div>
                  </div>
                  
                  <div style="background-color: #fff5f5; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
                    <p style="color: #cc0000; margin: 0; font-size: 14px;">La cancelación ha sido procesada exitosamente</p>
                  </div>
                  
                  <div style="text-align: center;">
                    <a href="http://localhost:3000" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 500;">Agendar nuevo turno</a>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f0f0f0; padding: 16px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="color: #999999; font-size: 11px; margin: 0;">Yllenoc Tattoo · Arte en piel</p>
                  <p style="color: #999999; font-size: 11px; margin: 8px 0 0 0;">Este correo es generado automáticamente, por favor no responder.</p>
                </div>
              </div>
            `
          })
        })
      } catch (err) {
        console.error("Error enviando email:", err)
      }
      
      buscarTurnos()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Mis Turnos</h1>

        <div className="bg-zinc-900/80 p-6 rounded-2xl mb-8">
          <h2 className="text-xl font-bold mb-4">Buscar mis turnos</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="email"
              placeholder="Ingrese su email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 p-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-white"
            />
            <button
              onClick={buscarTurnos}
              className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:scale-105 transition"
            >
              Buscar
            </button>
          </div>
        </div>

        {buscando && <p className="text-center">Buscando turnos...</p>}

        {turnos.length > 0 && (
          <div className="space-y-4">
            {turnos.map((t) => (
              <div
                key={t.id}
                className={`border p-6 rounded-2xl ${
                  t.estado === "cancelado" 
                    ? "bg-red-900/20 border-red-500/50" 
                    : "bg-zinc-900/80 border-zinc-700"
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <p className="text-2xl font-bold">{t.nombre}</p>
                    <p className="text-zinc-400 mt-1">Fecha: {t.fecha}</p>
                    <p className="text-zinc-400">Hora: {t.hora}</p>
                    <p className="text-zinc-400 text-sm mt-1">Código: {t.codigo_cancelacion?.slice(0, 8)}...</p>
                    <p className="mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        t.estado === "cancelado" 
                          ? "bg-red-500/20 text-red-400" 
                          : t.fecha >= new Date().toISOString().split("T")[0]
                          ? "bg-green-500/20 text-green-400"
                          : "bg-zinc-500/20 text-zinc-400"
                      }`}>
                        {t.estado === "cancelado" 
                          ? "Cancelado" 
                          : t.fecha >= new Date().toISOString().split("T")[0]
                          ? "Proximo"
                          : "Completado"}
                      </span>
                    </p>
                  </div>
                  
                  {t.estado !== "cancelado" && t.fecha >= new Date().toISOString().split("T")[0] && (
                    <button
                      onClick={() => cancelarTurno(t.id, t.codigo_cancelacion, t.fecha, t.hora, t.email, t.nombre)}
                      className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition"
                    >
                      Cancelar turno
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!buscando && turnos.length === 0 && email && (
          <p className="text-center text-zinc-500">No se encontraron turnos para este email</p>
        )}

        <div className="mt-8 text-center">
          <a href="/" className="text-zinc-400 hover:text-white transition">
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  )
}