import { useMemo, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import { getApiBaseUrl, setApiBaseUrl } from "../../api/client.js";

export default function EnvironmentsPage() {
  const current = useMemo(() => getApiBaseUrl(), []);
  const [value, setValue] = useState(current);
  const [saved, setSaved] = useState("");

  function onSave() {
    setApiBaseUrl(value.trim());
    setSaved("Tersimpan. Refresh halaman jika perlu.");
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-base font-semibold">environments</h2>
        <p className="mt-1 text-sm text-slate-400">
          Halaman ini meniru konsep <b>Bruno environments</b>. Kamu bisa set API base URL tanpa ubah code.
        </p>
      </Card>

      <Card>
        <div className="grid gap-3">
          <div>
            <p className="text-sm text-slate-300">API Base URL</p>
            <p className="text-xs text-slate-500">
              Default: <span className="text-slate-300">http://localhost:3001/api/v1</span>
            </p>
          </div>

          <Input value={value} onChange={(e) => setValue(e.target.value)} />

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={onSave}>
              Simpan
            </Button>
            <Button
              onClick={() => {
                setValue("http://localhost:3001/api/v1");
                setSaved("");
              }}
            >
              Reset ke default
            </Button>
          </div>

          {saved ? <p className="text-sm text-emerald-300">{saved}</p> : null}

          <div className="mt-2 text-xs text-slate-500">
            <p className="font-medium text-slate-400">Catatan:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                Kamu juga bisa pakai <code className="text-slate-300">.env</code> di frontend:
                <code className="ml-2 rounded bg-slate-900 px-2 py-0.5 text-slate-200">
                  VITE_API_BASE_URL=http://localhost:3001/api/v1
                </code>
              </li>
              <li>
                Jika kena CORS, nanti kita bisa tambah proxy Vite (opsional).
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}