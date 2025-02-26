import express from 'express';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';

interface Memory {
    [key: string]: any;
}

interface WebhookRequest {
    memory: Memory;
    uid: string;
}

interface TranscriptRequest {
    session_id: string;
    segments: {
        text: string;
        speaker?: string;
        speaker_id?: number;
        is_user?: boolean;
        person_id?: string | null;
        start?: number;
        end?: number;
    }[];
}

// Create Express app function
const createServer = () => {
    const app = express();
    const port: number = parseInt(process.env.PORT || '8000', 10);

    // Enable CORS
    app.use(cors({
        origin: '*',
        credentials: true,
        methods: ['*'],
        allowedHeaders: ['*']
    }));

    // Parse JSON bodies
    app.use(express.json());

    app.post('/webhook', (req: ExpressRequest<{}, {}, WebhookRequest>, res: ExpressResponse) => {
        const { memory, uid } = req.body;
        console.log('INFO:', new Date().toISOString(), '- POST /webhook', '200 OK');
        console.log(JSON.stringify(req.body));
        res.json({ message: 'we got it' });
    });

    app.post('/livetranscript', (req: ExpressRequest<{}, {}, TranscriptRequest>, res: ExpressResponse) => {
        const { session_id, segments } = req.body;
        console.log('Received body:', JSON.stringify(req.body));

        console.log('INFO:', new Date().toISOString(), '- POST /livetranscript?uid=' + session_id, 'HTTP/1.1', '200 OK');
        console.log(JSON.stringify({
            'session_id': session_id,
            'segments': segments.map((segment: TranscriptRequest['segments'][0]) => ({
                ...segment,
                'speaker': segment.speaker || 'SPEAKER_0',
                'speaker_id': segment.speaker_id || 0,
                'is_user': segment.is_user || true,
                'person_id': segment.person_id || 'None'
            })),
            'speaker': 'SPEAKER_0',
            'speaker_id': 0,
            'is_user': true,
            'person_id': 'None',
            'start': Date.now(),
            'end': Date.now() + 1000
        }));
        res.json({ message: 'we got it' });
    });

    return { app, port };
};

// For Next.js API Routes
export async function POST(req: Request) {
    return new Response('API route accessed', { status: 200 });
}

export { createServer }; 