import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';

export default function TestWebhook() {
    const [status, setStatus] = useState<string>('Ready');
    const [details, setDetails] = useState<string>('');

    const testWebhook = async () => {
        setStatus('Testing...');
        setDetails('');

        try {
            const payload = {
                id_busqueda: 'TEST-' + Math.random().toString(36).substring(7),
                titulo: 'Test Developer',
                empresa: 'Test Corp',
                rubro: 'IT',
                descripcion: 'Test Description'
            };

            const response = await fetch('/api/n8n?action=trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(_ => ({ error: 'Invalid JSON' }));

            setDetails(JSON.stringify({
                status: response.status,
                statusText: response.statusText,
                data: data
            }, null, 2));

            if (response.ok) {
                setStatus('Success ✅');
            } else {
                setStatus('Failed ❌');
            }

        } catch (error: any) {
            setStatus('Error ❌');
            setDetails(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <GlassCard className="max-w-md w-full space-y-4">
                <h1 className="text-xl font-bold text-white">N8N Webhook Diagnostic</h1>

                <div className="p-2 bg-black/30 rounded font-mono text-xs text-emerald-400">
                    URL: /api/n8n?action=trigger
                </div>

                <Button onClick={testWebhook} className="w-full">
                    Test Webhook
                </Button>

                <div className="mt-4 p-4 bg-black/50 rounded-lg border border-white/10 font-mono text-xs text-white/70 overflow-auto max-h-60">
                    <div className="mb-2 font-bold text-white">{status}</div>
                    <pre>{details}</pre>
                </div>
            </GlassCard>
        </div>
    );
}
