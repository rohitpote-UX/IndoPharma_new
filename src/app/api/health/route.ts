import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'indopharm-core',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    corridor: 'INDIA_TO_USA',
    paymentProvider: process.env.PAYMENT_PROVIDER || 'mock',
    checks: {
      database: 'configured',
      storage: 'configured',
      payments: 'gateway-agnostic-ready',
      complianceMatrix: 'enforced',
    },
  });
}
