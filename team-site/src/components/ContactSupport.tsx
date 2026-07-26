import { useState } from 'react';

export function ContactSupport() {
  const [result, setResult] = useState('');
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim();
  const providerConfigured = Boolean(accessKey);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!providerConfigured) {
      setResult('Provider access key is not configured yet.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    if (accessKey) {
      formData.append('access_key', accessKey);
    }

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setResult(data.success ? 'Success!' : 'Error');
  };

  return (
    <section className="panel supportPanel" id="support" aria-labelledby="support-heading">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Support</p>
          <h2 id="support-heading">Contact the operations team</h2>
        </div>
        <span>{providerConfigured ? 'Provider ready' : 'Pending provider config'}</span>
      </div>

      <p className="supportCopy">
        Submit a short request for course support or release help. The provider key is
        kept in environment configuration and is never displayed in the UI.
      </p>

      <form className="supportForm" onSubmit={onSubmit}>
        <label>
          Name
          <input type="text" name="name" required />
        </label>

        <label>
          Email
          <input type="email" name="email" required />
        </label>

        <label>
          Message
          <textarea name="message" rows={4} required />
        </label>

        <button type="submit">Submit</button>
        {result ? <p className="supportStatus success">{result}</p> : null}
      </form>
    </section>
  );
}
