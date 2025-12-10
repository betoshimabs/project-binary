import { useState } from 'react';
import { aiService } from '../services/ai.service';
import './AdminDashboard.css'; // Reusing admin styles for dark theme

export function TestAI() {
    const [textPrompt, setTextPrompt] = useState('Explain what a RPG is in 2 sentences.');
    const [imagePrompt, setImagePrompt] = useState('A futuristic glowing sword');
    const [textResult, setTextResult] = useState('');
    const [imageResult, setImageResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTextGen = async () => {
        setLoading(true);
        setError('');
        setTextResult('');
        try {
            const result = await aiService.generateText(textPrompt);
            setTextResult(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageGen = async () => {
        setLoading(true);
        setError('');
        setImageResult('');
        try {
            const base64Data = await aiService.generateImage(imagePrompt);
            // Prefix might be needed depending on API, assuming raw base64 usually needs prefix
            // Google API returns raw bytes encoded. Usually we need 'data:image/png;base64,' prefix.
            // Documentation implies raw data, let's try displaying it with prefix.
            setImageResult(`data:image/png;base64,${base64Data}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container" style={{ padding: '2rem' }}>
            <h1 className="admin-title">TESTE DE INTEGRAÇÃO GEMINI</h1>

            <div className="admin-content">
                <div style={{ marginBottom: '2rem', border: '1px solid #0f0', padding: '1rem' }}>
                    <h2>GERAÇÃO DE TEXTO</h2>
                    <textarea
                        value={textPrompt}
                        onChange={e => setTextPrompt(e.target.value)}
                        style={{ width: '100%', background: '#000', color: '#0f0', border: '1px solid #333', padding: '0.5rem', marginBottom: '1rem' }}
                    />
                    <button onClick={handleTextGen} disabled={loading} className="admin-menu-btn">
                        {loading ? 'GERANDO...' : 'GERAR TEXTO'}
                    </button>
                    {textResult && (
                        <div style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', borderTop: '1px solid #333', paddingTop: '1rem' }}>
                            <strong>RESULTADO:</strong><br />
                            {textResult}
                        </div>
                    )}
                </div>

                <div style={{ border: '1px solid #0f0', padding: '1rem' }}>
                    <h2>GERAÇÃO DE IMAGEM</h2>
                    <p style={{ fontSize: '0.8rem', color: '#666' }}>Auto-append: "pixel art 128x128, 1K"</p>
                    <input
                        type="text"
                        value={imagePrompt}
                        onChange={e => setImagePrompt(e.target.value)}
                        style={{ width: '100%', background: '#000', color: '#0f0', border: '1px solid #333', padding: '0.5rem', marginBottom: '1rem' }}
                    />
                    <button onClick={handleImageGen} disabled={loading} className="admin-menu-btn">
                        {loading ? 'GERANDO...' : 'GERAR IMAGEM'}
                    </button>
                    {imageResult && (
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <img src={imageResult} alt="Generated" style={{ border: '2px solid #0f0', maxWidth: '100%' }} />
                        </div>
                    )}
                </div>

                {error && (
                    <div style={{ marginTop: '2rem', padding: '1rem', background: '#330000', border: '1px solid red', color: 'red' }}>
                        <strong>ERRO:</strong> {error}
                    </div>
                )}
            </div>
        </div>
    );
}
