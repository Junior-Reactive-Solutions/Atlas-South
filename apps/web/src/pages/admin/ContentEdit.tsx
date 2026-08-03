import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Reorder } from 'motion/react';
import { ArrowLeft, GripVertical, Plus, Trash2, Upload, RotateCcw, Eye } from 'lucide-react';

type JsonRecord = Record<string, unknown>;

interface ContentPageDoc {
  id: string;
  slug: string;
  type: 'service' | 'industry' | 'area' | 'home';
  path: string;
  status: 'draft' | 'published';
  draftData: JsonRecord;
  publishedData: JsonRecord | null;
}

interface Row {
  _key: string;
  [key: string]: unknown;
}

function withKeys(items: Array<Record<string, unknown>> = []): Row[] {
  return items.map((item, idx) => ({ _key: `${idx}-${Math.random().toString(36).slice(2, 8)}`, ...item }));
}

function stripKeys(rows: Row[]): Array<Record<string, unknown>> {
  return rows.map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => key !== '_key')));
}

/** draftData is a JSON blob whose shape varies by content type — these coerce a field
 * read at a known-safe call site back to the primitive the form actually needs. */
function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function strArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(str) : [];
}

function recordArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value : [];
}

export function AdminContentEdit() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<ContentPageDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: 'success' | 'error' } | null>(null);

  // Type-specific field state, kept separate from `page` so text inputs stay responsive
  const [fields, setFields] = useState<JsonRecord>({});
  const [features, setFeatures] = useState<Row[]>([]);
  const [faqs, setFaqs] = useState<Row[]>([]);
  const [serviceHighlights, setServiceHighlights] = useState<Row[]>([]);

  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/admin/content/${slug}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) navigate('/admin/login');
          return;
        }

        const data: ContentPageDoc = await response.json();
        setPage(data);
        setFields(data.draftData);
        setFeatures(withKeys(recordArray(data.draftData.features)));
        setFaqs(withKeys(recordArray(data.draftData.faqs)));
        setServiceHighlights(withKeys(recordArray(data.draftData.serviceHighlights)));
      } catch (error) {
        console.error('Error fetching content page:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const buildDraftData = () => {
    const data = { ...fields };
    if (page?.type === 'service') {
      data.features = stripKeys(features);
      data.faqs = stripKeys(faqs);
    }
    if (page?.type === 'industry') {
      data.serviceHighlights = stripKeys(serviceHighlights);
      data.faqs = undefined;
    }
    return data;
  };

  const saveDraft = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/content/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ draftData: buildDraftData() }),
      });

      if (!response.ok) throw new Error('Save failed');
      const updated = await response.json();
      setPage(updated);
      setMessage({ text: 'Draft saved', tone: 'success' });
    } catch {
      setMessage({ text: 'Failed to save draft', tone: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const publish = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      // Save first, so publish always reflects the latest edits
      await fetch(`/api/admin/content/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ draftData: buildDraftData() }),
      });

      const response = await fetch(`/api/admin/content/${slug}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Publish failed');
      const updated = await response.json();
      setPage(updated);
      setMessage({ text: 'Published — this is now live on the site', tone: 'success' });
    } catch {
      setMessage({ text: 'Failed to publish', tone: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const discard = async () => {
    if (!confirm('Discard all unpublished changes and revert to the live version?')) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/content/${slug}/discard`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Discard failed');
      const updated = await response.json();
      setPage(updated);
      setFields(updated.draftData);
      setFeatures(withKeys(recordArray(updated.draftData.features)));
      setFaqs(withKeys(recordArray(updated.draftData.faqs)));
      setServiceHighlights(withKeys(recordArray(updated.draftData.serviceHighlights)));
      setMessage({ text: 'Reverted to the last published version', tone: 'success' });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Failed to discard', tone: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !page) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <Link to="/admin/content" className="flex items-center gap-1 text-sm text-slate-600 hover:text-navy">
          <ArrowLeft className="h-4 w-4" />
          Back to Content
        </Link>
        <a
          href={page.path}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-sm text-accent-blue hover:underline"
        >
          <Eye className="h-4 w-4" />
          View live page
        </a>
      </div>

      <div>
        <h1 className="text-3xl font-black text-navy">{page.slug}</h1>
        <p className="text-sm text-slate-600">{page.path}</p>
      </div>

      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.tone === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Common fields */}
      {page.type !== 'home' && (
        <>
          <Field label="Title" value={str(fields.title)} onChange={(v) => setFields((f) => ({ ...f, title: v }))} />
          <Field
            label="Hero description"
            value={str(fields.heroDescription)}
            onChange={(v) => setFields((f) => ({ ...f, heroDescription: v }))}
            multiline
          />
          <MarkdownField
            label="Overview"
            value={str(fields.overview)}
            onChange={(v) => setFields((f) => ({ ...f, overview: v }))}
          />
        </>
      )}

      {page.type === 'industry' && (
        <>
          <MarkdownField
            label="Challenges"
            value={str(fields.challenges)}
            onChange={(v) => setFields((f) => ({ ...f, challenges: v }))}
          />
          <MarkdownField
            label="Our approach"
            value={str(fields.ourApproach)}
            onChange={(v) => setFields((f) => ({ ...f, ourApproach: v }))}
          />
          <ReorderableList
            label="Service highlights"
            rows={serviceHighlights}
            setRows={setServiceHighlights}
            fieldConfig={[
              { key: 'serviceLabel', label: 'Service' },
              { key: 'description', label: 'Description', multiline: true },
            ]}
            newRow={{ serviceLabel: '', description: '' }}
          />
        </>
      )}

      {page.type === 'area' && (
        <>
          <Field
            label="Response time"
            value={str(fields.responseTime)}
            onChange={(v) => setFields((f) => ({ ...f, responseTime: v }))}
          />
          <MarkdownField label="Coverage" value={str(fields.coverage)} onChange={(v) => setFields((f) => ({ ...f, coverage: v }))} />
          <MarkdownField
            label="Local proof (optional)"
            value={str(fields.localProof)}
            onChange={(v) => setFields((f) => ({ ...f, localProof: v }))}
          />
        </>
      )}

      {page.type === 'service' && (
        <>
          <ReorderableList
            label="Features"
            rows={features}
            setRows={setFeatures}
            fieldConfig={[
              { key: 'icon', label: 'Icon name (lucide)' },
              { key: 'title', label: 'Title' },
              { key: 'description', label: 'Description', multiline: true },
            ]}
            newRow={{ icon: 'wrench', title: '', description: '' }}
          />
          <ReorderableList
            label="FAQs"
            rows={faqs}
            setRows={setFaqs}
            fieldConfig={[
              { key: 'question', label: 'Question' },
              { key: 'answer', label: 'Answer', multiline: true },
            ]}
            newRow={{ question: '', answer: '' }}
          />
        </>
      )}

      {page.type === 'home' && (
        <>
          <p className="text-sm font-medium text-slate-700">Headline lines</p>
          {[0, 1, 2].map((i) => (
            <Field
              key={i}
              label={`Line ${i + 1}`}
              value={strArray(fields.headlineLines)[i] ?? ''}
              onChange={(v) => {
                const lines = [...strArray(fields.headlineLines).concat(['', '', '']).slice(0, 3)];
                lines[i] = v;
                setFields((f) => ({ ...f, headlineLines: lines }));
              }}
            />
          ))}
          <Field label="Subcopy" value={str(fields.subcopy)} onChange={(v) => setFields((f) => ({ ...f, subcopy: v }))} multiline />
          <Field
            label="Primary CTA label"
            value={str(fields.primaryCtaLabel)}
            onChange={(v) => setFields((f) => ({ ...f, primaryCtaLabel: v }))}
          />
          <Field
            label="Home CTA label"
            value={str(fields.homeCtaLabel)}
            onChange={(v) => setFields((f) => ({ ...f, homeCtaLabel: v }))}
          />
          <Field
            label="Business CTA label"
            value={str(fields.businessCtaLabel)}
            onChange={(v) => setFields((f) => ({ ...f, businessCtaLabel: v }))}
          />
        </>
      )}

      {/* Action bar */}
      <div className="sticky bottom-0 flex items-center gap-3 border-t border-slate-200 bg-white/95 py-4 backdrop-blur-sm">
        <button
          onClick={saveDraft}
          disabled={isSaving}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Save draft
        </button>
        <button
          onClick={publish}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-accent-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          Publish
        </button>
        {page.publishedData && (
          <button
            onClick={discard}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            Discard draft changes
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {multiline ? (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
        />
      ) : (
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
        />
      )}
    </div>
  );
}

function MarkdownField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">{label} (Markdown)</label>
        <button
          type="button"
          onClick={() => setShowPreview((s) => !s)}
          className="text-xs font-medium text-accent-blue hover:underline"
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>
      {showPreview ? (
        <div className="prose prose-sm max-w-none rounded-lg border border-slate-200 bg-slate-50 p-3">
          {(value ?? '').split('\n\n').map((para, i) =>
            para.startsWith('- ') ? (
              <ul key={i}>
                {para.split('\n').map((li, j) => (
                  <li key={j}>{li.replace(/^- /, '')}</li>
                ))}
              </ul>
            ) : (
              <p key={i}>{para}</p>
            ),
          )}
        </div>
      ) : (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
        />
      )}
    </div>
  );
}

interface FieldConfig {
  key: string;
  label: string;
  multiline?: boolean;
}

function ReorderableList({
  label,
  rows,
  setRows,
  fieldConfig,
  newRow,
}: {
  label: string;
  rows: Row[];
  setRows: (rows: Row[]) => void;
  fieldConfig: FieldConfig[];
  newRow: Record<string, unknown>;
}) {
  const updateRow = (key: string, field: string, value: string) => {
    setRows(rows.map((r) => (r._key === key ? { ...r, [field]: value } : r)));
  };

  const removeRow = (key: string) => {
    setRows(rows.filter((r) => r._key !== key));
  };

  const addRow = () => {
    setRows([...rows, { _key: `new-${Math.random().toString(36).slice(2, 8)}`, ...newRow }]);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 text-xs font-medium text-accent-blue hover:underline"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      <Reorder.Group axis="y" values={rows} onReorder={setRows} className="space-y-2">
        {rows.map((row) => (
          <Reorder.Item
            key={row._key}
            value={row}
            className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3"
          >
            <GripVertical className="mt-2 h-4 w-4 flex-shrink-0 cursor-grab text-slate-400 active:cursor-grabbing" />
            <div className="flex-1 space-y-2">
              {fieldConfig.map((fc) =>
                fc.multiline ? (
                  <textarea
                    key={fc.key}
                    value={str(row[fc.key])}
                    onChange={(e) => updateRow(row._key, fc.key, e.target.value)}
                    placeholder={fc.label}
                    rows={2}
                    className="w-full rounded border border-slate-200 px-2 py-1 text-sm focus:border-accent-blue focus:outline-none"
                  />
                ) : (
                  <input
                    key={fc.key}
                    type="text"
                    value={str(row[fc.key])}
                    onChange={(e) => updateRow(row._key, fc.key, e.target.value)}
                    placeholder={fc.label}
                    className="w-full rounded border border-slate-200 px-2 py-1 text-sm focus:border-accent-blue focus:outline-none"
                  />
                ),
              )}
            </div>
            <button
              type="button"
              onClick={() => removeRow(row._key)}
              className="text-slate-400 hover:text-red-600"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
