import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../services/auth.service";

const heroImage =
  "https://res.cloudinary.com/dvqpmttci/image/upload/v1777583920/Gemini_Generated_Image_4dhblg4dhblg4dhb_i3wqjc.png";

const logo =
  "https://res.cloudinary.com/dvqpmttci/image/upload/v1777584212/logocolchagua2_bbk1sv.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginRequest({ email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-2">
      <section
        className="relative hidden min-h-screen overflow-hidden lg:block"
        style={{
          backgroundImage: `url('${heroImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />

        <img
          src={logo}
          alt="Grupo Colchagua"
          className="absolute left-8 top-8 z-10 w-56 xl:w-64"
        />
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8"
        >
          <div className="mb-8 flex justify-center lg:hidden">
            <img src={logo} alt="Grupo Colchagua" className="w-52" />
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-[#4E1743] sm:text-3xl">
            Iniciar sesión
          </h1>

          <p className="mb-8 text-center text-sm text-slate-500 sm:text-base">
            Accede al sistema de gestión de trabajadores
          </p>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Correo electrónico
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@admin.com"
              required
            />
          </div>

          <div className="mb-7">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#4E1743] px-4 py-3 font-bold text-white transition hover:bg-[#3d1235] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </section>
    </main>
  );
}