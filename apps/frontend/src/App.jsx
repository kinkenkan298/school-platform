import AppShell from "./components/layout/AppShell.jsx";
import { useHashRouter } from "./router/useHashRouter.js";

import DashboardPage from "./pages/DashboardPage.jsx";
import AkunPage from "./pages/akun/AkunPage.jsx";
import PeriodePage from "./pages/periode/PeriodePage.jsx";
import JurnalPage from "./pages/jurnal/JurnalPage.jsx";
import LaporanPage from "./pages/laporan/LaporanPage.jsx";
import EnvironmentsPage from "./pages/environments/EnvironmentsPage.jsx";

function NotFound() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-sm text-slate-300">Halaman tidak ditemukan.</p>
      <p className="mt-1 text-xs text-slate-500">
        Coba pilih menu di sidebar.
      </p>
    </div>
  );
}

export default function App() {
  const { path } = useHashRouter();

  let title = "Dashboard";
  let page = <DashboardPage />;

  if (path === "/" || path === "") {
    title = "Dashboard";
    page = <DashboardPage />;
  } else if (path === "/akun") {
    title = "akun";
    page = <AkunPage />;
  } else if (path === "/periode") {
    title = "periode";
    page = <PeriodePage />;
  } else if (path === "/jurnal") {
    title = "jurnal";
    page = <JurnalPage />;
  } else if (path === "/laporan") {
    title = "laporan";
    page = <LaporanPage />;
  } else if (path === "/environments") {
    title = "environments";
    page = <EnvironmentsPage />;
  } else {
    title = "Not Found";
    page = <NotFound />;
  }

  return <AppShell title={title}>{page}</AppShell>;
}