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
      buscarTurnos()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white p-8">
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
              className="flex-1 p-3 bg-zinc-800 border border-zinc-700 rounded-lg"
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
              <div key={t.id} className="bg-zinc-900/80 border border-zinc-700 p-6 rounded-2xl">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <p className="text-2xl font-bold">{t.nombre}</p>
                    <p className="text-zinc-400 mt-1">📅 {t.fecha}</p>
                    <p className="text-zinc-400">⏰ {t.hora}</p>
                    <p className="text-sm text-zinc-500 mt-1">Código: {t.codigo_cancelacion?.slice(0, 8)}</p>
                  </div>
                  {t.estado !== "cancelado" && (
                    <button
                      onClick={() => cancelarTurno(t.id, t.codigo_cancelacion, t.fecha, t.hora, t.email, t.nombre)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
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
          <a href="/" className="text-zinc-400 hover:text-white transition">← Volver al inicio</a>
        </div>
      </div>
    </div>
  )
}