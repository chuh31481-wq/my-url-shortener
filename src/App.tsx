import React, { useState, useEffect, useRef } from 'react';

// --- Basic CSS ko TypeScript ke andar hi daal diya hai aasaani ke liye ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '20px',
    boxSizing: 'border-box',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center',
  },
  h1: {
    color: '#007bff',
    marginBottom: '30px',
    fontSize: '2.2em',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '25px',
  },
  input: {
    padding: '12px 15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '1em',
    width: '100%',
    boxSizing: 'border-box',
  },
  button: {
    padding: '12px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1em',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  errorMessage: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '0.9em',
  },
  resultContainer: {
    textAlign: 'left',
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#e9ecef',
    borderRadius: '10px',
  },
  resultLabel: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#555',
    fontSize: '1.1em',
  },
  resultWrapper: {
    display: 'flex',
    gap: '10px',
  },
  resultInput: {
    flexGrow: 1,
    backgroundColor: '#fff',
    border: '1px solid #ced4da',
    cursor: 'text',
  },
  copyButton: {
    flexShrink: 0,
    padding: '10px 15px',
    fontSize: '1em',
    backgroundColor: '#28a745',
  },
  copySuccess: {
    marginTop: '10px',
    display: 'block',
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: '0.9em',
  },
};
// --- CSS End ---

interface ShortenResponse {
  shortUrl: string;
  longUrl: string;
}

interface ErrorResponse {
  message: string;
  details?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function App() {
  const [longUrl, setLongUrl] = useState<string>('');
  const [shortUrl, setShortUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<string>('');

  const shortUrlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortUrl('');
    setCopySuccess('');

    if (!longUrl.trim()) {
      setError('Please enter a URL.');
      setLoading(false);
      return;
    }

    if (!isValidUrl(longUrl)) {
      setError('Please enter a valid URL (e.g., https://example.com).');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longUrl }),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        setError(errorData.message || 'An unexpected error occurred.');
        return;
      }

      const data: ShortenResponse = await response.json();
      setShortUrl(data.shortUrl);
    } catch (err) {
      console.error('Error shortening URL:', err);
      setError('Failed to connect to the service. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyClick = () => {
    if (shortUrlInputRef.current) {
      shortUrlInputRef.current.select();
      navigator.clipboard.writeText(shortUrlInputRef.current.value)
        .then(() => {
          setCopySuccess('Copied!');
        })
        .catch(err => console.error('Failed to copy!', err));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.h1}>URL Shortener</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="url"
            placeholder="Paste your long URL here"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            required
            style={styles.input}
            data-testid="long-url-input"
          />
          <button type="submit" disabled={loading} style={styles.button} data-testid="shorten-button">
            {loading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>

        {error && (
          <p style={styles.errorMessage} data-testid="error-message">
            {error}
          </p>
        )}

        {shortUrl && (
          <div style={styles.resultContainer} data-testid="short-url-container">
            <label htmlFor="short-url-display" style={styles.resultLabel}>Your short URL:</label>
            <div style={styles.resultWrapper}>
              <input
                type="text"
                id="short-url-display"
                value={shortUrl}
                readOnly
                ref={shortUrlInputRef}
                style={{...styles.input, ...styles.resultInput}}
                data-testid="short-url-display"
              />
              <button onClick={handleCopyClick} style={{...styles.button, ...styles.copyButton}} data-testid="copy-button">
                Copy
              </button>
            </div>
            {copySuccess && (
              <span style={styles.copySuccess} data-testid="copy-success-message">
                {copySuccess}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
