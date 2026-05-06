"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [turnos, setTurnos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    checkUser()
    getTurnos()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  const login = async () => {
    const email = prompt("Email:") || ""
    const password = prompt("Contraseña:") || ""

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert("Error: " + error.message)
    } else {
      location.reload()
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  const getTurnos = async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from("turnos")
      .select("*")
      .order("fecha", { ascending: true })

    if (error) {
      console.error(error)
      alert("Error al cargar turnos")
    } else {
      setTurnos(data || [])
    }
    setCargando(false)
  }

  const deleteTurno = async (id: number) => {
    if (confirm("¿Eliminar este turno?")) {
      const { error } = await supabase.from("turnos").delete().eq("id", id)
      if (error) {
        alert("Error al eliminar")
      } else {
        getTurnos()
      }
    }
  }

  if (!user) {
    return (
      <div className="bg-gradient-to-b from-black to-zinc-900 text-white min-h-screen flex flex-col items-center justify-center">
        <div className="text-center p-8 bg-zinc-900/50 rounded-2xl backdrop-blur-sm">
          <h1 className="text-4xl font-bold mb-4">Yllenoc Tattoo</h1>
          <h2 className="text-2xl mb-4">Panel Administrativo</h2>
          <p className="text-zinc-400 mb-8">Inicie sesión para acceder</p>
          <button
            onClick={login}
            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-black to-zinc-900 text-white min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-zinc-800">
          <div>
            <h1 className="text-3xl font-bold">Yllenoc Tattoo</h1>
            <p className="text-zinc-400 text-sm">Panel de Administración</p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="text-zinc-400">{user.email}</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-800/50 p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-green-400">{turnos.length}</p>
            <p className="text-zinc-400">Total turnos</p>
          </div>
          <div className="bg-zinc-800/50 p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-blue-400">
              {turnos.filter(t => t.fecha >= new Date().toISOString().split("T")[0]).length}
            </p>
            <p className="text-zinc-400">Turnos pendientes</p>
          </div>
          <div className="bg-zinc-800/50 p-4 rounded-xl text-center">
            <button
              onClick={getTurnos}
              className="bg-white text-black px-4 py-2 rounded-lg hover:scale-105 transition"
            >
              Actualizar
            </button>
          </div>
        </div>

        {/* Lista de turnos */}
        <h2 className="text-2xl font-bold mb-4">Lista de turnos</h2>

        {cargando && <p className="text-center py-10">Cargando turnos...</p>}

        <div className="grid gap-4">
          {turnos.map((t) => (
            <div
              key={t.id}
              className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl hover:border-zinc-600 transition"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{t.nombre}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-zinc-300">
                    <p>Email: {t.email}</p>
                    <p>Fecha: {t.fecha}</p>
                    <p>Hora: {t.hora}</p>
                    <p>Edad: {t.edad} años</p>
                    <p className={t.consentimiento ? "text-green-400" : "text-red-400"}>
                      {t.consentimiento ? "Consentimiento aprobado" : "Sin consentimiento"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteTurno(t.id)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {!cargando && turnos.length === 0 && (
          <p className="text-center text-zinc-500 py-10">No hay turnos cargados</p>
        )}
      </div>
    </div>
  )
}