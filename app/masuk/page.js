"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Smile, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function MasukContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loginWithEmail, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectUrl = searchParams?.get("redirect");

  const handleRedirect = (role) => {
    if (redirectUrl) {
      router.push(redirectUrl);
      return;
    }
    if (role === "pasien") router.push("/beranda");
    else if (role === "resepsionis") router.push("/resepsionis");
    else if (role === "dokter") router.push("/dokter");
    else if (role === "super_admin") router.push("/admin");
    else router.push("/beranda");
  };

  useEffect(() => {
    if (user && profile?.role) {
      handleRedirect(profile.role);
    }
  }, [user, profile]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }
    if (!password) {
      setError("Kata sandi wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const userProfile = await loginWithEmail(email.trim(), password);
      if (userProfile?.role) {
        handleRedirect(userProfile.role);
      }
    } catch (firebaseErr) {
      if (
        firebaseErr.code === "auth/invalid-credential" ||
        firebaseErr.code === "auth/user-not-found" ||
        firebaseErr.code === "auth/wrong-password" ||
        firebaseErr.code === "auth/invalid-email"
      ) {
        setError("Email atau kata sandi salah. Silakan periksa kembali.");
      } else if (firebaseErr.code === "auth/too-many-requests") {
        setError("Terlalu banyak percobaan gagal. Silakan coba beberapa saat lagi.");
      } else {
        setError(`Gagal masuk: ${firebaseErr.message}`);
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const userProfile = await loginWithGoogle();
      if (userProfile?.role) {
        handleRedirect(userProfile.role);
      }
    } catch (err) {
      if (
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        setError("Masuk dengan Google dibatalkan.");
      } else {
        setError(`Gagal masuk dengan Google: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#F4F7F9]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0E7490] text-white shadow-lg shadow-cyan-900/20 mb-3">
          <Smile size={32} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Masuk ke Portal
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Portal Janji Senyum Rekah · Klinik Gigi Makassar
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-gray-200/70 sm:px-10">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Email *
              </label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Kata Sandi *
              </label>
              <input
                type="password"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:border-transparent text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[#0E7490] hover:bg-[#0c6179] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0E7490] transition"
            >
              {loading ? "Memproses..." : "Masuk"}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">Atau</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Masuk dengan Google</span>
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{" "}
            <Link
              href="/daftar"
              className="font-semibold text-[#0E7490] hover:underline"
            >
              Daftar sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MasukPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9]">
          <div className="w-8 h-8 border-3 border-[#0E7490] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <MasukContent />
    </Suspense>
  );
}
