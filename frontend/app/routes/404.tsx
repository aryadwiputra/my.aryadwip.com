import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-950">
      <p className="text-6xl font-bold text-gray-300 dark:text-gray-700">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}