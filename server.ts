import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI:', err);
  }
}

// Fallback smart tactical responses for offline / demo mode
const offlineJarvisResponses = [
  "Mark LXXXV systems functioning within optimal parameters, Sir. Power output holding steady at 3.2 gigawatts.",
  "Right away, Sir. I've recalibrated the repulsor emitters and initialized perimeter reconnaissance sweeps.",
  "Perimeter scan indicates no immediate hostile signatures within a 50-kilometer radius, Mr. Stark.",
  "Diverting auxiliary power to forward kinetic dampeners. Nanotech mesh density is reinforced at 98.4%.",
  "House Party Protocol is primed and standing by on encrypted Stark satellite uplink Veronica.",
  "As you wish, Sir. Flight telemetry shows Mach 2.8 at 14,000 feet. Inertial dampeners compensating nicely.",
  "A witty suggestion, Sir, though might I remind you the Mark 85 micro-thrusters require 12 seconds to fully discharge.",
  "The Arc Reactor core is running cool at 420 Kelvin. Palladium-free synthesized vibranium core is 100% efficient."
];

// Jarvis AI Query Endpoint
app.post('/api/jarvis/chat', async (req, res) => {
  const { prompt, suitMode, protocolActive } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // System instruction for Jarvis persona
  const systemInstruction = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), Tony Stark's legendary British AI assistant from Iron Man and the Marvel Cinematic Universe.
Tone & Persona:
- Call the user "Sir" or "Mr. Stark".
- Possess Paul Bettany's refined, dry British wit, unflappable composure, and technical genius.
- Highly articulate, precise, protective, and respectful yet subtly sarcastic when appropriate.
- Current active suit mode: ${suitMode || 'Standard Tactical'}.
- Active Protocols: ${protocolActive || 'Defense Perimeter Active'}.
- You control armor telemetry (Mark LXXXV nanotech, Arc Reactor, repulsor cannons, Veronica satellite, Unibeam, thrusters).
- Answer questions accurately, whether scientific, tactical, philosophical, or movie-lore related.
- Keep answers concise (1 to 4 sentences usually, or a crisp tactical bullet list if requested), suitable for a pilot's holographic Heads-Up Display (HUD).`;

  if (ai && apiKey) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text || "Systems acknowledged, Sir. All telemetry holding steady.";
      return res.json({ reply });
    } catch (error: any) {
      console.warn('Gemini API query failed, switching to tactical protocol fallback:', error?.message);
      // Fallback seamlessly so experience is uninterrupted
      const randomFallback = offlineJarvisResponses[Math.floor(Math.random() * offlineJarvisResponses.length)];
      return res.json({
        reply: `Tactical telemetry synced, Sir. ${randomFallback}`
      });
    }
  } else {
    // Graceful offline/local simulated intelligence
    const lower = prompt.toLowerCase();
    let reply = "";
    if (lower.includes('status') || lower.includes('report') || lower.includes('system')) {
      reply = "All Mark LXXXV systems operational, Sir. Arc Reactor output at 100%, nanotech integrity 98.7%, repulsors armed.";
    } else if (lower.includes('house party') || lower.includes('protocol')) {
      reply = "Protocol acknowledged, Sir. Automated armors Heartbreaker, Silver Centurion, and Igor are in holding pattern.";
    } else if (lower.includes('power') || lower.includes('reactor') || lower.includes('arc')) {
      reply = "The Arc Reactor is generating 3.4 gigajoules per second, Sir. Core temperature is stable at 412 Kelvin.";
    } else if (lower.includes('scan') || lower.includes('threat') || lower.includes('radar')) {
      reply = "Perimeter scan complete. Multiple friendly comms detected, zero hostile radar locks in our immediate sector.";
    } else if (lower.includes('veronica') || lower.includes('hulkbuster')) {
      reply = "Veronica satellite deployment vector locked in low-Earth orbit. Heavy impact cage ready on your command, Sir.";
    } else if (lower.includes('hello') || lower.includes('hey') || lower.includes('jarvis')) {
      reply = "Good day, Sir. J.A.R.V.I.S. online and at your service. How may I assist your engineering today?";
    } else {
      reply = offlineJarvisResponses[Math.floor(Math.random() * offlineJarvisResponses.length)];
    }
    return res.json({ reply });
  }
});

// Real-time Tactical Telemetry Endpoint
app.get('/api/jarvis/telemetry', (_req, res) => {
  const timestamp = Date.now();
  res.json({
    suit: 'MARK LXXXV (NANOTECH)',
    powerLevel: 98.4,
    powerDrawGJ: (3.1 + Math.sin(timestamp / 5000) * 0.3).toFixed(2),
    coreTempK: Math.floor(410 + Math.sin(timestamp / 3000) * 15),
    altitudeFt: Math.floor(12400 + Math.sin(timestamp / 4000) * 800),
    speedMach: (2.4 + Math.sin(timestamp / 6000) * 0.4).toFixed(2),
    nanotechMesh: 99.1,
    repulsorCharge: 100,
    unibeamStatus: 'READY',
    inertialDampeners: 'ACTIVE',
    satelliteLink: 'VERONICA-STARK-7 ONLINE',
  });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`J.A.R.V.I.S. Core server listening on port ${PORT} [${isDev ? 'DEV' : 'PROD'}]`);
  });
}

startServer();
