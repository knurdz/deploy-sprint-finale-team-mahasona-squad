import { useEffect, useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface EmailStatus {
  provider: string;
  configured: boolean;
  secretRedacted: boolean;
  recipient: string;
  sender: string;
}

export function EmailAlertWidget() {
  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/email/status')
      .then((res) => res.json())
      .then((json: EmailStatus) => {
        setStatus(json);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const triggerAlert = async () => {
    setSending(true);
    setResult(null);
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: 'Deploy Alert - Team Mahasona Squad LMS',
          html: `<p>Deployment alert transactional notification triggered successfully at ${new Date().toLocaleString()}.</p>`
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: err.message });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <aside className="panel weatherPanel">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Transactional Email</p>
            <h2>Loading...</h2>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="panel weatherPanel" id="email-alert-panel">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Transactional Email Alert</p>
          <h2>Resend Provider</h2>
        </div>
        <div className="weatherMainIcon" style={{ color: '#030712' }}>
          <Mail size={32} />
        </div>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '13px', opacity: 0.85, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div><strong>Provider:</strong> {status?.provider || 'resend'}</div>
          <div><strong>Configured:</strong> {status?.configured ? 'True' : 'False'}</div>
          <div><strong>Secret Redacted:</strong> {status?.secretRedacted ? 'True' : 'False'}</div>
          <div><strong>Approved Recipient:</strong> <code>{status?.recipient || 'judges@knurdz.org'}</code></div>
        </div>

        <button
          onClick={triggerAlert}
          disabled={sending}
          style={{
            marginTop: '8px',
            padding: '10px 14px',
            backgroundColor: '#030712',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%'
          }}
        >
          <Send size={16} />
          {sending ? 'Sending alert...' : 'Send Deploy Alert'}
        </button>

        {result && (
          <div style={{
            marginTop: '8px',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '13px',
            backgroundColor: result.result?.dryRun ? '#fef3c7' : '#ecfdf5',
            color: result.result?.dryRun ? '#92400e' : '#065f46',
            border: `1px solid ${result.result?.dryRun ? '#fcd34d' : '#a7f3d0'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
              {result.result?.dryRun ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
              <span>{result.result?.dryRun ? 'Dry-Run Simulation Active' : 'Email Sent Successfully!'}</span>
            </div>
            {result.result?.message && <span style={{ opacity: 0.9 }}>{result.result.message}</span>}
            {result.result?.error && (
              <span style={{ fontSize: '11px', color: '#b91c1c', marginTop: '4px' }}>
                Note: {result.result.error}
              </span>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
