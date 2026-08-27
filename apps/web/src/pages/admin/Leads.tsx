import { useEffect, useState } from 'react';
import { Trash2, Bot, Download, Mail, Phone, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { DetailDrawer, DetailField } from '../../components/admin/DetailDrawer.js';

interface ChatLead {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  preferredContact: 'email' | 'phone' | null;
  services: string;
  message?: string;
  createdAt: string;
}

export function AdminLeads() {
  const [leads, setLeads] = useState<ChatLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<ChatLead | null>(null);
  const { authFetch } = useAuth();

  useEffect(() => {
    authFetch('/api/admin/leads')
      .then((r) => r.json())
      .then((data) => setLeads(data.leads ?? []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [authFetch]);

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this lead?')) return;
    setDeletingId(id);
    try {
      await authFetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  function exportCSV() {
    const header = ['First name', 'Last name', 'Company', 'Phone', 'Preferred contact', 'Email', 'Services', 'Message', 'Date'];
    const rows = leads.map((l) => [
      l.firstName,
      l.lastName,
      l.company ?? '',
      l.phone ?? '',
      l.preferredContact ?? '',
      l.email ?? '',
      l.services,
      l.message ?? '',
      new Date(l.createdAt).toLocaleString('en-GB'),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatbot-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8 text-slate-500">Loading leads…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-navy">Chatbot Leads</h1>
          <p className="mt-1 text-sm text-slate-500">
            {leads.length} lead{leads.length !== 1 ? 's' : ''} captured via the website chat widget
          </p>
        </div>
        {leads.length > 0 && (
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        )}
      </div>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Bot className="h-10 w-10 text-slate-300" />
          <p className="font-semibold text-slate-500">No leads yet</p>
          <p className="text-sm text-slate-400">
            Leads captured by the chatbot will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Services</th>
                  <th className="px-5 py-3">Message</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-medium text-navy">
                      {lead.firstName} {lead.lastName}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {lead.company || <span className="text-slate-300 italic">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className={`flex items-center gap-1.5 hover:underline ${
                              lead.preferredContact === 'phone' ? 'font-semibold text-navy' : 'text-slate-500'
                            }`}
                            title={lead.preferredContact === 'phone' ? 'Preferred contact method' : undefined}
                          >
                            <Phone className="h-3 w-3 shrink-0" />
                            {lead.phone}
                          </a>
                        )}
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className={`flex items-center gap-1.5 hover:underline ${
                              lead.preferredContact === 'email' ? 'font-semibold text-accent-blue' : 'text-slate-500'
                            }`}
                            title={lead.preferredContact === 'email' ? 'Preferred contact method' : undefined}
                          >
                            <Mail className="h-3 w-3 shrink-0" />
                            {lead.email}
                          </a>
                        )}
                        {!lead.phone && !lead.email && <span className="text-slate-300 italic">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {lead.services.split(',').map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-accent-blue/10 px-2 py-0.5 text-xs font-medium text-accent-blue"
                          >
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 max-w-xs truncate">
                      {lead.message || <span className="text-slate-300 italic">—</span>}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                      {new Date(lead.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          aria-label={`View lead from ${lead.firstName} ${lead.lastName}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-accent-blue"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(lead.id);
                          }}
                          disabled={deletingId === lead.id}
                          aria-label={`Delete lead from ${lead.firstName} ${lead.lastName}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DetailDrawer
        open={selectedLead !== null}
        onClose={() => setSelectedLead(null)}
        title={selectedLead ? `${selectedLead.firstName} ${selectedLead.lastName}` : ''}
        subtitle={
          selectedLead
            ? new Date(selectedLead.createdAt).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : undefined
        }
      >
        {selectedLead && (
          <dl>
            <DetailField label="Company">
              {selectedLead.company || <span className="italic text-slate-400">Not provided</span>}
            </DetailField>
            <DetailField label="Preferred contact method">
              {selectedLead.preferredContact === 'email'
                ? 'Email'
                : selectedLead.preferredContact === 'phone'
                ? 'Phone'
                : <span className="italic text-slate-400">Not provided</span>}
            </DetailField>
            <DetailField label="Phone">
              {selectedLead.phone ? (
                <a href={`tel:${selectedLead.phone}`} className="text-accent-blue hover:underline">
                  {selectedLead.phone}
                </a>
              ) : (
                <span className="italic text-slate-400">Not provided</span>
              )}
            </DetailField>
            <DetailField label="Email">
              {selectedLead.email ? (
                <a href={`mailto:${selectedLead.email}`} className="text-accent-blue hover:underline">
                  {selectedLead.email}
                </a>
              ) : (
                <span className="italic text-slate-400">Not provided</span>
              )}
            </DetailField>
            <DetailField label="Services of interest">
              <div className="flex flex-wrap gap-1.5">
                {selectedLead.services.split(',').map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-accent-blue/10 px-2 py-0.5 text-xs font-medium text-accent-blue"
                  >
                    {s.trim()}
                  </span>
                ))}
              </div>
            </DetailField>
            <DetailField label="Message">
              {selectedLead.message ? (
                <p className="whitespace-pre-wrap leading-relaxed">{selectedLead.message}</p>
              ) : (
                <span className="italic text-slate-400">No additional message</span>
              )}
            </DetailField>
          </dl>
        )}
      </DetailDrawer>
    </div>
  );
}
