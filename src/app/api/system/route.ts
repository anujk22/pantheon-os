import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const ramPercent = Math.round((usedMem / totalMem) * 100);

  // Calculate CPU load average roughly using 1m load / number of CPUs
  const cpus = os.cpus();
  const loadAvg = os.loadavg()[0]; // 1 minute load average
  const cpuPercent = Math.min(100, Math.round((loadAvg / cpus.length) * 100));

  return NextResponse.json({
    cpu: cpuPercent,
    ram: ramPercent,
    uptimeSeconds: Math.round(os.uptime()),
  });
}
