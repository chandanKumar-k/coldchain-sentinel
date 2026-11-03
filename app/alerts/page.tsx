"use client";
import { useEffect, useState } from "react";
export default function Alerts() {
  const [rows, setRows] = useState<any[]>([]); const [msg, setMsg] = useState("");
  const load = () => fetch("/api/alerts").then(r => r.json()).then(setRows);
  useEffect(() => { load(); }, []);
  const setStatus = async (alert_id: number, status: string) => {
    const r = await fetch("/api/alerts", { method: "PUT", body: JSON.stringify({ alert_id, status }) }); setMsg(r.ok ? "" : (await r.json()).error); load(); };
  const inspect = async (alert_id: number, decision: string) => {
    const r = await fetch("/api/inspections", { method: "POST", body: JSON.stringify({ alert_id, decision, inspection_date: new Date().toISOString().slice(0, 10) }) });
    setMsg(r.ok ? "Inspection recorded" : (await r.json()).error); };
  return (<div><h1 className="text-xl font-bold mb-3">Alerts</h1><p className="text-red-600">{msg}</p>
    <table className="w-full bg-white shadow rounded text-left"><thead><tr><th className="p-2">Batch</th><th>Severity</th><th>Status</th><th>Inspect</th></tr></thead>
      <tbody>{rows.map(a => <tr key={a.alert_id} className="border-t"><td className="p-2">{a.batch_number}</td><td>{a.severity}</td>
        <td><select value={a.status} onChange={e => setStatus(a.alert_id, e.target.value)}>{["OPEN", "ACKNOWLEDGED", "RESOLVED"].map(s => <option key={s}>{s}</option>)}</select></td>
        <td><select defaultValue="" onChange={e => e.target.value && inspect(a.alert_id, e.target.value)}><option value="">Decision…</option>
          {["CLEARED", "CONTINUE_QUARANTINE", "DISPOSE"].map(s => <option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table></div>);
}
