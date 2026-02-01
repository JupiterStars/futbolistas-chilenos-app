export default function handler(req, res) {
    res.status(200).json({ name: 'Backend is Working', timestamp: new Date().toISOString() });
}
