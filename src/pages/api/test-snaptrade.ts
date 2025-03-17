import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const useMock = req.query.mock === 'true';
  const logs: string[] = [];

  try {
    // Determine the script path relative to the project root
    const scriptPath = path.resolve(process.cwd(), 'scripts', 'test-snaptrade.ts');
    
    // Spawn a child process to run the test
    const args = ['tsx', scriptPath];
    
    if (useMock) {
      args.push('--mock-only');
    }
    
    const child = spawn('npx', args, {
      cwd: process.cwd(),
      env: { ...process.env },
    });
    
    // Collect stdout
    child.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(Boolean);
      logs.push(...lines);
    });
    
    // Collect stderr
    child.stderr.on('data', (data) => {
      const lines = data.toString().split('\n').filter(Boolean);
      logs.push(...lines.map(line => `ERROR: ${line}`));
    });
    
    // Wait for the process to complete
    await new Promise<void>((resolve, reject) => {
      child.on('close', (code) => {
        if (code === 0) {
          logs.push(`Test completed successfully with exit code ${code}`);
          resolve();
        } else {
          logs.push(`Test failed with exit code ${code}`);
          reject(new Error(`Process exited with code ${code}`));
        }
      });
      
      child.on('error', (err) => {
        logs.push(`Error running test: ${err.message}`);
        reject(err);
      });
    });
    
    // Return the logs
    res.status(200).json({ success: true, logs });
  } catch (error) {
    logs.push(`Error: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({ success: false, logs });
  }
} 