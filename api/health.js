// Vercel Serverless Function - Health Check
export default function handler(req, res) {
  res.status(200).json({
    status: "OK",
    message: "QR Scanner API is running on Vercel",
    timestamp: new Date().toISOString(),
    environment: "serverless"
  });
}
